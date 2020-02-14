var botid = false;

module.exports.onMessage = (message , args) => {
  if (args[0] == 'clean') {
    const prefix = module.exports.prefixCache.get(message.member.guild.id);
    message.channel.messages.fetch({limit: 100}).then(messages => {
      const regex = new RegExp('\\' + prefix + '(play|theme|untheme|skip|clean|help|review|map|unmap|setmeme|setmemechannel)', 'g');
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
module.exports.prefixCache = false;
