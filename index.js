var http = require("http")
var url = require("url")
var path = require('path');
var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var fs = require("fs")
const con = require("./connection");
const mysql = require('mysql');
const router = express.Router();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.set('view engine', 'html');
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(request, response) {
	var email = request.body.email;
	var password = request.body.password;
	var role = request.body.role;
	let selectQuery = 'SELECT * FROM users WHERE email = ? AND password = ? AND role= ?';
	let fixedQuery = mysql.format(selectQuery,[email, password,role]);
	if (email && password) {
		con.query(fixedQuery, function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.email = email;
				response.redirect('/tahmin');
			} else {
				response.send('Incorrect Username and/or Password!');
				router.get('/login',function(req,res){
					res.sendFile(path.join(__dirname+'/login.html'));
				  });
			}	
				
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		router.get('/login',function(req,res){
			res.sendFile(path.join(__dirname+'/login.html'));
		  });
		response.end();
	}
});

router.get('/tahmin',function(req,res){
  res.sendFile(path.join(__dirname+'/tahmin.html'));
});
app.get('/kayit', function(request, response) {
	response.sendFile(path.join(__dirname + '/kayit.html'));
});
app.get('/cikis', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});
app.post('/kayit', function(request,response){
	var users={
		"ad":request.body.ad,
		"soyad":request.body.soyad,
		"email":request.body.email,
		"password":request.body.password,
		"role":request.body.role
	  }
	  con.query('INSERT INTO users SET ?',users, function (error, results, fields) {
		if (error) {
		  console.log("error ocurred",error);
		  router.get('/kayit',function(req,res){
			res.sendFile(path.join(__dirname+'/kayit.html'));
		  });
		}else{
		  console.log('The solution is: ', results); 
		  router.get('/login',function(req,res){
			res.sendFile(path.join(__dirname+'/login.html'));
		  });
		}
		});


}
)



app.use('/', router);
app.listen(3000)
console.log("Server Başlatıldı. Tarayıcı üzerinden http://localhost:3000"
           +" adresinden ulaşabilirsiniz.")
           