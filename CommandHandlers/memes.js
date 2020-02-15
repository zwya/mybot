const outside = require('../db/outside.js');
const model = require('../db/model.js');
const guildModel = require('../db/guild.js');
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

async function setPostMemes(postMemes, guildid, channel) {
  var guild = await guildModel.getGuild(guildid);
  guild['shouldMeme'] = postMemes;
  var result = await guildModel.updateGuild(guild);
  if(result) {
    channel.send('Bot setting updated succesfully');
    if (guild['memeChannel']) {
      sendMeme(guildid);
    }
  }
  else {
    channel.send('An error happened while updating, consult a dev');
  }
}

async function setChannel(channelid, guildid, channel) {
  const newChannel = await channels.fetch(channelid);
  if (newChannel && newChannel.type == 'text') {
    var guild = await guildModel.getGuild(guildid);
    guild['memeChannel'] = channelid;
    var result = await guildModel.updateGuild(guild);
    if(result) {
      channel.send('Bot setting updated succesfully');
      if (guild['shouldMeme']) {
        sendMeme(guildid);
      }
    }
    else {
      channel.send('An error happened while updating, consult a dev');
    }
  }
  else {
    channel.send('Channel doesn\'t exist or is not a text channel');
  }
}

async function sendMeme(guildid) {
  if ('timeout' in guilds[guildid]) {
    clearTimeout(guilds[guildid]['timeout']);
  }
  var guild = await guildModel.getGuild(guildid);
  const channel = await channels.fetch(guild['memeChannel']);
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
}
