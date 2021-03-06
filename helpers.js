const bcrypt = require("bcrypt");

//DATABASE=========================================================
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("password", 10)
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("test", 10)
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" }
};
// FUNCTIONS=========================================================
function generateRandomString() {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * 62));
  }
  return result;
}

//loops through the data and checks to see if the value of userID is equal to id.
const urlsForUser = (data, id) => {
  const results = {};
  for (let [key, value] of Object.entries(data)) {
    if (value["userID"] === id) {
      results[key] = value["longURL"];
    }
  }
  return results;
};

const getUserByEmail = function(email, database) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

module.exports = {
  generateRandomString,
  urlsForUser,
  getUserByEmail,
  users,
  urlDatabase
};
