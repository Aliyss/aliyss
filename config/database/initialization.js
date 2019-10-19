const admin = require("firebase-admin");
const config_location = require("../config_locations.json");
const serviceAccount = require(`../${config_location.firebase}`);

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const database = admin.firestore();

exports.run = () => {
	return database
};