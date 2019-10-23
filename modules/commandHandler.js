/*Local Packages*/
const config = require('./store/command_config.json');

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
		files[i] = files[i].replace(options.main_directory + `/modules`,".");
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
			console.log(message.content)
		}
	} else  {
		//console.log(message)
	}

	message.content = message.content.toLowerCase();
	let msg = message.content;
	let full_args = [];

	if (client._guilds && !client._guilds[message.guild.id]) {
		return;
	}

	if (message.guild && message.guild.id) {
		for (let i = 0; i < client._guilds[message.guild.id]["prefixes"].length; i++) {
			if (message.content.startsWith(client._guilds[message.guild.id]["prefixes"][i].toLowerCase())) {
				msg = message.content.substr(client._guilds[message.guild.id]["prefixes"][i].length);
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

	if (msg.trim() === "") {
		return;
	} else {
		message.content = msg;
	}

	for (let i = 0; i < config.splitters.length; i++) {
		if (message.content.startsWith(config.splitters[i])) {
			message.content = message.content.replace(new RegExp(`\\\\(${config.splitters[i]})1+`,"g"), config.splitters[i]);
			full_args = message.content.substr(1).split(config.splitters[i]);
			break;
		}
	}

	if (full_args.length === 0 || full_args[0] === "") {
		let saveFile = require(options.main_directory + options.locations.messageReceived);
		saveFile.run(options, message, client, nlpManager);
		return;
	}

	if (message.author.username) {
		client.last_user = `${message.author.username}`;
	}

	await matcher(client, full_args, options, message);

};

function replaceNth(input, re, n, transform) {
	let count = 0;

	return input.replace(
		re,
		match => n(++count) ? transform(match) : match);
}

let matcher = async (client, full_args, options, message) => {

	let text = full_args.join(" ");
	let arr = text.match(/({(?:{??[^{]*?}))/g);

	if (arr && arr.length >= 1) {
		let full_temp = arr[0].replace(/{/g, "").replace(/}/g, "").split(" ");
		options.return_type = "string";
		let val = await searcher(client, full_temp, options, message);
		text = replaceNth(text,/({(?:{??[^{]*?}))/g, count => count === 1,() => `${val}`);
		await matcher(client, text.split(" "), options, message)
	} else {
		options.return_type = "embed";
		await searcher(client, full_args, options, message);
	}


};

let searcher = async (client, full_args, options, message) => {

	let files = client._files.slice(0);

	files = files.filter(item => {
		if (item.includes("store/owner")) {
			if (client._profile.owners.includes(message.author.id)) {
				return item
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

	/*
	watch(`${options.main_directory}/modules${used_file.filename.replace(".", "")}`, (event, filename) => {
		if (filename) {
			delete require.cache[require.resolve(used_file.filename)];
		}
	});
	*/

	let embed = await runFile(used_file.filename, options, message, used_file.args, client);

	if (embed && ((embed.fields && embed.fields.length > 0) || embed.image)) {
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