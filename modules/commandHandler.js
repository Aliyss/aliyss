/*Global Packages*/
const watch = require("node-watch");
const glob = require("glob");
const fs = require('fs');

/*Local Packages*/
const config = require('./store/command_config.json');
const aliyssium = require('../config/aliyssium.json');

/*Local Functions*/
//Run File
function runFile(file, options, message, args, client) {

	try {
		let commandFile = require(file);
		commandFile.run(options, message, args, client);
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
		files[i] = files[i].replace(aliyssium.main_directory + `/modules`,".");
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

exports.run = async (options, message, client) => {

	options.locations = aliyssium.locations;
	options.main_directory = aliyssium.main_directory;

	message.content = message.content.toLowerCase();
	let msg = message.content;
	let full_args = [];

	for (let i = 0; i < client._profile.prefixes.length; i++) {
		if (message.content.startsWith(client._profile.prefixes[i].toLowerCase())) {
			msg = message.content.substr(client._profile.prefixes[i].length);
			break;
		}
	}

	if (message.content === msg || msg.trim() === "") {
		return;
	} else {
		message.content = msg;
	}

	for (let i = 0; i < aliyssium.splitters.length; i++) {
		if (message.content.startsWith(aliyssium.splitters[i])) {
			full_args = message.content.substr(1).split(aliyssium.splitters[i]);
			break;
		}
	}

	if (full_args.length === 0 || full_args[0] === "") {
		return;
	}

	let lesser = {};

	lesser.options = config.options.ignore;

	glob(`${aliyssium.main_directory}/modules/store/**/*.js`, lesser.options, function (er, files) {

		files = files.filter( function(item) {
			if (item.startsWith(aliyssium.main_directory + '/modules/store/_types/')) {
				if (item.startsWith(aliyssium.main_directory + '/modules/store/_types/' + options.type)) {
					if (!item.startsWith(aliyssium.main_directory + '/modules/store/_types/' + options.type + "/~")) {
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


		watch(`${aliyssium.main_directory}/modules${used_file.filename.replace(".", "")}`, (event, filename) => {
			if (filename) {
				delete require.cache[require.resolve(used_file.filename)];
			}
		});

		runFile(used_file.filename, options, message, used_file.args, client)

	});
};
