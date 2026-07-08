const jwt = require("jsonwebtoken");

// Signs a JWT containing the user's id. Expiry defaults to 7 days if
// JWT_EXPIRE isn't set in the environment.
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "7d",
    });
};

module.exports = generateToken;
