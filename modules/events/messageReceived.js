


/*Local Functions*/
//Run File
function runFile(file) {

	let commandFile = require(file);
	return commandFile.run();

}

function SetProfile(path, bot_id, guild_id, createdTime, input, user_id, isbot, score=0, count=0) {
	//Firebase: Get Command Document
	return path.set({
		"messageCount": {
			[bot_id]: {
				"guilds": {
					[guild_id]: {
						"messages": input,
						"sentiment": {
							score: score,
							count: count
						},
						"time_stamp": createdTime
					}
				}
			}
		},
		"id": user_id,
		"isBot": isbot
	}, {
		merge: true
	}).then(doc => {
		return doc
	})
}

function GetProfile(options, bot_id, guild_id, createdTime, input, user_id, isbot, client) {
	if (!!!client._users[user_id]) {
		let database = runFile("../../config/database/db_initialization.js");
		let path = database.collection(options.type).doc(client._profile.database.name).collection("users").doc(user_id);
		return new Promise(function(resolve) {
			//Firebase: Get Profile Document
			path.get().then(doc => {
				if (doc.exists) {
					resolve(doc.data())
				} else {
					resolve(SetProfile(path, bot_id, guild_id, createdTime, input, user_id, isbot));
				}
			});
		});
	} else {
		return client._users[user_id]
	}

}

exports.run = async (options, message, client, nlpManager) => {

	let bot_id = client.user.id;
	if (client._profile.database.id) {
		bot_id = client._profile.database.id
	}
	if (message.guild === null) {
		console.log(new Date() + " " + message.author.username + " tried to use the DM's. Command " + message.content);
		return
	}
	let guild_id = message.guild.id;
	let user_id = message.author.id;
	let isbot = message.author.bot;
	let createdTime = parseInt(message.createdTimestamp);
	let cooldown = 60000;
	let input = 1;
	let doc = await GetProfile(options, bot_id, guild_id, createdTime, input, user_id, isbot, client);
	let response = await nlpManager.process(message.content);

	let score = doc.messageCount[bot_id]["guilds"][guild_id]["sentiment"]["score"];
	let count = doc.messageCount[bot_id]["guilds"][guild_id]["sentiment"]["count"];

	doc.messageCount[bot_id]["guilds"][guild_id]["sentiment"]["score"] = (score * count + response.sentiment.score) / (count+1);
	doc.messageCount[bot_id]["guilds"][guild_id]["sentiment"]["count"]++;

	if (doc.messageCount[bot_id]["guilds"][guild_id] && doc.messageCount[bot_id]["guilds"][guild_id]["time_stamp"] + cooldown <= createdTime) {
		doc.messageCount[bot_id]["guilds"][guild_id]["time_stamp"] = createdTime;
		doc.messageCount[bot_id]["guilds"][guild_id]["messages"] += 1;
	}

	client._users[user_id] = doc;
};

exports.info = async (options, message, client, user) => {
	let bot_id = client.user.id;
	if (client._profile.database.id) {
		bot_id = client._profile.database.id
	}
	let isBot = user.user.bot;
	let guild_id = message.guild.id;
	let input = 0;
	let user_id = user.user.id;
	return await GetProfile(options, bot_id, guild_id, 0, input, user_id, isBot, client)
};

exports.activity = async (options, client, message) => {
	let database = runFile("../../config/database/db_initialization.js");
	let chartData = [];
	let bot_id = client.user.id;
	if (client._profile.database.id) {
		bot_id = client._profile.database.id
	}
	await database.collection(options.type).doc(client._profile.database.name).collection("users").get()
		.then(querySnapshot => {
			querySnapshot.docs.map(doc => {
				let docref = doc.data();
				if (docref.id && !!!docref.isBot && docref['messageCount'] && docref['messageCount'][bot_id]['guilds'][message.guild.id] &&  docref['messageCount'][bot_id]['guilds'][message.guild.id].messages > 0) {
					chartData.push({
						user_id: docref.id,
						points: docref['messageCount'][bot_id]['guilds'][message.guild.id].messages
					});
				}
			})
		});
	return chartData
};

exports.sentiment = async (options, client, message) => {
	let database = runFile("../../config/database/db_initialization.js");
	let chartData = [];
	let bot_id = client.user.id;
	if (client._profile.database.id) {
		bot_id = client._profile.database.id
	}
	await database.collection(options.type).doc(client._profile.database.name).collection("users").get()
		.then(querySnapshot => {
			querySnapshot.docs.map(doc => {
				let docref = doc.data();
				if (docref.id && !!!docref.isBot && docref['messageCount'] && docref['messageCount'][bot_id]['guilds'][message.guild.id] && docref['messageCount'][bot_id]['guilds'][message.guild.id]["sentiment"] && docref['messageCount'][bot_id]['guilds'][message.guild.id]["sentiment"].score) {
					chartData.push({
						user_id: docref.id,
						points: docref['messageCount'][bot_id]['guilds'][message.guild.id]["sentiment"].score.toFixed(2)
					});
				}
			})
		});
	return chartData
};