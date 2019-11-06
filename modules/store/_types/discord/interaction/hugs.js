const rgb = require('rgb-to-int');
const merge = require('deepmerge');

function runFile(file, content, message, client) {

	let commandFile = require(file);
	return commandFile.run(content, message, client);

}

function embedder(members, main_title, message) {
	let rgb_product = {
		red: 145,
		green: 94,
		blue: 86
	};

	let self = false;

	let authorname = main_title + members.map(member => {
		if (member.user.id === message.author.id) {
			self = true;
			return " themselves :("
		} else if (member.user.id === message.client.user.id) {
			return " me :)"
		} else {
			return " " + member.user.username
		}
	});

	authorname = authorname.split(", ").slice(0, -1).join(", ") + " and " + authorname.split(", ")[authorname.split(", ").length - 1];

	if (members.length === 1 && self) {
		authorname = "Don't hug yourself. It's unhealthy. Take a pillow instead."
	}

	return {
		title: null,
		description: null,
		color: rgb(rgb_product),
		author: {
			name: authorname
		},
		footer: null
	}
}

exports.information = {
	gif: async function (members, function_name, options, client, message) {
		let image_url = "";

		if (members.length === 1 && members[0].user.id === message.author.id) {
			image_url = "https://i.imgur.com/efFMCTI.gif"
		} else {
			let commandFile = require("../../../../events/messageReceived.js");
			let data = await commandFile.commands(options, client, "interaction-hugs");
			let randomNr = Math.floor(Math.random() * ((data["captured"].length - 1) + 1));
			image_url = data["captured"][randomNr];
		}

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
			await this.gif(members, function_name, options, client, message),
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
		let main_title = `${message.author.username} hugged`;

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

		if (members.length === 0) {
			members.push(message.guild.members.get(client.user.id));
		}

		return merge(embedder(members, main_title, message), await information[function_name](members, function_name, options, client, message));

	} catch (e) {
		console.log(e)
	}

};