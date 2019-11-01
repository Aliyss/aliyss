const rgb = require('rgb-to-int');
const merge = require('deepmerge');

function runFile(file, content, message, client) {

	let commandFile = require(file);
	return commandFile.run(content, message, client);

}

function embedder(members, main_title) {
	let rgb_product = {
		red: 145,
		green: 94,
		blue: 86
	};

	return {
		title: null,
		description: null,
		color: rgb(rgb_product),
		author: {
			name: main_title + members.map(member => " " + member.user.username)
		},
		footer: null
	}
}

exports.information = {
	gif: async function (members, function_name, options, client, message) {
		let commandFile = require("../../../../events/messageReceived.js");
		let data = await commandFile.commands(options, client, "interaction-hugs");
		let randomNr = Math.floor(Math.random() * ((data["captured"].length - 1) + 1));
		let image_url = data["captured"][randomNr];
		return {
			image: {
				url: image_url
			}
		}
	},
	info: async function (members, function_name, options, client, message) {
		let override_embed = {
			timestamp: null,
			thumbnail: null
		};

		let embed_arr = [
			await this.gif(members, function_name, options, client),
			override_embed,
		];

		return await merge.all(embed_arr)
	}
};

exports.help = {
	name: "Hugs",
	description: "Give and Receive hugs.",
	arguments: [],
	optional: ["members"],
	information: Object.keys(exports.information)
};

exports.run = async (options, message, args, client) => {

	try {

		let information = exports.information;

		let function_name = "info";
		let main_title = `${message.author.username} hugs`;

		let propertyNames = Object.keys(information).filter(function (propertyName) {
			return propertyName.indexOf(args[0]) === 0;
		});

		if (propertyNames.length !== 0) {
			function_name = propertyNames[0];
			args.shift()
		} else {
			function_name = "info";
		}

		let members = await runFile('../~parser/user_search.js', args, message);

		if (args.length === 0) {
			members.push(message.guild.members.get(message.author.id));
		}

		return merge(embedder(members, main_title), await information[function_name](members, function_name, options, client, message));

	} catch (e) {
		console.log(e)
	}

};