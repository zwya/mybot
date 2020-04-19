const model = require('../db/model.js');
const guildModel = require('../db/guild.js');
const fs = require('fs');
const allCommands = {};
const interceptQueue = {};
const userVoiceIntercept = [];

module.exports.init = (data) => {
  const commandFiles = fs.readdirSync('./CommandHandlers').filter(file => file.endsWith('.js') && !file.startsWith('handler'));
  for (const file of commandFiles) {
    const package = require(`./${file}`);
    if ('init' in package) {
      package.init(data);
    }
    if ('commands' in package && 'onMessage' in package) {
      for (const cmd of package.commands) {
        allCommands[cmd] = package.onMessage;
      }
    }
    if ('intercept' in package) {
      package.intercept = interceptQueue;
    }
    if ('onUserVoice' in package) {
      userVoiceIntercept.push(package.onUserVoice);
    }
    if ('onPresenceUpdate' in package) {
      presenceUpdateIntercept.push(package.onPresenceUpdate);
    }
  }
}

module.exports.onMessage = async (message) => {
  if (message.author.bot) return;
  if (message.author.id in interceptQueue) {
    var intercept = interceptQueue[message.author.id];
    var data = intercept;
    data['message'] = message;
    intercept['callback'](data);
    delete interceptQueue[message.author.id];
    return;
  }
  const prefix = await guildPrefix(message.guild.id);
  var args = message.content.split(' ');
  if (args[0]) {
    const userPrefix = args[0][0];
    if (userPrefix == prefix) {
      args[0] = args[0].slice(1);
      if (args[0] in allCommands) {
        allCommands[args[0]](message, args);
      }
    }
  }
}

module.exports.onUserVoice = (member) => {
  if (member.user.bot) return;
  for (const listener of userVoiceIntercept) {
    listener(member);
  }
}

function guildPrefix(guildid, callback) {
  return new Promise(async resolve => {
    var guild = await guildModel.getGuild(guildid);
    resolve(guild['prefix']);
  });
}
