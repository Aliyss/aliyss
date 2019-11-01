const fs = require("fs");
const db_users = require("./db_users");
const db_guilds = require("./db_guilds");
const db_commands = require("./db_commands");

let backup = true;

exports.de_initialize = async (client, options) => {

	//Initialization
	if (backup) {
		await fs.unlink('./config/client/lc_database.json', function(err) {
			if(err && err.code === 'ENOENT') {
				console.log("[Processes] Fallback file doesn't exist, won't remove it.");
			} else if (err) {
				console.error("[Processes] Error occurred while trying to remove fallback file");
			} else {
				console.log(`[Processes] Fallback file removed.`);
			}
		});
		console.log(`[Processes] Fallback file removed.`);
		backup = false;
	}

	let _users = await db_users.upload(client, options);
	let _guilds = await db_guilds.upload(client, options);
	let _commands = await db_commands.upload(client, options);

	return {_users, _guilds, _commands}
};