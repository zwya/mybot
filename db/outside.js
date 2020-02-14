const request = require('request');
const ytdl = require('ytdl-core');

module.exports.getMovies = (callback) => {
  request('http://webcrawler2.herokuapp.com/webserver/', function(error, response) {
    if (error) {
      console.log(error);
      callback(false);
    }
    else {
      try {
        callback(JSON.parse(response.body));
      }
      catch(e) {
        console.log(e);
        callback(false);
      }
    }
  });
}

module.exports.getLatestMemes = () => {
  return new Promise(resolve => {
    request('https://www.reddit.com/r/memes/.json?limit=5', function(error, response) {
      if (error) {
        console.log(error);
        resolve(false);
      }
      else {
        try {
          var memes = [];
          const data = JSON.parse(response.body).data;
          data.children.forEach((item, i) => {
            memes.push({title: item.data.title, id: item.data.name, ups:item.data.ups, over_18:item.data.over_18, url:item.data.url, created_utc: item.data.created_utc})
          });
          resolve(memes);
        }
        catch(e) {
          console.log(e);
          resolve(false);
        }
      }
    });
  });
}

module.exports.getYtVideoInfo = (video) => {
  return new Promise(resolve => {
    request('http://webcrawler2.herokuapp.com/webserver/video?q=' + video, function(error, response, body) {
      if (error) {
        console.log(error);
      } else {
        try {
          ytdl.getInfo('https://www.youtube.com/watch?v=' + JSON.parse(body).link, function(err, info) {
            resolve(info);
          });
        }
        catch(e) {
          console.log(e);
          resolve(false);
        }
      }
    });
  });
}
