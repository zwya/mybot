const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const guildSchema = new Schema({
  prefix: { type: String },
  guildId: { type: String, required: true },
  voicemap: { type: Map, of: String },
  shouldMeme: { type: Boolean, default: false },
  memeChannel: { type: String }
});

module.exports = mongoose.model('Guild', guildSchema);
