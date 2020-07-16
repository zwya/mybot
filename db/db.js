const mongoose = require('mongoose');
var connectionURL = 'mongodb://zwya:o6o6ed@ds263109.mlab.com:63109/discordbot';

module.exports.db = () => {
  if (db) {
    return db;
  }
  return false;
}

module.exports.init = (environ, whichBot) => {
  if (environ == 'DEV' && whichBot != 'Waifu') {
    connectionURL = 'mongodb://zwya:o6o6ed@ds219839.mlab.com:19839/discbot';
    console.log('We\'re in dev mode YAAY');
  }
  mongoose.connect(connectionURL, { useNewUrlParser: true, useCreateIndex: true }).then(() => {
    console.log('Connected to database');
  });
}
