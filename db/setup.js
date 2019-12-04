const dbType = process.argv[2];
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const mongod = new MongoMemoryServer();

switch (dbType) {
  case 'memory':
    mongod
      .getConnectionString()
      .then(uri => {
        mongoose
          .connect(
            uri,
            {
              useNewUrlParser: true,
              useUnifiedTopology: true,
            },
          )
          .then(() => {
            console.log("MongoDB Connected")
          })
          .catch(err => console.log(err));
      });
    break;
  case 'mongo':
    mongoose.connect(
      'mongodb://localhost:27017',
      {
        keepAlive: true,
        dbName: 'localTest',
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        autoIndex: true,
      },
    );
    mongoose.set('debug', true);
    break;
  default:
    throw Error('dbType must be memory or mongo');
}

mongod
  .getConnectionString()
  .then(uri => {
    mongoose
      .connect(
        uri,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        },
      )
      .then(() => {
        console.log("MongoDB Connected")
      })
      .catch(err => console.log(err));
  });

module.exports = mongod;