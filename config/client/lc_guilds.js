const db_client = require("../database/db_client");
const merge = require('deepmerge');

exports.guilds = async (client, options) => {
	//Initialization
	let _guilds = await db_client.guilds(client, options);

	try {
		const lc_database = require("./lc_database.json");
		if (lc_database) {
			for (let i = 0; i < lc_database.length; i++) {
				if (lc_database[i]._profile.name === client._profile.name && lc_database[i].options.type === options.type) {
					_guilds = Object.assign({}, merge(lc_database[i]._guilds, _guilds));
					delete lc_database[i]._guilds
				}
			}
		}
		console.log(`[${options.type}_${client._profile.name}] Loaded and merged guilds using local file.`)
	} catch (e) {
		if (e instanceof Error && e.code === "MODULE_NOT_FOUND") {
			
		} else
			throw e;
	}

	client.guilds.map(async (guild) => {
		if (!_guilds[guild.id]) {
			_guilds[guild.id] = await db_client.guildSet(client, options, guild);
		}
		if (_guilds[guild.id]["prefixes"].length === 0) {
			_guilds[guild.id]["prefixes"] = client._profile.prefixes
		}
	});

	return _guilds
};