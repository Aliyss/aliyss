

/*Local Functions*/
//Run File
function messageFile(file, object) {

	let commandFile = require(file);
	return commandFile.run(object);

}

exports.run = async (content, message, client) => {

	if (content.embed) {
		let text = "";
		let embed = content.embed;

		if (embed.title) {
			text += embed.title.trim() + "\n";
		}

		if (embed.description) {
			text += "\n" + embed.description.trim() + "\n";
		}

		for (let i = 0; i < embed.fields.length; i++) {
			text += "\n" + embed.fields[i].name.trim().replace("_\n_", "");
			text += "\n" + embed.fields[i].value.trim().replace("_\n_", "") + "\n";
		}

		text = text.replace(/\*\*/g, "*");
		text = text.replace(/``/g, "```");
		text = text.replace(/````/g, "```");

		content = text;
	}

	if (message.id.fromMe === true) {
		message.me = message.from;
		message.from = message.to;
	}

	let m = await client.sendMessage(message.from, content);

	m = messageFile('../discordify.js', m);

	if (message.id.fromMe === true) {
		message.from = message.me;
	}

	return m
};