const db_users = require("./db_users");
const fs = require("fs");
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

	return {_users}
};