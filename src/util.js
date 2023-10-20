function sign(x) {
  return x > 0 ? 1 : (x < 0 ? -1 : 0);
}

function pointInRect(point, rect) {
  var min = [];
  var max = [];
  for (let i = 0; i < 2; ++i) {
    min.push(Math.min(
      rect[0][i],
      rect[1][i],
      rect[2][i],
      rect[3][i]
    ));
    max.push(Math.max(
      rect[0][i],
      rect[1][i],
      rect[2][i],
      rect[3][i]
    ));
  }
  return point[0] > min[0] && point[0] < max[0] &&
         point[1] > min[1] && point[1] < max[1];
}
