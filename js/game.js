'use strict';
function Ranking(googleData) {
  const io = window.io('http://10.10.1.99:3003', {secure: true, reconnection: false});
  const tableContainer = document.getElementById('main-content');
  const sideContent = document.getElementById('side-content');
  this.player = {id: googleData.id, name: googleData.displayName};
  this.allGames = {};

  io.emit('initial-google-data', googleData);
  io.on('initial-ranking-data', (data) => {
    const rating = data.playerRating;

  this.showPlayerRating(~~rating);
  this.addInitialSessions(data.gamesInProgress);
  this.createNewGameButton();
});
  io.on('new-game-created', (data) => {
  this.createNewGameTab(data);
});
  io.on('existing-game-timeout', (id) => {
    this.removeGameTab(id);
});
  io.on('player-joined-game', (data) => {
    var gameTab = $('#' + data.gameId);
})
  io.on('join-game-denied', (data) => {
});
  io.on('players-involved-update', (data) => {
    this.updatePlayersState(data);
})
  io.on('update-ratings', (data) => {
    this.drawAndUpdateRatings(data);
});

  this.createNewGameButton = () => {
    const button = document.getElementById('new-game');
    button.className = 'new-game';
    const text = document.createElement('h4');
    text.style['margin-top'] = '15px';
    text.appendChild(document.createTextNode('NEW GAME'));
    button.appendChild(text)
    button.addEventListener('click', () => {
      io.emit('initiate-new-session', {});
    button.className = 'new-game clicked'
    setTimeout(()=>{
      button.className = 'new-game';
  }, 150)
  });
  }
  this.updatePlayersState = (data) => {
    const game = this.allGames[data.gameId];
    game.clearPlayerList();

    for (let i = 0; i < data.playersInvolved.winners.length; i++) {
      const player = data.playersInvolved.winners[i];
      game.addPlayer({name: player.name, ready: player.ready, rating: player.rating.toFixed(1), win: player.win});
    }
    for (let i = 0; i < data.playersInvolved.losers.length; i++) {
      const player = data.playersInvolved.losers[i];
      game.addPlayer({name: player.name, ready: player.ready, rating: player.rating.toFixed(1), win: player.win});
    }
    for (let i = 0; i < data.playersInvolved.unsigned.length; i++) {
      const player = data.playersInvolved.unsigned[i];
      game.addPlayer({name: player.name, ready: player.ready, rating: player.rating.toFixed(1), win: player.win});
    }

  }
  this.showPlayerRating = (mmr) => {
    const rating = document.createElement('h4');
    rating.appendChild(document.createTextNode('MMR: ' + mmr));
    rating.style.display = 'inline-block';
    document.getElementById('rating').appendChild(rating);
  }

  this.addInitialSessions = (data) => {
    const mainContent = $('#main-content');
    mainContent.on('click', '.join_game', function(event){
      const gameId = event.target.offsetParent.id;
      io.emit('player-join-game', {gameId})
    });
    mainContent.on('click', '.win_game', function(event){
      const gameId = event.target.offsetParent.id;
      io.emit('player-win-game', {gameId})
    });
    mainContent.on('click', '.lose_game', function(event){
      const gameId = event.target.offsetParent.id;
      io.emit('player-lose-game', {gameId})
    });
    mainContent.on('click', '.ready_button', function(event){
      const gameId = event.target.offsetParent.id;
      io.emit('player-is-ready', {gameId});
    });
    mainContent.on('click', '.abort_game', function(event){
      const gameId = event.target.offsetParent.id;
      io.emit('player-abort-game', {gameId});
    });
    mainContent.on('click', '.leave_game', function(event){
      const gameId = event.target.offsetParent.id;
      io.emit('player-leave-game', {gameId});
    });
    for(let i in data){
      this.createNewGameTab(data[i]);
    }
  }
  this.removeGameTab = (id) => {
    const el = document.getElementById(id);
    el.parentNode.removeChild(el);
  }
  this.createNewGameTab = (data) => {
    console.log('createNewGameTab', data)
    const game = new Game(data.gameId, {name: data.hostName || 'Oops, something went wrong'});
    console.log({game})
    this.allGames[data.gameId] = game;
    const element = game.createEmptyGameElement().hide();
    $('#main-content').append(element);

    this.updatePlayersState(data);
    element.show();
  }

  this.drawAndUpdateRatings = (data) => {
    let hiddenElements = 0;
    $(sideContent).empty();
    data.sort(function(a,b) {return (b.rating > a.rating) ? 1 : ((a.rating > b.rating) ? -1 : 0);} );
    for(let i = 0; i < data.length; i++){
      if (data[i].rating !== 1500) {
        let element = this.makeLeaderboardElement(data[i]);
        sideContent.appendChild(element);
      }
      else {
        hiddenElements++;
      }
    }
    if (hiddenElements > 0) {
      let element = document.createElement('div');
      element.className = 'leader-item';
      let textNode = document.createElement('h4');
      textNode.style.color = 'rgba(0, 0, 0, 0.45)';
      let textContent = hiddenElements + ' more players with 1500 rating';
      textNode.textContent = textContent;
      element.appendChild(textNode);
      sideContent.appendChild(element);
    }
  }
  this.makeLeaderboardElement = (player_data) => {
    let element = document.createElement('div');
    element.className = 'leader-item';
    let nameNode = document.createElement('h4');
    let name = document.createTextNode(player_data.name);
    let ratingNode = document.createElement('h4');
    let rating = document.createTextNode(player_data.rating.toFixed(1));

    ratingNode.appendChild(rating);
    nameNode.appendChild(name);

    element.appendChild(nameNode);
    element.appendChild(ratingNode)

    return element;
  }
}

function Game(id, creator) {
  this.createEmptyGameElement = function () {
    this.$game = $('<div gameId="' + id + '"></div>').addClass('game_container border').attr('id', id);
    var headerText = 'GAME#' + id;
    this.$game.html(
        '<div class="game_header border">' +
        '<div class="game_title">' + headerText + ' hosted by: ' + creator.name + '</div>' +
        '<div class="abort_game"><i class="fa fa-close" aria-hidden="true"></i></div>' +
        '</div>' +
        '<div class="game_main">' +
        '<div class="player_list border">' +
        '<div class="list_header">' +
        '<div class="list_item list_name">NAME</div>' +
        '<div class="list_item list_ready">RDY</div>' +
        '<div class="list_item list_rating">RATING</div>' +
        '</div>' +
        '<div class="list_content">' +

        '</div>' +
        '</div>' +
        '<div class="button_container">' +
        '<div class="join_controls button_inner_container">' +
        '<div class="join_game button_alternate"><i class="fa fa-check" aria-play="true"> join</i></div>' +
        '<div class="leave_game button"><i class="fa fa-eject" aria-hidden="true"> leave</i></div>' +
        '</div>' +
        '<div class="win_controls button_inner_container">' +
        '<div class="win_game button_alternate"><i class="fa fa-smile-o" aria-hidden="true"> grand slam</i></div>' +
        '<div class="lose_game button"><i class="fa fa-meh-o" aria-hidden="true"> thrashing</i></div>' +
        '</div>' +
        '<div class="ready_controls button_inner_container">' +
        '<div class="ready_button button"><i class="fa fa-flag-checkered" aria-hidden="true"> ready</i></div>' +
        '</div>' +
        '</div>' +
        '</div>'
    );
    return this.$game;
  };
  this.clearPlayerList = function() {
    $('#' + id + ' .list_content').empty();
  }
  this.addPlayer = function(player) {
    var newPlayer = $('<div></div>').addClass('list_row');
    var ready = $('<i class="fa" aria-hidden="true"></i>');
    player.ready ? ready.addClass('fa-circle').css('color', '#ffd12f') : ready.addClass('fa-circle-o').css('color', '#8c701d');
    let color = '#ffffff';
    if(player.win === true){
      color = '#499a3d';
    } else if(player.win === false) {
      color = '#ce3744';
    }
    newPlayer.append($('<div></div>').addClass('list_item list_name').text(player.name).css('color', color));
    newPlayer.append($('<div></div>').addClass('list_item list_ready').html(ready));
    newPlayer.append($('<div></div>').addClass('list_item list_rating').text(player.rating));


    $('#' + id + ' .list_content').append(newPlayer);
  };
}
