const crypto = require('crypto');

const iv = Buffer.alloc(16, 0);

exports.createToken = (userID, client) => {

	if (client.owners[userID]) {
		const cipher = crypto.createCipheriv('aes-256-cbc', client.client_secret, iv);

		let token = cipher.update(userID, 'utf8', 'hex');

		token += cipher.final('hex');

		return token;
	} else {
		return null;
	}

};

exports.getIdFromToken = (token, client) => {

	const decipher = crypto.createDecipheriv('aes-256-cbc', client.client_secret, iv);

	console.log(token);

	let id = decipher.update(token, 'hex', 'utf8');

	id += decipher.final('utf8');

	return id;

};