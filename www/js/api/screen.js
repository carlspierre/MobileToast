
/*
 * Define the Screen object .. 
 */
function Screen()
{
    // some default code will go here .. 
}


///////////////////////////
// The screens functions .. 
///////////////////////////


/*
 * The function that shows a screen by its ID .. 
 */
Screen.prototype.showScreenById = function(newScreenId, objectId) {
    log("new screen id is " + newScreenId);
    
    // make sure the textarea is not visible / active .. 
    hideTextareaForPosting();
    
    //hide expanded menu
    var theExpandedMenu = document.getElementById("expanded_menu"); 
    theExpandedMenu.style.bottom = "-365px";
    
    // and check if we've selected different from the current screen .. 
    if( currentScreen != newScreenId ) {
        // we make the transition to the new screen .. 
        newScreenElement = document.getElementById(newScreenId);
        oldScreenElement = document.getElementById(currentScreen);
        newScreenElement.style.left = "0px";
        oldScreenElement.style.left = "-365px";
        
        // store the new screen as the current screen .. 
        oldScreen = currentScreen;
        currentScreen = newScreenId;
        
        // and start the initial screen action(s) .. 
        ScreenObject.initialScreenAction(objectId);
    }
}

/*
 * The function(s) that show and hide the footer bar .. 
 */
Screen.prototype.hideFooterBar = function() {
    footer_bar.style.display = "none";
    var theExpandedMenu = document.getElementById("expanded_menu");
    theExpandedMenu.style.display = "none";       
}
Screen.prototype.showFooterBar = function() {
    footer_bar.style.display = "block";
    footer_bar.style.bottom = "-1px";
    var theExpandedMenu = document.getElementById("expanded_menu");
    theExpandedMenu.style.display = "block";   
    theExpandedMenu.style.bottom = "-365px";
}

Screen.prototype.showScreen = function(screenId) {
    var headerTitle = document.getElementById('header_title');
    headerTitle.innerHTML = "";
    headerTitle.innerHTML = screenByObjectId[screenId];

    document.getElementById("header_left_button").setAttribute("onclick", "ScreenObject.showScreenById('home')");
}

Screen.prototype.showView = function(viewKey, objectId, callbackFunction) {
    
    ScreenObject.hideFooterBar();
    
    var headerTitle = document.getElementById('header_title');
    headerTitle.innerHTML = screenByObjectId[viewKey];
    //alert(viewKey);
    
    var oneItem = callbackFunction(objectId);

    //log('oneItem: ' + JSON.stringify(oneItem));
    var template = "<li>" + TemplateObject.getTemplate(viewKey) + "</li>";
    
    var filledTemplate = populateItemTemplate( viewKey, template, oneItem );
    
    //first clear out old if there
    document.getElementById( viewKey + "_list" ).innerHTML = "";
    
    document.getElementById( viewKey + "_list" ).innerHTML = filledTemplate;  
    
    if(oldScreen == "home") {
        document.getElementById("header_left_button").setAttribute("onclick", "ScreenObject.showScreenById('home')");
    } else {
        var click = "ScreenObject.showScreenById('" + oldScreen + "')";
        document.getElementById("header_left_button").setAttribute("onclick", click);
    }
    
    initOneViewiScroll( viewKey + "_iscroll", objectId );
    
    return oneItem;
}

/*
 * The initial action that must be executed when a screen shows .. 
 */
Screen.prototype.initialScreenAction = function(objectId) {
    log("initialScreenAction object is " + objectId);
    
    // reset the view port .. 
    ScreenObject.resetViewPort();
    
    // predefine some flags .. 
    var headerTitle = document.getElementById("header_title");
    
    // and for the login and dashboard screens - we'll hide the heading bar .. 
    // and for all the other - we'll show it .. 
    if( currentScreen == "login") {
        heading_bar.style.top = "-40px";        
        ScreenObject.hideFooterBar();
    } else if(currentScreen == "home") {
        heading_bar.style.top = "-40px"; 
        ScreenObject.showFooterBar();
    } else {
        heading_bar.style.top = "0";
    }

    console.log( "Current screen is :::::: " + currentScreen );

    //alert(objectId);
    // and here we do different things, depending on the screen we are at .. 
    switch( currentScreen ) {
            
        case "home" :
            
            // set the title .. 
            headerTitle.innerHTML = "Dashboard";
            
            // and attempt to init the global dashboard iScroll .. 
            resetAllScrolls();
            
            // we have to reset some variables .. 
            /*twitter_items_with_media = [];
             facebook_items_with_media = [];
             twitter_items_with_media_taken = false;
             facebook_items_with_media_taken = false;
             
             // we'll reset all the iScrolls .. 
             resetAllScrolls();
             
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
             getEvents();*/
            
            break;
            
        case "friends_screen" :
            ScreenObject.showScreen(currentScreen, getFriends);
            break;
            
        case "upload_photo_to_facebook" :
            
            // set the title .. 
            headerTitle.innerHTML = "Upload to facebook";
            
            // specific things for the upload photo screen .. 
            break;
            
        case "messages_screen" :
            ScreenObject.showScreen(currentScreen);
            break;
            
        case "newsfeed_screen" :
            ScreenObject.showScreen(currentScreen);
            break;
            
        case "notifications_screen" :
            ScreenObject.showScreen(currentScreen);
            break;
            
        case "photosvideo_screen":
            ScreenObject.showScreen(currentScreen);
            break;
            
        case "birthdays_screen" :
            ScreenObject.showScreen(currentScreen);
            break;
            
        case "events_screen" :
            ScreenObject.showScreen(currentScreen);
            // getEvents() works. But we need to pull from cache (TODO)
            //getEvents();
            break;
            
        case "birthdaysViewer":
            
            ScreenObject.hideFooterBar();
            
            headerTitle.innerHTML = "Birthdays";
            
            var birthdayItem = getFriendsItem(objectId);
            
            var template = "<li>" + TemplateObject.getTemplate("birthdaysViewer") + "</li>";
            
            var filledTemplate = populateItemTemplate( "birthdaysViewer", template, birthdayItem );
            
            document.getElementById("birthdaysViewer_list").innerHTML = filledTemplate;  
            
            if(oldScreen == "home") {
                document.getElementById("header_left_button").setAttribute("onclick", "ScreenObject.showScreenById('home')");
            } else {
                document.getElementById("header_left_button").setAttribute("onclick", "ScreenObject.showScreenById('birthdays_screen')");
            }
            
            break;
            
        case "eventsViewer":
            var eventItem = ScreenObject.showView(currentScreen, objectId, getEventItem);
            //log(eventItem, 1);
            setEventRSVP(eventItem.rsvp_status, eventItem.id);

            getEventFeed(objectId);
            /*
             ScreenObject.hideFooterBar();
             
             headerTitle.innerHTML = "Events Viewer";
             
             var eventItem = getEventItem(objectId);
             
             var template = "<li>" + TemplateObject.getTemplate("eventsViewer") + "</li>";
             
             var filledTemplate = populateItemTemplate( "events", template, eventItem );
             
             document.getElementById("eventsViewer_list").innerHTML = filledTemplate;
             
             if(oldScreen == "home") {
             document.getElementById("header_left_button").setAttribute("onclick", "ScreenObject.showScreenById('home')");
             } else {
             document.getElementById("header_left_button").setAttribute("onclick", "ScreenObject.showScreenById('events_screen')");
             }
             
             setEventRSVP(eventItem.rsvp_status, eventItem.id);
             */
            break;
            
        case "messagesViewer":

            ScreenObject.showView(currentScreen, objectId, getMessageItem);

            /*
             ScreenObject.hideFooterBar();
             headerTitle.innerHTML = "Messages Viewer";
             
             // hide the footer bar ..
             footer_bar.style.bottom = "-320px";
             
             var messageItem = getMessageItem(objectid);
             
             var template = "<li>" + TemplateObject.getTemplate("messagesViewer") + "</li>";
             
             var filledTemplate = populateItemTemplate( "messagesViewer", template, messageItem );
             
             document.getElementById("messagesViewer_list").innerHTML = filledTemplate;
             
             if(oldScreen == "home") {
             document.getElementById("header_left_button").setAttribute("onclick", "ScreenObject.showScreenById('home')");
             } else {
             document.getElementById("header_left_button").setAttribute("onclick", "ScreenObject.showScreenById('message_screen')");
             }
             */
            break;
            
        case "newsfeedViewer":
            if(objectId.indexOf("_") > -1)
            {
                ScreenObject.showView(currentScreen, objectId, getNewsfeedItem);
            } else {
                ScreenObject.showView(currentScreen, objectId, getTwitterNewsfeedItem);
            }
            /*
             ScreenObject.hideFooterBar();
             headerTitle.innerHTML = "Newsfeed Viewer";
             // hide the footer bar ..
             footer_bar.style.bottom = "-320px";
             
             
             var newsfeedItem = "";
             if(objectId.indexOf("_") > -1) {
             newsfeedItem = getNewsfeedItem(objectId);
             } else {
             newsfeedItem = getTwitterNewsfeedItem(objectId);
             }
             
             
             var template = "<li>" + TemplateObject.getTemplate("newsfeedViewer") + "</li>";
             
             var filledTemplate = populateItemTemplate( "newsfeedViewer", template, newsfeedItem );
             
             document.getElementById("newsfeedViewer_list").innerHTML = filledTemplate;
             
             if(oldScreen == "home") {
             document.getElementById("header_left_button").setAttribute("onclick", "ScreenObject.showScreenById('home')");
             } else {
             document.getElementById("header_left_button").setAttribute("onclick", "ScreenObject.showScreenById('newsfeed_screen')");
             }
             */
            break;
            
        case "notificationsViewer":
            
            ScreenObject.showView(currentScreen, objectId, getNotificationItem);
            /*
             ScreenObject.hideFooterBar();
             
             headerTitle.innerHTML = "Notification Viewer";
             // hide the footer bar ..
             footer_bar.style.bottom = "-320px";
             
             var notificationItem = getNotificationItem(objectid);
             
             var template = "<li>" + TemplateObject.getTemplate("notificationsViewer") + "</li>";
             
             var filledTemplate = populateItemTemplate( "notificationsViewer", template, notificationItem );
             
             document.getElementById("notificationsViewer_list").innerHTML = filledTemplate;
             
             if(oldScreen == "home") {
             document.getElementById("header_left_button").setAttribute("onclick", "ScreenObject.showScreenById('home')");
             } else {
             document.getElementById("header_left_button").setAttribute("onclick", "ScreenObject.showScreenById('notifications_screen')");
             }
             */
            break;
            
        case "photoVideoViewer":
            
            ScreenObject.hideFooterBar();
            headerTitle.innerHTML = "Photos &amp; Video";
            
            // hide the footer bar .. 
            footer_bar.style.bottom = "-350px";
            
            if(objectId.indexOf("_") < 0) {
                
                var photoItem = getTwitterPhotoItem(objectId);
                
                var template = "<li>" + TemplateObject.getTemplate("photoVideoViewer") + "</li>";
                
                var filledTemplate = populateItemTemplate( "photoVideoViewer", template, photoItem ); 
                
                document.getElementById("photoVideoViewer_list").innerHTML = filledTemplate;            
                
            } else {
                var photoItem = getFacebookPhotoItem(objectId);
                var album_id = getPhotoAlbum(objectId);
                var user_id = getUserIdFromObject(objectId, "photosvideo");
                
                //the below trick seems to work for pages but not for people?
                //if(album_id.indexOf("_") < 0) {
                //album_id = user_id + album_id;
                //}
                
                var query = "SELECT pid, owner, src, src_small, src_big, caption FROM photo WHERE aid=" + "\"" +  album_id + "\"";
                
                var encodeQuery = escape(query);
                
                var album_req = facebookObject.graphApiRequest("facebook_album", encodeQuery);
                album_req.onload = function(ev) {
                    // parse the result JSON .. 
                    json = JSON.parse(ev.target.responseText);
                    currentAlbum = json.data;
                    currentIndex = findInCurrentAlbum(photoItem);
                    
                    if(currentAlbum.length == 0) {
                        currentAlbum.push(photoItem);
                    }
                    
                    var filledTemplates = ""
                    for(var pp in currentAlbum) {
                        var template = "<li>" + TemplateObject.getTemplate("photoVideoViewer") + "</li>";
                        var filledTemplate = populateItemTemplate( "photoVideoViewer", template, currentAlbum[pp]);      
                        filledTemplates += filledTemplate;
                    }                 
                    
                    document.getElementById("photoVideoViewer_list").innerHTML = filledTemplates;    

                    if(newsfeedViewerScroll != false) {
                        newsfeedViewerScroll.destroy();
                    }
                    newsfeedViewerScroll = new iScroll(document.getElementById("photo_video_content"), {snap: "li",momentum: false,
                                                       useTransition: true,
                                                       hScrollbar: false,
                                                       vScrollbar: false});
                }
            }
            if(oldScreen == "home") {
                document.getElementById("header_left_button").setAttribute("onclick", "ScreenObject.showScreenById('home')");
            } else {
                document.getElementById("header_left_button").setAttribute("onclick", "ScreenObject.showScreenById('photosvideo_screen')");
            }
            
            break;
            
        case "friendsViewer":
            ScreenObject.showView(currentScreen, objectId, getFriendsItem);
            /*
             ScreenObject.hideFooterBar();
             
             headerTitle.innerHTML = "Friends Viewer";
             
             var theItem = getFriendsItem(objectId);
             
             var template = "<li>" + TemplateObject.getTemplate("friendsViewer") + "</li>";
             
             var filledTemplate = populateItemTemplate( "friendsViewer", template, theItem );
             
             document.getElementById("friendsViewer_list").innerHTML = filledTemplate;
             
             if(oldScreen == "home") {
             
             document.getElementById("header_left_button").setAttribute("ontouchstart", "ScreenObject.showScreenById('home')");
             
             } else {
             
             document.getElementById("header_left_button").setAttribute("ontouchstart", "ScreenObject.showScreenById('friends_screen')");
             
             }
             */
            break;
    }
}



/*
 * This function hides the login form and shows the register form .. 
 */
Screen.prototype.fromSignInToSignUp = function() {
    
    
    // default the texts in the inputs .. 
    document.getElementById("signup_input_email").value = "";
    document.getElementById("signup_input_password").value = "";
    
    // make sure the button on sign-up page are not visible .. 
    document.getElementById("add_social_media_buttons").style.display = "none";
    
    // slide the two forms, so the login one disappears and the register one appears .. 
    document.getElementById("signup_wrapper_div").style.left = "0px";
    document.getElementById("login_wrapper_div").style.left = "-320px";
    document.getElementById("footer_bar").style.bottom = "-320px";
    
    // and then we check if we have facebook and/or twitter user, so we show the corresponding buttons .. 
    UserObject.showFacebookUserData();
    UserObject.showTwitterUserData();
    
    return false;
}

/*
 * This function hides the register form and shows the login form .. 
 */
Screen.prototype.fromSignUpToSignIn = function() {
    
    // default the texts in the inputs .. 
    document.getElementById("signin_input_email").value = "";
    document.getElementById("signin_input_password").value = "";
    
    // slide the two forms, so the login one disappears and the register one appears .. 
    document.getElementById("signup_wrapper_div").style.left = "-320px";
    document.getElementById("login_wrapper_div").style.left = "0px";
    
    return false;
}


/*
 * The function that resets the view port of the app .. 
 */
Screen.prototype.resetViewPort = function() {
    window.scroll(0, 0);
}


/////////////////////////////////
// The expanded menu functions ..
/////////////////////////////////


/*
 * The function that slides the menu .. 
 */
Screen.prototype.showExpandedMenu = function() {
    
    // define the element of the expanded menu .. 
    var theExpandedMenu = document.getElementById("expanded_menu");
    
    
    // toggle the menu .. 
    if( theExpandedMenu.style.bottom == "47px" ) {
        theExpandedMenu.style.bottom = "-365px";
    } else {
        // before showing update with latest data from feeds .. 
        //this.fillExpandedMenu();
        theExpandedMenu.style.bottom = "47px";
    }
}

Screen.prototype.fillExpandedMenu = function() {
    
    /*this.fillInOneMenu(total_newsfeed_array, "navnewsfeed");
    this.fillInOneMenu(total_messages_array, "navmessages");
    this.fillInOneMenu(total_notifications_array, "navnotifications");
    this.fillInOneMenu(total_photos_videos_array, "navphotosvideo");
    this.fillInOneMenu(total_friends_array, "navbirthdays");
    this.fillInOneMenu(total_events_array, "navevents");
    this.fillInOneMenu(total_friends_array, "navfriends");*/
}

Screen.prototype.fillInOneMenu = function(dataArray, navtype) {
    
    if(dataArray && dataArray.length > 0) {
        //grab the first item and use data 
        var imageSrc = "";
        var item = dataArray[0];
        if(!item.type || item.type == "facebook") {
            var id = "";
            switch(navtype) {
                case "navnewsfeed":
                    if(item.profile.id) {
                        id = item.profile.id;
                    }
                    break;
                case "navmessages":
                    if(item.to.data[1]) {
                        id = item.to.data[1].id;
                    }
                    break;
                case "navnotifications":
                    if(item.profile) {
                        if(item.profile.id) {
                            id = item.profile.id;
                        }
                    }
                    break;
                case "navphotosvideo":
                    if(item.profile.id) {   
                        id = item.profile.id;
                    }
                    break;
                case "navbirthdays":
                    if(item.uid) {
                        id = item.uid;
                    }
                    break;
                case "navevents":
                    if(item.creator) {
                        id = item.creator;
                    }
                    break;
                case "navfriends":
                    if(item.uid) {
                        id = item.uid;
                    }
                    break;
            }
            //alert("navtype is " + navtype);
            imageSrc = "https://graph.facebook.com/" + id + "/picture?type=square"
        } else if(item.type == "twitter") {
            switch(navtype) {
                case "navnewsfeed":
                    imageSrc = item.user.profile_image_url;
                    break;
                case "navmessages":
                    imageSrc = item.sender.profile_image_url;
                    break;
                case "navnotifications":
                    imageSrc = item.user.profile_image_url;
                    break;
                case "navbirthdays":
                    imageSrc = item.uid;
                case "navfriends":
                    imageSrc = item.profile_image_url;
                    break;
            }
            
        } else {
            //wtf is it?
            
        }
        document.getElementById(navtype + "image").src = imageSrc;
        document.getElementById(navtype + "total").innerHTML = dataArray.length;
    } else { 
        document.getElementById(navtype + "image").src = "";
        document.getElementById(navtype + "total").innerHTML = "";    
    }
}


Screen.prototype.showSecondExpandedMenu = function() {
    
    var theExpandedMenu = document.getElementById("second_expanded_menu");
    
    if( theExpandedMenu.style.bottom != "-47px" ) {
        theExpandedMenu.style.bottom = "-47px";
    } else {
        theExpandedMenu.style.bottom = "-365px";
    }
}

Screen.prototype.photoVideoTapped = function(ev) {
    var photoList = document.getElementsByClassName("photoDetails");
    
    for(var i in photoList) {
        var item = photoList[i];
        if(item.style.display == "none") {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    }
    
    /*var thePhotoVideoViewerList = document.getElementById("photoVideoViewer_list");
    for(var i in thePhotoVideoViewerList.childNodes) {
        var item = thePhotoVideoViewerList.childNodes[i];
        if(item.nodeName == "LI") {
            for(var j in item.childNodes) {
                var div = item.childNodes[j];
                if(div.nodeName == "DIV") {
                    //one step further
                    if(div.className == "hidePhotoDetails") {
                        div.className = "";
                    } else {
                        div.className = "hidePhotoDetails";
                    }
                }
            }
        }
    }*/
}



