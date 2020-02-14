const ytdl = require('ytdl-core');
const urlExists = require('url-exists');
const outside = require('../db/outside.js');
const model = require('../db/model.js');
var LRU = require('lru-cache');

var guilds = {};
var voiceMappings = new LRU(50);

const acceptedPlayArgs = ['myinstants', 'mi'];

module.exports.onMessage = async (message, args) => {
  var result = await argsValid(args);
  if (result['valid']) {
    const guildid = message.guild.id;
    if (args[0] == 'play') {
      if (!(guildid in guilds)) {
        guilds[guildid] = {queue: [], connection: false, dispatcher: false, playing: false, timeout: false, voiceChannel: false};
      }
      const channel = message.member.voice.channel;
      if (userNotWithBot(channel, guildid)) {
        message.channel.send('You have to be in the same channel as the bot to control it');
        return;
      }
      if (!channel) {
        message.channel.send('You are not in a voice channel.');
        return;
      }
      if (result['path'] == 0) {
        if (guilds[guildid]['playing']) {
          guilds[guildid]['queue'].push({link: args[2], type: 'mi'});
        }
        else {
          play(args[2], guildid, channel, message.channel, 'mi');
        }
      }
      else {
        var mapping = voiceMappings.get(guildid);
        if (!mapping) {
          var guildData = await model.findOne('serverdata', {guildid: guildid}, {voicemap: 1});
          if (guildData) {
            mapping = guildData['voicemap'];
            voiceMappings.set(guildid, mapping);
          }
        }
        if (mapping) {
          if (args[1] in mapping) {
            var link = 'https://www.myinstants.com/media/sounds/' + mapping[args[1]];
            if (guilds[guildid]['playing']) {
              guilds[guildid]['queue'].push({link: link, type: 'mi'});
            }
            else {
              play(link, guildid, channel, message.channel, 'mi');
            }
            return;
          }
        }
        else {
          voiceMappings.set(guildid, {});
        }
        var videoName = args[1];
        for (var i=2;i<args.length;i++) {
          videoName = videoName + ' ' + args[i];
        }
        if (guilds[guildid]['playing']) {
          guilds[guildid]['queue'].push({link: videoName, type: 'yt'});
          message.channel.send(videoName + ' added to queue');
        }
        else {
          play(videoName, guildid, channel, message.channel, 'yt');
        }
      }
      if (guildid in guilds) {
        const guild = guilds[guildid];
        if ('timeout' in guild) {
          clearTimeout(guild['timeout']);
          guild['timeout'] = false;
        }
      }
    }
    else if (args[0] == 'skip') {
      var skipped = false;
      if (guildid in guilds) {
        const guild = guilds[guildid];
        if (guild['playing']) {
          skipped = true;
          guild['dispatcher'].end('skip');
        }
      }
      if (!skipped) {
        message.channel.send('Nothing is playing');
      }
    }
    else if (args[0] == 'map') {
      if (args[1] && args[2]) {
        map(guildid, args[1], args[2], message.channel);
      }
      else {
        message.channel.send('Invalid arguments');
      }
    }
    else if (args[0] == 'unmap') {
      if (args[1]) {
        unmap(guildid, args[1], message.channel);
      }
      else {
        message.channel.send('Invalid arguments');
      }
    }
  }
  else {
    if ('message' in result) {
      message.channel.send(result['message']);
    }
    else {
      message.channel.send('Invalid command');
    }
  }
}

module.exports.playTheme = (theme, guildid, voiceChannel) => {
  if (!(guildid in guilds)) {
    guilds[guildid] = {queue: [], connection: false, dispatcher: false, playing: false, timeout: false, voiceChannel: false};
  }
  play(theme, guildid, voiceChannel, false, 'mi');
}

/*module.exports.stop = (channel, callback) => {
  if (alreadyPlaying) {
    if (channel && channel.name == currentVoiceChannel.name) {
      dispatcher.pause();
    } else {
      callback({
        error: '3',
        message: 'You have to be in the same channel as the bot to control it.'
      });
    }
  } else {
    callback({
      error: '7',
      message: 'The bot isn\'t playing anything.'
    });
  }
}

module.exports.resume = (channel, callback) => {
  if (alreadyPlaying) {
    if (channel && channel.name == currentVoiceChannel.name) {
      dispatcher.resume();
    } else {
      callback({
        error: '3',
        message: 'You have to be in the same channel as the bot to control it.'
      });
    }
  } else {
    callback({
      error: '7',
      message: 'The bot isn\'t playing anything.'
    });
  }
}

module.exports.seek = (args, channel, callback, theme) => {
  if (alreadyPlaying && args[1]) {
    if (channel && channel.name == currentVoiceChannel.name) {
      const regex = /\d?\d:\d?\d/;
      const result = args[1].match(regex);
      if (result && result.length == 1) {
        time = args[1].split(":");
        if (Number(time[0]) >= 0 && Number(time[1]) >= 0) {
          if (Number(time[0]) * 60 + Number(time[1]) < songDetails.length_seconds) {
            var streamOptions = {};
            streamOptions.seek = Number(time[0]) * 60 + Number(time[1]);
            dispatcher.end('seek');
            playDispatcher(songDetails, streamOptions, false);
          } else {
            callback({
              error: '5',
              message: 'Seek timestamp is greater than the video length.'
            });
          }
        } else {
          callback({
            error: '4',
            message: 'Seek timestamp is negative or zero. What the actual fuck?'
          });
        }
      } else {
        callback({
          error: '2',
          message: 'Something went wrong in the seek function, call a developer.'
        });
      }
    } else {
      callback({
        error: '3',
        message: 'You have to be in the same channel as the bot to control it.'
      });
    }
  } else if (!args[1]) {
    callback({
      error: '7',
      message: 'Argument Error.'
    });
  } else {
    callback({
      error: '7',
      message: 'The bot isn\'t playing anything.'
    });
  }
}*/

/*module.exports.volume = (args, channel, callback) => {
  if (alreadyPlaying) {
    if (channel && channel.name == currentVoiceChannel.name) {
      const regex = /\d+/;
      const result = args[1].match(regex);
      if (result && result.length == 1) {
        const volume = Number(args[1]);
        if (volume > 0 && volume <= 100) {
          const streamOptions = {
            seek: dispatcher.time / 1000,
            volume: volume / 100
          };
          dispatcher.end('volume');
          playDispatcher(songDetails, streamOptions, false);
          callback({
            message: 'Volume set to ' + result + '.'
          });
        } else {
          callback({
            error: '6',
            message: 'Volume isn\'t between 0 ~ 100.'
          });
        }
      } else {
        callback({
          error: '2',
          message: 'Something went wrong in the volume function, call a developer.'
        });
      }
    }
  } else {
    callback({
      error: '7',
      message: 'The bot isn\'t playing anything.'
    });
  }
}*/

//module.exports.commands = ['play', 'stop', 'skip', 'volume', 'seek', 'map'];
module.exports.commands = ['play', 'skip', 'map', 'unmap'];

function argsValid(args, callback) {
  return new Promise(async resolve => {
    if (args[0] == 'play') {
      if (args[1] && args[2]) {
        if (acceptedPlayArgs.includes(args[1])) {
          var result = await checkCorrectLink('https://www.myinstants.com/media/sounds/', milink);
          if (result) {
            resolve({valid: true, path: 0});
          }
          else {
            resolve({valid: false, message: 'Link is dead'});
          }
        }
        else {
          resolve({valid: true, path: 1});
        }
      }
      else if (args[1]) {
        resolve({valid: true, path: 1});
      }
      else {
        resolve({valid: false, message: 'Missing arguments'});
      }
    }
    else if (args[0] == 'skip') {
      resolve({valid: true});
    }
    else if (args[0] == 'map' && args[1] && args[2]) {
      var result = await checkCorrectLink('https://www.myinstants.com/media/sounds/', args[1]);
      if (result) {
        resolve({valid: true});
      }
      else {
        resolve({valid: false});
      }
    }
    else if (args[0] == 'unmap' && args[1]) {
      resolve({valid: true});
    }
    else {
      resolve({valid: false})
    }
  });
}

async function play(videoName, guildid, voiceChannel, textChannel, playType) {
  const guild = guilds[guildid];
  guild['voiceChannel'] = voiceChannel;
  var info = false;
  if (playType == 'yt') {
    info = await outside.getYtVideoInfo(videoName);
    if (!info) {
      textChannel.send('An error happened while trying to get video info');
      clearGuild(guildid);
      return;
    }
  }
  guild['playing'] = true;
  if (textChannel && info) {
    textChannel.send('Now Playing ' + info.title);
  }
  const conn = await getConnection(guild);
  var playable = false;
  if (playType == 'yt') {
    playable = ytdl(info.video_url, {
      filter: 'audioonly'
    });
  }
  else if (playType == 'mi') {
    playable = videoName;
  }
  if (playable) {
    var dispatcher = conn.play(playable);
    guild['dispatcher'] = dispatcher;
    dispatcher.on('end', reason => {
      onDispatcherEnd(guildid, textChannel);
    });
  }
  else {
    console.log('This is not a proper type to play');
  }
}

function onDispatcherEnd(guildid, textChannel) {
  const guild = guilds[guildid];
  guild['playing'] = false;
  var queue = guild['queue'];
  if (queue.length > 0) {
    var next = queue.shift();
    play(next['link'], guildid, guild['voiceChannel'], textChannel, next['type']);
  }
  if (queue.length == 0) {
    guild['timeout'] = setTimeout(() => {
      clearGuild(guildid);
    }, 1000 * 60 * 15);
  }
}

function clearGuild(guildid) {
  const guild = guilds[guildid];
  guild['voiceChannel'].leave();
  delete guilds[guildid];
}

async function getConnection(guild) {
  var conn = false;
  if (!guild['connection']) {
    conn = await guild['voiceChannel'].join();
    guild['connection'] = conn;
  }
  else {
    conn = guild['connection'];
  }
  return conn;
}

function userNotWithBot(userChannel, guildid) {
  if (guildid in guilds) {
    const guild = guilds[guildid];
    if (guild['voiceChannel']) {
      if (guild['voiceChannel']['id'] != userChannel['id']) {
        return true;
      }
    }
  }
  return false;
}

function linkExists(link) {
  return new Promise(resolve => {
    urlExists(link, (err, exists) => {
      if (err) {
        resolve(false);
        console.log(err);
      }
      else {
        resolve(exists);
      }
    });
  });
}

function checkCorrectLink(defLink, link) {
  return new Promise(async resolve => {
    if (link.startsWith(defLink)) {
      var exists = await linkExists(link);
      resolve(exists);
    }
    else {
      resolve(false);
    }
  });
}

async function map(guildid, milink, alias, channel) {
  var mapping = voiceMappings.get(guildid);
  if (!mapping) {
    var result = await model.findOne('serverdata', {guildid: guildid}, {voicemap: 1});
    if (result) {
      if ('voicemap' in result) {
        mapping = result['voicemap'];
      }
      else {
        mapping = {};
      }
    }
    else {
      var result = await model.insertOne('serverdata', {guildid: guildid});
      mapping = {};
    }
  }
  if (Object.keys(mapping).length < 10) {
    var result = await checkCorrectLink('https://www.myinstants.com/media/sounds/', milink);
    if (result) {
      mapping[alias] = milink.split('https://www.myinstants.com/media/sounds/')[1];
      voiceMappings.set(guildid, mapping);
      var result = await model.updateOne('serverdata', guildid, {voicemap: mapping});
      if (result) {
        channel.send('Alias set succesfully');
      }
      else {
        channel.send('An error happened while updating server data, consult a dev');
      }
    }
    else {
      channel.send('Link is dead');
    }
  }
  else {
    channel.send('Each guild can only have a maximum of 10 mappings');
  }
}

async function unmap(guildid, alias, channel) {
  var mapping = voiceMappings.get(guildid);
  if (!mapping) {
    var result = await model.findOne('serverdata', {guildid: guildid}, {voicemap: 1});
    if (result && 'voicemap' in result) {
      mapping = result['voicemap'];
    }
    else {
      channel.send('Your guild doesn\'t have any mappings');
      return;
    }
  }
  if (alias in mapping) {
    delete mapping[alias];
    voiceMappings.set(guildid, mapping);
    var result = await model.updateOne('serverdata', guildid, {voicemap: mapping});
    if (result) {
      channel.send('Alias deleted');
    }
    else {
      channel.send('An error happened while updating the database, consult a dev');
    }
  }
  else {
    channel.send('Alias doesn\'t exist');
  }
}
