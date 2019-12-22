const util = require('../util/util.js');

module.exports.prefix = false;

module.exports.help = (args, channel) => {
  if (args.length == 1) {
    channel.send(prefix('A completely unreliable bot:\nCommands Available: !play - !stop - !skip - !resume - !seek - !volume - !theme - !untheme'));
  }
  else if (args.length == 2 && validCommand(args[1].toLowerCase())) {
    const cmd = args[1].toLowerCase();
    if(cmd == 'play') {
      channel.send(prefix('Plays a video from youtube as audio. Selects the first relevant video as specified by the argument\nFormat: !play [video title]'));
    }
    else if(cmd == 'stop') {
      channel.send('Pauses the track currently being played but does not skip it.');
    }
    else if(cmd == 'skip') {
      channel.send('Skips the current track and plays the next one in the queue.');
    }
    else if(cmd == 'resume') {
      channel.send('Resumes the paused track by the command !stop.');
    }
    else if(cmd == 'seek'){
      channel.send(prefix('Seeks to a specifc time in the track\nFormat: !seek [mm:ss] mm=minutes, ss=seconds'));
    }
    else if(cmd == 'volume') {
      channel.send(prefix('Sets the volume of the track being played to match the specified argument (Must be between 1~100)\nFormat: !volume [volume]'));
    }
    else if(cmd == 'theme') {
      channel.send(prefix('Sets a theme to yourself (A theme is an audio that plays when you enter a voice channel with a cooldown of 30 minutes)\nIn order to set a theme, you have to call the command !theme twice. Supply the video name argument in the first time and the start/end timestamps in the second time that the command is called.\nFormat:\n!theme [youtube video name]\n!theme [mm:ss] [mm:ss]  mm=minutes, ss=seconds'));
    }
    else if(cmd == 'untheme') {
      channel.send('Removes your theme.');
    }
    else if(cmd == 'prefix') {
      channel.send('Sets the prefix of the bot\'s commands to the supplied argument prefix ( Only the following prefixes are allowed [!, $, &, %] ). ');
    }
  }
  else {
    channel.send('Something is wrong the format');
  }
}

function validCommand(cmd) {
  const validCommands = ['play', 'stop', 'skip', 'seek', 'volume', 'theme', 'untheme', 'clean', 'resume'];
  if (validCommands.includes(cmd)) {
    return true;
  }
  return false;
}

function prefix(str){
  return util.prefixify(str, module.exports.prefix);
}
