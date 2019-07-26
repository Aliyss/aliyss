
/*Local Functions*/
//Run File
function runFile(file, content, message, client) {

	let commandFile = require(file);
	commandFile.run(content, message, client);

}

exports.run = (options, message, args, client) => {
	runFile(options._return + "send.js", "Pong", message, client)
};