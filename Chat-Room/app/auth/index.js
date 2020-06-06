'use strict';

const passport          =       require('passport');
const config            =       require('../config');
const facebook          =       require('passport-facebook'); 
const twitter           =       require('passport-twitter');
const helper            =       require('../helpers');
 
// this will bring the Strategy constructor fucntion.This function will go to the passport-facebook modules
// and imports the constructor function that internally uses the passport Oauth 2 module to offer
// authentication and login functionality to your app

const facebookStrategy = facebook.Strategy; 
const TwitterStrategy = twitter.Strategy;


// exporting the anonymous function
module.exports = ()=>
{
    // this is will store the data in session
    passport.serializeUser((user, done)=>
    {
        // This id is given by the mongodb to every user ( or collection ) 
        done(null, user.id);   
    })

    passport.deserializeUser((id, done)=>
    {
        helper.findById(id)
            .then(user => done(null, user))     // This will make data to be in available in request stream as req.user
            .catch(error => console.log("Error while Deserializing the user"));
    })
    
    // this is our built function

    // done is method which is used to get the datas out of the authentication process and into rest of the workflow into  
    // our app. accessToken and refreshToken are provided by the facebook according to the Oauth 2.0. accessToken is useful
    // whenever you want to access user email and wants to delete something from there or etc. It will send accessToken as
    // a proof that we have a permission to do the above mentioned task. accessToken has some exipration time may be 1 hr
    // ( I don't know exact time ). After that we need refresToken to get a new valid accessToken.

    // use of authProcess :Find the user in the local db using profile.id. If the user is found , return the user data 
    // using the done() method. If the user is not found , create one in the local db and return the same.
    let authProcessor = (accessToken, refreshToken, profile, done) =>
    {
        helper.findOne(profile.id).then(result =>
        {
            // if user is not logging the first time
            
            // result will contain all the details of that particular person if he/she is
            // not logging the first time

            if(result)
            done(null, result);
            else
            {
                // else we will create that user and store all the data to database

                helper.createNewUser(profile)
                    .then(newChatuser => done(null, newChatUser))
                    .catch(error => console.log('Error when creating new user'))
            }
        })
    }

    // passport.use() for facebook will be called after user clicked the button 'login with facebook'. It takes two 
    // arguments first : configration object , second : callback function (authProcessor is a callback function). Callback 
    // will get get executed after user will allow permission to access his/her facebook profile. If user allows, then it 
    // will get back to our server to the url mentioned as callback URL. But this time there will be a 'code' along with 
    // callback URL which allows us to exchange the user profile with this code. Now see index.js page in routes folder.
    // When user completes exchanging the profile with the code then this callback function will get executed. 
    passport.use(new facebookStrategy(config.fb, authProcessor));

    passport.use(new TwitterStrategy(config.twitter, authProcessor));
}