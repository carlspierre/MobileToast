
/*
 * The twitter functionality will require the ChildBrowser plugin - in order to process the authorizing functionality .. 
 */
function TwitterConnect()
{
	if(window.plugins.childBrowser == null)
	{
		window.plugins.childBrowser = ChildBrowser.install();
	}
}

TwitterConnect.prototype.requestAccessToken = function() {
    
    // before anything - we'll make sure the local storage is clear .. 
    window.localStorage.removeItem("twitter_token");
    window.localStorage.removeItem("twitter_secret_token");
    window.localStorage.removeItem("twitter_user_name");
    window.localStorage.removeItem("twitter_user_id");
    
    // first - we'll prepare the things around the request .. 
    var accessor = {
        consumerKey   : twitterConsumerKey,
        consumerSecret: twitterConsumerSecret,
        serviceProvider: {
            signatureMethod     : "HMAC-SHA1",
            requestTokenURL     : twitterRequestTokenURL,
            userAuthorizationURL: twitterAuthorizeURL,
            accessTokenURL      : twitterAccessTokenURL,
            echoURL             : twitterCallbackURL
        }
    },
    message = {
        method: "POST",
        action: accessor.serviceProvider.requestTokenURL,
        parameters: [] // ["scope", "http://www.google.com/m8/feeds/"]]
    },
    requestBody = OAuth.formEncode(message.parameters),
    authorizationHeader,
    requestToken;
    
    // make the OAuth request .. 
    OAuth.completeRequest(message, accessor);
    
    authorizationHeader = OAuth.getAuthorizationHeader("", message.parameters);
    
    // build the request object .. 
    requestToken = new XMLHttpRequest();
    
    // set the onready state change .. 
    requestToken.onreadystatechange = function receiveRequestToken() {
        if (requestToken.readyState == 4) {
            var results = OAuth.decodeForm(requestToken.responseText);
            var oauth_token = OAuth.getParameter(results, "oauth_token");
            var authorize_url = twitterAuthorizeURL + "?oauth_token="+oauth_token;
            
            window.plugins.childBrowser.onLocationChange = function(loc){
                twitterLocationChanged(loc, requestToken, accessor);
            };
            window.plugins.childBrowser.showWebPage(authorize_url);
        }
    };
    
    // set the type of the request .. 
    requestToken.open(message.method, message.action, true);
    
    // set the headers .. 
    requestToken.setRequestHeader("Authorization", authorizationHeader);
    requestToken.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    
    // and fire the request .. 
    requestToken.send(requestBody);
    
}

TwitterConnect.prototype.onLocationChange = function(loc, requestToken, accessor) {
    
    var results, message, requestAccess, params;
    
    /* Here we check if the url is the login success */
    if (loc.indexOf(twitterCallbackURL) > -1) {
        window.plugins.childBrowser.close();
        
        results = OAuth.decodeForm(requestToken.responseText);
        message = {
            method: "POST",
            action: accessor.serviceProvider.accessTokenURL
        };
        OAuth.completeRequest(
            message,
            {
                consumerKey : twitterConsumerKey,
                consumerSecret: twitterConsumerSecret,
                token : OAuth.getParameter(results, "oauth_token"),
                tokenSecret : OAuth.getParameter(results, "oauth_token_secret")
            }
        );
        requestAccess = new XMLHttpRequest();
        requestAccess.onreadystatechange = function receiveAccessToken() {
            if (requestAccess.readyState == 4) {
                
                // we'll parse the url to get the twitter data .. 
                params = window.plugins.twitterConnect.getUrlVarsFromString(requestAccess.responseText);
                // store the things we'll need in the local storage ..
                if(params["oauth_token"]) {
                    window.localStorage.setItem("twitter_token", params["oauth_token"]);
                }
                if(params["oauth_token_secret"]) {
                    window.localStorage.setItem("twitter_secret_token", params["oauth_token_secret"]);
                }
                if(params["screen_name"]) {
                    window.localStorage.setItem("twitter_user_name", params["screen_name"]);
                }
                if(params["user_id"]) {
                    window.localStorage.setItem("twitter_user_id", params["user_id"]);
                }
                // and show the logged in twitter user data .. 
                if( currentScreen == "login" ) {
                    UserObject.showTwitterUserData();
                }
            }
        };
        
        requestAccess.open(message.method, message.action, true);
        
        requestAccess.setRequestHeader(
            "Authorization",
            OAuth.getAuthorizationHeader("", message.parameters)
        );
        requestAccess.send();
    }
}

// helper for url variables .. 
TwitterConnect.prototype.getUrlVarsFromString = function(url) {
    var vars = [], hash, hashes, i;
    
    hashes = url.slice( url.indexOf('?') + 1 ).split('&');
    
    for( i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
    
}

// helper for the rest API requests .. 
TwitterConnect.prototype.restApiRequest = function(
    requestType,
    url,
    method,
    params,
    previousListItems,
    listId,
    theScrollDivId,
    theTotalElementId,
    specificCallback
) {
    // we prepare the ajax data .. 
    var theAjaxObject = new XMLHttpRequest(),
        message = {
            method: method,
            action: url,
            parameters: params
        };
    
    OAuth.completeRequest(
        message,
        {
            consumerKey: twitterConsumerKey,
            consumerSecret: twitterConsumerSecret,
            token: window.localStorage.getItem("twitter_token"),
            tokenSecret: window.localStorage.getItem("twitter_secret_token")
        }
    );
    
    theAjaxObject.onreadystatechange = function() {
        
        var textToShow = "", objectForUse, dataObjectsArray, oneTweet, oneTweetParameter, user;
        
        // and if we have proper response from Twitter - then we do something with it .. 
        if (theAjaxObject.readyState == 4 ) {
            
            if( theAjaxObject.status == 200 ) {
                
                // and if all is OK with the response from Twitter - we .. 
                if( method != "POST" ) {
        
                    // make some specific callback - if we have provided one .. 
                    if( typeof specificCallback == "function" ) {

                        // populate the response - if we have pulled something .. 
                        specificCallback(
                            requestType,
                            JSON.parse( theAjaxObject.responseText ),
                            previousListItems,
                            listId,
                            theScrollDivId,
                            theTotalElementId
                        );

                    } else {

                        // populate the response - if we have pulled something .. 
                        populateTwitterResponse(
                            requestType,
                            JSON.parse( theAjaxObject.responseText ),
                            previousListItems,
                            listId,
                            theScrollDivId,
                            theTotalElementId
                        );

                    }
                    
                } else {
                    // .. and just call the callback - if we have posted something .. 
                    callbackOfTwitterAction(
                        url,                // the URL we've posted to .. 
                        previousListItems   // here we have the item ID .. 
                    );
                    
                }
                
            } else {                
                // if something is not OK - we parse the response text .. 
                objectForUse = JSON.parse( theAjaxObject.responseText );
                
                // check if we have errors - we show the error message .. 
                if( "errors" in objectForUse ) {
                    alert( theAjaxObject.statusText + ": " + objectForUse.errors[0].message );
                } else if( "error" in objectForUse ) {
                    alert( theAjaxObject.statusText + ": " + objectForUse.error );
                }
                
                // if forbidden - then we need a new token .. 
                if( theAjaxObject.status == 401 ) {
                    // request the new token .. 
                    window.plugins.twitterConnect.requestAccessToken();
                }
                
            }
            
        }
        
    }
    
    theAjaxObject.open( method, url, true );
    
    theAjaxObject.setRequestHeader("oauth_consumer_key", twitterConsumerKey);
    
    theAjaxObject.setRequestHeader("oauth_nonce", message.parameters["oauth_nonce"]);
    
    theAjaxObject.setRequestHeader("oauth_signature_method", "HMAC-SHA1");
    
    theAjaxObject.setRequestHeader("oauth_token", window.localStorage.getItem("twitter_token"));
    
    theAjaxObject.setRequestHeader("oauth_timestamp", message.parameters["oauth_timestamp"]);
    
    theAjaxObject.setRequestHeader("oauth_version", "1.0");
    
    theAjaxObject.setRequestHeader(
        "Authorization",
        OAuth.getAuthorizationHeader("", message.parameters)
    );
    
    theAjaxObject.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    
    theAjaxObject.send(params);
    
    // we show the loading animation in the twitter list .. 
    document.getElementById("twitter_items_list").innerHTML = "<li class=\"item_with_loading\">Loading ...<br /><span class=\"loading_bar\"></span></li>";
    
}

// helper for the rest API actions .. 
TwitterConnect.prototype.restApiAction = function(
    the_object_id,
    the_action,
    request_type,
    params,
    the_action_type
) {
    var allow_to_proceed = false;
    // first - some preliminary actions - if necessary .. 
    if( the_action == "retweet" || the_action == "favorite" ) {
        // for the retweeting - we'll ask for confirmation in order to proceed .. 
        
        if(the_action == "retweet") {
            //if item has been retweeted don't allow again
            if(hasItemBeenRetweeted(the_object_id)) {
               return;
            }
        }
        allow_to_proceed = confirm( the_action.charAt(0).toUpperCase() + the_action.substr(1) + "\n" + document.getElementById("text_of_tweet_" + the_object_id ).innerHTML + "?" );
    } else {
        allow_to_proceed = true;
    }
    
    // and if we don't have any obstacles - we proceed - 
    if( allow_to_proceed ) {
        
        // specify the method - GET or POST .. 
        var method = ( request_type == undefined || request_type == null ? "POST" : request_type );
        
        // specify the url .. 
        var url = twitterApiUrl + (the_action_type==null ? "statuses" : the_action_type) + "/" + the_action + ( the_object_id != null ? "/" + the_object_id : "" ) + ".json";
        
        // and make the request .. 
        window.plugins.twitterConnect.restApiRequest(
            the_action, url, method, params, the_object_id
        );
    }
    
}

// Note: this plugin does NOT install itself, call this method some time after deviceready to install it
// it will be returned, and also available globally from window.plugins.fbConnect
TwitterConnect.install = function() {
	if(!window.plugins)
	{
		window.plugins = {};	
	}
	window.plugins.twitterConnect = new TwitterConnect();
	return window.plugins.twitterConnect;
}

