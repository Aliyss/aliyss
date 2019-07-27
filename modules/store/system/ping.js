
/*Local Functions*/
//Run File
function runFile(file, content, message, client) {

	let commandFile = require(file);
	return commandFile.run(content, message, client);

}

exports.run = async (options, message, args, client) => {
	let content = "Pong!";
	if (message.createdTimestamp) {
		let m = await runFile(options._return + "send.js", "Pinging...", message, client);
		content += " Latency: " + (m.createdTimestamp - message.createdTimestamp) + "ms."
	}
	await runFile(options._return + "send.js", content, message, client)
};