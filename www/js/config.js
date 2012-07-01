
    /*
     *
     * The global variables of the application ... 
     *
     */

    /* the global and screens variables */
    var ScreenObject,
        UserObject,
        TemplateObject,
        screens = ['login', 'home', 'facebook_friends', 'twitter', 'upload_photo_to_facebook', 'no_internet'],
        newScreen, oldScreen, currentScreen = "no_internet", newScreenElement, oldScreenElement,
        facebook_friends_from_local_storage,

        iScrollForWholeDashboard = false,
        iScrollForSeparateList = false,
        iScrollForSingleView = false,
        newsfeedViewerScroll = false,
        dashboardiScrolls = {
            "newsfeed_photos_and_videos"    : false,
            "newsfeed"                      : false,
            "notifications"                 : false,
            "messages"                      : false,
            "birthdays"                     : false,
            "events"                        : false
        },
        
        the_textarea_div,
        the_textarea_itself,
        the_parameter_one,
        the_parameter_two,
        the_textarea_action,
        default_texts = {
            sign_in_email_input : "Email",
            sign_up_email_input : "Email Address",
            password_inputs     : "Password"
        },
        heading_bar, textarea_heading_bar,
        the_logged_user = {},
        where_we_will_post_to = "both",
        highligted_tab_id = "",
        separated_screen_data_type = "both";
    
    /* the data variables */
    var 
        /* the newsfeed items arrays */
        total_newsfeed_array = [],
        
        /* the messages arrays */
        total_messages_array = [],
        
        /* the photos and videos arrays */
        total_photos_videos_array = [],
        
        /* the notifications arrays */
        total_notifications_array = [],
        
        /* the events arrays */
        total_events_array = [],
        facebook_event_rsvp_actions = [
            { type : 'not_replied', text : '' },
            { type : 'unsure',      text : 'Maybe' },
            { type : 'attending',   text : 'Going' }, 
            { type : 'declined',    text : 'Not going' }
        ];
        
        /* the friends array */
        total_friends_array = [],
        
        /* the last twitter items ids - we'll need this to request only the newer */
        last_items_parameters = {},
        
        /* and some additional variables */
        twitter_items_with_media = [],
        facebook_items_with_media = [],
        twitter_items_with_media_taken = false,
        facebook_items_with_media_taken = false;

    var firstPhotoScroll = true;
    var currentAlbum = [];
    var currentIndex = -1;
    var globalData = [];
    
    /* the facebook variables */
	var facebookObject,
        facebook_permissions_scope = "user_photos,friends_photos,read_stream,read_mailbox,user_birthday,friends_birthday,manage_notifications,photo_upload,publish_stream,user_events,rsvp_event",
        facebookApplicationId = "166111553400149",
        photo_to_facebook_upload_url = "https://graph.facebook.com/me/photos?access_token=",
        facebook_graph_api_url = "https://graph.facebook.com/",
        facebook_graph_api_url_with_me = "https://graph.facebook.com/me/",
        fql_query_url = "https://graph.facebook.com/fql?q=",
        redir_url = "https://www.facebook.com/connect/login_success.html", friendsMap = {},
        facebook_new_login_url = "https://m.facebook.com/login.php?app_id=" + facebookApplicationId + "&cancel=http%3A%2F%2Fwww.facebook.com%2Fconnect%2Flogin_success.html%3Ferror_reason%3Duser_denied%26error%3Daccess_denied%26error_description%3DThe%2Buser%2Bdenied%2Byour%2Brequest.&fbconnect=1&next=https%3A%2F%2Fm.facebook.com%2Fdialog%2Fpermissions.request%3F_path%3Dpermissions.request%26app_id%3D" + facebookApplicationId + "%26redirect_uri%3Dhttp%253A%252F%252Fwww.facebook.com%252Fconnect%252Flogin_success.html%26display%3Dtouch%26response_type%3Dtoken%26perms%3Duser_photos%252Cfriends_photos%252Cread_stream%252Cread_mailbox%252Cuser_birthday%252Cfriends_birthday%252Cmanage_notifications%252Cphoto_upload%252Cpublish_stream%26fbconnect%3D1%26from_login%3D1%26client_id%3D" + facebookApplicationId + "&rcount=1&_rdr",
        full_path_of_file_to_upload_to_facebook = "",
        stored_facebook_user_data,
        pictureSource,
        timeOutOne,
        showDashboardAfterStoreUser = false;
        
    /* the twitter variables */
    var twitterObject,
        twitterLocalAccessToken,
        twitterAccessTokenRequest,
        twitterApiUrl = "https://api.twitter.com/1/",
        twitterConsumerKey = "7eoNgvKyZmI1a6yrvRuxBQ",
        twitterConsumerSecret = "meDQ9fBPeniyzo8ivwR8RejznMwUNAMU3COkCoe7E",
        twitterRequestTokenURL = "https://api.twitter.com/oauth/request_token",
        twitterAuthorizeURL = "https://api.twitter.com/oauth/authorize",
        twitterAccessTokenURL = "https://api.twitter.com/oauth/access_token",
        twitterCallbackURL = "http://www.fliptoast.com",
        twitterPhotoUploadUrl = "https://upload.twitter.com/1/statuses/update_with_media.json";
    
    /* Misc config variables */

    // Default dashboard cell width: (width + padding + border)
    var dashboard_cell_width = 113;
    var screenByObjectId = {
        // Screens first
        "friends_screen" : "Friends",
        "messages_screen" : "Messages",
        "newsfeed_screen" : "Newsfeed",
        "notifications_screen" : "Notifications",
        "photosvideo_screen" : "Photos &amp; Video",
        "birthdays_screen" : "Birthdays",
        "events_screen" : "Events",

        // Views follow:
        "birthdaysViewer" : "Birthdays",
        "eventsViewer" : "Events",
        "messagesViewer" : "Messages",
        "newsfeedViewer" : "Newsfeed",
        "notificationsViewer" : "Notification",
        "photoVideoViewer" : "Photos &amp; Videos",
        "friendsViewer" : "Friends"
    },
    textForNoItems = {
        "notifications"                     : "You don't have any new notifications",
        "mentions"                          : "You don't have any new notifications",
        "feed"                              : "You don't have any news feed items",
        "tweets"                            : "You don't have any news feed items",
        "newsfeed_photos_and_videos"        : "You don't have any photos and videos in the newsfeed",
        "inbox"                             : "You don't have any new messages",
        "direct_messages"                   : "You don't have any new messages",
        "friends"                           : "You don't have any new friends",
        "users"                             : "You don't have any new friends",
        "events"                            : "You don't have any new events"
    };

    // Global debug variable. Needs to be set to false when in production
    var __DEBUG = true;

    // Custom alert
    // Pass message along with 1 (Number) to alert or it will console.log
    function log(msg, isAlert)
    {
        if( ! __DEBUG )
            return;
        if( __DEBUG )
        {
            var d = new Date();
            var dt = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds();
            if(isAlert != 1)
                console.log(dt + " [LOG]: " + msg);
            else
                alert("[LOG]: " + msg);
        }
    }
