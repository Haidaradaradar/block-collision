// =====================
// CANVAS
// =====================
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// =====================
// TIME
// =====================
const dt = 1; // arbitrary, CCD makes it exact

// =====================
// VISUAL
// =====================
const groundY = 180;
const w0 = 30;
const k = 10;

// =====================
// UI
// =====================
const sliderM1 = document.getElementById("sliderM1");
const sliderM2 = document.getElementById("sliderM2");
const labelM1  = document.getElementById("valueM1");
const labelM2  = document.getElementById("valueM2");
const logArea  = document.getElementById("logArea");

// =====================
// BLOCKS
// =====================
let block1 = { x: 0, v: 0, m: 1, w: 30, h: 30 };
let block2 = { x: 0, v: -1, m: 1, w: 30, h: 30 };

// =====================
// STATE
// =====================
let collisionCount = 0;

// =====================
// UTILITIES
// =====================
function updateBlockSize(b) {
  b.w = w0 + k * Math.log10(b.m);
  b.h = b.w;
}

function updateMass(b, slider, label) {
  const n = Number(slider.value);
  b.m = Math.pow(10, n);
  updateBlockSize(b);
  label.textContent = `10^${n}`;
}

function resetSimulation() {
  block1.x = 100;
  block1.v = 0;
  block2.x = 450;
  block2.v = -1;

  collisionCount = 0;
  logArea.value = "";
}

// =====================
// LOGGING
// =====================
function logCollision(type) {
  logArea.value +=
    `${collisionCount}\t${type}\t` +
    `x1=${(block1.x + block1.w/2).toFixed(4)}\t` +
    `v1=${block1.v.toFixed(4)}\t` +
    `x2=${(block2.x + block2.w/2).toFixed(4)}\t` +
    `v2=${block2.v.toFixed(4)}\n`;

  logArea.scrollTop = logArea.scrollHeight;
}

function addLogValue(type) {
  return `${collisionCount}\t${type}\t` +
    `x1=${(block1.x + block1.w/2).toFixed(4)}\t` +
    `v1=${block1.v.toFixed(4)}\t` +
    `x2=${(block2.x + block2.w/2).toFixed(4)}\t` +
    `v2=${block2.v.toFixed(4)}\n`;
}

function inputLogValue(logValue) {
  logArea.value += logValue
  logArea.scrollTop = logArea.scrollHeight;
}

// =====================
// EVENT-BASED PHYSICS
// =====================
function stepPhysics(dt) {
  let remaining = dt;
  let logVal = '';

  while (remaining > 0) {

    let tWall = Infinity;
    if (block1.v < 0) {
      tWall = block1.x / (-block1.v);
    }

    let tBlock = Infinity;
    let gap = block2.x - (block1.x + block1.w);
    let relV = block1.v - block2.v;
    if (relV > 0) {
      tBlock = gap / relV;
    }

    let tNext = Math.min(tWall, tBlock, remaining);

    // advance
    block1.x += block1.v * tNext;
    block2.x += block2.v * tNext;
    remaining -= tNext;

    // wall collision
    if (tNext === tWall) {
      block1.v = -block1.v;
      collisionCount++;
      // logCollision("wall");
      logVal += addLogValue("wall");
    }

    // block collision
    else if (tNext === tBlock) {
      let u1 = block1.v, u2 = block2.v;
      let m1 = block1.m, m2 = block2.m;

      block1.v =
        ((m1 - m2)/(m1 + m2))*u1 +
        (2*m2/(m1 + m2))*u2;

      block2.v =
        (2*m1/(m1 + m2))*u1 +
        ((m2 - m1)/(m1 + m2))*u2;

      collisionCount++;
      // logCollision("block");
      logVal += addLogValue("block");
    }

    else {
      break;
    }
  }
  inputLogValue(logVal);
}

// =====================
// DRAW
// =====================
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "#ddd";
  ctx.fillRect(0, groundY, canvas.width, canvas.height-groundY);

  ctx.fillStyle = "black";
  ctx.fillRect(block1.x, groundY-block1.h, block1.w, block1.h);
  ctx.fillText(
    `x=${(block1.x+block1.w/2).toFixed(1)} v=${block1.v.toFixed(2)}`,
    block1.x, groundY-block1.h-5
  );

  ctx.fillStyle = "gray";
  ctx.fillRect(block2.x, groundY-block2.h, block2.w, block2.h);
  ctx.fillText(
    `x=${(block2.x+block2.w/2).toFixed(1)} v=${block2.v.toFixed(2)}`,
    block2.x, groundY-block2.h-5
  );

  ctx.fillStyle = "black";
  ctx.font = "14px monospace";
  ctx.fillText(`Collisions: ${collisionCount}`, 10, 20);
}

// =====================
// INITIALIZE
// =====================
updateMass(block1, sliderM1, labelM1);
updateMass(block2, sliderM2, labelM2);
resetSimulation();

sliderM1.addEventListener("input", () => {
  updateMass(block1, sliderM1, labelM1);
  resetSimulation();
});

sliderM2.addEventListener("input", () => {
  updateMass(block2, sliderM2, labelM2);
  resetSimulation();
});

// =====================
// LOOP
// =====================
function loop() {
  stepPhysics(dt);
  draw();
  requestAnimationFrame(loop);
}
loop();

