const db_users = require("./db_users");
let backup = false;

exports.de_initialize = async (client, options) => {

	//Initialization
	if (backup) {
		fs.unlink('./config/client/lc_database.json', function(err) {
			if(err && err.code === 'ENOENT') {
				console.info("File doesn't exist, won't remove it.");
			} else if (err) {
				console.error("Error occurred while trying to remove file");
			} else {
				console.log(`[Processes] Fallback file removed.}`);
			}
		});
		backup = false;
	}
	let _users = await db_users.upload(client, options);

	return {_users}
};