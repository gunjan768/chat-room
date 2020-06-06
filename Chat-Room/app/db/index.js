'use strict';

const config    	=   	require('../config');
const Mongoose   	=  	    require("mongoose");

const mongoose = Mongoose.connect(config.dbURI);

mongoose.then(response =>
{
    console.log("MongoDB Atlas connected successfully");
})
.catch(error =>
{
    console.log("Error in connecting MongoDB Atlas : ",error);
})

const chatUser = new Mongoose.Schema(
{
    profileId: String ,
    fullName: String ,
    profilePic: String
});

let userModel = Mongoose.model('chatUser', chatUser);
 
module.exports = 
{
    //mongoose: mongoose
    // write above or below one

    mongoose ,
    userModel
}
