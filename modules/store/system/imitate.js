
/*Local Functions*/
//Run File
function runFile(file, content, message, client) {

	let commandFile = require(file);
	return commandFile.run(content, message, client);

}

exports.help = {
	name: "Imitate",
	description: "Imitates bots.",
	arguments: [],
	optional: [],
	information: Object.keys({})
};

exports.run = async (options, message, args, client) => {

	return "I'm broken. ❤";

};