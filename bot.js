//nodemon to continue restarting
//npm init to init a project
//npm i discord.js --save
//npm install -g nodemon
//npm install --save return-deep-diff
//npm install --save chalk

const Discord = require('discord.js');
var client;
const promiseTimeout = require('promise-timeout');
const music = require('./CommandHandlers/music.js');
const theme = require('./CommandHandlers/theme.js');
const help = require('./CommandHandlers/help.js');
const data = require('./data.js');
const connectionURL = 'mongodb://zwya:o6o6ed@ds263109.mlab.com:63109/discordbot';

function discordClientInit() {
  client = new Discord.Client({
    autoReconnect: true
  });
  client.on('ready', () => {
    console.log('I\'m Online');
  });

  client.on('disconnect', () => {

  });

  client.on('reconnect', () => {

  });

  var prefix = "!"
  client.on('message', message => {
    //console.log(message.content[message.content.indexOf('5') + 1]);
    if (!message.content.startsWith(prefix)) return;
    //if(message.author === client.user) return; if the bot is the one who's sending this message
    if (message.author.bot) return; //if the message author is the bot
    var args = message.content.split(' ');
    console.log(args);
    if (args[0].toLowerCase() === prefix + 'play') {
      var vidName = args[1];
      for (var i = 2; i < args.length; i++) {
        vidName = vidName + ' ' + args[i];
      }
      var adjustedArguments = [args[0], vidName]
      music.play(message.member, adjustedArguments, false, result => {
        message.channel.send(result.message);
      });
    } else if (args[0].toLowerCase() === prefix + 'seek') {
      music.seek(args, message.member.voiceChannel, result => {
        if (result.error) {
          message.channel.send(result.message);
        }
      });
    } else if (args[0].toLowerCase() === prefix + 'skip') {
      music.skip(message.member.voiceChannel, result => {
        message.channel.send(result.message);
      });
    } else if (args[0].toLowerCase() === prefix + 'stop') {
      music.stop(message.member.voiceChannel, result => {
        if (result.error) {
          message.channel.send(result.message);
        }
      });
    } else if (args[0].toLowerCase() === prefix + 'resume') {
      music.resume(message.member.voiceChannel, result => {
        if (result.error) {
          message.channel.send(result.message);
        }
      });
    } else if (args[0].toLowerCase() === prefix + 'volume') {
      music.volume(args, message.member.voiceChannel, result => {
        message.channel.send(result.message);
      });
    }
    else if (args[0].toLowerCase() === prefix + 'begone') {
         client.destroy().then(() => {
           discordClientInit();
         });
       }
    else if (args[0].toLowerCase() === prefix + 'theme') {
      var vidName = args[1];
      for (var i = 2; i < args.length; i++) {
        vidName = vidName + ' ' + args[i];
      }
      var adjustedArguments = [args[0], vidName]
      theme.setTheme(message, adjustedArguments, result => {
        if(result) {
          message.channel.send(result.message);
        }
      });
    } else if (args[0].toLowerCase() === prefix + 'untheme') {
      theme.unsetTheme(message.member);
      message.channel.send('Theme unset succesfully');
    } else if (args[0].toLowerCase() === prefix + 'help') {
      help.help(args, message.channel);
    }
    else if (args[0].toLowerCase() === prefix + 'clean') {
      message.channel.fetchMessages({limit: 100}).then(messages => {
        const regex = /!(play|volume|theme|untheme|stop|skip|seek|play|clean|begone|help)/g
        messagesArray = messages.array();
        messages.filter(message => {
          const result = message.content.match(regex);
          return result && result.length > 0 || message.author.id == client.user.id;
        }).deleteAll();
      });
    }
    //message.channel.send(text);
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

  client.on('voiceStateUpdate', (oldMember, newMember) => {
    var newUserChannel = newMember.voiceChannel
    var oldUserChannel = oldMember.voiceChannel


    if (oldUserChannel === undefined && newUserChannel !== undefined) {
      theme.onUserLogin(newMember);

    } else if (newUserChannel === undefined) {

      // User leaves a voice channel

    }
  });
  client.login(process.env.BOT_TOKEN);
  music.init();
  data.init();
}

function init() {
  data.init();
}
//message.channel.fetchMessages((limit: intnum)).then(messages =>{ messages.channel.bulkDelete(messages); });
//client.login(settings.token);
//guild.addRole((name: 'str', color: )).catch(error => {})
//guild.member(message.mention.users.first()).addRole('roleid').catch(error => {});
init();
discordClientInit();
