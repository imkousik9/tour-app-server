const mongoose = require('mongoose');

require('dotenv').config();

const app = require('./app');

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true
  })
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.log(err));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
