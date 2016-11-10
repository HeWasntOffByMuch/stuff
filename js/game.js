'use strict'
const gameDefaults = {
  decayTime: 30*60*1000, //if game is not resolved - gets deleted.
  playerLimit: 2,
  minimumCompetitors: 2
}

function Game(data, io, glicko2, ladder) {
  console.log('creating game with:', data.gameId, data.playersInvolved.getData());
  this.creationTime = new Date().getTime();
  this.finishTime = false;
  this.decayTime = gameDefaults.decayTime;
  this.gameId = data.gameId;
  this.hostName = data.playersInvolved.getData().name;
  this.createdBy = data.playersInvolved;
  this.playersInvolved = {};
  this.playersInvolved[data.playersInvolved.id] = data.playersInvolved;

  this.playerLimit = gameDefaults.playerLimit;

  this.unsignedPlayers = {};
  this.unsignedPlayers[data.playersInvolved.id] = data.playersInvolved;

  this.winningPlayers = {};
  this.losingPlayers = {};
  this.readyPlayers = {};

  this.getDataForClient = () => {
    return {
      gameId: this.gameId,
      hostName: this.hostName,
      playersInvolved: {
        winners: Object.keys(this.winningPlayers).map(key => {
          return {name: this.winningPlayers[key].name,
            ready: this.readyPlayers.hasOwnProperty(key),
            rating: this.winningPlayers[key].getData().rating,
            win: true
          };
  }),
    losers: Object.keys(this.losingPlayers).map(key => {
      return {name: this.losingPlayers[key].name,
        ready: this.readyPlayers.hasOwnProperty(key),
        rating: this.losingPlayers[key].getData().rating,
        win: false
      };
  }),
    unsigned: Object.keys(this.unsignedPlayers).map(key => {
      return {name: this.unsignedPlayers[key].name,
        ready: this.readyPlayers.hasOwnProperty(key),
        rating: this.unsignedPlayers[key].getData().rating,
        win: undefined
      };
  })
  }
  }
  }

  this.sendGameUpdateToClients = () => {
    io.sockets.emit('players-involved-update', {
      gameId: this.gameId,
      playersInvolved: {
        winners: Object.keys(this.winningPlayers).map(key => {
          return {name: this.winningPlayers[key].name,
            ready: this.readyPlayers.hasOwnProperty(key),
            rating: this.winningPlayers[key].getData().rating,
            win: true
          };
  }),
    losers: Object.keys(this.losingPlayers).map(key => {
      return {name: this.losingPlayers[key].name,
        ready: this.readyPlayers.hasOwnProperty(key),
        rating: this.losingPlayers[key].getData().rating,
        win: false
      };
  }),
    unsigned: Object.keys(this.unsignedPlayers).map(key => {
      return {name: this.unsignedPlayers[key].name,
        ready: this.readyPlayers.hasOwnProperty(key),
        rating: this.unsignedPlayers[key].getData().rating,
        win: undefined
      };
  })
  }
  });
  }

  this.playerJoinGame = (player) => {
    if(Object.keys(this.playersInvolved).length < this.playerLimit && !this.playersInvolved.hasOwnProperty(player.id)){
      this.playersInvolved[player.id] = player;
      this.unsignedPlayers[player.id] = player;

      this.sendGameUpdateToClients();
      return true;
    }
    else{
      return false;
    }
  }


  this.playerWin = (player) => {
    if(this.winningPlayers.hasOwnProperty(player.id)){
      return;
    }
    else if(this.losingPlayers.hasOwnProperty(player.id)){ //add him to unsigned too etc.
      delete this.losingPlayers[player.id];
      this.winningPlayers[player.id] = player;
      console.log('swapped', player.name, 'to winners');
    }else{
      if(this.playersInvolved.hasOwnProperty(player.id)) {
        delete this.unsignedPlayers[player.id];
        this.winningPlayers[player.id] = player;
        console.log('added', player.name, 'to winners');
      }
    }
    this.sendGameUpdateToClients();
  }
  this.playerLose = (player) => {
    if(this.losingPlayers.hasOwnProperty(player.id))
      return;
    else if(this.winningPlayers.hasOwnProperty(player.id)){
      delete this.winningPlayers[player.id];
      this.losingPlayers[player.id] = player;
      console.log('swapped', player.name, 'to losers');
    }else{
      if(this.playersInvolved.hasOwnProperty(player.id)) {
        delete this.unsignedPlayers[player.id];
        this.losingPlayers[player.id] = player;
        console.log('added', player.name, 'to losers');
      }
    }
    this.sendGameUpdateToClients();
  }

  this.playerLeave = (player) => {
    if (this.unsignedPlayers.hasOwnProperty(player.id))
      delete this.unsignedPlayers[player.id];
    if (this.winningPlayers.hasOwnProperty(player.id))
      delete this.winningPlayers[player.id];
    if (this.losingPlayers.hasOwnProperty(player.id))
      delete this.losingPlayers[player.id];
    if (this.readyPlayers.hasOwnProperty(player.id))
      delete this.readyPlayers[player.id];
    if (this.playersInvolved.hasOwnProperty(player.id))
      delete this.playersInvolved[player.id];

    this.sendGameUpdateToClients();
  }

  this.playerReadyUp = (player) => {
    console.log('trying to join with', player.id)
    console.log(this.playersInvolved, ' :', Object.keys(this.playersInvolved).length)

    if (!this.unsignedPlayers.hasOwnProperty(player.id)) {
      if(this.readyPlayers.hasOwnProperty(player.id)){
        delete this.readyPlayers[player.id];
      } else {
        this.readyPlayers[player.id] = player;
      }
      this.sendGameUpdateToClients();
    }

    if(Object.keys(this.playersInvolved).length < gameDefaults.minimumCompetitors){
      console.log('not enough players in the game');
      return;
    } else if(Object.keys(this.readyPlayers).length < Object.keys(this.playersInvolved).length) {
      console.log('not everyone is ready');
      return;
    } else if(Object.keys(this.losingPlayers).length < 1 || Object.keys(this.winningPlayers).length < 1) {
      console.log('need at least one winner and one loser');
      return;
    }
    if(Object.keys(this.readyPlayers).length === Object.keys(this.playersInvolved).length && Object.keys(this.unsignedPlayers).length === 0){
      console.log('everyone up and running lets finish!');
      console.log(new Date());
      this.updatePlayerRatings();
    }
  }
  this.updatePlayerRatings = () => {
    this.finishTime = new Date();

    console.log('winners \n', this.winningPlayers, 'losers \n', this.losingPlayers);
    let winners = Object.keys(this.winningPlayers).map((id) => { return this.winningPlayers[id].stats });
    let losers = Object.keys(this.losingPlayers).map((id) => { return this.losingPlayers[id].stats });

    var matches = [];
    matches.push([
      winners[0], losers[0], 1
    ])
    ladder.ranking.updateRatings(matches);
    ladder.removeExistingGame(this.gameId);


    var gameData = {
      times: {creationTime: this.creationTime, finishTime: this.finishTime},
      winners: Object.keys(this.winningPlayers).map((id) => { return this.winningPlayers[id].name }),
    losers: Object.keys(this.losingPlayers).map((id) => { return this.losingPlayers[id].name })
  };

    for (let id in this.playersInvolved) {
      if (this.playersInvolved.hasOwnProperty(id)) {
        this.playersInvolved[id].recordGame(gameData);
        this.playersInvolved[id].refreshStats(this.playersInvolved[id].getData());
        ladder.savePlayerChanges(this.playersInvolved[id]);
      }
    }
    ladder.saveGame(gameData);
    ladder.sendLeaderboard();
  }
}



module.exports = Game;
