

/*
 *
 * The whole logic of the application ... 
 *
 */



/*
 * Twitter functions .. 
 */
function connectToTwitter() {
    
    // attempt to get the local storage token .. 
    twitterLocalAccessToken = window.localStorage.getItem("twitter_token");
    
    // do the facebook connect - if we haven't yet .. 
    if( twitterObject == undefined ) {
        twitterObject = TwitterConnect.install();
    }
    
    // and then we show/hide the buttons and attemp to get the access token .. 
    if( twitterLocalAccessToken != null ) {
        // alert( "Twitter from local: " + twitterLocalAccessToken );
    } else {
        // and if we don't have the access token - we attempt to request it .. 
        twitterObject.requestAccessToken();
    }
    
}

function twitterLocationChanged(loc, requestToken, accessor) {
    twitterObject.onLocationChange(loc, requestToken, accessor);
}

// the function that pulls twitter data .. 
// we can pass listItems and listId - if we have already data and
// we have to populate twitter data along with other data .. 
function twitterRequest(
    request,
    listItems,
    listId,
    theScrollDivId,
    theTotalElementId,
    specificCallback,
    itemsForSpecificCallback
) {
    
    var requestType, requestUrl = twitterApiUrl;
    
    // set the variables/parameters for the request .. 
    switch( request ) {
        case "tweets":
            // define the newsfeed parameters .. 
            // (we include entities cause we'll get the photos from Twitter from the home timeline) .. 
            requestType = "tweets";
            requestUrl += "statuses/home_timeline.json?include_entities=true" + (last_items_parameters.tweets != undefined ? "&since_id=" + last_items_parameters.tweets : "");
            break;
        case "mentions":
            requestType = "mentions";
            requestUrl += "statuses/mentions.json" + (last_items_parameters.mentions != undefined ? "?since_id=" + last_items_parameters.mentions : "");
            break;
        case "direct_messages":
            requestType = "direct_messages";
            requestUrl += "direct_messages.json" + (last_items_parameters.direct_messages != undefined ? "?since_id=" + last_items_parameters.direct_messages : "");
            break;
        case "favorite":
            requestType = "favorite";
            requestUrl += "favorites.json";
            break;
        case "followers/ids":
            requestType = "followers";
            requestUrl += "followers/ids.json";
            break;
        case "users/lookup":
            requestType = "users";
            requestUrl += "users/lookup.json?user_id=" + itemsForSpecificCallback;
            break;
        case "view":
            requestType = "view";
            requestUrl += "view.json";
            alert("Under construction.");
            break;
    }
    
    // and make the request itself .. 
    twitterObject.restApiRequest(
        requestType,
        requestUrl,
        "GET",
        {},
        listItems,
        listId,
        theScrollDivId,
        theTotalElementId,
        specificCallback
    );
}


function populateTwitterResponse(
    requestWeHaveMade,
    twitterObjectsArray,
    facebookListItems,
    listId,
    theScrollDivId,
    theTotalElementId
) {
    
    var template = "", arrayWithPopulatedTemplates = [],
    oneTwitterItem, oneItemParameter;
    
    // generate the template - depending on the type of the request .. 
    template = TemplateObject.generateItemsTemplate(requestWeHaveMade);
    
    // and here we'll specify the list id - where we'll populate the results .. 
    theListId = listId != undefined ? listId : specifyItemsListId(requestWeHaveMade);
    
    // we make sure facebookListItems is array .. 
    if( facebookListItems == undefined ) {
        facebookListItems = [];
    }
    
    // here we cache the data .. 
    cachePulledDataInArrays(
        requestWeHaveMade,
        facebookListItems,
        twitterObjectsArray
    );

    // cycle through the data items and generate the array with populated templates .. 
    // or through one data object and populate it's template only .. 
    if( requestWeHaveMade != "show" ) {
        
        // and here we populate the items .. 
        cycleObjectsAndPopulateItems(
            requestWeHaveMade,
            defineDataArraysForCaching( requestWeHaveMade, currentScreen != "home" ? separated_screen_data_type : "both" ),
            null,
            template,
            theListId,
            theScrollDivId,
            theTotalElementId
        );
        
    } else {
        
        // populate the item template .. 
        // (here we'll have array with two elements - the result HTML and the count - wchich will be 1 ... )
        template = cycleDataObjects(
            defineDataArraysForCaching( requestWeHaveMade ),
            template
        )[0];
        
        // and insert the result HTML .. 
        document.getElementById(listId).innerHTML = template;
        
    }
    
}

/*
 * The function that tries to upload a file to twitter .. 
 */
function attempToUploadFileToTwitter(photo_description) {
    
    // (pre)define the variables we'll use .. 
    var allow_upload = true,
    photo_upload_options,
    photo_upload_additional_options,
    photo_upload_object,
    photo_description = photo_description.trim(),
    message,
    auth_string = "";
    
    // here we'll check if we have everything we need .. 
    if( full_path_of_file_to_upload_to_facebook == "" ) {
        alert("Please choose a file before the upload.");
        allow_upload = false;
    } else if( photo_description == "" ) {
        showTextareaForPosting("enter_photo_description");
        allow_upload = false;
    }
    
    // and if we can upload - then we process .. 
    if( allow_upload ) {
        
        // hide the textarea for posting .. 
        hideTextareaForPosting();
        
        // show the loading overlay .. 
        document.getElementById("whole_screen_loading_overlay").style.display = "block";
        
        // predefine the message object - we'll use it in the authentication .. 
        message = {
        method: "POST",
        action: twitterPhotoUploadUrl,
        parameters: "status=" + escape(photo_description)
        };
        
        // we'll need the OAuth headers preparation .. 
        OAuth.completeRequest(
                              message,
                              {
                              consumerKey: twitterConsumerKey,
                              consumerSecret: twitterConsumerSecret,
                              token: window.localStorage.getItem("twitter_token"),
                              tokenSecret: window.localStorage.getItem("twitter_secret_token")
                              }
                              );
        
        // and we'll generate the authorization header(s) for the request .. 
        auth_string = OAuth.getAuthorizationHeader("", message.parameters);
        
        // here we'll build the request object and it's parameters .. 
        photo_upload_options = new FileUploadOptions();
        photo_upload_options.fileKey = "media";
        photo_upload_options.fileName = "NEW.PHOTO.png";
        photo_upload_options.mimeType = "image/png";
        
        // here we'll prepare the additional parameters .. 
        // (i.e. - additional POST data) .. 
        photo_upload_options.params = new Object();
        // the status (or the tweet text) .. 
        photo_upload_options.params.status = photo_description;
        // and then the header(s) - we'll need them for the authentication .. 
        photo_upload_options.params.headers = {
            "oauth_consumer_key" : twitterConsumerKey,
            "oauth_nonce" : message.parameters["oauth_nonce"],
            "oauth_signature_method" : "HMAC-SHA1",
            "oauth_token" : window.localStorage.getItem("twitter_token"),
            "oauth_timestamp" : message.parameters["oauth_timestamp"],
            "oauth_version" : "1.0",
            "Authorization" : auth_string
        };
        
        // and the file upload itself .. 
        photo_upload_object = new FileTransfer();
        
        photo_upload_object.upload(
                                   full_path_of_file_to_upload_to_facebook,
                                   twitterPhotoUploadUrl,
                                   uploadFileSuccess,
                                   uploadFileFail,
                                   photo_upload_options
                                   );
    }
}

/*
 * The function that loggs out from twitter .. 
 */
function logoutFromTwitter() {
    // remove the logged in twitter user data .. 
    window.localStorage.removeItem("twitter_user_id");
    window.localStorage.removeItem("twitter_user_name");
    window.localStorage.removeItem("twitter_token");
    window.localStorage.removeItem("twitter_secret_token");
    // show the twitter button in the place of the logged twitter user data .. 
    document.getElementById("add_twitter_account_div").innerHTML = "<button onclick=\"connectToTwitter()\"><img src=\"img/twitter_icon_small.png\" alt=\"\" />Twitter</button>";
    // and alert the notification for this .. 
    alert("You successfully logged out from twitter.");
}


/*
 * Facebook functions .. 
 */
function connectToFacebook( showHomePage ) {
    
    // we'll mark that we have to show dashboard after we connect and have the user .. 
    if( showHomePage != undefined && showHomePage != null ) {
        showDashboardAfterStoreUser = true;
    }
    
    // do the facebook connect - if we haven't yet .. 
    if( facebookObject == undefined ) {
        facebookObject = FBConnect.install();
        facebookObject.connect(facebookApplicationId, redir_url, "touch");
        facebookObject.onConnect = onFacebookConnect;
    } else {
        onFacebookConnect();
    }
}

function onFacebookConnect() {
    
    // predefine some elements .. 
    var facebook_user_data_request,
        facebookUser = window.localStorage.getItem("facebook_user_data");
    
    if( facebookUser == null ) {

        // we don't have the user in the local storage - we make request to get it and store it .. 
        facebook_user_data_request = facebookObject.graphApiRequest("");
        facebook_user_data_request.onload = storeFacebookUser;

    } else {

        // store the user in the variable .. 
        stored_facebook_user_data = facebookUser;

        // and if we have to show the dashboard - we do so .. 
        if( showDashboardAfterStoreUser ) {

            showDashboardAfterStoreUser = false;

            ScreenObject.showScreenById("home");

            loadInitialData();
            
        } else if( currentScreen == "login" ) {

            UserObject.showFacebookUserData();

        }
        
    }
    //alert(typeof window.plugins.childBrowser);
    //window.plugins.childBrowser.close();
    if(window.plugins.childBrowser) {
        
        window.plugins.childBrowser.close();
    }
}

function storeFacebookUser( evt ) {
    
    // parse the result JSON .. 
    var resultJson = JSON.parse(evt.target.responseText);
    
    // and store the user data - of course, if we have the appropriate data .. 
    if( "id" in resultJson && "name" in resultJson ) {
        // store the user in the variable .. 
        stored_facebook_user_data = JSON.stringify( resultJson );
        // store the user in the local storage .. 
        window.localStorage.setItem( "facebook_user_data", stored_facebook_user_data );
        // and if we have to show the dashboard - we do so .. 
        if( showDashboardAfterStoreUser ) {
            showDashboardAfterStoreUser = false;
            ScreenObject.showScreenById("home");
        } else if( currentScreen == "login" ) {
            UserObject.showFacebookUserData();
        }
    }
}

/* Helper functions when working with "data-" attributes: */
function getDataAttribValue(view, itemid, attr)
{
    var el = document.getElementById(view + '_' + itemid);
    var dataValue = el.getAttribute('data-' + attr);
    if(dataValue != null)
        return dataValue;
    else
    {
        log('no such attribute: data-' + attr);
        return null;
    }
}

function refreshSingleViewItem(xhr, network, view, itemID)
{
    // log(view, 1);
    // log(JSON.stringify(xhr), 1);
    //log(network);
    // Separating the logic depending on the network type:
    log('__refreshSingleViewItem');
    if(network == 'facebook')
    {
        log('fb v refreshSingleViewItem()');
        var json = JSON.parse(xhr.target.responseText);
        //log(typeof json);
        //var json = "";
        //log("json: " + json, 1);
        //view = xhr.target.the_request_name;
        var typeOfRequest = xhr.target.the_request_type;
        //var typeOfRequest = "";
        //log('typeofrequest: ' + typeOfRequest, 1);

        if(typeof json.data == 'undefined')
        {
            var json2 = json;
            json = { data : json2 };
            json2 = null;
        }

        json = DataManipulator.preliminaryActions( view, json );

        switch(view)
        {
            case 'eventsViewer':

                setEventItem(json);

                var oneItem = getEventItem(itemID);

                log(JSON.stringify(oneItem));

                ScreenObject.showView('eventsViewer', oneItem.eid, getEventItem);

                setEventRSVP(oneItem.rsvp_status, oneItem.eid);

                // and refresh the item viewer scroll .. 
                initOneViewiScroll( view + "_iscroll" );
                
                //getEventFeed(oneItem.eid);

                break;
        }

    } // endif network == facebook
    else if (network == 'twitter')
    {

    } // endif network == twitter
    else
    { // if everything else fails
        log('Network specification error. Value is: ' + network);
    }

    iScrollForSingleView.refresh();

}


function populateFacebookResponse( evt, localStorageVariable, theRequestWeHaveMade, postOnlyFacebookData ) {
    // define the variables .. 
    //log("Event: " + evt + 
    //    "\nlocalStorageVariable: " + localStorageVariable +
    //    "\ntheRequestWeHaveMade: " + theRequestWeHaveMade +
    //    "\npostOnlyFacebookData: " + postOnlyFacebookData );
    var json, 
        arrayWithPopulatedTemplates = [], 
        oneItem,
        requestWeHaveMade, 
        typeOfRequest, 
        template, 
        theListId, 
        theListElement, 
        theScrollDivId, 
        theTotalElementId,
        n, i, j,
        stored_facebook_user_info = stored_facebook_user_data != undefined ? JSON.parse( stored_facebook_user_data ) : false,
        postOnlyFacebookData = postOnlyFacebookData == undefined ? false : postOnlyFacebookData;
    // and here we'll check if we have to take the data from the local storage .. 
    // or we'll have to make a request .. 
//console.log("[EVENT OBJECT]: " + JSON.stringify(evt));
    if( evt == false ) {
        
        // parse the result JSON .. 
        json = JSON.parse(localStorageVariable);
        
        // and the request we've made .. 
        requestWeHaveMade = theRequestWeHaveMade;
        
    } else {
        
        // parse the result JSON .. 
        //if(evt.target.the_request_name == 'events')
            //log( evt.target.the_request_name + " :: " + evt.target.responseText, 1);
        json = JSON.parse(evt.target.responseText);
        
        // and the request we've made .. 
        requestWeHaveMade = evt.target.the_request_name;
        
        // and the type of the request we've made .. 
        typeOfRequest = evt.target.the_request_type;
        
        // and if we have fql requests - we make the response object the same as the graph api ones .. 
        if( typeof json.data == 'undefined' ) {
            var json2 = json;
            json = { data : json2 };
            json2 = undefined;
        }
        
        // and for the facebook friends - we'll store the items in the local storage .. 
        if( requestWeHaveMade == "friends" ) {
            // and here we'll store the facebook friends to the local storage .. 
            // window.localStorage.setItem("facebook_friends", JSON.stringify(json));
        }
        
        if(requestWeHaveMade == "events") {
            postOnlyFacebookData = true;
        }

        // and make preliminary actions for some of the data we've pulled .. 
        json = DataManipulator.preliminaryActions( requestWeHaveMade, json );

    }
    //if(requestWeHaveMade == "events")
        //log("JSON: " + JSON.stringify(json), 1);
    // we'll specify the template .. 
    template = TemplateObject.generateItemsTemplate(requestWeHaveMade);

    // and here we'll specify the list id - where we'll populate the results .. 
    theListId = TemplateObject.specifyItemsListId(requestWeHaveMade);
    
    // and here we'll specify the scroll div id - on which we'll init the scroll .. 
    theScrollDivId = TemplateObject.specifyScrollDivId(requestWeHaveMade);
    
    // and here we'll specify the id of the element which shows the total items count ..
    theTotalElementId = TemplateObject.specifyTotalElementId(requestWeHaveMade);
    
    //if(requestWeHaveMade == 'events')
    //    log("template: " + template + "\ntheListId: " + theListId + "\ntheScrollDivId: " + theScrollDivId, 1);
    // and if we have to use the facebook data only - we proceed here .. 
    if( the_logged_user.twitterId == "" || postOnlyFacebookData ) {
        
        // cache the data .. 
        cachePulledDataInArrays( requestWeHaveMade, json.data, [] );
        
        // and here we populate the items .. 
        cycleObjectsAndPopulateItems(
            requestWeHaveMade,
            defineDataArraysForCaching( requestWeHaveMade ),
            null,
            template,
            theListId,
            theScrollDivId,
            theTotalElementId
        );
        
    } else {
        
        // and here we'll call the corresponding twitter method
        // passing the list items, the list id,
        // the scroll div id and the total element id .. 
        var corresponginTwitterRequest = "",
            specificCallback;
        switch( requestWeHaveMade ) {
            case "feed" :
                corresponginTwitterRequest = "tweets";
                break;
            case "notifications" :
                corresponginTwitterRequest = "mentions";
                break;
            case "inbox" :
                corresponginTwitterRequest = "direct_messages";
                break;
            case "friends" :
            case "birthdays" :
                corresponginTwitterRequest = "followers/ids";
                specificCallback = getTwitterUsersByIds;
                break;
            case "newsfeed_photos_and_videos" :
                // for the photos and videos - we just set the flag that we have the facebook items pulled ..
                facebook_items_with_media_taken = true;
                // store the facebook items themselves .. 
                facebook_items_with_media = json.data;
                // and attempt to populate the photos and videos .. 
                attempToPopulatePhotosAndVideos();
                break;
        }
        
        if( corresponginTwitterRequest != "" ) {
            twitterRequest(
                corresponginTwitterRequest,
                json.data,
                theListId,
                theScrollDivId,
                theTotalElementId,
                specificCallback
            );
        }
        
    }
}

/*
 * The function that attempts to show both FB and TW photos .. 
 */
function attempToPopulatePhotosAndVideos() {
    
    // and if we have both FB and TW photos - we show them .. 
    if( twitter_items_with_media_taken && facebook_items_with_media_taken ) {
        populateTwitterResponse(
            "newsfeed_photos_and_videos",
            twitter_items_with_media,
            facebook_items_with_media,
            TemplateObject.specifyItemsListId("newsfeed_photos_and_videos"),
            TemplateObject.specifyScrollDivId("newsfeed_photos_and_videos"),
            TemplateObject.specifyTotalElementId("newsfeed_photos_and_videos")
        );
    }
}



/*
 * The function that tries to upload a file to facebook .. 
 */
function attempToUploadFileToFacebook(photo_description) {
    
    // (pre)define the variables we'll use .. 
    var allow_upload = true,
    facebook_photo_upload_options,
    facebook_photo_upload_additional_options,
    facebook_photo_upload_object,
    facebook_photo_upload_url = photo_to_facebook_upload_url+facebookObject.accessToken,
    facebook_photo_description = photo_description;
    
    // here we'll check if we have everything we need .. 
    if( full_path_of_file_to_upload_to_facebook == "" ) {
        alert("Please choose a file before the upload.");
        allow_upload = false;
    } else if( facebook_photo_description.trim() == "" ) {
        showTextareaForPosting("enter_photo_description");
        allow_upload = false;
    }
    
    // and if we can upload - then we process .. 
    if( allow_upload ) {
        
        // hide the textarea for posting .. 
        hideTextareaForPosting();
        
        // show the loading overlay .. 
        document.getElementById("whole_screen_loading_overlay").style.display = "block";
        
        // here we'll build the request object and it's parameters .. 
        facebook_photo_upload_options = new FileUploadOptions();
        facebook_photo_upload_options.fileKey = "source";
        facebook_photo_upload_options.fileName = "NEW.PHOTO.png";
        facebook_photo_upload_options.mimeType = "image/png";
        
        // here we'll prepare the additional parameters .. 
        // (i.e. - additional POST data) .. 
        facebook_photo_upload_options.params = new Object();
        facebook_photo_upload_options.params.message = facebook_photo_description;
        
        // and the file upload itself .. 
        facebook_photo_upload_object = new FileTransfer();
        
        facebook_photo_upload_object.upload(
                                            full_path_of_file_to_upload_to_facebook,
                                            facebook_photo_upload_url,
                                            uploadFileSuccess,
                                            uploadFileFail,
                                            facebook_photo_upload_options
                                            );
    }
}


/*
 * The function that loggs out from facebook .. 
 */
function logoutFromFacebook() {
    // remove the logged in facebook user data .. 
    window.localStorage.removeItem("facebook_user_data");
    // show the facebook button in the place of the logged facebook user data .. 
    document.getElementById("add_facebook_account_div").innerHTML = "<button onclick=\"connectToFacebook()\"><img src=\"img/fb_icon_small.png\" alt=\"\" />Facebook</button>";
    // and alert the notification for this .. 
    alert("You successfully logged out from facebook.");
}


/*
 * The global app functions .. 
 */
function onDeviceReady() {
    
    // create the screen object .. 
    ScreenObject = new Screen();
    
    // the user object .. 
    UserObject = new User();
    
    // the template object .. 
    TemplateObject = new Template();

    // the data manipulator object .. 
    DataManipulator = new DataManipulator();
    
    // make sure we have the ChildBrowser installed .. 
    if( window.plugins.childBrowser == null ) {
        window.plugins.childBrowser = ChildBrowser.install();
    }
    
    // we'll want to have the commong textarea and it's div in variables .. 
    the_textarea_div = document.getElementById("textarea_for_posting_wrapper"),
    the_textarea_itself = document.getElementById("textarea_for_posting");
    footer_bar = document.getElementById("footer_bar");
    heading_bar = document.getElementById("heading_bar");
    textarea_heading_bar = document.getElementById("textarea_heading_bar");
    var theExpandedMenu = document.getElementById("expanded_menu");
    
    if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i)) {
        log("iphone");
    }     
    
    
    
    
    // we'll need to check the internet connectivity .. NOTE BIG NOTE THIS DOESN"T WORK IN SIMULATOR ON WINDOWS PHONE
    if( navigator.network.connection.type != "unknown" && navigator.network.connection.type != "none" ) {
        // and if we have connection - we show the dashboard .. 
        ScreenObject.showScreenById("login");
    } else {
        // otherwise we show the no internet connection screen .. 
        ScreenObject.showScreenById("no_internet");
    } 
    
    // and we'll define the sources for the photo - camera, albums lirary, etc .. 
    pictureSource = navigator.camera.PictureSourceType;
    
}

function onBodyLoad() {
    // add some events handlers - for the iScroll and the application itself .. 
    document.addEventListener("touchmove", function (e) { e.preventDefault(); }, false);
    document.addEventListener("deviceready", onDeviceReady, false);
    
}


/*
 * Some test/debug functions .. 
 */
function clearRegisteredUsers() {
    var resultOfConfirm = confirm("Really delete all users?");
    if( resultOfConfirm ) {
        window.localStorage.removeItem("registered_users");
        alert("The registered users have been cleared.");
    }
}



function showRegisteredUsers() {
    alert( JSON.stringify(window.localStorage.getItem("registered_users")) );
}
function showLoggedUser() {
    alert( JSON.stringify( the_logged_user ) );
}
function reConnectToFacebook() {
    alert( '1' );
    alert( window.plugins.childBrowser );
    alert( facebook_new_login_url );
    window.plugins.childBrowser.showWebPage(facebook_new_login_url);
	// window.plugins.childBrowser.onLocationChange = function(loc){self.onLocationChange(loc);};
}

function alertFriends() {
    alert( facebook_friends_array.length + "\n" + facebook_friends_array );
    alert( twitter_friends_array.length + "\n" + twitter_friends_array );
    alert( total_friends_array.length + "\n" + total_friends_array );
}

function showAllDashboardiScrolls() {
    for( var ii in dashboardiScrolls ) {
        alert( ii );
        alert( dashboardiScrolls[ii] );
    }
}




