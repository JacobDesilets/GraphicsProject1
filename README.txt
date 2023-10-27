# Graphics Project 1
Martin Duffy, Jacob Desilets

## Controls
- WASD: Turn
- Space: Dash
- Enter: Pause

## Implementation
Files used:
- main.html: main html page
- main.js: sets up the page and snake and food classes
- snake.js: handles the snake updating and rendering
- food.js: manages food spawning and tracks score
- util.js: some utility functions

We broke the project into two major parts, the snake and the food.

The snake starts with 4 vertices and moves in a direction. Every time the snake turns, 4 vertices are appended to the shape of the snake, and vertices are removed from the back of the snake as necessary. This keeps the polygon with the minimum number of vertices. A uniform variable is passed with the location of the head which allows the color to change on the snake based on how far it is from the head.

We have a food manager class that manages the score and spawning of the food. It ends the game when the score reaches 50.
