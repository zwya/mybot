const fs = require('fs');
const mongodb = require('mongodb').MongoClient;
const connectionURL = 'mongodb://zwya:o6o6ed@ds263109.mlab.com:63109/discordbot';
const ytdl = require('ytdl-core');
const request = require('request');

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
        userData[res[i]['userid']].lastplayed = res[i]['lastplayed'];
        userData[res[i]['userid']].startTime = res[i]['startTime'];
        userData[res[i]['userid']].endTime = res[i]['endTime'];
      }
      module.exports.userData = userData;
      db.close();
    });
  });
  mongodb.connect(connectionURL, function(err, db) {
    if (err) {
      console.log(err);
      return;
    }
    var dbo = db.db('discordbot');
    dbo.collection('serverdata').find({}).toArray(function(err, res) {
      if (err) {
        console.log(err);
        return;
      }
      var serverData = {}
      for (var i = 0; i < res.length; i++) {
        serverData[res[i]['guildid']] = {};
        serverData[res[i]['guildid']].prefix = res[i].prefix
      }
      module.exports.serverData = serverData;
      db.close();
    });
  });
}

module.exports.getYtVideoInfo = (args, callback) => {
  request('http://webcrawler2.herokuapp.com/webserver/video?q=' + args[1], function(error, response, body) {
    if (error) {
      console.log(error);
    } else {
      ytdl.getInfo('https://www.youtube.com/watch?v=' + JSON.parse(body).link, function(err, info) {
        callback(info);
      });
    }
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

module.exports.updateServer = (guildid, data) => {
  mongodb.connect(connectionURL, function(err, db) {
    if (err) {
      console.log(err);
      return;
    }
    var dbo = db.db('discordbot');
    var query = {
      guildid: guildid
    };
    var newValues = {
      $set: data
    };
    dbo.collection('serverdata').updateOne(query, newValues, function(err, res) {
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

module.exports.deleteServer = (guildid) => {
  mongodb.connect(connectionURL, function(err, db) {
    if (err) {
      console.log(err);
      return;
    }
    var dbo = db.db('discordbot');
    var query = {
      guildid: guildid
    };
    dbo.collection('serverdata').deleteOne(query, function(err, res) {
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

module.exports.createServer = (guild) => {
  mongodb.connect(connectionURL, function(err, db) {
    if (err) {
      console.log(err);
      return;
    }
    var dbo = db.db('discordbot');
    dbo.collection('serverdata').insertOne(guild, function(err, res) {
      if (err) {
        console.log(err);
      }
    });
  });
}

module.exports.init = () => {
  getUserDataFromDB();
}
