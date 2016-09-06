var express = require('express'),
  battle = require('./battles');

var app = express();
app.get('/battles', battle.findAll);
app.get('/list', battle.findLoc);
app.get('/stats', battle.findStats);

app.get('/count', battle.findCount);
app.get('/search', battle.findSearch);
app.get('/battles/:id', battle.findById);
app.listen(3000);
console.log('Listening on port 3000...');