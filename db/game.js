const model = require('./model.js');
const LRU = require('lru-cache');
const deepcopy = require('deepcopy');
var users = false;
const CACHE_SIZE = 200;

module.exports.updateUserGames = (userid) => {
  var currentUser = users.get(userid);
  if (currentUser) {
    for (let [key, value] of Object.entries(currentUser)) {
      if (value['updated']) {
        var copy = deepcopy(value);
        delete copy['updated'];
        var originalValue = value;
        originalValue['updated'] = false;
        currentUser[key] = originalValue;
        var updated = model.updateOne('game', {userid: userid, title: value['title']}, copy, {upsert: true});
      }
    }
    users.set(userid, currentUser);
  }
}

module.exports.getUserGames = (userid) => {
  return new Promise(async resolve => {
    var user = users.get(userid);
    if (!user) {
      await getUserGames(userid);
    }
    resolve(users.get(userid));
  });

}

module.exports.getGame = (game, userid) => {
  return new Promise(async resolve => {
    var user = users.get(userid);
    if (!user) {
      await getUserGames(userid);
      user = users.get(userid);
    }
    if (!(game in user)) {
      user[game] = {
        title: game,
        time: 0,
        start_date: new Date(),
        updated: false
      };
      users.set(userid, user);
    }
    resolve(user[game]);
  });
}

module.exports.updateCache = (gamedata, userid) => {
  var user = users.get(userid);
  user[gamedata['title']] = gamedata;
  users.set(userid, user);
}

module.exports.init = (data) => {
  users = new LRU(CACHE_SIZE);
}

function getUserGames(userid) {
  return new Promise(async resolve => {
    var result = await model.find('game', {userid: userid});
    var user = {};
    if (result) {
      for (const game of result) {
        user[game['title']] = {start_date: game['start_date'], time: game['time'], title: game['title'], updated: false};
      }
    }
    users.set(userid, user);
    resolve(true);
  });
}
