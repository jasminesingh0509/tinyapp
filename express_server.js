const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");
app.use(cookieParser());

const templateVars = {
username: ""
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// function to generate random string for short URL. Call it where necessary. 
function generateRandomString() {

    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( var i = 0; i < 6; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * 62));
    }
    return result;
    
 }
 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// These are all routes below.

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  let templateVars =  {username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let {shortURL} = req.params;
  let templateVars = { shortURL, longURL: urlDatabase[shortURL],  
    username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = req.params.longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  res.render("register", email, password);
});

// Posts below

app.post('/register', (req, res) => {
  // if (req.body.email && req.body.password) {
    let id = generateRandomString();
    users[id] = {id: id, email: req.body.email, password: req.body.password};
      // users[req.body.id] = newUser;
      res.cookie("user_id", id);
      res.redirect('/urls/');
  // } else {
  //   res.status(400);
  //   res.send('Try again');
  // }
});

// redirects after edit 
app.post("/urls/:id", (req, res) => {
  let id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  // call randomString to generate short URL
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  res.redirect('/urls/' + randomString); 
});

// redirects after delete
app.post("/urls/:shortURL/delete", (req, res) => {
  let {shortURL} = req.params;
  delete urlDatabase[shortURL];
  res.redirect('/urls'); 
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});


//redirects after logout
app.post("/logout", (req, res) => {
  res.clearCookie('username', req.body.username);
  res.redirect('/urls'); 
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
