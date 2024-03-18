const jwt = require('jsonwebtoken');
require("dotenv").config();
 
module.exports = (req, res, next) => {
    const secretKey = process.env.SECRETKEY;
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, secretKey);
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error : 'Authentification échouée' });
   }
};