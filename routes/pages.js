const express = require("express");
const router = express.Router();
const loggedIn = require("../controllers/loggedIn")
const logout = require("../controllers/logout")
const client = require("../routes/db-config");
const alert = require("alert");
const stripe = require("stripe")('sk_test_51LyvzUSGTQJmdgEs948cuMmM7u4YIzSc6Ni6IrefC9NpotHjWhxSGnlRpdqfeLCLnmGzumQKgD3gzt12gi9LmAVV00OBVFQQVw');

//we used multer to store the uploaded images in our images folder in public directory
const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },

    filename: (req, file, cb) => {
        // console.log(file)
        cb(null, file.originalname)
    }
})



//this directs us to the home(idex.ejs) page and sends the images array that contains name, cost, file_name of images
router.get("/", loggedIn, (req, res) => {
    const images = [];
    client.query('SELECT * FROM designs', async (err, results) => {
        if (err) throw err;
        // console.log(results.rows);

        for (const item of results.rows) {
            const id = item.design_id;
            const img = '/images/' + item.file_name;
            const des_name = item.design_name;
            const cost = item.cost + 500;
            images.push({ id, img, des_name, cost });
        }
        // console.log(images);

        if (req.user) {
            console.log("Loggedin");
            console.log(req.user);
            res.render("index", { status: "loggedIn", user: req.user, images });
        }
        else {
            console.log("notloggedin");
            res.render("index", { status: "no", user: "nothing", images })
        }


    })

})




//get request to send us to the register page for new user to register
router.get("/register", (req, res) => {
    res.sendFile("register.html", { root: "./public/" });
})


//get request to send us to login page for registered user to login
router.get("/login", (req, res) => {
    res.sendFile("login.html", { root: "./public/" });
})


//get reguest to take us to the upload image page
router.get("/upload", (req, res) => {
    const mess = "";
    res.render("upload", { mess });
})


const upload = multer({ storage: storage })


//post request that will store the image details in the database
router.post("/upload", loggedIn, upload.single("image"), (req, res) => {

    // console.log(req.body.des_name);

    client.query('INSERT INTO designs(user_id, design_name, file_name, cost) VALUES($1, $2, $3, $4)', [req.user.user_id, req.body.des_name, req.file.originalname, req.body.cost], (err, results) => {
        if (err) throw err;
        // console.log(req.body);
        const mess = "Your design has been uploaded";
        res.render("upload", { mess })

    })




});

//for getting to the profile page
router.get("/profile", loggedIn, (req, res) => {

    res.render("profile", { user: req.user });
})

//for viewing the uploaded designs
router.get("/user_designs", loggedIn, (req, res) => {

    const images = [];
    client.query('SELECT * FROM designs WHERE user_id = $1', [req.user.user_id], async (err, results) => {
        if (err) throw err;
        // console.log(results.rows);

        for (const item of results.rows) {
            const id = item.design_id;
            const img = '/images/' + item.file_name;
            const des_name = item.design_name;
            const cost = item.cost;
            const sales = item.sales;
            images.push({ id, img, des_name, cost, sales });
        }
        // console.log(images);

        res.render("user_designs", { images });


    })

})



//for deleting a design
router.post("/delete_design", loggedIn, (req, res) => {
    console.log(req.body.del);
    const t = 5;
    console.log(t);
    client.query('DELETE FROM designs WHERE design_id = $1 ', [req.body.del], async (err, results) => {
        if (err) throw err;
        console.log(results);
        alert("Design Deleted");
        res.redirect("user_designs");
    })

})

//for adding item to cart
router.post("/add_to_cart", loggedIn, (req, res) => {
    console.log(req.body);

    client.query('SELECT * FROM cart WHERE design_id = $1 AND user_id = $2', [req.body.cart, req.user.user_id], async (err, results) => {
        if (err) throw err;
        if (results.rowCount > 0) {
            alert("Product already present in Cart")
        }
        else {
            client.query('SELECT cost FROM designs WHERE design_id = $1', [req.body.cart], async (err, results) => {
                if (err) throw err;
                const k = results.rows[0].cost + 500;
                client.query('INSERT INTO cart(user_id, design_id, item_cost) VALUES($1, $2, $3)', [req.user.user_id, req.body.cart, k], async (err, results) => {
                    if (err) throw err;
                    alert("Product added to cart");
                    res.redirect("/");
                })
            })
        }
    })
})

//for viewing the cart
router.get("/cart", loggedIn, (req, res) => {

    const images = [];
    client.query('SELECT * FROM designs WHERE design_id IN (SELECT design_id FROM cart WHERE user_id = $1 )', [req.user.user_id], async (err, results) => {
        if (err) throw err;
        // console.log(results.rows);

        for (const item of results.rows) {
            const id = item.design_id;
            const img = '/images/' + item.file_name;
            const des_name = item.design_name;
            const cost = item.cost;
            const sales = item.sales;
            images.push({ id, img, des_name, cost, sales });
        }
        // console.log(images);

        res.render("cart", { images });


    })



})

//for removing image from cart
router.post("/remove_cart", loggedIn, (req, res) => {
    client.query('DELETE FROM cart WHERE design_id = $1 AND user_id = $2', [req.body.rem, req.user.user_id], async (err, results) => {
        if (err) throw err;
        console.log(results);
        alert("Product Removed From Cart");
        res.redirect("cart");
    })

})

//for transaction details
router.get("/bank_details", loggedIn, (req, res) => {
    client.query('SELECT * FROM bank_details WHERE user_id = $1', [req.user.user_id], async (err, results) => {
        if (err) throw err;
        if (results.rowCount > 0) {
            alert("You have already entered the details");
            res.redirect("profile");
        }
        else {
            res.render("bank_details");
        }

    })
})

//for submitting transaction details
router.post("/bank_details", loggedIn, (req, res) => {
    client.query('INSERT INTO bank_details(user_id, holder_name, account_number, ifsc_code) VALUES($1, $2, $3, $4)', [req.user.user_id, req.body.holder_name, req.body.account_no, req.body.ifsc_code], async (err, results) => {
        if (err) throw err;
        alert("Your transaction details are saved");
        res.redirect("profile");
    })
})





module.exports = router;