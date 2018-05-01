var play = require('./play.js');
var data = require('../data.js');

module.exports.setTheme = (message, args) => {
  if (play.hasFile(args[1])) {
    if (args[2] && message.mentions.users.first()) {
      var memberId = message.mentions.users.first().id;
    } else {
      var memberId = message.member.id;
    }
    if (data.userData[memberId]) {
      data.userData[memberId].theme = args[1];
      data.updateUser(memberId, {
        theme: args[1]
      });
    } else {
      data.userData[memberId] = {};
      data.userData[memberId].theme = args[1];
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
  if (data.userData[member.id]) {
    delete data.userData[member.id];
    data.deleteUser(member.id);
  }
}

module.exports.onUserLogin = (member) => {
  if (data.userData[member.id]) {
    rightNow = new Date(Date.now());
    if (data.userData[member.id].lastplayed) {
      lastPlayed = new Date(data.userData[member.id].lastplayed);
      var differenceInHours = Math.floor((rightNow - lastPlayed) / (1000 * 60 * 60));
      if (differenceInHours >= 1) {
        args = [];
        args.push('!play');
        args.push(data.userData[member.id].theme);
        play.playMusic(member, args);
        data.userData[member.id].lastplayed = rightNow.toLocaleString();
        data.updateUser(member.id, {
          lastplayed: data.userData[member.id].lastplayed
        });
      }
    } else {
      args = [];
      args.push('!play');
      args.push(data.userData[member.id].theme);
      play.playMusic(member, args);
      data.userData[member.id].lastplayed = rightNow.toLocaleString();
      data.updateUser(member.id, {
        lastplayed: data.userData[member.id].lastplayed
      });
    }
  }
}
