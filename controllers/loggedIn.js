const client = require("../routes/db-config")
const jwt = require("jsonwebtoken");

const loggedIn = (req, res, next) => {
    if (!req.cookies.userRegistered) return next();

    try {
        const decoded = jwt.verify(req.cookies.userRegistered, process.env.JWT_SECRET);
        client.query('SELECT * FROM customer WHERE user_id = $1', [decoded.user_id], (err, result) => {
            if (err) return next();
            req.user = result.rows[0];
            return next();
        })

    } catch (err) {
        if (err) return next()
    }
}

module.exports = loggedIn