const guildModel = require('../db/guild.js');

var botid = false;

module.exports.onMessage = async (message , args) => {
  if (args[0] == 'clean') {
    const guild = await guildModel.getGuild(message.member.guild.id);
    message.channel.messages.fetch({limit: 100}).then(messages => {
      const regex = new RegExp('\\' + guild['prefix'] + '(play|theme|untheme|skip|clean|help|review|map|unmap|setmeme|setmemechannel)', 'g');
      messagesArray = messages.array();
      message.channel.bulkDelete(messages.filter(message => {
        const result = message.content.match(regex);
        return result && result.length > 0 || message.author.id == botid;
      }));
    });
  }
}

module.exports.init = (data) => {
  botid = data['botid'];
}

module.exports.commands = ['clean'];
