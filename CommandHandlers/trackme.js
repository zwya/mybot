const moment = require('moment');
const User = require('../db/user.js');
const Game = require('../db/game.js');
const GamePlayed = require('../db/gameplayed.js');
const perms = require('../util/permissions.js');
const confirmationSetences = require('../data.json').confirmation;
const random = require('../util/util.js').getRandomInt;
const INTERVAL_TIME = 1000 * 60;
const SAVE_INTERVAL = 30; // In Minutes
var current_interval = 1;
var interval = false;
var clientUsers = false;
var tracking = false;
var dbUsers = [];
const gamesRecorded = {};

module.exports.onMessage = async (message, args) => {
  try {
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

      if (id && !dbUsers.includes(id)) {
        const user = await User.findOneOrCreateDefault({discordId: id});
        user.tracked = true;
        user.save();
        dbUsers.push(id);
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
            start = parseInt(args[1]);
          }
          else {
            errmsg = 'You do not have permissions to view your stats';
          }
        }
      }
      else if (args.length == 3 && args[1].startsWith('<@!') && args[2].length > 0 && !isNaN(args[2])) {
        if (perms.HAS_PERMS('statothers', message.member.id)) {
          var member = message.mentions.members.first();
          start = parseInt(args[2]);
          id = member.id;
        }
        else {
          errmsg = 'You do not have permissions to view other members stats';
        }
      }
      else {
        errmsg = 'Command format incorrect';
      }

      if (errmsg) {
        message.channel.send(errmsg);
        return;
      }

      if (dbUsers.includes(id)) {
        const user = await User.findOne({discordId: id});
        const gamesPlayed = await GamePlayed.paginate({user: user.id}, {page: (start >= 1)? start : 1, limit: 10, populate: 'game', sort: {timeSpent: 'desc'}});
        if (gamesPlayed.docs.length > 0) {
          let text = '';
          for (const gamePlayed of gamesPlayed.docs) {
            var inHour = gamePlayed.timeSpent / 60 / 60;
            var inMinute = gamePlayed.timeSpent / 60;
            var time = gamePlayed.timeSpent.toFixed(2) + ' seconds';
            if (inHour > 1) {
              time = inHour.toFixed(2) + ' hours';
            }
            else if (inMinute > 1) {
              time = inMinute.toFixed(2) + ' minutes';
            }
            text = text + gamePlayed.game.title + ' ==> ' + time + '\n';
          }
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
      let id = false;
      let responseMessage = false;
      var errmsg = false;
      if (args.length == 2) {
        if (args[1] == 'me') {
          if (perms.HAS_PERMS('untrackself', message.member.id)) {
            if (dbUsers.includes(message.member.id)) {
              id = message.member.id;
              responseMessage = 'I am no longer watching you';
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
            if (dbUsers.includes(member.id)) {
              id = member.id;
              responseMessage = 'I am no longer watching this user';
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
        return;
      }
      const user = await User.findOne({discordId: id});
      user.tracked = false;
      user.save();
      dbUsers = dbUsers.filter(uid => uid != id);
      message.channel.send(responseMessage);
      if (tracking && dbUsers.length == 0) {
        tracking = false;
        clearInterval(interval);
      }
    }
  }
  catch (e) {
    console.log(e);
  }
}

async function track() {
  current_interval+=1;
  for (const userid of dbUsers) {
    const user = await clientUsers.fetch(userid);
    if (user.presence.activities && user.presence.activities.length != 0) {
      const act = user.presence.activities[0];
      recordGame(userid, act['name']);
    }
  }
  if (current_interval % (SAVE_INTERVAL + 1) == 0){
    updatePlayedGames();
    current_interval = 1;
  }
}

module.exports.init = async (data) => {
  clientUsers = data['users'];
  const users = await User.find({tracked: true}, 'discordId');
  if (users) {
    for (const user of users) {
      dbUsers.push(user.discordId);
    }
    tracking = true;
    interval = setInterval(track, INTERVAL_TIME);
    current_interval = 1;
  }
}

function recordGame(userId, game) {
  if (gamesRecorded[userId]) {
    const userGames = gamesRecorded[userId];
    if (userGames[game]) {
      userGames[game] = userGames[game] + 60;
    }
    else {
      userGames[game] = 60;
    }
  }
  else {
    gamesRecorded[userId] = {};
    gamesRecorded[userId][game] = 60;
  }
}

async function updatePlayedGames() {
  const users = Object.keys(gamesRecorded);
  const gameIdCache = {}; // Title to mongodb id
  const userIdCache = {}; // discord id to mongodb id
  for (const user of users) {
    const games = Object.keys(gamesRecorded[user]);
    const dbUser = await User.findOne({discordId: user});
    userIdCache[user] = dbUser.id;
    for (const game of games) {
      let gameId = false;
      if (gameIdCache[game]) {
        gameId = gameIdCache[game];
      }
      else {
        let dbGame = await Game.findOneOrCreateDefault({title: game});
        gameIdCache[game] = dbGame.id;
      }
      let gamePlayed = await GamePlayed.findOne({user: userIdCache[user], game: gameIdCache[game]});
      if (!gamePlayed) {
        gamePlayed = new GamePlayed({user: userIdCache[user], game: gameIdCache[game], timeSpent: gamesRecorded[user][game], startDate: moment.utc().toDate()});
      }
      else {
        gamePlayed.timeSpent = gamePlayed.timeSpent + gamesRecorded[user][game];
      }
      await gamePlayed.save();
    }
    delete gamesRecorded[user];
  }
}


//game name = activities[name]
//game when = activities[type] == "PLAYING"

module.exports.commands = ['track', 'stats', 'untrack'];
