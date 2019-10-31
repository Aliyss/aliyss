const merge = require('deepmerge');
const Vibrant = require('node-vibrant');
const rgb = require('rgb-to-int');
const Table = require('easy-table');

/*Local Functions*/
//Run File
function runFile(file, content, message, client) {

	let commandFile = require(file);
	return commandFile.run(content, message, client);

}

function embedder(member, palette) {
	let rgb_product = {
		red: 145,
		green: 94,
		blue: 86
	};
	if (palette['Vibrant'] !== null) {
		rgb_product = {
			red: palette['Vibrant']['rgb'][0],
			green: palette['Vibrant']['rgb'][1],
			blue: palette['Vibrant']['rgb'][2]
		};
	}

	return {
		title: null,
		description: null,
		color: rgb(rgb_product),
		author: {
			name: member.title + (member.user.cleanName || member.user.username),
			url: "https://discordapp.com/users/" + member.id,
		},
		thumbnail: {
			url: member.user.displayAvatarURL()
		},
		footer: null
	}
}

exports.information = {
	id: function(member) {
		return {
			fields: [
				{
					name: "_\n_**ID**".padEnd(24, `~`).replace(/~/g, "⠀"),
					value: `\`\`${member.id}\`\``,
					inline: true
				}
			]
		}
	},
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
	bot: function(member) {
		return {
			fields: [
				{
					name: "_\n_**Bot?**".padEnd(24, `~`).replace(/~/g, "⠀"),
					value: `\`\`${member.user.bot}\`\``,
					inline: true
				},
			]
		}
	},
	roles: function(member) {
		return {
			fields: [
				{
					name: `_\n_**Roles** (\`\`${member.roles.array().length}\`\`)`,
					value: member.roles.map(r => r).sort((a, b) => a['position'] - b['position']).reverse().join(' \`\`|\`\` ')
				}
			]
		}
	},
	presence: function (member, function_name) {
		let main_status = "Playing:";
		let sub_status = "Not playing anything";
		if (member.user.presence.activity) {
			if (member.user.presence.activity.state) {
				sub_status = member.user.presence.activity.state;
				if (member.user.presence.activity.name) {
					main_status = member.user.presence.activity.name;
					if (member.user.presence.activity.name === "Spotify") {
						sub_status = sub_status + " - " + member.user.presence.activity.details
					} else if (member.user.presence.activity.name === "Custom Status") {
						main_status = "Playing:";
						sub_status = "Not playing anything";
					} else {
						sub_status = sub_status + "\`\`\n\`\`" + member.user.presence.activity.details
					}
				}
			} else {
				if (member.user.presence.activity.name) {
					sub_status = member.user.presence.activity.name;
				}
				if (member.user.presence.activity.type) {
					main_status = member.user.presence.activity.type[0] + member.user.presence.activity.type.substr(1).toLowerCase() + ":";
				}
			}
		}
		let imURL = member.user.displayAvatarURL();

		if (member.user.presence.activity) {
			if (member.user.presence.activity.assets) {
				if (function_name === "presence") {
					if (member.user.presence.activity.assets.largeImageURL) {
						imURL = member.user.presence.activity.assets.largeImageURL();
					} else if (member.user.presence.activity.assets.smallImageURL) {
						imURL = member.user.presence.activity.assets.smallImageURL();
					}
				}
				if (member.user.presence.activity.assets.largeText) {
					main_status += " - " + member.user.presence.activity.assets.largeText
				}
			}
		}

		return {
			thumbnail: {
				url: imURL
			},
			fields: [
				{
					name: ("_\n_**" + main_status.toString() + "**").padEnd(24, `~`).replace(/~/g, "⠀"),
					value: `\`\`${sub_status}\`\``,
					inline: true
				},
			]
		}
	},
	status: function (member) {

		let status_i;
		let status_icon;

		switch (member.user.presence.status) {
			case 'dnd':
				status_i = "Do Not Disturb";
				status_icon = "<:dnd:549797006059634690>";
				break;
			case 'idle':
				status_i = "Idle";
				status_icon = "<:idle:549798737233444894>";
				break;
			case 'online':
				status_i = "Online";
				status_icon = "<:online:549798765284950017>";
				break;
			case 'offline':
				status_i = "Offline";
				status_icon = "<:offline:549799125797830658>";
				break;
			default:
				status_i = "Online";
				status_icon = "<:online:549799125797830658>";
				break;
		}

		if (member.user.presence.activity) {
			if (member.user.presence.activity.streaming) {
				status_i = "Streaming";
				status_icon = "<:streaming:549806312356053012>";
			}
			if (member.user.presence.activity.name && member.user.presence.activity.name === "Custom Status") {
				status_i = member.user.presence.activity.state;
			}
		}



		return {
			fields: [
				{
					name: "_\n_**Status**".padEnd(24, `~`).replace(/~/g, "⠀"),
					value: status_icon + `\`\`${status_i}\`\``,
					inline: true
				}
			]
		}
	},
	avatar: function(member) {
		return {
			thumbnail: null,
			image: {
				url: member.user.displayAvatarURL().replace(".webp", ".png") + "?size=2048"
			},
		}
	},
	nickname: function (member) {
		let main_nickname = "No nickname set.";

		if (member.nickname) {
			main_nickname = member.nickname
		}

		return {
			fields: [
				{
					name: "_\n_**Nickname**".padEnd(24, `~`).replace(/~/g, "⠀"),
					value: `\`\`${main_nickname}\`\``,
					inline: true
				}
			]
		}

	},
	info: async function (member, function_name, options, client, message) {
		let override_embed = {
			description: `\`\`Created: ${member.user.createdTimestamp}\`\`\n\`\`Joined: ${member.joinedTimestamp}\`\``,
			timestamp: null,
			thumbnail: {
				url: member.user.displayAvatarURL()
			}
		};

		let embed_arr = [
			this.nickname(member),
			this.presence(member, function_name),
			this.status(member),
			await this.points(member, function_name, options, client, message),
			this.roles(member),
			override_embed
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

		let members = await runFile('../~parser/user_search.js', args, message, client);

		if (args.length === 0) {
			members.push(message.guild.members.get(message.author.id));
		}
		
		let embeds = [];

		for (let i = 0; i < members.length; i++) {
			members[i].title = main_title;
			let imURL = members[i].user.displayAvatarURL().replace(".webp", ".png");
			if (function_name === "presence") {
				if (members[i].user.presence.activity) {
					if (members[i].user.presence.activity.assets) {
						if (members[i].user.presence.activity.assets.largeImageURL) {
							imURL = members[i].user.presence.activity.assets.largeImageURL().replace(".webp", ".png");
						} else if (members[i].user.presence.activity.assets.smallImageURL) {
							imURL = members[i].user.presence.activity.assets.smallImageURL().replace(".webp", ".png");
						}
					}
				}
			}

			let v = new Vibrant(imURL);
			let x = await v.getPalette().then((palette) => {
				let base_embed = embedder(members[i], palette);

				async function create_embed() {
					return merge(base_embed, await information[function_name](members[i], function_name, options, client, message));
				}
				return create_embed()
			});
			x.username = members[i].user.cleanName + "#" + members[i].user.discriminator;
			embeds.push(x)
		}

		if (embeds.length === 1) {
			return embeds[0]
		} else {
			let t = new Table;

			for (let i = 0; i < embeds.length; i++) {
				t.cell("Username", embeds[i].username);
				for (let j = 0; j < embeds[i].fields.length; j++) {
					t.cell(embeds[i].fields[j].name.replace(/⠀/g, "").replace(/_/g, "").replace(/\*/g,"").replace(/:/g,"").split("-")[0].split(" ")[0].trim(), embeds[i].fields[j].value.replace(/<.*>/, '').replace(/`/g, "").trim());
				}
				t.newRow();
			}
			if (embeds.length > 0) {
				return `\`\`\`${t.toString()}\`\`\``
			} else {
				return "``⛔ Error: " + "No user with the mentioned name has been found." + "``"
			}
		}

	} catch (e) {
		console.log(e)
	}

};