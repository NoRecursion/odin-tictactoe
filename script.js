function Player(name){
    let score = 0;
    let piece;

    function incrementScore(){
        score++;
    }

    function resetScore(){
        score = 0;
    }

    return {
        get name(){return name},
        set name(dummy){throw Error("Can't reset player name")},
        get score(){return score},
        set score(dummy){throw Error("Can't directly set player score")},
        piece,
        incrementScore,
        resetScore,
    };
}

function Board(){
    const board = Array.from({length: 3}, () => Array(3).fill(null));

    function placeHard(piece,y,x){
        board[y][x] = piece;
    }

    function placeSafe(piece,y,x){
        if(board[y][x]!=null){throw Error("That location is occupied");}
        placeHard(piece,y,x)
    }
    
    function checkWin(argBoard = board){

        for(let i=0; i<3;i++){
            const piece = argBoard[i][0];
            if(piece == null){continue;}
            else if (piece==argBoard[i][1] && piece==argBoard[i][2]){
                return [piece,'r',i];
            }
        }

        for(let i=0; i<3;i++){
            const piece =argBoard[0][i];
            if( piece == null){continue;}
            else if (piece==argBoard[1][i] && piece==argBoard[2][i]){
                return [piece, 'c',i]
            }
        }

        {
            const piece = argBoard[0][0];
            if( piece == null){;}
            else if (piece==argBoard[1][1] && piece==argBoard[2][2]){
                return [piece,'d',0];
            }
        }

        {
            const piece = argBoard[0][2];
            if( piece == null){;}
            else if (piece==argBoard[1][1] && piece==argBoard[2][0]){
                return [piece,'d',1];
            }
        }


        return false
    }

    return {
        get state(){return structuredClone(board)},
        set state(dummy){throw Error("Can't set board state")},
        placeSafe,
        placeHard,
        checkWin,
    }
}

function GameController(board, p1,p2){
    let gameOver = false
    let turn = 0;
    p1.piece = 0;
    p2.piece = 1;
    const players = [p1, p2];

    function play(y,x){
        if(gameOver){throw Error("Game is finished. Reset the board");}

        const p = players[turn%2];
        board.placeSafe(p.piece,y,x);

        const winStatus = board.checkWin();

        gameOver = Boolean(winStatus);

        if(!gameOver){turn++;}

        return winStatus;
    }

    function resetBoard(){
        gameOver=false;
        board = Board();
    }

    function consolePlay(){

        
        for(let __turn=0;__turn<9;__turn++){
            const state = board.state;
            for(let i=0;i<3;i++){
                console.log(state[i]);
            }

            let loc= prompt("Where do you play?").split(' ').map((e)=>Number(e));

            play(loc[0], loc[1]);

            if(gameOver){break;}
        }
    }

    return {
        consolePlay
    }
}

const g = GameController(Board(),Player("a"),Player("b"));
g.consolePlay()
