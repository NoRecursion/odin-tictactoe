function shuffle(arr) { //Fisher-Yates
    for (let i = arr.length-1; i > 0; i--) {
        const j = Math.floor(Math.random()*(i+1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function Player(name, piece){
    let score = 0;
    piece = piece.toLowerCase()

    function incrementScore(){
        score++;
    }

    function resetScore(){
        score = 0;
    }

    function setName(newName){
        name = newName;
    }

    return {
        get name(){return name},
        set name(dummy){throw new Error("Use setName to reassign name")},
        get score(){return score},
        set score(dummy){throw new Error("Can't directly set player score")},
        piece,
        incrementScore,
        resetScore,
        setName,
    };
}

function Board(){
    let board;

    function reset(){
        board = Array.from({length: 3}, () => Array(3).fill(null));
    }

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

    reset();

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
    let round = 1;

    function whosTurn(){
        return (round+turn-1)%2;
    }

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

        const p = players[whosTurn()];
        board.placeSafe(p,y,x);

        gameOver = checkWin();

        if(gameOver===false){turn++;}

        return gameOver;
    }

    function resetRound(){
        gameOver=false;
        turn = 0;
        board.reset();
    }

    function nextRound(){
        resetRound();
        round++;
    }

    return {
        turn,
        round,
        get gameOver(){return gameOver},
        set gameOver(dummy){throw new Error("Can't set gameController.gameOver")},
        get board(){return board.state},
        get players(){return structuredClone(players)},
        play,
        checkWin,
        nextRound,
        whosTurn,
    };
}

function Bot(gameController){
    const corners = [[0,0],[0,2],[2,0],[2,2]]
    const center = [[1,1]]
    const edges = [[0,1],[1,0],[1,2],[2,2]]
    const moveSet = [corners,center,edges]

    function predictWin(piece){
        let board = gameController.board;
        let winq;

        for(let y=0; y<3; y++){
            for(let x=0; x<3; x++){
                if(board[y][x]!==null){continue;}

                board[y][x] = piece;

                winq = gameController.checkWin(board);
                if(winq !== false){return [y,x];}

                board[y][x] = null;
            }
        }
        return null;
    }

    function shuffleMoves(){
        shuffle(corners);
        shuffle(edges);
    }

    function normalMove(){
        for(const zone of moveSet){
            for(const [y,x] of zone){
            }
        }
    }



}

const DisplayController = (()=>{
    let players = [Player('Player 1','x'), Player('Player 2','o')];
    let playerBoxes;
    let board = Board();
    let gameController = GameController(board,players)

    const root = document.querySelector(":root")
    const grid = document.querySelector("#play-area");
    let cells;

    function paintPlayerBoxes(){
        for(let i=0;i<2;i++){
            p = players[i];
            box = playerBoxes[i];
            box.name.textContent = p.name;
            box.score.textContent = `Score: ${p.score}`
        }
    }

    function setupNameBtn(btn,i){
        let touched = false;

        btn.addEventListener("click", (e)=>{
            if(touched){return;}
            touched = true;
            btn.replaceChildren();
            btn.classList.remove("edit-me");
        })
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // stops a newline from being inserted
                btn.blur();
            }
        });
        btn.addEventListener('blur', () => {
            let name = btn.textContent.trim();
            if(name===''){name = `Player ${i+1}`}
            players[i].setName(name)
            paintPlayerBoxes();
        });
    }

    function setUpMarkBtn(mark, piece){
        const inp = mark.querySelector("input[type='color']");
        inp.value = getComputedStyle(root).getPropertyValue(`--${piece}-color`);

        mark.addEventListener("input",(e)=>{
            root.style.setProperty(`--${piece}-color`,inp.value);
        })

        mark.addEventListener("click",(e)=>{
            inp.click();
        })
    }

    function initializePlayerBoxes(){
        playerBoxes = [document.querySelector("#p1-box"), document.querySelector("#p2-box")];

        for(let i=0; i<2; i++){
            const box = playerBoxes[i];

            let name = box.querySelector(".name");
            let score = box.querySelector(".score");
            let myTurn = box.querySelector(".turn-marker");

            let mark = box.querySelector(".mark-x");
            let piece;
            if (mark !== null){piece = 'x';}
            else {
                mark = box.querySelector(".mark-o");
                piece = 'o';
            }  
            setUpMarkBtn(mark,piece);



            Object.assign(box, {name, score, myTurn, mark, piece});
            setupNameBtn(name,i);
        }
    }

    function paintWhosTurn(){
        const playing = gameController.whosTurn();
        const waiting = (playing+1)%2;
        playerBoxes[waiting].myTurn.classList.add("hidden");

        if (gameController.gameOver===false){
            playerBoxes[playing].myTurn.classList.remove("hidden");
        }
        else{
            playerBoxes[playing].myTurn.classList.add("hidden");
        }
    }

    function drawWinner(){
        const winState = gameController.gameOver;
        if (winState===false){return;}

        if (winState[0]===null){
            console.log("draw!");
            paintPlayerBoxes();
            return;
        }

        const winner = (()=>{
            const wonPiece = winState[0];
            for (p of players){
                if(p.piece === wonPiece){return p}
            }
        })()

        winner.incrementScore();
        const winType = winState[1];
        const n = winState[2];

        console.log(`${winner.name} won!`);                                                                       // Delete maybe?

        const winLine = document.createElement("div");
        winLine.classList.add("win-line", winType);

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
        paintPlayerBoxes();
        grid.appendChild(winLine);
        return;
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
            paintWhosTurn();
            drawWinner();
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

    initializePlayerBoxes()
    resetCells();

    let inplay = true;
    grid.addEventListener("click",(e)=>{
        if(gameController.gameOver===false){
            inplay = true;
            return;
        }
        if(inplay){
            inplay=false;
            return;
        }
        gameController.nextRound();
        resetCells();
        paintWhosTurn();
    })
})()