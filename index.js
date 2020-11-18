const admin = require("firebase-admin");
const mongodb = require("mongodb");
const serviceAccount = require("./serviceAccount.json");

/*
Fill in these options below
Replace the prefilled options with your own!
*/
const options = {
    collection: "books", // collection you want to copy.
    MongoDB_URL: "mongodb://username:password@host/", // your MongoDB connection url
    MongoDB_NAME: "book-archieve", // your MongoDB database name
}

let mongo;

console.log("Initializing firebase");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const fb = admin.firestore();

console.log("Connecting mongodb")
const MongoClient = new mongodb.MongoClient(options.MongoDB_URL, {
    useUnifiedTopology: true
});
MongoClient.connect(function (err, client) {
    if (err) {
        console.log("MongoDB Connecting failed!");
        console.log(err);
        process.exit(1);
    }
    console.log("Connected MongoDB");
    mongo = client.db(options.MongoDB_NAME);
});

console.log("Copying data")
fb.collection(options.collection).get().then(d => {
    d.forEach(doc => {
        mongo.collection(options.collection).insertOne(Object.assign({
            _id: doc.id
        }, doc.data()));
        console.log(`Copied ${doc.id}`);
    })
    console.log("Done");
    process.exit(1);
}).catch(err => {
    console.log('Error getting firebase document', err);
    process.exit(1);
});