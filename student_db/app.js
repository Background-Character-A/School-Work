require('dotenv').config();
const port = process.env.PORT || 5000;
const express = require('express');
const students = require("./db/students");

const app = express();
app.use(express.urlencoded({'extended':false}));
app.use(express.json());


app.use("/students",students)


app.get("/",(req,res)=>{
	return res.json({'message':'hello world'});
});

const server = app.listen(port,()=>{
	require('dns').lookup(require('os').hostname(),(err,addr,fam)=>{
		console.log(`listening at http://${addr}:${port}`);
	});
});