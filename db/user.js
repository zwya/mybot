const model = require('./model.js');
const LRU = require('lru-cache');
const diff = require('deep-diff').diff;
const addDiff = require('../util/util.js').addDiff;
const removeEmpty = require('../util/util.js').removeEmpty;
const deepcopy = require('deepcopy');
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
  var usr = user;
  return new Promise(async resolve => {
    var user = usr;
    const userid = user['userid'];
    var oldUser = await module.exports.getUser(userid);
    var result = diff(oldUser, user);
    if (result) {
      var doc = {};
      for (var i=0;i<result.length;i++) {
        addDiff(result[i], user, doc);
      }
      doc = removeEmpty(doc);
      var result = await model.updateOne('user', userid, doc);
      if (result) {
        var user = users.get(userid);
        const keys = Object.keys(doc);
        for (var i=0;i<keys.length;i++) {
          user[keys[i]] = doc[keys[i]];
        }
        users.set(userid, user);
        resolve(true);
      }
      resolve(false);
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
