var meme = require('../memes.json');
const data = require('../data.js');
const util = require('../util/util.js');

var memes = {};
var channel = false;
const hrsBetweenPost = 4;

module.exports.init = (client) => {
  memes['data'] = {};
  if ('data' in meme) {
    for (const [key, value] of Object.entries(meme.data)) {
      memes['data'][key] = value;
    }
  }

  if ('channel' in meme) {
    channel = client.channels.get(meme['channel']);
    if (channel) {
      memes['channel'] = meme['channel'];
    }
  }
  else if ('defaultChannel' in meme) {
    channel = client.channels.get(meme['defaultChannel']);
    if (channel) {
      memes['channel'] = meme['defaultChannel'];
    }
  }

  if ('lastpost' in meme) {
    memes['lastpost'] = meme['lastpost'];
  }

  if (countNotPosted() < 10) {
    getMemes(postMemeFetch);
  }
  else {
    postMemeFetch();
  }
}

module.exports.setChannel = (client, channelid) => {
  const newChannel = client.channels.get(channelid);
  if (newChannel && newChannel.type == 'text') {
    memes['channel'] = channelid;
    channel = newChannel;
    postMemeFetch();
  }
}

function getMemes(callback) {
  data.getLatestMemes(response => {
    if(response.length > 0) {
      response.forEach((item, i) => {
        if (!(item.id in memes['data']) && item.ups >= 10000 && !item.over_18) {
          memes['data'][item.id] = item;
          memes['data'][item.id]['posted'] = false;
        }
      });
    }
    callback();
  });
}

function postMemeFetch() {
  deleteOldMemes();
  sendMeme();
  util.savejson('memes.json', memes);
  if ('lastpost' in memes) {
    var lastPostDate = new Date(memes['lastpost']);
    if ('channel' in memes) {
      var timeout = false;
      if (!lastPostDate) {
        timeout = 0;
      }
      else {
        timeout = (hrsBetweenPost * 60 * 60 * 1000) - (new Date() - lastPostDate);
        if (timeout < 0) {
          timeout = 0;
        }
      }
      if (countNotPosted() < 10) {
        setTimeout(() => {
          getMemes(postMemeFetch);
        }, timeout);
      }
      else {
        setTimeout(postMemeFetch, timeout);
      }
    }
  }
}

function countNotPosted() {
  var count = 0;
  for (const [key, value] of Object.entries(memes.data)) {
    if (!value['posted']) {
      count = count + 1;
    }
  }
  return count;
}

function deleteOldMemes() {
  const keys = Object.keys(memes.data);
  for (var i=0;i<keys.length;i++) {
    const dt = new Date(memes['data'][keys[i]]['created_utc'] * 1000);
    if (((new Date() - dt) / 1000 / 60 / 60) >= 72) {
      delete memes.data[keys[i]];
    }
  }
}

function sendMeme() {
  const keys = Object.keys(memes.data);
  var condition = false;
  if ('lastpost' in memes) {
    const lastPostDate = new Date(memes['lastpost']);
    condition = ('channel' in memes && (new Date() - lastPostDate) / 1000 / 60 / 60 > hrsBetweenPost);
  }
  else {
    condition = ('channel' in memes);
  }
  if (condition) {
    var key = false;
    for (var i=0;i<keys.length;i++) {
      if (!memes['data'][keys[i]]['posted']) {
        key = keys[i];
        break;
      }
    }
    if (key) {
      channel.send(memes['data'][keys[i]]['title'] + '\n' + memes['data'][keys[i]]['url']);
      memes['data'][keys[i]]['posted'] = true;
      memes['lastpost'] = new Date();
    }
  }
}
