const mongodb = require('mongodb').MongoClient;
const guildModel = require('./guild.js');
const userModel = require('./user.js');
const connectionURL = 'mongodb://zwya:o6o6ed@ds263109.mlab.com:63109/discordbot';
var db = false;

module.exports.db = () => {
  if (db) {
    return db;
  }
  return false;
}

module.exports.init = () => {
  mongodb.connect(connectionURL, function(err, client) {
    if (err) {
      console.log(err);
      return;
    }
    db = client.db('discbot');
  });
  userModel.init();
  guildModel.init();
}
