const Discord = require("discord.js");

exports.information = {};

exports.help = {
	name: "Steal",
	description: "Steals stuff from other users or bots.",
	arguments: [],
	optional: [],
	information: Object.keys(exports.information)
};

exports.run = async (options, message, args, client) => {
	const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {time: 100000});

	message.channel.send("Please input the name of the command you want to save to.");

	let commandname = false;
	let mentionbool = mentioned(message);
	let receives = false;
	let embedtype = false;
	let lembedtype = false;
	let regex = false;

	collector.on('collect', async m => {

		if (!receives && mentionbool) {
			receives = await received(m, mentionbool)
		}

		if (m.content === "end") {
			collector.stop("user_end")
		} else if (!(commandname ? commandname : commandname = commandnamed(m))) {
			m.channel.send("No command has been given.");
		} else if (!(mentionbool ? mentionbool : mentionbool = mentioned(m))) {
			m.channel.send("No member has been mentioned. Mention a member in this server.");
		} else if (!receives) {
			m.channel.send("Please use a command or receive the desired message from your mentioned user.");
		} else if (receives.embeds && receives.embeds[0]) {
			if (!(embedtype ? embedtype : embedtype = embedtyped(m, receives.embeds[0]))) {
				m.channel.send("Please define the field you want to lookup: " + `\`\`\`js\n${JSON.stringify(receives.embeds[0])}\`\`\``);
			} else if (!(regex ? regex : regex = regexed(m, embedtype.content))) {
				m.channel.send("Please define the regex for your lookup:");
			} else if (!(lembedtype ? lembedtype : lembedtype = embedtyped(m, receives.embeds[0]))){
				m.channel.send("Please define your return field:")
			} else {
				let capture_kid = {
					id: mentionbool.user.id,
					embed: embedtype,
					search: regex,
					value: lembedtype,
					command: commandname
				};
				m.channel.send(`\`\`\`js\n${JSON.stringify(capture_kid, null, 4)}\`\`\``);
				if (!client._guilds[m.guild.id]["capturer"]) {
					client._guilds[m.guild.id]["capturer"] = {}
				}
				client._guilds[m.guild.id]["capturer"][capture_kid.id] = capture_kid;
				collector.stop("client_end")
			}
		} else if (receives.content) {
			m.channel.send("Got content but wont do nothing cause its text. Sorry.")
		}

	});

	collector.on("end", ((collected, reason) => {
		switch (reason) {
			case "user_end":
				message.channel.send("Steal Setup has ended.");
				break;
			case "client_end":
				message.channel.send("Steal Setup has ended. Database has been updated.");
				break;
			default:
				message.channel.send("Steal Setup has errored out and stopped for some unknown reason. ¯\\_(ツ)_/¯");
				break;
		}
	}))
};

let received = async (m, mentions) => {
	return await new Discord.MessageCollector(m.channel, m => m.author.id === mentions.user.id, {time: 50000}).next
};

let commandnamed = (m) => {
	if (m.content.length > 0) {
		return m.content
	} else {
		return false
	}
};

let mentioned = (m) => {
	let members = m.mentions.members;
	if (!Array.isArray(members)) {
		members = m.mentions.members.array()
	}
	return members[0];
};

let embedtyped = (m, embed) => {
	let arr = m.content.split(".");
	let content = embed;
	for (let i = 0; i < arr.length; i++) {
		if (content[arr[i]]) {
			content = content[arr[i]]
		} else {
			return false;
		}
	}
	return {content: content, index: m.content};
};

let regexed = (m, embed) => {
	try {
		let reg = new RegExp(m.content, "g");
		if (!!embed.match(reg)[0]) {
			return m.content
		} else {
			return false
		}
	} catch (e) {
		return false
	}
};