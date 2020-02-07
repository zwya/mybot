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

module.exports.getMovies = (callback) => {
  if (module.exports.data && module.exports.data['movies']['top100']) {
    callback(module.exports.data['movies']['top100']);
  }
  else {
    request('http://webcrawler2.herokuapp.com/webserver/', function(error, response) {
      if (error) {
        console.log(error);
      }
      else {
        try {
          module.exports.data['movies']['top100'] = JSON.parse(response.body);
          callback(module.exports.data['movies']['top100']);
        }
        catch(e) {
          callback(false);
        }
      }
    });
  }
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

module.exports.createReview = (review) => {
  console.log(review.keywords);
  mongodb.connect(connectionURL, function(err, db) {
    if (err) {
      console.log(err);
      return;
    }
    var dbo = db.db('discordbot');
    dbo.collection('review').insertOne(review, function(err, res) {
      if (err) {
        console.log(err);
      }
    });
  });
}

module.exports.deleteReview = (reviewid) => {
  mongodb.connect(connectionURL, function(err, db) {
    if (err) {
      console.log(err);
      return;
    }
    var dbo = db.db('discordbot');
    var query = {
      _id: reviewid
    };
    dbo.collection('review').deleteOne(query, function(err, res) {
      if (err) {
        console.log(err);
      }
    });
  });
}

module.exports.updateReview = (reviewname, data) => {
  mongodb.connect(connectionURL, function(err, db) {
    if (err) {
      console.log(err);
      return;
    }
    var dbo = db.db('discordbot');
    var query = {
      namelower: reviewname
    };
    var newValues = {
      $set: data
    };
    dbo.collection('review').updateOne(query, newValues, function(err, res) {
      if (err) {
        console.log(err);
      }
    });
  });
}

module.exports.paginateReview = (after, date, callback) => {
  mongodb.connect(connectionURL, function(err, db) {
    if (err) {
      console.log(err);
      return;
    }
    var dbo = db.db('discordbot');
    query = {};
    if (after) {
      query['date'] = {'$gt': date};
    }
    else {
      query['date'] = {'$lt': date};
    }
    dbo.collection('review').find(query).sort({date: -1}).limit(10).toArray(function(err, result) {
      if (err) {
        console.log(err);
      }
      callback(result);
    });
  });
}

module.exports.findReview = (query, array, callback) => {
  mongodb.connect(connectionURL, function(err, db) {
    if (err) {
      console.log(err);
      return;
    }
    var dbo = db.db('discordbot');
    if (array) {
      dbo.collection('review').find(query).sort({date: -1}).limit(10).toArray(function(err, result) {
        if (err) {
          console.log(err);
        }
        callback(result);
      });
    }
    else {
      dbo.collection('review').findOne(query, function(err, res) {
        if (err) {
          console.log(err);
        }
        callback(res);
      });
    }
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

module.exports.getLatestMemes = (callback) => {
  request('https://www.reddit.com/r/memes/.json?limit=5', function(error, response) {
    if (error) {
      console.log(error);
    }
    else {
      var memes = [];
      const data = JSON.parse(response.body).data;
      data.children.forEach((item, i) => {
        memes.push({title: item.data.title, id: item.data.name, ups:item.data.ups, over_18:item.data.over_18, url:item.data.url, created_utc: item.data.created_utc})
      });
      callback(memes);
    }
  });
}

module.exports.init = () => {
  getUserDataFromDB();
  module.exports.data = {movies: {}};
  module.exports.data['movies']['top100'] = null;
}

/*data.findReview({namelower: 'midsommar'}, false, response => {
  if (response) {
    var cpy = response;
    cpy['date'] = new Date(response['date']);
    data.updateReview('midsommar', cpy);
  }
});*/
