const data = require('../data.js')

var isReady;
var isChannelJoined;
var voiceConnection;
var dispatcher;
const audioRootPath = './Audio/';
const extension = '.mp3';

module.exports.playMusic = async (client, message, args) => {
  isChannelJoined = await joinVoiceChannel(message);

  if (isChannelJoined && voiceConnection && isReady && args[1]) {
    console.log('Played Music');
    isReady = false;
    if (args[2] && Number(args[2])) {
      if (args[2] > 100) {
        args[2] = 100;
      }
      dispatcher = voiceConnection.playFile(audioRootPath + args[1] + extension, {
        "passes": 3,
        "volume": args[2] / 100
      });
    } else {
      dispatcher = voiceConnection.playFile(audioRootPath + args[1] + extension, {
        "passes": 3
      });
    }
    dispatcher.on('start', () => {
      voiceConnection.player.streamingData.pausedTime = 0;
    });
    dispatcher.on("end", end => {
      isReady = true;
    });
    dispatcher.on('error', err => {
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
      console.log('Joined Voice Channel');
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  return true;
}

function binaryIndexOf(arr, searchElement) {

  var minIndex = 0;
  var maxIndex = arr.length - 1;
  var currentIndex;
  var currentElement;

  while (minIndex <= maxIndex) {
    currentIndex = (minIndex + maxIndex) / 2 | 0;
    currentElement = arr[currentIndex];

    if (currentElement < searchElement) {
      minIndex = currentIndex + 1;
    } else if (currentElement > searchElement) {
      maxIndex = currentIndex - 1;
    } else {
      return currentIndex;
    }
  }

  return -1;
}

module.exports.hasFile = (filename) => {
  return binaryIndexOf(data.allFiles, filename) != -1;
}

module.exports.init = () => {
  isChannelJoined = false;
  isReady = true;
}
