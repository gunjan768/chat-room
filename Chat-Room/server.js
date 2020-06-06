'use strict';

const express 		= 		require('express');
const chatCat		=		require('./app');
const passport		=		require('passport');

const app = express();

app.set('port',process.env.PORT || 3000);
app.use(express.static('public'));
app.set('view engine','ejs');

let port = app.get('port');

// channeling 

// session must come before routers
app.use(chatCat.session);

// This brings in passport middleware function designed for integrating with express
// It hooks up passport to the response(res) and the request(req) stream that express provides us
app.use(passport.initialize());

// It hooks up express session middleware with passport 
app.use(passport.session());

app.use('/',chatCat.router);

chatCat.ioServer(app).listen(port, () =>
{
	console.log("Server is running on Port : ",port);
})