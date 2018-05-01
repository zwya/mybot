const fs = require('fs');
const mongodb = require('mongodb').MongoClient;
const connectionURL = 'mongodb://zwya:o6o6ed@ds263109.mlab.com:63109/discordbot';

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

function getUserDataFromDB() {
  mongodb.connect(connectionURL, function(err, db) {
    if (err) {
      console.log(err);
      return;
    }
    var dbo = db.db('discordbot');
    dbo.collection('userdata').find({}).toArray(function(err, res) {
      if (err) {
        console.log(err);
        return;
      }
      userData = {}
      for (var i = 0; i < res.length; i++) {
        userData[res[i]['userid']] = {};
        userData[res[i]['userid']].theme = res[i]['theme'];
      }
      module.exports.userData = userData;
      db.close();
    });
  });
}


module.exports.updateUser = (userid, data) => {
  mongodb.connect(connectionURL, function(err, db) {
    if (err) {
      console.log(err);
      return;
    }
    var dbo = db.db('discordbot');
    var query = {
      userid: userid
    };
    var newValues = {
      $set: data
    };
    dbo.collection('userdata').updateOne(query, newValues, function(err, res) {
      if (err) {
        console.log(err);
      }
    });
  });
}

module.exports.deleteUser = (userid) => {
  mongodb.connect(connectionURL, function(err, db) {
    if (err) {
      console.log(err);
      return;
    }
    var dbo = db.db('discordbot');
    var query = {
      userid: userid
    };
    dbo.collection('userdata').deleteOne(query, function(err, res) {
      if (err) {
        console.log(err);
      }
    });
  });
}

module.exports.createUser = (user) => {
  mongodb.connect(connectionURL, function(err, db) {
    if (err) {
      console.log(err);
      return;
    }
    var dbo = db.db('discordbot');
    dbo.collection('userdata').insertOne(user, function(err, res) {
      if (err) {
        console.log(err);
      }
    });
  });
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
  getUserDataFromDB();
}
