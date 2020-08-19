
const MINESWEEPER_CONFIG = {
    boardSize: 15,
    bombOccurance: 47
};

// Generate Bomb Locations as 2d matrix
let generateBombLocations = function(bombCount, boardSize){
    let bombLocations = [];
    for (let i = 0; i <= bombCount -1; i++ ) {
        let x = Math.floor(Math.random()*boardSize), y = Math.floor(Math.random()*boardSize);
        let exist = bombLocations.filter((bomb) => bomb[0] === x && bomb[1] === y);
        // Only insert if doesnt exist
        if (exist.length < 1) {
            bombLocations.push([x, y]);
        }
    }
    return bombLocations;
}

// Generate Rows
let generateRow = function(count){
    let row = document.createElement('div');
    row.setAttribute('row-id', count);
    return row;
}

// Generate Columns
let generateColumn = function(rowCount, columnCount){
    let wrapper = document.createElement('div'), column = document.createElement('div');
    wrapper.className = 'column-wrapper';
    column.className = 'column';
    let proxyCount = evaluateProximity(rowCount, columnCount)
    let hasBomb = containsBomb(rowCount, columnCount)
    column.innerHTML = (!hasBomb) ? '' : '';
    column.setAttribute('col-id', columnCount);
    column.setAttribute('row', rowCount);
    column.setAttribute('bomb', hasBomb);
    column.setAttribute('proxy', proxyCount);
    column.setAttribute('location', rowCount + '-' + columnCount);
    wrapper.appendChild(column);
    wrapper.addEventListener('click', clickTile);
    return wrapper;
}

// Event handler for clicking tile
let clickTile = function(evt){
    let attrs = evt.target.attributes;
    if (attrs["bomb"] && attrs["bomb"].value === 'true') {
        resetGame("Bummer... Play Again?");
    } else {
        let col = attrs['col-id'].value;
        let row = attrs['row'].value;
        blowupNearbyTiles(parseInt(row), parseInt(col));
        const clickedLen = document.querySelectorAll('.column[clicked]').length;
        if (bombLocations.length + clickedLen === boardSize * boardSize ) {
            resetGame("Congratulations, you won!! Play Again?");
        }
    }
}

// Reset Game
let resetGame  = function(message) {
    displayBombs();
    setTimeout(() => {
        let playAgain = confirm(message);
        if (playAgain) {
            location.href = location.href;
        }
    }, 5)
}

// When user clicks bomb, display all bomb
let displayBombs  = function() {
    
    let bombs = document.querySelectorAll('.column[bomb="true"]');
    for(let bomb of bombs) {
        bomb.classList += " exploded";
    }
}

// WHen user clicks on tile that is an 'island' display other orphaned nodes
let blowupNearbyTiles = function(x, y){

    if (!arrayContains([x, y], blownUpTiles)) {

        console.log(`.column[location="${x}-${y}"]`);
        let column = document.querySelector(`.column[location="${x}-${y}"]`);
        let proximity = column.attributes["proxy"].value;
        column.innerHTML = (proximity !== "0") ? proximity : "";
        column.setAttribute('clicked', true);

        if (parseInt(proximity) == 0) {
            blownUpTiles.push([x, y]);

            let tiles = calculateAjacentTiles(x, y);
            // Remove Bombs
            let tilesToIterate = tiles.filter((tile) => !containsBomb(tile[0], tile[1]));
            // Remove already traversed nodes
            tilesToIterate = tilesToIterate.filter((tile) => !arrayContains(tile, blownUpTiles));
        
            for (let tile of tilesToIterate) {
                blowupNearbyTiles(tile[0], tile[1]);
            }
        }
    }

}

// Calculate ajacent cells for revealing safe zone
let calculateAjacentTiles = function(x, y){

    function _calculateAjacentYTiles(_x, _y) {
        let tempArray = [];
        for (let tempX of _x) {
            tempArray.push([tempX, _y]);
            if (y > 0)
                tempArray.push([tempX, _y - 1]);
            if (y < boardSize -1)
                tempArray.push([tempX, _y + 1]);
            
        }
        return tempArray;
    }   

    let _x = [];
    _x.push(x);
    if (x > 0)
        _x.push(x - 1);
    if (x < boardSize -1)
        _x.push(x + 1);
    return _calculateAjacentYTiles(_x, y);
}

// Logic for determining if this x,y is bomb location
let containsBomb = function(rowCount, columnCount){
    for (let bomb of bombLocations) {
        let [bombRow, bombCol] = bomb;
        if (bombRow === rowCount && bombCol === columnCount) {
            return true;
        }
    }
    return false;
}

// Utility function
let arrayContains = function([x, y], arr){
    for (let ele of arr) {
        let [eleX, eleY] = ele;
        if (eleX === x && eleY === y) {
            return true;
        }
    }
    return false;
}

// Eveluate which number (proximity value) displays in cell after user clicked
let evaluateProximity = function(y, x){
    let count = 0;
    for (let bomb of bombLocations) {
        let [by, bx] = bomb;
        if ((x === bx || x + 1 === bx || x - 1 === bx) && (y === by || y + 1 === by || y - 1 === by)) {
            count ++;
        }
    }
    return count;
}

// Initialize Globals
let boardSize = MINESWEEPER_CONFIG.boardSize;
let bombOccurance = MINESWEEPER_CONFIG.bombOccurance;
// Generate Bomb Locations
const bombLocations = generateBombLocations(bombOccurance, boardSize);
let blownUpTiles = [];
// Generate Board
for(let rowCount = 0; rowCount <=  boardSize -1; rowCount ++) {
    let rowElement = generateRow(rowCount);
    for(let columnCount = 0; columnCount <=  boardSize -1; columnCount ++) {
        let columnElement = generateColumn(rowCount, columnCount);
        rowElement.appendChild(columnElement);
    }
    let board = document.querySelector('.ms-board');
    board.appendChild(rowElement);
}
