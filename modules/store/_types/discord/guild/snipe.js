const database = require("../../../../../config/database/db_initialization.js").run();

exports.help = {
	name: "Snipe",
	description: "Gets a list of deleted mentions of the user.",
	arguments: [],
	optional: [],
	information: Object.keys({})
};

function clearSnipe(path, member) {
	return path.set({
		"snipes": null,
		"id": member.id
	}, {
		merge: true
	});
}

exports.run = async (options, message, args, client) => {
	let content = "";
	let path = database.collection(options.type).doc(client._profile.database.name).collection("users").doc(message.author.id);
	return path.get().then(doc => {
		if (doc.exists) {
			let docref = doc.data();
			if (docref["snipes"]) {
				Object.keys(docref["snipes"]).forEach(function(key) {
					content = content + `\n**Pinged by:** <@${docref["snipes"][key].authorID}>\n**Message:** ${docref["snipes"][key].cleanContent}\n\n`
				});
				clearSnipe(path, message.author)
			} else {
				content = "No messages found."
			}
		} else {
			content = "No messages found."
		}
		return {
			title: "Snipes",
			description: null,
			color: 6392832,
			fields: [
				{
					name: "_ _",
					value: content
				}
			],
			footer: null
		};
	});
};