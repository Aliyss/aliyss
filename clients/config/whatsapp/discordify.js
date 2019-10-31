

exports.message = (msg) => {
	msg.content = msg.body;
	if (msg.id && msg.id.remote) {
		msg.guild = {
			id: msg.id.remote
		};
		msg.id = msg.id.id
	}
	if (!msg.fromMe) {
		if (msg.guild && msg.author && msg.author === msg.guild.id) {
			msg.mentions.push(msg.to)
		} else if (msg.guild && !msg.author && msg.from === msg.guild.id) {
			msg.mentions.push(msg.to)
		}
	}
	msg.author = {
		id: msg.author || msg.from,
		bot: false,
		user: {
			id: msg.author || msg.from,
			bot: false
		}
	};
	msg.cleanContent = msg.body;
	msg.authorID = msg.author.id;
	msg.createdTimestamp = Date.now();
	return msg
};

exports.guilds = async (client) => {
	return await client.getChats().then(chats => {
		return chats.filter(chat => {
			chat.wapi_id = chat.id;
			chat.id = chat.id._serialized;
			return chat
		});
	})
};

exports.mentions = async (mentions, client) => {
	let mentionList = {
		members : [

		]
	};
	for (let i = 0; i < mentions.length; i++) {
		if (client._profile.owners.includes(mentions[i])) {
			mentionList.members.push(this.member({
				id : {
					_serialized: mentions[i]
				}
			}))
		} else {
			let member = await client.getContactById(mentions[i]);
			mentionList.members.push(this.member(member))
		}
	}
	return mentionList
};

exports.member = (member) => {
	member.user = {
		id: member.id._serialized,
		bot: false
	};
	return member
};