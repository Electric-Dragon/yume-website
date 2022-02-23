require('dotenv').config();
const express = require("express");
const path = require('path');
const sAPI = require("./supabaseAPI");

const app = express();
const port = 7001;

app.use(express.static(path.join(__dirname + '/public')));
app.use(express.urlencoded({extended:true}));

let supabaseConfig = {
    link: process.env.API_URL,
    anon_key: process.env.ANON_KEY
}

app.get("/write", function(req, res) {
    res.sendFile(__dirname + "/html/write.html");
});

app.get("/keys", function(req, res) {
    res.json(JSON.stringify(supabaseConfig));
});

app.get("/signin", function(req, res) {
    res.sendFile(__dirname + "/html/signin.html");
});

app.get("/signup", function(req, res) {
    res.sendFile(__dirname + "/html/signup.html");
});

app.post("/signup", async function(req, res) {
    res.json(await sAPI.signUp(req.body));
});

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/html/home.html");
});

app.get("/dashboard/home", function(req, res) {
    res.sendFile(__dirname + "/html/dashboard.html");
});

app.get("/dashboard/create/novel", function(req, res) {
    res.sendFile(__dirname + "/html/novelform.html");
});

app.listen(process.env.PORT || port, function() {
    console.log(`Server started on http://localhost:${port}`);
});