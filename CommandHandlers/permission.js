const guildModel = require('../db/guild.js');
const perms = require('../util/permissions.js');

module.exports.commands = ['setguildlv'];

module.exports.onMessage = async (message, args) => {
  if (args[0] == 'setguildlv') {
    console.log(message.author.id in perms.USER_PERMS);
    if (message.author.id in perms.USER_PERMS && perms.USER_PERMS[message.author.id] == 'creator') {
      var guild = await guildModel.getGuild(args[1]);
      guild['lv'] = args[2];
      var result = await guildModel.updateGuild(guild);
      if (result) {
        message.channel.send('Guild level updated succesfully');
      }
      else {
        message.channel.send('Error while updating guild level');
      }
    }
    else {
      message.channel.send('Sorry, only developers can use this function');
    }
  }
}
