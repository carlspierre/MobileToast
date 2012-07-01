/* MIT licensed */
// (c) 2010 Jesse MacFadyen, Nitobi
// Contributions, advice from : 
// http://www.pushittolive.com/post/1239874936/facebook-login-on-iphone-phonegap

function FBConnect()
{
	if(window.plugins.childBrowser == null)
	{
		window.plugins.childBrowser = ChildBrowser.install();
	}
}

FBConnect.prototype.connect = function(application_id,redirect_uri,display,displayChildBrowser)
{

	this.application_id = application_id;
	this.redirect_uri = redirect_uri;
    this.user_id = {};
    
    var authorize_url = "https://m.facebook.com/dialog/oauth?";
        authorize_url += "client_id=" + application_id;
        authorize_url += "&redirect_uri=" + redirect_uri;
        authorize_url += "&scope=" + facebook_permissions_scope;
        authorize_url += "&response_type=token";

	window.plugins.childBrowser.showWebPage(authorize_url);
	var self = this;
	window.plugins.childBrowser.onLocationChange = function(loc){self.onLocationChange(loc);};
}

FBConnect.prototype.onLocationChange = function(newLoc)
{
	if(newLoc.indexOf(this.redirect_uri) == 0)
	{
		var result = unescape(newLoc).split("#")[1];
		result = unescape(result);
		
		// TODO: Error Check
		this.accessToken = result.split("&")[0].split("=")[1];
        
		this.onConnect();
	}
    
}

FBConnect.prototype.graphApiRequest = function( the_request_name, the_query, async)
{
    
    // check to see if we have FQL query .. 
    if( the_query == undefined ) {
        // we have direct API request ..
        var url = "";
        if(the_request_name.indexOf("?") > 0) {
            url = facebook_graph_api_url_with_me + the_request_name + "&access_token=" + this.accessToken;
        } else {
            url = facebook_graph_api_url_with_me + the_request_name + "?&access_token=" + this.accessToken;
        
        }
        // and if we have the timestamp of the last item - we add it to the query .. 
        // so we get only the newer ones .. 
      //alert( the_request_name + ":" + (typeof last_items_parameters[the_request_name]));
        if( last_items_parameters[the_request_name] != undefined ) {
            url += "&since=" + ( last_items_parameters[the_request_name] / 1000 );
        }
        
    } else {
        // we have FQL request .. 
        var url = fql_query_url + the_query + "&format=json&access_token=" + this.accessToken;
    }
    
    // create the request object .. 
	var req = new XMLHttpRequest();
    
	// make the request .. 
    if(async != undefined && async == true) {
        req.open( "GET", url, false );
    } else {
        req.open( "GET", url, true );
    }
	req.send( null );
	req.onerror = function() {
        log( "(FB graphApiRequest AJAX Error", 1 ); 
    };
    // and we'll return the type of the request .. 
    if( the_query == undefined ) {
        req.the_request_type = "built_in_graph";
    } else {
        req.the_request_type = "fql";
    }
    
    // and the request type .. 
    req.the_request_name = the_request_name;

    // and return the request object (the response is inside it) .. 
  //alert("PS" + ( req ) );
	return req;
}

FBConnect.prototype.graphApiAction = function( the_object_id, the_action, request_type, parameters )
{
    // generate the url and create the request object .. 
	var url = facebook_graph_api_url + (the_object_id != null ? the_object_id + "/" : "" ) + the_action + "?access_token=" + this.accessToken,
        method = ( request_type == undefined || request_type == null ) ? "POST" : request_type,
        req = new XMLHttpRequest();
    
    // set the callback .. 
    req.onreadystatechange = function() {
        if(req.readyState == 4 && req.status == 200)
        {
            callbackOfFacebookAction(the_action, the_object_id);
        } else {
            // if problems arize:
        }
    }
    
	// make the request .. 
	req.open(method, url, true);
	req.send(method == "POST" ? parameters : null);
	req.onerror = function(){ alert("Error"); };
    
}

// Note: this plugin does NOT install itself, call this method some time after deviceready to install it
// it will be returned, and also available globally from window.plugins.fbConnect
FBConnect.install = function()
{
	if(!window.plugins)
	{
		window.plugins = {};	
	}
	window.plugins.fbConnect = new FBConnect();
	return window.plugins.fbConnect;
}

