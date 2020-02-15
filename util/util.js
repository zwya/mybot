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
