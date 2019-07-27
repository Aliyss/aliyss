
let log = require('../../../../events/messageDelete/log.json');

/*Local Functions*/
//Run File
function runFile(file, content, message, client) {

	let commandFile = require(file);
	return commandFile.run(content, message, client);

}

exports.run = async (options, message, args, client) => {
	let content = "";

	if (log[message.author.id]) {
		for (let i = 0; i < log[message.author.id].length; i++) {
			content = content + `\n**Pinged by:** ${log[message.author.id][i]['authorID']}\n**Message:** ${log[message.author.id][i]['content']}`
		}
	} else {
		content = "No messages found."
	}

	await runFile(options._return + "send.js", content, message, client)

};