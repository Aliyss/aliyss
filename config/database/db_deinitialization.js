const db_users = require("./db_users");


exports.de_initialize = async (client, options) => {

	//Initialization
	let _users = await db_users.upload(client, options);

	return {_users}
};