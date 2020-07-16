const outside = require('../db/outside.js');
const Guild = require('../db/guild.js');
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
  const documents = await Guild.find({shouldMeme: true});
  if (documents.length > 0) {
    for (const document of documents) {
      trySendMeme(document.guildId);
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

async function setPostMemes(postMemes, guildId, channel) {
  var guild = await Guild.findOne({guildId});
  guild.shouldMeme = postMemes;
  await guild.save();
  channel.send('Bot setting updated succesfully');
  trySendMeme(guildId);
}

async function setChannel(channelid, guildId, channel) {
  const newChannel = await channels.fetch(channelid);
  if (newChannel && newChannel.type == 'text') {
    var guild = await Guild.findOne({guildId});
    guild.memeChannel = channelid;
    await guild.save();
    channel.send('Bot setting updated succesfully');
    trySendMeme(guildId);
  }
  else {
    channel.send('Channel doesn\'t exist or is not a text channel');
  }
}

async function trySendMeme(guildId) {
  var guild = await Guild.findOne({guildId});
  const channel = await channels.fetch(guild.memeChannel);
  if (guild && guild.shouldMeme && guild.memeChannel && channel) {
    getAGoodMeme().then(meme => {
      if (meme) {
        channel.send(meme['title'] + '\n' + meme['url']);
      }
    });
    guilds[guildId] = setTimeout(() => {
      sendMeme(guildId);
    }, hrsBetweenPost * 60 * 60 * 1000);
  }
  else {
    clearGuild(guildId);
  }
}

function clearGuild(guildid) {
  if (guildid in guilds) {
    clearTimeout(guilds[guildid]);
    guilds[guildid] = false;
  }
}
