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

	let keys = Object.keys(client._guilds);
	let guilds = [];
	for (let i = 0; i < keys.length; i++) {
		guilds.push(await SetProfileSimple(database.collection(options.type).doc(client._profile.database.name).collection("guilds").doc(keys[i]), client._guilds[keys[i]]));
	}
	return guilds;
};