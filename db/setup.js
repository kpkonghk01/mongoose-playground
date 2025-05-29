const dbType = process.argv[2] || "memory";
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

class Agent {
  constructor(inst) {
    this.inst = inst;
  }

  async close() {
    await mongoose.disconnect();
    if (this.inst) {
      await this.inst.stop();
    }
  }
}

let agent;

switch (dbType) {
  case "memory":
    const mongod = new MongoMemoryServer({
      binary: {
        version: "5.0.3",
      },
    });

    mongod.start().then(() => {
      const uri = mongod.getUri();

      mongoose
        .connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
        .then(() => {
          console.log("MongoDB Connected");
        })
        .catch((err) => console.log(err));
    });

    agent = new Agent(mongod);
    break;
  case "mongo":
    mongoose.connect("mongodb://localhost:27017", {
      keepAlive: true,
      dbName: "localTest",
      autoIndex: true,
    });
    mongoose.set("debug", true);

    agent = new Agent();
    break;
  default:
    throw Error("dbType must be memory or mongo");
}

module.exports = agent;
