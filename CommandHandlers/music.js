const ytdl = require('ytdl-core');
const data = require('../data.js');

var isReady;
var voiceConnection;
var dispatcher;
var queue;
var alreadyPlaying;
var currentVoiceChannel;
var songDetails;
var theme;
var waitTime;

module.exports.play = async (member, args, streamOptions, callback) => {
  if (args[1]) {
    if (!alreadyPlaying) {
      alreadyPlaying = true;
      data.getYtVideoInfo(args, function(info) {
        const songInfo = info;
        songDetails = info;
        if (currentVoiceChannel && currentVoiceChannel.name == member.voiceChannel) {
          playDispatcher(songInfo, streamOptions, callback);
        } else {
          currentVoiceChannel = member.voiceChannel;
          currentVoiceChannel.join().then(connection => {
            voiceConnection = connection;
            if (voiceConnection) {
              playDispatcher(songInfo, streamOptions, callback);
            } else {
              if (!voiceConnection) {
                return {
                  error: '0',
                  message: 'failed to join voice channel'
                }
              }
            }
          }).catch(err => {
            console.log(err);
          });
        }
      });
    } else {
      data.getYtVideoInfo(args, function(info) {
        const songInfo = info;
        songDetails = info;
        queue.push({
          'member': member,
          'args': args
        });
        callback({
          message: songInfo.title + ' has been added to the queue!'
        });
      });
    }
  } else if (!args[1]) {
    callback({
      error: '1',
      message: 'no argument supplied'
    });
  }
}

module.exports.playTheme = (member, args, streamOptions, streamTime) => {
  if (!alreadyPlaying) {
    alreadyPlaying = true;
    theme = true;
    waitTime = streamTime * 1000;
    data.getYtVideoInfo(args, function(info) {
      const songInfo = info;
      songDetails = info;
      if (currentVoiceChannel && currentVoiceChannel.name == member.voiceChannel) {
        playDispatcher(songInfo, streamOptions, false);
      } else {
        currentVoiceChannel = member.voiceChannel;
        currentVoiceChannel.join().then(connection => {
          voiceConnection = connection;
          if (voiceConnection) {
            playDispatcher(songInfo, streamOptions, false);
          } else {
            if (!voiceConnection) {
              return {
                error: '0',
                message: 'failed to join voice channel'
              }
            }
          }
        }).catch(err => {
          console.log(err);
        });
      }
    });
  }
}

module.exports.stop = (channel, callback) => {
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

module.exports.skip = (channel, callback) => {
  if (alreadyPlaying) {
    if (channel && channel.name == currentVoiceChannel.name) {
      dispatcher.end('temp');
      callback({
        message: 'Song has been skipped.'
      });
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
}

module.exports.volume = (args, channel, callback) => {
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
}

module.exports.init = () => {
  alreadyPlaying = false;
  queue = [];
  volume = 100;
  theme = false;
  currentVoiceChannel = null;
}

function playDispatcher(songInfo, streamOptions, callback) {
  alreadyPlaying = true;
  if (!streamOptions) {
    var streamOptions = {};
  }
  var stream = ytdl(songInfo.video_url, {
    filter: 'audioonly',
    highWaterMark: 1<<25
  });
  console.log('Playing Music');
  if (callback) {
    callback({
      message: 'Now Playing ' + songInfo.title
    });
  }
  dispatcher = voiceConnection.playStream(stream, streamOptions);
  dispatcher.on('start', () => {
    console.log('Dispatcher Started');
    if (theme) {
      checkThemeTimeEnded();
    }
  });
  dispatcher.on("end", end => {
    console.log('Dispatcher Ended');
    console.log(end);
    alreadyPlaying = false;
    if (end && end != 'seek' && end != 'volume') {
      if (queue.length > 0) {
        console.log('playing next song');
        next = queue.shift();
        module.exports.play(next.member, next.args, false, callback);
      }
    }
  });
}

function checkThemeTimeEnded() {
  setTimeout(() => {
    if (dispatcher.time >= waitTime) {
      dispatcher.end('temp');
      console.log('Theme Ended');
      theme = false;
    } else {
      checkThemeTimeEnded()
    }
  }, 1000);
}
