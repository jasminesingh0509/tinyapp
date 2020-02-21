const { assert } = require('chai');

const { generateRandomString, urlsForUser, getUserByEmail, users, urlDatabase } = require("../helpers.js");

//TEST==================================================

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("userp@example.com", users);
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});