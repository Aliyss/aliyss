/*Global Packages*/
const glob = require("glob");

/*Local Packages*/
const config = require('./store/command_config.json');
const aliyssium = require('../config/aliyssium.json');

/*Local Functions*/
//Run File
function runFile(file, options, message, args, client) {

	let commandFile = require(file);
	commandFile.run(options, message, args, client);

}

function parser (options, files, full_args) {

	let used_file = {
		filename: "",
		matched: 0
	};

	for (let i = 0; i < files.length; i++) {
		files[i] = files[i].replace(`${aliyssium.main_directory}/modules`,".");
		let files_arr = files[i].split("/");

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

		if (used_file.matched < matched) {
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

	let msg = message.content;
	let full_args = [];

	client._profile.prefixes = client._profile.prefixes.concat(aliyssium.prefixes);

	for (let i = 0; i < client._profile.prefixes.length; i++) {
		if (message.content.startsWith(client._profile.prefixes[i])) {
			msg = message.content.substr(client._profile.prefixes[i].length);
			break;
		}
	}

	if (message.content === msg) {
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
	
	if (full_args.length === 0) {
		full_args = message.content.substr(1).split(aliyssium.splitters[0]);
	}

	let lesser = {};

	lesser.options = config.options.ignore.filter( function(item) {
		return !item.includes(options.type);
	});

	glob(`${aliyssium.main_directory}/modules/store/**/*.js`, lesser.options, function (er, files) {

		let used_file = parser(options, files, full_args);

		if (used_file.matched === 0) {
			return;
		}

		runFile(used_file.filename, options, message, used_file.args, client)

	});
};
