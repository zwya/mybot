const music = require('./music.js');
const User = require('../db/user.js');
const Guild = require('../db/guild.js');
const urlExists = require('url-exists');
const perms = require('../util/permissions.js');

module.exports.onMessage = async (message, args) => {
  if (args[0] == 'theme') {
    if (args[1]) {
      if (args[1].startsWith('https://www.myinstants.com/media/sounds/')) {
        urlExists(args[1], async (err, exists) => {
          if (exists) {
            const user = await User.findOne({discordId: message.author.id});
            const bypass = true; //perms.canByPass(guild['lv'], perms.PERMS.THEMES);
            const maxThemes = 3; //perms.maxAllowed(guild['lv'], perms.PERMS.THEMES);
            if (user.theme.length < maxThemes) {
              user.theme.push(args[1]);
              await user.save();
              message.channel.send('Theme set');
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
        const user = await User.findOne({discordId: message.author.id});
        var themes = user.theme;
        var foundIndex = -1;
        for (var i=0;i<themes.length;i++) {
          if (themes[i] == args[1]) {
            foundIndex = i;
            break;
          }
        }
        if (foundIndex != -1) {
          themes.splice(foundIndex, 1);
          await user.save();
          message.channel.send('Deleted theme');
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
      var user = await User.findOne({discordId: message.author.id});
      user.theme = [];
      user.set('themeLastPlayIndex', null);
      user.set('themeLastPlayDate', null);
      await user.save();
      message.channel.send('Deleted all themes');
    }
  }
}

module.exports.commands = ['theme', 'untheme'];

module.exports.onUserVoice = async (member) => {
  var user = await User.findOne({discordId: member.id});
  if (user.theme.length > 0) {
    var lastPlayed = false;
    var minuteDiff = false;
    if (user.themeLastPlayDate) {
      lastPlayed = new Date(user.themeLastPlayDate);
      minuteDiff = Math.floor((new Date() - lastPlayed) / (1000 * 60));
    }
    if ((minuteDiff && minuteDiff >= 30) || !minuteDiff) {
      var index = 0;
      if (user.themeLastPlayDate) {
        index = user.themeLastPlayIndex + 1;
      }
      if (index == user.theme.length) {
        index = 0;
      }
      music.playTheme(user['theme'][index], member.guild.id, member.voice.channel);
      user.themeLastPlayDate = new Date();
      user.themeLastPlayIndex = index;
      await user.save();
    }
  }
}
