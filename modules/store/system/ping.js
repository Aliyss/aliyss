
/*Local Functions*/
//Run File
function runFile(file, content, message, client) {

	let commandFile = require(file);
	return commandFile.run(content, message, client);

}

exports.help = {
	name: "Ping",
	description: "Returns Pong and maybe a bit more information to the swiftness of the client.",
	arguments: [],
	optional: [],
	information: Object.keys({})
};

exports.run = async (options, message, args, client) => {
	let content = "Pong!";
	if (message.createdTimestamp) {
		let m = await runFile(options._return + "send.js", "Pinging...", message, client);
		content += " Latency: " + (m.createdTimestamp - message.createdTimestamp) + "ms."
	}

	scontent = {
		body: content + `@${message.mentions[0].split("@")[0]} !`,
		mentions: message.mentions
	};

	await runFile(options._return + "send.js", scontent, message, client)
};