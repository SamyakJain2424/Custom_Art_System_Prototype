const express = require('express');
const client = require("./routes/db-config");
const app = express();
const cookie = require("cookie-parser");
const { decodeBase64 } = require('bcryptjs');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
var bodyParser = require('body-parser');


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('port', process.env.Port || 3000);

//public will contain css and js pages
app.use("/js", express.static(__dirname + "/public/js"));
app.use("/css", express.static(__dirname + "/public/css"));
app.use("/images", express.static(__dirname + "/public/images"));


//views will contain all html pages
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')
// app.use(expressLayouts);

//layouts are the templates that need to be included in all pages
// app.use(expressLayouts);
// app.set('layout', './layouts/full-width');


app.use(cookie());




//connecting our database
client.connect((err) => {
    if (err) throw err;
    console.log("database connected")
})


//this will call the router object
app.use("/", require("./routes/pages"));

app.use("/api", require("./controllers/auth"));

//Webpage gets hosted on local server
app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.')
});




// const app = express();
// const { Client } = require('pg');

// const client = new Client({
//     host: "localhost",
//     user: "postgres",
//     port: 5432,
//     password: "root",
//     database: "CustomArtSystem"
// })

// client.connect();

// client.query('Select * from emp', (err, res) => {
//     if (!err) {
//         console.log(res.rows);
//     }
//     else {
//         console.log(err.message);
//     }

//     client.end;
// })

