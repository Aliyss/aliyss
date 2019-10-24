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

exports.run = async (options, message, client) => {
	let members = message.mentions.members;
	if (!Array.isArray(members)) {
		members = message.mentions.members.array()
	}
	if (members.length !== 0) {
		for (let i = 0; i < members.length; i++) {
			let member = members[i];
			if (!member.user.bot && member.user.id !== message.author.id) {
				let path = database.collection(options.type).doc(client._profile.database.name).collection("users").doc(member.user.id);
				setSnipe(path, message, member)
			}
		}
	}
};