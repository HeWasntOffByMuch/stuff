"use strict"
module.exports = function Player(id, name, stats, history, ranking) {
    this.id = id;
    this.name = name;
    this.stats = stats;
    this.hostedGames = [];
    this.history = history || {
        gameHistory: [],
        totalGamesPlayed: 0
    };

    this.recordGame = (gameData) => {
        this.history.gameHistory.push(gameData);
        this.history.totalGamesPlayed++;
    };

    this.refreshStats = (data) => {
        console.log('new stats for player', data);
        this.stats = ranking.makePlayer(data.rating, data.rd, data.vol);
        this.history = data.history;
    }

    this.getData = () => ({
        id: this.id,
        name: this.name,
        rating: this.stats.getRating(),
        rd: this.stats.getRd(),
        vol: this.stats.getVol(),
        history: this.history
    });
}
