const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db.config.js')
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', path.resolve("./views"));

const testRouter = require('./routers/test.router');
app.use('/', testRouter);

app.use(express.static(path.join(__dirname, "public"), { 
    setHeaders: (res, path) => {
        res.status(200);
        // res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
}));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log('Server is running on port', port);
});