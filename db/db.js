const mongodb = require('mongodb').MongoClient;
const guildModel = require('./guild.js');
const userModel = require('./user.js');
var connectionURL = 'mongodb://zwya:o6o6ed@ds263109.mlab.com:63109/discordbot';
var db = false;
var dbname = 'discordbot';

module.exports.db = () => {
  if (db) {
    return db;
  }
  return false;
}

module.exports.init = (environ) => {
  if (environ == 'DEV') {
    connectionURL = 'mongodb://zwya:o6o6ed@ds219839.mlab.com:19839/discbot';
    dbname = 'discbot';
  }
  mongodb.connect(connectionURL, function(err, client) {
    if (err) {
      console.log(err);
      return;
    }
    db = client.db(dbname);
  });
  userModel.init();
  guildModel.init();
}
