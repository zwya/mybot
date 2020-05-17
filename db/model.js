const db = require('./db.js');
const ObjectID = require('mongodb').ObjectID;

module.exports.updateOne = (collection, id, doc, options={}) => {
  return new Promise(resolve => {
    const client = getDB();
    if (client) {
      if (id && doc) {
        const col = client.collection(collection);
        col.updateOne(resolveID(id, collection), {$set: doc}, options, (err, result) => {
          if (err) {
            console.log(err);
            resolve(false);
          }
          if (result.modifiedCount == 1) {
            resolve(true);
          }
          else {
            resolve(false);
          }
        });
      }
      else {
        console.log('id or document null');
        resolve(false);
      }
    }
  });
}

module.exports.insertOne = (collection, doc) => {
  return new Promise(resolve => {
    const client = getDB();
    if(client) {
      if (doc) {
        const col = client.collection(collection);
        col.insertOne(doc, (err, result) => {
          if (err) {
            console.log(err);
            resolve(false);
          }
          if (result.insertedCount == 1) {
            resolve(true);
          }
          else {
            resolve(false);
          }
        });
      }
      else {
        console.log('document is null');
        resolve(false);
      }
    }
  });
}

module.exports.deleteOne = (collection, id) => {
  return new Promise(resolve => {
    const client = getDB();
    if (client) {
      if (id) {
        const col = client.collection(collection);
        col.deleteOne(resolveID(id, collection), (err, result) => {
          if (err) {
            console.log(err);
            resolve(false);
          }
          if (result.deletedCount == 1) {
            resolve(true);
          }
          else {
            resolve(false);
          }
        });
      }
      else {
        console.log('document is null');
        resolve(false);
      }
    }
  });
}

module.exports.findOne = (collection, query, projection={}) => {
  return new Promise(resolve => {
    const client = getDB();
    if (client) {
      if (query) {
        const col = client.collection(collection);
        col.find(query).project(projection).toArray((err, document) => {
          if (err) {
            console.log(err);
            resolve(false);
          }
          if (document.length == 1) {
            resolve(document[0]);
          }
          else {
            resolve(false);
          }
        });
      }
      else {
        console.log('query null');
        resolve(false);
      }
    }
  });
}

module.exports.find = (collection, query, options={}) => {
  return new Promise(resolve => {
    const client = getDB();
    if (client) {
      if (query) {
        const col = client.collection(collection);
        col.find(query, options).toArray((err, documents) => {
          if (err) {
            console.log(err);
            resolve(false);
          }
          if (documents.length > 0) {
            resolve(documents);
          }
          else {
            resolve(false);
          }
        });
      }
      else {
        console.log('query null');
        resolve(false);
      }
    }
  });
}

module.exports.paginate = (collection, query, field, asc, limit) => {
  return new Promise(resolve => {
    const client = getDB();
    if (client) {
        if (collection && query && field) {
          const col = client.collection(collection);
          var q = query;
          var sortOrder = 1;
          if ('after' in field) {
            q[field['name']] = {'$gt': field['after']};
          }
          else if ('before' in field){
            q[field['name']] = {'$lt': field['before']};
          }
          if (!asc) {
            sortOrder = -1;
          }
          var sort = {};
          sort[field['name']] = sortOrder;
          col.find(q).sort(sort).limit(limit).toArray((err, documents) => {
            if (err) {
              console.log(err);
              resolve(false);
            }
            if (documents.length > 0) {
              resolve(documents);
            }
            else {
              resolve(false);
            }
          });
        }
        else {
          console.log('collection or query or field null');
          resolve(false);
        }
    }
  });
}

function getDB() {
  const client = db.db();
  if(client) {
    return client;
  }
  else {
    console.log('Database not initialized');
    return false;
  }
}

function resolveID(id, collection) {
  if (collection == 'user') {
    return {userid: id};
  }
  else if (collection == 'serverdata') {
    return {guildid: id};
  }
  else if (collection == 'game') {
    return {userid: id['userid'], title: id['title']};
  }
  return {'_id': ObjectID(id)};
}
