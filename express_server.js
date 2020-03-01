const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const {
  generateRandomString,
  urlsForUser,
  getUserByEmail,
  users,
  urlDatabase
} = require("./helpers");

//MIDDLEWEAR===============================================

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: ["hello"]
  })
);

//GET REQUESTS==============================================

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/logins");
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: "" };
  if (req.session.user_id) {
    templateVars = {
      urls: urlDatabase,
      username: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/logins");
  }
});

app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    let templateVars = {
      urls: urlsForUser(urlDatabase, req.session.user_id),
      username: users[req.session.user_id]
    };
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
  if (req.session.user_id) {
    templateVars.username = users[req.session.user_id];
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/logins");
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/logins", (req, res) => {
  res.render("logins");
});

//redirects to actual long url website
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//POST REQUESTS==============================================

// Register with unique id, check for unique email, add new user
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Please enter email AND password to proceed.");
    res.redirect("/register");
  }
  if (getUserByEmail(req.body.email, users)) {
    res.status(400).send("Please enter a unique email.");
    res.redirect("/urls");
  }
  let id = generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.user_id = id;
  res.redirect("/urls/");
});

// redirects after edit
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  // call randomString to generate short URL
  let randomString = generateRandomString();
  urlDatabase[randomString] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"]
  };
  res.redirect("/urls/" + randomString);
});

// redirects after delete
app.post("/urls/:shortURL/delete", (req, res) => {
  let userLinks = urlsForUser(urlDatabase, req.session.user_id);
  let shortURL = req.params.shortURL;
  if (userLinks[shortURL]) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.send("You are not authorized to delete this.");
  }
});

app.post("/logins", (req, res) => {
  let foundUser = getUserByEmail(req.body.email, users);
  if (
    foundUser &&
    foundUser["email"] === req.body.email &&
    bcrypt.compareSync(req.body.password, foundUser["password"])
  ) {
    req.session.user_id = foundUser.id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Password or email are incorrect");
  }
});

//redirects after logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
