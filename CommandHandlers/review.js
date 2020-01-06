const data = require('../data.js');
const validCategories = ['game', 'anime', 'series', 'movie'];
const Discord = require('discord.js');
var client = false;

module.exports.handleMessage = (message, args, callback) =>  {
  if(args[1] && args[1] == 'find') {
    if (args[2]) {
      var name = args[2];
      for (var i=3;i<args.length;i++) {
        name = name + ' ' + args[i];
      }
      data.findReview({namelower: name.toLowerCase()}, true, response => {
        if (response.length > 0) {
          var embeds = [];
          for (var i=0;i<response.length;i++) {
            const embed = new Discord.RichEmbed()
              .setColor('#0099ff')
              .setTitle(response[i]['membername'])
              .addField('Name', response[i]['name'], true)
              .addField('Category', response[i]['category'], true)
              .addField('Review', response[i]['text']);
              embeds.push(embed);
          }
          callback({'embeds': embeds});
        }
        else {
          callback({error: 'No results found'});
        }
      });
    }
    else {
      callback({message: 'You haven\'t typed a name'});
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
        for (var i=3;i<args.length;i++) {
          name = name + ' ' + args[i];
        }
        data.findReview({userid: message.member.id, category: category, namelower: name.toLowerCase()}, false, response => {
          if(response) {
            callback({message: 'You have reviewed this game before.'});
          }
          else {
            if(validCategories.includes(category)) {
              callback({call: module.exports.saveReview, message: 'The next message you write will be automatically saved as the review', data:{category:category, name: name, callback: callback}});
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
  const now = new Date(Date.now()).toLocaleString();
  data.createReview({
    userid: reviewData.message.member.id,
    membername: reviewData.message.member.displayName,
    text: reviewData.message.content,
    category: reviewData.category,
    name: reviewData.name,
    namelower: reviewData.name.toLowerCase(),
    date: now
  });
  reviewData.callback({message: 'Your review has been saved'});
}
