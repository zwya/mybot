const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  discordId: { type: String, required: true },
  theme: { type: [String] },
  themeLastPlayDate: { type: Date },
  themeLastPlayIndex: { type: Number },
  tracked: { type: Boolean, default: false }
});

userSchema.index({discordId: 1});

module.exports = mongoose.model('User', userSchema);
