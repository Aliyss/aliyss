const admin = require("firebase-admin");
const serviceAccount = require(`../firebase_serviceKey.json`);

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const database = admin.firestore();

exports.run = () => {
	return database
};