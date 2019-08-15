const translate = require("@vitalets/google-translate-api");
const merge = require('deepmerge');

/*Local Functions*/
//Run File
function runFile(file, content, message, client) {

	let commandFile = require(file);
	commandFile.run(content, message, client);

}

function embedder(member, result) {
	return {
		title: result.title,
		description: null,
		color: 16776960,
		footer: null
	}
}

exports.information = {
	from: function (result) {
		return {
			fields: [
				{
					name: `_\n_**From: ${result.from_x}**`.padEnd(24, `~`).replace(/~/g, "⠀"),
					value: result.search,
					inline: true
				}
			]
		}
	},
	to: function (result) {
		return {
			fields: [
				{
					name: `_\n_**To: ${result.to}**`.padEnd(24, `~`).replace(/~/g, "⠀"),
					value: 	result.output.text.replace(/ `/g, "`"),
					inline: true
				}
			]
		}
	},
	info: async function (result) {
		let override_embed = {

		};

		let embed_arr = [
			this.from(result),
			this.to(result),
			override_embed
		];

		return await merge.all(embed_arr)
	}
};

exports.help = {
	name: "Translation",
	description: "Translates the given text.",
	arguments: ["[text]"],
	optional: ["<from:ISO> <to:ISO>"],
	information: Object.keys(exports.information)
};

exports.run = async (options, message, args, client) => {

	try {

		let information = exports.information;

		let function_name = "info";
		let main_title = "Translation";


		let propertyNames = Object.keys(information).filter(function (propertyName) {
			return propertyName.indexOf(args[0]) === 0;
		});

		if (propertyNames.length !== 0) {
			function_name = propertyNames[0];
			args.shift()
		} else {
			function_name = "info";
		}

		let to = "en";
		if (/to:/.test(args[args.length-1]) && args[args.length-1].split(":")[1]) {
			to = args[args.length-1].split(":")[1];
			args.pop()
		}

		let from_x = "";
		if (/from:/.test(args[args.length-1]) && args[args.length-1].split(":")[1]) {
			from_x = args[args.length-1].split(":")[1];
			args.pop()
		}

		let search = args.join(" ");

		let result = {
			text: "An error has occured.",
			search: search
		};

		if (from_x !== "") {
			result.output = await translate(`${search}`, {from: from_x, to: to}).then(res => {
				return res
			}).catch(err => {
				return err
			});
		} else {
			result.output = await translate(`${search}`, {to: to}).then(res => {
				return res
			}).catch(err => {
				return err
			});
		}

		result.title = main_title;
		result.to = to;
		result.from_x = result.output.from.language.iso;

		let base_embed = embedder(message.author, result);

		let embed = await merge(base_embed, await information[function_name](result));
		await runFile(options._return + "send.js", {embed: embed}, message, client);


	} catch (e) {
		console.log(e)
	}

};