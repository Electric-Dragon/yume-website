const express = require("express");
const path = require('path');

const app = express();
const port = 7001;

app.use(express.static(path.join(__dirname + '/public')));
app.use(express.urlencoded({extended:true}));

app.get("/write", function(req, res) {
    res.sendFile(__dirname + "/html/write.html");
});

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/html/form.html");
});

app.get("/ss", function(req, res) {
    res.sendFile(__dirname + "/html/signup.html");
});




app.listen(process.env.PORT || port, function() {
    console.log(`Server started on http://localhost:${port}`);
});

// npx tailwindcss -i ./public/css/input.css -o ./public/css/output.css --watch