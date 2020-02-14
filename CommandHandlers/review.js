const model = require('../db/model.js');
const validCategories = ['game', 'anime', 'series', 'movie'];
const MessageEmbed = require('discord.js').MessageEmbed;
var filter = false;
var guilds = {};
const MODE = {
  NEW: 0,
  CHANGE: 1,
  RESET: 2
}
const FETCH_COUNT = 10;

module.exports.onMessage = async (message, args) => {
  var query = {};
  const guildid = message.guild.id;
  if (args.length >= 2) {
    if (args[1] && args[1] == 'find') {
      if (args.length >= 3) {
        const name = constructName(args);
        const keywords = constructKeywords(args);
        query = {$or: [{namelower: name.toLowerCase()}, {keywords: {$in: keywords}}]};
      }
      var documents = await model.paginate('review', query, {name: 'date'}, false, FETCH_COUNT);
      if (documents) {
        const embeds = createEmbeds(documents);
        cleanOld(guildid);
        if (!(guildid in guilds)) {
          guilds[guildid] = {message: false, index: 0, query: query, embeds: embeds, timeout: false, previousDate: documents[0]['date'], nextDate: documents[documents.length-1]['date']};
        }
        createNewMessage(message.channel, guildid, embeds[0]);
      }
      else {
        message.channel.send('No results found');
      }
    }
    else if (args[1] && validCategories.includes(args[1])) {
      if (args.length > 2) {
        const name = constructName(args);
        var result = await model.findOne('review', {userid: message.author.id, namelower: name.toLowerCase()}, {});
        if (result) {
          message.channel.send('You\'ve already reviewed this game');
          return;
        }
        const keywords = constructKeywords(args);
        module.exports.intercept[message.author.id] = {name: name, keywords: keywords, callback: module.exports.saveReview, category: args[1]};
        message.channel.send('Your next message will be saved as your review');
      }
      else {
        message.channel.send('Name not supplied');
      }
    }
    else if (args[1] && args[1] == 'remove') {
      const name = constructName(args);
      var result = await model.findOne('review', {userid: message.author.id, namelower: name.toLowerCase()});
      if (result) {
        var result = await model.deleteOne('review', result['_id']);
        if (result) {
          message.channel.send('Your review has been deleted');
          return;
        }
        message.channel.send('Some error happened while deleting your review from the database, consult with a dev');
      }
      else {
        message.channel.send('I can\'t find this review');
      }
    }
  }
  else {
    message.channel.send('No Argument');
  }
}

module.exports.commands = ['review'];
module.exports.intercept = false;

module.exports.saveReview = async (data) => {
  const parts = data.message.content.split('\n');
  if (parts.length >= 2 && parts.length % 2 == 0 && parts.length <= 12) {
    var properFormat = true;
    for (var i=0;i<parts.length;i++) {
      if(i % 2 == 0) {
        if (parts[i].length > 100) {
          properFormat = false;
          data.message.channel.send('Titles must not exceed 100 characters');
          break;
        }
      }
      else {
        if (parts[i].length > 800) {
          properFormat = false;
          data.message.channel.send('Text must not exceed 800 characters');
          break;
        }
      }
    }
    if (properFormat) {
      const now = new Date();
      var result = await model.insertOne('review', {
        userid: data.message.member.id,
        membername: data.message.member.displayName,
        text: data.message.content,
        category: data.category,
        name: data.name,
        namelower: data.name.toLowerCase(),
        date: now,
        keywords: data.keywords
      });
      if (result) {
        data.message.channel.send('Your review has been saved');
      }
      else {
        data.message.channel.send('Some error happened while saving your review in the database, consult with a dev');
      }
    }
  }
  else {
    data.message.channel.send('Improper review format');
  }
}

function createEmbeds(response) {
  var embeds = [];
  for (var i=0;i<response.length;i++) {
    var embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(response[i]['membername'])
      .addField('Name', response[i]['name'], true)
      .addField('Category', response[i]['category'], true)

    const parts = response[i]['text'].split('\n');
    var title = false;
    for (var x=0;x<parts.length;x++) {
      if (x % 2 == 0) {
        title = parts[x];
      }
      else {
        embed.addField(title, parts[x]);
      }
    }
    embeds.push(embed);
  }
  return embeds;
}

module.exports.init = (data) => {
  filter = (reaction, user) => (reaction.emoji.name === '◀️' || reaction.emoji.name === '▶️') && data['botid'] != user.id;
}

function constructKeywords(args) {
  keywords = [args[2].toLowerCase()];
  for (var i=3;i<args.length;i++) {
    keywords.push(args[i].toLowerCase());
  }
  return keywords;
}

async function onReact(collected, guildid) {
  const reaction = collected.first();
  if (reaction) {
    clearTimeout(guilds[guildid]['timeout']);
    guilds[guildid]['timeout'] = setTimeout(() => {
      cleanOld(guildid);
    }, 1000 * 60 * 5);
    var embed = false;
    if (reaction.emoji.name === '◀️') {
      embed = await getPreviousEmbed(guildid);
    }
    else {
      embed = await getNextEmbed(guildid);
    }
    if (embed) {
      guilds[guildid]['message'].edit(embed).then(m => {
        setupReactions(guildid, MODE.CHANGE);
      });
      return;
    }
    setupReactions(guildid, MODE.RESET);
    return;
  }
  setupReactions(guildid, MODE.RESET);
}

function getPreviousEmbed(guildid) {
  return new Promise(async resolve => {
    const guild = guilds[guildid];
    var index = guild['index']
    if (index > 0) {
      index = index - 1;
      guild['index'] = index;
      resolve(guild['embeds'][index]);
      return;
    }
    var documents = await model.paginate('review', guild['query'], {name: 'date', after: guild['previousDate']}, true, FETCH_COUNT);
    if (documents) {
      const reversedDocs = documents.reverse();
      const embeds = createEmbeds(reversedDocs);
      guild['embeds'] = embeds;
      guild['index'] = embeds.length - 1;
      guild['previousDate'] = reversedDocs[0]['date'];
      guild['nextDate'] = reversedDocs[reversedDocs.length-1]['date'];
      resolve(embeds[guild['index']]);
    }
    else {
      resolve(false);
    }
  });
}

async function getNextEmbed(guildid) {
  return new Promise(async resolve => {
    const guild = guilds[guildid];
    var index = guild['index'];
    if (index < guild['embeds'].length - 1) {
      index = index + 1;
      guild['index'] = index;
      resolve(guild['embeds'][index]);
      return;
    }
    var documents = await model.paginate('review', guild['query'], {name: 'date', before: guild['nextDate']}, false, FETCH_COUNT);
    if (documents) {
      const embeds = createEmbeds(documents);
      guild['embeds'] = embeds;
      guild['index'] = 0;
      guild['previousDate'] = documents[0]['date'];
      guild['nextDate'] = documents[documents.length-1]['date'];
      resolve(embeds[0]);
    }
    else {
      resolve(false);
    }
  });
}


function createNewMessage(channel, guildid, embed) {
  channel.send(embed).then(msg => {
    guilds[guildid]['message'] = msg;
    setupReactions(guildid, MODE.NEW);
  });
  guilds[guildid]['timeout'] = setTimeout(() => {
    cleanOld(guildid);
  }, 1000 * 60 * 5);
}

function setupReactions(guildid, mode) {
  const message = guilds[guildid]['message'];
  if (mode == MODE.NEW) {
    message.react('◀️').then(msg1 => {
      message.react('▶️').then(msg2 => {
        message.awaitReactions(filter, {max: 1, time:20000}).then(collected => {
          onReact(collected, guildid);
        });
      });
    });
  }
  else if (mode == MODE.CHANGE) {
    message.reactions.removeAll().then(m2 => {
      message.react('◀️').then(m3 => {
        message.react('▶️').then(m4 => {
          message.awaitReactions(filter, {max: 1, time:20000}).then(collected => {
            onReact(collected, guildid);
          });
        });
      });
    });
  }
  else if (mode == MODE.RESET){
    message.awaitReactions(filter, {max: 1, time:20000}).then(collected => {
      onReact(collected, guildid);
    });
  }
}

function cleanOld(guildid) {
  if (guildid in guilds) {
    delete guilds[guildid];
  }
}

function constructName(args) {
  var name = args[2];
  for (var i=3;i<args.length;i++) {
    name = name + ' ' + args[i];
  }
  return name;
}
