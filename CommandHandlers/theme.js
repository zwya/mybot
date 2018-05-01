var fs = require('fs')
var play = require('./play.js');
var data = require('../data.js');
var userData;

module.exports.setTheme = (message, args) => {
  if (play.hasFile(args[1])) {
    if (args[2] && message.mentions.users.first()) {
      var memberId = message.mentions.users.first().id;
    } else {
      var memberId = message.member.id;
    }
    if (!userData) {
      userData = data.userData;
    }
    console.log(userData);
    if (userData[memberId]) {
      userData[memberId].theme = args[1];
      data.updateUser(memberId, {
        theme: args[1]
      });
    } else {
      userData[memberId] = {};
      userData[memberId].theme = args[1];
      data.createUser({
        userid: memberId,
        theme: args[1]
      });
    }
    return true;
  }
  return false;
}

module.exports.unsetTheme = (member) => {
  if (!userData) {
    userData = data.userData;
  }
  if (userData[member.id]) {
    delete userData[member.id];
    data.deleteUser(member.id);
  }
}

module.exports.onUserLogin = (member) => {
  if (!userData) {
    userData = data.userData;
  }
  if (userData[member.id]) {
    rightNow = new Date(Date.now());
    if (userData[member.id].lastplayed) {
      lastPlayed = new Date(userData[member.id].lastplayed);
      var differenceInHours = Math.floor((rightNow - lastPlayed) / (1000 * 60 * 60));
      if (differenceInHours >= 1) {
        args = [];
        args.push('!play');
        args.push(userData[member.id].theme);
        play.playMusic(member, args);
        userData[member.id].lastplayed = rightNow.toLocaleString();
      }
    } else {
      args = [];
      args.push('!play');
      args.push(userData[member.id].theme);
      play.playMusic(member, args);
      userData[member.id].lastplayed = rightNow.toLocaleString();
    }
    data.updateUser(member.id, {
      lastplayed: userData[member.id].lastplayed
    });
  }
}
