var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const session = require('express-session');

	
const cookieParser = require('cookie-parser')

var app = express();
var api = express();
var port = process.env.PORT || 1200;
  // enable files upload
 
  app.use(cookieParser())
  app.use(fileUpload({
    encoding: 'utf-8',
    createParentPath: true,
    safeFileNames: true, 
    preserveExtension: true 
  }));
  app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }))
  

  app.use(express.static(path.join('public')))
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit:'50mb',
  parameterLimit: 100000,extended: true}));
  app.use(bodyParser.json());
  app.use(function(req,res, next){
    res.setHeader('Access-Control-allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'content-type, x-access-token,application/json');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  })



  //routes setup
  //require('./routes/app_api40/config')(app);
  require('./routes/index')(app);
  require('./routes/gettoken')(app);
 //run port
  app.listen(port, function () {
    console.log('Example app listening on port '+port+'!')
 })