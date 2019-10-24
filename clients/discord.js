
/*Local Packages*/
const config = require('./config/discord/config.json');
const aliyssium = require(`../config/aliyssium.json`);
const command_config = require('../modules/store/command_config.json');
const db_client = require("../config/database/db_client");
const lc_initialize = require("../config/client/lc_initialize");

exports.run = async (nlpManager) => {

	const profiles = aliyssium.profiles.discord.filter(item => {
		if (!item.disabled) {
			return item
		}
	});

	let clients = [];

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

		setInterval(async ()=>{
			if (client.presence.activity && client.presence.activity.name !== client.last_user) {
				await client.user.setPresence({activity: {name: client.last_user || "alice", type: 'WATCHING'}, status: 'dnd'});
			} else if (!client.presence.activity) {
				await client.user.setPresence({activity: {name: client.last_user || "alice", type: 'WATCHING'}, status: 'dnd'});
			}
		},20000);

		/*Local Variables*/
		const profile_name = profiles[i].name;

		client._profile = JSON.parse(JSON.stringify(profiles[i]));
		client._profile.prefixes.push.apply(client._profile.prefixes, aliyssium.prefixes);
		const token = profiles[i].token;


		//client: joins a server
		client.on("guildCreate", async guild => {
			client._guilds[guild.id] = await db_client.guildSet(client, config.options, guild);
		});

		//client: ratelimit hit
		client.on('ratelimit', ratelimit => {
			console.info(ratelimit);
		});

		//client: leaves a server
		client.on("guildDelete", guild => {
			delete client._guilds[guild.id]
		});

		//client: receives a message
		client.on('message', message => {
			runFile(command_config.main_directory + command_config.locations.commandHandler, message, nlpManager);
		});

		client.on("messageDelete", (messageDelete) => {
			runFile(command_config.main_directory + command_config.locations.messageDelete, messageDelete);
		});

		client.on("messageUpdate", (messageOld, messageNew) => {
			runFile(command_config.main_directory + command_config.locations.messageUpdate, messageOld, messageNew);
		});

		//client: is ready
		client.on('ready', async () => {
			console.log(`[discord_${profile_name}] Ready.`);
			console.log(`[discord_${profile_name}] Initialization complete.`);
			if (!client.initialized) {
				let additional = await lc_initialize.initialize(client, config.options);
				client._guilds = additional._guilds;
				client._files = additional._files;
				client._users = additional._users;
				client.initialized = true;
				config.options = additional.options;
				config.options.locations = command_config.locations;
				config.options.main_directory = command_config.main_directory;
			}
		});

		//client: login
		client.login(token).then(() => {
			console.log(`[discord_${profile_name}] Authentication successful.`)
		});

		await clients.push({client, config});
	}

	return clients

};