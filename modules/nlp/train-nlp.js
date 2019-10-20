/*Global Packages*/
const fs = require('fs');
const database = require("../../config/database/db_initialization.js").run();

module.exports = async function trainnlp(manager, say) {

	if (!fs.existsSync('./model.nlp')) {
		manager.load('./model.nlp');
		return;
	}

	await database.collection("natural language processing").doc("alice").get().then(doc => {
		if (doc.exists) {
			let docref = doc.data();
			Object.keys(docref).forEach(function (key) {
				for (let i = 0; i < docref[key]["documents"].length; i++) {
					manager.addDocument(docref[key]["documents"][i].lang, docref[key]["documents"][i].text, docref[key]["id"])
				}
				for (let i = 0; i < docref[key]["answers"].length; i++) {
					manager.addAnswer(docref[key]["answers"][i].lang, docref[key]["id"], docref[key]["answers"][i].text)
				}
			});
		}
	});

	await manager.save('./model.nlp');
};

