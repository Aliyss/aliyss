/*Global Variables*/
const cheerio = require('cheerio');
const request = require('request');
const TurndownService = require('turndown');
const Vibrant = require('node-vibrant');
const rgb = require('rgb-to-int');

/*Local Variables*/
let commandFile;

/*Local Functions*/
//Run File
function runFile(file, client, object, embed, edit, override) {
	commandFile = require(file);
	commandFile.run(client, object, embed, edit, override);
}

function GetDocumentation(path) {
	return new Promise(function(resolve) {
		//Firebase: Get Profile Document
		path.get().then(doc => {
			if (doc.exists) {
				resolve(doc.data())
			} else {
				resolve(null);
			}
		});
	});
}

function SetDocumentation(path, embed) {
	//Firebase: Get Command Document
	return path.set({
		"embed": embed
	}, {
		merge: true
	})
}

exports.help = {
	arguments: ["[search]"],
	optional: ["{version}"],
	information: Object.keys({}),
	name: "JavaScript Documentation",
	description: "Returns current speed of the RLS-Legacy",
	permissions: ["SEND_MESSAGES"]
};

//Export: from @/store/CommandHandler/index.js
exports.run = async (options, message, args, client) => {

	let jsDocSetup = "https://js.tensorflow.org/api/latest/";

	if (/\d/.test(args[args.length-1]) && /\./.test(args[args.length-1])) {
		jsDocSetup = `https://js.tensorflow.org/api/${args[args.length-1]}/`;
		args.pop()
	}

	let urladder = args;
	let urlstring = "#" + args.join(".").replace(/#/g, "");

	let database = require("../../../../config/database/initialization.js").run();
	let path = database.collection("commands").doc("documentation-tensorflow-javascript").collection("saves").doc((jsDocSetup.replace("https://js.tensorflow.org/api/", "") + urlstring).replace(/\//g, "-"));
	let docref = await GetDocumentation(path);

	if (docref === null) {
		return request({
			method: 'GET',
			url: jsDocSetup + urlstring
		}, (err, res, body) => {

			if (err) return console.error(err);

			let $ = cheerio.load(body);

			let descrip = "";
			let fullField = [];

			let x = $('div.symbol-header').filter(function() {
				if ($('a',this).html().trim().endsWith(args.join("."))) {
					return this
				} else if ($('a',this).attr("href").toLowerCase().trim().endsWith(args.join("."))) {
					return this
				}
			}).parent();

			if ($('.documentation',x).html()) {
				let turndownService = new TurndownService({
					headingStyle: "atx",
					bulletListMarker: "+",
					codeBlockStyle: "fenced",
				});
				turndownService.remove('style');
				//console.log($(value).html())
				let fullmd = turndownService.turndown($('.documentation',x).html()).trim();
				fullField.push({
					name: "_ _\nDocumentation",
					value: fullmd
				})
			}

			if ($('.parameter-list',x).html()) {
				let turndownService = new TurndownService({
					headingStyle: "atx",
					bulletListMarker: "+",
					codeBlockStyle: "fenced",
				});
				turndownService.remove('style');
				//console.log($(value).html())
				let fullmd = turndownService.turndown($('.parameter-list',x).html()).trim().replace("Parameters:","");
				fullField.push({
					name: "_ _\nParameters",
					value: fullmd
				})
			}

			if ($('.method-list',x).html()) {
				let fullmd = "";
				$('.method-list .symbol-header a.symbol-link',x).toArray().map(element => {
					let turndownService = new TurndownService({
						headingStyle: "atx",
						bulletListMarker: "+",
						codeBlockStyle: "fenced",
					});
					turndownService.remove('style');
					fullmd += "+ " + turndownService.turndown($(element).html()).trim() + "\n";
				});

				if (fullmd === "") {
					fullmd = "No Methods available."
				}

				fullField.push({
					name: "_ _\nMethod List",
					value: fullmd
				})
			} else if ($('.returns',x).html()) {
				let turndownService = new TurndownService({
					headingStyle: "atx",
					bulletListMarker: "+",
					codeBlockStyle: "fenced",
				});
				turndownService.remove('style');
				//console.log($(value).html())
				let fullmd = turndownService.turndown($('.returns',x).html()).trim().replace("Returns:","");
				fullField.push({
					name: "_ _\nReturns",
					value: fullmd
				})
			}

			for (let i = 0; i < fullField.length; i++) {
				if (fullField[i].value.length > 1024) {
					fullField[i].value = "Use the specification arguments to receive more information to the " + fullField[i].name
				}
			}

			let imageURL = "https://avatars1.githubusercontent.com/u/15658638?s=280&v=4";
			let v = new Vibrant(imageURL);
			return v.getPalette().then((palette) => {

				let rgb_product = {
					red: palette['Vibrant']['rgb'][0],
					green: palette['Vibrant']['rgb'][1],
					blue: palette['Vibrant']['rgb'][2]
				};

				let embed = {
					author: {
						name: `${urlstring} | TensorFlow ${jsDocSetup.replace("https://js.tensorflow.org/api/", "").split("/")[0]} | TensorFlowJS`,
						url: jsDocSetup + urlstring,
						icon_url: imageURL
					},
					title: null,
					color: rgb(rgb_product),
					description: descrip,
					fields: fullField,
					footer: {
						icon_url: null,
						text: "TensorFlow JavaScript API Documentation"
					}
				};
				if (embed.fields.length > 0) {
					SetDocumentation(path, embed);
				}
				return embed
			});

		});
	} else {
		let embed = docref.embed;
		return embed
	}
};