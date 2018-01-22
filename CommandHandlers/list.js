const fs = require('fs');
var allFiles;
var allFilesInit;

function walk(dir, done) {
  fs.readdir(dir, function(error, list) {
    if (error) {
      return done(error);
    }

    var i = 0;

    (function next() {
      var file = list[i++];

      if (!file) {
        return done(null);
      }

      file = dir + '/' + file;

      fs.stat(file, function(error, stat) {

        if (stat && stat.isDirectory()) {
          walk(file, function(error) {
            next();
          });
        } else {
          // do stuff to file here
          filecpy = file;
          filecpy = filecpy.substring(9);
          filecpy = filecpy.substring(0, filecpy.length - 4);
          allFiles.push(filecpy);
          next();
        }
      });
    })();
  });
};

function init() {
  allFiles = [];
  allFilesInit = false;
  walk('./Audio/', err => {
    if (err) {
      console.log(err);
      allFilesInit = false;
    } else {
      allFilesInit = true;
    }
  });
}

module.exports.init = () => {
  init();
}

module.exports.list = (args) => {
  if (args[1] && Number(args[1])) {
    list = [];
    start = (args[1] - 1) * 10;
    if (start >= allFiles.length)
      return list;
    end = (args[1]) * 10;
    if (end > allFiles.length)
      end = allFiles.length
    for (var i = start; i < end; i++) {
      list.push(allFiles[i]);
    }
    return list;
  }
  return NaN;
}
