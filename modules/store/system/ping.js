
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
	let m = await runFile(options._return + "send.js", "Pinging...", message, client);
	let tiem = m.createdTimestamp - message.createdTimestamp;
	content += "Response Time: " + (tiem) + "ms.";
	if (client.ws && client.ws.ping) {
		content += "\nAPI Latency: " + Math.round(client.ws.ping) + "ms."
	}
	return content;

};