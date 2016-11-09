const width = 100;
const height = 100;
const deathLimit = 3;
const birthLimit = 4;
const chanceToStayAlive = 0.45;
const initialSimulationSteps = 3;
const startingNodeRange = 20;



const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");

let currentMap = generateNewMap(width, height);

console.time('map generated in');
setInitialMapValues(currentMap);
for(let i = 0; i < initialSimulationSteps; i++) {
  currentMap = doSimulationStep(currentMap);
}
drawMap(currentMap);
console.timeEnd('map generated in');
floodCheck(currentMap);


function doSimulationStep(oldMap) {
  // let newMap = generateNewMap(width, height);

  for (let x = 0; x < oldMap.length; x++) {
    for(let y = 0; y < oldMap[0].length; y ++) {
      const nbs = countAliveNeighbors(oldMap, x, y);
      if(oldMap[x][y] == true){ //swap true with false in all checks and u get a maze
        if(nbs <= deathLimit){
          oldMap[x][y] = false;
        }
      }
      else{
        if(nbs > birthLimit){
          oldMap[x][y] = true;
        }
      }
    }
  }
  return currentMap;
}

function floodCheck(map) {
  console.time('flood check completed in');
  let mapCopy = map.map((arr)=> {
    return arr.slice();
  });
  const targetValue = false;
  let Q = [];
  const startingNode = getStartingNode(map);
  Q.push(startingNode);
  for(let i = 0; i < Q.length; i ++) {
    let node = Q[i];
    let w = Object.assign({}, node);
    let e = Object.assign({}, node);

    while(mapCopy[w.x-1] && mapCopy[w.x-1][w.y] === targetValue) {
        --w.x;
    }
    while(mapCopy[e.x+1] && mapCopy[e.x+1][e.y] === targetValue) {
        ++e.x;
    }
    for(let i = w.x; i <= e.x; i++) {
      mapCopy[i][w.y] = !targetValue;
      if(mapCopy[i][w.y-1] === targetValue) {
        Q.push({x: i, y: w.y-1});
      }
      if(mapCopy[i][w.y+1] === targetValue) {
        Q.push({x: i, y: w.y+1});
      }
    }
  }
  console.timeEnd('flood check completed in');
  let tileCount = 0;
  for(let i = 0; i < map.length; i ++) {
      for(let j = 0; j < map[0].length; j ++) {
          if (map[i][j] === targetValue) {
            tileCount++;
          }
      }
  }
  let floodCount = 0;
  for(let i = 0; i < mapCopy.length; i ++) {
    for(let j = 0; j < mapCopy[0].length; j ++) {
      if (mapCopy[i][j] === targetValue) {
        floodCount++;
      }
    }
  }
  const regionQuality = (tileCount-floodCount) / tileCount * 100;
  console.log('reqionQuality', regionQuality.toFixed(2) + '%');
}

function getStartingNode(map) {
  const targetValue = false;
  let node = {x: width / 2, y: height / 2};
  while (map[node.x][node.y] !== targetValue) {
    node = {
      x: width / 2 + ~~((Math.random() * 2 * startingNodeRange) - startingNodeRange),
      y: height / 2 + ~~((Math.random() * 2 * startingNodeRange) - startingNodeRange)
    };
  }
  return node;
}

function setInitialMapValues(map) {
  for (let i = 0; i < map.length; i++) {
    for(let j = 0; j < map[0].length; j ++) {
      map[i][j] = Math.random() < chanceToStayAlive ? true : false;
    }
  }
}


function generateNewMap(width, height) {
  let map = [];

  for (let i = 0; i < width; i++) {
    map[i] = [];
    for(let j = 0; j < height; j ++) {
      map[i][j] = false;
    }
  }
  return map;
}

function countAliveNeighbors(map, x, y) {
  let count = 0;
  for(let i=-1; i<2; i++){
    for(let j=-1; j<2; j++){
      let neighbour_x = x+i;
      let neighbour_y = y+j;
      if(i == 0 && j == 0){

      }
      else if(neighbour_x < 0 || neighbour_y < 0 || neighbour_x >= map.length || neighbour_y >= map[0].length){
        count = count + 1;
      }
      else if(map[neighbour_x][neighbour_y] === true){
        count = count + 1;
      }
    }
  }
  return count;
}

function drawMap (mapToDraw) {
  mapToDraw.forEach((row, x) => {
    row.forEach((cell, y)=> {
      ctx.fillStyle = cell == true ? 'blue' : 'green';
      ctx.fillRect(x*10, y*10, 10, 10);
    });
  });
}

function buttonClick() {
  currentMap = doSimulationStep(currentMap);
  drawMap(currentMap);
}

