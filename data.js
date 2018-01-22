const fs = require('fs');

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
          module.exports.allFiles.push(filecpy);
          next();
        }
      });
    })();
  });
};

function init() {
  module.exports.allFiles = [];
  walk('./Audio/', err => {
    if (err) {
      console.log(err);
    }
  });
}

module.exports.init = () => {
  init();
}
