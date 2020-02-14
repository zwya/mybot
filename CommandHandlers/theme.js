const music = require('./music.js');
const model = require('../db/model.js');
const urlExists = require('url-exists');
const LRU = require('lru-cache');
var cache = false;
const cacheSize = 200;

module.exports.onMessage = async (message, args) => {
  if (args[0] == 'theme') {
    if (args[1]) {
      if (args[1].startsWith('https://www.myinstants.com/media/sounds/')) {
        urlExists(args[1], async (err, exists) => {
          if (exists) {
            var userid = message.author.id;
            var user = await model.findOne('user', {userid: userid}, {});
            if (user) {
              if (user['theme'].length < 3) {
                const themes = user['theme'];
                themes.push(args[1]);
                var result = await model.updateOne('user', userid, {theme: themes});
                if (result) {
                  message.channel.send('Theme set');
                }
                else {
                  message.channel.send('An error happened while updating your theme in the database, consult a dev');
                }
              }
              else {
                message.channel.send('You cannot have more than 3 themes');
              }
            }
            else {
              var result = await model.insertOne('user', {userid: userid, theme: [args[1]]});
              if (result) {
                message.channel.send('Theme set');
              }
              else {
                message.channel.send('An error happened while saving your theme in the database, consult a dev');
              }
            }
          }
          else {
            message.channel.send('Link is dead');
          }
        });
      }
      else {
        message.channel.send('Not a supported link');
      }
    }
    else {
      message.channel.send('No link supplied');
    }
  } else if (args[0] == 'untheme') {
    if (args[1]) {
      if (args[1].startsWith('https://www.myinstants.com/media/sounds/')) {
        var user = await model.findOne('user', {userid: message.author.id}, {});
        if (user) {
          const themes = user['theme'];
          var foundIndex = false;
          for (var i=0;i<themes.length;i++) {
            if (themes[i] == args[1]) {
              foundIndex = i;
              break;
            }
          }
          if (foundIndex == false) {
            themes.splice(foundIndex, 1);
            var result = await model.updateOne('user', message.author.id, {theme: themes});
            if (result) {
              message.channel.send('Theme deleted succesfully');
            }
            else {
              message.channel.send('An error happened while updating your theme in the database, consult a dev');
            }
          }
          else {
            message.channel.send('You don\'t have this theme set');
          }
        }
        else {
          message.channel.send('An error happened while updating your theme in the database, consult a dev or you don\'t have any themes');
        }
      }
      else {
        message.channel.send('Not a supported link');
      }
    }
    else {
      var result = await model.deleteOne('user', message.author.id, result);
      message.channel.send('Deleted all themes');
    }
  }
}

module.exports.commands = ['theme', 'untheme'];

module.exports.onUserVoice = async (member) => {
  var data = cache.get(member.id);
  if (data) {
    var lastPlayed = false;
    var minuteDiff = false;
    if ('lastPlayed' in result) {
      lastPlayed = new Date(data['lastplayed']);
      minuteDiff = Math.floor((new Date() - lastPlayed) / (1000 * 60));
    }
    if ((minuteDiff && minuteDiff >= 30) || !minuteDiff) {
      var index = 0;
      if ('lastplayedindex' in data) {
        index = data['lastplayedindex'] + 1;
      }
      if (index == data['theme'].length) {
        index = 0;
      }
      music.playTheme(data['theme'][index], member.guild.id, member.voice.channel);
      data['lastplayed'] = new Date();
      data['lastplayedindex'] = index;
      cache.set(member.id, data);
      await model.updateOne('user', member.id, {lastplayed: data['lastplayed'], lastplayedindex: index});
      if(!result) {
        console.log('An error happened in theme');
      }
    }
  }
  else {
    var user = await model.findOne('user', {userid: member.id}, {});
    if (user) {
      var data = user;
      var lastPlayed = false;
      var minuteDiff = false;
      if ('lastPlayed' in user) {
        lastPlayed = new Date(data['lastplayed']);
        minuteDiff = Math.floor((new Date() - lastPlayed) / (1000 * 60));
      }
      if ((minuteDiff && minuteDiff >= 30) || !minuteDiff) {
        var index = 0;
        if ('lastplayedindex' in data) {
          index = data['lastplayedindex'] + 1;
        }
        if (index == data['theme'].length) {
          index = 0;
        }
        music.playTheme(data['theme'][index], member.guild.id, member.voice.channel);
        data['lastplayed'] = new Date();
        data['lastplayedindex'] = index;
        cache.set(member.id, data);
        var result = await model.updateOne('user', member.id, {lastplayed: data['lastplayed'], lastplayedindex: index});
        if(!result) {
          console.log('An error happened in theme');
        }
      }
    }
  }
}

module.exports.init = () => {
  cache = new LRU(cacheSize);
}
