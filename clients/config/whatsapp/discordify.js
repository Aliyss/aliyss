

exports.message = (msg) => {
	msg.content = msg.body;
	msg.author = {
		id: msg.author || msg.from,
		bot: false,
		user: {
			id: msg.author || msg.from,
			bot: false
		}
	};
	if (msg.id && msg.id.remote) {
		msg.guild = {
			id: msg.id.remote
		};
	}
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
		let member = await client.getContactById(mentions[i]);
		mentionList.members.push(this.member(member))
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