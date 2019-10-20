

exports.message = (msg) => {
	msg.content = msg.body;
	msg.author = {
		id: msg.from,
		bot: false,
		user: {
			id: msg.from,
			bot: false
		}
	};
	if (msg.id && msg.id.remote) {
		msg.guild = {
			id: msg.id.remote
		};
	}
	msg.createdTimestamp = Date.now();
	return msg
};

exports.guilds = async (client) => {
	return await client.getChats().then(chats => {
		return chats.filter(chat => {
			if (chat.isGroup) {
				chat.wapi_id = chat.id;
				chat.id = chat.id._serialized;
				return chat
			}
		});
	})
};