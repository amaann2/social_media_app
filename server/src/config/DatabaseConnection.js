const mongoose = require('mongoose');

exports.connectDatabase = () => {
  mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => {
      console.log(`Database is connected 💯`);
    })
    .catch((err) => {
      console.log(err);
    });
};
