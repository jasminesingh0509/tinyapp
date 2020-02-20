const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

//MIDDLEWEAR===============================================
app.set("view engine", "ejs");
app.use(cookieParser());

//DATABASE=========================================================
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};


// FUNCTIONS=========================================================
// function to generate random string for short URL. Call it where necessary. 
function generateRandomString() {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * 62));
  }
  return result;
}

//the function below loops through the data and checks to see if the value of userID is equal to id. //console.log(urlsForUser(urlDatabase, 'aJ48lW'));
const urlsForUser = (data, id) => {
  let results = {};
  for (let [key, value] of Object.entries(data)) {
    if(value['userID'] === id) {
      results[key]=value['longURL'];
    }
  }
  console.log('some info:', results, data, id);
  return results; 
};



const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//GET REQUESTS=======================================================
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: ""};
  if (req.cookies["user_id"]) {
  templateVars = { urls: urlDatabase, username: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
} else {
  res.redirect("/logins");
}  
});

app.get("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    templateVars = { 
      urls: urlsForUser(urlDatabase, req.cookies["user_id"]), username: users[req.cookies["user_id"]]
    };
    console.log(templateVars);
    res.render("urls_index", templateVars); 
  } else {
    res.redirect("/logins");
  }  
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = {
    username: "",
    urls: urlDatabase,
    shortURL,
    longURL: urlDatabase[shortURL].longURL
  };
  if (req.cookies["user_id"]) {
    templateVars.username = users[req.cookies["user_id"]];
    res.render("urls_show", templateVars);
 } else {
    res.redirect("/logins");
  } 
});

app.get("/register", (req, res) => {
  let templateVars = { username: ""};
  res.render("register", templateVars);
});

app.get("/logins", (req, res) => {
  let templateVars = { username: ""};
  res.render("logins", templateVars);
});

//POST REQUESTS======================================================
// Register with unique id, check for unique email, add new user
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Please enter email AND password to proceed.");
    res.redirect("/register");
  }
  for (const user in users) {
    if (users[user]["email"] === req.body.email) {
      res.status(400).send("Please enter a unique email.");
      res.redirect("/urls");
    }
  }
  let id = generateRandomString();
  users[id] = { id: id, email: req.body.email, password: req.body.password };
  res.cookie("user_id", id);
  res.redirect("/urls/");
});


// const urlDatabase = {
//   b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
//   i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
// };
// redirects after edit 
app.post("/urls/:id", (req, res) => {
  let id = req.params.id;
  urlDatabase[id].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  // call randomString to generate short URL
  let randomString = generateRandomString();
  urlDatabase[randomString] = {longURL: req.body.longURL, userID: req.cookies["user_id"]}
  res.redirect('/urls/' + randomString); 
});

// redirects after delete
app.post("/urls/:shortURL/delete", (req, res) => {
  let {shortURL} = req.params;
  /// urls[shorturl].user_id ==== userID: req.cookies["user_id"]
  delete urlDatabase[shortURL];
  res.redirect('/urls'); 
});

app.post("/login", (req, res) => {
  let foundUser; 
  for (const user in users) {
    if (users[user]["email"] === req.body.email) {
      foundUser = users[user];
      // res.status(403).send("Email cannot be found");
    }
  }
  if (
   foundUser["email"] === req.body.email &&
    foundUser["password"] !== req.body.password
  ) {
    res.status(403).send("Password does not match");
  } else {
    res.cookie("user_id", foundUser.id);
    res.redirect("/urls");
  }
});

//redirects after logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id', req.body.email);
  res.redirect('/urls'); 
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
