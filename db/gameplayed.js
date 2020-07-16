const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const gamePlayedSchema = new Schema({
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true},
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  startDate: { type: Date, required: true },
  timeSpent: { type: Number }
});

gamePlayedSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('GamePlayed', gamePlayedSchema);
