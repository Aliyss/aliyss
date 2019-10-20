
exports.run = async (content, message) => {
	if (content.embed && content.embed.fields) {
		for (let i = 0; i < content.embed.fields.length; i++) {
			if (content.embed.fields[i].value === null || content.embed.fields[i].value === undefined) {
				content.embed.fields[i].value = "No information provided."
			} else if (content.embed.fields[i].value.length > 1024) {
				if (content.embed.fields[i].value.endsWith("```")) {
					content.embed.fields[i].value = content.embed.fields[i].value.substring(0, 1017) + "...```";
				} else if (content.embed.fields[i].value.endsWith("``")) {
					content.embed.fields[i].value = content.embed.fields[i].value.substring(0, 1018) + "...``";
				} else if (content.embed.fields[i].value.endsWith("`")) {
					content.embed.fields[i].value = content.embed.fields[i].value.substring(0, 1019) + "...`";
				} else {
					content.embed.fields[i].value = content.embed.fields[i].value.substring(0, 1020) + "...`";
				}
			}
		}
	}
	return await message.channel.send(content)
};