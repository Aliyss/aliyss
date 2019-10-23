
let passwords = require("./passwords.json");

exports.help = {
	arguments: [],
	information: Object.keys({})
};

exports.run = async (options, message, args, client) => {

	if (message.id.fromMe === true) {
		message.me = message.from;
		message.from = message.to;
	}

	let chat = await client.getChatById(message.from);

	let content = "";

	if (chat.isGroup) {

		if (passwords[chat.name]) {

			let ssid = passwords[chat.name]['WLAN-SSID'];
			let pass = passwords[chat.name]['WLAN-PASS'];
			content = `*WLAN INFORMATION*\n*SSID:* ${ssid}\n*PASS:* ${pass}`

		} else {
			content = "There is no WLAN set for this group."
		}

	} else {
		content = "This command can only be used in group chats."
	}

	return content;
};