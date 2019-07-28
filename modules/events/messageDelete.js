const fs = require("fs");
let log = require('./messageDelete/log.json');


exports.run = async (options, message, client) => {
	if (message.mentions.members.array().length !== 0) {
		for (let i = 0; i < message.mentions.members.array().length; i++) {
			let member = message.mentions.members.array()[i];
			if (log[member.user.id]) {
				log[member.user.id][message.id] = JSON.parse(JSON.stringify(message, null, 4))
			} else {
				log[member.user.id] = {
					[message.id]: JSON.parse(JSON.stringify(message, null, 4))
				}
			}
		}

		fs.writeFile('./modules/events/messageDelete/log.json', JSON.stringify(log, null, 4), function (err, data) {
			if (err) throw err;
		})
	}
};