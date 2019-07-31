
exports.run = async (users, message, client) => {
	let members = [];
	let b = 0;
	for (let i = 0; i < users.length; i++) {
		if (message.guild.members.get(users[i])) {
			members.push(message.guild.members.get(users[i]));
		} else if (message.guild.members.find(value => value.displayName.toLowerCase().startsWith(users[i].toString().trim()))) {
			members.push(message.guild.members.find(value => value.displayName.toLowerCase().startsWith(users[i].toString().trim())))
		} else if (message.guild.members.find(value => value.user.username.toLowerCase().startsWith(users[i].toString().trim()))) {
			members.push(message.guild.members.find(value => value.user.username.toLowerCase().startsWith(users[i].toString().trim())))
		} else if (message.guild.members.find(value => value.id.toLowerCase().startsWith(users[i].toString().trim()))) {
			members.push(message.guild.members.find(value => value.id.toLowerCase().startsWith(users[i].toString().trim())))
		} else if (message.mentions.members.array()[b]) {
			members.push(message.mentions.members.array()[b]);
			b++;
		}
	}
	return [...new Set(members)]
};