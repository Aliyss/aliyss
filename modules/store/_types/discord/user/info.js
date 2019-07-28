const merge = require('deepmerge');
const Vibrant = require('node-vibrant');
const rgb = require('rgb-to-int');

/*Local Functions*/
//Run File
function runFile(file, content, message, client) {

	let commandFile = require(file);
	commandFile.run(content, message, client);

}

function embedder(member, palette) {
	let rgb_product = {
		red: palette['Vibrant']['rgb'][0],
		green: palette['Vibrant']['rgb'][1],
		blue: palette['Vibrant']['rgb'][2]
	};
	return {
		title: null,
		description: null,
		color: rgb(rgb_product),
		author: {
			name: member.title + member.user.username,
			url: "https://discordapp.com/users/" + member.id,
		},
		thumbnail: {
			url: member.user.displayAvatarURL()
		},
		footer: null
	}
}

exports.run = async (options, message, args, client) => {

	try {

		let information = {
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
			presence: function (member) {
				let main_status = "Playing:";
				let sub_status = "Not playing anything";
				if (member.user.presence.activity) {
					if (member.user.presence.activity.state) {
						sub_status = member.user.presence.activity.state;
						if (member.user.presence.activity.name) {
							main_status = member.user.presence.activity.name;
							if (member.user.presence.activity.name === "Spotify") {
								sub_status = sub_status + " - " + member.user.presence.activity.details
							} else {
								sub_status = sub_status + "\`\`\n\`\`" + member.user.presence.activity.details
							}
						}
					} else {
						if (member.user.presence.activity.name) {
							sub_status = member.user.presence.activity.name;
						}
					}
				}
				let imURL = member.user.displayAvatarURL();
				if (function_name === "presence") {
					if (member.user.presence.activity) {
						if (member.user.presence.activity.assets) {
							if (member.user.presence.activity.assets.largeImageURL) {
								imURL = member.user.presence.activity.assets.largeImageURL();
							} else if (member.user.presence.activity.assets.smallImageURL) {
								imURL = member.user.presence.activity.assets.smallImageURL();
							}
							if (member.user.presence.activity.assets.largeText) {
								main_status += " - " + member.user.presence.activity.assets.largeText
							}
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
					case 'invisible':
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
						url: member.user.displayAvatarURL()
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
			info: async function (member) {
				let override_embed = {
					description: `\`\`Created: ${member.user.createdTimestamp}\`\`\n\`\`Joined: ${member.joinedTimestamp}\`\``,
					timestamp: null,
					thumbnail: {
						url: member.user.displayAvatarURL()
					}
				};

				let embed_arr = [
					this.nickname(member),
					this.presence(member),
					this.status(member),
					this.roles(member),
					override_embed
				];

				return await merge.all(embed_arr)
			}
		};

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

		let member = message.guild.members.get(message.author.id);

		member.title = main_title;

		let imURL = member.user.displayAvatarURL().replace(".webp", ".png");
		if (function_name === "presence") {
			if (member.user.presence.activity) {
				if (member.user.presence.activity.assets) {
					if (member.user.presence.activity.assets.largeImageURL) {
						imURL = member.user.presence.activity.assets.largeImageURL().replace(".webp", ".png");
					} else if (member.user.presence.activity.assets.smallImageURL) {
						imURL = member.user.presence.activity.assets.smallImageURL().replace(".webp", ".png");
					}
				}
			}
		}

		let v = new Vibrant(imURL);
		v.getPalette().then((palette) => {
			let base_embed = embedder(member, palette);

			async function create_embed() {
				let embed = await merge(base_embed, await information[function_name](member, palette));
				await runFile(options._return + "send.js", {embed: embed}, message, client);
			}
			create_embed()
		});
	} catch (e) {
		console.log(e)
	}

};