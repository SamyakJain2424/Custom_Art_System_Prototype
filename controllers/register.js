const client = require("../routes/db-config");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
    const { email, password: Npassword, full_name, number } = req.body
    if (!email || !Npassword) return res.json({ status: "error", error: "Please enter your email and password" });
    else {
        console.log(email);
        client.query('SELECT username FROM customer WHERE username = $1', [email], async (err, result) => {
            // if (err) throw err;
            if (result[0]) return res.json({ status: "error", error: "Email has already been registered" })

            const password = Npassword;
            console.log(password);
            console.log(number);
            console.log(full_name);
            client.query('INSERT INTO customer(username, password, full_name, mobile_num) VALUES($1, $2, $3, $4)', [email, password, full_name, number], (err, results) => {
                if (err) throw err;
                return res.json({ status: "success", success: "User has been registered" })
            })

        })
    }
}

module.exports = register;