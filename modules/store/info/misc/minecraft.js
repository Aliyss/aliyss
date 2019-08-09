const { getStatus } = require("mc-server-status");
const merge = require('deepmerge');

/*Local Functions*/
//Run File
function runFile(file, content, message, client) {

	let commandFile = require(file);
	commandFile.run(content, message, client);

}

function embedder(member, first_result) {
	return {
		title: first_result.title,
		description: null,
		color: 16776960,
		footer: null
	}
}

exports.information = {
	version: function(first_result) {
		return {
			fields: [
				{
					name: "_\n_**Version**".padEnd(24, `~`).replace(/~/g, "⠀"),
					value: 	first_result.version.name,
					inline: true
				}
			]
		}
	},
	ping: function(first_result) {
		return {
			fields: [
				{
					name: "_\n_**Ping**".padEnd(24, `~`).replace(/~/g, "⠀"),
					value: 	first_result.ping,
					inline: true
				}
			]
		}
	},
	players: function(first_result) {
		return {
			fields: [
				{
					name: "_\n_**Players**".padEnd(24, `~`).replace(/~/g, "⠀"),
					value: 	first_result.players.online + "/" + first_result.players.max,
					inline: true
				}
			]
		}
	},
	info: async function (first_result) {
		let override_embed = {

		};
		let extra_field = {
			fields: [
				{
					name: "_\n_",
					value: "_\n_",
					inline: true
				}
			]
		};

		let embed_arr = [
			this.ping(first_result),
			this.players(first_result),
			this.version(first_result),
			override_embed
		];

		return await merge.all(embed_arr)
	}
};

exports.help = {
	name: "Minecraft Server",
	description: "Gets the current server status of the given ip.",
	arguments: ["[Server-IP]"],
	optional: [],
	information: Object.keys(exports.information)
};

exports.run = async (options, message, args, client) => {

	try {

		let information = exports.information;

		let function_name = "info";
		let main_title = "Server Info for: ";


		let propertyNames = Object.keys(information).filter(function (propertyName) {
			return propertyName.indexOf(args[0]) === 0;
		});

		if (propertyNames.length !== 0) {
			function_name = propertyNames[0];
			args.shift()
		} else {
			function_name = "info";
		}

		let search = args.join(" ");

		const status = await getStatus(search);

		let base_embed = embedder(message.author, status);

		let embed = await merge(base_embed, await information[function_name](status));
		await runFile(options._return + "send.js", {embed: embed}, message, client);


	} catch (e) {
		console.log(e)
	}

};