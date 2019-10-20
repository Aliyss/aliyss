const lc_files = require("./lc_files");
const lc_guilds = require("./lc_guilds");
const lc_users = require("./lc_users");
const command_config = require('../../modules/store/command_config.json');


exports.initialize = async (client, options) => {

	//Initialization

	let _guilds = await lc_guilds.guilds(client, options);
	let _files = await lc_files.files(options);
	let _users = await lc_users.users(client, options);

	options._return = command_config.main_directory + options.return;

	return {_guilds, _files, _users, options}
};