const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const generateSecureId = require('../util/util').generateSecureId;

const guildSchema = new Schema({
  prefix: {
    type: String
  },
  guildId: {
    type: String,
    required: true
  },
  voicemap: {
    type: Map,
    of: String
  },
  shouldMeme: {
    type: Boolean,
    default: false
  },
  memeChannel: {
    type: String
  },
  name: {
    type: String
  },
  icon: {
    type: String
  },
  publicId: {
    type: Number
  }
});

guildSchema.static('findOneOrCreateDefault', async function(discordGuild) {
  let guild = await mongoose.model('Guild').findOne({guildId: discordGuild.id});
  if (guild) {
    return guild;
  }
  if (!discordGuild.id) {
    return null;
  }
  let publicId = generateSecureId();
  guild = await mongoose.model('Guild').findOne({
    publicId
  });
  while (guild) {
    publicId = generateSecureId();
    guild = await mongoose.model('Guild').findOne({
      publicId
    });
  }
  guild = new this({
    prefix: '!',
    guildId: discordGuild.id,
    shouldMeme: false,
    name: discordGuild.name,
    icon: (discordGuild.icon)? discordGuild.iconURL({
      size: 256,
      dynamic: true,
      format: 'jpg'
    }) : null,
    publicId
  });
  await guild.save();
  return guild;
});

module.exports = mongoose.model('Guild', guildSchema);
