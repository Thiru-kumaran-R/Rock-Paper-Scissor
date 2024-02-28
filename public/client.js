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
    <button class="choice__paper" >
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
    <button class="choice__rock">
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
    <button class="choice__scissor">
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
    rulesBoard.classList.add('show__rules_board');
    closeRules.style.cursor = 'pointer';
});

closeRules.addEventListener('click', () => {
    rulesBoard.classList.toggle('show__rules_board');
});

let roomID
let player1 = false;
let score = 0;

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
    joinPage.style.display = 'none';
    header.style.display = 'flex';
    gameArea.style.display = 'grid';
    rulesBtn.style.display = 'block';
});

const clickChoice = (rpschoice) => {
    let player;
    if(player1 == true){
        player = 'p1Choice';
    }else if(player1 == false){
        player = 'p2Choice'
    }
    gameArea.style.display = 'none';
    resultBoard.style.display = 'grid';
    oppoChoice.classList.toggle('waiting_to_chose');
    if(rpschoice == 'rock'){
        yourChoice.innerHTML = rockChoice;
        yourChoice.classList.add('increase-size');
    }
    if(rpschoice == 'paper'){
        yourChoice.innerHTML = paperChoice;
        yourChoice.classList.add('increase-size');
    }
    if(rpschoice == 'scissor'){
        yourChoice.innerHTML = scissorChoice;
        yourChoice.classList.add('increase-size');
    }

    socket.emit(player,  {
        rpschoice : rpschoice,
        roomID : roomID
    })
}

socket.on('p1Choice', data => {
    if(!player1){
        displayResult(data.rpsValue);
    }
});

socket.on('p2Choice', data => {
    if(player1){
        displayResult(data.rpsValue);
    }
})

socket.on('winner', data => {
    if(data == 'draw'){
        resultsHeading.innerText = 'DRAW';
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
    document.querySelector('.container').style.maxWidth = '1000px';
    oppoChoice.classList.toggle('waiting_to_chose');
    resultBoard.classList.toggle('after-choosing');
    results.style.display = 'grid';
    scoreNum.innerText = score;
})

// socket.on('p1Score', data => {
//     scoreNum.innerText = data.score;
//     joinPage.style.display = 'none';
//     header.style.display = 'flex';
//     gameArea.style.display = 'grid';
//     rulesBtn.style.display = 'block';
//     document.querySelector('.container').style.maxWidth = '700px';
//     resultBoard.classList.toggle('after-choosing');
//     resultBoard.style.display = 'none';
// })

// socket.on('p2Score', data => {
//     scoreNum.innerText = data.score;
//     joinPage.style.display = 'none';
//     header.style.display = 'flex';
//     gameArea.style.display = 'grid';
//     rulesBtn.style.display = 'block';
//     document.querySelector('.container').style.maxWidth = '700px';
//     resultBoard.classList.toggle('after-choosing');
//     resultBoard.style.display = 'none';
// })

const playAgain = () => {
    const player = player1 ? 'p1Score' : 'p2Score';
    socket.emit(player, {score : score, roomID : roomID, player1 : player1})
}

const displayResult = (choice) => {
    oppoChoice.classList.toggle('waiting_to_chose');
    document.querySelector('.opponents__result').innerText = 'OPPO PICKED';
    if(choice == 'rock'){
        oppoChoice.innerHTML = rockChoice;
        oppoChoice.classList.add('increase-size');
    }
    if(choice == 'paper'){
        oppoChoice.innerHTML = paperChoice;
        oppoChoice.classList.add('increase-size');
    }
    if(choice == 'scissor'){
        oppoChoice.innerHTML = scissorChoice;
        oppoChoice.classList.add('increase-size');
    }
}