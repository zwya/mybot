const matcher = require('did-you-mean');
const data = require('../data.js');

var m;

module.exports.init = () => {
  m = new matcher(data.allFiles);
  m.setThreshold(3);
  m.ignoreCase();
}

module.exports.match = (word) => {
  return m.get(word);
}
