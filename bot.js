//nodemon to continue restarting
//npm init to init a project
//npm i discord.js --save
//npm install -g nodemon
//npm install --save return-deep-diff
//npm install --save chalk

const Discord = require('discord.js');
const client = new Discord.Client();
//const settings = require('./settings.json');
const ddiff = require('return-deep-diff');
const chalk = require('chalk');
const fs = require('fs');
const promiseTimeout = require('promise-timeout');
var isReady = true;
var isChannelJoined = false;
var voiceChannel;
var voiceConnection;

var walk = function(dir, done) {
  fs.readdir(dir, function(error, list) {
    if (error) {
      return done(error);
    }

    var i = 0;

    (function next() {
      var file = list[i++];

      if (!file) {
        return done(null);
      }

      file = dir + '/' + file;

      fs.stat(file, function(error, stat) {

        if (stat && stat.isDirectory()) {
          walk(file, function(error) {
            next();
          });
        } else {
          // do stuff to file here
          filecpy = file;
          filecpy = filecpy.substring(9);
          filecpy = filecpy.substring(0, filecpy.length - 4);
          console.log(filecpy);
          next();
        }
      });
    })();
  });
};

client.on('ready', () => {
  console.log('I\'m Online');
  /*walk('./Audio/', err => {
    if(err){
      console.log(err);
    }
  });*/
});

client.on('disconnect', () => {
  voiceChannel.leave();
});

client.on('reconnect', () => {

});

var prefix = "~"
client.on('message', message => {
  //console.log(message.content[message.content.indexOf('5') + 1]);
  if (!message.content.startsWith(prefix)) return;
  //if(message.author === client.user) return; if the bot is the one who's sending this message
  if (message.author.bot) return; //if the message author is the bot
  var args = message.content.split(' ');
  console.log(args);
  if (isReady && message.content.startsWith(prefix + 'play')) {
    console.log('Went here');
    isReady = false;
    if (!isChannelJoined) {
      voiceChannel = message.member.voiceChannel;
      voiceChannel.join().then(connection => {
        console.log("Connection set");
        isReady = true;
        isChannelJoined = true;
        voiceConnection = connection
      }).catch(err => {
        console.log(err);
        isReady = true;
        isChannelJoined = false;
      });
    }

    if (voiceChannel && voiceConnection && args[1]) {
      console.log('Started playing music');
      var audioRootPath = './Audio/';
      var extension = '.mp3';

      dispatcher = null;
      if (args[2] && Number(args[2])) {
        dispatcher = voiceConnection.playFile(audioRootPath + args[1] + extension, {
          "passes": 2,
          "volume": args[2] / 100
        });
      } else {
        dispatcher = voiceConnection.playFile(audioRootPath + args[1] + extension, {
          "passes": 2
        });
      }
      dispatcher.on('start', () => {
        voiceConnection.player.streamingData.pausedTime = 0;
      });
      dispatcher.on("end", end => {
        isReady = true;
      });
      dispatcher.on('error', err => {
        console.log('Went into dispatcher err');
        console.log(err);
        isReady = true;
      });
    }
  } else if (message.content.startsWith(prefix + 'listall')) {
    message.channel.send('https://pastebin.com/WmKnM1Gz');
  }


  //message.reply('pong'); replies to a message from a specifc user with mention
  //message.createdTimestamp time message created
  //client.channels.get('channel id').sendMessage('hell from second channel') send a message to a specific channel
  //message.channel.send('pong');
  //client.user.setGame('string') //sets the game of the bot
  //client.user.setStatus('online,idle'); //sets the status of the bo
});

client.on('guildDelete', guild => {
  //on channel leave
});

client.on('guildCreate', guild => {
  //on channel join
  //guild.defaultChannel.send(''); send a message in the guild's default channel
});

client.on('guildMemberAdd', member => {
  //member.guild
  //guild.defaultChannel.send(''); send a message in the guild's default channel
  //member.user.username
});

client.on('guildMemberRemove', member => {

});

client.on('guildMemberSpeaking', (member, speaking) => {
  if (member.speaking) {
    //do something
  }
});

client.on('guildMemberUpdate', (oMember, nMember) => {
  //console.log(ddiff(oMember, nMember));
});

client.on('guildUpdate', (oGuild, nGuild) => {
  //conosle.log(ddiff(oGuild, nGuild))
});

//A member is banned
client.on('guildBanAdd', (guild, user) => {

});

//A member is unbanned
client.on('guildBanRemove', (guild, user) => {

});

client.on('channelCreate', channel => {
  //channel.type , channel.name, channel.guild
});

client.on('channelDelete', channel => {

});

client.on('channelUpdate', (oChannel, nChannel) => {

});

client.on('channelPinsUpdate', (channel, time) => {

});

client.on('messageDelete', message => {
  //message.cleanContent deleted content
});

client.on('messageDeleteBulk', messages => {

});

client.on('typingStart', (channel, user) => {

});

client.on('typingStop', (channel, user) => {

});

client.on('roleCreate', role => {

});

client.on('roleDelete', role => {

});

client.on('roleUpdate', (oRole, nRole) => {

});


//message.channel.fetchMessages((limit: intnum)).then(messages =>{ messages.channel.bulkDelete(messages); });
//client.login(settings.token);
//guild.addRole((name: 'str', color: )).catch(error => {})
//guild.member(message.mention.users.first()).addRole('roleid').catch(error => {});
client.login(process.env.BOT_TOKEN);
