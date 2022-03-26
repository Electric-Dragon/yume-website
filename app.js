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

app.get("/series/:seriesid", function(req, res) {
    res.sendFile(__dirname + "/html/novelinfoR.html");
});

app.get("/signup", function(req, res) {
    res.sendFile(__dirname + "/html/signup.html");
});

app.get("/creator", function(req, res) {
    res.sendFile(__dirname + "/html/creator.html");
});


app.post("/signup", async function(req, res) {
    res.json(await yumeAPI.signUp(req.body));
});

app.post("/novel", async function(req, res) {
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

app.get("/read/novel/:seriesid/:chapterid", function(req, res) {
    res.sendFile(__dirname + "/html/readNovel.html");
});
app.get("/about", function(req, res) {
    res.sendFile(__dirname + "/html/about.html");
});

app.get("/account", function(req, res) {
    res.sendFile(__dirname + "/html/account.html");
});

app.get("/library", function(req, res) {
    res.sendFile(__dirname + "/html/library.html");
});

app.post("/followSeries", async function(req, res) {
    res.json(await yumeAPI.followSeries(req.body));
});

app.post("/createAdaptation", async function(req, res) {
    res.json(await yumeAPI.createAdaptation(req.body));
});

app.get("/ads.txt", function(req, res) {
    res.sendFile(__dirname + "/public/text/ads.txt");
});

app.listen(process.env.PORT || port, function() {
    console.log(`Server started on http://localhost:${port}`);
});