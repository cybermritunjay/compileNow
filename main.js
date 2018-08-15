const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const languages = require('./languages.js');
const executeCode = require('./execute_code');

const app = express();

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(bodyParser.json());

app.all('*', function(req, res, next) 
{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
});

app.post('/api/compile',tokenVarification,(req,res)=>{
	jwt.verify(req.body.token,'robodia',(err,auth)=>{
		var id = auth.user.id;
		var lang = req.body.language;
		var code = req.body.code;
		var input = req.body.input;
		if (err) {
			res.sendStatus(403);
		}else{
			if (typeof id !== 'undefined' && typeof lang !== 'undefined' && typeof code !== 'undefined' && typeof input !== 'undefined') {
				
				var compile = new executeCode(languages.lang[lang][0],languages.lang[lang][1],code,languages.lang[lang][2],languages.lang[lang][3],languages.lang[lang][4],input);

				compile.run((data,exec_time,data2)=>{
					console.log("responce given");
					res.json({
					message: 'It worked!',
					id: id,
					language: lang,
					code: code,
					input:input,
					output:data,
					errors:data2,
					executionTime:exec_time
					});
				});
				
			}else{
				res.json({
					message : 'Inappropriate Data',
					id: id,
					lang: lang,
					code: code,
					input:input,
					});
			}
			
		}
	})
	
});

app.post('/api/signup', (req,res) => {
	//console.log(req.body);
	if (typeof req.body.name !== 'undefined' && typeof req.body.email !== 'undefined') {
		const user = {
		id: Math.floor(Math.random() * (1000) ) + 1,
		name: req.body.name,
		email: req.body.email
	}
	jwt.sign({user:user},'robodia', (err,token) =>{
		res.json({
			token:token,
			id : user['id']
		});
	});
	}else{
		res.sendStatus(403);
	}
	
});

function tokenVarification(req,res,next){
	const tokenHeader = req.body.token;

	if (typeof tokenHeader != 'undefined') {
		const bearer = tokenHeader.split(' ');

		const token = bearer[1];

		
		req.body.token = token;


		next();
	}else {
    // Forbidden
    res.sendStatus(403);
    
  }
};

app.listen('5000',()=>{
	console.log('server running on port 5000');
});