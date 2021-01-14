const { config, engine } = require('express-edge');
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const expressSession = require('express-session');
const connectMongo = require('connect-mongo');
const connectFlash = require("connect-flash");
const edge = require('edge.js');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const createPostController = require('./controllers/createPost');
const homePageController = require('./controllers/homePage');
const storePostController = require('./controllers/storePost');
const getPostController = require('./controllers/getPost');
const createUserController = require("./controllers/createUser");
const storeUserController = require('./controllers/storeUser'); 
const loginController = require("./controllers/login");
const loginUserController = require("./controllers/loginUser");
const logoutController = require("./controllers/logout");
 
const app = new express();

app.use(expressSession({
    secret: 'secret'
}));
 
mongoose.connect('mongodb://localhost:27017/node-blog', { useNewUrlParser: true })
    .then(() => 'You are now connected to Mongo!')
    .catch(err => console.error('Something went wrong', err))

const mongoStore = connectMongo(expressSession);
 
app.use(expressSession({
    secret: 'secret',
    store: new mongoStore({
    mongooseConnection: mongoose.connection
    })
}));

app.use(connectFlash());
app.use(fileUpload());
app.use(express.static("public"));
app.use(engine);
app.set('views', __dirname + '/views');

app.use(cookieParser());
app.use(session({
  cookie: { maxAge: 1000 },
  secret: 'finalblog',
  saveUninitialized: false,
  resave: false
}));

 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('*', (req, res, next) => {
    edge.global('auth', req.session.userId)
    next()
});
 
const storePost = require('./middleware/storePost');
app.use('/posts/store', storePost)
const auth = require("./middleware/auth");
const redirectIfAuthenticated = require('./middleware/redirectIfAuthenticated')
 
app.get("/", homePageController);
app.get("/post/:id", getPostController);
app.get("/posts/new", auth, createPostController);
app.post("/posts/store", auth, storePost, storePostController);
app.get("/auth/login", redirectIfAuthenticated, loginController);
app.post("/users/login", redirectIfAuthenticated, loginUserController);
app.get("/auth/register", redirectIfAuthenticated, createUserController);
app.post("/users/register", redirectIfAuthenticated, storeUserController);
app.get("/auth/logout", redirectIfAuthenticated, logoutController);


app.get('/verify', (req, res) => {
  res.render('verify');
});

app.use((req, res, next) => {
    res.render('error');
  });
 
app.listen(4000, () => {
  console.log("App listening on port 4000");
});