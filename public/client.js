const gameArea = document.querySelector('.main');
const rock  = document.querySelector('.choice__rock');
const paper  = document.querySelector('.choice__paper');
const scissor  = document.querySelector('.choice__scissor');

const header = document.querySelector('.header');

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

let roomID
let player1 = false;
let playerChoice ;
let winnerPlayer;
let OpponentsChoice;
let score;

const socket = io();

const createRoom = () => {
    player1 = true;
    let token = new Date();
    token = token.getTime().toString();
    roomID = token;
    socket.emit('createRoom', token);
    alert(`Your room ID : ${token}`);
}

const joinRoom = () => {
    roomID = roomId.value;
    socket.emit('joinRoom', roomID);
}

socket.on('playersConnected', () => {
    joinPage.style.display = 'none';
    header.style.display = 'flex';
    gameArea.style.display = 'grid';
    rulesBtn.style.display = 'block';
});

const clickChoice = (choice) => {
    playerChoice = choice;
    const player = player1 ? 'p1Choice' : 'p2Choice';
    gameArea.style.display = 'none';
    resultBoard.style.display = 'grid';
    oppoChoice.classList.add('waiting_to_chose');
    if(choice === 'rock'){
        yourChoice.innerHTML = rockChoice;
        yourChoice.classList.add('increase-size');
    }
    if(choice === 'paper'){
        yourChoice.innerHTML = paperChoice;
        yourChoice.classList.add('increase-size');
    }
    if(choice === 'scissor'){
        yourChoice.innerHTML = scissorChoice;
        yourChoice.classList.add('increase-size');
    }

    socket.emit(player,  {
        player : player,
        choice : choice,
        roomID : roomID
    })
    console.log(choice)
    
}

socket.on('oppoChoice', oppChoice => {
    OpponentsChoice = oppChoice;
    if(oppChoice === 'rock'){
        oppoChoice.innerHTML = rockChoice;
        oppoChoice.classList.add('increase-size');
    }
    if(oppChoice === 'paper'){
        oppoChoice.innerHTML = paperChoice;
        oppoChoice.classList.add('increase-size');
    }
    if(oppChoice === 'scissor'){
        oppoChoice.innerHTML = scissorChoice;
        oppoChoice.classList.add('increase-size');
    }

    if(playerChoice === OpponentsChoice){
        resultsHeading.innerText = ' draw';
        resultButton.style.color = '#333';
    }
    if(playerChoice === 'rock' && OpponentsChoice === 'scissor'){
        winnerPlayer = true;
    }
    if(playerChoice === 'rock' && OpponentsChoice === 'paper'){
        winnerPlayer = false;
    }
    if(playerChoice === 'scissor' && OpponentsChoice === 'rock'){
        winnerPlayer = false;
    }
    if(playerChoice === 'scissor' && OpponentsChoice === 'paper'){
        winnerPlayer = false;
    }
    if(playerChoice === 'paper' && OpponentsChoice === 'rock'){
        winnerPlayer = true;
    }
    if(playerChoice === 'paper' && OpponentsChoice === 'scissor'){
        winnerPlayer = false;
    }

    if(winnerPlayer){
        score +=1;
        resultsHeading.innerText = 'you win';
        resultButton.style.color = '#A5DD9B';
    }else{
        resultsHeading.innerText = 'you lose';
        resultButton.style.color = '#FF004D';
    }
    resultBoard.classList.toggle('after-choosing');
    document.querySelector('.container').style.width = '1000px';
    results.style.display = 'grid';
})

rulesBtn.addEventListener('click', () => {
    rulesBoard.classList.add('show__rules_board');
    closeRules.style.cursor = 'pointer';
});

closeRules.addEventListener('click', () => {
    rulesBoard.classList.toggle('show__rules_board');
});