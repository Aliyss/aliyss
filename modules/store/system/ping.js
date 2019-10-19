
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
	let content = "";

	if (message.createdTimestamp) {
		let m = await runFile(options._return + "send.js", "Pinging...", message, client);
		content += "Bot Latency: " + (m.createdTimestamp - message.createdTimestamp) + "ms."
		if (client.ws && client.ws.ping) {
			content += "\nAPI Latency: " + Math.round(client.ws.ping) + "ms."
		}
	}

	if (options.return_type === "string") {
		return content
	} else {
		await runFile(options._return + "send.js", content, message, client)
	}

};