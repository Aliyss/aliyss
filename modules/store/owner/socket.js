//const socketUtil = require('../../../config/rest/socketUtil.js');
exports.information = {};

exports.help = {
	name: "Socket",
	description: "Creates a socket login token.",
	arguments: [],
	optional: [],
	information: Object.keys(exports.information)
};

exports.run = async (options, message, args, client) => {
	//return socketUtil.createToken(client, message.author.id);
};