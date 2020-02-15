const cmds = {play: 'Play a youtube video or a myinstant link\nFORMAT 1: play [youtubevidename]\nFORMAT 2: play mi [linktomyinstantmp3]',
              skip: 'Skip a song playing',
              theme: 'Set a theme such that when you join a channel, it plays (You may add up to 3 themes, it will play one on each channel join in order)\nFORMAT: theme [linktomyinstantmp3]',
              untheme: 'Unset a specifc theme or all themes.\nFORMAT 1: untheme -- unsets all themes\nFORMAT 2: untheme [linktomyinstantmp3] -- unsets a specific theme',
              review: 'Review or browse reviews about movies, animes, series and games.\n FORMAT 1: review [anime,game,movie,series] [NameOfItemWithSpaces] -- Next message you type after this command will be saved as your review\n FORMAT 2: review find [optionalkeywords] -- Browse latest reviews or reviews containing keywords\n FORMAT 3: review remove [nameofrevieweditem] -- Remove your review about this item',
              clean: 'Clean all bot and user messages containing any bot commands in the last 100 messages',
              map: 'Map a myinstant link to an alias then you can play it using [play (alias)]\nFORMAT: map [linktomyinstantmp3] [alias]',
              unmap: 'Unmaps a specific alias\nFORMAT: unmap [alias] -- Unmaps a specifc alias',
              setmeme: 'Enable/disable bot posting memes\nFORMAT: setmeme [true|false]',
              setmemechannel: 'Set a text channel for the bot to send memes\nFORMAT: setmemechannel [channelid]'};

module.exports.onMessage = (message, args) => {
  if (args.length == 1) {
    message.channel.send('A completely unreliable bot:\nCommands Available: play - skip - theme - untheme - review - clean - map - unmap');
  }
  else if (args.length == 2 && args[1] in cmds) {
    message.channel.send(cmds[args[1]]);
  }
  else {
    message.channel.send('Unknown command');
  }
}

module.exports.commands = ['help'];
