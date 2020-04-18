const fs = require('fs');

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
  var path = diff['path'];
  var result = object;
  var dc = doc;
  var end = path.length - 1;
  if (parseInt(path[path.length - 1])) {
    end = path.length - 2;
  }
  for (var i=0;i<end;i++) {
    result = result[path[i]];
    if (!(path[i] in dc)) {
      dc[path[i]] = {};
      dc = dc[path[i]];
    }
  }
  dc[path[end]] = result[path[end]];
  return dc;
}

module.exports.getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
}
