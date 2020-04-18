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

const USER_PERMS = {
  '299958177989132288': ['trackself', 'trackothers', 'statself', 'statothers', 'untrackself', 'untrackothers']
}

const DEFAULT_PERMS = {
  trackself: 'anyone',
  statself: 'anyone',
  statothers: 'anyone',
  untrackself: 'anyone'
}

module.exports.HAS_PERMS = (permission, userid) => {
  if (userid in USER_PERMS && USER_PERMS[userid].includes(permission)) {
    return true;
  }
  if (DEFAULT_PERMS[permission] == 'anyone') {
    return true;
  }
  return false;
}
