const db_client = require("../database/db_client");
const lc_commands = require("../database/lc_commands");

exports.initialize = async (client, options) => {
	//Initialization
	let _guilds = await db_client.guilds(client, options);
	client.guilds.map(async (guild) => {
		if (!_guilds[guild.id]) {
			_guilds[guild.id] = await db_client.guildSet(client, options, guild);
		}
		if (_guilds[guild.id]["prefixes"].length === 0) {
			_guilds[guild.id]["prefixes"] = client._profile.prefixes
		}
	});

	let _files = await lc_commands.commandFiles(options);

	return {_guilds, _files}
};