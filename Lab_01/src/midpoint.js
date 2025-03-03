var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var width = 800;
var height = 600;

var bgRgba = [240, 240, 200, 255];
var pointRgba = [0, 0, 255, 255];
var lineRgba = [0, 0, 0, 255];
var vlineRgba = [255, 0, 0, 255];
var circleRgba = [255, 0, 255, 255];

canvas.setAttribute("width", width);
canvas.setAttribute("height", height);

function Painter(context, width, height) {
  this.context = context;
  this.imageData = context.createImageData(width, height);
  this.points = [];
  this.circles = [];
  this.drawingCircle = false;
  this.width = width;
  this.height = height;

  this.getPixelIndex = function (x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return -1;
    return (x + y * width) << 2;
  };

  this.setPixel = function (x, y, rgba) {
    pixelIndex = this.getPixelIndex(x, y);
    if (pixelIndex == -1) return;
    for (var i = 0; i < 4; i++) {
      this.imageData.data[pixelIndex + i] = rgba[i];
    }
  };

  this.drawPoint = function (p, rgba) {
    var x = p[0];
    var y = p[1];
    for (var i = -1; i <= 1; i++)
      for (var j = -1; j <= 1; j++) this.setPixel(x + i, y + j, rgba);
  };

  this.drawCircle = function (center, radius, rgba) {
    var x0 = center[0];
    var y0 = center[1];
    var r = Math.floor(radius);

    if (r <= 0) return;

    var x = 0;
    var y = r;
    var p = 1 - r;
    this.plotCirclePoints(x0, y0, x, y, rgba);

    while (x < y) {
      x++;

      if (p < 0) {
        p += 2 * x + 1;
      } else {
        y--;
        p += 2 * (x - y) + 1;
      }

      this.plotCirclePoints(x0, y0, x, y, rgba);
    }
  };

  this.plotCirclePoints = function (x0, y0, x, y, rgba) {
    this.setPixel(x0 + x, y0 + y, rgba);
    this.setPixel(x0 - x, y0 + y, rgba);
    this.setPixel(x0 + x, y0 - y, rgba);
    this.setPixel(x0 - x, y0 - y, rgba);
    this.setPixel(x0 + y, y0 + x, rgba);
    this.setPixel(x0 - y, y0 + x, rgba);
    this.setPixel(x0 + y, y0 - x, rgba);
    this.setPixel(x0 - y, y0 - x, rgba);
  };

  this.calculateDistance = function (p1, p2) {
    var dx = p2[0] - p1[0];
    var dy = p2[1] - p1[1];
    return Math.sqrt(dx * dx + dy * dy);
  };

  this.addCircle = function (center, radius) {
    this.circles.push({ center: center, radius: radius });
  };

  this.drawBkg = function (rgba) {
    for (var i = 0; i < this.width; i++)
      for (var j = 0; j < this.height; j++) this.setPixel(i, j, rgba);
  };

  this.clear = function () {
    this.points.length = 0;
    this.circles.length = 0;
    this.drawingCircle = false;
    this.drawBkg(bgRgba);
    this.context.putImageData(this.imageData, 0, 0);
  };

  this.addPoint = function (p) {
    this.points.push(p);

    if (this.drawingCircle && this.points.length == 2) {
      var center = this.points[0];
      var radiusPoint = this.points[1];
      var radius = this.calculateDistance(center, radiusPoint);

      this.addCircle(center, radius);

      this.points = [];
      this.drawingCircle = false;
    } else if (!this.drawingCircle) {
      this.drawingCircle = true;
    }
  };

  this.draw = function (p) {
    this.drawBkg(bgRgba);

    for (var i = 0; i < this.circles.length; i++) {
      var circle = this.circles[i];
      this.drawCircle(circle.center, circle.radius, circleRgba);
      this.drawPoint(circle.center, pointRgba);
    }

    for (var i = 0; i < this.points.length; i++) {
      this.drawPoint(this.points[i], pointRgba);
    }

    if (this.drawingCircle && this.points.length == 1 && p) {
      var radius = this.calculateDistance(this.points[0], p);

      this.drawCircle(this.points[0], radius, circleRgba);
    }

    this.context.putImageData(this.imageData, 0, 0);
  };

  this.clear();
  this.draw();
}

state = 0; // 0: waiting 1: drawing
clickPos = [-1, -1];
var painter = new Painter(context, width, height);

getPosOnCanvas = function (x, y) {
  var bbox = canvas.getBoundingClientRect();
  return [
    Math.floor(x - bbox.left * (canvas.width / bbox.width) + 0.5),
    Math.floor(y - bbox.top * (canvas.height / bbox.height) + 0.5),
  ];
};

doMouseMove = function (e) {
  if (state == 0) {
    return;
  }
  var p = getPosOnCanvas(e.clientX, e.clientY);
  painter.draw(p);
};

doMouseDown = function (e) {
  if (e.button != 0) {
    return;
  }
  var p = getPosOnCanvas(e.clientX, e.clientY);
  painter.addPoint(p);
  painter.draw(p);

  if (state == 0) {
    state = 1;
  }
};

doKeyDown = function (e) {
  var keyId = e.keyCode ? e.keyCode : e.which;
  if (keyId == 27 && state == 1) {
    painter.points = [];
    painter.drawingCircle = false;
    painter.draw();
  }
};

doReset = function () {
  state = 0;
  painter.clear();
};

canvas.addEventListener("mousedown", doMouseDown, false);
canvas.addEventListener("mousemove", doMouseMove, false);
window.addEventListener("keydown", doKeyDown, false);

var resetButton = document.getElementById("reset");
resetButton.addEventListener("click", doReset, false);
