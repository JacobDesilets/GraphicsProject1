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
var paused = false;

let fm;

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  textCanvas = document.getElementById("text-canvas");
  ctx = textCanvas.getContext("2d");
  gl = setCanvases();
  snake = new Snake(gl);
  fm = new FoodManager(gl);
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
        if (snake.dead) {
          snake.reset();
          fm.reset();
        } else {
          paused = !paused;
        }
        break;
      // remaining cases are for debug purposes
      case 'q':
        snake.grow = ! snake.grow;
        break;
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
    fm.collide(snake.getHeadPos()[0], snake.getHeadPos()[1]);
    fm.update();
    renderUI();
  }
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
  if (snake.dead) {
    let gameOverText = [
      ["you died :(",        "#FF4444", "100px arial", 150],
      [`Score: ${fm.score}`, "#FF4444", "100px arial", 300],
      ["- press enter -",    "#FFDDDD", "50px arial",  500]
    ];
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < gameOverText.length; ++i) {
      let text = gameOverText[i][0];
      let y = gameOverText[i][3];
      ctx.font = gameOverText[i][2];
      ctx.fillStyle = "#000000";
      ctx.fillText(text, ctx.canvas.width/2, y + 5);
      ctx.fillStyle = gameOverText[i][1];
      ctx.fillText(text, ctx.canvas.width/2, y);
    }
  }
}
