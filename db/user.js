const model = require('./model.js');
const LRU = require('lru-cache');
var users = false;
const CACHE_SIZE = 200;

module.exports.getUser = (userid) => {
  return new Promise(async resolve => {
    var user = users.get(userid);
    if (user) {
      resolve(user);
      return;
    }
    else {
      user = await model.findOne('user', {userid: userid}, {});
      if (user) {
        users.set(userid, user);
        resolve(user);
        return;
      }
    }
    user = {userid: userid, theme: [], lastplayed: false, lastplayedindex: false, lv:'lv1'};
    users.set(userid, user);
    await model.insertOne('user', user);
    resolve(user);
  });
}

module.exports.updateUser = (user) => {
  return new Promise(async resolve => {
    const userid = user['userid'];
    users.set(userid, user);
    var result = await model.updateOne('user', userid, user);
    if (result) {
      resolve(true);
    }
    else {
      resolve(false);
    }
  });
}

module.exports.updateUserCache = (user) => {
  users.set(user['userid'], user);
}

module.exports.getTrackedUsers = () => {
  return new Promise(async resolve  => {
    var users = await model.find('user', {tracked: true}, {projection: {'userid': 1}});
    resolve(users);
  });
}

module.exports.init = () => {
  users = new LRU(CACHE_SIZE);
}
