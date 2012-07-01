
/*
 * Define the Template object .. 
 */
function Template()
{
    // some default code will go here .. 
}


/*
 * Define the main templates array .. 
 */
Template.prototype.templates = {};

/*
 * This function generates the template for a specific item .. 
 */
Template.prototype.generateItemsTemplate = function(requestWeHaveMade) {
    
    // predefine the tempate .. 
    var theTemplate = "",
    the_screen = currentScreen == "home" ? "home" : "screen";
    
    // and generate it, depending on the request .. 
    switch( requestWeHaveMade ) {
        
        ////////////////////////////////
        // first - the facebook cases .. 
        ////////////////////////////////
        
        // the notifications items .. 
        case "notifications" :
            theTemplate = TemplateObject.getTemplate("facebook-notification-" + the_screen);
        break;
        case "newsfeed_photos_and_videos" :
        theTemplate = TemplateObject.getTemplate("facebook-photosvideo-" + the_screen);
        break;
        // the newsfeed items .. 
        case "feed" :
        theTemplate = TemplateObject.getTemplate("facebook-newsfeed-" + the_screen);
        break;
        // the messages items .. 
        case "inbox" :
        theTemplate = TemplateObject.getTemplate("facebook-messages-" + the_screen);
        break;
        // the friends or birthdays items .. 
        case "friends" :
            theTemplate = 
                currentScreen == "friends_screen"
                ?
                TemplateObject.getTemplate("facebook-friends-screen")
                :
                theTemplate = TemplateObject.getTemplate("facebook-birthdays-" + the_screen);
        break;
        case "events" :
        theTemplate = TemplateObject.getTemplate("facebook-events-" + the_screen);
        break;
        
        
        ////////////////////////////////
        // then - the twitter cases .. 
        ////////////////////////////////
        
        case "tweets":
        theTemplate = TemplateObject.getTemplate("twitter-tweets-" + the_screen);
        break;
        case "direct_messages":
        theTemplate = TemplateObject.getTemplate("twitter-messages-" + the_screen);
        break;
        case "mentions":
        theTemplate = TemplateObject.getTemplate("twitter-mentions-" + the_screen);
        break;
        case "replies":
        theTemplate = TemplateObject.getTemplate("twitter-replies");
        break;
        case "retweet":
        theTemplate = TemplateObject.getTemplate("twitter-retweets");
        break;
        // the users items .. 
        case "users" :
            theTemplate = 
                currentScreen == "friends_screen"
                ?
                TemplateObject.getTemplate("facebook-friends-screen")
                :
                theTemplate = TemplateObject.getTemplate("facebook-birthdays-" + the_screen);
        break;
        case "favorite":
        theTemplate = TemplateObject.getTemplate("twitter-favorites");
        break;
        case "show":
        theTemplate = TemplateObject.getTemplate("twitter-show");
        break;
    }
    
    return theTemplate;
    
}

/*
 * This function gets a template from the "tpl" folder .. 
 */
Template.prototype.getTemplate = function( template_name ) {
    
    // check if we have the template already .. 
    // and if we do - we just return it .. 
    // and if we don't - we make request for it .. 
    if( TemplateObject.templates[template_name] == undefined ) {
        
        // define the variables we'll need .. 
        var req = new XMLHttpRequest(),
            url = "./tpl/" + template_name + ".html";
        
        // set the callback .. 
        req.onreadystatechange = function() {
        }
        
        // make the request .. 
        req.open("GET", url, false);
        req.send(null);
        req.onerror = function(){
            log( "Error getting the template " + template_name, 1 );
        };
        
        // store the template in the templates array .. 
        TemplateObject.templates[template_name] = req.responseText;
        
    }
    
    // and return the template .. 
    return TemplateObject.templates[template_name];
}


/*
 * Here we'll specify the list id, based on the request we have made .. 
 */
Template.prototype.specifyItemsListId = function(requestWeHaveMade) {

    // predefine the list ID .. 
    var theListId = "";
    
    // and here we'll specify the list ID .. 
    switch( requestWeHaveMade ) {
        
        ////////////////////////////////
        // first - the facebook cases .. 
        ////////////////////////////////
        
        // the notifications items .. 
        case "notifications" :
            theListId = currentScreen == "notifications_screen" ? "notifications_list" : "dashboard_notifications_list";
            break;
        case "newsfeed_photos_and_videos" :
            theListId = currentScreen == "photosvideo_screen" ? "photosvideo_list" : "dashboard_newsfeed_photos_and_videos_list";
            break;
        // the newsfeed items .. 
        case "feed" :
            theListId = currentScreen == "newsfeed_screen" ? "newsfeed_list" : "dashboard_newsfeed_list";
            break;
        // the messages items .. 
        case "inbox" :
            theListId = currentScreen == "messages_screen" ? "messages_list" : "dashboard_messages_list";
            break;
        // the friends items .. 
        case "friends" :
            theListId = 
                currentScreen == "friends_screen"
                ?
                "friends_list"
                :
                (
                    currentScreen == "birthdays_screen"
                    ?
                    "birthdays_list"
                    :
                    "dashboard_birthdays_list"
                );
            break;
        case "events" :
            theListId = currentScreen == "events_screen" ? "events_list" : "dashboard_events_list";
            break;
        
        ////////////////////////////////
        // then - the twitter cases .. 
        ////////////////////////////////
        
        case "tweets":
            theListId = currentScreen == "newsfeed_screen" ? "newsfeed_list" : "dashboard_newsfeed_list";
            break;
        case "direct_messages":
            theListId = currentScreen == "messages_screen" ? "messages_list" : "dashboard_messages_list";
            break;
        case "mentions":
            theListId = currentScreen == "notifications_screen" ? "notifications_list" : "dashboard_notifications_list";
        	break;
        case "favorite":
            theListId = "twitter_items_list";
            break;
        case "users" :
            theListId = 
                currentScreen == "friends_screen"
                ?
                "friends_list"
                :
                (
                    currentScreen == "birthdays_screen"
                    ?
                    "birthdays_list"
                    :
                    "dashboard_birthdays_list"
                );
            break;
        case "show":
            theListId = "twitter_items_list";
            break;
    }
    
    return theListId;
}

/*
 * Specify the ID of the div for the scroll feature .. 
 */
Template.prototype.specifyScrollDivId = function( requestWeHaveMade ) {
    
    // preefine the scroll div id .. 
    var theScrollDivId = "";
    
    // and specify it, depending on the request we have made .. 
    switch( requestWeHaveMade ) {
        
        ////////////////////////////////
        // first - the facebook cases .. 
        ////////////////////////////////
        
        case "notifications" :
            theScrollDivId = currentScreen == "notifications_screen" ? "the_notifications_screen_wrapper_div" : "the_dashboard_notifications_row";
            break;
        case "feed" :
            theScrollDivId = currentScreen == "newsfeed_screen" ? "the_newsfeed_screen_wrapper_div" : "the_dashboard_newsfeed_row";
            break;
        case "newsfeed_photos_and_videos" :
            theScrollDivId = currentScreen == "photosvideo_screen" ? "the_photosvideo_screen_wrapper_div" : "the_dashboard_newsfeed_photos_and_videos_row";
            break;
        case "inbox" :
            theScrollDivId = currentScreen == "messages_screen" ? "the_messages_screen_wrapper_div" : "the_dashboard_messages_row";
            break;
        case "friends" :
            theScrollDivId =
                currentScreen == "friends_screen"
                ?
                "the_friends_wrapper_div"
                :
                (
                    currentScreen == "birthdays_screen"
                    ?
                    "the_birthdays_screen_wrapper_div"
                    :
                    "the_dashboard_birthdays_row"
                );
        break;
        case "events" :
            theScrollDivId = currentScreen == "events_screen" ? "the_events_screen_wrapper_div" : "the_dashboard_events_row";
            break;

        ////////////////////////////////
        // then - the twitter cases .. 
        ////////////////////////////////
        
        case "tweets":
            theScrollDivId = currentScreen == "newsfeed_screen" ? "the_newsfeed_screen_wrapper_div" : "the_dashboard_newsfeed_row";
            break;
        case "direct_messages":
            theScrollDivId = currentScreen == "messages_screen" ? "the_messages_screen_wrapper_div" : "the_dashboard_messages_row";
            break;
        case "mentions":
            theScrollDivId = currentScreen == "notifications_screen" ? "the_notifications_screen_wrapper_div" : "the_dashboard_notifications_row";
            break;
        case "favorite":
            theScrollDivId = "the_twitter_items_wrapper_div";
            break;
        case "users" :
            theScrollDivId =
                currentScreen == "friends_screen"
                ?
                "the_friends_wrapper_div"
                :
                (
                    currentScreen == "birthdays_screen"
                    ?
                    "the_birthdays_screen_wrapper_div"
                    :
                    "the_dashboard_birthdays_row"
                );
            break;
        case "show":
            theScrollDivId = "the_twitter_items_wrapper_div";
            break;
    }
    
    return theScrollDivId;
}

/*
 * Specify the ID of the total element .. 
 */
Template.prototype.specifyTotalElementId = function( requestWeHaveMade ) {
    
    // predefine the id of the total element .. 
    var theTotalElementId = "";
    
    // and specify it, depending on the request we have made .. 
    switch( requestWeHaveMade ) {
        
        ////////////////////////////////////
        // the facebook and twitter cases ..
        ////////////////////////////////////
        
        case "notifications" :
        case "mentions" :
            theTotalElementId = "notifications_total";
            break;
        case "feed" :
        case "tweets" :
            theTotalElementId = "newsfeed_total";
            break;
        case "newsfeed_photos_and_videos" :
            theTotalElementId = "newsfeed_photos_and_videos_total";
            break;
        case "inbox" :
        case "direct_messages" :
            theTotalElementId = "messages_total";
            break;
        case "friends":
            theTotalElementId = "birthdays_total";
            break;
        case "events":
            theTotalElementId = "events_total";
            break;
    }
    
    return theTotalElementId;
    
}

/*
 * Specify the ID of the requested viewer:
 */
Template.prototype.specifyViewerListId = function(view) {
    
    var viewerDivId = "";

    switch(view)
    {
        case 'eventsViewer':
            viewerDivId = "eventsViewer_list";
            break;
        default:
            viewerDivId = "NA";
            log('Template.specifyViewerDivId() error! Value: ' + viewerDivId);
            break;
    }

    return viewerDivId;

}