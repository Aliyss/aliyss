
exports.information = {};

exports.help = {
	name: "Shutdown",
	description: "Does a shutdown on all the clients.",
	arguments: [],
	optional: [],
	information: Object.keys(exports.information)
};

exports.run = async (options, message, args, client) => {
	await process.emit('exit', 0)
};