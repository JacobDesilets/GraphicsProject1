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
var paused = true;

window.onload = function init()
{
  canvas = document.getElementById("gl-canvas");
  textCanvas = document.getElementById("text-canvas");
  ctx = textCanvas.getContext("2d");

  gl = canvas.getContext('webgl2');
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  if (!gl) alert("WebGL 2.0 isn't available");
  gl.viewport(0, 0, canvas.width, canvas.height);

  snake = new Snake(gl);
  
  clearCanvases();
  eventHandlers();
  update();
}

function eventHandlers()
{
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
      case 'q':
        snake.grow = ! snake.grow;
        break;
      case ' ':
        snake.dash();
        break;
      case 'v':
        snake.reset();
        break;
      case 'Enter':
        if (snake.dead) {
          snake.reset();
        } else {
          paused = !paused;
        }
        break;
    }
  };
};

function update()
{
  if (!paused){
    clearCanvases();
    snake.update();
    renderUI();
  }
  setTimeout(
    function (){requestAnimationFrame(update);}, delay
  );
}

function clearCanvases()
{
  gl.clear(gl.COLOR_BUFFER_BIT);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function renderUI()
{
  if (snake.dead) {
    let gameOverText = "you died :(";
    let gameOverY = 150;
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "100px arial";
    ctx.fillText(gameOverText, ctx.canvas.width/2, gameOverY);
    ctx.fillStyle = "#FF4444";
    ctx.fillText(gameOverText, ctx.canvas.width/2, gameOverY -5);
  }
}
