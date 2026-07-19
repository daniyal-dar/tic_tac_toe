// --- DOM Elements Setup ---
// Grabs the game cells and text fields from the HTML page
const boardCells = document.querySelectorAll('[data-cell-index]');
const statusText = document.getElementById('statusText');
const gameWrapper = document.getElementById('gameWrapper');

// Grabs all the pop-up boxes and operational buttons
const requestRestartButton = document.getElementById('requestRestartButton');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const gameOverMessage = document.getElementById('gameOverMessage');
const playAgainButton = document.getElementById('playAgainButton');

const confirmRestartOverlay = document.getElementById('confirmRestartOverlay');
const cancelRestartButton = document.getElementById('cancelRestartButton');
const confirmRestartButton = document.getElementById('confirmRestartButton');

// --- Pre-made Audio File Links ---
// This tells the browser exactly where to look for your audio tracks
const soundCellClick = new Audio('audio/cell_click.wav');
const soundButtonClick = new Audio('audio/button_click.wav');
const soundModalOpen = new Audio('audio/modal_open.wav');
const soundGameWin = new Audio('audio/game_win.wav');

// --- Game State Tracking Variables ---
let currentPlayer = 'X';
let boardState = ['', '', '', '', '', '', '', '', ''];
let isGameActive = true;

// A map of all possible lines of 3 to check who wins the game
const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical columns
  [0, 4, 8], [2, 4, 6]             // Diagonal lines
];

// Helper function to safely reset and play a sound from the beginning
function playSound(audioObject) {
  audioObject.currentTime = 0; // Rewinds sound to start (handles fast repeating clicks)
  audioObject.play().catch(error => {
    // Modern browsers sometimes block sound until the user clicks something first
    console.log("Audio playback waiting for user click interaction:", error);
  });
}

// --- Starting Point: Adding Event Triggers ---
function initializeGame() {
  // Listen for clicks on all 9 game board squares
  boardCells.forEach(cell => cell.addEventListener('click', handleCellClick));
  
  // Listen for clicks on operational UI buttons
  requestRestartButton.addEventListener('click', openRestartConfirmation);
  cancelRestartButton.addEventListener('click', closeRestartConfirmation);
  confirmRestartButton.addEventListener('click', resetGameBoardState);
  playAgainButton.addEventListener('click', resetGameBoardState);
}

// --- Logic for when a player clicks a board cell ---
function handleCellClick(event) {
  const cell = event.target;
  const cellIndex = cell.getAttribute('data-cell-index');

  // Stop everything if the square is already full or the game ended
  if (boardState[cellIndex] !== '' || !isGameActive) {
    return;
  }

  // Play our cell click sound file!
  playSound(soundCellClick);

  updateCellDisplay(cell, cellIndex);
  evaluateGameResults();
}

// Marks the grid array and displays the letter on screen
function updateCellDisplay(cell, index) {
  boardState[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase()); // Adds CSS style class 'x' or 'o'
}

// Evaluates if the current turn wins or draws the match
function evaluateGameResults() {
  let isMatchWon = false;

  // Loop through our map of winning lines
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const [a, b, c] = WINNING_COMBINATIONS[i];
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      isMatchWon = true;
      break;
    }
  }

  // If a player won, play win music and show the screen
  if (isMatchWon) {
    playSound(soundGameWin);
    showEndGameOverlay(`Player ${currentPlayer} Wins!`);
    isGameActive = false;
    return;
  }

  // Check if there are any empty spaces left on the board
  const isDraw = !boardState.includes('');
  if (isDraw) {
    playSound(soundButtonClick);
    showEndGameOverlay("It's a Draw!");
    isGameActive = false;
    return;
  }

  // Swap turn to the other player if no one won yet
  togglePlayerTurn();
}

// Switches turns back and forth
function togglePlayerTurn() {
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  const customSpan = `<span class="player-${currentPlayer.toLowerCase()}-highlight">${currentPlayer}</span>`;
  statusText.innerHTML = `Player ${customSpan}'s Turn`;
}

// --- Screen State Control (Modals & Popups) ---

// Displays the absolute final match winner card
function showEndGameOverlay(message) {
  playSound(soundModalOpen);
  gameOverMessage.textContent = message;
  gameWrapper.classList.add('blurred-background-active');
  gameOverOverlay.classList.add('visible');
}

// Opens the restart verification window mid-match
function openRestartConfirmation() {
  playSound(soundButtonClick);
  playSound(soundModalOpen);
  gameWrapper.classList.add('blurred-background-active');
  confirmRestartOverlay.classList.add('visible');
}

// Closes the restart verification window
function closeRestartConfirmation() {
  playSound(soundButtonClick);
  gameWrapper.classList.remove('blurred-background-active');
  confirmRestartOverlay.classList.remove('visible');
}

// Clears all parameters back to default to start fresh
function resetGameBoardState() {
  playSound(soundButtonClick);
  
  currentPlayer = 'X';
  boardState = ['', '', '', '', '', '', '', '', ''];
  isGameActive = true;
  statusText.innerHTML = `Player <span class="player-x-highlight">X</span>'s Turn`;

  // Clear all physical text and markers from the grid cells
  boardCells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('x', 'o');
  });

  // Hide all popup screens and clear out screen background blurs
  gameWrapper.classList.remove('blurred-background-active');
  gameOverOverlay.classList.remove('visible');
  confirmRestartOverlay.classList.remove('visible');
}

// Fire up the listeners to begin the program
initializeGame();