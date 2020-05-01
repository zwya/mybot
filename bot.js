//nodemon to continue restarting
//npm init to init a project
//npm i discord.js --save
//npm install -g nodemon
//npm install --save return-deep-diff
//npm install --save chalk

const ENVIRON = 'PROD';  // DEV / PROD
const Discord = require('discord.js');
var client;
const settings = require('./settings.json');
const handler = require('./CommandHandlers/handler.js');
const db = require('./db/db.js');

function discordClientInit() {
  client = new Discord.Client({
    autoReconnect: true
  });
  client.on('ready', () => {
    console.log('I\'m Online');
    handler.init({botid: client.user.id, channels: client.channels, users: client.users});
  });

  client.on('disconnect', () => {

  });

  client.on('reconnect', () => {

  });

  client.on('message', message => {
    handler.onMessage(message);

    /*else if (args[0].toLowerCase() === prefix + 'clean') {
      message.channel.fetchMessages({limit: 100}).then(messages => {
        const regex = new RegExp('\\' + prefix + '(play|volume|theme|untheme|stop|skip|seek|play|clean|begone|help|movies|review)', 'g');
        messagesArray = messages.array();
        messages.filter(message => {
          const result = message.content.match(regex);
          return result && result.length > 0 || message.author.id == client.user.id;
        }).deleteAll();
      });
    }*/
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

  client.on('voiceStateUpdate', (oldState, newState) => {
    var newUserChannel = newState.channel
    var oldUserChannel = oldState.channel

    if (settings['themes'] && oldUserChannel === null && newUserChannel !== null) {
      handler.onUserVoice(newState.member);

    } else if (newUserChannel === null) {

      // User leaves a voice channel

    }
  });
  if (ENVIRON == 'PROD') {
    client.login(process.env.BOT_TOKEN);
  }
  else {
    client.login(settings['token']);
  }
  init();
}

function init() {
  db.init(ENVIRON);
}
//message.channel.fetchMessages((limit: intnum)).then(messages =>{ messages.channel.bulkDelete(messages); });
//client.login(settings.token);
//guild.addRole((name: 'str', color: )).catch(error => {})
//guild.member(message.mention.users.first()).addRole('roleid').catch(error => {});
discordClientInit();
