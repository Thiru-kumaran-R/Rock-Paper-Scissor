const gameArea = document.querySelector('.main');
const rock  = document.querySelector('.choice__rock');
const paper  = document.querySelector('.choice__paper');
const scissor  = document.querySelector('.choice__scissor');

const header = document.querySelector('.header');
const scoreNum = document.querySelector('.score__number');

const rulesBtn = document.querySelector('.rules__button');
const rulesBoard = document.querySelector('.rules');
const showRulesBoard = document.querySelector('.show__result_board');
const closeRules = document.querySelector('.close-btn');

const resultBoard = document.querySelector('.result__board');
const oppoChoice = document.querySelector('.oppo__choice');
const yourChoice = document.querySelector('.your__choice');

const results = document.querySelector('.results');
const resultsHeading = document.querySelector('.results__heading');
const resultButton = document.querySelector('.results__button');

const joinPage = document.querySelector('.join');
const roomId = document.getElementById('room-id');

const paperChoice = `
    <button class="choice__paper" onclick="clickChoice('paper')">
        <div class="choice">
            <img
              src="/icon-paper.svg"
              alt="Paper"
              class="choice__img"
            />
        </div>
    </button>
`
const rockChoice = `
    <button class="choice__rock" onclick="clickChoice('rock')">
        <div class="choice">
            <img 
                src="/icon-rock.svg" 
                alt="Rock" 
                class="choice__img"
            />
        </div>
    </button>
`

const scissorChoice = `
    <button class="choice__scissor" onclick="clickChoice('scissor')">
        <div class="choice">
            <img
                src="/icon-scissors.svg"
                alt="Scissor"
                class="choice__img"
            />
        </div>
    </button>
`
rulesBtn.addEventListener('click', () => {
    rulesBoard.classList.toggle('show__rules_board');
    closeRules.style.cursor = 'pointer';
});

closeRules.addEventListener('click', () => {
    rulesBoard.classList.toggle('show__rules_board');
});

let roomID
let player1 = false;
let score = 0;
let winner;

///Socket
const socket = io();

const createRoom = () => {
    player1 = true;
    roomID = Math.random().toString(36);
    socket.emit('createRoom', roomID);
    alert(`${roomID}`);
}

const joinRoom = () => {
    roomID = roomId.value;
    if(!roomID){
        alert('Enter token');
    }
    socket.emit('joinRoom', roomID);
}

socket.on('playersConnected', () => {
    joinPage.classList.add('none'); 
    header.classList.add('flex');
    gameArea.classList.add('grid');
    rulesBtn.classList.add('block');
});

const clickChoice = (rpschoice) => {
    let player;
    if(player1 == true){
        player = 'p1Choice';
    }else if(player1 == false){
        player = 'p2Choice'
    }
    gameArea.classList.add('none');
    resultBoard.classList.add('grid');
    if(rpschoice == 'rock'){
        yourChoice.innerHTML = rockChoice;
        yourChoice.classList.toggle('increase-size');
    }
    if(rpschoice == 'paper'){
        yourChoice.innerHTML = paperChoice;
        yourChoice.classList.toggle('increase-size');
    }
    if(rpschoice == 'scissor'){
        yourChoice.innerHTML = scissorChoice;
        yourChoice.classList.toggle('increase-size');
    }

    if(oppoChoice.innerHTML == ''){
        document.querySelector('.opponents__result').innerText = 'Choosing...';
        oppoChoice.classList.add('waiting_to_chose');
        oppoChoice.classList.remove('winner');
    }else if(oppoChoice.innerHTML != ''){
        document.querySelector('.opponents__result').innerText = 'OPPO PICKED';
        oppoChoice.classList.remove('waiting_to_chose');
    }

    const isNoneResultBoard =  resultBoard.classList.contains('none');
    if(isNoneResultBoard){
        resultBoard.classList.add('grid');
        resultBoard.classList.remove('none');
        resultBoard.classList.add('after-choosing');
        document.querySelector('.opponents__result').innerText = 'Choosing...';
        oppoChoice.classList.add('waiting_to_chose');
    }
    socket.emit(player,  {
        rpschoice : rpschoice,
        roomID : roomID
    })
}

socket.on('p1Choice', data => {
    document.querySelector('.opponents__result').innerText = 'OPPO PICKED';
    if(!player1){
        const isNoneResult = results.classList.contains('none');
        if(isNoneResult){
            results.classList.remove('none');
            results.classList.add('grid');
        }
        displayResult(data.rpsValue);
    }
});

socket.on('p2Choice', data => {
    document.querySelector('.opponents__result').innerText = 'OPPO PICKED';
    if(player1){
        const isNoneResult = results.classList.contains('none');
        if(isNoneResult){
            results.classList.remove('none');
            results.classList.add('grid');
        }
        displayResult(data.rpsValue);
    }
});

socket.on('waitingForPlayer', () => {
    document.querySelector('.opponents__result').innerText = 'Choosing...';
    oppoChoice.classList.add('waiting_to_chose');
})

socket.on('winner', data => {
    document.querySelector('.opponents__result').innerText = 'OPPO PICKED';
    winner = data;
    if(data == 'draw'){
        resultsHeading.innerText = 'DRAW';
        score += 0;
    }else if(data == 'p1'){
        if(player1){
            resultsHeading.innerText = 'YOU WIN';
            resultButton.style.color = '#0D9276';
            yourChoice.classList.add('winner');
            score +=1;
            
        }else{
            resultsHeading.innerText = 'YOU LOSE';
            resultButton.style.color = '#FF004D';
            oppoChoice.classList.add('winner');
        }  
    }else if(data == 'p2'){
        if(!player1){
            resultsHeading.innerText = 'YOU WIN';
            resultButton.style.color = '#0D9276';
            yourChoice.classList.add('winner');
            score +=1;
        }else{
            resultsHeading.innerText = 'YOU LOSE';
            resultButton.style.color = '#FF004D';
            oppoChoice.classList.add('winner');
        }  
    }
    oppoChoice.classList.remove('waiting_to_chose');
    resultBoard.classList.add('after-choosing');
    results.classList.add('grid');
    
    scoreNum.innerText = score;
})


const playAgain =  () => {    
    socket.emit('playerClicked', {score : score, roomID : roomID, player1 : player1});
    removeWinner();
    returnToGame();
};

socket.on('playAgain', data => {
    removeWinner();
    returnToGame(); 
})

const displayResult = (choice) => {
    oppoChoice.classList.remove('waiting_to_chose');
    document.querySelector('.opponents__result').innerText = 'OPPO PICKED';
    if(choice == 'rock'){
        oppoChoice.innerHTML = rockChoice;
        oppoChoice.classList.toggle('increase-size');
    }
    if(choice == 'paper'){
        oppoChoice.innerHTML = paperChoice;
        oppoChoice.classList.toggle('increase-size');
    }
    if(choice == 'scissor'){
        oppoChoice.innerHTML = scissorChoice;
        oppoChoice.classList.toggle('increase-size');
    }
}

const removeWinner = () => {
    const isWinnerP1 = yourChoice.classList.contains('winner');
    const isWinnerP2 = oppoChoice.classList.contains('winner');
    if(isWinnerP1){
        yourChoice.classList.remove('winner');
    }
    if(isWinnerP2){
        oppoChoice.classList.remove('winner');
    }
}

const returnToGame = () => {
    resultBoard.classList.remove('grid');
    resultBoard.classList.add('none');
    resultBoard.classList.remove('after-choosing');
    //results
    results.classList.remove('grid');
    results.classList.add('none');
    //choice
    yourChoice.innerHTML = '';
    yourChoice.classList.toggle('increase-size');
    oppoChoice.innerHTML = '';
    oppoChoice.classList.toggle('increase-size');
    //main game area
    gameArea.classList.remove('none');
    gameArea.classList.add('grid');
}