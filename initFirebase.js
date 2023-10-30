const admin = require('firebase-admin')
const serviceAccount = require('./firebaseServiceAccount.json')

exports.initFirebase = () => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    })
}