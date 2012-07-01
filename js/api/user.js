
/*
 * Define the User object .. 
 */
function User()
{
    // some default code will go here .. 
}


///////////////////////////////////////
// The sign-in and sign-up functions ..
///////////////////////////////////////

/*
 * This function shows the stored facebook user data on the sign up page .. 
 */
User.prototype.showFacebookUserData = function() {
    
    // and first - check the facebook user .. 
    facebookUser = window.localStorage.getItem("facebook_user_data");

    // and if we have facebook user - we show the name and the iamge .. 
    // else - we show button for facebook login .. 
    if( facebookUser != null ) {
        facebookUser = JSON.parse( facebookUser );
        document.getElementById("add_facebook_account_div").innerHTML = "<img src=\"https://graph.facebook.com/" + facebookUser.id + "/picture?type=square\" alt=\"\" /><span>" + facebookUser.name + "<br /><a onclick=\"logoutFromFacebook()\">Logout from Facebook</a></span>";
    } else {
        document.getElementById("add_facebook_account_div").innerHTML = "<button onclick=\"connectToFacebook()\"><img src=\"img/fb_icon_small.png\" alt=\"\" class=\"login_btn_img\" />Facebook</button>";
    }
}


/*
 * This function shows the stored facebook user data on the sign up page .. 
 */
User.prototype.showTwitterUserData = function() {
    
    // check the twitter id and screen name for the logged in twitter user, and the logged in facebook user .. 
    twitterId = window.localStorage.getItem("twitter_user_id");
    twitterScreenName = window.localStorage.getItem("twitter_user_name");
    if( twitterId != null && twitterScreenName != null ) {
        document.getElementById("add_twitter_account_div").innerHTML = "<img src=\"https://api.twitter.com/1/users/profile_image?screen_name=" + twitterScreenName + "&size=normal\" alt=\"\" /><span>" + twitterScreenName + "<br /><a onclick=\"logoutFromTwitter()\">Logout from Twitter</a></span>";
    } else {
        document.getElementById("add_twitter_account_div").innerHTML = "<button onclick=\"connectToTwitter()\"><img src=\"img/twitter_icon_small.png\" alt=\"\"  class=\"login_btn_img\" />Twitter</button>";
    }
    
}

/*
 * This function checks if the user has entered email and password .. 
 * on the sign-up page, and if so - shows the buttons on the sign up page .. 
 */
User.prototype.attemptToShowSignUpButtons = function() {
    
    var theSignUpEmail = document.getElementById("signup_input_email").value.trim(),
    theSignUpPassword = document.getElementById("signup_input_password").value.trim();
    
    if(
    theSignUpEmail != "" &&
    theSignUpEmail != default_texts.sign_up_email_input
    &&
    theSignUpPassword != "" &&
    theSignUpPassword != default_texts.password_inputs
    ) {
        document.getElementById("add_social_media_buttons").style.display = "block";
        
    }
}

/*
 * The function that does the whole sign-in logic .. 
 */
User.prototype.signIn = function(signInSource) {
    // predefine some elements .. 
    var theEmail, thePassword,
    twitterId, twitterScreenName,
    facebookId, facebookNames,
    facebookUser,
    resultOfLogin = false, resultOfConfirm, registeredUsers, i;
    
    // the source can be either Facebook or Twitter or the login form .. 
    if( signInSource == undefined || signInSource == null ) {
        signInSource = "form";
    }
    
    // here we'll check for registered user .. 
    // (for now - only on the local storage) .. 
    registeredUsers = window.localStorage.getItem("registered_users");
    
    // and check if we have registered users at all .. 
    if( registeredUsers != null ) {
        
        // parse the registered users .. 
        registeredUsers = JSON.parse( registeredUsers );
        
    }
    
    // and if we have to sign in from the form - we do attemp to do it .. 
    if( signInSource == "form" ) {
        
        if( registeredUsers != null ) {
            
            // get the email and the password .. 
            theEmail = document.getElementById("signin_input_email").value.trim();
            // (and make sure the user haven't entered the default texts) .. 
            if( theEmail == default_texts.sign_in_email_input ) {
                theEmail = "";
            }
            thePassword = document.getElementById("signin_input_password").value.trim();
            if( thePassword == default_texts.password_inputs ) {
                thePassword = "";
            }
            
            // and attempt to validate them .. 
            if( theEmail == "" ) {
                alert("Please, enter your email.");
            } else if( thePassword == "" ) {
                alert("Please, enter your password.");
            } else {
                
                // check for registered user with these credentials .. 
                resultOfLogin = UserObject.checkForRegisteredUser(
                registeredUsers,
                {email: theEmail, password: thePassword},
                2,
                true
                );
                
                // and if can't log-in successfully - we show message .. 
                // otherwise - the next thing that will happen is that we'll connect to FB and/or TW .. 
                if( !resultOfLogin ) {
                    
                    alert("You have enetered invalid credentials.");
                    
                }
            }
            
        } else {
            
            alert("It appears that you don't exist in our system.You have to sign up first.");
            ScreenObject.fromSignInToSignUp();
            
        }
        
    } else if( signInSource == "twitter" ) {
        
        // get the twitter id and screen name for the logged in twitter user .. 
        twitterId = window.localStorage.getItem("twitter_user_id");
        twitterScreenName = window.localStorage.getItem("twitter_user_name");
        
        // and if we have registered twitter user - we attempt to login him .. 
        if( twitterId == null || twitterScreenName == null ) {
            
            connectToTwitter();
            
        } else {
            
            if( registeredUsers != null ) {
                
                resultOfLogin = UserObject.checkForRegisteredUser(
                registeredUsers,
                {twitterId: twitterId},
                1,
                true
                );
                
            }
            
            if( registeredUsers == null || !resultOfLogin ) {
                
                resultOfConfirm = confirm("You are not part of our system yet. Do you want to register your twitter user?");
                
                // and if the user wants to register with the twitter account - we lead him to the registration page .. 
                // and when he enters username and password - then we'll have the twitter user ..
                // and we will store the new user data .. 
                if( resultOfConfirm ) {
                    ScreenObject.fromSignInToSignUp();
                }
            }
        }
        
    } else if( signInSource == "facebook" ) {
        
        // get the facebook user for the logged in facebook user .. 
        facebookUser = window.localStorage.getItem("facebook_user_data");
        // and if we don't have logged in facebook user - we alert this .. 
        if( facebookUser == null ) {
            
            connectToFacebook();
          
        } else {
            
            facebookUser = JSON.parse( facebookUser );
            
            // and attempt to login with the facebook data .. 
            if( registeredUsers != null ) {
                resultOfLogin = UserObject.checkForRegisteredUser(
                registeredUsers,
                {facebookId: facebookUser.id},
                1,
                true
                );
            }
            
            // and if  we don't have such user among the registered ones - we ask for registration .. 
            if( registeredUsers == null || !resultOfLogin ) {
                resultOfConfirm = confirm("You are not part of our system yet. Do you want to register your facebook user?");
                // and if the user wants to register with the facebook account - we lead him to the registration page .. 
                // and when he enters username and password - then we'll have the facebook user ..
                // and we will store the new user data .. 
                if( resultOfConfirm ) {
                    ScreenObject.fromSignInToSignUp();
                }
            }
        }
        
    }
    
    // and finally - if we successfully logged in - we connect to the social media(s) .. 
    if( resultOfLogin ) {
        
        UserObject.connectToSocialNetworks();
        
    }
    
    return false;
    
}


/*
 * This function connects you to the social medias,
 * depending on the logged user data .. 
 */
User.prototype.connectToSocialNetworks = function() {
    
    // and here we make sure we're connected to the social media - FB or TW - if we have the corresponding social media info .. 
    // in the logged user data .. 
    // (first the twitter, then the facebook) .. 
    if( the_logged_user.facebookId == "" ) {
        // the case we have only twitter items .. 
        connectToTwitter();
        loadInitialData();
        ScreenObject.showScreenById("home");
    } else {
        // the case we have either both or only facebook items .. 
        if( the_logged_user.twitterId != "" ) {
            connectToTwitter();
        }
        connectToFacebook(true);
    }
    
}


/*
 * This function adds users to the registered ones .. 
 */
User.prototype.signUp = function() {
    
    // predefine some elements .. 
    var theEmail, theEmailElement, thePassword, thePasswordElement,
    registeredUsers, isExisting = false, i,
    newUserDataObject = {};
    
    // get the data from the inputs .. 
    theEmailElement = document.getElementById("signup_input_email");
    theEmail = theEmailElement.value.trim();
    thePasswordElement = document.getElementById("signup_input_password");
    thePassword = thePasswordElement.value.trim();
    
    // and make sure the user haven't entered the default texts .. 
    if( theEmail == default_texts.sign_up_email_input ) {
        theEmail = "";
    }
    if( thePassword == default_texts.password_inputs ) {
        thePassword = "";
    }
    
    // and some validations .. 
    if( theEmail == "" ) {
        
        alert("Please, enter your email.");
        theEmailElement.focus();
        
    } else if( thePassword == "" ) {
        
        alert("Please, enter your password.");
        thePasswordElement.focus();
        
    } else {
        
        // then - we'll get the registered users - for now - only from the local storage .. 
        registeredUsers = window.localStorage.getItem("registered_users");
        
        // and check if we have registered users at all .. 
        if( registeredUsers == null ) {
            // here we'll create the local array with registered users .. 
            registeredUsers = [];
        } else {
            registeredUsers = JSON.parse( registeredUsers );
        }
        
        if(
            UserObject.checkForRegisteredUser(
                registeredUsers,
                {email: theEmail},
                1
            )
        ) {
            
            alert( "Email already taken" );
            theEmailElement.focus();
            
        } else {
            
            // and here we'll see if the user is logged in either facebook or twitter .. 
            facebookUser = window.localStorage.getItem("facebook_user_data");
            twitterId = window.localStorage.getItem("twitter_user_id");
            twitterScreenName = window.localStorage.getItem("twitter_user_name");
            
            // and if we haven't logged in any social network - we alert a notification for this .. 
            // else - we'll add the user to the registered users .. 
            if( facebookUser == null && ( twitterId == null || twitterScreenName == null ) ) {
                
                alert("Social Media Account Required!\nYou must add at least one social media account to use FlipToast");
                
            } else {
                
                // first of all - we check the twitter user .. 
                if( twitterId != null && twitterScreenName != null ) {
                    
                    isExisting = UserObject.checkForRegisteredUser(
                        registeredUsers,
                        { twitterId: twitterId },
                        1
                    );
                }
                
                if( isExisting ) {
                    
                    alert( "Twitter user already registered." );
                    
                } else {
                    
                    // we'll need the facebookUser .. 
                    if( facebookUser != null ) {
                        facebookUser = JSON.parse( facebookUser );
                        
                        isExisting = UserObject.checkForRegisteredUser(
                            registeredUsers,
                            { facebookId: facebookUser.id },
                            1
                        );
                    }
                    
                    if( isExisting ) {
                        
                        alert( "Facebook user already registered." );
                        
                    } else {
                        
                        // fist - we'll prepare the new user data .. 
                        newUserDataObject = {
                            email: theEmail,
                            password: thePassword,
                            twitterId: twitterId == null ? "" : twitterId,
                            twitterScreenName: twitterScreenName == null ? "" : twitterScreenName,
                            facebookId: facebookUser == null ? "" : facebookUser.id,
                            facebookNames: facebookUser == null ? "" : facebookUser.name
                        };
                        
                        // add the new user data in the registered users .. 
                        registeredUsers.push( newUserDataObject );
                        
                        // store the registered users .. 
                        window.localStorage.setItem("registered_users", JSON.stringify(registeredUsers));
                        
                        // login the user .. 
                        the_logged_user = newUserDataObject;
                        
                        // and connect to the social networks .. 
                        UserObject.connectToSocialNetworks();
                        
                        // and load the dashboard .. 
                        ScreenObject.showScreenById("home");
                        
                    }
                    
                }
                
            }
            
        }
        
    }
    
    return false;
}


/*
 * This function checks if we have registered user with these credentials .. 
 */
User.prototype.checkForRegisteredUser = function(
    registeredUsers,
    credentialsWithValues,
    enteredCredentialsCount,
    loginIfCheckPass
) {
    
    var i, j, user_has_logged_in = false, correctlyEnteredCredentials;
    
    for( i in registeredUsers ) {
        
        correctlyEnteredCredentials = 0;
        
        // check if the user has entered right credentials .. 
        for( j in credentialsWithValues ) {
            
            // .. by just counting the correctly entered ones .. 
            if( j in registeredUsers[i] && credentialsWithValues[j] == registeredUsers[i][j] ) {
                correctlyEnteredCredentials++;
            }
        }
        
        // and finally - compare the correctly credentials count .. 
        // with the count of credentials that we expect to be correct .. 
        if( correctlyEnteredCredentials == enteredCredentialsCount ) {
            user_has_logged_in = true;
            // and store the logged user data - the signing-in itself .. 
            if( loginIfCheckPass != null && loginIfCheckPass != undefined ) {
                the_logged_user = registeredUsers[i];
            }
            break;
        }
    }
    
    return user_has_logged_in;
    
}

