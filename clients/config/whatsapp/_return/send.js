

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

	await client.sendMessage(message.from, content)
};