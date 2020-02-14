const outside = require('../db/outside.js');
const model = require('../db/model.js');
var guilds = {};
var channels = false;
const hrsBetweenPost = 4;
const MIN_UPVOTES = 10000;

module.exports.onMessage = (message, args) => {
  if (args[0] == 'setmeme' && args[1]) {
    if (args[1] == 'true') {
      setPostMemes(true, message.member.guild.id, message.channel);
    }
    else if (args[1] == 'false') {
      setPostMemes(false, message.member.guild.id, message.channel);
    }
    else {
      message.channel.send('Invalid command');
    }
  }
  else if (args[0] == 'setmemechannel' && args[1]) {
    setChannel(args[1], message.member.guild.id, message.channel);
  }
  else {
    message.channel.send('Invalid command');
  }
}

module.exports.init = async (data) => {
  channels = data['channels'];
  var documents = await model.find('serverdata', {shouldMeme: true}, {shouldMeme: 1, guildid: 1, memeChannel: 1});
  if (documents.length > 0) {
    for (const document of documents) {
      guilds[document['guildid']] = {shouldMeme: document['shouldMeme'], memeChannel: document['memeChannel']};
      if (document['memeChannel']) {
        sendMeme(document['guildid']);
      }
    }
  }
}

module.exports.commands = ['setmeme', 'setmemechannel'];

function getAGoodMeme() {
  return new Promise(resolve => {
    outside.getLatestMemes().then(memes => {
      if (memes && memes.length > 0) {
        const now = new Date();
        for (const meme of memes) {
          if (!meme['over_18'] && meme['ups'] >= MIN_UPVOTES && (now - new Date(meme['created_utc'] * 1000)) / (1000 * 60 * 60) <= hrsBetweenPost) {
            resolve(meme);
            return;
          }
        }
        resolve(false);
      }
      else {
        resolve(false);
      }
    });
  });
}

function setPostMemes(postMemes, guildid, channel) {
  getGuild(guildid).then(guild => {
    var gld = guild;
    var update = false;
    if (!gld) {
      update = true;
      gld = {shouldMeme: false, memeChannel: false};
    }
    if (postMemes != gld['shouldMeme']) {
      update = true;
      gld['shouldMeme'] = postMemes;
    }
    if (update) {
      updateGuild(gld, guildid).then(result => {
        if(result) {
          channel.send('Bot setting updated succesfully');
          if (gld['memeChannel']) {
            sendMeme(guildid)
          }
        }
        else {
          channel.send('An error happened while updating, consult a dev');
        }
      });
    }
    else {
      channel.send('Bot setting updated succesfully');
    }
  });
}

function setChannel(channelid, guildid, channel) {
  const newChannel = channels.get(channelid);
  if (newChannel && newChannel.type == 'text') {
    getGuild(guildid).then(guild => {
      var gld = guild;
      var update = false;
      if (!gld) {
        update = true;
        gld = {shouldMeme: false, memeChannel: false};
      }
      if (channelid != gld['memeChannel']) {
        update = true;
        gld['memeChannel'] = channelid;
      }
      if (update) {
        updateGuild(gld, guildid).then(result => {
          if(result) {
            channel.send('Bot setting updated succesfully');
            if (gld['shouldMeme']) {
              sendMeme(guildid)
            }
          }
          else {
            channel.send('An error happened while updating, consult a dev');
          }
        });
      }
      else {
        channel.send('Bot setting updated succesfully');
      }
    });
  }
  else {
    channel.send('Channel doesn\'t exist or is not a text channel');
  }
}

function getGuild(guildid) {
  return new Promise(async resolve => {
    if (guildid in guilds) {
      resolve(guilds[guildid]);
    }
    else {
      var result = await model.findOne('serverdata', {guildid: guildid}, {shouldMeme: 1, memeChannel: 1});
      if (result) {
        var cpy = result;
        if (!('shouldMeme' in cpy)) {
          cpy['shouldMeme'] = false;
        }
        if (!('memeChannel' in cpy)) {
          cpy['memeChannel'] = false;
        }
        resolve(result);
      }
      else {
        var result = await model.insertOne('serverdata', {guildid: guildid});
        if (!result) {
          console.log('An error happened in insertion');
        }
        resolve(false);
      }
    }
  });
}

async function updateGuild(data, guildid) {
  return new Promise(resolve => {
    guilds[guildid] = data;
    var result = model.updateOne('serverdata', guildid, data);
    if (result) {
      resolve(true);
    }
    else {
      resolve(false);
    }
  });
}

function sendMeme(guildid) {
  if ('timeout' in guilds[guildid]) {
    clearTimeout(guilds[guildid]['timeout']);
  }
  getGuild(guildid).then(guild => {
    const channel = channels.get(guild['memeChannel']);
    if (guild && guild['shouldMeme'] && guild['memeChannel'] && channel) {
      getAGoodMeme().then(meme => {
        if (meme) {
          channel.send(meme['title'] + '\n' + meme['url']);
        }
      });
      guild['timeout'] = setTimeout(() => {
        sendMeme(guildid);
      }, hrsBetweenPost * 60 * 60 * 1000);
    }
  });
}
