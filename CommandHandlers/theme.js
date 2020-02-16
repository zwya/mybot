const music = require('./music.js');
const userModel = require('../db/user.js');
const guildModel = require('../db/guild.js');
const urlExists = require('url-exists');
const perms = require('../util/permissions.js');

module.exports.onMessage = async (message, args) => {
  if (args[0] == 'theme') {
    if (args[1]) {
      if (args[1].startsWith('https://www.myinstants.com/media/sounds/')) {
        urlExists(args[1], async (err, exists) => {
          if (exists) {
            var user = await userModel.getUser(message.author.id);
            const guild = await guildModel.getGuild(message.guild.id);
            const bypass = perms.canByPass(guild['lv'], perms.PERMS.THEMES);
            const maxThemes = perms.maxAllowed(guild['lv'], perms.PERMS.THEMES);
            console.log(guild['lv'], perms.PERMS.THEMES);
            console.log(bypass, maxThemes);
            if (bypass || user['theme'].length < maxThemes) {
              user['theme'].push(args[1]);
              var result = await userModel.updateUser(user);
              if (result) {
                message.channel.send('Theme set');
              }
              else {
                message.channel.send('An error happened while updating your theme in the database, consult a dev');
              }
            }
            else {
              message.channel.send(`You cannot have more than ${maxThemes} themes`);
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
        var user = await userModel.getUser(message.author.id);
        var themes = user['theme'];
        var foundIndex = -1;
        for (var i=0;i<themes.length;i++) {
          if (themes[i] == args[1]) {
            foundIndex = i;
            break;
          }
        }
        if (foundIndex != -1) {
          themes.splice(foundIndex, 1);
          var result = await userModel.updateUser(user);
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
        message.channel.send('Not a supported link');
      }
    }
    else {
      var user = await userModel.getUser(message.author.id);
      user['theme'] = [];
      user['lastplayed'] = false;
      var result = await userModel.updateUser(user);
      if (result) {
        message.channel.send('Deleted all themes');
      }
      else {
        message.channel.send('You have no themes');
      }
    }
  }
}

module.exports.commands = ['theme', 'untheme'];

module.exports.onUserVoice = async (member) => {
  var user = await userModel.getUser(member.id);
  if (user['theme'].length > 0) {
    var lastPlayed = false;
    var minuteDiff = false;
    if (user['lastplayed']) {
      lastPlayed = new Date(user['lastplayed']);
      minuteDiff = Math.floor((new Date() - lastPlayed) / (1000 * 60));
    }
    if ((minuteDiff && minuteDiff >= 30) || !minuteDiff) {
      var index = 0;
      if (user['lastplayed']) {
        index = user['lastplayedindex'] + 1;
      }
      if (index == user['theme'].length) {
        index = 0;
      }
      music.playTheme(user['theme'][index], member.guild.id, member.voice.channel);
      user['lastplayed'] = new Date();
      user['lastplayedindex'] = index;
      var result = await userModel.updateUser(user);
      if(!result) {
        console.log('An error happened in theme');
      }
    }
  }
}
