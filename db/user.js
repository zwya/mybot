const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const generateSecureId = require('../util/util').generateSecureId;

const userSchema = new Schema({
  discordId: { type: String, required: true, unique: true },
  theme: { type: [String] },
  themeLastPlayDate: { type: Date },
  themeLastPlayIndex: { type: Number },
  tracked: { type: Boolean, default: false },
  discordAvatarUrl: { type: String },
  publicId: { type: Number },
  guilds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guild'}] }
});

userSchema.static('findOneOrCreateDefault', async function(query) {
  let user = await mongoose.model('User').findOne(query);
  if (user) {
    return user;
  }
  if (!query.discordId) {
    return null;
  }
  let publicId = generateSecureId();
  user = await mongoose.model('User').findOne({publicId});
  while (user) {
    publicId = generateSecureId();
    user = await mongoose.model('User').findOne({publicId});
  }
  user = new this({discordId: query.discordId, publicId});
  await user.save();
  return user;
});

userSchema.index({discordId: 1});

module.exports = mongoose.model('User', userSchema);
