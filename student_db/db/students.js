require('dotenv').config()
const express = require('express');
const sqlite = require("sqlite3").verbose();
const router = express.Router();

const table = 'students';

const database = process.env.DATABASE;
let conn = null;

function connect() {
	conn = new sqlite.Database(database);
}
function close() {
	if (conn != null) {
		conn.close((err) => {
			if (err) console.log("Error closing database");
		});
	}
}

// GET all students
router.get("/", (req, res) => {
	let sql = "SELECT * FROM `" + table + "`";
	connect();
	conn.all(sql, (err, rows) => {
		close();
		if (err) return res.status(500).json(err);
		return res.status(200).json(rows);
	});
});

// GET single student by id
router.get("/:id", (req, res) => {
	let id = req.params.id; // FIX: was req.params.idno
	let sql = "SELECT * FROM `" + table + "` WHERE `id`=?";
	connect();
	conn.all(sql, [id], (err, rows) => { // FIX: was [id] but variable was undefined
		close();
		if (err) return res.status(500).json(err);
		return res.status(200).json(rows);
	});
});

// DELETE student by id
router.delete("/:id", (req, res) => {
	let idno = req.params.id;
	let sql = "DELETE FROM `" + table + "` WHERE `id`=?";
	connect();
	conn.run(sql, [idno], (err) => {
		close();
		if (err) return res.status(500).json(err);
		return res.status(200).json({ 'message': 'Student Deleted' });
	});
});

// POST new student
router.post("/", (req, res) => {
	let data = req.body;
	let keys = Object.keys(data);
	let values = Object.values(data);

	let fld = keys.join("`,`");

	let qmark = [];
	keys.forEach((key) => { qmark.push('?'); }); // FIX: was keys.foreach (lowercase)
	let q = qmark.join(",");

	let sql = "INSERT INTO `" + table + "`(`" + fld + "`) VALUES (" + q + ")"; // FIX: was VALUES (q) not VALUES (${q})
	console.log(sql);
	connect();
	conn.run(sql, values, (err) => {
		close();
		if (err) return res.status(500).json(err);
		return res.status(200).json({ 'message': 'New Student Added' });
	});
});

// PUT update student
router.put("/", (req, res) => {
	let data = req.body;
	let keys = Object.keys(data);
	let values = Object.values(data);

	let newvalues = [];
	let fld = [];
	for (let i = 1; i < keys.length; i++) {
		fld.push("`" + keys[i] + "`=?");
		newvalues.push(values[i]);
	}

	let flds = fld.join(",");

	let sql = "UPDATE `" + table + "` SET " + flds + " WHERE `" + keys[0] + "`=" + values[0];
	console.log(sql);
	connect();
	conn.run(sql, newvalues, (err) => {
		close();
		if (err) return res.status(500).json(err);
		return res.status(200).json({ 'message': 'Student Updated' });
	});
});

module.exports = router;