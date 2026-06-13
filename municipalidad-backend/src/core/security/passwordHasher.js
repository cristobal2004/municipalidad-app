const bcrypt = require("bcrypt");

const BCRYPT_COST = 10;

const passwordHasher = {
  hash: (password) => bcrypt.hash(password, BCRYPT_COST),
  compare: (password, hash) => bcrypt.compare(password, hash),
};

module.exports = {
  passwordHasher,
};
