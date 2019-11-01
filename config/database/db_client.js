const database = require('./db_initialization.js').run();

exports.guilds = async (client, options) => {
	let guilds = {};
	await database.collection(options.type).doc(client._profile.database.name).collection("guilds").get().then(snapshot => {
		snapshot.forEach(doc => {
			guilds[doc.id] = doc.data()
		});
	}).catch(err => {
		console.log('Error getting documents', err);
	});
	return guilds;
};

exports.guildSet = async (client, options, guild) => {

	let guildData = {
		"prefixes": [],
		"id": guild.id,
		"capturer": {}
	};

	await database.collection(options.type).doc(client._profile.database.name).collection("guilds").doc(guild.id).set(guildData, {
		merge: true
	});

	return guildData;
};