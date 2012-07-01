//returns the object
function getTwitterPhotoItem(objectId)
{
    if(total_photos_videos_array.length > 0) {
        for(var i in total_photos_videos_array) {
            if(total_photos_videos_array[i].entities) {
                for(var ii in total_photos_videos_array[i].entities.media) {
                    if(total_photos_videos_array[i].entities.media[ii].id_str == objectId) {
                        return total_photos_videos_array[i];
                    }
                }
            }
        }
    }
}

//returns the newsfeed item or tweet for twitter
function getTwitterNewsfeedItem(objectId)
{
    if(total_newsfeed_array.length > 0) {
        for(var i in total_newsfeed_array) {
            if(total_newsfeed_array[i].id_str == objectId) {
                return total_newsfeed_array[i];
            }
        }
    }    
}

//returns a message item 
function getMessageItem(objectId)
{
    if(total_messages_array.length > 0) {
        for(var i in total_messages_array) {
            if(total_messages_array[i].id == objectId) {
                return total_messages_array[i];
            }
        }
    }    
}


/*
 * If we're pulling the twitter followers 
 * We first get the IDs of the users, and then call this function .. 
 */
function getTwitterUsersByIds(
    requestType,
    theTwitterFollowersIdsObject,
    eventualFacebookItems,
    theListId,
    theScrollDivId,
    theTotalElementId
) {

    // and if we have twitter followers ids .. 
    // we make the request to get those users data .. 
    if( "ids" in theTwitterFollowersIdsObject && theTwitterFollowersIdsObject.ids.length > 0 ) {

        // facebook "friends" - twitter "friends" .. 
        twitterRequest(
            "users/lookup",
            eventualFacebookItems,
            theListId,
            theScrollDivId,
            theTotalElementId,
            undefined,
            theTwitterFollowersIdsObject.ids.join(",")
        );

    } else {

        // and if don't have any followers - we just go on to the population function .. 
        populateTwitterResponse(
            "users/lookup",
            [],
            eventualFacebookItems,
            theListId,
            theScrollDivId,
            theTotalElementId
        );

    }
}

/*
 * Callback of a twitter action .. 
 */
function callbackOfTwitterAction( url, the_item_id ) {
    
    // predefine some variables .. 
    var the_element_we_will_modify;
    
    // and then we do something, depending on the URL we've posted to  .. 
    if( url.indexOf( "favorites/create" ) > -1 ) {
        
        // we have favorited a tweet .. 
        if( document.getElementById("newsfeed_favorite_link_for_" + the_item_id) ) {
            document.getElementById("newsfeed_favorite_link_for_" + the_item_id).style.display = "none";
            document.getElementById("newsfeed_unfavorite_link_for_" + the_item_id).style.display = "inline";
        }
        
        // ... which also can be a mention .. 
        if( document.getElementById("mentions_favorite_link_for_" + the_item_id) ) {
            document.getElementById("mentions_favorite_link_for_" + the_item_id).style.display = "none";
            document.getElementById("mentions_unfavorite_link_for_" + the_item_id).style.display = "inline";
        }
        
        // and we'll mark the twitter item in the cache that we have favorited it .. 
        changeTwitterProperty( the_item_id, "favorited", true );
        
        alert( "You successfully favorited the tweet" );
        
    } else if( url.indexOf( "favorites/destroy" ) > -1 ) {
        
        // we have unfavorited a tweet .. 
        if( document.getElementById("newsfeed_favorite_link_for_" + the_item_id) ) {
            document.getElementById("newsfeed_favorite_link_for_" + the_item_id).style.display = "inline";
            document.getElementById("newsfeed_unfavorite_link_for_" + the_item_id).style.display = "none";
        }
        // ... which also can be a mention .. 
        if( document.getElementById("mentions_favorite_link_for_" + the_item_id) ) {
            document.getElementById("mentions_favorite_link_for_" + the_item_id).style.display = "inline";
            document.getElementById("mentions_unfavorite_link_for_" + the_item_id).style.display = "none";
        }
        
        // and we'll mark the twitter item in the cache that we have favorited it .. 
        changeTwitterProperty( the_item_id, "favorited", false );
        
        alert( "You successfully unfavorited the tweet" );
        
    } else if( url.indexOf( "statuses/retweet" ) > -1 ) {
        var the_tweet_link = document.getElementById("retweet_link_for_"+the_item_id);
        var the_tweet_image = document.getElementById("retweet_image_for_"+the_item_id);
        the_tweet_image.src = "img/retweet-on.png";
        the_tweet_link.removeAttribute("onclick");
        retweetNewsFeedItem(the_item_id);
        
    } else if( url.indexOf( "statuses/update" ) > -1 ) {
        
        // we have posted a new tweet .. 
        // (or replyed of a tweet) .. 
        
    }
    
    // and also - we make sure the textarea hides .. 
    hideTextareaForPosting();
    
}

/*
 * This changes the twitter value of a specific item .. 
 */
function changeTwitterProperty( itemId, propertyToChange, newValue ) {
    
    // predefine some elements .. 
    var ii;
    
    switch( propertyToChange ) {
        
        case "favorited" :
            
            // for favorite and unfavorite - we can have this item in the newsfeed and the notifications/mentions arrays .. 
            for( ii = 0; ii < total_newsfeed_array.length; ii++ ) {
                if(
                    "id_str" in total_newsfeed_array[ii] 
                    && 
                    total_newsfeed_array[ii].id_str == itemId 
                ) {
                    total_newsfeed_array[ii][propertyToChange] = newValue;
                    break;
                }
            }

            for( ii = 0; ii < total_notifications_array.length; ii++ ) {
                if(
                    "id_str" in total_notifications_array[ii] 
                    && 
                    total_notifications_array[ii].id_str == itemId 
                ) {
                    total_notifications_array[ii][propertyToChange] = newValue;
                    break;
                }
            }
            
            break;
        
    }
    
}

function hasItemBeenRetweeted(objectId)
{
    if(total_newsfeed_array.length > 0) {
        for(var i in total_newsfeed_array) {
            if(total_newsfeed_array[i].id_str) {
                if(total_newsfeed_array[i].id_str == objectId) {
                    if(total_newsfeed_array[i].retweeted == true) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        }
    }  
    return false;
}

function retweetNewsFeedItem(objectId) 
{
    if(total_newsfeed_array.length > 0) {
        for(var i in total_newsfeed_array) {
            if(total_newsfeed_array[i].id_str) {
                if(total_newsfeed_array[i].id_str == objectId) {
                    total_newsfeed_array[i].retweeted = true;
                }
            }
        }
    }  
}


