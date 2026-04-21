const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database successfully connected");
  } catch (err) {
    console.log(err);
  }
};

module.exports = dbConnection;




