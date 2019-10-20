const merge = require('deepmerge');

exports.information = {
	points: async function(member, function_name, options, client, message) {
		let commandFile = require("../../../../events/messageReceived.js");
		let data = await commandFile.info(options, message, client, member);
		let messages = 0;
		if (data['messageCount']) {
			if (data['messageCount'][client._profile.database.id]['guilds'][message.guild.id]) {
				messages = data['messageCount'][client._profile.database.id]['guilds'][message.guild.id]['messages']
			}
		}
		return {
			fields: [
				{
					name: "_\n_**Points**".padEnd(24, `~`).replace(/~/g, "⠀"),
					value: `\`\`${messages}\`\``,
					inline: true
				}
			]
		}
	},
	sentiment: async function(member, function_name, options, client, message) {
		let commandFile = require("../../../../events/messageReceived.js");
		let data = await commandFile.info(options, message, client, member);
		let messages = 0;
		if (data['messageCount']) {
			if (data['messageCount'][client._profile.database.id]['guilds'][message.guild.id] && data['messageCount'][client._profile.database.id]['guilds'][message.guild.id]['sentiment']) {
				messages = data['messageCount'][client._profile.database.id]['guilds'][message.guild.id]['sentiment']['score'].toFixed(5)
			}
		}
		return {
			fields: [
				{
					name: "_\n_**Sentiment**".padEnd(24, `~`).replace(/~/g, "⠀"),
					value: `\`\`${messages}\`\``,
					inline: true
				}
			]
		}
	},
	info: async function (member, function_name, options, client, message) {

		let embed_arr = [
			await this.sentiment(member, function_name, options, client, message),
			await this.points(member, function_name, options, client, message),
		];

		return await merge.all(embed_arr)
	}
};

exports.help = {
	name: "User Profile",
	description: "Gets the information about the current or given user.",
	optional: ["{user}"],
	arguments: [],
	information: Object.keys(exports.information)
};

exports.run = async (options, message, args, client) => {

	try {

		let information = exports.information;

		let function_name = "info";
		let main_title = "Profile of ";

		let propertyNames = Object.keys(information).filter(function (propertyName) {
			return propertyName.indexOf(args[0]) === 0;
		});

		if (propertyNames.length !== 0) {
			function_name = propertyNames[0];
			args.shift()
		} else {
			function_name = "info";
		}

		return await information[function_name](message.author, function_name, options, client, message);

	} catch (e) {
		console.log(e)
	}

};