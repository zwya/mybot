var isReady = true;
var isChannelJoined = false;
var voiceConnection;
var dispatcher;

module.exports.playMusic = async (client, message, args) => {
  isChannelJoined = await joinVoiceChannel(message);

  if (isChannelJoined && voiceConnection && args[1]) {
    var audioRootPath = './Audio/';
    var extension = '.mp3';

    isReady = false;
    if (args[2] && Number(args[2])) {
      dispatcher = voiceConnection.playFile(audioRootPath + args[1] + extension, {
        "passes": 2,
        "volume": args[2] / 100
      });
    } else {
      dispatcher = voiceConnection.playFile(audioRootPath + args[1] + extension, {
        "passes": 2
      });
    }
    dispatcher.on('start', () => {
      voiceConnection.player.streamingData.pausedTime = 0;
    });
    dispatcher.on("end", end => {
      isReady = true;
    });
    dispatcher.on('error', err => {
      console.log('Went into dispatcher err');
      console.log(err);
      isReady = true;
    });
    module.exports.dispatcher = dispatcher;
  }

}

async function joinVoiceChannel(message) {
  if (!isChannelJoined) {
    try {
      voiceConnection = await message.member.voiceChannel.join();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  return true;
}
