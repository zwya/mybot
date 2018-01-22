const fs = require('fs');
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
  }
  return NaN;
}
