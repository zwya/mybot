const fs = require('fs');

isAudioCategorized = false;

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

function readCategories() {
  if (fs.existsSync('./audiocategories.json')) {
    audioCategoriesFile = JSON.parse(fs.readFileSync('./audiocategories.json', 'utf8'));
    audioCategories = {};
    for (var key in audioCategoriesFile) {
      if (module.exports.allFiles.indexOf(key) != -1) {
        if (audioCategories[audioCategoriesFile[key]]) {
          audioCategories[audioCategoriesFile[key]].push(key);
        } else {
          audioCategories[audioCategoriesFile[key]] = [];
          audioCategories[audioCategoriesFile[key]].push(key);
        }
      } else {
        console.log('I don\'t know audio file: ' + key + ', I will not add it to categories')
      }
    }
    module.exports.audioCategories = audioCategories;
  } else {
    conosle.log('WARNING: audiocategories.json not found please create it if you wish to have audio categoeries')
  }
}

module.exports.init = () => {
  module.exports.allFiles = [];
  walk('./Audio/', err => {
    if (err) {
      console.log(err);
    } else {
      readCategories();
    }
  });
}
