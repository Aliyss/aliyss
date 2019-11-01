const merge = require('deepmerge');
const lc_files = require("../../../config/client/lc_files");

function embedder() {
	return {
		title: "Reload",
		description: null,
		color: 16776960,
		footer: null
	}
}

exports.information = {
	files: async function(client, options, args) {
		let oldFiles = client._files.slice(0);
		let difference = "";
		for (let i = 0; i < oldFiles.length; i++) {
			for (let j = 0; j < args.length; j++) {
				if (oldFiles[i].includes(args[j])) {
					difference += oldFiles[i];
					delete require.cache[require.resolve(oldFiles[i])];
				}
			}
		}
		if (difference.length === 0) {
			difference = "No files have been reloaded.";
		}
		return {
			fields: [
				{
					name: "_\n_**Success: Reloaded Commands**".padEnd(24, `~`).replace(/~/g, "⠀"),
					value: 	`\`\`${difference}\`\``,
					inline: true
				}
			]
		}
	},
	newfiles: async function(client, options) {
		let oldFiles = client._files;
		client._files = await lc_files.files(options);
		let difference = client._files.filter(x => !oldFiles.includes(x)).join("\n");
		if (difference.length <= 1) {
			difference = "No new files have been added."
		}
		return {
			fields: [
				{
					name: "_\n_**Success: Reloaded Main Directory**".padEnd(24, `~`).replace(/~/g, "⠀"),
					value: 	`\`\`${difference}\`\``,
					inline: true
				}
			]
		}
	},
	all: async function (client, options, args) {
		let override_embed = {

		};

		let embed_arr = [
			await this.files(client, options, args),
			await this.newfiles(client, options),
		];

		return await merge.all(embed_arr)
	}
};

exports.help = {
	name: "Reload",
	description: "Reloads part of the bot.",
	arguments: [],
	optional: [],
	information: Object.keys(exports.information)
};

exports.run = async (options, message, args, client) => {

	let information = exports.information;

	let function_name = "all";

	let propertyNames = Object.keys(information).filter(function (propertyName) {
		return propertyName.indexOf(args[0]) === 0;
	});

	if (propertyNames.length !== 0) {
		function_name = propertyNames[0];
		args.shift()
	}

	let base_embed = embedder();
	return merge(base_embed, await information[function_name](client, options, args))
};