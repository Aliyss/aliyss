/*Global Packages*/
const watch = require("node-watch");
const glob = require("glob");

/*Local Packages*/
const config = require('./store/command_config.json');
const database = require('../config/database/initialization.js').run();

/*Local Functions*/
//Run File
function runFile(file, options, message, args, client) {

	try {
		let commandFile = require(file);
		return commandFile.run(options, message, args, client);
	} catch (e) {
		console.log(e)
	}

}

function helpFile(file) {

	try {
		let commandFile = require(file);
		return commandFile.help;
	} catch (e) {
		console.log(e)
	}

}

function parser (options, files, full_args) {

	let used_file = {
		filename: "",
		matched: 0
	};

	for (let i = 0; i < files.length; i++) {
		files[i] = files[i].replace(config.main_directory + `/modules`,".");
		let files_arr = files[i].replace(`/store/_types/${options.type}`, "").split("/");

		let start = true;
		let end = false;
		let args = full_args.slice();
		let matched = 0;

		while (args.length !== 0 && start === true) {

			for (let j = 0; j < files_arr.length; j++) {

				if (files_arr[j] === options.type) {

				} else if (files_arr[j].startsWith(args[0])) {
					args.shift();
					matched++;
					end = true
				} else if (end === true) {
					start = false
				} else {
					start = false
				}
			}

		}

		if (used_file.matched < matched && (helpFile(files[i]).arguments.length <= args.length)) {
			used_file = {
				filename: files[i],
				matched: matched,
				args: args
			};
		}
	}

	return used_file
}



exports.run = async (options, message, client, nlpManager) => {

	if (message.guild === null) {
		return
	}

	options.locations = config.locations;
	options.main_directory = config.main_directory;

	if (message.content) {
		if (!message.content.toLowerCase()) {
			//console.log(message.content)
		}
	} else  {
		//console.log(message)
	}

	message.content = message.content.toLowerCase();
	let msg = message.content;
	let full_args = [];

	if (message.guild && message.guild.id) {
		await database.collection(options.type).doc(client._profile.database.name).collection("guilds").doc(message.guild.id).get().then(doc => {
			if (doc.exists) {
				let docref = doc.data();
				if (docref["prefixes"]) {
					for (let i = 0; i < docref["prefixes"].length; i++) {
						if (message.content.startsWith(docref["prefixes"][i].toLowerCase())) {
							msg = message.content.substr(docref["prefixes"][i].length);
							break;
						}
					}
				} else {
					for (let i = 0; i < client._profile.prefixes.length; i++) {
						if (message.content.startsWith(client._profile.prefixes[i].toLowerCase())) {
							msg = message.content.substr(client._profile.prefixes[i].length);
							break;
						}
					}
				}
			} else {
				for (let i = 0; i < client._profile.prefixes.length; i++) {
					if (message.content.startsWith(client._profile.prefixes[i].toLowerCase())) {
						msg = message.content.substr(client._profile.prefixes[i].length);
						break;
					}
				}
			}
		});
	} else {
		for (let i = 0; i < client._profile.prefixes.length; i++) {
			if (message.content.startsWith(client._profile.prefixes[i].toLowerCase())) {
				msg = message.content.substr(client._profile.prefixes[i].length);
				break;
			}
		}
	}

	let grmsg = msg;

	if ((message.content === msg && options.type !== "whatsapp") || msg.trim() === "") {
		return;
	} else {
		message.content = msg;
	}

	let nlpstuff = false;
	for (let i = 0; i < config.splitters.length; i++) {
		if (message.content.startsWith(config.splitters[i])) {
			message.content = message.content.replace(new RegExp(config.splitters[i] + config.splitters[i] + "+","g"), " ");
			full_args = message.content.substr(1).split(config.splitters[i]);
			break;
		}
	}

	if (full_args.length === 0 && options.type === "whatsapp")  {
		full_args = message.content.split(" ");
		nlpstuff = true
	}

	if (nlpstuff && message.from !== "41786932427@c.us") {
		let response = await nlpManager.process(full_args.join(" "));
		if (response.answer) {
			await runFile(options._return + "send.js", response.answer, message, client);
			return;
		} else {
			return;
		}
	}



	if (full_args.length === 0 || full_args[0] === "") {
		return;
	}

	if ((options.type === "whatsapp" && message.body.toLowerCase() === message.content.toLowerCase()) || grmsg.trim() === "") {
		return;
	}

	let lesser = {};

	lesser.options = config.options.ignore;

	await matcher(client, lesser, full_args, options, message);

};

function replaceNth(input, re, n, transform) {
	let count = 0;

	return input.replace(
		re,
		match => n(++count) ? transform(match) : match);
}

let matcher = async (client, lesser, full_args, options, message) => {

	let text = full_args.join(" ");
	let arr = text.match(/({(?:{??[^{]*?}))/g);

	if (arr && arr.length >= 1) {
		let full_temp = arr[0].replace(/{/g, "").replace(/}/g, "").split(" ");
		options.return_type = "string";
		let val = await searcher(client, lesser, full_temp, options, message);
		text = replaceNth(text,/({(?:{??[^{]*?}))/g, count => count === 1,() => `${val}`);
		await matcher(client, lesser, text.split(" "), options, message)
	} else {
		options.return_type = "embed";
		await searcher(client, lesser, full_args, options, message);
	}


};

let searcher = async (client, lesser, full_args, options, message) => {

	let files =  glob.sync(`${config.main_directory}/modules/store/**/*.js`, lesser.options);

	files = files.filter( function(item) {
		if (item.startsWith(config.main_directory + '/modules/store/_types/')) {
			if (item.startsWith(config.main_directory + '/modules/store/_types/' + options.type)) {
				if (!item.startsWith(config.main_directory + '/modules/store/_types/' + options.type + "/~")) {
					return item
				}
			}
		} else {
			return item
		}
	});

	let used_file = parser(options, files, full_args);

	if (used_file.matched === 0) {
		return;
	}

	if (used_file.filename.endsWith("help.js")) {
		used_file.args = {
			"args": used_file.args,
			"additional": files
		}
	}

	watch(`${config.main_directory}/modules${used_file.filename.replace(".", "")}`, (event, filename) => {
		if (filename) {
			delete require.cache[require.resolve(used_file.filename)];
		}
	});

	let embed = await runFile(used_file.filename, options, message, used_file.args, client);

	if (embed && embed.fields && embed.fields.length > 0) {
		if (options.return_type === "string") {
			return embed.fields[0].value
		} else {
			await runFile(options._return + "send.js", {embed: embed}, message, client);
		}
	} else if (embed) {
		if (options.return_type === "string") {
			return embed;
		} else {
			await runFile(options._return + "send.js", embed, message, client);
		}
	}
};