const userModel = require('../db/user.js');
const perms = require('../util/permissions.js');
const confirmationSetences = require('../data.json').confirmation;
const random = require('../util/util.js').getRandomInt;
const INTERVAL_TIME = 1000 * 60;
const SAVE_INTERVAL = 30; // In Minutes
var current_interval = 0;
var interval = false;
var clientUsers = false;
var tracking = false;
var dbUsers = {};

module.exports.onMessage = async (message, args) => {
  if (args[0] == 'track') {
    var id = false;
    var errmsg = false;
    if (args.length == 2 && args[1].startsWith('<@!')) {
      if (perms.HAS_PERMS('trackothers', message.member.id)) {
        var member = message.mentions.members.first();
        if (!member.user.bot) {
          id = member.id;
        }
        else {
          errmsg = 'I cannot track a bot user';
        }
      }
      else {
        errmsg = 'You do not have permissions to track others';
      }
    }
    else if (args.length == 2 && args[1] == 'me') {
      if (perms.HAS_PERMS('trackself', message.member.id)) {
        id = message.member.id;
      }
      else {
        errmsg = 'You do not have permissions to track yourself';
      }
    }
    else {
      errmsg = 'Command format incorrect';
    }

    if (errmsg) {
      message.channel.send(errmsg);
      return;
    }

    if (id && !(id in dbUsers)) {
      var user = await userModel.getUser(id);
      user['tracked'] = true;
      if (!('statistics' in user)) {
        user['statistics'] = {};
      }
      userModel.updateUser(user);
      dbUsers[id] = user;
      message.channel.send(confirmationSetences[random(confirmationSetences.length)]);
      if (!tracking) {
        interval = setInterval(track, INTERVAL_TIME);
        tracking = true;
        current_interval = 0;
      }
    }
  }
  else if (args[0] == 'stats') {
    var id = false;
    var start = false;
    var errmsg = false;
    if (args.length == 1) {
      if (perms.HAS_PERMS('statself', message.member.id)) {
        id = message.member.id;
        start = 0;
      }
      else {
        errmsg = 'You do not have permissions to view your stats';
      }
    }
    else if (args.length == 2) {
      if (args[1].startsWith('<@!')) {
        if (perms.HAS_PERMS('statothers', message.member.id)) {
          var member = message.mentions.members.first();
          start = 0;
          id = member.id;
        }
        else {
          errmsg = 'You do not have permissions to view other members stats';
        }
      }
      else if (args[1].length > 0 && !isNaN(args[1])) {
        if (perms.HAS_PERMS('statself', message.member.id)) {
          id = message.member.id;
          start = parseInt(args[1]) - 1;
        }
        else {
          errmsg = 'You do not have permissions to view your stats';
        }
      }
      else if (args.length == 3 && args[1].startsWith('<@!') && args[2].length > 0 && !isNaN(args[2])) {
        if (perms.HAS_PERMS('statothers', message.member.id)) {
          var member = message.mentions.members.first();
          start = parseInt(args[2]) - 1;
          id = member.id;
        }
        else {
          errmsg = 'You do not have permissions to view other members stats';
        }
      }
      else {
        errmsg = 'Command format incorrect';
      }
    }

    if (errmsg) {
      message.channel.send(errmsg);
      return;
    }

    if (id in dbUsers) {
      var sorted = [];
      for (let [key, value] of Object.entries(dbUsers[id]['statistics'])) {
        sorted.push({game: key, time: value});
      }
      sorted.sort((a,b) => (a.time > b.time) ? 1 : ((b.time > a.time) ? -1 : 0));

      var text = '';
      for (var i=start * 10;i<(start+1)*10 && i<sorted.length;i++) {
        var inHour = sorted[i]['time'] / 60 / 60;
        var inMinute = sorted[i]['time'] / 60;
        var time = sorted[i]['time'].toFixed(2) + ' seconds';
        if (inHour > 1) {
          time = inHour.toFixed(2) + ' hours';
        }
        else if (inMinute > 1) {
          time = inMinute.toFixed(2) + ' minutes';
        }
        text = text + sorted[i]['game'] + ' ==> ' + time + '\n';
      }
      if (text.length > 0) {
        message.channel.send(text);
      }
      else {
        message.channel.send('No stats found on this page');
      }
    }
    else {
      message.channel.send('This user has tracking disabled');
    }
  }
  else if (args[0] == 'untrack') {
    var errmsg = false;
    if (args.length == 2) {
      if (args[1] == 'me') {
        if (perms.HAS_PERMS('untrackself', message.member.id)) {
          if (message.member.id in dbUsers) {
            var user = dbUsers[message.member.id];
            dbUsers = false;
            userModel.updateUser(user);
            delete dbUsers[message.member.id];
            message.channel.send('I am no longer watching you');
            if (tracking && Object.keys(dbUsers).length !== 0) {
              tracking = false;
              clearInterval(interval);
            }
          }
          else {
            errmsg = 'You have not enabled tracking';
          }
        }
        else {
          errmsg = 'You do not have permissions to make me stop';
        }
      }
      else if (args[1].startsWith('<@!')) {
        if (perms.HAS_PERMS('untrackothers', message.member.id)) {
          var member = message.mentions.members.first();
          if (member.id in dbUsers) {
            var user = tracker['dbUsers'][member.id];
            dbUsers = false;
            userModel.updateUser(user);
            delete dbUsers[member.id];
            message.channel.send('I am no longer watching this user');
            if (tracking && Object.keys(dbUsers).length !== 0) {
              tracking = false;
              clearInterval(interval);
            }
          }
          else {
            errmsg = 'This user has not enabled tracking';
          }
        }
        else {
          errmsg = 'You do not have permissions to make me stop tracking this member';
        }
      }
      else {
        errmsg = 'Command format incorrect';
      }
    }
    else {
      errmsg = 'Command format incorrect';
    }
    if (errmsg) {
      message.channel.send(errmsg);
    }
  }
}

function track() {
  current_interval+=1;
  Object.keys(dbUsers).forEach((item, i) => {
    clientUsers.fetch(item).then(user => {
      if (user.presence.activities && user.presence.activities.length != 0) {
        var act = user.presence.activities[0];
        if (act['name'] in dbUsers[item]['statistics']) {
          dbUsers[item]['statistics'][act['name']] += 60;
        }
        else {
          dbUsers[item]['statistics'][act['name']] = 60;
        }
      }
    });
    if (current_interval % SAVE_INTERVAL == 0){
      userModel.updateUser(dbUsers[item]);
    }
  });
  if (current_interval % SAVE_INTERVAL == 0) {
    current_interval = 0;
  }
}

module.exports.init = async (data) => {
  var users = await userModel.getTrackedUsers();
  if (users) {
    for (const user of users) {
      dbUsers[user['userid']] = user;
    }
  }
  clientUsers = data['users'];
  if (Object.keys(dbUsers).length !== 0) {
    tracking = true;
    interval = setInterval(track, INTERVAL_TIME);
    current_interval = 0;
  }
}


//game name = activities[name]
//game when = activities[type] == "PLAYING"

module.exports.commands = ['track', 'stats', 'untrack'];
