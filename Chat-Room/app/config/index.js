'use strict';

let env = process.env.NODE_ENV;

if(env == 'production')
{
    // offer production stage environment variables

    module.exports = 
    {
        host: process.env.host || "" ,
        dbURI: process.env.dbURI ,
        sessionSecret: process.env.sessionSecret ,
        fb: 
        {
            clientID: process.env.fbClientID,
            clientSecret: process.env.fbClientSecret,
            callbackURL: process.env.host + "/facebook/callback",
            profileFields: ['id', 'displayName', 'photos'],
            proxy: true
        },
        twitter: 
        {
            consumerKey: process.env.twConsumerKey,
            consumerSecret: process.env.twConsumerSecret,
            callbackURL: process.env.host + "/login/callback",
            profileFields: ['id', 'displayName', 'photos']
        },
    }
}
else
{
    // offer development stage settings and data

    module.exports = require('./development.json');
}