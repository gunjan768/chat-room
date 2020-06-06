'use strict';

const helper        =       require('../helpers');
const passport      =       require('passport');
const config        =       require('../config');

module.exports = () =>
{
    let routes =
    {
        'get':
        {
            '/': (req,res,next) =>
            {
                res.render('login');
            },
            '/rooms': (req,res,next) =>
            {
                res.render('rooms',{user: req.user, host: config.host});
            },
            '/chat/:id': (req,res,next) =>
            {
                // Find a chatroom with the given id and render if it is found
                
                let chatRooms = req.app.locals.chatrooms;
                let roomId = req.params.id;

                let getRoom = helper.findRoomById(chatRooms,roomId);

                if(getRoom == undefined)
                return next();
                else
                {
                    res.render('chatroom',
                    {
                        user: req.user, 
                        host: config.host ,
                        room: getRoom.room ,
                        roomID: getRoom.roomID
                    });
                }   
            },
            // '/getsession':(req,res,next) =>
            // {
            //     res.send(req.session.fav);
            // },
            // '/setsession':(req,res,next) =>
            // {
            //     req.session.fav = "red";
            //     res.send('chatroom');
            // }

            // when you click the button 'login with Facebook' then this url will get called and so passport.authenticate() 
            // It will call passport.use() for facebook ( see index.js page of auth section ).
            '/auth/facebook': passport.authenticate('facebook'),

            // It will be called when user allows the permission to access his/her profile. It will come back here along 
            // with a code. This code is used to exchange with user's profile (this code signifies that user is 
            // authenticated). Again passport.authenticate() will be get called but this time we have a code hence passport
            // will try to exchange the user's profile with this code.
            '/facebook/callback': passport.authenticate('facebook',
            {
                successRedirect: '/rooms' ,
                failureRedirect: '/'
            }),
            '/auth/twitter': passport.authenticate('twitter'),
            '/login/callback': passport.authenticate('twitter', 
            {
                successRedirect: '/rooms',
                failureRedirect: '/'
            }),
            '/logout': (req,res,next) =>
            {
                req.logout();
                res.redirect('/');
            }
        },

        'post': 
        {

        },

        'NA': (req,res,next) =>
        {
            // process.cwd() will give you the location of the process and here process means server file
            // which is server.js ( cwd - Currently Working Directory )
            var path = process.cwd()+'/views/404.htm';

            res.status(404).sendFile(path);
        }
    }

    return helper.route(routes);

    // route(routes) ---> route is function and routes is an argument
}