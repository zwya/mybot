module.exports.prefixify = (string, prefix) => {
  return string.replace(new RegExp('!', 'g'), prefix);
}
