const music = require('./music.js');
var data = require('../data.js');

var pendingRequests = [];

module.exports.setTheme = (message, args, callback) => {
  if (pendingRequests.length > 0 && pendingRequests.some(el => el.memberid == message.member.id)) {
    var index = -1;
    for (var i = 0; i < pendingRequests.length; i++) {
      if (pendingRequests[i].memberid == message.member.id) {
        index = i;
        break;
      }
    }
    const req = pendingRequests.splice(index, 1)[0];
    data.getYtVideoInfo(req.args, function(info) {
      if (info) {
        var memberId = message.member.id;
        const regex = /\d+:\d+/g;
        const result = args[1].match(regex);
        if (result && result.length == 2) {
          startTime = result[0].split(":");
          endTime = result[1].split(":");
          if (Number(startTime[0]) >= 0 && Number(startTime[1]) >= 0 && Number(endTime[0]) >= 0 && Number(endTime[1]) >= 0 && (Number(endTime[0]) * 60 + Number(endTime[1]) < info.length_seconds)) {
            if (data.userData[memberId]) {
              data.userData[memberId].theme = info.title;
              data.userData[memberId].startTime = result[0];
              data.userData[memberId].endTime = result[1];
              data.updateUser(memberId, {
                theme: info.title,
                startTime: result[0],
                endTime: result[1]
              });
            } else {
              data.userData[memberId] = {};
              data.userData[memberId].theme = info.title;
              data.userData[memberId].startTime = result[0];
              data.userData[memberId].endTime = result[1];
              data.createUser({
                userid: memberId,
                theme: info.title,
                startTime: result[0],
                endTime: result[1]
              });
            }
            callback({
              message: info.title + ' set as your theme.'
            });
          } else {
            callback({
              message: 'Something is wrong with the format',
              error: '6'
            });
            pendingRequests.shift();
          }
        }
      } else {
        callback({
          message: 'An error happened, call a developer.',
          error: '2'
        });
      }
    });
  } else if (args[1]) {
    pendingRequests.push({
      memberid: message.member.id,
      args: args
    });
    callback({
      message: 'Please type the timestamp in the following format:\n!settheme mm:ss mm:ss where the first timestamp is the start and the second one is the end'
    });
    setTimeout(function() {
      if (pendingRequests.length > 0 && pendingRequests.some(el => el.memberid == message.member.id)) {
        var index = -1;
        for (var i = 0; i < pendingRequests.length; i++) {
          if (pendingRequests[i].memberid == message.member.id) {
            index = i;
            break;
          }
        }
        pendingRequests.splice(index, 1)[0];
      }
    }, 1000 * 60 * 5);
  } else {
    callback({
      message: 'An error happened, call a developer.',
      error: '2'
    });
  }
}

module.exports.unsetTheme = (member) => {
  if (data.userData[member.id]) {
    delete data.userData[member.id];
    data.deleteUser(member.id);
  }
}

module.exports.onUserLogin = (member) => {
  if (data.userData[member.id]) {
    rightNow = new Date(Date.now());
    if (data.userData[member.id].lastplayed) {
      lastPlayed = new Date(data.userData[member.id].lastplayed);
      var differenceInHours = Math.floor((rightNow - lastPlayed) / (1000 * 60));
      console.log(differenceInHours);
      if (differenceInHours >= 30) {
        args = [];
        args.push('!play');
        args.push(data.userData[member.id].theme);
        const startTime = data.userData[member.id].startTime.split(":");
        const endTime = data.userData[member.id].endTime.split(":");
        endTimeSec = Number(endTime[0]) * 60 + Number(endTime[1]);
        startTimeSec = Number(startTime[0]) * 60 + Number(startTime[1]);
        music.playTheme(member, args, {
          seek: startTimeSec
        }, endTimeSec - startTimeSec);
        data.userData[member.id].lastplayed = rightNow.toLocaleString();
        data.updateUser(member.id, {
          lastplayed: data.userData[member.id].lastplayed
        });
      }
    } else {
      args = [];
      args.push('!play');
      args.push(data.userData[member.id].theme);
      const startTime = data.userData[member.id].startTime.split(":");
      const endTime = data.userData[member.id].endTime.split(":");
      endTimeSec = Number(endTime[0]) * 60 + Number(endTime[1]);
      startTimeSec = Number(startTime[0]) * 60 + Number(startTime[1]);
      music.playTheme(member, args, {
        seek: startTimeSec
      }, endTimeSec - startTimeSec);
      data.userData[member.id].lastplayed = rightNow.toLocaleString();
      data.updateUser(member.id, {
        lastplayed: data.userData[member.id].lastplayed
      });
    }
  }
}
