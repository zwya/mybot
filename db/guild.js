const model = require('./model.js');
const LRU = require('lru-cache');
const diff = require('deep-diff').diff;
const addDiff = require('../util/util.js').addDiff;
var guilds = false;
const CACHE_SIZE = 200;

module.exports.getGuild = (guildid) => {
  return new Promise(async resolve => {
    var guild = guilds.get(guildid);
    if (guild) {
      resolve(Object.assign({}, guild));
      return;
    }
    else {
      guild = await model.findOne('serverdata', {guildid: guildid}, {});
      if (guild) {
        guilds.set(guildid, guild);
        resolve(Object.assign({}, guild));
        return;
      }
    }
    guild = {prefix: '!', guildid: guildid, voicemap: {}, shouldMeme: false, memeChannel: false};
    guilds.set(guildid, guild);
    await model.insertOne('serverdata', guild);
    resolve(Object.assign({}, guild));
  });
}

module.exports.updateGuild = (guild) => {
  var gld = guild;
  return new Promise(async resolve => {
    var guild = gld;
    const guildid = guild['guildid'];
    var oldGuild = await module.exports.getGuild(guildid);
    var result = diff(oldGuild, guild);
    if (result) {
      var doc = {};
      for (var i=0;i<result.length;i++) {
        addDiff(result[i], guild, doc);
      }
      var result = await model.updateOne('serverdata', guildid, doc);
      if (result) {
        var guild = guilds.get(guildid);
        const keys = Object.keys(doc);
        for (var i=0;i<keys.length;i++) {
          guild[keys[i]] = doc[keys[i]];
        }
        guilds.set(guildid, guild);
        resolve(true);
      }
      resolve(false);
    }
  });
}

module.exports.init = () => {
  guilds = new LRU(CACHE_SIZE);
}
