const mongodb = require('mongodb').MongoClient;
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
    db = client.db('discordbot');
  });
}
