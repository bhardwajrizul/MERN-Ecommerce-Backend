const admin = require('firebase-admin');

const serviceAccount = require('../firebaseServiceAccount.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

function getArguments(argv) {
    return argv.slice(2).reduce((args, arg) => {
        let [key, value] = arg.split('=');
        args[key.replace('--', '')] = value || true;
        return args;
    }, {});
}

// List all users
async function deleteUsers() {
    const args = getArguments(process.argv);
    if (args.deleteAll) {
        admin
            .auth()
            .listUsers()
            .then((listUsersResult) => {
                // Delete each user
                listUsersResult.users.forEach((userRecord) => {
                    admin.auth().deleteUser(userRecord.uid)
                        .then(() => {
                            console.log(`Successfully deleted user: ${userRecord.uid}`);
                        })
                        .catch((error) => {
                            console.error(`Error deleting user: ${userRecord.uid}`, error);
                        });
                });
            })
            .catch((error) => {
                console.error('Error listing users:', error);
            });
    }

}

// npm run modifyUsers -- --deleteAll

deleteUsers();
