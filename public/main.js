const rock  = document.querySelector('.choice__rock');
const paper  = document.querySelector('.choice__paper');
const scissor  = document.querySelector('.choice__scissor');

const rulesBtn = document.querySelector('.rules__button');
const rulesBoard = document.querySelector('.rules');
const showRulesBoard = document.querySelector('.show__result_board')
const closeRules = document.querySelector('.close-btn');

rulesBtn.addEventListener('click', () => {
    rulesBoard.classList.add('show__rules_board');
    closeRules.style.cursor = 'pointer';
});

closeRules.addEventListener('click', () => {
    rulesBoard.classList.toggle('show__rules_board');
});