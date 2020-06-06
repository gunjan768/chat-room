'use strict';

const session       =       require('express-session');
const MongoStore    =       require('connect-mongo')(session);
const config        =       require('../config');
const db            =       require('../db');

if(process.env.NODE_ENV == 'production')
{
    // in production mode we will set saveUnititialized to false

    module.exports = session(
    {
        secret: config.sessionSecret ,
        resave: false ,
        saveUninitialized: false ,
        // store: new MongoStore(
        // {
        //     // whole thing refers to the mongoose instance that we have exported from the db module and .connection allows
        //     // connect-mongo to interface with mongo db directly.
        //     mongooseConnection: db.mongoose.connection
        // })
    })
}
else
{
    // by default resave is true so we explicitly mention it as false.If true then our middleware 
    // attempt to store session data in the session store again and again , knowing that data has not been changed

    // saveUnititialized when set to true will create a session cookie in the user browser as well as associated entry
    // in the session store even if the session has not been initialized with any data
    
    // in development mode we will set saveUnititialized to true

    module.exports = session(
    {
        secret: config.sessionSecret ,
        resave: false ,
        saveUninitialized: true
    })
}