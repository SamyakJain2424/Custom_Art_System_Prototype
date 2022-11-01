const jwt = require("jsonwebtoken");
const client = require("../routes/db-config");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv").config();

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.json({ status: "error", error: "Please enter your email and password" });
    else {
        client.query('SELECT * FROM customer WHERE username = $1', [email], async (Err, result) => {
            if (Err) throw Err;
            // console.log(result.rows[0].password);
            // if (!result.length || !await bcrypt.compare(password, result[0].password)) return res.json({ status: "error", error: "Incorrect Email or password" })
            if (result.rows && result.rows[0].password == password) {

                const token = jwt.sign({ user_id: result.rows[0].user_id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES
                })

                const cookieOptions = {
                    expiresIn: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                    httpOnly: true
                }

                res.cookie("userRegistered", token, cookieOptions);
                return res.json({ status: "success", success: "User has been logged in" });
            }

            else {
                return res.json({ status: "error", error: "Incorrect Email or password" })
            }


        })
    }
}

module.exports = login;