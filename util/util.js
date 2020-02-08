const fs = require('fs');

module.exports.prefixify = (string, prefix) => {
  return string.replace(new RegExp('!', 'g'), prefix);
}

module.exports.savejson = (filename, json) => {
  fs.writeFile(filename, JSON.stringify(json, null, 4), function(err) {
    if(err) {
      console.log(err);
    }
  });
}
