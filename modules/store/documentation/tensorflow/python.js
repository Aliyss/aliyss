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

exports.description = () => {

	return {
		name: "Python Documentation",
		description: "Returns current speed of the RLS-Legacy",
		permissions: ["SEND_MESSAGES"]
	}
};

//Export: from @/store/CommandHandler/index.js
exports.run = async (options, message, args, client) => {


	let pyDocSetup = "https://www.tensorflow.org/versions/r2.0/api_docs/python/";

	let urladder = args;
	let urlstring = "";

	if (urladder[0]) {
		if (urladder[0] === "tf") {
			urlstring = urladder.join("/");
		} else {
			urlstring = "tf/" + urladder.join("/");
		}
	}

	await request({
		method: 'GET',
		url: pyDocSetup + urlstring
	}, (err, res, body) => {

		if (err) return console.error(err);

		let $ = cheerio.load(body);

		let title = $('title');

		let sort = [];
		let descrip = "";
		let fullField = [];

		if (title.text().startsWith("Module:")) {

			$('p').nextUntil('h2').first().toArray().map(item => {
				descrip = $(item).text()
			});

			$('h2').toArray().map(item => {
				let headerConfig = {
					text: $(item).text(),
					link: pyDocSetup + urlstring + "#" + $(item).text().toLowerCase(),
					subs: []
				};

				$(item).nextUntil('h2').toArray().map(item => {
					let mainitem = {
						text: $(item).text(),
						link: $(item).find('a').attr('href'),
					};
					headerConfig['subs'].push(mainitem);
				});

				sort.push(headerConfig);
			});

			for (let x = 0; x < sort.length; x++) {
				let f_name = sort[x]['text'];
				let f_value = "";
				for (let y = 0; y < sort[x]['subs'].length; y++) {
					let string_arr = sort[x]['subs'][y]['text'].split(":");
					if (sort[x]['subs'][y]['link'] !== undefined) {
						string_arr[0] = `[${string_arr[0]}](${sort[x]['subs'][y]['link']})`;
					}
					if (f_name === "Other Members") {

						f_value = f_value + "``• " + string_arr.join(":") + "``!!!!"
					} else {
						f_value = f_value + string_arr.join(":") + "!!!!"
					}

				}

				if (f_value.length >= 1024) {
					let cutStr = f_value.match(/.{1,1000}(!!!!|$)/g);

					for (let c = 0; c < cutStr.length; c++) {
						let subfield = {
							name: f_name + ` (\`\`${c+1}\`\`)`,
							value: cutStr[c].replace(/!!!!/g, "\n")
						};
						fullField.push(subfield)
					}

				} else {
					let subfield = {
						name: f_name,
						value: f_value.replace(/!!!!/g, "\n")
					};
					fullField.push(subfield)
				}
			}
		} else {
			$('div').find('.devsite-article-body').toArray().map(value => {
				let turndownService = new TurndownService({
					headingStyle: "atx",
					bulletListMarker: "+",
					codeBlockStyle: "fenced",
				});
				turndownService.remove('style');
				//console.log($(value).html())
				let fullmd = turndownService.turndown($(value).html()).trim();

				let starleng = fullmd.match(/^[#]*/g)[0].length;
				let splitter = " ";

				for (let g = 0; g < starleng; g++) {
					splitter = "#" + splitter;
				}
				let arr_md;

				if (!fullmd.startsWith("#")) {
					fullmd = "# Overview\n\n" + fullmd;
					splitter = "# ";
				}

				arr_md = fullmd.split(new RegExp("\n" + splitter + "|####"));

				arr_md[0] = arr_md[0].substring(splitter.length);

				for (let h = 0; h < arr_md.length; h++) {
					let second_arr = arr_md[h].split("\n");

					let f_name = second_arr[0].replace(/`/g, "");
					if (f_name === "") {
						f_name = "\u200b"
					} else {
						second_arr.shift();
					}

					let third = second_arr.join("\n").split("#" + splitter);

					for (let i = 0; i < third.length; i++) {
						let fourth = third[i].split("\n");

						let forward = "**" + fourth[0].replace(/`/g, "") + "**";
						if (forward === "****") {
							forward = "";
						}
						fourth.shift();
						third[i] = forward + fourth.join("\n")
					}

					second_arr = third;

					let f_value = second_arr.join("\n").replace("\n", "!!!!").replace("```", "```py");

					if (f_value.length >= 1024) {
						let cutStr = f_value.match(/.{1,1000}(!!!!|$)/g);

						for (let c = 0; c < cutStr.length; c++) {
							let subfield = {
								name: f_name + ` (\`\`${c+1}\`\`)`,
								value: cutStr[c].replace(/!!!!/g, "\n") + "\n\n"
							};
							fullField.push(subfield)
						}

					} else {
						let subfield = {
							name: f_name,
							value: f_value.replace(/\n\n/g, "\n").replace(/!!!!/g, "\n") + "\n_ _"
						};
						fullField.push(subfield)
					}
				}
			})
		}


		let imageURL = "https://avatars1.githubusercontent.com/u/15658638?s=280&v=4";
		let v = new Vibrant(imageURL);
		v.getPalette().then((palette) => {

			let rgb_product = {
				red: palette['Vibrant']['rgb'][0],
				green: palette['Vibrant']['rgb'][1],
				blue: palette['Vibrant']['rgb'][2]
			};

			let embed = {
				author: {
					name: `${title.text()}`,
					url: pyDocSetup + urlstring,
					icon_url: imageURL
				},
				title: null,
				color: rgb(rgb_product),
				description: descrip,
				fields: fullField,
				footer: {
					icon_url: null,
					text: "TensorFlow Python API Documentation"
				}
			};

			runFile(options._return + "send.js", {embed: embed}, message, client);
		});


	});

};