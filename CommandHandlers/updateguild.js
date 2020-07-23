const updateUsersGuild = require('../db/utility').updateUsersGuild;

module.exports.onMessage = (message, args) => {
  const users = message.guild.members.cache.map(user => user.id);
  updateUsersGuild(users, message.guild.id);
}

module.exports.commands = ['updateguild'];
