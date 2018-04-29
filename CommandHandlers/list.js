const data = require('../data.js')

module.exports.list = (args) => {
  if (args[1] && Number(args[1])) {
    list = [];
    start = (args[1] - 1) * 10;
    if (start >= data.allFiles.length)
      return list;
    end = (args[1]) * 10;
    if (end > data.allFiles.length)
      end = data.allFiles.length
    for (var i = start; i < end; i++) {
      list.push(data.allFiles[i]);
    }
    return list;
  } else if (args[1] && /^[a-zA-Z]+$/.test(args[1]) && args[2] && Number(args[2])) {
    console.log('went here');
    if (data.audioCategories[args[1]]) {
      list = [];
      start = (args[2] - 1) * 10;
      if (start >= data.audioCategories[args[1].length])
        return list;
      end = (args[2]) * 10;
      if (end > data.audioCategories[args[1]].length)
        end = data.audioCategories[args[1]].length
      for (var i = start; i < end; i++) {
        list.push(data.audioCategories[args[1]][i])
      }
      return list;
    }
  }
  return NaN;
}
