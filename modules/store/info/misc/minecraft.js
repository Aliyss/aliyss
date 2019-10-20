const mcping = require('minecraft-ping');
const merge = require('deepmerge');

/*Local Functions*/
//Run File
function runFile(file, content, message, client) {

	let commandFile = require(file);
	commandFile.run(content, message, client);

}

function embedder(member, first_result) {
	return {
		title: "Minecraft Server Info: " + (first_result.motd || "Error Received"),
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
					value: 	first_result.gameVersion,
					inline: true
				}
			]
		}
	},
	ping: function(first_result) {
		return {
			fields: [
				{
					name: "_\n_**Ping Version**".padEnd(24, `~`).replace(/~/g, "⠀"),
					value: 	first_result.pingVersion,
					inline: true
				}
			]
		}
	},
	protocol: function(first_result) {
		return {
			fields: [
				{
					name: "_\n_**Protocol Version**".padEnd(24, `~`).replace(/~/g, "⠀"),
					value: 	first_result.protocolVersion,
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
					value: 	first_result.playersOnline + "/" + first_result.maxPlayers,
					inline: true
				}
			]
		}
	},
	name: function(first_result) {
		return {
			fields: [
				{
					name: "_\n_**Players**".padEnd(24, `~`).replace(/~/g, "⠀"),
					value: 	first_result.motd,
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

		let status = await pingMC(search);

		let base_embed = embedder(message.author, status);

		return await merge(base_embed, await information[function_name](status));

	} catch (e) {
		console.log(e)
	}

};

let pingMC = (search) => {
	return new Promise((resolve, reject) => {
		mcping.ping_fe01fa({host:search, port:25565}, function(err, response) {
			resolve(response);
		});
	})
};