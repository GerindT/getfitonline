require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');

mongoose
  .connect(process.env.DB , { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false 
  })
  .then((x) => console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`))
  .catch((err) => console.error('Error connecting to mongo', err));

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();


// Middleware Setup
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3001/"],
    methods: 'GET,POST,PATCH,DELETE,OPTIONS', 
  })
);
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "http://localhost:3000/",
    cookie: { maxAge: 1000 * 60 * 60 }
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public/build')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(logger('dev'));

const index = require('./routes/index');
const auth = require('./routes/auth');

app.use('/api', index);
app.use('/', auth);

app.use('/user', require('./routes/user.js'))
//Esta ruta específica fue creada porque existía un bug en el deploy y siempre intentaba hacer el post 
//con un "workouts/" antes de user y al no encontrar la ruta, generaba un error. Esto no pasaba en la app local.
// app.use('/workouts/user', require('./routes/wkt.js'))

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/build", "index.html"))
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" ); 

})



module.exports = app;
