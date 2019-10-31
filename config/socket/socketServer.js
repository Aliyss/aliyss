const app = require('express')();

const server = app.listen(1890, function () {
	console.log(`[Processes] Listening on *:1890`);
});

const io = require('socket.io')(server);

const socketUtil = require('./socketUtil.js');

module.exports = (client) => {


	io.use((socket, next) => {

		let token = socket.handshake.query.token;
		console.log("Checking token...");

		if (!token || !(typeof token == "string")) return next(socket.emit('connect_error', 'Authentication error!'));

		let id = socketUtil.getIdFromToken(token, client);

		socket.userID = id;

		if (!client.owners[id]) return next(new Error('Authentication error!'));

		next();

	});

	io.on('connection', function (socket) {

		console.log('Connected! ' + socket);

		client.on('add user', (data) => {

			//if (data.userID !== socket.userID) return;

			socket.emit('new message', data.toSend);

		});

	});

};