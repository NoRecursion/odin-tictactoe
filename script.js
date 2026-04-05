function Player(name, piece){
    let score = 0;
    piece = piece.toLowerCase()

    function incrementScore(){
        score++;
    }

    function resetScore(){
        score = 0;
    }

    return {
        get name(){return name},
        set name(dummy){throw new Error("Can't reset player name")},
        get score(){return score},
        set score(dummy){throw new Error("Can't directly set player score")},
        piece,
        incrementScore,
        resetScore,
    };
}

function Board(){
    let board;
    function reset(){
        board = Array.from({length: 3}, () => Array(3).fill(null));
    }
    reset();

    function placeHard(piece,y,x){
        board[y][x] = piece;
    }

    function isEmpty(y,x){
        return board[y][x]===null
    }

    function placeSafe(player,y,x){
        if(!isEmpty(y,x)){throw new Error("That location is occupied");}
        if(player.piece===null){throw new Error(`${player.name} has no piece to play`)}
        placeHard(player.piece,y,x);
    }

    return {
        get state(){return structuredClone(board)},
        set state(dummy){throw new Error("Can't set board state")},
        reset,
        isEmpty,
        placeSafe,
        placeHard,
    };
}

function GameController(board, players){
    for(p of players){
        if(p.piece !== 'x' && p.piece !== 'o'){throw new Error(`${p.name} has an illegal piece ('x' or 'o'`)}
    }
    if(players[0].piece == players[1].piece){throw new Error(`Both players have the same piece`)}

    let gameOver = false;
    let turn = 0;

    function checkWin(argBoard = board.state){ //Optional argument for bot player to check possible futur states

        for(let i=0; i<3;i++){
            const piece = argBoard[i][0];
            if(piece === null){continue;}
            else if (piece===argBoard[i][1] && piece===argBoard[i][2]){
                return [piece,'row',i];
            }
        }

        for(let i=0; i<3;i++){
            const piece =argBoard[0][i];
            if( piece === null){continue;}
            else if (piece===argBoard[1][i] && piece===argBoard[2][i]){
                return [piece, 'column',i]
            }
        }

        {
            const piece = argBoard[0][0];
            if( piece === null){;}
            else if (piece===argBoard[1][1] && piece===argBoard[2][2]){
                return [piece,'diagonal',0];
            }
        }

        {
            const piece = argBoard[0][2];
            if( piece === null){;}
            else if (piece===argBoard[1][1] && piece===argBoard[2][0]){
                return [piece,'diagonal',1];
            }
        }

        if(turn === 8){return [null,'x',0];}

        return false;
    }

    function play(y,x){
        if(gameOver!==false){throw new Error("Game is finished. Reset the board");}

        const p = players[turn%2];
        board.placeSafe(p,y,x);

        gameOver = checkWin();

        if(gameOver===false){turn++;}

        return gameOver;
    }

    function resetGame(){
        gameOver=false;
        turn = 0;
        board.reset();
    }

    function botPlay(){ //TODO

    }
/*
    async function consolePlay(){

        const readline = require('readline');

        const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
        });

        const ask = (question) => {
        return new Promise((resolve) => {
            rl.question(question, (answer) => {
            resolve(answer);
            });
        });
        };

        let winstat
        
        for(let t=0;t<9;t++){
            const state = board.state;
            for(let i=0;i<3;i++){
                console.log(state[i]);
            }

            const inp = await ask("where to play? ");

            const loc= inp.split(' ').map((e)=>Number(e));

            winstat = play(loc[0], loc[1]);

            if(gameOver!==false){break;}
        }
        console.log(winstat);
        rl.close();
    }
*/
    return {
        //consolePlay,
        get gameOver(){return gameOver},
        set gameOver(dummy){throw new Error("Can't set gameController.gameOver")},
        play,
        checkWin,
        resetGame,
    };
}
/*
const foo = GameController(Board(),Player('a'),Player('b'))
foo.consolePlay()
*/

const DisplayController = (()=>{
    let players = [Player('player 1','x'), Player('player 2','o')];
    let board = Board();
    let gameController = GameController(board,players)

    const grid = document.querySelector("#play-area");
    let cells;

    function drawWinner(){
        const winState = gameController.gameOver;
        if (winState===false){return;}

        const winner = (()=>{
            const wonPiece = winState[0];
            for (p of players){
                if(p.piece === wonPiece){return p}
            }
        })()

        const winType = winState[1];
        const n = winState[2];

        console.log(`${winner.name} won!`);                                                                       // Delete maybe?

        const winLine = document.createElement("div");
        winLine.classList.add("win-line", winType);

        console.log(n);
        console.log(winType);
        switch (winState[1]){
            case "column":
                winLine.style.setProperty('grid-column', `${n + 1} / ${n + 2}`);
                break
            case "row":
                winLine.style.setProperty('grid-row', `${n + 1} / ${n + 2}`);
                break
            case "diagonal":
                winLine.style.setProperty(`transform`,`rotate(${45+90*n}deg)`);
                break
            default:
                throw new Error("Critical error: Illegal winstate")
        }

        grid.appendChild(winLine);
    }    

    function makeCellClick(y,x,cell){

        const clicker = function(e){
            if (!board.isEmpty(y,x)){return;}
            if (gameController.gameOver!==false){return;}

            gameController.play(y,x);

            const mark = board.state[y][x]
            const markDiv = document.createElement("div");
            markDiv.classList.add(`mark-${mark}`);
            cell.appendChild(markDiv);
            drawWinner()
        }

        return clicker
    }
    
    function addCell(y,x){
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.style.setProperty('grid-area', `${y + 1} / ${x + 1} / ${y+2} / ${x+2}`);

        cell.addEventListener("click", makeCellClick(y,x,cell));

        grid.appendChild(cell);
        return cell;
    }

    function resetCells(){
        grid.replaceChildren();
        cells = Array.from({length: 3}, () => Array(3).fill(null));

        for (let y=0; y<3;y++){
            for(let x=0; x<3; x++){
                cells[y][x] = addCell(y,x);
            }
        }
    }

    resetCells();

})()