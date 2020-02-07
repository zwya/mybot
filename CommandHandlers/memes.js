var meme = require('../memes.json');
const data = require('../data.js');
const util = require('../util/util.js');

var memes = {};
var channel = false;

module.exports.init = (client) => {
  memes['data'] = {};
  if ('data' in meme) {
    for (const [key, value] of Object.entries(meme.data)) {
      memes['data'][key] = value;
    }
  }

  if ('channel' in meme) {
    memes['channel'] = meme['channel'];
    channel = client.channels.get(meme['channel']);
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
  const keys = Object.keys(memes.data);
  for (var i=0;i<keys.length;i++) {
    const dt = new Date(memes['data'][keys[i]]['created_utc'] * 1000);
    if (new Date() - dt / 1000 / 60 / 60 >= 72) {
      delete memes[keys[i]];
    }
  }
  var condition = false;
  if ('lastpost' in memes) {
    const lastPostDate = new Date(memes['lastpost']);
    condition = (channel && (new Date() - lastPostDate) / 1000 / 60 / 60 > 6);
  }
  else {
    condition = (channel);
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
  util.savejson('memes.json', memes);
  if (countNotPosted() < 10) {
    setTimeout(() => {
      getMemes(postMemeFetch);
    }, 1000 * 60 * 60 * 6);
  }
  else {
    setTimeout(postMemeFetch, 1000 * 60 * 60 * 6);
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
