const gameArea = document.querySelector(".main");
const rock = document.querySelector(".choice__rock");
const paper = document.querySelector(".choice__paper");
const scissor = document.querySelector(".choice__scissor");

const header = document.querySelector(".header");
const scoreNum = document.querySelector(".score__number");

const oppoTitle = document.querySelector('.opponents__result');

const exitBtn = document.querySelector('.exit__btn');
const rulesBtn = document.querySelector(".rules__button");
const rulesBoard = document.querySelector(".rules");
const showRulesBoard = document.querySelector(".show__result_board");
const closeRules = document.querySelector(".close-btn");

const gameFooter = document.querySelector('.footer');

const resultBoard = document.querySelector(".result__board");
const oppoChoice = document.querySelector(".oppo__choice");
const yourChoice = document.querySelector(".your__choice");

const results = document.querySelector(".results");
const resultsHeading = document.querySelector(".results__heading");
const resultButton = document.querySelector(".results__button");

const joinPage = document.querySelector(".join");
const roomId = document.getElementById("room-id");

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
`;
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
`;

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
`;
rulesBtn.addEventListener("click", () => {
  rulesBoard.classList.toggle("show__rules_board");
  closeRules.style.cursor = "pointer";
});

closeRules.addEventListener("click", () => {
  rulesBoard.classList.toggle("show__rules_board");
});

let roomID;
let player1 = false;
let winner;
let player1Score = 0;
let player2Score = 0;

///Socket
const socket = io.connect( "https://rock-paper-scissor-six-gamma.vercel.app/", { secure: true, transports: [ "flashsocket","polling","websocket" ] } );

const createRoom = () => {
  player1 = true;
  roomID = Math.random().toString(36);
  socket.emit("createRoom", roomID);
  alert(`${roomID}`);
};

const joinRoom = () => {
  roomID = roomId.value;
  if (!roomID) {
    alert("Room Token is Required ");
    return joinPage.classList.add('flex');
  }

  socket.on('notValidToken', () => {
    return alert('Invalid Token..');
  })
  
  socket.on('roomFull', () => {
    alert('Max player reached !');
    return joinPage.classList.add('flex');
  })

  socket.emit("joinRoom", roomID);
};

socket.on("playersConnected", () => {
  joinPage.classList.add("none");
  header.classList.add("flex");
  gameArea.classList.add("grid");
  gameFooter.classList.add("flex");
});

const clickChoice = (rpschoice) => {
  let player;
  if (player1 == true) {
    player = "p1Choice";
  } else if (player1 == false) {
    player = "p2Choice";
  }

  gameArea.classList.add("none");
  resultBoard.classList.add("grid");
  if (rpschoice == "rock") {
    yourChoice.innerHTML = rockChoice;
    yourChoice.classList.toggle("increase-size");
  }
  if (rpschoice == "paper") {
    yourChoice.innerHTML = paperChoice;
    yourChoice.classList.toggle("increase-size");
  }
  if (rpschoice == "scissor") {
    yourChoice.innerHTML = scissorChoice;
    yourChoice.classList.toggle("increase-size");
  }

  const isNoneResultBoard = resultBoard.classList.contains("none");
  if (isNoneResultBoard) {
    resultBoard.classList.remove("none");
    resultBoard.classList.add("grid");
    resultBoard.classList.add("after-choosing");
  }

  socket.emit(player, {
    rpschoice: rpschoice,
    roomID: roomID,
  });

};

const displayResult = (choice) => {
  results.classList.remove("none");
  results.classList.add("grid");
 
  oppoChoice.classList.remove("waiting_to_chose");
  if (choice == "rock") {
    oppoChoice.innerHTML = rockChoice;
    oppoChoice.classList.toggle("increase-size");
  }
  if (choice == "paper") {
    oppoChoice.innerHTML = paperChoice;
    oppoChoice.classList.toggle("increase-size");
  }
  if (choice == "scissor") {
    oppoChoice.innerHTML = scissorChoice;
    oppoChoice.classList.toggle("increase-size");
  }
};

socket.on("p1Choice", (data) => {
  if (!player1) {
    console.log('p1Choice');
    displayResult(data.rpsValue);
    oppoTitle.innerText = "OPPO PICKED";
    oppoChoice.classList.remove("waiting_to_chose");
  }
});

socket.on("p2Choice", (data) => {
  if (player1) {
    console.log('p2Choice');
    displayResult(data.rpsValue);
    oppoTitle.innerText = "OPPO PICKED";
    oppoChoice.classList.remove("waiting_to_chose");
  }
});

const updateScore = (p1Score, p2Score) => {
  if(player1){
    scoreNum.innerText = p1Score;
  }

  if(!player1){
    scoreNum.innerText = p2Score;
  }
  
}

socket.on("winner", data => {
  winner = data;
  if (data == "draw") {
    resultsHeading.innerText = "DRAW";
  } else if (data == "p1") {
    if (player1) {
      resultsHeading.innerText = "YOU WIN";
      resultButton.style.color = "#0D9276";
      yourChoice.classList.add("winner");
      player1Score = player1Score + 1;
      updateScore(player1Score, player2Score) 
    } else {
      resultsHeading.innerText = "YOU LOSE";
      resultButton.style.color = "#FF004D";
      oppoChoice.classList.add("winner");
    }
  } else if (data == "p2") {
    if (!player1) {
      resultsHeading.innerText = "YOU WIN";
      resultButton.style.color = "#0D9276";
      yourChoice.classList.add("winner");
      player2Score = player2Score + 1;
      updateScore(player1Score, player2Score); 
    } else {
      resultsHeading.innerText = "YOU LOSE";
      resultButton.style.color = "#FF004D";
      oppoChoice.classList.add("winner");
    }
  }
  
  resultBoard.classList.add("after-choosing");
  results.classList.remove("none");
  results.classList.add("grid");
});

const returnToGame = () => {
  player1Score = 0;
  player2Score = 0;
  resultBoard.classList.remove("grid");
  resultBoard.classList.add("none");
  resultBoard.classList.remove("after-choosing");
  //results
  results.classList.remove("grid");
  results.classList.add("none");
  //choice
  yourChoice.innerHTML = "";
  yourChoice.classList.toggle("increase-size");
  oppoChoice.innerHTML = "";
  oppoChoice.classList.toggle("increase-size");
  //main game area
  gameArea.classList.remove("none");
  gameArea.classList.add("grid");
  //OPPO choice
  oppoTitle.innerText = 'Choosing...';
  oppoChoice.classList.add('waiting_to_chose');
};

const removeWinner = () => {

  if(oppoChoice.classList.contains('winner') || yourChoice.classList.contains('winner')){
    oppoChoice.classList.remove("winner");
    yourChoice.classList.remove("winner");
  }

};

const playAgain = () => {
  socket.emit("playerClicked", {
    roomID: roomID,
    player1: player1,
  });
  removeWinner();
  returnToGame();
};

socket.on("playAgain", () => {
  removeWinner();
  returnToGame();
});

const returnToLogin = () => {
  joinPage.classList.remove("none");
  joinPage.classList.add('flex');
  header.classList.remove("flex");
  header.classList.add("none");
  gameArea.classList.remove("grid");
  gameArea.classList.add("none");
  gameFooter.classList.remove("flex");
  gameFooter.classList.add("none");
  resultBoard.classList.remove("grid");
  resultBoard.classList.add("none");
}

const exitGame =  () => {
  socket.emit('exitGame', {roomID : roomID, player : player1});
  returnToLogin();
};

socket.on('player1Left', () => {
  if(!player1){
    alert('player 1 left')
    returnToLogin();
  }
})

socket.on('player2Left', () => {
  if(player1){
    alert('player 2 left')
    returnToLogin();
  }
})



