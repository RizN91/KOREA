'use strict';

const COLS = 10;
const ROWS = 20;
const TILE_SIZE = 30; // Canvas is 300x600

const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
ctx.scale(TILE_SIZE, TILE_SIZE);

const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');

const COLORS = [
  null,
  '#00f0f0', // I
  '#0000f0', // J
  '#f0a000', // L
  '#f0f000', // O
  '#00f000', // S
  '#a000f0', // T
  '#f00000', // Z
];

function createMatrix(rows, cols) {
  const matrix = [];
  for (let row = 0; row < rows; row++) {
    matrix.push(new Array(cols).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  switch (type) {
    case 'I':
      return [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
    case 'J':
      return [
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0],
      ];
    case 'L':
      return [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0],
      ];
    case 'O':
      return [
        [4, 4],
        [4, 4],
      ];
    case 'S':
      return [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0],
      ];
    case 'T':
      return [
        [0, 6, 0],
        [6, 6, 6],
        [0, 0, 0],
      ];
    case 'Z':
      return [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0],
      ];
    default:
      throw new Error('Unknown piece type');
  }
}

function rotateMatrix(matrix, direction) {
  const rotated = matrix.map(row => row.slice());
  const sizeY = rotated.length;
  const sizeX = rotated[0].length;

  // Pad to square for rotation simplicity
  const size = Math.max(sizeX, sizeY);
  const square = Array.from({ length: size }, (_, y) => (
    Array.from({ length: size }, (_, x) => (rotated[y] && rotated[y][x]) ? rotated[y][x] : 0)
  ));

  for (let y = 0; y < size; ++y) {
    for (let x = 0; x < y; ++x) {
      [square[x][y], square[y][x]] = [square[y][x], square[x][y]];
    }
  }
  if (direction > 0) {
    square.forEach(row => row.reverse());
  } else {
    square.reverse();
  }

  // Trim empty rows and columns
  return trimMatrix(square);
}

function trimMatrix(matrix) {
  let top = 0;
  while (top < matrix.length && matrix[top].every(v => v === 0)) top++;
  let bottom = matrix.length - 1;
  while (bottom >= 0 && matrix[bottom].every(v => v === 0)) bottom--;

  let left = 0;
  while (left < matrix[0].length && matrix.every(row => row[left] === 0)) left++;
  let right = matrix[0].length - 1;
  while (right >= 0 && matrix.every(row => row[right] === 0)) right--;

  const result = [];
  for (let y = top; y <= bottom; y++) {
    result.push(matrix[y].slice(left, right + 1));
  }
  return result.length ? result : [[0]];
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = COLORS[value];
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);

        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 0.04;
        ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function clearCanvas() {
  ctx.fillStyle = '#0b0f15';
  ctx.fillRect(0, 0, COLS, ROWS);
}

function collide(board, piece) {
  const { matrix, pos } = piece;
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      const value = matrix[y][x];
      if (value === 0) continue;
      const boardX = x + pos.x;
      const boardY = y + pos.y;
      if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
        return true;
      }
      if (boardY >= 0 && board[boardY][boardX] !== 0) {
        return true;
      }
    }
  }
  return false;
}

function merge(board, piece) {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const boardY = y + piece.pos.y;
        if (boardY >= 0) {
          board[boardY][x + piece.pos.x] = value;
        }
      }
    });
  });
}

function sweepCompletedLines(board) {
  let linesCleared = 0;
  outer: for (let y = board.length - 1; y >= 0; y--) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] === 0) {
        continue outer;
      }
    }
    const row = board.splice(y, 1)[0].fill(0);
    board.unshift(row);
    linesCleared++;
    y++;
  }
  return linesCleared;
}

function randomPieceType() {
  const types = 'IJLOSTZ';
  return types[(Math.random() * types.length) | 0];
}

function getInitialPiecePosition(matrix) {
  const x = (COLS / 2 | 0) - (matrix[0].length / 2 | 0);
  const y = -2;
  return { x, y };
}

function createEmptyBoard() {
  return createMatrix(ROWS, COLS);
}

const board = createEmptyBoard();

const player = {
  matrix: createPiece(randomPieceType()),
  pos: { x: 0, y: 0 },
};
player.pos = getInitialPiecePosition(player.matrix);

let score = 0;
let lines = 0;
let level = 1;
let isPaused = false;
let isGameOver = false;

function updateScore() {
  scoreEl.textContent = String(score);
  linesEl.textContent = String(lines);
  levelEl.textContent = String(level);
}

function lockPieceAndSpawnNext() {
  merge(board, player);
  const cleared = sweepCompletedLines(board);
  if (cleared > 0) {
    const pointsByLines = [0, 100, 300, 500, 800];
    score += pointsByLines[Math.min(cleared, pointsByLines.length - 1)] * level;
    lines += cleared;
    level = 1 + Math.floor(lines / 10);
  }
  updateScore();

  player.matrix = createPiece(randomPieceType());
  player.pos = getInitialPiecePosition(player.matrix);

  if (collide(board, player)) {
    isGameOver = true;
  }
}

function playerMove(deltaX) {
  if (isPaused || isGameOver) return;
  player.pos.x += deltaX;
  if (collide(board, player)) {
    player.pos.x -= deltaX;
  }
}

function playerDrop() {
  if (isPaused || isGameOver) return;
  player.pos.y++;
  if (collide(board, player)) {
    player.pos.y--;
    lockPieceAndSpawnNext();
  }
  dropCounter = 0;
}

function hardDrop() {
  if (isPaused || isGameOver) return;
  let dropDistance = 0;
  while (true) {
    player.pos.y++;
    if (collide(board, player)) {
      player.pos.y--;
      break;
    }
    dropDistance++;
  }
  score += dropDistance * 2;
  lockPieceAndSpawnNext();
}

function playerRotate(direction) {
  if (isPaused || isGameOver) return;
  const original = player.matrix.map(row => row.slice());
  player.matrix = rotateMatrix(player.matrix, direction);

  const originalX = player.pos.x;
  let offset = 1;
  while (collide(board, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (Math.abs(offset) > player.matrix[0].length + 1) {
      player.matrix = original;
      player.pos.x = originalX;
      return;
    }
  }
}

function restartGame() {
  for (let y = 0; y < board.length; y++) {
    board[y].fill(0);
  }
  score = 0;
  lines = 0;
  level = 1;
  isGameOver = false;
  isPaused = false;
  player.matrix = createPiece(randomPieceType());
  player.pos = getInitialPiecePosition(player.matrix);
  dropCounter = 0;
  updateScore();
}

function draw() {
  clearCanvas();
  drawMatrix(board, { x: 0, y: 0 });
  if (!isGameOver) {
    drawMatrix(player.matrix, player.pos);
  } else {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, COLS, ROWS);
    ctx.fillStyle = '#e6e8ee';
    ctx.font = '1.1px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over - Press R to restart', COLS / 2, ROWS / 2);
  }
}

let dropCounter = 0;
let lastTime = 0;

function dropIntervalMsForLevel(currentLevel) {
  const base = 1000;
  const min = 80;
  const interval = Math.max(min, Math.floor(base * Math.pow(0.85, currentLevel - 1)));
  return interval;
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  if (!isPaused && !isGameOver) {
    dropCounter += deltaTime;
    const interval = dropIntervalMsForLevel(level);
    if (dropCounter > interval) {
      playerDrop();
    }
  }

  draw();
  requestAnimationFrame(update);
}

// Input
window.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'ArrowLeft':
      event.preventDefault();
      playerMove(-1);
      break;
    case 'ArrowRight':
      event.preventDefault();
      playerMove(1);
      break;
    case 'ArrowDown':
      event.preventDefault();
      playerDrop();
      break;
    case 'ArrowUp':
      event.preventDefault();
      playerRotate(1);
      break;
    case 'Space':
      event.preventDefault();
      hardDrop();
      break;
    case 'KeyP':
      isPaused = !isPaused;
      break;
    case 'KeyR':
      restartGame();
      break;
  }
});

updateScore();
update();