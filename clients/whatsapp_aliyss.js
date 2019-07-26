
/*Global Packages*/
const fs = require('fs');
const { Client } = require('whatsapp-web.js');

/*Local Packages*/
const config = require('./config/whatsapp/config.json');
const aliyssium = require('../config/aliyssium.json');
const client = new Client({
	puppeteer: {headless: false},
	session: config.session
});

/*Local Functions*/
//Run File
function runFile(file, object) {

	let commandFile = require(file);
	commandFile.run(config.options, object, client);

}

exports.run = () => {

	client.initialize().then(() => {
		console.log('WHATSAPP_aliyss: Initialization complete.');
	});

	client.on('qr', (qr) => {
		// NOTE: This event will not be fired if a session is specified.
		console.log('WHATSAPP_aliyss: QR received.', qr);
	});

	client.on('authenticated', (session) => {
		console.log('----- WHATSAPP_aliyss -----');
		console.log('WHATSAPP_aliyss: Authentication successful.');
		config.session = session;
		fs.writeFile('./clients/config/whatsapp/config.json', JSON.stringify(config, null, 4), function (err) {
			if (err) return console.log(err);
			console.log('WHATSAPP_aliyss: Client Session has been updated.')
		});
	});

	client.on('auth_failure', message => {
		// Fired if session restore was unsuccessful
		console.error('WHATSAPP_aliyss: Authentication failure.', message);
	});

	client.on('ready', () => {
		console.log('WHATSAPP_aliyss: Ready.');
		config.options._return = aliyssium.main_directory + config.options._return
	});

	client.on('message', async msg => {
		msg.content = msg.body;
		runFile(aliyssium.main_directory + aliyssium.locations.commandHandler, msg)
	});

	client.on('disconnected', () => {
		console.log('WHATSAPP: Client was logged out.');
	})
};
