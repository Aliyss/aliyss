const glob = require("glob");
const command_config = require('../../modules/store/command_config.json');

exports.commandFiles = async (options) => {

	let files =  glob.sync(`${command_config.main_directory}/modules/store/**/*.js`, command_config.ignore);

	return files.filter( function(item) {
		if (item.startsWith(command_config.main_directory + '/modules/store/_types/')) {
			if (item.startsWith(command_config.main_directory + '/modules/store/_types/' + options.type)) {
				if (!item.startsWith(command_config.main_directory + '/modules/store/_types/' + options.type + "/~")) {
					return item
				}
			}
		} else {
			return item
		}
	});
};