'use strict';

const express       =       require('express');
const router        =       express.Router();
const db            =       require('../db');
const crypto        =       require('crypto');

// Iterate through the routes object and mount the routes
let registerRoutes = (routes, method)=>
{
    for(let key in routes)
    {
        let type = typeof routes[key];
        
        // instanceof operator returns true if the element being cheked is instance of type array
        let isArray = type instanceof Array;

        if(type == 'object' && type!=null && !isArray)
        registerRoutes(routes[key],key);
        else
        {
            // Register the routes
            if(method == 'get')
            router.get(key,routes[key]);
            else if(method == 'post')
            router.post(key,routes[key]);
            else
            router.use(routes[key]);
        }
    }
}

// here 'routes' is an argument. If there is only one argument in the function then parathensis becomes optional. Below 
// can also be written as let route = (routes)=> {.......} 
let route = routes =>
{
    registerRoutes(routes);

    return router;
}

// Find a single user based on a key
let findOne = profileID =>
{
    return db.userModel.findOne({'profileId': profileID});
}

// Create new user and returns that instance
let createNewUser = profile =>
{
    return new Promise((resolve, reject)=>
    {
        let newChatuser = new db.userModel(
        {
            profileId: profile.id ,
            fullName: profile.displayName ,
            profilePic: profile.photos[0].value || ""
        })

        newChatuser.save(error=>
        {
            if(error)
            {
                console.log("Error in new user");
                // reject(error);
            }
            else
            resolve(newChatuser);
        })
    })
}

// A middleware that checks to see if the user is authenticated and logged in
let isAuthentication = (req, res, next)=>
{
    if(req.isAuthenticated())
    next();
    else
    res.redirect('/');
}

// Find a chatroom by a given name
let findRoomByName = (allrooms, room)=>
{
    // findindex() will return the index of the array if found else -1;
    let findRoom = allrooms.findIndex((element, index, array)=>
    {
        if(element.room == room)
        return true;
        
        return false;
    })

    if(findRoom==-1)
    return false;

    return true;
}

// The ES6 promisified version of findById
let findById = id =>
{
    return new Promise((resolve, reject)=>
    {
        db.userModel.findById(id, (error, user)=>
        {
            if(error)
            reject(error);
            else
            resolve(user);
        })
    })
}

// A function that generates the unique roomID
let randonHex = ()=>
{
    return crypto.randomBytes(24).toString('hex');
}

// Find a chatroom with a given ID
let findRoomById = (allrooms, roomID)=>
{
    // find() function returns the object if element found else returns undefined
    return allrooms.find((element, index, array)=>
    {
        if(element.roomID == roomID)
        return true;
        
        return false;
    })
}

// Add a user to a chatroom
let addUserToRoom = (allrooms, data, socket)=>
{
    // Get the room object
    let getRoom = findRoomById(allrooms, data.roomID);

    if(getRoom != undefined)
    {
        // Get the active user's ID ( objectID as used in session ). As we are not in the routing mechanism so we can't 
        // access the request stream directly (req.user) But as we have created the bridge in the express session 
        // middleware ( see io.use() in index.js inside app folder ). This enables us to lookup session based keys on
        // request stream that socket.io provides us using socket.request req.user is provided by the router.

        let userID = socket.request.session.passport.user;

        // Check to see if this user already exists in the chatroom
        let checkuser = getRoom.users.findIndex((element, index, array)=>
        { 
            if(element.userID == userID)
            return true;

            return false;
        })
        
        // If the user is already present in the room, remove him first.
        if(checkuser !== -1)
        {
            // splice(a,b) function will remove that user data whose index is 'a' and remove exaclty 'b' elements.
            getRoom.users.splice(checkuser, 1);
        }

        // Push the user datas into the room's users array.
        getRoom.users.push(
        {
            socketID: socket.id ,
            userID ,
            user: data.user ,  // data.user means username ( see chatrooms for information )
            userPic: data.userPic
        })

        // Join the room channel. This enables the user to send messages to only the chatroom he joins and not to
        // everyone who are connected to our app.
        socket.join(data.roomID);

        // Return the updated room object
        return getRoom; 
    }
}

// Find and purge the user when a socket disconnects
let removeUserFromRoom = (allrooms, socket) =>
{
    for(let room of allrooms)
    {
        // Finding the user
        let findUser = room.users.findIndex((element, index, array)=>
        {
            if(element.socketID == socket.id)
            return true;

            return false;
        })

        if( findUser != -1 )
        {
            // Remove the socket from this room
            socket.leave(room.roomID);

             // splice(a,b) function will remove that user data whose index is 'a' and remove exaclty 'b' elements
            room.users.splice(findUser, 1);

            return room;
        }

    }
}

module.exports = 
{
    // route: route
    // write above or below
    route ,
    findOne ,
    createNewUser ,
    findById ,
    isAuthentication ,
    findRoomByName ,
    randonHex ,
    findRoomById ,
    addUserToRoom ,
    removeUserFromRoom
}