const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");

function userAuth(req, res, next) {
  // implement user auth logic here
  // you need to check the headers and validate the user from the user DB.
  // check readme for the exact headers to be expected
  //step 1 : get the token from the header
  const authHeader = req.headers.authorization;
  // step 2 : check if the token is valid
  if (!authHeader) {
    return res.status(401).json({ message: "Please provide a valid token" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid token" });
  }
  //step 3 : extract the token from the header
  const token = authHeader.split(" ")[1];
  //step 4: verify the token
  try {
    const decoded = jwt.verify(token, process.env.jwt_secret);
    if (!decoded.username === req.body.username) {
      return res.status(200);
    }
    req.userId = decoded._id; //Id should be added to the payload of the token
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = userAuth;
