const User = require('./user');
const Guild = require('./guild');

module.exports.updateUsersGuild = async (userIds, guildId) => {
  const guild = await Guild.findOne({guildId});
  await User.updateMany({discordId: { $in: userIds }, guilds: { $ne: guild._id }}, {$addToSet: {guilds: guild._id}});
}
