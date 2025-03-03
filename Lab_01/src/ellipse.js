var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var width = 800;
var height = 600;

var bgRgba = [240, 240, 200, 255];
var pointRgba = [0, 0, 255, 255];
var lineRgba = [0, 0, 0, 255];
var vlineRgba = [255, 0, 0, 255];
var ellipseRgba = [255, 0, 255, 255];

canvas.setAttribute("width", width);
canvas.setAttribute("height", height);

function Painter(context, width, height) {
  this.context = context;
  this.imageData = context.createImageData(width, height);
  this.points = [];
  this.ellipses = [];
  this.drawingEllipse = false;
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

  this.drawEllipse = function (center, radiusX, radiusY, rgba) {
    var x0 = center[0];
    var y0 = center[1];
    var rx = Math.floor(radiusX);
    var ry = Math.floor(radiusY);

    if (rx <= 0 || ry <= 0) return;

    var x = 0;
    var y = ry;
    var rxSquared = rx * rx;
    var rySquared = ry * ry;
    var twoRxSquared = 2 * rxSquared;
    var twoRySquared = 2 * rySquared;
    var px = 0;
    var py = twoRxSquared * y;

    this.plotEllipsePoints(x0, y0, x, y, rgba);

    var d1 = rySquared - rxSquared * ry + 0.25 * rxSquared;

    while (px < py) {
      x++;
      px += twoRySquared;

      if (d1 < 0) {
        d1 += rySquared + px;
      } else {
        y--;
        py -= twoRxSquared;
        d1 += rySquared + px - py;
      }

      this.plotEllipsePoints(x0, y0, x, y, rgba);
    }

    var d2 =
      rySquared * (x + 0.5) * (x + 0.5) +
      rxSquared * (y - 1) * (y - 1) -
      rxSquared * rySquared;

    while (y > 0) {
      y--;
      py -= twoRxSquared;

      if (d2 > 0) {
        d2 += rxSquared - py;
      } else {
        x++;
        px += twoRySquared;
        d2 += rxSquared - py + px;
      }

      this.plotEllipsePoints(x0, y0, x, y, rgba);
    }
  };

  this.plotEllipsePoints = function (x0, y0, x, y, rgba) {
    this.setPixel(x0 + x, y0 + y, rgba);
    this.setPixel(x0 - x, y0 + y, rgba);
    this.setPixel(x0 + x, y0 - y, rgba);
    this.setPixel(x0 - x, y0 - y, rgba);
  };

  this.calculateDistance = function (p1, p2) {
    var dx = p2[0] - p1[0];
    var dy = p2[1] - p1[1];
    return Math.sqrt(dx * dx + dy * dy);
  };

  this.addEllipse = function (center, radiusX, radiusY) {
    this.ellipses.push({ center: center, radiusX: radiusX, radiusY: radiusY });
  };

  this.drawBkg = function (rgba) {
    for (var i = 0; i < this.width; i++)
      for (var j = 0; j < this.height; j++) this.setPixel(i, j, rgba);
  };

  this.clear = function () {
    this.points.length = 0;
    this.ellipses.length = 0;
    this.drawingEllipse = false;
    this.drawBkg(bgRgba);
    this.context.putImageData(this.imageData, 0, 0);
  };

  this.addPoint = function (p) {
    this.points.push(p);

    if (this.drawingEllipse && this.points.length == 2) {
      var center = this.points[0];
      var radiusPoint = this.points[1];
      var radiusX = Math.abs(radiusPoint[0] - center[0]);
      var radiusY = Math.abs(radiusPoint[1] - center[1]);

      this.addEllipse(center, radiusX, radiusY);

      this.points = [];
      this.drawingEllipse = false;
    } else if (!this.drawingEllipse) {
      this.drawingEllipse = true;
    }
  };

  this.draw = function (p) {
    this.drawBkg(bgRgba);

    for (var i = 0; i < this.ellipses.length; i++) {
      var ellipse = this.ellipses[i];
      this.drawEllipse(
        ellipse.center,
        ellipse.radiusX,
        ellipse.radiusY,
        ellipseRgba
      );
      this.drawPoint(ellipse.center, pointRgba);
    }

    for (var i = 0; i < this.points.length; i++) {
      this.drawPoint(this.points[i], pointRgba);
    }

    if (this.drawingEllipse && this.points.length == 1 && p) {
      var center = this.points[0];
      var radiusX = Math.abs(p[0] - center[0]);
      var radiusY = Math.abs(p[1] - center[1]);

      this.drawEllipse(center, radiusX, radiusY, ellipseRgba);
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
    painter.drawingEllipse = false;
    painter.draw();
  }
};

doReset = function () {
  state = 0;
  painter.clear();
  painter.points = [];
  painter.ellipses = [];
  painter.drawingEllipse = false;
};

canvas.addEventListener("mousedown", doMouseDown, false);
canvas.addEventListener("mousemove", doMouseMove, false);
window.addEventListener("keydown", doKeyDown, false);

var resetButton = document.getElementById("reset");
resetButton.addEventListener("click", doReset, false);
