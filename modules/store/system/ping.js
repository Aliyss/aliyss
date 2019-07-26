
/*Local Functions*/
//Run File
function runFile(file, content, message, client) {

	let commandFile = require(file);
	commandFile.run(content, message, client);

}

exports.run = (options, message, args, client) => {
	let content = "Pong!";
	if (client.ping) {
		content += " " + client.ping
	}
	runFile(options._return + "send.js", content, message, client)
};