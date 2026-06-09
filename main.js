// ── DIALOGUE CONFIG ─────────────────────────────────────────────────────────
const dialogueLines = [
  { speaker: "Ras", img: "media/Ras.png", text: "Oi! you over there!" },
  { speaker: "Ras", img: "media/Ras.png", text: "Feed my snake!" },
  { speaker: "Nyoks", img: "media/Tiny snake.png", text: "I'm hungry… feed me!" },
  { speaker: "Ras", img: "media/Ras.png", text: "Each mouse makes you longer!" },
  { speaker: "Nyoks", img: "media/Tiny snake.png", text: "Go fast! Go fast! 🐍" },
  { speaker: "Ras", img: "media/Ras.png", text: "How many can you collect?" },
];

let dialogueIndex = 0;

function showNextDialogue() {
  const line = dialogueLines[dialogueIndex % dialogueLines.length];
  dialogueIndex++;

  const charEl = document.getElementById("character");
  const nameEl = document.getElementById("speakerName");
  const textEl = document.getElementById("dialogueText");

  textEl.style.opacity = "0";
  charEl.style.opacity = "0";

  setTimeout(() => {
    charEl.src = line.img;
    nameEl.textContent = line.speaker;
    textEl.textContent = line.text;
    textEl.style.opacity = "1";
    charEl.style.opacity = "1";
  }, 300);
}

setInterval(showNextDialogue, 4000);

// ── GAME ────────────────────────────────────────────────────────────────────
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;

const CELL = 24; 
let cols, rows;

const headImg = new Image();
headImg.src = "media/head.png";

const bodyImg = new Image();
bodyImg.src = "media/body.png";

const tailImg = new Image();
tailImg.src = "media/tail.png";

const foodImg = new Image();
foodImg.src = "media/food.png";

let snake, direction, nextDirection, food, score, gameOver;

function init() {
  resizeCanvas();
  snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  gameOver = false;
  placeFood();
  document.getElementById("scoreNum").textContent = "0";
}

function resizeCanvas() {
  canvas.width = canvas.clientWidth || canvas.offsetWidth;
  canvas.height = canvas.clientHeight || canvas.offsetHeight;
  cols = Math.floor(canvas.width / CELL);
  rows = Math.floor(canvas.height / CELL);
  ctx.imageSmoothingEnabled = false;
}

window.addEventListener("resize", () => { resizeCanvas(); });

function placeFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows)
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  food = pos;
}

function step() {
  if (gameOver) return;

  direction = { ...nextDirection };

  const head = {
    x: (snake[0].x + direction.x + cols) % cols,
    y: (snake[0].y + direction.y + rows) % rows
  };

  // Self-collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById("scoreNum").textContent = score;
    placeFood();
    // Speed up slightly, min 80ms
    moveDelay = Math.max(80, moveDelay - 3);
  } else {
    snake.pop();
  }
}

function drawRotatedImage(img, x, y, size, angle) {
  ctx.save();

  ctx.translate(
    x + size / 2,
    y + size / 2
  );

  ctx.rotate(angle);

  ctx.drawImage(
    img,
    -size / 2,
    -size / 2,
    size,
    size
  );

  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Grid
  ctx.strokeStyle = "#ffffff08";
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= canvas.width; x += CELL) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += CELL) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  ctx.drawImage(
    foodImg,
    food.x * CELL,
    food.y * CELL,
    CELL,
    CELL
  );

  // Snake
  snake.forEach((seg, i) => {
    let img = bodyImg;
    let angle = 0;

    // Head
    if (i === 0) {
      img = headImg;

      if (direction.x === 1) angle = 0;
      else if (direction.x === -1) angle = Math.PI;
      else if (direction.y === -1) angle = -Math.PI / 2;
      else if (direction.y === 1) angle = Math.PI / 2;
    }

    // Tail
    else if (i === snake.length - 1) {
      img = tailImg;

      const prev = snake[i - 1];

      const dx = prev.x - seg.x;
      const dy = prev.y - seg.y;

      if (dx > 0) angle = 0;
      else if (dx < 0) angle = Math.PI;
      else if (dy > 0) angle = Math.PI / 2;
      else if (dy < 0) angle = -Math.PI / 2;
    }

    drawRotatedImage(
      img,
      seg.x * CELL,
      seg.y * CELL,
      CELL,
      angle
    );
  });

  ctx.shadowBlur = 0;

}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function endGame() {

  gameOver = true;

  document.getElementById("finalScore").textContent = "Score: " + score;

  let stars = "☆☆☆";

  if (score >= 5)
      stars = "⭐⭐⭐";
  else if (score >= 3)
      stars = "⭐⭐☆";
  else if (score >= 1)
      stars = "⭐☆☆";

  document.getElementById("stars").textContent = stars;

  document.getElementById("endcard").classList.add("visible");
}


let moveDelay = 200;
let lastStep = 0;
let lastFrame = 0;

function gameLoop(ts) {
  const dt = ts - lastFrame;
  lastFrame = ts;

  lastStep += dt;
  if (lastStep >= moveDelay) {
    lastStep = 0;
    step();
  }

  draw();
  requestAnimationFrame(gameLoop);
}

// ── CONTROLS ────────────────────────────────────────────────────────────────
function setDir(dx, dy) {
  // Prevent reversing
  if (dx !== 0 && direction.x === -dx) return;
  if (dy !== 0 && direction.y === -dy) return;
  nextDirection = { x: dx, y: dy };
}

function addBtn(id, dx, dy) {
  const el = document.getElementById(id);
  el.addEventListener("touchstart", e => { e.preventDefault(); setDir(dx, dy); }, { passive: false });
  el.addEventListener("mousedown", e => { e.preventDefault(); setDir(dx, dy); });
}

addBtn("btn-up", 0, -1);
addBtn("btn-down", 0, 1);
addBtn("btn-left", -1, 0);
addBtn("btn-right", 1, 0);

// Keyboard support
document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp" || e.key === "w") setDir(0, -1);
  if (e.key === "ArrowDown" || e.key === "s") setDir(0, 1);
  if (e.key === "ArrowLeft" || e.key === "a") setDir(-1, 0);
  if (e.key === "ArrowRight" || e.key === "d") setDir(1, 0);
});

// Swipe support
let touchStart = null;
canvas.addEventListener("touchstart", e => {
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });
canvas.addEventListener("touchend", e => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    setDir(dx > 0 ? 1 : -1, 0);
  } else {
    setDir(0, dy > 0 ? 1 : -1);
  }
  touchStart = null;
}, { passive: true });

// ── AD TIMER: show endcard after 20s ────────────────────────────────────────
setTimeout(() => {
  if (!gameOver) endGame();
}, 20000);

function downloadGame() {
  window.open(
    "https://play.google.com/store/apps/details?id=com.Prue.Nyoksgame",
    "_blank"
  );
}

// ── START ───────────────────────────────────────────────────────────────────
init();
requestAnimationFrame(gameLoop);