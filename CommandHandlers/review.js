const data = require('../data.js');
const validCategories = ['game', 'anime', 'series', 'movie'];
const Discord = require('discord.js');
var client = false;
var embeds = false;
var currentMessage = false;
var filter = false;
var index = 0;

module.exports.handleMessage = (message, args, callback) =>  {
  if(args[1] && args[1] == 'find') {
    if (args[2]) {
      var name = args[2];
      for (var i=3;i<args.length;i++) {
        name = name + ' ' + args[i];
      }
      data.findReview({namelower: name.toLowerCase()}, true, response => {
        if (response.length > 0) {
          callback({'embeds': createEmbeds(response)});
        }
        else {
          const keywords = constructKeywords(args);
          var promises = [];
          for (var i=0;i<keywords.length;i++) {
            promises.push(findReview({keywords: {$in: [keywords[i]]}}, true));
          }
          Promise.all(promises).then(values => {
            if (values.length > 0) {
              embeds = createEmbeds(response);
              if (currentMessage) {
                currentMessage.clearReactions();
              }
              index = 0;
              message.channel.send(embeds[0]).then(msg => {
                currentMessage = msg;
                currentMessage.react('◀️').then(msg1 => {
                  currentMessage.react('▶️').then(msg2 => {
                    currentMessage.awaitReactions(filter, {max: 1, time:20000}).then(collected => {
                      onReact(collected);
                    });
                  });
                });
              });
            }
            else {
              callback({error: 'No results found'});
            }
          });
        }
      });
    }
    else {
      data.findReview({}, true, response => {
        if (response.length > 0) {
          embeds = createEmbeds(response);
          if (currentMessage) {
            currentMessage.clearReactions();
          }
          index = 0;
          message.channel.send(embeds[0]).then(msg => {
            currentMessage = msg;
            currentMessage.react('◀️').then(msg1 => {
              currentMessage.react('▶️').then(msg2 => {
                currentMessage.awaitReactions(filter, {max: 1, time:20000}).then(collected => {
                  onReact(collected);
                });
              });
            });
          });
        }
        else {
          callback({error: 'No results found'});
        }
      });
    }
  }
  else if (args[1] && args[1] == 'remove') {
    var name = args[2];
    for (var i=3;i<args.length;i++) {
      name = name + ' ' + args[i];
    }
    data.findReview({namelower: name.toLowerCase(), userid: message.member.id}, false, response => {
      if (response) {
        data.deleteReview(response['_id']);
        callback({message: 'Review deleted'});
      }
      else {
        callback({message: 'Couldn\'t find review'});
      }
    });
  }
  else if (args[1]) {
    const category = args[1].toLowerCase();
    if (validCategories.includes(category)) {
      if (args[2]) {
        var name = args[2];
        const keywords = constructKeywords(args);
        data.findReview({userid: message.member.id, category: category, namelower: name.toLowerCase()}, false, response => {
          if(response) {
            callback({message: 'You have reviewed this game before.'});
          }
          else {
            if(validCategories.includes(category)) {
              callback({call: module.exports.saveReview, message: 'The next message you write will be automatically saved as the review', data:{category:category, name: name, callback: callback, keywords: keywords}});
            }
          }
        });
      }
      else {
        callback({message: 'You haven\'t typed a name'});
      }
    }
    else {
      callback({error: 'Review isn\'t valid'});
    }
  }
  else {
    callback({message: 'No argument'});
  }
}

module.exports.saveReview = (reviewData) => {
  const parts = reviewData.message.content.split('\n');
  if (parts.length >= 2 && parts.length % 2 == 0 && parts.length <= 12) {
    var properFormat = true;
    for (var i=0;i<parts.length;i++) {
      if(i % 2 == 0) {
        if (parts[i].length > 100) {
          properFormat = false;
          reviewData.callback({error: 'Titles must not exceed 100 characters'});
          break;
        }
      }
      else {
        if (parts[i].length > 800) {
          properFormat = false;
          reviewData.callback({error: 'Text must not exceed 800 characters'});
          break;
        }
      }
    }
    if (properFormat) {
      const now = new Date(Date.now()).toLocaleString();
      data.createReview({
        userid: reviewData.message.member.id,
        membername: reviewData.message.member.displayName,
        text: reviewData.message.content,
        category: reviewData.category,
        name: reviewData.name,
        namelower: reviewData.name.toLowerCase(),
        date: now,
        keywords: reviewData.keywords
      });
      reviewData.callback({message: 'Your review has been saved'});
    }
  }
  else {
    reviewData.callback({error: 'Improper review format'});
  }
}

function createEmbeds(response) {
  var embeds = [];
  for (var i=0;i<response.length;i++) {
    var embed = new Discord.RichEmbed()
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

module.exports.init = (clientID) => {
  filter = (reaction, user) => (reaction.emoji.name === '◀️' || reaction.emoji.name === '▶️') && clientID != user.id;
}

function constructKeywords(args) {
  keywords = [];
  if(args[2].length > 2) {
    keywords = [args[2].toLowerCase()];
  }
  for (var i=3;i<keywords.length;i++) {
    if (args[i].length > 2) {
      keywords.push(args[i].toLowerCase());
    }
  }
  return keywords;
}

function findReview(query, array) {
  return new Promise(function(resolve, reject){
    data.findReview(query, array, response => {
      if(response && response.length != 0) {
        resolve(response[0]);
      }
      else {
        resolve(null);
      }
    });
  });
}

function onReact(collected) {
  const reaction = collected.first();
  const oldIndex = index;
  if (reaction) {
    if (reaction.emoji.name === '◀️') {
      if (index > 0) {
        index = index - 1;
      }
    } else {
      if (index < embeds.length - 1) {
        index = index + 1;
      }
    }
    if (index != oldIndex) {
      currentMessage.edit(embeds[index]).then(m1 => {
        currentMessage.clearReactions().then(m2 => {
          currentMessage.react('◀️').then(m3 => {
            currentMessage.react('▶️').then(m4 => {
              currentMessage.awaitReactions(filter, {max: 1, time:20000}).then(collected => {
                onReact(collected);
              });
            });
          });
        });
      });
    }
    else {
      currentMessage.awaitReactions(filter, {max: 1, time:20000}).then(collected => {
        onReact(collected);
      });
    }
  }
  else {
    currentMessage.awaitReactions(filter, {max: 1, time:20000}).then(collected => {
      onReact(collected);
    });
  }
}
