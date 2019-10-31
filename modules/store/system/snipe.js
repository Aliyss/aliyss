const database = require("../../../config/database/db_initialization.js").run();

exports.help = {
	name: "Snipe",
	description: "Gets a list of deleted mentions of the user.",
	arguments: [],
	optional: [],
	information: Object.keys({})
};

function clearSnipe(path, member, snipes) {
	return path.set({
		"snipes": snipes,
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
			let snipes = docref["snipes"];
			if (snipes && Object.keys(snipes).length > 0) {
				let count = 0;
				for (let key in snipes) {
					if (snipes.hasOwnProperty(key)) {
						//Now, object[key] is the current value
						if (message.guild.id === snipes[key].guild.id && !snipes[key].old) {
							content = content + `\n**Pinged by:** <@${snipes[key].authorID}>\n**Message:** ${snipes[key].cleanContent}\n\n`;
							snipes[key].old = true;
							count++;
						} else if (message.guild.id === snipes[key].guild.id && snipes[key].old && args[0] === "old") {
							content = content + `\n**Pinged by:** <@${snipes[key].authorID}>\n**Message:** ${snipes[key].cleanContent}\n\n`;
							count++;
						}
					}
				}
				if (count === 0) {
					content = "No messages found."
				}
				clearSnipe(path, message.author, snipes)
			} else {
				content = "No messages found."
			}
		} else {
			content = "No messages found."
		}
		return {
			title: args[0] ? "Snipes Old" : "Snipes",
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