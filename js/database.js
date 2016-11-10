'use strict'
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/codiPing#01');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
  console.log('connected to monogDB');
});

const playerSchema = mongoose.Schema({
  id: Number,
  name: String,
  history: Object,
  rating: Number,
  rd: Number,
  vol: Number
});
const Player = mongoose.model('Player', playerSchema);

const gameSchema = mongoose.Schema({
  times: Object,
  winners: Array,
  losers: Array
});

const Game = mongoose.model('Game', gameSchema);

module.exports = {
  getPlayerById: (id, callback) => {
    Player.findOne({id}, (err, player_data) => {
      if(err){
        callback(err);
      } else {
        if(player_data)
          callback(null, player_data);
        else{
          console.log('didnt find the player with id', id, '. creating new one - therefore with fresh stats.');
          callback(null, null);
        }
      }
    });
  },
  insertNewPlayer: (data) => { //puts a newly created player into the database.
    var p = new Player(data);
    p.save((err) => {
      if (err) console.log(err);
      else console.log('new player saved');
    });
  },
  updatePlayer: function(conditions, update, options, callback) {
    Player.update(conditions, {$set: update}, options, function(err, num_affected) {
      callback(err, num_affected);
    });
  },
  getAllPlayers: function(callback){
    Player.find((err, players) => {
      if(err) console.log(err);
      else callback(players);
    });
  },

  storeGame: (data) => {
    var g = new Game(data);
    g.save((err) => {
      if (err) console.log(err);
      else console.log('game saved');
    });
  }
}
