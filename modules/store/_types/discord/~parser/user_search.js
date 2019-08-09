const Unzalgo = require("unzalgo");

exports.run = async (users, message, client) => {
	let members = [];
	let b = 0;
	for (let i = 0; i < users.length; i++) {
		if (message.guild.members.get(users[i])) {
			members.push(message.guild.members.get(users[i]));
		} else if (message.guild.members.find(value => Unzalgo.clean(value.displayName.toLowerCase()).startsWith(Unzalgo.clean(users[i].toString()).trim()))) {
			members.push(message.guild.members.find(value => Unzalgo.clean(value.displayName.toLowerCase()).startsWith(Unzalgo.clean(users[i].toString()).trim())))
		} else if (message.guild.members.find(value => Unzalgo.clean(value.user.username.toLowerCase()).startsWith(Unzalgo.clean(users[i].toString()).trim()))) {
			members.push(message.guild.members.find(value => Unzalgo.clean(value.user.username.toLowerCase()).startsWith(Unzalgo.clean(users[i].toString()).trim())))
		} else if (message.guild.members.find(value => value.id.toLowerCase().startsWith(users[i].toString().trim()))) {
			members.push(message.guild.members.find(value => value.id.toLowerCase().startsWith(users[i].toString().trim())))
		} else if (message.mentions.members.array()[b]) {
			members.push(message.mentions.members.array()[b]);
			b++;
		}
	}
	for (let i = 0; i < members.length; i++) {
		members[i].user.cleanName = Unzalgo.clean(members[i].user.username);
	}
	return [...new Set(members)]
};

exports.single = (users, message) => {
	let userx = {
		user: {
			username: `<@${users}>`
		}
	};
	if (message.guild.members.get(users)) {
		userx = message.guild.members.get(users);
	} else if (message.guild.members.find(value => Unzalgo.clean(value.displayName.toLowerCase()).startsWith(Unzalgo.clean(users.toString()).trim()))) {
		userx = message.guild.members.find(value => Unzalgo.clean(value.displayName.toLowerCase()).startsWith(Unzalgo.clean(users.toString()).trim()))
	} else if (message.guild.members.find(value => Unzalgo.clean(value.user.username.toLowerCase()).startsWith(Unzalgo.clean(users.toString()).trim()))) {
		userx = message.guild.members.find(value => Unzalgo.clean(value.user.username.toLowerCase()).startsWith(Unzalgo.clean(users.toString()).trim()))
	} else if (message.guild.members.find(value => value.user.id.toLowerCase().startsWith(users.toString().trim()))) {
		userx = message.guild.members.find(value => value.user.id.toLowerCase().startsWith(users.toString().trim()))
	} else if (message.guild.members.find(value => value.id.toLowerCase().startsWith(users.toString().trim()))) {
		userx = message.guild.members.find(value => value.id.toLowerCase().startsWith(users.toString().trim()))
	}
	userx.user.cleanName = Unzalgo.clean(userx.user.username);
	return userx
};