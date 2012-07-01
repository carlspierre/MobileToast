
/*
 * Define the Template object .. 
 */
function DataManipulator()
{
    // some default code will go here .. 
}


/*
 * For some of the requests we make preliminary actions on the data .. 
 */
DataManipulator.prototype.preliminaryActions = function( requestWeHaveMade, json ) {
    
    // here we make the things, based on the request we have made .. 
    switch( requestWeHaveMade ) {
        case "inbox":
            for(var i in json.data) {
                if(json.data[i].updated_time) {
                    json.data[i].timestamp = parseFacebookDate(json.data[i].updated_time).getTime();
                }
            }
            break;
        case "newsfeed_photos_and_videos" :

            var photoStream, photoProfiles;
            
            for(var i in json.data) {
                if(json.data[i].name == "queryPhotoStream") {
                    photoStream = json.data[i].fql_result_set;
                } else if(json.data[i].name == "queryPhotoProfile") {
                    photoProfiles = json.data[i].fql_result_set;
                }
            }
            if(photoStream && photoProfiles) {
                for(var ii in photoStream) {
                    photoStream[ii].type = "facebook";
                    photoStream[ii].timestamp = photoStream[ii].created_time * 1000;
                    var profile = findProfile(photoProfiles, photoStream[ii].source_id);
                    if(profile) {
                        photoStream[ii].profile = profile;
                    }
                }
            }

            json = { data : photoStream };

            break;

        case "feed":

            var stream, streamProfile, targetProfile, comments, commentProfiles, likes, likeProfiles;

            for(var f in json.data) {
                if(json.data[f].name == "queryStream") {
                    stream = json.data[f].fql_result_set;
                } else if(json.data[f].name == "queryStreamProfile") {
                    streamProfile = json.data[f].fql_result_set;
                } else if(json.data[f].name == "queryTargetProfile") {
                    targetProfile = json.data[f].fql_result_set;
                } else if(json.data[f].name == "queryComment") {
                    comments = json.data[f].fql_result_set;
                } else if(json.data[f].name == "queryCommentProfile") {
                    commentProfiles = json.data[f].fql_result_set;
                } else if(json.data[f].name == "queryLikeIds") {
                    likes = json.data[f].fql_result_set;
                } else if(json.data[f].name == "queryLikeProfile") {
                    likeProfiles = json.data[f].fql_result_set;
                }
            }
            
            //below fills in the data for better usage elsewhere
            for(var ff in stream) {
                stream[ff].type = "facebook";
                if(stream[ff].created_time ) {
                    stream[ff].timestamp = stream[ff].created_time * 1000;
                } 
                
                if(streamProfile) {
                    var profile = findProfile(streamProfile, stream[ff].source_id);
                    if(profile) {
                        stream[ff].profile = profile;
                    }
                }
                if(targetProfile) {
                    var tprofile = findTargetProfile(targetProfile, stream[ff].source_id);
                    if(tprofile) {
                        stream[ff].targetProfile = tprofile;
                    }
                }
                if(comments) {
                    var commentList = findComments(comments, stream[ff].post_id);
                    if(commentList) {
                        if(commentProfiles) {
                            matchCommentProfiles(commentProfiles, commentList);
                        }
                        stream[ff].comments = commentList;
                    }
                }
                if(likes) {
                    var likeList = findLikes(likes, stream[ff].post_id);
                    if(likeList) {
                        if(likeProfiles) {
                            matchLikeProfiles(likeProfiles, likeList);
                        }
                        stream[ff].likes = likeList;
                    }
                }
            }
            json = { data : stream };

            break;

        case 'events':
        case 'eventsViewer':

            var allEventsSummary, eventsDetails, eventOwner;

            for(var i in json.data)
            {
                if(json.data[i].name == "queryAllEvents")
                    allEventsSummary = json.data[i].fql_result_set;
                if(json.data[i].name == "queryEventsPerItem")
                    eventsDetails = json.data[i].fql_result_set;
                if(json.data[i].name == "queryEventOwner")
                    eventOwner = json.data[i].fql_result_set;
            }
            //alert('ok' + allEventsSummary.length);
            //log(("allevents: " + allEventsSummary.length + "\ndetails: " + eventsDetails.length) + "\ncreators: " + eventOwner.length, 1);

            var count = allEventsSummary.length;

            for(var i = 0; i < count; i++)
            {
                eventsDetails[i].rsvp_status = allEventsSummary[i].rsvp_status;
                if(eventOwner.hasOwnProperty('name'))
                    eventsDetails[i].event_creator = eventOwner[i].name;
                else
                    eventsDetails[i].event_creator = '';
                //alert(eventOwner[i].name);
            }
            
            json = { data : eventsDetails };

            break;

        // TODO: Remove case 'eventsViewers' (does not exist)
        case 'eventsViewers':

            var eventDetails, eventOwner;

            for(var i in json.data)
            {
                if(json.data[i].name == "queryEvent")
                    eventDetails = json.data[i].fql_result_set;
                if(json.data[i].name == "queryEventOwner")
                    eventOwner = json.data[i].fql_result_set;
            }

            var count = eventDetails.length;

            for(var i = 0; i < count; i++)
            {
                if(eventOwner.hasOwnProperty('name'))
                    eventDetails[i].event_creator = eventOwner[i].name;
                else
                    eventDetails[i].event_creator = '';
            }
            
            json = { data : eventDetails };
            break;
        case "friends":
        case "birthdays":
            for(var i in json.data) {
                json.data[i].type = "facebook";
            }
            break;
        default:
            
            break;

    }

    return json;

}

