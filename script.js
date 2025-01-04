const BOARD_SIZE = 10;
const NUM_MINES = 10;

let board = [];
let revealedCount = 0;
let flaggedCount = 0;
let gameOver = false;
let timerInterval;
let seconds = 0;

const gameBoard = document.querySelector('.game-board');
const minesCount = document.querySelector('.mines-count');
const timer = document.querySelector('.timer');
const resetBtn = document.querySelector('.reset-btn');

function initGame() {
  gameBoard.innerHTML = '';
  board = [];
  revealedCount = 0;
  flaggedCount = 0;
  gameOver = false;
  seconds = 0;
  timer.textContent = '000';
  minesCount.textContent = NUM_MINES.toString().padStart(3, '0');
  clearInterval(timerInterval);
  
  // Create board
  for (let row = 0; row < BOARD_SIZE; row++) {
    const rowArray = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      
      cell.addEventListener('click', handleLeftClick);
      cell.addEventListener('contextmenu', handleRightClick);
      
      gameBoard.appendChild(cell);
      rowArray.push({
        element: cell,
        isMine: false,
        revealed: false,
        flagged: false,
        adjacentMines: 0
      });
    }
    board.push(rowArray);
  }
  
  // Place mines
  placeMines();
  calculateAdjacentMines();
}

function placeMines() {
  let minesPlaced = 0;
  while (minesPlaced < NUM_MINES) {
    const row = Math.floor(Math.random() * BOARD_SIZE);
    const col = Math.floor(Math.random() * BOARD_SIZE);
    
    if (!board[row][col].isMine) {
      board[row][col].isMine = true;
      minesPlaced++;
    }
  }
}

function calculateAdjacentMines() {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!board[row][col].isMine) {
        board[row][col].adjacentMines = countAdjacentMines(row, col);
      }
    }
  }
}

function countAdjacentMines(row, col) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const newRow = row + i;
      const newCol = col + j;
      if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        if (board[newRow][newCol].isMine) {
          count++;
        }
      }
    }
  }
  return count;
}

function handleLeftClick(e) {
  if (gameOver) return;
  
  const cell = e.target;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  
  if (board[row][col].flagged) return;
  
  if (!timerInterval) {
    startTimer();
  }
  
  if (board[row][col].isMine) {
    gameOver = true;
    revealAllMines();
    resetBtn.textContent = '😵';
    return;
  }
  
  revealCell(row, col);
  
  if (revealedCount === BOARD_SIZE * BOARD_SIZE - NUM_MINES) {
    gameOver = true;
    clearInterval(timerInterval);
    resetBtn.textContent = '😎';
  }
}

function handleRightClick(e) {
  e.preventDefault();
  if (gameOver) return;
  
  const cell = e.target;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  
  if (board[row][col].revealed) return;
  
  if (!board[row][col].flagged) {
    board[row][col].flagged = true;
    cell.classList.add('flagged');
    flaggedCount++;
    minesCount.textContent = (NUM_MINES - flaggedCount).toString().padStart(3, '0');
  } else {
    board[row][col].flagged = false;
    cell.classList.remove('flagged');
    flaggedCount--;
    minesCount.textContent = (NUM_MINES - flaggedCount).toString().padStart(3, '0');
  }
}

function revealCell(row, col) {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return;
  if (board[row][col].revealed || board[row][col].flagged) return;
  
  board[row][col].revealed = true;
  revealedCount++;
  const cell = board[row][col].element;
  cell.classList.add('revealed');
  
  if (board[row][col].adjacentMines > 0) {
    cell.textContent = board[row][col].adjacentMines;
    cell.style.color = getNumberColor(board[row][col].adjacentMines);
  } else {
    // Reveal adjacent cells
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        revealCell(row + i, col + j);
      }
    }
  }
}

function getNumberColor(number) {
  const colors = [
    '#0000FF', // 1
    '#008000', // 2
    '#FF0000', // 3
    '#000080', // 4
    '#800000', // 5
    '#008080', // 6
    '#000000', // 7
    '#808080'  // 8
  ];
  return colors[number - 1];
}

function revealAllMines() {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col].isMine) {
        board[row][col].element.classList.add('revealed');
        board[row][col].element.textContent = '💣';
      }
    }
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    timer.textContent = seconds.toString().padStart(3, '0');
  }, 1000);
}

resetBtn.addEventListener('click', () => {
  resetBtn.textContent = '😊';
  initGame();
});

initGame();
