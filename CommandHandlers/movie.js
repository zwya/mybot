const Discord = require('discord.js');
const data = require('../data.js');

var index = 0;
const max_time = 300;
var time = 0;
var filter = false;
var timer = false;
var embedMessage = false;
var moviesLength = false;

module.exports.sendEmbed = (message) => {
  index = 0;
  time = 0;
  if (timer) {
    clearTimeout(timer);
    timer = false;
  }
  getMovie(movie => {
    embed = createEmbed(movie, false);
    message.channel.send(embed).then(m => {
      embedMessage = m;
      embedMessage.react('◀️').then(mr => {
        embedMessage.react('▶️');
      });

      function onReact() {
        if (time / 1000 >= max_time) {
          timer = false;
          time = 0;
        } else {
          embedMessage.awaitReactions(filter, {
            max: 1,
            time: 2500
          }).then(collected => {
            const reaction = collected.first();
            if (reaction) {
              const oldIndex = index;
              if (reaction.emoji.name === '◀️') {
                if (index > 0) {
                  index = index - 1;
                }
              } else {
                if (index < moviesLength - 1) {
                  index = index + 1;
                }
              }
              if (oldIndex != index) {
                getMovie(movie => {
                  const receivedEmbed = embedMessage.embeds[0];
                  const embed = createEmbed(movie, receivedEmbed);
                  embedMessage.edit(embed).then(m => {
                    embedMessage.clearReactions().then(message => {
                      embedMessage.react('◀️').then(mr => {
                        embedMessage.react('▶️');
                      });
                    });
                  });
                });
              }
            }
          });
          time = time + 2500;
          timer = setTimeout(onReact, 2500);
        }
      }
      onReact();
    });
  });
}

module.exports.init = (clientID) => {
  filter = (reaction, user) => (reaction.emoji.name === '◀️' || reaction.emoji.name === '▶️') && clientID != user.id;
  data.getMovies(movies => {
    moviesLength = movies.movies.length;
  });
}

function getMovie(callback) {
  data.getMovies(movies => {
    var movie = movies.movies[index];
    if (!movie.duration) {
      movie.duration = '???';
    }
    movie.genre = '';
    if (movie.genres) {
      movie.genre = movie.genres[0].genre;
      for (var i = 1; i < movie.genres.length; i++) {
        movie.genre = movie.genre + ', ' + movie.genres[i].genre;
      }
    } else {
      movie.genre = '???';
    }
    callback(movie);
  });
}

function createEmbed(movie, existingEmbed) {
  if (existingEmbed) {
    existingEmbed.fields[0].value = movie.rating;
    existingEmbed.fields[0].value = movie.duration;
    existingEmbed.fields[0].value = movie.genre;
    existingEmbed.title = movie.title;
    existingEmbed.image = movie.imgurl;
    /*const embed = new Discord.RichEmbed(existingEmbed)
      .setTitle(movie.title)
      .setImage(movie.imgurl)
      .addField('Rating', movie.rating, true)
      .addField('Duration', movie.duration, true)
      .addField('Genres', movie.genre);
    return embed;*/
  }
  const embed = new Discord.RichEmbed()
    .setColor('#0099ff')
    .setTitle(movie.title)
    .setImage(movie.imgurl)
    .addField('Rating', movie.rating, true)
    .addField('Duration', movie.duration, true)
    .addField('Genres', movie.genre);
  return embed;
}
