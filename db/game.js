const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const generateSecureId = require('../util/util').generateSecureId;

const gameSchema = new Schema({
  title: { type: String, required: true, unique: true },
  publicId: { type: Number }
});

gameSchema.static('findOneOrCreateDefault', async function(query) {
  let game = await mongoose.model('Game').findOne(query);
  if (game) {
    return game;
  }
  if (!query.title) {
    return null;
  }
  let publicId = generateSecureId();
  game = await mongoose.model('Game').findOne({publicId});
  while(game) {
    publicId = generateSecureId();
    game = await mongoose.model('Game').findOne({publicId});
  }
  game = new this({title: query.title, publicId});
  await game.save();
  return game;
});

gameSchema.index({title: 1});

module.exports = mongoose.model('Game', gameSchema);
