const fs = require('fs');
const secureRandom = require('secure-random');

module.exports.removeEmpty = (obj) => {
  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === 'object') module.exports.removeEmpty(obj[key]);
    else if (obj[key] === undefined) delete obj[key];
  });
  return obj;
};

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

module.exports.addDiff = (diff, object, doc) => {
  var dc = doc;
  var path = diff['path'];
  dc[path[0]] = object[path[0]];
  return dc;
}

module.exports.getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
}

module.exports.generateSecureId = () => {
  return secureRandom.randomBuffer(8).readUInt32BE();
}
