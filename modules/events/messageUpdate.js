const database = require("../../config/database/db_initialization.js").run();

function setSnipe(path, message, member) {
	return path.set({
		"snipes": {
			[message.id]: JSON.parse(JSON.stringify(message, null, 4))
		},
		"id": member.user.id
	}, {
		merge: true
	});
}

exports.run = async (options, messageOld, client, messageNew) => {
	if (messageOld.mentions.members.array().length !== 0) {

		for (let i = 0; i < messageOld.mentions.members.array().length; i++) {
			let member = messageOld.mentions.members.array()[i];
			if (!member.user.bot && member.user.id !== messageOld.author.id) {
				let path = database.collection(options.type).doc(client._profile.database.name).collection("users").doc(member.user.id);
				setSnipe(path, messageOld, member)
			}
		}
	}
};