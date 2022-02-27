require('dotenv').config();
const express = require("express");
const path = require('path');
const yumeAPI = require("./appAPI");

const app = express();
const port = 7001;

app.use(express.static(path.join(__dirname + '/public')));
app.use(express.urlencoded({extended:true}));

let supabaseConfig = {
    link: process.env.API_URL,
    anon_key: process.env.ANON_KEY
}

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
    res.json(await yumeAPI.signUp(req.body));
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

app.post("/dashboard/create/novel", async function(req, res) {
    res.json(await yumeAPI.createSeries(req.body));
});

app.get("/dashboard/series", function(req, res) {
    res.sendFile(__dirname + "/html/series.html");
});

app.get("/dashboard/series/:seriesid", function(req, res) {
    res.sendFile(__dirname + "/html/novelinfo.html");
});

app.get("/dashboard/series/:seriesid/:chapterid/write", function(req, res) {
    res.sendFile(__dirname + "/html/write.html");
});


app.listen(process.env.PORT || port, function() {
    console.log(`Server started on http://localhost:${port}`);
});