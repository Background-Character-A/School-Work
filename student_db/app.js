require('dotenv').config();
const port = process.env.PORT || 5000;
const express = require('express');
const path = require('path');
const students = require("./db/students");

const app = express();
app.use(express.urlencoded({'extended':false}));
app.use(express.json());

// Serve the frontend
app.use(express.static(path.join(__dirname, 'frontend')));

app.use("/students", students);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const server = app.listen(port, () => {
    require('dns').lookup(require('os').hostname(), (err, addr, fam) => {
        console.log(`listening at http://${addr}:${port}`);
    });
});