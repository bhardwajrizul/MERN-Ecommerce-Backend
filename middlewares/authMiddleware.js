const admin = require('firebase-admin');

exports.verifyIdToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).send('Unauthorized');
  }

  const idToken = authHeader.split('Bearer ')[1];
  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      next();
    })
    .catch(error => {
      console.error('Error verifying ID token:', error);
      res.status(403).send('Unauthorized');
    });
};

