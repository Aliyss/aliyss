const fs = require("fs");
const parse = require('date-fns/parse');
let log = require('../../../../events/messageDelete/log.json');

/*Local Functions*/
//Run File
function runFile(file, content, message, client) {

	let commandFile = require(file);
	return commandFile.run(content, message, client);

}

exports.help = {
	name: "Snipe",
	description: "Gets a list of deleted mentions of the user.",
	arguments: [],
	optional: [],
	information: Object.keys({})
};

exports.run = async (options, message, args, client) => {
	let content = "";
	if (log[message.author.id]) {
		Object.keys(log[message.author.id]).forEach(function(key) {
			content = content + `\n**Pinged by:** ${log[message.author.id][key].authorID}\n**Message:** ${log[message.author.id][key].cleanContent}\n\n`
		});
		delete log[message.author.id];
		fs.writeFile('./modules/events/messageDelete/log.json', JSON.stringify(log, null, 4), function (err, data) {
			if (err) throw err;
		})
	} else {
		content = "No messages found."
	}

	await runFile(options._return + "send.js", content, message, client)

};