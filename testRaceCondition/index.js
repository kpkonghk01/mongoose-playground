const mongoose = require('mongoose');
const Resource = require('./Resource');
const task = require('./task');

mongoose.connect('mongodb://localhost:27017', {
  keepAlive: true,
  dbName: 'localTest',
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
});
// mongoose.set('debug', true);

Resource.create({
  status: 'Pending',
}).then(async ({ _id }) => {
  const articleOid = _id.toString();
  const results = await Promise.allSettled(
    Array.from({ length: 100 }, () => task(articleOid))
  );

  console.log('Results', results);
  process.exit(0);
});
