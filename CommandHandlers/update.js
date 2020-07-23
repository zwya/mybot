const updateUsersGuild = require('../db/utility').updateUsersGuild;
const User = require('../db/user');

module.exports.onMessage = async (message, args) => {
  let users = message.guild.members.cache.map(member => member.id);
  updateUsersGuild(users, message.guild.id);
  users = message.guild.members.cache.map(member => {
    return {
      id: member.id,
      tag: member.user.tag
    }
  });
  for (const user of users) {
    await User.findOneAndUpdate({
      discordId: user.id
    }, {
      $set: {
        tag: user.tag
      }
    }, {
      useFindAndModify: false
    });
  }
}

module.exports.commands = ['updateguild'];
