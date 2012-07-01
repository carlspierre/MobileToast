function callbackOfFacebookAction(the_action, the_object_id)
{
    switch(the_action)
    {
        case 'likes':
            var the_like_link  = document.getElementById("like_link_for_"+the_object_id);
            var the_like_image  = document.getElementById("like_image_for_"+the_object_id);
            
            var theCount = the_like_link.innerText;
            //theCount should be the count of likes or empty if this is the first
            if(theCount == "" || theCount == undefined) {
                theCount = "1";
            } else {
                var number = parseInt(theCount);
                number++;
                theCount = number.toString();
            }
            the_like_image.src = "img/like-on.png";
            the_like_link.innerText = theCount;
            //For some reason when setting innertText it kills the image re-insert it.
            the_like_link.insertBefore(the_like_image, the_like_link.firstChild);
            the_like_link.removeAttribute("onclick");
            likedNewsFeedItem(the_object_id);
            break;
            
        case 'comments':
            var the_comment_link  = document.getElementById("comment_link_for_"+the_object_id);
            var the_comment_image  = document.getElementById("comment_image_for_"+the_object_id);
            
            var theCount = the_comment_link.innerText;
            //theCount should be the count of likes or empty if this is the first
            if(theCount == "" || theCount == undefined) {
                theCount = "1";
            } else {
                var number = parseInt(theCount);
                number++;
                theCount = number.toString();
            }
            the_comment_image.src = "img/comment-on.png";
            the_comment_link.innerText = theCount;
            //For some reason when setting innertText it kills the image re-insert it.
            the_comment_link.insertBefore(the_comment_image, the_comment_link.firstChild);     
            commentedNewsFeedItem(the_object_id);
            hideTextareaForPosting();
            break;
            
        case 'feed':
            alert( "Your message was successfully posted" );
            break;
            
            // Events:
        case 'declined':
        case 'unsure':
        case 'attending':
        case 'not_replied':
        case 'maybe':
            if(the_action == 'maybe')
                the_action = 'unsure';
            setEventRSVP(the_action);
            break;
    }
}

//-------------------------------------------------------------------------
// finds the strId in the given profile list
function findProfile(profileList, strId)
{
    var profile;
    for(var i in profileList)
    {
        if(profileList[i]) {
            if (strId == profileList[i].id)
            {   
                return profileList[i];
            }
        }
    }
    return null;
}

//-------------------------------------------------------------------------
// finds the strId in the given profile list
function findTargetProfile(profileList, strId)
{
    var profile;
    for(var i in profileList)
    {
        if(profileList[i]) {
            if (strId == profileList[i].id)
            {   
                return profileList[i];
            }
        }
    }
    return null;
}

// returns the comments given the post_id and the list of all comments
function findComments(commentList, post_id)
{
    var comments = [];
    for(var i in commentList) {
        if(commentList[i].post_id == post_id) {
            comments.push(commentList[i]);
        }
    }
    return comments;
}


// fills in the profiles for comments
function matchCommentProfiles(profiles, comments)
{
    for(var i in comments) {
        for(var j in profiles) {
            if(comments[i].fromid == profiles[j].id) {
                comments[i].name = profiles[j].name;
                comments[i].pic_square = profiles[j].pic_square;
                break;
            }
        }
    }
    
}

// returns the comments given the post_id and the list of all comments
function findLikes(likeList, post_id)
{
    var likes = [];
    for(var i in likeList) {
        if(likeList[i].post_id == post_id) {
            likes.push(likeList[i]);
        }
    }
    return likes;
}


// fills in the profiles for comments
function matchLikeProfiles(profiles, likes)
{
    for(var i in likes) {
        for(var j in profiles) {
            if(likes[i].user_id == profiles[j].id) {
                likes[i].name = profiles[j].name;
                likes[i].pic_square = profiles[j].pic_square;
                break;
            }
        }
    }
    
}

//returns the userid given the objectid
function getUserIdFromObject(objectId, dataType)
{
    switch(dataType) {
        case "photosvideo":
            if(total_photos_videos_array.length > 0) {
                for(var i in total_photos_videos_array) {
                    var photo = total_photos_videos_array[i];
                    if(photo.post_id) {
                        if(photo.post_id == objectId) {
                            return photo.profile.id;
                        }
                    }
                }
            }
            break;
    }
    
}

//returns the album from facebook photo object
function getPhotoAlbum(objectId) 
{
    for(var i in total_photos_videos_array) {
        if(total_photos_videos_array[i].type == "facebook") {
            if(total_photos_videos_array[i].post_id == objectId) {
                if(total_photos_videos_array[i].attachment.media[0].photo) {
                    return total_photos_videos_array[i].attachment.media[0].photo.aid;
                } else {
                    return;
                }
            }
        }
    }
}

//returns the facebook newsfeedItme
function getNewsfeedItem(objectId) {
    if(total_newsfeed_array.length > 0) {
        for(var i in total_newsfeed_array) {
            if(total_newsfeed_array[i].post_id) {
                if(total_newsfeed_array[i].post_id == objectId) {
                    return total_newsfeed_array[i];
                }
            }
        }
    }
}

function likedNewsFeedItem(objectId) {
    if(total_newsfeed_array.length > 0) {
        for(var i in total_newsfeed_array) {
            if(total_newsfeed_array[i].post_id) {
                if(total_newsfeed_array[i].post_id == objectId) {
                    total_newsfeed_array[i].likes.count++;
                    total_newsfeed_array[i].likes.user_likes = true;
                }
            }
        }
    }    
}

function commentedNewsFeedItem(objectId) {
    if(total_newsfeed_array.length > 0) {
        for(var i in total_newsfeed_array) {
            if(total_newsfeed_array[i].post_id) {
                if(total_newsfeed_array[i].post_id == objectId) {
                    total_newsfeed_array[i].comments.count++;
                }
            }
        }
    }    
}

//returns the object
function getFacebookPhotoItem(objectId)
{
    if(total_photos_videos_array.length > 0) {
        for(var i in total_photos_videos_array) {
            if(total_photos_videos_array[i].post_id) {
                if(total_photos_videos_array[i].post_id == objectId) {
                    return total_photos_videos_array[i];
                }
            }
        }
    }
}

//returns index in the current album if there is one
function findInCurrentAlbum(photoItem)
{
    if(currentAlbum != null && currentAlbum.length > 0) {
        for(var i in currentAlbum) {
            if(photoItem.src === currentAlbum[i].src) {
                return i;
            }
        }
    }
}

//returns birthdayItem
function getBirthdayItem(objectId)
{
    if(total_birthdays_array.length > 0) {
        for(var i in total_birthdays_array) {
            if(total_birthdays_array[i].id) {
                if(total_birthdays_array[i].id == objectId) {
                    return total_birthdays_array[i];
                }
            }
        }
    }
}

function getEventItem(objectId)
{
    if(total_events_array.length > 0) {
        for(var i in total_events_array) {
            if(total_events_array[i].eid) {
                if(total_events_array[i].eid == objectId) {
                    return total_events_array[i];
                }
            }
        }
    }
}

function getFriendsItem(objectId)
{
    if(total_friends_array.length > 0) {
        for(var i in total_friends_array) {
            if( "id_str" in total_friends_array[i] && total_friends_array[i].id_str == objectId ) {
                return total_friends_array[i];
            } else {
                if( "uid" in total_friends_array[i] && total_friends_array[i].uid == objectId ) {
                    return total_friends_array[i];
                }
            }
        }
    }
}

function setEventRSVP(new_rsvp_status, eid)
{
    //alert(new_rsvp_status);
    var i = facebook_event_rsvp_actions.length;
    var activate = -1;
    var element = '';
    var action = '';
    
    // hide all
    while(i > 0)
    {
        i--;
        
        action = facebook_event_rsvp_actions[i]['type'];
        element = 'rsvp_' + action;
        document.getElementById(element).style.display = 'none';
        if(facebook_event_rsvp_actions[i]['type'] == new_rsvp_status)
        {
            activate = i;
        }
    }
    document.getElementById('rsvp_' + facebook_event_rsvp_actions[activate]['type']).style.display = 'inline';
}

/*
 *  Setters for FB data which UPDATE items:
 */
function setEventItem(eventObject)
{
    for(var index in total_events_array)
    {
        if(total_events_array[index].eid == eventObject.data[0].eid)
        {
            total_events_array[index] = eventObject.data[0];
        }
    }
}