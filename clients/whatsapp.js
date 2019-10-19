
/*Global Packages*/
const fs = require('fs');

/*Local Packages*/
const config = require('./config/whatsapp/config.json');
const aliyssium = require('../config/aliyssium.json');

exports.run = (nlpManager) => {

	const profiles = aliyssium.profiles.whatsapp;

	for (let i = 0; i < profiles.length; i++) {

		const { Client } = require('./config/whatsapp/wapi2/index.js');

		/*Local Functions*/
		//Run File
		function runFile(file, object, nlpManager) {

			let commandFile = require(file);
			commandFile.run(config.options, object, client, nlpManager);

		}

		function messageFile(file, object) {

			let commandFile = require(file);
			return commandFile.run(object);

		}

		/*Local Variables*/
		const profile_name = profiles[i].name;
		let session = profiles[i].session;
		const client = new Client({
			puppeteer: {headless: false},
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

		client.on('ready', () => {
			console.log(`WHATSAPP_${profile_name}: Ready.`);
			config.options._return = aliyssium.main_directory + config.options.return
		});

		client.on('message', async msg => {
			msg = await messageFile('./config/whatsapp/discordify.js', msg);
			runFile(aliyssium.main_directory + aliyssium.locations.commandHandler, msg, nlpManager)
		});

		client.on('disconnected', () => {
			console.log(`WHATSAPP_${profile_name}: Client was logged out.`);
		})
	}


};
