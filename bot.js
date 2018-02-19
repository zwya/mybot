//nodemon to continue restarting
//npm init to init a project
//npm i discord.js --save
//npm install -g nodemon
//npm install --save return-deep-diff
//npm install --save chalk

const Discord = require('discord.js');
var client;
const ddiff = require('return-deep-diff');
const chalk = require('chalk');
const promiseTimeout = require('promise-timeout');
const play = require('./CommandHandlers/play.js');
const stop = require('./CommandHandlers/stop.js');
const list = require('./CommandHandlers/list.js');
const data = require('./data.js');
const wordmatch = require('./util/wordmatch.js');

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
      args[1] = args[1].toLowerCase();
      if (play.hasFile(args[1])) {
        play.playMusic(client, message, args);
      } else {
        var match = wordmatch.match(args[1]);
        if (match) {
          message.channel.send('Did you mean ' + match + '?');
        }
      }
    } else if (args[0].toLowerCase() === prefix + 'list') {
      var result = list.list(args);
      if (result && result.length > 0) {
        text = '';
        for (var i = 0; i < result.length; i++) {
          text += ((i + 1) + '- ' + result[i] + '\n');
        }
        message.channel.send(text);
      }
    } else if (args[0].toLowerCase() === prefix + 'stop') {
      stop(play.dispatcher);
    } else if (args[0].toLowerCase() === prefix + 'begone') {
      client.destroy().then(() => {
        discordClientInit();
      });
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
  client.login(process.env.BOT_TOKEN);
  play.init();
}

function init() {
  data.init();
  wordmatch.init();
}
//message.channel.fetchMessages((limit: intnum)).then(messages =>{ messages.channel.bulkDelete(messages); });
//client.login(settings.token);
//guild.addRole((name: 'str', color: )).catch(error => {})
//guild.member(message.mention.users.first()).addRole('roleid').catch(error => {});
init();
discordClientInit();
