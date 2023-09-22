const express = require('express');
const app = express();

app.use('view engine','ejs');
app.use(express.static("views"));
