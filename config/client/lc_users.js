const merge = require('deepmerge');

exports.users = async (client, options) => {

	let _users = {};

	try {
		const lc_database = require("./lc_database.json");
		if (lc_database) {
			for (let i = 0; i < lc_database.length; i++) {
				if (lc_database[i]._profile.name === client._profile.name && lc_database[i].options.type === options.type) {
					_users = Object.assign({}, merge(lc_database[i]._users, _users));
					delete lc_database[i]._users
				}
			}
		}
		console.log(`[${options.type}_${client._profile.name}] Loaded and merged users using local file.`)
	} catch (e) {
		if (e instanceof Error && e.code === "MODULE_NOT_FOUND") {

		} else
			throw e;
	}

	return _users
};