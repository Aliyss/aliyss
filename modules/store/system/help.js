const merge = require('deepmerge');
const treeify = require('treeify');

/*Local Functions*/
//Run File
function runFile(file, content, message, client) {

	let commandFile = require(file);
	return commandFile.run(content, message, client);

}

function recHelpObj(obj, arr) {
	if (arr.length > 1) {
		arr.shift();
		obj[arr[0]] = recHelpObj({}, arr);
		return obj
	} else {
		return null
	}
}

exports.run = async (options, message, args, client) => {

	let help_obj = {};
	for (let i = 0; i < args.additional.length ; i++) {
		args.additional[i] = args.additional[i].replace("./store", "").replace(`/_types/${options.type}`, "").slice(0, -3);
		let add_arr = args.additional[i].split("/");
		help_obj = merge(recHelpObj({}, add_arr), help_obj)
	}
	let tree = treeify.asTree(help_obj, true);
	await runFile(options._return + "send.js", "```css\n" + tree + "```", message, client)
};