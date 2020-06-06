'use strict';

//Social auhtentication logic
const authen        =       require('./auth');

// accessing the anonymous function that is being exported and created in "auth/index.js" 
const auth          =       authen();   

//create an IO Server instance
let ioServer = app =>
{
    app.locals.chatrooms = []

    // This will bring the server instance from the http module. Passing app as a parameter will
    // bind the express app to the newly created sever instance
    const server = require('http').Server(app);

    // Binding the server instance to the socket.io
    const io = require('socket.io')(server);

    // This will act as a bridge between session and socket.io. As we want the information (like email) about the
    // current logged in user and we can do it by accessing request variables. We need to access req variables
    // in socket module but we don't have permission to do so. We use io.use() which will run for every socket
    // instance that connects to the server.
    io.use((socket,next)=>
    {
        require('./session')(socket.request,{},next);

        // As there is nothing to write back to session so we will leave the response part empty.
    })

    // This will bring and executes all the codes that we will write in the context of io server function.
    require('./socket')(io,app);

    // Remember, here we are returning server instance and not the 'io' instance to which server is already locked in.
    return server;
}

module.exports = 
{
    router: require('./routes')() ,
    session: require('./session') ,
    ioServer
}