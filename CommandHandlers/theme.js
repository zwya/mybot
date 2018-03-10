var fs = require('fs')
var play = require('./play.js');
var userData;
var userDataRead;

module.exports.setTheme = (message, args) => {
  if (play.hasFile(args[1])) {
    if (args[2] && message.mentions.users.first()) {
      var memberId = message.mentions.users.first().id;
    } else {
      var memberId = message.member.id;
    }
    if (userDataRead) {
      if (userData[memberId]) {
        userData[memberId].theme = args[1];
      } else {
        userData[memberId] = {};
        userData[memberId].theme = args[1];
      }
      fs.writeFile('./userdata.json', JSON.stringify(userData), 'utf8', function callback(err) {
        if (err) {
          console.log(err);
        }
      });
      return true;
    } else {
      userData = {};
      userData[memberId] = {};
      userData[memberId].theme = args[1];
      fs.writeFile('./userdata.json', JSON.stringify(userData), 'utf8', function callback(err) {
        if (err) {
          console.log(err);
        }
      });
      return true;
    }
  } else {
    return false;
  }
}

module.exports.unsetTheme = (member) => {
  if (userData[member.id]) {
    delete userData[member.id];
    fs.writeFile('./userdata.json', JSON.stringify(userData), 'utf8', function callback(err) {
      if (err) {
        console.log(err);
      }
    });
  }
}

module.exports.onUserLogin = (member) => {
  if (userData && userData[member.id] && userData[member.id].theme) {
    rightNow = new Date(Date.now());
    if (userData[member.id].lastplayed) {
      lastPlayed = new Date(userData[member.id].lastplayed);
      var differenceInHours = Math.floor((rightNow - lastPlayed) / (1000 * 60 * 60));
      if (differenceInHours >= 3) {
        args = [];
        args.push('!play');
        args.push(userData[member.id].theme);
        play.playMusic(member, args);
        userData[member.id].lastplayed = rightNow.toLocaleString();
        fs.writeFile('./userdata.json', JSON.stringify(userData), 'utf8', function callback(err) {
          if (err) {
            console.log(err);
          }
        });
      }
    } else {
      args = [];
      args.push('!play');
      args.push(userData[member.id].theme);
      play.playMusic(member, args);
      userData[member.id].lastplayed = rightNow.toLocaleString();
      fs.writeFile('./userdata.json', JSON.stringify(userData), 'utf8', function callback(err) {
        if (err) {
          console.log(err);
        }
      });
    }
  }
}

module.exports.init = () => {
  userDataRead = false;
  if (fs.existsSync('./userdata.json')) {
    userData = JSON.parse(fs.readFileSync('./userdata.json', 'utf8'));
    userDataRead = true;
    console.log('user data read');
  }
}
