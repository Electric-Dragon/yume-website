require('dotenv').config();
const express = require("express");
const path = require('path');
const yumeAPI = require("./appAPI");

const _supabase = require("@supabase/supabase-js");
const supabase = _supabase.createClient(process.env.API_URL, process.env.SERVICE_ROLE)

const stripe = require("stripe")(process.env.STRIPE_KEY);
const endpointSecret = process.env.ENDPOINT_SECRET;

const app = express();
const port = 7001;

const http = require('http');
var server = http.createServer(app);
const io = require("socket.io")(server);

let socket;

io.on('connection', function (socket_) {
    socket = socket_;
    console.log("Connected succesfully to the socket ...");
});

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

app.get("/dashboard/engagement", function(req, res) {
    res.sendFile(__dirname + "/html/engagement.html");
});

app.get("/user/:username", function(req, res) {
    res.sendFile(__dirname + "/html/creator.html");
});

app.post("/signup", async function(req, res) {
    res.json(await yumeAPI.signUp(req.body));
});

app.post("/novel", async function(req, res) {
    res.json(await yumeAPI.signUp(req.body));
});

app.post("/readChapter", async function(req, res) {
    res.json(await yumeAPI.readChapter(req.body));
});

app.post("/getRecommendations", async function(req, res) {
    res.json(await yumeAPI.getRecommendations(req.body));
});

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/html/home.html");
});

app.get("/list", function(req, res) {
    res.sendFile(__dirname + "/html/glist.html");
});

// app.get("/advertisement/create", function(req, res) {
//     res.sendFile(__dirname + "/html/createad.html");
// });

app.get("/genre/:genre", function(req, res) {
    res.sendFile(__dirname + "/html/genre.html");
});

app.get("/dashboard/home", function(req, res) {
    res.sendFile(__dirname + "/html/dashboard.html");
});

app.get("/dashboard/creator", function(req, res) {
    res.sendFile(__dirname + "/html/only.html");
});

app.get("/dashboard/create/novel", function(req, res) {
    res.sendFile(__dirname + "/html/novelform.html");
});

app.get("/dashboard/create/comic", function(req, res) {
    res.sendFile(__dirname + "/html/comicform.html");
});

app.get("/dashboard/series/:seriesid/:chapterid/upload", function(req, res) {
    res.sendFile(__dirname + "/html/comic.html");
});

app.post("/dashboard/create/series", async function(req, res) {
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

app.get("/read/novel/:seriesid/:chapterid", async function(req, res) {
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

app.get("/search", function(req, res) {
    res.sendFile(__dirname + "/html/search.html");
});

app.get("/popular", function(req, res) {
    res.sendFile(__dirname + "/html/popular.html");
});

app.get("/Csearch", function(req, res) {
    res.sendFile(__dirname + "/html/Csearch.html");
});

app.get("/read/comic/:seriesid/:chapterid", async function(req, res) {
    res.sendFile(__dirname + "/html/readComic.html");
});

app.post("/followSeries", async function(req, res) {
    res.json(await yumeAPI.followSeries(req.body));
});

app.post("/createAdaptation", async function(req, res) {
    res.json(await yumeAPI.createAdaptation(req.body));
});

// app.post("/createAdvertisement", async function(req, res) {
//     res.json(await yumeAPI.createAdvertisement(req.body));
// });

app.post("/addRead", async function(req, res) {
    await yumeAPI.addFingerprint(req.body);
    res.json({status: 200})
});

app.get("/ads.txt", function(req, res) {
    res.sendFile(__dirname + "/public/text/ads.txt");
});

// app.post('/stripe_webhooks',express.raw({type: 'application/json'}), async function(request, response) {

//     const sig = request.headers['stripe-signature'];

//     let event;

//     try {
//         event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
//     }
//     catch (err) {
//         console.log(err.message);
//         io.sockets.emit('advertisement', {error: err.message});
//         return;
//     }

//     // response.json({received: true});


//     let res = await yumeAPI.handleWebhook({type: event.type, event: event});

//     if (res && res.error) {
//         console.log(res.error);
//         io.sockets.emit('advertisement', {error: res.error});
//         response.status(400).send(res.error);
//     } else {

//         io.sockets.emit('advertisement', res);
//         response.json({received: true});
//     }

// });

server.listen(process.env.PORT || port, function() {
    console.log(`Server started on http://localhost:${port}`);
})

// app.listen(process.env.PORT || port, function() {
//     console.log(`Server started on http://localhost:${port}`);
// });