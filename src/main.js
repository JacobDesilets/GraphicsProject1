"use strict";

var gl;
var delay = 10;
var pos;
var posLoc;
var canvas;
var textCanvas;
var ctx;
var vBuffer;
var snake;
var fm;
var paused = false;

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  textCanvas = document.getElementById("text-canvas");
  ctx = textCanvas.getContext("2d");
  gl = setCanvases();
  fm = new FoodManager(gl);
  snake = new Snake(gl, fm);
  clearCanvases();
  eventHandlers();
  update();
}

function setCanvases() {
  var width = Math.min(window.innerWidth, window.innerHeight) - 50;
  if (canvas.width == width) return;
  canvas.width  = width;
  canvas.height = width;
  textCanvas.width = width;
  textCanvas.height = width;
  gl = canvas.getContext('webgl2');
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl = canvas.getContext('webgl2');
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  if (!gl) alert("WebGL 2.0 isn't available");
  gl.viewport(0, 0, canvas.width, canvas.height);
  return gl;
}

function eventHandlers() {
  window.onkeydown = function(event) {
    switch(event.key) {
      case 'w':
        snake.changeDirection(0, 1);
        break;
      case 'a':
        snake.changeDirection(-1, 0);
        break;
      case 's':
        snake.changeDirection(0, -1);
        break;
      case 'd':
        snake.changeDirection(1, 0);
        break;
      case ' ':
        snake.dash();
        break;
      case 'Enter':
        if (snake.dead || fm.won) {
          snake.reset();
          fm.reset();
        } else {
          paused = !paused;
        }
        break;
      // remaining cases are for debug purposes
      case 'v':
        snake.reset();
        fm.reset();
        break;
    }
  };
};

function update() {
  if (!paused){
    clearCanvases();
    snake.update();
    fm.update();
    if(fm.won) {snake.die()}
  }
  renderUI();
  setTimeout(
    function (){requestAnimationFrame(update);}, delay
  );
}

function clearCanvases() {
  setCanvases();
  gl.clear(gl.COLOR_BUFFER_BIT);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function renderUI() {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let uiText = [[`Score: ${fm.score} / ${fm.SCORE_LIMIT}`, "#d5f0d1", "30px arial", 30]];
  let enterText = ["- press enter -", "#ffdddd", "50px arial",  300];
  if (snake.dead) {
    if (fm.won) {
      uiText.push(["you won! :)", "#5bcc47", "100px arial", 150]);
    } else {
      uiText.push(["you died :(", "#ff4444", "100px arial", 150]);
    }
    uiText.push(enterText);
  }
  if (paused) {
    uiText.push(["paused", "#ccffee", "75px arial", 175]);
    uiText.push(enterText);
  }
  for (let i = 0; i < uiText.length; ++i) {
    let text = uiText[i][0];
    let y = uiText[i][3];
    ctx.font = uiText[i][2];
    ctx.fillStyle = "#000000";
    ctx.fillText(text, ctx.canvas.width/2, y + 5);
    ctx.fillStyle = uiText[i][1];
    ctx.fillText(text, ctx.canvas.width/2, y);
  }
}
