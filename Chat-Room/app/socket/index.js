'use strict';
const helpers = require('../helpers');

module.exports = (io,app) =>
{
    // app.locals.chatroom is defined in app/index.js
    let allrooms = app.locals.chatrooms;

    // allrooms.push(
    // {
    //     room: "Good Food" ,
    //     roomID: "0001" ,
    //     users: []
    // })

    // allrooms.push(
    // {
    //     room: "Cloud Computing" ,
    //     roomID: "0002" ,
    //     users: []
    // })

    // Listening to the roomlist pipeline (namespace). This will handshake with the client socket
    io.of('/roomlist').on('connection', socket =>
    {
        // You can implement several events and eventsListeners using the below syntax and they are all
        // asynchronous i.e don't interfere with each other
        
        // Listening the getChatrooms events
        socket.on('getChatRooms', ()=>
        {
            let data = JSON.stringify(allrooms);

            socket.emit('chatRoomsList',data);
        })

        socket.on('createNewRoom', newRoomInput =>
        {
            if(!helpers.findRoomByName(allrooms, newRoomInput))
            {
                allrooms.push(
                {
                    room: newRoomInput ,
                    roomID: helpers.randonHex() ,
                    users: []
                })

                let data = JSON.stringify(allrooms);

                // Emit an updated list to the creator. Remember that emit() only sends the data to the creator
                // who created the chatroom and not to everyone who are connected at the time.
                socket.emit('chatRoomsList',data);

                // Emit an updated list to everyone connected to the rooms page except the sender.
                socket.broadcast.emit('chatRoomsList',data);
            }
        })

        console.log('Socket.io is connected to the client');
    })

    // **************************************************** chatroom.ejs ******************************************************************

    io.of('/chatter').on('connection', socket =>
    {
        // Join a chatroom

        socket.on('join', data =>
        {
            let userList = helpers.addUserToRoom(allrooms, data, socket);
            let usersArray = JSON.stringify(userList.users);

            // Update the list of active users as shown in the chatroom page to all the users except the sender.
            socket.broadcast.to(data.roomID).emit('updatedUserList', usersArray);

            // This will dispatch the 'updatedUserList' event back to the connected socket i.e the user who just joined in.
            socket.emit('updatedUserList', usersArray);
        })

        // When a socket exits , socket provides us an inbuilt event called 'disconnect'
        socket.on('disconnect', ()=>
        {
            // Find the room to which the socket is connected and purge the user
            let room = helpers.removeUserFromRoom(allrooms, socket);
            let usersArray = JSON.stringify(room.users);

            // Update the list of active users as shown in the chatroom page
            socket.broadcast.to(room.roomID).emit('updatedUserList',usersArray);
        })

        // When a new message arrives
        socket.on('newMessage',data =>
        {
            let datas = JSON.stringify(data);

            // socket.broadcast.to(data.roomID).emit('inMessage', data);
            // Use above one or below , both scoket.to and socket.broadcast.to do the same thing.
            socket.to(data.roomID).emit('inMessage', datas);
        })
    })
}