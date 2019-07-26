/*Global Packages*/
const fs = require('fs');

/*Local Packages*/
const config = require('./config/aliyssium.json');

/*Local Functions*/
//Run File
function runFile(file) {

	let commandFile = require(file);
	commandFile.run();

}

config.main_directory = __dirname.replace(/\\/g, "/");

fs.readdir('./clients', function(err, items) {

	for (let i = 0; i < items.length; i++) {

		if (items[i].endsWith(".js") && !config.exclude.includes(items[i])) {
			runFile(`./clients/${items[i]}`)
		}

	}

});