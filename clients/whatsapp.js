
/*Global Packages*/
const fs = require('fs');

/*Local Packages*/
const config = require('./config/whatsapp/config.json');
const aliyssium = require(`../config/aliyssium.json`);
const command_config = require('../modules/store/command_config.json');
const lc_initialize = require("../config/client/lc_initialize");
const discordify = require('./config/whatsapp/discordify.js');

exports.run = async (nlpManager) => {

	const profiles = aliyssium.profiles.whatsapp.filter(item => {
		if (!item.disabled) {
			return item
		}
	});

	let clients = [];

	for (let i = 0; i < profiles.length; i++) {

		const { Client } = require('./config/whatsapp/wapi2/index.js');

		/*Local Functions*/
		//Run File
		function runFile(file, object, nlpManager) {

			let commandFile = require(file);
			commandFile.run(config.options, object, client, nlpManager);

		}

		/*Local Variables*/
		const profile_name = profiles[i].name;
		let session = profiles[i].session;
		const client = new Client({
			puppeteer: {headless: profiles[i].headless || false},
			session: session
		});

		client._profile = JSON.parse(JSON.stringify(profiles[i]));
		client._profile.prefixes.push.apply(client._profile.prefixes, aliyssium.prefixes);

		client.initialize().then(() => {
			console.log(`WHATSAPP_${profile_name}: Initialization complete.`);
		});

		client.on('qr', (qr) => {
			// NOTE: This event will not be fired if a session is specified.
			console.log(`WHATSAPP_${profile_name}: QR received.`, qr);
		});

		client.on('authenticated', (session) => {
			console.log(`WHATSAPP_${profile_name}: Authentication successful.`);
			for (let i = 0; i < aliyssium.profiles.whatsapp.length; i++) {
				if (aliyssium.profiles.whatsapp[i].name === profile_name) {
					aliyssium.profiles.whatsapp[i].session = session;
				}
			}

			fs.writeFile('config/aliyssium.json', JSON.stringify(aliyssium, null, 4), function (err) {
				if (err) return console.log(err);
				console.log(`WHATSAPP_${profile_name}: Client Session has been updated.`)
			});

		});

		client.on('auth_failure', message => {
			// Fired if session restore was unsuccessful
			console.error(`WHATSAPP_${profile_name}: Authentication failure.`, message);
		});

		client.on('ready', async () => {
			console.log(`WHATSAPP_${profile_name}: Ready.`);
			client.guilds = await discordify.guilds(client);
			let additional = await lc_initialize.initialize(client, config.options);
			client._guilds = additional._guilds;
			client._files = additional._files;
			client._users = additional._users;
			config.options = additional.options;
		});

		client.on('message', async msg => {
			msg = await discordify.message(msg);
			runFile(command_config.main_directory + command_config.locations.commandHandler, msg, nlpManager)
		});

		client.on('disconnected', () => {
			console.log(`WHATSAPP_${profile_name}: Client was logged out.`);
		});

		await clients.push({client, config});
	}

	return clients
};
