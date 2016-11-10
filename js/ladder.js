'use strict'
module.exports = function RankingLadder() {
  const io = require('socket.io')(3003); console.log('listening on 3003');
  const glicko2 = require('glicko2');
  const Game = require('./game.js');
  const Player = require('./player.js');
  const db = require('./database.js');
  this.playersBySocket = {};
  this.playersById = {};
  this.gamesInProgress = {};

  let gameState = {
    frameTime: new Date().getTime(),
    totalGamesStarted: 0,
    totalGamesFinished: 0
  }

  let settings = {
    tau : 1,
    rating : 1500,
    rd : 200,
    vol : 0.06
  };
  this.ranking = new glicko2.Glicko2(settings);
  console.log(this.ranking.makeRace)

  this.playerLoggedIn = (socket, data) => {
    db.getPlayerById(data.id, (err, p_data) => {
      let player = {};
    if (err) {
      console.log(err);
    } else {
      if(p_data){
        player = new Player(p_data.id, p_data.name, this.ranking.makePlayer(p_data.rating, p_data.rd, p_data.vol), p_data.history, this.ranking);
      }
      else{
        player = new Player(data.id, data.displayName, this.ranking.makePlayer(1500, 200, 0.06), null, this.ranking);
        db.insertNewPlayer(player.getData());
      }
    }
    this.playersBySocket[socket.id] = player;
    this.playersById[data.id] = player;
    console.log(player.getData(), 'logged in.');
    socket.emit('initial-ranking-data', {
      playerRating: this.playersBySocket[socket.id].stats.getRating(),
      gamesInProgress: this.getGamesInProgress()
    });
  });
  }

  this.savePlayerChanges = (player) => {
    db.updatePlayer({id: player.id}, player.getData(), {multi: false}, (err, num_affected) => {
      if(err){
        console.log(err);
      }
      else{
        console.log(player.name, 'saved. New rating: ', player.getData().rating);
  }
  });
  }
  this.playerLoggedOut = (sId) => {
    if(!this.playersBySocket.hasOwnProperty(sId)) //sockets reconnected without google-login/after reconnect
      return;
    const player = this.playersBySocket[sId];
    const id = player.id;
    db.updatePlayer({id: id}, player.getData(), {multi: false}, (err, num_affected) => {
      if(err){
        console.log(err);
      }
      else{
        const rating = player.getData().rating;
    delete this.playersBySocket[sId];
    delete this.playersById[id];
    console.log(new Date());
    console.log(player.name, 'logged out. Rating at logout:', rating);
  }
  });
  }
  this.createNewGame = (socket) => {
    if(!this.playersBySocket.hasOwnProperty(socket.id)){
      return;
    }
    const initiator = this.playersBySocket[socket.id];
    for(let i in this.gamesInProgress){
      if(this.gamesInProgress[i].createdBy.id === initiator.id){
        socket.emit('hosting-cap-reached');
        return;
      }
    }
    const gameId = gameState.totalGamesStarted++;
    const gameData = {
      gameId: gameId,
      playersInvolved: initiator
    }

    this.gamesInProgress[gameId] = new Game(gameData, io, glicko2, this);
    initiator.hostedGames.push(gameId);
    io.sockets.emit('new-game-created', this.gamesInProgress[gameId].getDataForClient());
  }
  this.playerJoinGame = (socket, data) => {
    const gameId = data.gameId;
    const player = this.playersBySocket[socket.id];

    const game = this.gamesInProgress[gameId];

    const joined = game.playerJoinGame(player);
    console.log(joined)
    if(joined){
      io.sockets.emit('player-joined-game', {name: player.name, gameId});
    } else {
      socket.emit('join-game-denied', {gameId});
    }
  }
  this.gameHasUpdated = (id) => {

  }
  this.getGamesInProgress = () => { //for client - change name
    let games = {};
    for (let i in this.gamesInProgress) {
      if (this.gamesInProgress.hasOwnProperty(i)) {
        let game = {};
        let players = {
          winners: Object.keys(this.gamesInProgress[i].winningPlayers).map(key => {
            return {
              name: this.gamesInProgress[i].winningPlayers[key].name,
              ready: this.gamesInProgress[i].readyPlayers.hasOwnProperty(key),
              win: true,
              rating: this.gamesInProgress[i].winningPlayers[key].getData().rating
            };
      }),
        losers: Object.keys(this.gamesInProgress[i].losingPlayers).map(key => {
          return {
            name: this.gamesInProgress[i].losingPlayers[key].name,
            ready: this.gamesInProgress[i].readyPlayers.hasOwnProperty(key),
            win: false,
            rating: this.gamesInProgress[i].losingPlayers[key].getData().rating
          };
      }),
        unsigned: Object.keys(this.gamesInProgress[i].unsignedPlayers).map(key => {
          return {
            name: this.gamesInProgress[i].unsignedPlayers[key].name,
            ready: this.gamesInProgress[i].readyPlayers.hasOwnProperty(key),
            win: undefined,
            rating: this.gamesInProgress[i].unsignedPlayers[key].getData().rating
          };
      })
      };
        game.playersInvolved = players;
        game.gameId = i;
        game.hostName = this.gamesInProgress[i].hostName;
        games[i] = game;
      }
    }
    return games;
  }
  this.removeExistingGame = (id) => {
    const game = this.gamesInProgress[id];
    const originalHost = game.createdBy;

    originalHost.hostedGames.splice(originalHost.hostedGames.indexOf(id), 1);

    delete this.gamesInProgress[id];
    io.sockets.emit('existing-game-timeout', id);
  }

  this.saveGame = (data) => {
    db.storeGame(data);
  };

  this.updateLoop = setInterval(() => {
    gameState.frameTime = new Date().getTime();

  for (let gameId in this.gamesInProgress) {
    if (this.gamesInProgress.hasOwnProperty(gameId)) {
      const game = this.gamesInProgress[gameId];
      if(gameState.frameTime - game.decayTime > game.creationTime)
        this.removeExistingGame(gameId);
    }
  }
}, 1000);
  db.getAllPlayers((players)=> {
    let playerNames = players.map((player)=>{
          return player.name;
});
  console.log('logged in at least once:\n', playerNames);
})
  this.sendLeaderboard = (socket) => {
    db.getAllPlayers((players)=> {
      let playersForClient = players.map((player)=>{
            return {name: player.name, rating: player.rating};
  });
    if(socket){
      console.log('sending lb to one player')
      socket.emit('update-ratings', playersForClient);
    } else {
      console.log('sending lb to all')
      io.sockets.emit('update-ratings', playersForClient);
    }
  })
  }
  io.on('connection', (socket) => {


    socket.on('initial-google-data', (data) => {
    console.log(data.displayName, 'logging in');
  if(data.domain !== 'codilime.com'){
    // socket.disconnect();
    // return;
  }
  this.playerLoggedIn(socket, data);
  this.sendLeaderboard(socket);
});

  socket.on('initiate-new-session', () => {
    this.createNewGame(socket);
});

  socket.on('player-join-game', data => {
    this.playerJoinGame(socket, data);
});
  socket.on('player-abort-game', data => {
    const player = this.playersBySocket[socket.id];
    if (this.gamesInProgress[data.gameId].createdBy.id === player.id) {
      this.removeExistingGame(data.gameId);
    }
});
  socket.on('player-win-game', data => {
  const player = this.playersBySocket[socket.id];
  this.gamesInProgress[data.gameId].playerWin(player);
});
  socket.on('player-lose-game', data => {
  const player = this.playersBySocket[socket.id];
  this.gamesInProgress[data.gameId].playerLose(player);
})
  socket.on('player-is-ready', data => {
    const player = this.playersBySocket[socket.id];
  this.gamesInProgress[data.gameId].playerReadyUp(player)
});
  socket.on('player-leave-game', data => {
    const player = this.playersBySocket[socket.id];
  this.gamesInProgress[data.gameId].playerLeave(player)
});
  socket.on('disconnect', () => {
    this.playerLoggedOut(socket.id);
});
});


}
