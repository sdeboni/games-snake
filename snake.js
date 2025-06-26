const speed = 2; // segments/sec;
let gameOver = false;
const auto = true;

const bounds = {
  left: 2,
  right: 19,
  top: 2,
  bottom: 19,
}

let snake;

const food = {};

window.addEventListener("DOMContentLoaded", () => {
  snake = buildSnake(7, speed);

  for (const segment of snake.segments) {
    segment.elem.style.gridRow = `${segment.row}`;
    segment.elem.style.gridColumn = `${segment.col}`;
    segment.elem.style.visibility = "visible";
  }

  food = spawnFood();

  requestAnimationFrame(gameLoop);
});

window.addEventListener("click", () => {
  growSnake();
});

function spawnFood() {
  let row;
  let col;
  let isSet = false;

  while (!isSet) {
    isSet = true;
    row = Math.trunc(bounds.top + Math.random() * (bounds.bottom - bounds.top));
    col = Math.trunc(bounds.left + Math.random() * (bounds.right - bounds.left));

    for (const segment of snake.segments) {
      if (segment.row == row && segment.col == col) {
        isSet = false;
        break;
      }
    }
  }

  const gameArea = document.querySelector("#game-area");

  const div = document.createElement("div");
  div.style.gridRow = `${row}`;
  div.style.gridColumn = `${col}`;
  div.classList.add("food");

  gameArea.appendChild(div);

  return {
    ele: div,
    row: row,
    col: col,
  }
}

function calcUpdates(timestamp, lastRender, speed) {
  elapsed = timestamp - lastRender;
  return Math.round(elapsed / 1000 * speed);
}

function buildSnake(segmentNum, speed) {
  const gameArea = document.querySelector("#game-area");
  const row = 11; 
  const startColumn = 10;

  const segments = [];

  let segment = createSegment(row, startColumn, gameArea);
  segments.push(segment);

  for (let i = 1; i < segmentNum; i++) {
    let prevSegment = segment;
    segment = createSegment(row, startColumn + i, gameArea);
    prevSegment.next = segment;
    segment.prev = prevSegment;

    segments.push(segment);
  }
  segment.next = segments[0];
  segments[0].prev = segment;

  return {
    segments: segments,
    head: segments[0],
    direction: "left",
    speed: speed,
  };
}

function createSegment(row, col, gameArea) {
  const div = document.createElement("div");
  gameArea.appendChild(div);
  div.classList.add("segment");
  
  return {
    row: row,
    col: col,
    elem: div,
  };
}

function moveUp(snake, bounds) {
  if (snake.head.row <= bounds.top && auto) {
    snake.head.row = bounds.top;
    snake.direction = "left";
    return moveLeft(snake, bounds);
  }
  const tail = snake.head.prev;
  tail.row = snake.head.row-1;
  tail.col = snake.head.col;
  snake.head = tail;
}

function moveLeft(snake, bounds) {
  if (snake.head.col <= bounds.left && auto) {
    snake.head.col = bounds.left;
    snake.direction = "down";
    return moveDown(snake, bounds);
  }
  const tail = snake.head.prev;
  tail.col = snake.head.col-1;
  tail.row = snake.head.row;
  snake.head = tail;
}

function moveDown(snake, bounds) {
  if (snake.head.row >= bounds.bottom && auto) {
    snake.head.row = bounds.bottom;
    snake.direction = "right";
    return moveRight(snake, bounds);
  }
  const tail = snake.head.prev;
  tail.row = snake.head.row+1;
  tail.col = snake.head.col;
  snake.head = tail;
}

function moveRight(snake, bounds) {
  if (snake.head.col >= bounds.right && auto) {
    snake.head.col = bounds.right;
    snake.direction = "up";
    return moveUp(snake, bounds);
  }
  const tail = snake.head.prev;
  tail.col = snake.head.col+1;
  tail.row = snake.head.row;
  snake.head = tail;
  snake.tail = snake.head.prev;
}

function advance(snake) {
  if (snake.direction === "left") {
    moveLeft(snake, bounds);
  } else if (snake.direction === "right") {
    moveRight(snake, bounds);
  } else if (snake.direction == "up") {
    moveUp(snake, bounds);
  } else {
    moveDown(snake, bounds);
  }
  if (snake.head.row == food.row && snake.head.col == food.col) {
    food.ele.style.display = "none";
    growSnake();
    spawnFood();
  }
}

function growSnake() {
  const tail = snake.head.prev
  let row = tail.row;
  let col = tail.col;

  if (row == bounds.bottom || row == bounds.top) {
    if (col > bounds.left) {
      col--;
    } else {
      col++;
    }
  }
  if (col == bounds.left || col == bounds.right) {
    if (row > bounds.top) {
      row--;
    } else {
      row++;
    }
  }

  const gameArea = document.querySelector("#game-area");
  const segment = createSegment(row, col, gameArea);
  segment.elem.style.gridRow = `${segment.row}`;
  segment.elem.style.gridColumn = `${segment.col}`;
  segment.elem.style.visibility = "visible";

  const next = tail.next;
  tail.next = segment;
  segment.prev = tail;
  segment.next = next;
  snake.head.prev = segment;
  snake.segments.push(segment);
}

function collision(snake, bounds) {
  if (snake.head.col > bounds.right) {
    return true; 
  }
  if (snake.head.col < bounds.left) {
    return true;
  }
  if (snake.head.row > bounds.bottom) {
    return true;
  }
  if (snake.head.row < bounds.top) {
    return true;
  }
  const head = snake.head;
  for (const segment of snake.segments) {
    if (segment === head) {
      continue;
    }
    if (segment.row === head.row && segment.col === head.col) {
      return true;
    }
  }
  return false;
}
  
function render(snake) {
  for (const segment of snake.segments) {
    segment.elem.style.gridRow = `${segment.row}`;
    segment.elem.style.gridColumn = `${segment.col}`;
  }
}

//let count = 0;
let lastRender;
function gameLoop(timestamp) {
  if (lastRender === undefined) {
    lastRender = timestamp;
  }
  // Write any code you want to happen on every animation frame here
  const updatesNeeded = calcUpdates(timestamp, lastRender, snake.speed);
  for (let i = 0; i < updatesNeeded; i++) {
    advance(snake);
    if (collision(snake, bounds)) {
      gameOver = true;
      break;
    }
  }
  if (updatesNeeded > 0) {
    render(snake);
    lastRender = timestamp;
  }
  if (gameOver) {
    const gameArea = document.querySelector("#game-area");
    gameArea.style.background = "red";
    for (const segment of snake.segments) {
      segment.elem.style.borderColor = "red";
    }
  } else {
    requestAnimationFrame(gameLoop);
  }
}

document.addEventListener("keydown", (event) => {
  if (event.code == "ArrowDown") {
    snake.direction = "down";
  } else if (event.code == "ArrowUp") {
    snake.direction = "up";
  } else if (event.code == "ArrowLeft") {
    snake.direction = "left";
  } else if (event.code == "ArrowRight") {
    snake.direction = "right";
  }
});

requestAnimationFrame(gameLoop);
