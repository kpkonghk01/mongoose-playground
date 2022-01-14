const { parentPort, workerData: articleOid } = require('worker_threads');

const mongoose = require('mongoose');
const Resource = require('./Resource');

mongoose.connect('mongodb://localhost:27017', {
  keepAlive: true,
  dbName: 'localTest',
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
});
mongoose.set('debug', true);

Resource.findOneAndUpdate(
  {
    _id: articleOid,
    status: 'Pending',
  },
  {
    status: 'Processing',
  }
)
  .then((result) => {
    parentPort.postMessage(result);
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
