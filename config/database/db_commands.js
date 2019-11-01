function SetProfileSimple(path, doc) {
	return new Promise((resolve) => {
		path.set(doc, {
			merge: true
		}).then(doc => {
			resolve(doc);
		})
	});
}

exports.upload = async (client, options) => {
	let database = require("./db_initialization.js").run();

	let keys = Object.keys(client._commands);
	let commands = [];
	for (let i = 0; i < keys.length; i++) {
		commands.push(await SetProfileSimple(database.collection("commands").doc(keys[i]), client._commands[keys[i]]));
	}
	return commands;
};