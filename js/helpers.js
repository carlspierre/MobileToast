///////////////////////////////////
// The data requesting functions .. 
///////////////////////////////////


/*
 * The main function that loads the newsfeed .. 
 */
function getNewsfeed() {
    
    // get newsfeed(s) - for the newsfeeds screen .. 
    // and here we'll check if we have to get the FB and TW or only the FB or only the TW items .. 
    if(
       // if we're on separated screen, and have "facebook" or "all" tabs selected .. 
       !( currentScreen != "home" && separated_screen_data_type == "twitter" )
       &&
       the_logged_user.facebookId != ""
       &&
       the_logged_user.facebookNames != ""
       ) {
        
        // we'll request the newsfeed items .. 
        // and the request checks internally if it has to get only the newer items .. 
        // or make pure request .. 
        
        var query = "";
        
        
        var query = "{\"queryStream\": \"SELECT post_id, actor_id, source_id, target_id, message, attachment, action_links, privacy, comments, likes, type, created_time, updated_time FROM stream WHERE filter_key IN (SELECT filter_key FROM stream_filter WHERE uid=me() AND type=\'newsfeed\')"  + ( last_items_parameters.facebook_newsfeed != undefined ? " AND created_time > " + last_items_parameters.facebook_newsfeed : "" ) + "AND is_hidden = 0 ORDER BY created_time DESC\","
        + "\"queryStreamProfile\": \"SELECT id, name, pic_square FROM profile WHERE id IN (SELECT actor_id FROM #queryStream)\","
        + "\"queryTargetProfile\": \"SELECT id, name, pic_square FROM profile WHERE id IN (SELECT target_id FROM #queryStream)\","
        /*+ "\"queryComment\":\"SELECT id, post_id, fromid, time, text, comments FROM comment WHERE post_id IN (SELECT post_id FROM #queryStream)\","
         + "\"queryCommentProfile\": \"SELECT id, name, pic_square FROM profile WHERE id IN (SELECT fromid FROM #queryComment)\","
         + "\"queryLikeIds\": \"SELECT post_id, user_id FROM like WHERE post_id IN (SELECT post_id FROM #queryStream)\","
         + "\"queryLikeProfile\": \"SELECT id, name, pic_square FROM profile WHERE id IN (SELECT user_id FROM #queryLikeIds)\","*/
        + "}";
        
        var encodeQuery = escape(query);
        
        var newsfeed_request = facebookObject.graphApiRequest("feed", encodeQuery);
        newsfeed_request.onload = populateFacebookResponse;
        
    } else {
        
        // facebook "feed" - twitter "tweets" .. 
        twitterRequest(
                       "tweets",
                       [],
                       specifyItemsListId("tweets"),
                       specifyScrollDivId("tweets"),
                       specifyTotalElementId("tweets")
                       );
        
    }
    
}


/*
 * The main function that loads the notifications .. 
 */
function getNotifications() {
    
    // get newsfeed(s) - for the notifications screen .. 
    // and here we'll check if we have to get the FB and TW or only the FB or only the TW items .. 
    if(
       // if we're on separated screen, and have "facebook" or "all" tabs selected .. 
       !( currentScreen != "home" && separated_screen_data_type == "twitter" )
       &&
       the_logged_user.facebookId != ""
       &&
       the_logged_user.facebookNames != ""
       ) {
        
        // we'll request the notifications items .. 
        // and the request checks internally if it has to get only the newer items .. 
        // or make pure request .. 
        var notifications_request = facebookObject.graphApiRequest("notifications");
        
        notifications_request.onload = populateFacebookResponse;
        
    } else {
        
        // request the twitter "mentions" .. 
        twitterRequest(
                       "mentions",
                       [],
                       specifyItemsListId("mentions"),
                       specifyScrollDivId("mentions"),
                       specifyTotalElementId("mentions")
                       );
        
    }
}

/*
 * The main function that loads the messages .. 
 */
function getMessages() {
    
    // get messages - for the messages screen .. 
    // and here we'll check if we have to get the FB and TW or only the FB or only the TW items .. 
    if(
       // if we're on separated screen, and have "facebook" or "all" tabs selected .. 
       !( currentScreen != "home" && separated_screen_data_type == "twitter" )
       &&
       the_logged_user.facebookId != ""
       &&
       the_logged_user.facebookNames != ""
       ) {
        
        if(total_messages_array.length == 0) {
            var messages_request = facebookObject.graphApiRequest("inbox");
            messages_request.onload = populateFacebookResponse;
        } else {
            // and here we populate the cached items .. 
            cycleObjectsAndPopulateItems( "inbox" );
        }
        
    } else {
        
        // facebook "inbox" - twitter "direct_messages" .. 
        twitterRequest(
                       "direct_messages",
                       [],
                       specifyItemsListId("direct_messages"),
                       specifyScrollDivId("direct_messages"),
                       specifyTotalElementId("direct_messages")
                       );
        
    }
}


/*
 * The main function that loads the photos and videos .. 
 */
function getPhotosAndVideos() {
    
    // and here we'll check if we have to get the FB and TW or only the FB or only the TW items .. 
    var fql = {
        "queryPhotoStream": "SELECT post_id, actor_id, source_id, created_time, attachment FROM stream WHERE filter_key IN (SELECT filter_key FROM stream_filter WHERE uid=me() AND (name='Photos' OR name = 'Video'))" + ( last_items_parameters.facebook_newsfeed_photos_and_videos != undefined ? " AND created_time > " + last_items_parameters.facebook_newsfeed_photos_and_videos : "" ),
        "queryPhotoProfile": "SELECT id, name, pic_square FROM profile WHERE id IN (SELECT source_id FROM #queryPhotoStream)"
    };
    
    var fqlString = JSON.stringify(fql);
    var newsfeed_photos_and_videos_request = facebookObject.graphApiRequest("newsfeed_photos_and_videos", encodeURIComponent(fqlString));          
    
    newsfeed_photos_and_videos_request.onload = populateFacebookResponse;
    
}

/*
 * The main function that loads the birthdays.. 
 */
function getBirthdays() {
    
    // get birthday(s) - for the home or the birthdays screen .. 
    // and here we'll check if we have to get the FB .. 
    // (cause only for FB users have birthdays)
    if( the_logged_user.facebookId != "" && the_logged_user.facebookNames != "" ) {
        
        // here we'll call the getFriends, cause for birthdays we use the same data as for the friends .. 
        getFriends();
        
    }
}

/*
 * The main function that loads the events.. 
 */
function getEvents() {
    
    // get event(s) - for the birthdays screen .. 
    // and here we'll check if we have to get the FB
    if( the_logged_user.facebookId != "" && the_logged_user.facebookNames != "" ) {
        if(total_events_array.length == 0) {
            // we'll request the event items .. 
            // and the request checks internally if it has to get only the newer items .. 
            // or make pure request .. 
            var fql = {
                "queryAllEvents" :
                "SELECT eid, uid, rsvp_status, start_time " +
                "FROM event_member " + 
                "WHERE uid = me() " + 
                "AND start_time > now() " +
                "ORDER BY start_time DESC"
                ,
                "queryEventsPerItem" :
                "SELECT eid, name, location, pic_square, start_time, end_time, description, creator, host " +
                "FROM event " +
                "WHERE eid in (SELECT eid FROM #queryAllEvents)"
                ,
                "queryEventOwner" :
                "SELECT id, name " +
                "FROM profile " +
                "WHERE id IN (SELECT creator FROM #queryEventsPerItem)"
            }
            
            var fqlString = JSON.stringify(fql);
            var events_request = facebookObject.graphApiRequest( "events",  encodeURIComponent(fqlString));
            //console.log("Event items: " + events_request);
            events_request.onload = function(jsEvent) {
                populateFacebookResponse(
                                         jsEvent, // js event gets passed
                                         false, // localStorageVariable
                                         "events", // theRequestWeHaveMade
                                         true // postOnlyFacebookData
                                         );
            }
        } else {
            cycleObjectsAndPopulateItems("events");
        }
    }
}

/*
 * The function that loads the event feed wall.
 */
function getEventFeed(eventID)
{
    log('Getting event feed for eventID: ' + eventID);
    if( the_logged_user.facebookId != '' && the_logged_user.facebookNames != '' )
    {
        var fql = "";
        
        fql = {
            'queryStream' :
            'SELECT post_id, message, comments, likes, created_time, actor_id ' +
            'FROM stream ' +
            'WHERE source_id = ' + eventID + ' ' +
            'ORDER BY created_time DESC ' +
            'LIMIT 20'
            ,
            'queryAuthors' :
            'SELECT name, id, pic_square ' +
            'FROM profile ' + 
            'WHERE id IN (SELECT actor_id FROM #queryStream)'
        };
        
        fql = JSON.stringify(fql);
        
        //log('!!!!!!FQL: ' + fql);
        
        
        // Grabbing the first 20 comments:
        var res = facebookObject.graphApiRequest('events_screen', encodeURIComponent(fql));
        
        res.onload = function(xhr)
        {
            var viewer = document.getElementById('event_feed');
            var json = JSON.parse(xhr.target.responseText);
            json = json.data;
            
            var authors = [];
            var feedItems = [];
            
            for(var index in json)
            {
                if(json[index].name == 'queryAuthors')
                    authors = json[index].fql_result_set;
                if(json[index].name == 'queryStream')
                    feedItems = json[index].fql_result_set;
            }
            
            // Lets add authors to feed items:
            
            // First array length:
            var feedLen = feedItems.length;
            var authorsLen = authors.length;
            //log("Total authors: + " + authorsLen + " + " + JSON.stringify(authors));
            //log(JSON.stringify(feedItems));
            for(var i = 0; i < feedLen; i++)
            {
                //log('feeditem: ' + feedItems[i].actor_id);
                for(var j = 0; j < authorsLen; j++)
                {
                    
                    //log('author: ' + authors[j].id);
                    
                    if(authors[j].id == feedItems[i].actor_id)
                    {
                        //log('match! ' + j);
                        //log('-- ' + authors[j].id + " -- " + authors[j].name + " -- " + authors[j].pic_square);
                        feedItems[i].ft_author = {
                            id    : authors[j].id,
                            name  : authors[j].name,
                            pic   : authors[j].pic_square
                        };
                    }
                }
            }
            
            //log(typeof feedItems);
            json = feedItems;
            
            // freeing up some memory
            feedItems = authors = null;
            
            var template = '<li>' + TemplateObject.getTemplate('eventsViewerStream') + '</li>';
            
            var resultArray = [];
            for(var i = 0; i < feedLen; i++)
            {
                resultArray.push(populateItemTemplate('eventsViewerStream', template, json[i]));
            }
            
            
            
            // Lets finally output something
            viewer.innerHTML = resultArray.join("");
            iScrollForSingleView.refresh();
        }
        
    }
}


/*
 * The main function that gets the friends .. 
 */
function getFriends() {
    
    // get friends - for the friends screen .. 
    // here we can't be on the home screen .. 
    if(the_logged_user.facebookId != "" && the_logged_user.facebookNames != "") {
        
        // first check to see if we have cached items .. 
        if(total_friends_array.length == 0) {
            
            // check to see if we have them in the local storage .. 
            var total_friends_from_local_storage = window.localStorage.getItem("total_friends");
            
            // and if we don't - we make the request for them .. 
            if( 1 ) { // facebook_friends_from_local_storage == null ) {
                
                // here we provide the query .. 
                var fql = "SELECT uid,name,birthday_date FROM user WHERE uid IN (select uid2 from friend where uid1=me()) order by name";
                
                // and here we make the friends request .. 
                var friends_req = facebookObject.graphApiRequest(
                                                                 "friends",
                                                                 escape( fql )
                                                                 );
                friends_req.onload = populateFacebookResponse;
                
            } else {
                
                // cache the facebook friends .. 
                cachePulledDataInArrays(
                                        "friends",
                                        JSON.parse( total_friends_from_local_storage ).data,
                                        []
                                        );
                
                // and here we populate the cached items .. 
                cycleObjectsAndPopulateItems( "friends" );
                
            }
            
        } else {
            
            // and here we populate the cached items .. 
            cycleObjectsAndPopulateItems( "friends" );
        }
        
    } else {
        
        // facebook "friends" - twitter "friends" .. 
        twitterRequest(
                       "followers/ids",
                       [],
                       specifyItemsListId("friends"),
                       specifyScrollDivId("friends"),
                       specifyTotalElementId("friends"),
                       getTwitterUsersByIds
                       );
    }
    
}



////////////////////////////////////////////////////
// The data manipulating and displaying functions ..
////////////////////////////////////////////////////


/*
 * Parse twitter date, based on the twitter date time string .. 
 */
function parseTwitterDate( theDateString ) {
    
    var the_months = {
        "Jan":0, "Feb":1, "Mar":2, "Apr":3, "May":4, "Jun":5,
        "Jul":6, "Aug":7, "Sep":8, "Oct":9, "Nov":10, "Dec":11
    };
    
    return new Date(
                    /* year */ theDateString.substring( theDateString.substring.length - 4 ),
                    /* mont */ the_months[ theDateString.substring.substring( 4, 7 ) ],
                    /* days */ theDateString.substring.substring( 8, 10 ),
                    /* hour */ theDateString.substring.substring( 11, 13 ),
                    /* mins */ theDateString.substring.substring( 14, 16 ),
                    /* secs */ theDateString.substring.substring( 17, 20 )
                    );
}


/*
 * Parse twitter date, based on the twitter date time string .. 
 */
function parseFacebookDate( theDateString ) {
    
    return new Date(
                    /* year */ theDateString.substring( 0, 4 ),
                    /* mont */ theDateString.substring( 5, 7 ) - 1,
                    /* days */ theDateString.substring( 8, 10 ),
                    /* hour */ theDateString.substring( 11, 13 ),
                    /* mins */ theDateString.substring( 14, 16 ),
                    /* secs */ theDateString.substring( 17, 19 )
                    );
}

/*
 * Generates the string, that shows when the user gets on what age .. 
 */
function showWhenBirthdayWillFire( the_birthday ) {
    
    // predefine the variables we'll need .. 
    var daysAway = null;
    var daysAwayText = '';
    var birthDate = '';
    var turns = "";
    var date = new Date();
    var today_day = date.getDate();
    var today_month = date.getMonth() + 1;
    var today_year = date.getFullYear();
    var turnsText = "";
    
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // first - parse the birthday date .. 
    exploded = the_birthday.split("/");
    month = exploded[0]
    day = exploded[1];
    
    // some calculations on the year .. 
    if (exploded[2]) {
        year = exploded[2];
        // calculate how old user gets .. 
        turns = Math.abs(today_year - year);
    }
    
    // we'll use two date objects .. 
    var myDate = new Date(today_month + '/' + today_day + '/' + today_year).getTime();
    var yourDate = new Date(month + '/' + day + '/' + today_year).getTime();
    
    // and compare the current day with the birthday .. 
    if (myDate > yourDate) {
        yourDate = new Date(month + '/' + day + '/' + (today_year+1)).getTime();
    }
    
    // here we'll generate the word that will tell the month the birthday will happen .. 
    var monthWord = months[parseInt(month.replace("0","")) - 1];
    
    // and here - the whole birthday string .. 
    birthDate = monthWord + ' <strong>' + parseInt(day.replace("0","")) + '</strong>';
    
    // and return the final string .. 
    if( turns != "" ) {
        return [ 'Turns ' + turns, 'on ' + birthDate ];
    } else {
        return [ 'Has birthday', 'on ' + birthDate ];
    }
    
}


/*
 * This function shows the passed time in a human readable way .. 
 */
function humaneDate( seconds ){
    var lang = {
    ago: 'Ago',
    now: 'Just Now',
    minute: 'Minute',
    minutes: 'Minutes',
    hour: 'Hour',
    hours: 'Hours',
    day: 'Day',
    days: 'Days',
    week: 'Week',
    weeks: 'Weeks',
    month: 'Month',
    months: 'Months',
    year: 'Year',
    years: 'Years'
    },
    formats = [
               [60, lang.now],
               [3600, lang.minute, lang.minutes, 60], // 60 minutes, 1 minute
               [86400, lang.hour, lang.hours, 3600], // 24 hours, 1 hour
               [604800, lang.day, lang.days, 86400], // 7 days, 1 day
               [2628000, lang.week, lang.weeks, 604800], // ~1 month, 1 week
               [31536000, lang.month, lang.months, 2628000], // 1 year, ~1 month
               [Infinity, lang.year, lang.years, 31536000], // Infinity, 1 year
               ],
    token;
    
    if(seconds < 0) {
        seconds = Math.abs(seconds);
        token = '';
    } else {
        token = ' ' + lang.ago;
    }
    
    /*
     * 0 seconds && < 60 seconds        Now
     * 60 seconds                       1 Minute
     * > 60 seconds && < 60 minutes     X Minutes
     * 60 minutes                       1 Hour
     * > 60 minutes && < 24 hours       X Hours
     * 24 hours                         1 Day
     * > 24 hours && < 7 days           X Days
     * 7 days                           1 Week
     * > 7 days && < ~ 1 Month          X Weeks
     * ~ 1 Month                        1 Month
     * > ~ 1 Month && < 1 Year          X Months
     * 1 Year                           1 Year
     * > 1 Year                         X Years
     * 
     * Single units are +10%. 1 Year shows first at 1 Year + 10%
     */
    
    function normalize(val, single) {
        var margin = 0.1;
        if(val >= single && val <= single * (1+margin)) {
            return single;
        }
        return val;
    }
    
    for( var i = 0, format = formats[0]; formats[i]; format = formats[++i] ) {
        if(seconds < format[0]) {
            if(i === 0) {
                // Now
                return format[1];
            }
            var val = Math.ceil(normalize(seconds, format[3]) / (format[3]));
            return val + 
            ' ' +
            (val != 1 ? format[2] : format[1]) +
            (i > 0 ? token : '');
        }
    }
}


// Will return date formatted: 21 June, 21:32
function preformatDateFromMiliseconds(timestamp)
{
    timestamp = new Number(timestamp + "000");
    //log(timestamp, 1);
    function prependDigits(num, digits)
    {
        //return num;
        var d = 0;
        var tmpNumber = new Number(num);
        var formattedNumber = '';
        if(num == 0)
            d = 1;
        while(tmpNumber > 0)
        {
            tmpNumber /= 10;
            tmpNumber = Math.round(tmpNumber);
            d++;
        }
        if(digits > d)
        {
            while(digits > d)
            {
                digits--;
                formattedNumber += "0";
            }
            formattedNumber += new String(num);
        }
        else
        {
            formattedNumber = num;
        }
        return formattedNumber;
    }
    var time = new Date;
    time.setTime(timestamp);
    // Could be exported to config.js
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var d = {
        day     : prependDigits(time.getDate(), 2),
        month   : months[time.getMonth()],
        year    : time.getFullYear(),
        hours   : prependDigits(time.getHours(), 2),
        minutes : prependDigits(time.getMinutes(), 2)
    };
    
    var tod = 'am';
    if(d.hours > 11)
        tod = 'pm';
    if(d.hours > 12)
        d.hours = d.hours - 12;
    if(d.hours == 0)
        d.hours = 12;
    
    return d.day + " " + 
    d.month +
    // display year only if it is a following year:
    ( ( new Number(d.year) > new Number( new Date().getFullYear() ) ) ? " " + d.year : "" ) + ", " + 
    d.hours + ":" + d.minutes + " " + tod;
}


/*
 * This function defines the arrays we'll cache data in to .. 
 */
function defineDataArraysForCaching( requestWeHaveMade ) {
    
    // and depending on the request .. 
    switch( requestWeHaveMade ) {
            
            // newsfeed items array .. 
        case "feed" :
        case "tweets" : 
            return total_newsfeed_array;
            break;
            
            // messages items array .. 
        case "inbox" :
        case "direct_messages" : 
            return total_messages_array;
            break;
            
            // photos and videos items array .. 
        case "newsfeed_photos_and_videos" : 
            return total_photos_videos_array;
            break;
            
            // notifications items array .. 
        case "notifications" :
        case "mentions" : 
            return total_notifications_array;
            break;
            
        case "events":
            return total_events_array;
            break;
            
        case "friends":
        case "users":
            return total_friends_array;
            break;
    }
}

/*
 * This function stores the pulled from requests data in the global data arrays .. 
 */
function cachePulledDataInArrays(requestWeHaveMade, facebookItems, twitterItems) {
    
    // some vars .. 
    var i, facebook_request_type,
    how_to_add_new_facebook_items = "push",
    how_to_add_new_twitter_items = "push",
    how_to_add_items_to_global_array = "push",
    facebook_item_date, twitter_item_date;
    
    // and while caching - we'll replace the date-time with timestamp .. 
    // cause it'll be more comfortable later .. 
    
    // the facebook array .. 
    if( facebookItems.length > 0 ) {
        // and here we specify the facebook request, that corresponds to the twitter request .. 
        // (cause if we have both types of data - we get here from Twitter response handler
        // but we have Facebook data as well ...)
        switch( requestWeHaveMade ) {
            case "tweets" :
                facebook_request_type = "feed";
                break;
            case "mentions" :
                facebook_request_type = "notifications";
                break;
            case "direct_messages" :
                facebook_request_type = "inbox";
                break;
            case "newsfeed_photos_and_videos" :
                facebook_request_type = "facebook_newsfeed_photos_and_videos";
                break;
            case "users" :
                facebook_request_type = "friends";
                break;
            default:
                facebook_request_type = requestWeHaveMade;
                break;
        }
        
        for( i in facebookItems ) {
            
            // first - we change the time string to timestamp .. 
            // (but for the photos and videos - we have it already )
            /*if( requestWeHaveMade != "birthdays" ) {
             if(
             requestWeHaveMade != "newsfeed_photos_and_videos"
             &&
             requestWeHaveMade != "tweets"
             &&
             requestWeHaveMade != "newsfeed"
             ) {
             
             // if we don't have the timestamp in the facebook item - we provide it .. 
             if( ! ("timestamp" in facebookItems[i]) ) {
             facebook_item_date = false;
             facebookItems[i].timestamp = 0;
             
             if( "created_time" in facebookItems[i] ) {
             
             if( typeof facebookItems[i].created_time == "number" ) {
             facebookItems[i].timestamp = facebookItems[i].created_time;
             } else {
             facebook_item_date = parseFacebookDate(facebookItems[i].created_time);
             }
             
             } else if( "updated_time" in facebookItems[i] ) {
             
             if( typeof facebookItems[i].updated_time == "number" ) {
             facebookItems[i].timestamp = facebookItems[i].updated_time;
             } else {
             facebook_item_date = parseFacebookDate(facebookItems[i].updated_time);
             }
             
             } else if( "start_time" in facebookItems[i] ) {
             
             if( typeof facebookItems[i].start_time == "number" ) {
             facebookItems[i].timestamp = facebookItems[i].start_time;
             } else {
             facebook_item_date = parseFacebookDate(facebookItems[i].start_time);
             
             //Facebook events have start and end date, so we create and parse another variable
             
             if("end_time" in facebookItems[i])
             {
             var facebook_item_end_date = null;
             facebook_item_end_date = parseFacebookDate(facebookItems[i].end_time);
             }
             facebook_item_date = parseFacebookDate(facebookItems[i].start_time);
             }
             }
             
             if( facebook_item_date != false ) {
             facebookItems[i].timestamp = facebook_item_date.getTime();
             if(facebook_item_end_date != null)
             {
             facebookItems[i].timestamp_end = facebook_item_end_date.getTime();
             }
             }
             
             }
             
             } else {
             
             // we have the timestamp already .. 
             facebookItems[i].timestamp = facebookItems[i].created_time;
             
             }
             
             }*/
            
            // and set the flag that this is facebook item .. 
            facebookItems[i].type = "facebook";
            
            // and we either add the new item to the cache array .. 
            addItemToCacheArray(
                                defineDataArraysForCaching( requestWeHaveMade),
                                facebookItems[i],
                                how_to_add_new_facebook_items
                                );
            
        }
        
        // store the most recent item - which is the lates one .. 
        // if we're pushing the items - it must the first one .. 
        // otherwise - if prepending - it must the last one .. 
        if( how_to_add_new_facebook_items == "push" ) {
            last_items_parameters[facebook_request_type] = new Date(facebookItems[0].timestamp);
        } else {
            last_items_parameters[facebook_request_type] = facebookItems[facebookItems.length-1].timestamp;
        }
        
    }
    
    // the twitter array .. 
    if( twitterItems.length > 0 ) {
        for( i in twitterItems ) {
            twitter_item_date = new Date(twitterItems[i].created_at);
            
            twitterItems[i].timestamp = twitter_item_date.getTime();
            
            // and set the flag that this is facebook item .. 
            twitterItems[i].type = "twitter";
            
            // and we either add the new item to the cache array .. 
            addItemToCacheArray(
                                defineDataArraysForCaching( requestWeHaveMade),
                                twitterItems[i],
                                how_to_add_new_twitter_items
                                );
            
            // store the first item - which is the lates one - timestamp .. 
            if( last_items_parameters[requestWeHaveMade] == undefined ) {
                last_items_parameters[requestWeHaveMade] = new Date(twitterItems[i].timestamp);
            }
            
        }
        
    }
    
    
    //sort the data
    var theArray = defineDataArraysForCaching( requestWeHaveMade );
    theArray.sort(function(a, b) {
                  return new Date(a.timestamp) < new Date(b.timestamp) ? 1 : -1;
                  });
    
}

/*
 * This function adds an item to the appropriate cache array .. 
 */
function addItemToCacheArray( the_cache_array, the_item, push_or_unshift ) {
    
    if( push_or_unshift == "push" ) {
        the_cache_array.push( the_item );
    } else {
        the_cache_array.unshift( the_item );
    }
    
}

/*
 * Here, from click on a tab, we switch between twitter data, facebook data or both .. 
 */
function switchBetweenTwitterOrFacebookData( typeOfDataToPopulate ) {
    
    // predefine some vars .. 
    var typeOfRequest, arrayWithPopulatedTemplates, template,
    theListId, theScrollDivId;
    
    // we'll store the type of data we're switching to .. 
    separated_screen_data_type = typeOfDataToPopulate;
    
    // and then we specify the type of the request we're about to simulate .. 
    switch( currentScreen ) {
        case "newsfeed_screen":
            typeOfRequest = "tweets";
            break;
        case "messages_screen":
            typeOfRequest = "direct_messages";
            break;
        case "notifications_screen":
            typeOfRequest = "mentions";
            break;
        case "photosvideo_screen":
            typeOfRequest = "newsfeed_photos_and_videos";
            break;
        case "friends_screen":
            typeOfRequest = "friends";
            break;
    }
    
    // we'll specify the template .. 
    template = TemplateObject.generateItemsTemplate(typeOfRequest);
    
    // and here we'll specify the list id - where we'll populate the results .. 
    theListId = TemplateObject.specifyItemsListId(typeOfRequest);
    
    // and here we'll specify the scroll div id - on which we'll init the scroll .. 
    theScrollDivId = TemplateObject.specifyScrollDivId(typeOfRequest);
    
    // and highlight tab by it's ID .. 
    highlightTabById( currentScreen + "_" + typeOfDataToPopulate + "_tab" );
    
    // and here we populate the items .. 
    cycleObjectsAndPopulateItems(
                                 typeOfRequest,
                                 defineDataArraysForCaching( typeOfRequest ),
                                 typeOfDataToPopulate,
                                 template,
                                 theListId,
                                 theScrollDivId,
                                 null,
                                 true
                                 );
    
}

/*
 * Function for highlighting a tab in a separate screen .. 
 */
function highlightTabById( newTabId ) {
    // if we have a highlighted tab already - we remove it's class "current" .. 
    if( highligted_tab_id != "" ) {
        theTabElement = document.getElementById( highligted_tab_id );
        classOfTab = theTabElement.className;
        theTabElement.className = classOfTab.replace(" current", "" );
    }
    
    // and we highlight the new tab .. 
    theTabElement = document.getElementById( newTabId );
    classOfTab = theTabElement.className;
    theTabElement.className = classOfTab + " current";
    
    // and we store the id of the new highlighted tab .. 
    highligted_tab_id = newTabId;
    
}

/*
 * Shortened function for making these two actions .. 
 */
function cycleObjectsAndPopulateItems(
                                      requestWeHaveMade,
                                      theDataArray,
                                      typeOfDataToPopulate,
                                      template,
                                      theListId,
                                      theScrollDivId,
                                      theTotalElementId,
                                      fromTabLink
                                      ) {
    // make sure we have all the necessary things .. 
    if( theDataArray == undefined ) {
        theDataArray = defineDataArraysForCaching( requestWeHaveMade );
    }
    if( template == undefined ) {
        template = TemplateObject.generateItemsTemplate( requestWeHaveMade );
    }
    if( theListId == undefined ) {
        theListId = TemplateObject.specifyItemsListId( requestWeHaveMade );
    }
    if( theScrollDivId == undefined ) {
        theScrollDivId = TemplateObject.specifyScrollDivId( requestWeHaveMade );
    }
    if( theTotalElementId == undefined ) {
        theTotalElementId = TemplateObject.specifyTotalElementId( requestWeHaveMade );
    }
    
    
    // cycle through the objects and generate the array with populated templates .. 
    var arrayWithPopulatedTemplates = cycleDataObjects(
                                                       requestWeHaveMade,
                                                       theDataArray,
                                                       template,
                                                       typeOfDataToPopulate
                                                       );
    
    // and populate the items in the list and init the scroll feature ..
    populateListItemsAndInitScroll(
                                   requestWeHaveMade,
                                   arrayWithPopulatedTemplates[0],
                                   theListId,
                                   theScrollDivId,
                                   theTotalElementId,
                                   fromTabLink,
                                   arrayWithPopulatedTemplates[1]
                                   ); 
    
}

/*
 * Cycle through array of data objects and generate array with the populated templates .. 
 */
function cycleDataObjects( requestWeHaveMade, dataArray, theTemplate, typeOfDataToPopulate ) {
    // predefine the variables we'll need .. 
    var resultArray = [], oneItem, itemHtml = "",
    itemsCount = 0,
    currentTimestamp = new Date().getTime();
    
    
    // and cycle through the reponse items .. 
    for( var ii in dataArray ) {
        
        // get the data for the item .. 
        oneItem = dataArray[ii];
        
        if(
           oneItem.type == typeOfDataToPopulate ||
           typeOfDataToPopulate == undefined ||
           typeOfDataToPopulate == null ||
           typeOfDataToPopulate == "both"
           ) {
            
            // populate the template .. 
            itemHtml = populateItemTemplate(
                                            requestWeHaveMade,
                                            theTemplate,
                                            oneItem,
                                            currentTimestamp
                                            );
            
            // and if have a populated template indeed .. 
            if( itemHtml != "" ) {
                // mark that we're adding an item .. 
                itemsCount++;
                // and push the result HTML in the results array .. 
                resultArray.push(itemHtml);
            }
            
            // and if we have reached the maximum count of items on a dashboard - we stop here .. 
            if( itemsCount >= 20 ) {
                break;
            }
            
        }
        
    }
    
    return [ resultArray, itemsCount ];
    
}


/*
 * Cycle through one data object and populate it's template .. 
 */
function cycleOneDataObject( dataArray, theTemplate ) {
    
    var resultArray = [], oneItem, itemHtml = "";
    
    // and cycle through the reponse items .. 
    for( var ii in dataArray ) {
        
        // get the data for the item .. 
        oneItem = dataArray[ii];
        
        if( ii == "user" ) {
            theTemplate = template.replace(/USERAVATAR/g, oneItem.profile_image_url)
            .replace(/USERNAME/g, oneItem.name)
            .replace(/SCREENNAME/g, oneItem.screen_name);
        }
        if( ii == "created_at" ) {
            template = template.replace(/CREATEDAT/g, oneItem);
        }
        if( ii == "text" ) {
            theTemplate = template.replace(/TEXT/g, oneItem);
        }
        if( ii == "retweet_count" ) {
            theTemplate = template.replace(/RETWEETEDCOUNT/g, "Retweeted: " + oneItem + " time" + (oneItem != 1 ? "s" : ""));
        }
        
    }
    
    return theTemplate;
    
}

/*
 * Here we populate the template for an item with the data for the item .. 
 */
function populateItemTemplate(
                              requestWeHaveMade,
                              template,
                              oneItem,
                              currentTimestamp
                              ) {
    
    // we'll predefine some things .. 
    var itemHtml = "";
    
    if( currentTimestamp == undefined ) {
        currentTimestamp = new Date().getTime();
    }
    
    // we'll calculate the "time ago" here, only once, and before we make the replacements of all items .. 
    var theTimeAgo = humaneDate(( currentTimestamp - oneItem.timestamp ) / 1000);
    //log('rwhm: ' + requestWeHaveMade);
    switch( requestWeHaveMade ) {
            
            ////////////////////////////////
            // first - the facebook cases .. 
            ////////////////////////////////
            
        case "notifications" :
            
            if( "text" in oneItem ) {
                // it's a twitter item .. 
                itemHtml = populateItemTemplate(
                                                "mentions",
                                                TemplateObject.generateItemsTemplate("mentions"),
                                                oneItem,
                                                currentTimestamp
                                                );
            } else {
                // it's a facebook item .. 
                itemHtml =  template.replace(/NOTIFICATIONID/g,oneItem.id)
                .replace(/TITLE/g,oneItem.title)
                .replace(/UNREADCOUNT/g,oneItem.unread)
                .replace(/CREATEDAT/g, theTimeAgo)
                .replace(/AUTHOR/g ,oneItem.from.name.length > 16 ? oneItem.from.name.substring(0, 14) + "..." : oneItem.from.name)
                .replace(/USERIMAGE/g, "https://graph.facebook.com/" + oneItem.from.id + "/picture?type=square");
            }
            break;
        case "feed" :
            if( "id_str" in oneItem ) {
                // it's a twitter item .. 
                itemHtml = populateItemTemplate(
                                                "tweets",
                                                template.generateItemsTemplate("tweets"),
                                                oneItem,
                                                currentTimestamp
                                                );
            } else {
                var media = "";
                var mediaclass = "";
                
                if(oneItem.attachment) {
                    if(oneItem.attachment.media && oneItem.attachment.media.length > 0) {
                        media = oneItem.attachment.media[0].src;
                        mediaclass = "image";
                    } 
                }
                // it's a facebook item .. 
                itemHtml =  template.replace(/NEWSID/g, oneItem.post_id)
                .replace(/CLASSTYPE/g, mediaclass)
                .replace(/AUTHOR/g , (oneItem.profile ? oneItem.profile.name : ""))
                .replace(/PICTURE/g, media)
                .replace(/USERIMAGE/g, (oneItem.profile ? "https://graph.facebook.com/" + oneItem.profile.id + "/picture?type=square" : ""))
                .replace(/TITLE/g, (oneItem.message ? oneItem.message : ""))
                .replace(/CREATEDAT/g, theTimeAgo);
                
                // and for the separated screen - we must take care of the Like and Comment links .. 
                if( currentScreen != "home" ) {
                    var likeCount = "";
                    var commentCount = "";
                    var likeDisplay = "inline";
                    var commentDisplay = "inline";
                    var userLikes = "img/like-off.png";
                    
                    if(oneItem.likes) {
                        if(oneItem.likes.count) {
                            likeCount = oneItem.likes.count;
                        }
                        if(!oneItem.likes.can_like) {
                            likeDisplay = "none";
                        }
                        if(oneItem.likes.user_likes) {
                            userLikes = "img/like-on.png";
                        }
                    }
                    if(oneItem.comments) {
                        if(oneItem.comments.count) {
                            commentCount = oneItem.comments.count;
                        }
                        if(!oneItem.comments.can_post) {
                            commentDisplay = "none";
                        }
                    }
                    
                    itemHtml = itemHtml.replace(/LIKECOUNT/g, likeCount)
                    .replace(/LIKEIMAGE/g, userLikes)
                    .replace(/LIKELINKDISPLAY/g, likeDisplay)
                    .replace(/COMMENTCOUNT/g, commentCount)
                    .replace(/COMMENTLINKDISPLAY/g, commentDisplay);
                    
                }
            }
            break;
        case "newsfeed_photos_and_videos" :
            
            if( "created_at" in oneItem ) {
                // it's a twitter item .. 
                // and we cycle through the media items, cause we may have more than one .. 
                for( var ii in oneItem.entities.media ) {
                    
                    itemHtml += template.replace(/OBJECTID/g, oneItem.entities.media[ii].id_str)
                    .replace(/TYPE/g, "photo")
                    .replace(/PICTURE/g, oneItem.entities.media[ii].media_url_https+":thumb")
                    .replace(/AUTHOR/g, oneItem.user.screen_name)
                    .replace(/USERIMAGE/g,  oneItem.user.profile_image_url)
                    .replace(/ICON/g, "./img/twitter_icon_small.png");
                }
                
            } else {
                if( "attachment" in oneItem && "media" in oneItem.attachment ) {
                    // it's a facebook item .. 
                    itemHtml = template.replace(/OBJECTID/g, oneItem.post_id)
                    .replace(/TYPE/g, oneItem.attachment.fb_object_type)
                    .replace(/PICTURE/g, oneItem.attachment.media[0].src)
                    .replace(/AUTHOR/g , oneItem.profile.name)
                    .replace(/USERIMAGE/g, "https://graph.facebook.com/" + oneItem.profile.id+ "/picture?type=square")
                    .replace(/ICON/g, "./img/fb_icon_small.png");
                    
                }
            }
            break;
        case "newsfeedViewer":
            if( "id_str" in oneItem ) {
                // it's a twitter item .. 
                // and here we'll keep the tweets with media .. 
                // by checking if the tweet has at least one photo attached .. 
                var media = "";
                var mediaclass = "";
                
                if( "entities" in oneItem && "media" in oneItem.entities ) {
                    for( var ii in oneItem.entities.media ) {
                        if( "type" in oneItem.entities.media[ii] && oneItem.entities.media[ii].type == "photo" ) {
                            media = oneItem.entities.media[ii].media_url + ":large";
                            mediaclass = "image";
                            break;
                        }
                    }
                    
                    /*if( tweet_is_with_media ) {
                     twitter_items_with_media.push( oneItem );
                     }*/
                }          
                
                // it's a twitter item .. 
                itemHtml = template.replace(/NEWSID/g, oneItem.id_str)
                .replace(/CLASSTYPE/g, mediaclass)
                .replace(/AUTHOR/g, oneItem.user.screen_name)
                .replace(/PICTURE/g, media)
                .replace(/USERIMAGE/g, oneItem.user.profile_image_url)
                .replace(/TITLE/g, oneItem.text)
                .replace(/CREATEDAT/g, theTimeAgo)
                .replace(/ACCT_TYPE/g, "./img/twitter_icon_small.png")
                .replace(/COMMENTLIST/g, "");
                
            } else {
                var media = "";
                var mediaclass = "";
                var displaystyle = "display:none";
                if(oneItem.attachment) {
                    
                    if(oneItem.attachment.media && oneItem.attachment.media.length > 0) {
                        media = oneItem.attachment.media[0].src.replace("_s.", "_n.");
                        mediaclass = "image";
                        displaystyle = "display:block";
                        if(oneItem.message == "" || oneItem.message == null || oneItem.message == undefined) {
                            if(oneItem.attachment.name) {
                                oneItem.message = oneItem.attachment.name;
                            } else if(oneItem.attachment.caption) {
                                oneItem.message = oneItem.attachment.caption;
                            } else if(oneItem.attachment.description) {
                                oneItem.message = oneItem.attachment.description;
                            } else if(oneItem.attachment.media[0].alt) {
                                oneItem.message = oneItem.attachment.media[0].alt;
                            }
                        } 
                    } 
                }
                // it's a facebook item .. 
                itemHtml =  template.replace(/NEWSID/g, oneItem.post_id)
                .replace(/CLASSTYPE/g, mediaclass)
                .replace(/AUTHOR/g , (oneItem.profile ? oneItem.profile.name : ""))
                .replace(/PICTURE/g, media)
                .replace(/DISPLAY/g, displaystyle)
                .replace(/USERIMAGE/g, (oneItem.profile ? "https://graph.facebook.com/" + oneItem.profile.id + "/picture?type=square" : ""))
                .replace(/TITLE/g, (oneItem.message ? oneItem.message : ""))
                .replace(/ACCT_TYPE/g, "./img/fb_icon_small.png");
                
                
                if(oneItem.comments && oneItem.comments.count > 0) {
                    //retrieve the first 5 comments or so
                    var query = "{\"queryComment\": \"SELECT id, post_id, fromid, time, text, comments FROM comment WHERE post_id = " + "'" + oneItem.post_id + "'"+ " LIMIT 5\","
                    + "\"queryCommentProfile\": \"SELECT id, name, pic_square FROM profile WHERE id IN (SELECT fromid FROM #queryComment)\"}";
                    
                    var encodeQuery = escape(query);
                    var comments_req = facebookObject.graphApiRequest("comments", encodeQuery, true);   
                    //comments_req.onload = function(ev) {
                        var json = JSON.parse(comments_req.responseText);
                        var comments = json.data[0].fql_result_set;
                        var commentProfiles = json.data[1].fql_result_set;
                        matchCommentProfiles(commentProfiles, comments);
                        
                        var currentTimestamp = new Date().getTime();
                    
                        var commentsList = "";
                        for(var c in comments) {
                            var commentObject = comments[c];
                            var comment = "";
                            var commentTemplate = TemplateObject.getTemplate("newsfeedComment");
                            // we'll calculate the "time ago" here, only once, and before we make the replacements of all items .. 
                            var theTimeAgo = humaneDate(( currentTimestamp - commentObject.time * 1000 ) / 1000); 
                            
                            commentTemplate = commentTemplate.replace(/AUTHOR/g, commentObject.name)
                            .replace(/USERIMAGE/g, commentObject.pic_square)
                            .replace(/COMMENT/g, commentObject.text)
                            .replace(/CREATEDTIME/g, theTimeAgo);
                            comment += commentTemplate;
                            commentsList += comment;
                        }    
                        console.log("commentsList is " + commentsList);
                        itemHtml = itemHtml.replace(/COMMENTLIST/g, commentsList);
                        console.log("itemHtml is + " + itemHtml);
                    //}
                } else {
                    itemHtml = itemHtml.replace(/COMMENTLIST/g, "");
                }
            }
            break;
        case "photoVideoViewer":
            
            if( "created_at" in oneItem ) {
                // it's a twitter item .. 
                // and we cycle through the media items, cause we may have more than one .. 
                for( var ii in oneItem.entities.media ) {
                    
                    itemHtml += template.replace(/OBJECTID/g, oneItem.entities.media[ii].id_str)
                    .replace(/TYPE/g, "photo")
                    .replace(/PICTURE/g, oneItem.entities.media[ii].media_url_https+":large")
                    .replace(/AUTHOR/g, oneItem.user.screen_name)
                    .replace(/USERIMAGE/g,  oneItem.user.profile_image_url); 
                }
                
            } else {
                
                if( "attachment" in oneItem && "media" in oneItem.attachment ) {
                    // it's a facebook item .. 
                    itemHtml = template.replace(/OBJECTID/g, oneItem.post_id)
                    .replace(/TYPE/g, oneItem.attachment.fb_object_type)
                    .replace(/PICTURE/g, oneItem.attachment.media[0].src.replace("_s.","_n."))            
                    .replace(/AUTHOR/g , oneItem.profile.name)
                    .replace(/USERIMAGE/g, "https://graph.facebook.com/" + oneItem.profile.id+ "/picture?type=square");
                } else { //problably came from album
                    // it's a facebook item .. 
                    itemHtml = template.replace(/PICTURE/g, oneItem.src_big)
                    .replace(/AUTHOR/g , "")
                    .replace(/USERIMAGE/g, "https://graph.facebook.com/" + oneItem.owner + "/picture?type=square");                          
                }
            }            
            break;            
        case "inbox" :
            if( "text" in oneItem ) {
                // it's a twitter item .. 
                itemHtml = populateItemTemplate(
                                                "direct_messages",
                                                TemplateObject.generateItemsTemplate("direct_messages"),
                                                oneItem,
                                                currentTimestamp
                                                );
            } else {
                // it's a facebook item .. 
                //get the latest message
                var from = oneItem.to.data[1];
                var message = "";
                if(oneItem.comments && oneItem.comments.data && oneItem.comments.data.length > 0) {
                    var length = oneItem.comments.data.length;
                    message = oneItem.comments.data[length - 1].message;
                } else {
                    if(oneItem.message) {
                        message == message;
                    } else {
                        message == "";
                    }
                }
                itemHtml =  template.replace(/FROMNAME/g, from.name)
                .replace(/USERIMAGE/g, "https://graph.facebook.com/" + from.id + "/picture?type=square")
                .replace(/MESSAGEID/g, oneItem.id)
                .replace(/UPDATEDAT/g, theTimeAgo)
                .replace(/MESSAGETEXT/g, message);
            }
            break;
        case "friends" :
        case "users" :
            // here we'll make specific populates, depending on
            // wheather we're dealing with friends/users or birthdays .. 
            if( "birthday_date" in oneItem ) {
                // it's a facebook item .. 
                if(
                   currentScreen == "friends_screen"
                   ||
                   ( oneItem.birthday_date != null && currentScreen != "friends_screen" )
                   ) {
                    
                    // preliminary - we generate the texts for the birthday .. 
                    var birthdayTexts = oneItem.birthday_date == null ? ["",""] : showWhenBirthdayWillFire( oneItem.birthday_date );
                    
                    // and populate .. 
                    itemHtml =  template.replace(/ID/g, oneItem.uid)
                    .replace(/NAME/g, oneItem.name)
                    .replace(/BIRTHDAY/g, oneItem.birthday_date == null ? "" : oneItem.birthday_date)
                    .replace(/USERIMAGE/g, "https://graph.facebook.com/" + oneItem.uid+ "/picture?type=normal")
                    .replace(/ICONIMAGE/g, "./img/fb_icon_small.png")
                    .replace(/TURNS_ON_AGE_TEXT/g, birthdayTexts[0] )
                    .replace(/TURNS_ON_DATE_TEXT/g, birthdayTexts[1] );
                }
            } else if( currentScreen == "friends_screen" ) {
                // it's a twitter item .. 
                itemHtml =  template.replace(/ID/g, oneItem.id_str)
                .replace(/NAME/g, "<b>" + oneItem.name + "</b> @" + oneItem.screen_name)
                .replace(/BIRTHDAY/g,"")
                .replace(/USERIMAGE/g, oneItem.profile_image_url)
                .replace(/ICONIMAGE/g, "./img/twitter_icon_small.png");
            }
            break;
            
            
            //
            // BEGIN TEMPLATING EVENT ITEMS
            //
        case "events" :
        case "eventsViewer" :
            //log('event_screen ?');
            var creator = oneItem.event_creator == '' ? '' : 'Created by: ' + oneItem.event_creator;
            
            itemHtml =  template
            .replace(/EVENTID/g,            oneItem.eid)
            .replace(/NAME/g,               oneItem.name)
            .replace(/EVENT_IMAGE/g,        oneItem.pic_square)
            .replace(/LOCATION/g,           oneItem.location)
            .replace(/START_TIME/g,         preformatDateFromMiliseconds(oneItem.start_time))
            .replace(/END_TIME/g,           preformatDateFromMiliseconds(oneItem.end_time))
            .replace(/OWNER/g,              creator)
            .replace(/RSVP_STATUS/g,        oneItem.rsvp_status)
            .replace(/DESCRIPTION/g,        oneItem.description);
            break;
            
        case 'eventsViewerStream':
            //log('uno itemo: ' + JSON.stringify(oneItem));
            itemHtml = template
            .replace(/POSTID/g,         oneItem.post_id)
            .replace(/IMG_SRC/g,        oneItem.ft_author.pic)
            .replace(/AUTHOR_ID/g,      oneItem.actor_id)
            .replace(/AUTHOR/g,         oneItem.ft_author.name)
            .replace(/COMMENT_TEXT/g,   oneItem.message)
            .replace(/COMMENT_TIME/g,   oneItem.created_time); // TODO: inspect why humanDate() wont return human-readable date.
            
            break;
            
            ////////////////////////////////
            // then - the twitter cases .. 
            ////////////////////////////////
            
        case "tweets":
            if( "id_str" in oneItem ) {
                // it's a twitter item .. 
                
                // and here we'll keep the tweets with media .. 
                // by checking if the tweet has at least one photo attached .. 
                var tweet_is_with_media = false;
                var media = "";
                var mediaclass = "";
                
                if( "entities" in oneItem && "media" in oneItem.entities ) {
                    for( var ii in oneItem.entities.media ) {
                        if( "type" in oneItem.entities.media[ii] && oneItem.entities.media[ii].type == "photo" ) {
                            tweet_is_with_media = true;
                            media = oneItem.entities.media[ii].media_url + ":large";
                            mediaclass = "image";                 
                            break;
                        }
                    }
                    
                    if( tweet_is_with_media ) {
                        twitter_items_with_media.push( oneItem );
                    }
                }
                
                // it's a twitter item .. 
                itemHtml = template.replace(/NEWSID/g, oneItem.id_str)
                .replace(/FROMUSERNAME/g, oneItem.user.name)
                .replace(/CLASSTYPE/g, mediaclass)
                .replace(/PICTURE/g, media)                
                .replace(/USERIMAGE/g, oneItem.user.profile_image_url)
                .replace(/SCREENNAME/g, oneItem.user.screen_name)
                .replace(/CREATEDAT/g, theTimeAgo)
                .replace(/TEXT/g, oneItem.text)
                .replace("img/retweet-off.png", oneItem.retweeted ? "img/retweet-on.png" : "img/retweet-off.png")
                .replace(/FAVORITELINKDISPLAY/g, oneItem.favorited ? "none" : "inline")
                .replace(/FAVORITEDLINKDISPLAY/g, oneItem.favorited ? "inline" : "none");
            } else {
                // it's a facebook item .. 
                itemHtml = populateItemTemplate(
                                                "feed",
                                                TemplateObject.generateItemsTemplate("feed"),
                                                oneItem,
                                                currentTimestamp
                                                );
            }
            break;
        case "direct_messages":
            if( "text" in oneItem ) {
                // it's a twitter item .. 
                itemHtml = template.replace(/FROMUSERNAME/g, oneItem.sender.name)
                .replace(/USERIMAGE/g, oneItem.sender.profile_image_url)
                .replace(/TOUSERNAME/g, oneItem.recipient.name)
                .replace(/CREATEDAT/g, theTimeAgo)
                .replace(/TEXT/g, oneItem.text)
                .replace(/REPLYSCREENNAME/g, oneItem.sender.screen_name != the_logged_user.twitterScreenName ? oneItem.sender.screen_name : oneItem.recipient.screen_name);
            } else {
                // it's a facebook item .. 
                itemHtml = populateItemTemplate(
                                                "inbox",
                                                TemplateObject.generateItemsTemplate("inbox"),
                                                oneItem,
                                                currentTimestamp
                                                );
            }
            break;
            
        case "mentions":
            
            if( "text" in oneItem ) {
                // it's a twitter item .. 
                itemHtml = template.replace(/TWEETID/g, oneItem.id_str)
                .replace(/USERNAME/g, oneItem.user.name)
                .replace(/USERIMAGE/g, oneItem.user.profile_image_url)
                .replace(/USERSCREENNAME/g, oneItem.user.screen_name)
                .replace(/CREATEDAT/g, theTimeAgo)
                .replace(/MENTION/g, oneItem.text)
                .replace(/FAVORITELINKDISPLAY/g, oneItem.favorited ? "none" : "inline")
                .replace(/FAVORITEDLINKDISPLAY/g, oneItem.favorited ? "inline" : "none");
            } else {
                // it's a facebook item .. 
                itemHtml = populateItemTemplate(
                                                "notifications",
                                                TemplateObject.generateItemsTemplate("notifications"),
                                                oneItem,
                                                currentTimestamp
                                                );
            }
            break;
            
        case "favorite":
            
            itemHtml = template.replace(/TWEETID/g, oneItem.id_str)
            .replace(/FROMUSERNAME/g, oneItem.user.name)
            .replace(/CREATEDAT/g, theTimeAgo)
            .replace(/TEXT/g, oneItem.text);
            break;
            
        case "friendsViewer":
            if( "id_str" in oneItem ) {
                // twitter item .. 
                itemHtml = template.replace(/USERID/g, oneItem.id_str)
                .replace(/USER_SCREEN_NAME/g, oneItem.screen_name)
                .replace(/NAME/g, oneItem.name)
                .replace(/BIRTHDAY/g, "")
                .replace(/USERIMAGE/g, oneItem.profile_image_url)
                .replace(/FACEBOOK_SEND_MESSAGE_DISPLAY/g, "none")
                .replace(/TWITTER_SEND_MESSAGE_DISPLAY/g, "block")
                .replace(/ICONIMAGE/g, "./img/twitter_icon_small.png");
            } else {
                // facebook item .. 
                itemHtml = template.replace(/USERID/g, oneItem.uid)
                .replace(/NAME/g, oneItem.name)
                .replace(/BIRTHDAY/g, oneItem.birthday_date)
                .replace(/USERIMAGE/g, "https://graph.facebook.com/" + oneItem.uid+ "/picture?type=square")
                .replace(/FACEBOOK_SEND_MESSAGE_DISPLAY/g, "block")
                .replace(/TWITTER_SEND_MESSAGE_DISPLAY/g, "none")
                .replace(/ICONIMAGE/g, "./img/fb_icon_small.png");
            }
            break;
            
        case "birthdaysViewer":
            itemHtml = template.replace(/FBID/g, oneItem.uid)
            .replace(/NAME/g, oneItem.name)
            .replace(/BIRTHDAY/g, oneItem.birthday_date)
            .replace(/USERIMAGE/g, "https://graph.facebook.com/" + oneItem.uid+ "/picture?type=square");
            break;
            
        case "messagesViewer":
            itemHtml = template.replace(/ID/g, oneItem.id)
            .replace(/FROMNAME/g, oneItem.name)
            .replace(/BIRTHDAY/g, oneItem.birthday_date)
            .replace(/USERIMAGE/g, "https://graph.facebook.com/" + oneItem.id+ "/picture?type=square");
            break;
            
    }
    
    return itemHtml;
}

/*
 * The function that populates the items html in the list itself .. 
 */
function populateListItemsAndInitScroll(
                                        requestWeHaveMade,
                                        listItems,
                                        theListId,
                                        theScrollDivId,
                                        theTotalElementId,
                                        fromTabLink,
                                        theActuallItemsCount
                                        ) {
    
    // we'll have the list element .. 
    theListElement = document.getElementById(theListId);
    
    // first of all - populate the items - if we have any .. 
    if( listItems.length > 0 ) {
        theListElement.innerHTML = listItems.join("");
    }
    
    // make sure we have the actual items count .. 
    if( theActuallItemsCount == undefined ) {
        theActuallItemsCount = listItems.length;
    }
    
    // populate the total .. 
    if( theTotalElementId != undefined && theTotalElementId != null && theTotalElementId != "" ) {
        document.getElementById(theTotalElementId).innerHTML = theActuallItemsCount;
    }
    
    // show the appropriate title if we don't have items at all .. 
    switch( theActuallItemsCount ) {
        case 0 :
            theListElement.innerHTML = "<li class='no_results_found'>" + textForNoItems[requestWeHaveMade] + "</li>";
            break;
        case 1 :
            if( currentScreen == "home" ) {
                // and if we have only one item in a row on the dasboard .. 
                // we set the appropriate class so it spreads on the whole width .. 
                theListElement.innerHTML = theListElement.innerHTML.replace(
                                                                            "dashboard_row_item",
                                                                            "dashboard_row_item_full_width"
                                                                            );
            }
            break;
        case 2 :
            if( currentScreen == "home" ) {
                // and if we have only one item in a row on the dasboard .. 
                // we set the appropriate class so it spreads on the whole width .. 
                theListElement.innerHTML = theListElement.innerHTML.replace(
                                                                            /dashboard_row_item/g,
                                                                            "dashboard_row_item_half_width"
                                                                            );
            }
            break;
    }
    
    // and some actions afterward - if we have to do anything .. 
    switch( requestWeHaveMade ) {
            
            // the notifications items .. 
        case "notifications" :
            
            // check if we have to init an iScroll .. 
            if( currentScreen != "home" || theActuallItemsCount > 3 ) {
                document.getElementById("dashboard_row_notifications_div").style.width =
                theActuallItemsCount*dashboard_cell_width + "px";
                
                // and the additional things we have to do, depending on the screen we are at .. 
                initOneiScroll(theScrollDivId, "notifications");
            }
            
            // and the additional things we have to do, depending on the screen we are at .. 
            if( currentScreen != "home" && fromTabLink == undefined ) {
                highlightTabById("notifications_screen_both_tab");
            }
            break;
            
        case "mentions" :
            
            // check if we have to init an iScroll .. 
            if( currentScreen != "home" || theActuallItemsCount > 3 ) {
                if( currentScreen == "home" ) {
                    
                    document.getElementById("dashboard_row_notifications_div").style.width =
                    theActuallItemsCount*dashboard_cell_width + "px";
                    
                    // and the additional things we have to do, depending on the screen we are at .. 
                    initOneiScroll( theScrollDivId, "notifications" );
                } else {
                    // set the appropriate class to the li element, if it's only one .. 
                    oneItem = theListElement.getElementsByTagName("li");
                    oneItem[0].setAttribute("class", "single_item_in_dashboard_row" );
                }
            }
            
            // and highlight the tabs on the separate screens .. 
            if( currentScreen != "home" && fromTabLink == undefined ) {
                highlightTabById("notifications_screen_both_tab");
            }
            break;
            
            // the newsfeed items .. 
        case "feed" :
            
            // check if we have to init an iScroll .. 
            if( currentScreen != "home" || theActuallItemsCount > 3 ) {
                document.getElementById("dashboard_row_newsfeed_div").style.width =
                theActuallItemsCount*dashboard_cell_width + "px";
                
                // and the additional things we have to do, depending on the screen we are at .. 
                initOneiScroll( theScrollDivId, "newsfeed" );
            }
            
            // and highlight the tabs on the separate screens .. 
            if( currentScreen != "home" && fromTabLink == undefined ) {
                highlightTabById( "newsfeed_screen_both_tab" );
            }
            
            // and if we have twitter items with media - we fire the populating tweets with media here .. 
            if( currentScreen == "home" && the_logged_user.twitterId != "" ) {
                // if we have only twitter user - we just populate the twitter items .. 
                if( the_logged_user.facebookId == "" ) {
                    populateTwitterResponse(
                                            "newsfeed_photos_and_videos",
                                            twitter_items_with_media,
                                            [],
                                            specifyItemsListId("newsfeed_photos_and_videos"),
                                            specifyScrollDivId("newsfeed_photos_and_videos"),
                                            specifyTotalElementId("newsfeed_photos_and_videos")
                                            );
                } else {
                    // otherwise - we attemp to populate both types of photos .. 
                    twitter_items_with_media_taken = true;
                    attempToPopulatePhotosAndVideos();
                }
            }
            break;
            
        case "tweets" :
            
            // check if we have to init an iScroll .. 
            if( currentScreen != "home" || theActuallItemsCount > 3 ) {
                document.getElementById("dashboard_row_newsfeed_div").style.width =
                theActuallItemsCount*dashboard_cell_width + "px";
                
                // and the additional things we have to do, depending on the screen we are at .. 
                initOneiScroll( theScrollDivId, "newsfeed" );
            }
            
            // and highlight the tabs on the separate screens .. 
            if( currentScreen != "home" && fromTabLink == undefined ) {
                highlightTabById( "newsfeed_screen_both_tab" );
            }
            
            // and if we have twitter items with media - we fire the populating tweets with media here .. 
            if( currentScreen == "home" && the_logged_user.twitterId != "" ) {
                // if we have only twitter user - we just populate the twitter items .. 
                if( the_logged_user.facebookId == "" ) {
                    populateTwitterResponse(
                                            "newsfeed_photos_and_videos",
                                            twitter_items_with_media,
                                            [],
                                            specifyItemsListId("newsfeed_photos_and_videos"),
                                            specifyScrollDivId("newsfeed_photos_and_videos"),
                                            specifyTotalElementId("newsfeed_photos_and_videos")
                                            );
                } else {
                    // otherwise - we attemp to populate both types of photos .. 
                    twitter_items_with_media_taken = true;
                    attempToPopulatePhotosAndVideos();
                }
            }
            
            break;
            // the newsfeed photos and videos items .. 
        case "newsfeed_photos_and_videos" :
            
            // check if we have to init an iScroll .. 
            if( currentScreen != "home" || theActuallItemsCount > 3 ) {
                document.getElementById("dashboard_row_newsfeed_photos_and_videos_div").style.width =
                theActuallItemsCount*dashboard_cell_width + "px";
                
                // and the additional things we have to do, depending on the screen we are at .. 
                initOneiScroll(theScrollDivId, "newsfeed_photos_and_videos");
            }
            break;
            // the messages items .. 
        case "inbox" :
            
            // check if we have to init an iScroll .. 
            if( currentScreen != "home" || theActuallItemsCount > 3 ) {
                document.getElementById("dashboard_row_messages_div").style.width =
                theActuallItemsCount*dashboard_cell_width + "px";
                
                // and the additional things we have to do, depending on the screen we are at .. 
                if( currentScreen == "home" ) {
                    initOneiScroll(theScrollDivId, "messages", false);
                } else {
                    initOneiScroll(theScrollDivId, "inbox");
                }
            }
            
            // and highlight the tabs on the separate screens .. 
            if( currentScreen != "home" && fromTabLink == undefined ) {
                highlightTabById( "messages_screen_both_tab" );
            }
            break;
        case "direct_messages" :
            
            // check if we have to init an iScroll .. 
            if( currentScreen != "home" || theActuallItemsCount > 3 ) {
                document.getElementById("dashboard_row_messages_div").style.width =
                theActuallItemsCount*dashboard_cell_width + "px";
                
                // and the additional things we have to do, depending on the screen we are at .. 
                if( currentScreen == "home" ) {
                    initOneiScroll(theScrollDivId, "messages", false);
                } else {
                    initOneiScroll(theScrollDivId, "inbox");
                }
            }
            
            // and highlight the tabs on the separate screens .. 
            if( currentScreen != "home" && fromTabLink == undefined ) {
                highlightTabById( "messages_screen_both_tab" );
            }
            break;
            // the friends items .. 
        case "friends" :
        case "users" :
            
            // here we handle both friends and birthdays .. 
            
            // for birthdays - we replace "friends" with "birthdays" on the no results found message .. 
            if( theActuallItemsCount == 0 && currentScreen != "friends_screen" ) {
                theListElement.innerHTML = theListElement.innerHTML.replace( "friends", "birthdays" );
            }
            
            // check if we have to init an iScroll .. 
            if( currentScreen != "home" || theActuallItemsCount > 3 ) {
                if( currentScreen == "home" ) {
                    document.getElementById("dashboard_row_birthdays_div").style.width =
                    theActuallItemsCount*dashboard_cell_width + "px";
                    initOneiScroll( theScrollDivId, "birthdays" );
                } else {
                    initOneiScroll( theScrollDivId, "friends", false );
                }
            }
            break;
            
            // the events items .. 
        case "events" :
            
            // check if we have to init an iScroll .. 
            if( currentScreen != "home" || theActuallItemsCount > 3 ) {
                
                document.getElementById("dashboard_row_events_div").style.width =
                theActuallItemsCount*dashboard_cell_width + "px";
                
                // and initialize the appropriate iScroll .. 
                if( currentScreen == "home" ) {
                    dashboardiScrolls.events = initOneiScroll( theScrollDivId, "events", false );
                } else {
                    initOneiScroll( theScrollDivId, 'events', false);
                }
                
            }
            
            break;            
    }
}

///////////////////////////
// The iScroll functions ..
///////////////////////////


function initOneViewiScroll( theScrollDivId, request ) {
    
    if(currentScreen != 'home')
    {
        if( iScrollForSingleView == false ) {
            
            var pullDownEl = document.getElementById("the_" + currentScreen + "_pull_down"),
            pullDownOffset = pullDownEl.offsetHeight,
            pullUpEl = document.getElementById("the_" + currentScreen + "_pull_up"),
            pullUpOffset = pullUpEl.offsetHeight;
            //log('offset: ' + pullDownOffset, 1);
            
            iScrollForSingleView = new iScroll( theScrollDivId, {
                                               hScroll     : false,
                                               hScrollbar  : false,
                                               vScroll     : true,
                                               vScrollbar  : false,
                                               useTransition: true,
                                               topOffset: pullDownOffset,
                                               onRefresh: function () {
                                               if (pullDownEl.className.match("loading")) {
                                               pullDownEl.className = "pull_down_of_vertical_scroll one_item_viewer_pull_down";
                                               pullDownEl.innerHTML = "Pull down to refresh...";
                                               } else if (pullUpEl.className.match("loading")) {
                                               pullUpEl.className = "pull_up_of_vertical_scroll one_item_viewer_pull_down";
                                               pullUpEl.innerHTML = "Pull up to fetch more items...";
                                               }
                                               },
                                               onScrollMove: function () {
                                               if (this.y > 5 && !pullDownEl.className.match("flip")) {
                                               pullDownEl.className = "pull_down_of_vertical_scroll one_item_viewer_pull_down flip";
                                               pullDownEl.innerHTML = "Release to refresh...";
                                               this.minScrollY = 0;
                                               } else if (this.y < 5 && pullDownEl.className.match("flip")) {
                                               pullDownEl.className = "pull_down_of_vertical_scroll one_item_viewer_pull_down";
                                               pullDownEl.innerHTML = "Pull down to refresh...";
                                               this.minScrollY = -pullDownOffset;
                                               } else if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match("flip")) {
                                               pullUpEl.className = "pull_up_of_vertical_scroll flip";
                                               pullUpEl.innerHTML = "Release to refresh...";
                                               this.maxScrollY = this.maxScrollY;
                                               } else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match("flip")) {
                                               pullUpEl.className = "pull_up_of_vertical_scroll one_item_viewer_pull_down";
                                               pullUpEl.innerHTML = "Pull up to fetch more items...";
                                               this.maxScrollY = pullUpOffset;
                                               }
                                               },
                                               onScrollEnd: function () {
                                               log('++ init one view iscroll func... ');
                                               if (pullDownEl.className.match("flip")) {
                                               pullDownEl.className = "pull_down_of_vertical_scroll one_item_viewer_pull_down loading";
                                               pullDownEl.innerHTML = "Loading...";     
                                               viewerPullDownAction( theScrollDivId, request ); // Execute custom function (ajax call?)
                                               } else if (pullUpEl.className.match("flip")) {
                                               pullUpEl.className = "pull_up_of_vertical_scroll one_item_viewer_pull_down loading";
                                               pullUpEl.innerHTML = "Loading...";       
                                               viewerPullUpAction( theScrollDivId, request ); // Execute custom function (ajax call?)
                                               }
                                               }
                                               
                                               });
            
        }
        
    } else {
        iScrollForSingleView.refresh();
        
    }
    
}

function viewerPullDownAction( theScreenDivId, itemID )
{
    log("viewerPullDownAction() pulling data");
    // Code for pull down..
    var view = theScreenDivId.split('_iscroll');
    view = view[0];
    var primary_key = "";
    var table = "";
    var fields = "";
    var fql = "";
    var network = getDataAttribValue(view, itemID, 'network');
    
    // Let's get social network so we can dispatch request:
    
    /*
     * Refreshing (pulling) the following for different types of data:
     *      - Photos & Videos : comments and likes
     *      - Newsfeed        : comments and likes
     *      - Notifications   : N/A
     *      - Messages        : new messages/replies
     *      - Birthdays       : N/A
     *      - Events          : New things on the event feed, att/maybe/declined count
     */
    
    switch(view)
    {
        case 'photoVideoViewer':
            // Left right wont work ??
            alert('photos');
            break;
            
        case 'newsfeedViewer':
            
            break;
            
        case 'notificationsViwer':
            // Nothing to do here.
            break;
            
        case 'messagesViewer':
            
            break;
            
        case 'birthdaysViewer':
            // Nothing to do here.
            break;
            
        case 'eventsViewer':
            
            fql = {
                "queryAllEvents" :
                "SELECT eid, uid, rsvp_status, start_time " +
                "FROM event_member " + 
                "WHERE uid = me() " + 
                "AND start_time > now() " +
                "AND eid = " + itemID
                ,
                "queryEventsPerItem" :
                "SELECT eid, name, location, pic_square, start_time, end_time, description, creator, host " +
                "FROM event " +
                "WHERE eid in (SELECT eid FROM #queryAllEvents)"
                ,
                "queryEventOwner" :
                "SELECT id, name " +
                "FROM profile " +
                "WHERE id IN (SELECT creator FROM #queryEventsPerItem)"
            }
            /*
             fql = {
             "queryEvent" :
             "SELECT eid, name, location, pic_square, start_time, end_time, description, creator, host " + 
             "FROM event " +
             "WHERE eid = " + itemID
             ,
             "queryEventOwner" :
             "SELECT id, name " + 
             "FROM profile " +
             "WHERE id IN (SELECT creator FROM #queryEvent)"
             }*/
            break;
    }
    
    //log("view: " + view);
    //log("itemID: " + itemID);
    //log("FQL: " + fql);
    //log('view: ' + itemID);
    
    if(network == 'facebook')
    {
        if(typeof fql == 'object')
        {
            log('FQL-a e object');
            fql = JSON.stringify(fql)
        }
        
        var res = facebookObject.graphApiRequest(view, encodeURIComponent(fql));
        //log(encodeURIComponent(fql));
        //log(escape(fql));
        res.onload = function(xhr)
        {
            //log('xhr: ' + JSON.stringify(xhr));
            //log(JSON.stringify(e), 1);
            refreshSingleViewItem(xhr, network, view, itemID);
            //populateFacebookResponse(res, false, view, true);
            
        }
        res.onreadystatechange = function(res)
        {
            log('response code/status: ' + res.readyState + '/' + res.status);
        }
        res.onerror = function(e)
        {
            log('error processing facebook viewer request: ' + e.code);
        }
    }
    
    log('-------------');
}

function viewerPullUpAction( itemID )
{
    // Code for swipe up...
    //alert('swipe up initiated');
    iScrollForSingleView.refresh();
}

/*
 * The function that inits a iScroll based on the iScroll div id .. 
 */
function initOneiScroll( theScrollDivId, dataType, setPullToRefresh ) {
    
    // init the iScroll with the items - either the row on the dashboard or the list in the separate screen .. 
    if( currentScreen == "home" ) {
        
        if( dashboardiScrolls[dataType] == false ) {
            dashboardiScrolls[dataType] = new iScroll(
                                                      theScrollDivId,
                                                      {
                                                      vScrollbar : false,
                                                      hScrollbar : false,
                                                      useTransition: true,
                                                      }
                                                      );
        }
        
    } else {
        
        if( iScrollForSeparateList != false ) {
            
            // and if we have the object already - we just refresh it .. 
            iScrollForSeparateList.refresh();
            
        } else {
            
            // and here we decide wheather we will init the iScroll with pull-to-refresh or not .. 
            if( setPullToRefresh != undefined && setPullToRefresh == false ) {
                
                iScrollForSeparateList = new iScroll( theScrollDivId , {   vScrollbar : false,
                                                     hScrollbar : false,
                                                     useTransition: true,
                                                     });
                
            } else {
                
                // we'll need some variables for the pull-to-refresh .. 
                var pullDownEl = document.getElementById("the_" + currentScreen + "_pull_down"),
                pullDownOffset = pullDownEl.offsetHeight,
                pullUpEl = document.getElementById("the_" + currentScreen + "_pull_up"),
                pullUpOffset = pullUpEl.offsetHeight;
                
                iScrollForSeparateList = new iScroll(
                                                     theScrollDivId,
                                                     {
                                                     useTransition: true,
                                                     vScrollbar: false,
                                                     hScrollbar: false,
                                                     topOffset: pullDownOffset,
                                                     onRefresh: function () {
                                                     if (pullDownEl.className.match("loading")) {
                                                     pullDownEl.className = "pull_down_of_vertical_scroll";
                                                     pullDownEl.innerHTML = "Pull down to refresh...";
                                                     } else if (pullUpEl.className.match("loading")) {
                                                     pullUpEl.className = "pull_up_of_vertical_scroll";
                                                     pullUpEl.innerHTML = "Pull up to load more...";
                                                     }
                                                     },
                                                     onScrollMove: function () {
                                                     if (this.y > 5 && !pullDownEl.className.match("flip")) {
                                                     pullDownEl.className = "pull_down_of_vertical_scroll flip";
                                                     pullDownEl.innerHTML = "Release to refresh...";
                                                     this.minScrollY = 0;
                                                     } else if (this.y < 5 && pullDownEl.className.match("flip")) {
                                                     pullDownEl.className = "pull_down_of_vertical_scroll";
                                                     pullDownEl.innerHTML = "Pull down to refresh...";
                                                     this.minScrollY = -pullDownOffset;
                                                     } else if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match("flip")) {
                                                     pullUpEl.className = "pull_up_of_vertical_scroll flip";
                                                     pullUpEl.innerHTML = "Release to refresh...";
                                                     this.maxScrollY = this.maxScrollY;
                                                     } else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match("flip")) {
                                                     pullUpEl.className = "pull_up_of_vertical_scroll";
                                                     pullUpEl.innerHTML = "Pull up to load more...";
                                                     this.maxScrollY = pullUpOffset;
                                                     }
                                                     },
                                                     onScrollEnd: function () {
                                                     if (pullDownEl.className.match("flip")) {
                                                     pullDownEl.className = "pull_down_of_vertical_scroll loading";
                                                     pullDownEl.innerHTML = "Loading...";			
                                                     pullDownAction( dataType );	// Execute custom function (ajax call?)
                                                     } else if (pullUpEl.className.match("flip")) {
                                                     pullUpEl.className = "pull_up_of_vertical_scroll loading";
                                                     pullUpEl.innerHTML = "Loading...";				
                                                     pullUpAction( dataType );	// Execute custom function (ajax call?)
                                                     }
                                                     }
                                                     }
                                                     );
                
            }
            
        }
        
    }
    
}

function loadInitialData() {
    
    // we'll load the notifications .. 
    getNotifications();
    
    // we'll load the newsfeed .. 
    getNewsfeed();
    
    // we'll load the messages .. 
    getMessages();
    
    // we'll get the photos and videos .. 
    getPhotosAndVideos();
    
    // we'll get the birthdays ..
    getBirthdays();
    
    // we'll get the events ..
    getEvents();
    
}

/*
 * This functions fire when you pull down a iScroll list .. 
 */
function pullDownAction ( request ) {
    log("pullDownAction and request is " + request + " and currentScreen is " + currentScreen);
    
    // and here we do different things, depending on the screen we are at .. 
    switch( currentScreen ) {
            
        case "home" :
            
            // we'll load the notifications .. 
            getNotifications();
            
            // we'll load the newsfeed .. 
            getNewsfeed();
            
            // we'll load the messages .. 
            getMessages();
            
            // we'll get the photos and videos .. 
            getPhotosAndVideos();
            
            // we'll get the birthdays ..
            getBirthdays();
            
            // we'll get the events ..
            getEvents();
            
            break;
            
        case "messages_screen" :
            
            // and load the messages .. 
            getMessages();
            break;
            
        case "newsfeed_screen" :
            
            // and load the newsfeed .. 
            getNewsfeed();
            break;
            
        case "notifications_screen" :
            
            // and load the notifications .. 
            getNotifications();
            break;
            
        case "photosvideo_screen":
            
            // and get the photos and videos .. 
            getPhotosAndVideos();
            break;
        case "birthdays_screen":
            
            // and get the birthdays
            getBirthdays();
            break;
        case "events_screen":
            
            // and get the events
            getEvents();
            break;
            
    }
    
    // and refresh the appropriate vertical iScroll .. 
    if( currentScreen != "home" ) {
        iScrollForWholeDashboard.refresh();
    } else {
        iScrollForSeparateList.refresh();
    }
    
}


/*
 * This functions fire when you pull up a iScroll list .. 
 */
function pullUpAction ( request ) {
    // alert( "Pulled up " + request + "..." );
}


/*
 * Attempting to init the global dashboard scroll .. 
 */
function attempToInitDashboardScroll() {
    
    if( iScrollForWholeDashboard != false ) {
        
        // if we have already inited the dashboard iScroll - we refresh it .. 
        iScrollForWholeDashboard.refresh();
        
    } else {
        
        // we'll need some variables for the pull-to-refresh .. 
        var pullDownEl = document.getElementById("the_home_screen_pull_down"),
        pullDownOffset = pullDownEl.offsetHeight,
        pullUpEl = document.getElementById("the_home_screen_pull_up"),
        pullUpOffset = pullUpEl.offsetHeight;
        
        // and if we don't have it - we create it .. 
        // together with it's callbacks and events .. 
        iScrollForWholeDashboard = new iScroll(
                                               "all_dashboard_rows_wrapper",
                                               {
                                               useTransition: true,
                                               hScrollbar: false,
                                               vScrollbar: false,
                                               topOffset: pullDownOffset,
                                               onRefresh: function () {
                                               if (pullDownEl.className.match("loading")) {
                                               pullDownEl.className = "pull_down_of_vertical_scroll";
                                               pullDownEl.innerHTML = "Pull down to refresh...";
                                               } else if (pullUpEl.className.match("loading")) {
                                               pullUpEl.className = "pull_up_of_vertical_scroll";
                                               pullUpEl.innerHTML = "Pull up to load more...";
                                               }
                                               },
                                               onScrollMove: function () {
                                               if (this.y > 5 && !pullDownEl.className.match("flip")) {
                                               pullDownEl.className = "pull_down_of_vertical_scroll flip";
                                               pullDownEl.innerHTML = "Release to refresh...";
                                               this.minScrollY = 0;
                                               } else if (this.y < 5 && pullDownEl.className.match("flip")) {
                                               pullDownEl.className = 'pull_down_of_vertical_scroll';
                                               pullDownEl.innerHTML = "Pull down to refresh...";
                                               this.minScrollY = -pullDownOffset;
                                               } else if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match("flip")) {
                                               pullUpEl.className = "pull_up_of_vertical_scroll flip";
                                               pullUpEl.innerHTML = "Release to refresh...";
                                               this.maxScrollY = this.maxScrollY;
                                               } else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match("flip")) {
                                               pullUpEl.className = "pull_up_of_vertical_scroll";
                                               pullUpEl.innerHTML = "Pull up to load more...";
                                               this.maxScrollY = pullUpOffset;
                                               }
                                               },
                                               onScrollEnd: function () {
                                               log('iscroll dashboard func... ');
                                               if (pullDownEl.className.match("flip")) {
                                               pullDownEl.className = "pull_down_of_vertical_scroll loading";
                                               pullDownEl.innerHTML = "Loading...";			
                                               pullDownAction("home");	// Execute custom function (ajax call?)
                                               } else if (pullUpEl.className.match("flip")) {
                                               pullUpEl.className = "pull_up_of_vertical_scroll loading";
                                               pullUpEl.innerHTML = "Loading...";				
                                               pullUpAction("home");	// Execute custom function (ajax call?)
                                               }
                                               }
                                               }
                                               );
    }
    
}

/*
 * Reset the dashboard scrolls .. 
 */
function resetAllScrolls() {
    
    // cycle through all the dashboard scrolls .. 
    for( i in dashboardiScrolls ) {
        
        // and refresh each one of them .. 
        if( dashboardiScrolls[i] != false ) {
            dashboardiScrolls[i].refresh();
        }
    }
    
    // and attempt to init the global dashboard iScroll .. 
    attempToInitDashboardScroll();
    
    // and unset the iScroll for the separate screen .. 
    if( iScrollForSeparateList != false ) {
        iScrollForSeparateList.destroy();
        iScrollForSeparateList = false;
    }
    
    // and unset the iScroll for the one item viewer screen .. 
    if( iScrollForSingleView != false ) {
        iScrollForSingleView.destroy();
        iScrollForSingleView = false;
    }
    
}




////////////////////////////////
// The photo upload functions .. 
////////////////////////////////


/*
 * The facebook upload functions .. 
 */
function cancelUploadPhotoToFacebook() {
    
    // null the preview image src .. 
    document.getElementById("upload_to_facebook_photo_preview").src = "img/blank_130x98.gif";
    
    // hide the loading overlay .. 
    document.getElementById("whole_screen_loading_overlay").style.display = "none";
    
    // initialize the variables for the chosen file for upload .. 
    full_path_of_file_to_upload_to_facebook = "";
    
}

/*
 * The function that takes picture from the camera .. 
 */
function takePictureWithCamera() {
    navigator.camera.getPicture(
                                previewChosenImageForUpload,
                                function(message) {
                                alert("Get picture from camera failed");
                                cancelUploadPhotoToFacebook();
                                },
                                {
                                quality: 50
                                }
                                );
}

/*
 * The function that chooses the file for upload from albums .. 
 */
function choosePhotoFromAlbums(theSource) {
    // and then we'll attempt to get the image from the camera .. 
    navigator.camera.getPicture(
                                previewChosenImageForUpload,
                                function(message) {
                                alert("Get photos library failed");
                                cancelUploadPhotoToFacebook();
                                },
                                {
                                quality: 50, 
                                destinationType: navigator.camera.DestinationType.FILE_URI,
                                sourceType: theSource
                                }
                                );
}

/*
 * The function that show the chosen or taken with camera image  .. 
 */
function previewChosenImageForUpload(imageFullPath) {
    // store the full path to the image .. 
    full_path_of_file_to_upload_to_facebook = imageFullPath;
    // and make the image point to it .. 
    document.getElementById("upload_to_facebook_photo_preview").src = full_path_of_file_to_upload_to_facebook;
}

/*
 * The function that executes when the file upload is successful .. 
 */
function uploadFileSuccess(r) {
    // console some thing with debugging purposes (r.responseCode, r.bytesSent ) .. 
    // alert("Response = " + r.response);
    
    alert( r );
    
    for( var ii in r ) {
        alert( ii );
        alert( r[ii] );
    }
    
    // initialize the variables for the chosen file for upload .. 
    full_path_of_file_to_upload_to_facebook = "";
    
    // hide the loading overlay .. 
    document.getElementById("whole_screen_loading_overlay").style.display = "none";
    
    // null the preview image src .. 
    document.getElementById("upload_to_facebook_photo_preview").src = "img/blank_130x98.gif";
    
    // and alert the response - which will be the uploaded image id .. 
    var the_response_object = JSON.parse( unescape( r.response ) );
    if( "id" in the_response_object ) {
        alert( "The uploaded image has ID " + the_response_object.id );
    }
    
}


/*
 * The function that executes when the file upload has failed .. 
 */
function uploadFileFail(error) {
    // hide the loading overlay .. 
    document.getElementById("whole_screen_loading_overlay").style.display = "none";
    // and alert the response - which will be the code of the .. 
    alert("An error has occurred: Code = " + error.code);
}


/////////////////////////////////
// The main textarea functions ..
/////////////////////////////////

/*
 * The function that pops the main textarea .. 
 */
function showTextareaForPosting(
                                the_action,
                                parameter_one,
                                parameter_two
                                ) {
    
    the_textarea_action = the_action;
    the_parameter_one = parameter_one;
    the_parameter_two = parameter_two;
    
    var headerTitle = document.getElementById("textarea_header_title");
    var camera = document.getElementById("cameraButton");
    
    // slides the div with the textarea .. 
    the_textarea_div.style.top = "40px";
    
    // and show the textarea heading bar .. 
    textarea_heading_bar.style.top = "0px";
    
    // some preliminary things we have to do .. 
    // like toggling the textarea tabs or some manipulation on the entered text ..
    switch( the_action ) {
        case "share_to_twitter" :
            setTextareaTabs("twitter_only");
            the_textarea_itself.value = parameter_one;
            break;
        case "share_to_facebook" :
            setTextareaTabs("facebook_only");
            the_textarea_itself.value = parameter_one;
            break;
        case "twitter_reply" :
            setTextareaTabs("twitter_only");
            the_textarea_itself.value = "@" + parameter_two + " ";
            break;
        case "twitter_direct_message" :
            setTextareaTabs("twitter_only");
            break;
        case "facebook_comments":
            headerTitle.innerText = "Comment";
            cameraButton.style.display = "none";
            setTextareaTabs("facebook_only");
            break;
        default:
            setTextareaTabs("both");
            break;
    }
    
    // we will focus the textarea after some time .. 
    the_textarea_itself.focus();
    
    // and set the callback - when the user clicks "done" on the device keyboard .. 
    the_textarea_itself.onblur = function() {
        //need to reset viewport here
        // reset the view port .. 
        ScreenObject.resetViewPort();
    }
    
    return false;
}

function submitButtonClicked()
{
    // trim the value from the textarea .. 
    var the_textarea_value = the_textarea_itself.value.trim();
    
    // and fire function that submits the text to somewhere .. 
    submitEnteredText(
                      the_textarea_value,
                      the_textarea_action,
                      the_parameter_one,
                      the_parameter_two
                      );    
}

/*
 * The function that do something with the entered text from the main textarea .. 
 */
function submitEnteredText(theTextareaValue, the_action, parameter_one, parameter_two) {
    
    // here we'll do the appropriate thing(s) - depending on the action .. 
    
    switch( the_action ) {
            
        case "share_to_twitter" :
        case "share_to_facebook" :
        case "update_status" :
            // first - validate the entered text .. 
            if( theTextareaValue == "" ) {
                alert("You must enter a text of the new status.");
            } else {
                // we send to facebook - if we have to and we are able .. 
                if( the_logged_user.facebookId != "" && where_we_will_post_to != "twitter_only" ) {
                    
                    facebookObject.graphApiAction( 
                                                  null, // the ID of the object we're commenting .. 
                                                  "feed",
                                                  "POST",
                                                  "message=" + escape( theTextareaValue )
                                                  );
                }
                
                // we send to twitter - if we have to and we are able .. 
                if( the_logged_user.twitterId != "" && where_we_will_post_to != "facebook_only" ) {
                    
                    twitterObject.restApiAction(
                                                null,
                                                "update",
                                                "POST",
                                                "status=" + escape( theTextareaValue )
                                                );
                }
            }
            break;
        case "facebook_comments" :
            if( theTextareaValue == "" ) {
                alert("You must enter a text of the comment.");
            } else {
                facebookObject.graphApiAction(
                                              parameter_one, // the ID of the object we're commenting .. 
                                              "comments",
                                              "POST",
                                              "message=" + escape( theTextareaValue )
                                              );
            }
            break;
        case "enter_photo_description" :
            // if we have empty description - we ask for confirmation .. 
            if( theTextareaValue == "" ) {
                alert("You can't upload the photo without description.");
            } else {
                // attempToUploadFileToFacebook(theTextareaValue);
                attempToUploadFileToTwitter(theTextareaValue);
            }
            break;
        case "tweet" :
        case "twitter_reply" :
            // if we have empty tweet - we alert a note .. 
            if( theTextareaValue == "" ) {
                alert("You must enter some text in order to tweet.");
            } else if( theTextareaValue.length > 140 ) {
                alert("You can tweet no more than 140 characters.");
            } else {
                twitterObject.restApiAction(
                                            null,
                                            "update",
                                            "POST",
                                            "status=" + escape( theTextareaValue ) + (the_action == "tweet" ? "" : "&in_reply_to_status_id=" + parameter_one)
                                            );
            }
            break;
        case "twitter_direct_message" :
            // if we have empty tweet - we alert a note .. 
            if( theTextareaValue == "" ) {
                alert("You must enter some text in order to send direct message.");
            } else if( theTextareaValue.length > 140 ) {
                alert("You can send direct message that is no more than 140 characters.");
            } else {
                twitterObject.restApiAction(
                                            null,
                                            "new",
                                            "POST",
                                            "screen_name=" + parameter_one + "&text=" + escape( theTextareaValue ),
                                            "direct_messages"
                                            );
            }
            break;
            
    }
    
    the_textarea_action = "";
    the_parameter_one = "";
    the_parameter_two = "";
    
}

/*
 * The function that hides the main textarea .. 
 */
function hideTextareaForPosting() {
    
    // first of all - we'll fix the position of the screen .. 
    ScreenObject.resetViewPort();
    
    // slides the div with the textarea .. 
    the_textarea_div.style.top = "-420px";
    
    // and show the textarea heading bar .. 
    textarea_heading_bar.style.top = "-40px";
    
    // we reset the textarea tabs .. 
    setTextareaTabs("both");
    
    // and clear the callback and the textarea value .. 
    the_textarea_itself.onblur = function() {
        return true;
    }
    
    the_textarea_itself.blur();
    the_textarea_itself.value = "";
    
}

/*
 * The function that sets where we'll be posting to - FB, TW or both .. 
 * and the textarea tabs classes .. 
 */
function setTextareaTabs(where_we_post_to) {
    
    // set the global variable .. 
    where_we_will_post_to = where_we_post_to;
    
    // and here we toggle the classes - depending on the "where" parameter .. 
    switch( where_we_post_to ) {
        case "both" :
            document.getElementById("textarea_screen_both_tab").className = "current";
            document.getElementById("textarea_screen_twitter_tab").className = "";
            document.getElementById("textarea_screen_facebook_tab").className = "";
            break;
        case "twitter" :
            document.getElementById("textarea_screen_both_tab").className = "";
            document.getElementById("textarea_screen_twitter_tab").className = "current";
            document.getElementById("textarea_screen_facebook_tab").className = "";
            break;
        case "facebook" :
            document.getElementById("textarea_screen_both_tab").className = "";
            document.getElementById("textarea_screen_twitter_tab").className = "";
            document.getElementById("textarea_screen_facebook_tab").className = "current";
            break;
        case "twitter_only" :
            document.getElementById("textarea_screen_both_tab").className = "non";
            document.getElementById("textarea_screen_twitter_tab").className = "current";
            document.getElementById("textarea_screen_facebook_tab").className = "non";
            break;
        case "facebook_only" :
            document.getElementById("textarea_screen_both_tab").className = "non";
            document.getElementById("textarea_screen_twitter_tab").className = "non";
            document.getElementById("textarea_screen_facebook_tab").className = "current";
            break;
    }
}
