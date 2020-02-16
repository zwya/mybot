const PERMS = {
  THEMES: '0',
  VOICEMAPS: '1'
};

const GUILD_ROLES = {
  founder: {0: true, 1: true}
};

const MAX = {
  0: {
    lv1: 3,
    lv2: 4,
    lv3: 5,
    lv4: 6,
    lv5: 7,
    founder: 7
  },
  1: {
    lv1: 10,
    lv2: 15,
    lv3: 20,
    lv4: 25,
    lv5: 30,
    founder: 30
  }
}

module.exports.PERMS = PERMS;

module.exports.canByPass = (role, permission) => {
  if (role in GUILD_ROLES) {
    GUILD_ROLES[role][permission];
  }
  return false;
}

module.exports.maxAllowed = (role, permission) => {
  if (role in MAX[permission]) {
    return MAX[permission][role];
  }
  return 0;
}

module.exports.USER_PERMS = {
  '299958177989132288': 'creator'
}
