
/*Local Packages*/
const config = require('./config/discord/config.json');
const config_location = require("../config/config_locations.json");
const aliyssium = require(`../config/${config_location.clients}`);
const command_config = require('../modules/store/command_config.json');

exports.run = (nlpManager) => {

	const profiles = aliyssium.profiles.discord.filter(item => {
		if (!item.disabled) {
			return item
		}
	});

	for (let i = 0; i < profiles.length; i++) {
		/*Global Packages*/
		const discord = require('discord.js');
		const client = new discord.Client();

		/*Local Functions*/
		//Run File
		function runFile(file, object, other) {

			let commandFile = require(file);
			commandFile.run(config.options, object, client, other);

		}

		/*Local Variables*/
		const profile_name = profiles[i].name;

		client._profile = JSON.parse(JSON.stringify(profiles[i]));
		client._profile.prefixes.push.apply(client._profile.prefixes, aliyssium.prefixes);
		const token = profiles[i].token;

		//client: joins a server
		client.on("guildCreate", guild => {

		});

		//client: leaves a server
		client.on("guildDelete", guild => {

		});

		//client: receives a message
		client.on('message', message => {
			runFile(command_config.main_directory + command_config.locations.messageReceived, message, nlpManager);
			runFile(command_config.main_directory + command_config.locations.commandHandler, message, nlpManager)
		});

		client.on("messageDelete", (messageDelete) => {
			runFile(command_config.main_directory + command_config.locations.messageDelete, messageDelete);
		});

		client.on("messageUpdate", (messageOld, messageNew) => {
			runFile(command_config.main_directory + command_config.locations.messageUpdate, messageOld, messageNew);
		});

		//client: is ready
		client.on('ready', async () => {
			console.log(`DISCORD_${profile_name}: Ready.`);
			console.log(`DISCORD_${profile_name}: Initialization complete.`);
			config.options._return = command_config.main_directory + config.options.return
		});

		//client: login
		client.login(token).then(() => {
			console.log(`DISCORD_${profile_name}: Authentication successful.`)
		});
	}

};