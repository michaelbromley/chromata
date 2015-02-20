"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var Chromata = (function () {
  function Chromata(imageElement) {
    var _this = this;
    var options = arguments[1] === undefined ? {} : arguments[1];
    var renderCanvas = document.createElement("canvas"),
        renderContext = renderCanvas.getContext("2d"),
        tmpCanvas = document.createElement("canvas"),
        tmpContext = tmpCanvas.getContext("2d"),
        image = new Image(),
        parentElement,
        dimensions;

    this.options = {
      pathFinderCount: options.pathFinderCount || 1,
      origin: options.origin || "bottom",
      speed: options.speed || 3,
      turningAngle: options.turningAngle || Math.PI,
      colorMode: options.colorMode || "color",
      lineWidth: options.lineWidth || 2,
      lineMode: options.lineMode || "smooth",
      compositeOperation: options.compositeOperation || "lighten",
      outputSize: options.outputSize || "original"
    };

    image.src = imageElement.src;
    parentElement = imageElement.parentNode;

    this.loader = new Promise(function (resolve) {
      image.addEventListener("load", function () {
        dimensions = _this._getOutputDimensions(imageElement);
        tmpCanvas.width = renderCanvas.width = dimensions.width;
        tmpCanvas.height = renderCanvas.height = dimensions.height;
        tmpContext.drawImage(image, 0, 0, dimensions.width, dimensions.height);

        imageElement.style.display = "none";
        //parentElement.insertBefore(tmpCanvas, imageElement.nextSibling);
        parentElement.insertBefore(renderCanvas, imageElement.nextSibling);

        _this.dimensions = dimensions;
        _this.imageArray = _this._getImageArray(tmpContext);
        _this.workingArray = _this._getWorkingArray(tmpContext);
        resolve();
      });
    });

    this.imageArray = [];
    this.renderContext = renderContext;
    this.image = image;
    this.isRunning = false;
    this.iterationCount = 0;
  }

  _prototypeProperties(Chromata, null, {
    start: {

      /**
       * Start the animation.
       */
      value: function start() {
        var _this2 = this;
        this.loader.then(function () {
          _this2.isRunning = true;

          if (typeof _this2._tick === "undefined") {
            _this2._run();
          } else {
            _this2._tick();
          }
        });
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    stop: {

      /**
       * Stop the animation. Returns the current iteration count.
       * @returns {number}
       */
      value: function stop() {
        this.isRunning = false;
        return this.iterationCount;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    toggle: {

      /**
       * Start/stop the animation. If stopping, return the current iteration count.
       * @returns {*}
       */
      value: function toggle() {
        if (this.isRunning) {
          return this.stop();
        } else {
          return this.start();
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    reset: {

      /**
       * Clear the canvas and set the animation back to the start.
       */
      value: function reset() {
        this.isRunning = false;
        this._tick = undefined;
        cancelAnimationFrame(this.raf);
        this.renderContext.clearRect(0, 0, this.dimensions.width, this.dimensions.height);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _run: {

      /**
       * Set up the pathfinders and renderers and get the animation going.
       * @private
       */
      value: function Run() {
        var _this3 = this;


        var renderers = [],
            pathFinders = this._initPathFinders(),
            renderOptions = {
          colorMode: this.options.colorMode,
          lineWidth: this.options.lineWidth,
          lineMode: this.options.lineMode,
          speed: this.options.speed
        };

        this.renderContext.globalCompositeOperation = this.options.compositeOperation;

        pathFinders.forEach(function (pathFinder) {
          renderers.push(new PathRenderer(_this3.renderContext, pathFinder, renderOptions));
        });

        this._tick = function () {
          renderers.forEach(function (renderer) {
            return renderer.drawNextLine();
          });
          _this3.iterationCount++;

          if (_this3.isRunning) {
            _this3.raf = requestAnimationFrame(_this3._tick);
          }
        };

        this._tick();
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _initPathFinders: {

      /**
       * Create the pathfinders
       * @returns {Array}
       * @private
       */
      value: function InitPathFinders() {
        var pathFinders = [],
            count = this.options.pathFinderCount,
            origins = this.options.origin.split(" "),
            pathFindersPerOrigin = count / origins.length,
            options = {
          speed: this.options.speed,
          turningAngle: this.options.turningAngle
        };

        if (-1 < origins.indexOf("bottom")) {
          this._seedBottom(pathFindersPerOrigin, pathFinders, options);
        }
        if (-1 < origins.indexOf("top")) {
          this._seedTop(pathFindersPerOrigin, pathFinders, options);
        }
        if (-1 < origins.indexOf("left")) {
          this._seedLeft(pathFindersPerOrigin, pathFinders, options);
        }
        if (-1 < origins.indexOf("right")) {
          this._seedRight(pathFindersPerOrigin, pathFinders, options);
        }

        return pathFinders;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _seedTop: {
      value: function SeedTop(count, pathFinders, options) {
        var _this4 = this;
        var width = this.dimensions.width,
            unit = width / count,
            xPosFn = function (i) {
          return unit * i - unit / 2;
        },
            yPosFn = function () {
          return _this4.options.speed;
        };

        options.startingVelocity = [0, this.options.speed];
        this._seedCreateLoop(count, pathFinders, xPosFn, yPosFn, options);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _seedBottom: {
      value: function SeedBottom(count, pathFinders, options) {
        var _this5 = this;
        var width = this.dimensions.width,
            height = this.dimensions.height,
            unit = width / count,
            xPosFn = function (i) {
          return unit * i - unit / 2;
        },
            yPosFn = function () {
          return height - _this5.options.speed;
        };

        options.startingVelocity = [0, -this.options.speed];
        this._seedCreateLoop(count, pathFinders, xPosFn, yPosFn, options);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _seedLeft: {
      value: function SeedLeft(count, pathFinders, options) {
        var _this6 = this;
        var height = this.dimensions.height,
            unit = height / count,
            xPosFn = function () {
          return _this6.options.speed;
        },
            yPosFn = function (i) {
          return unit * i - unit / 2;
        };

        options.startingVelocity = [this.options.speed, 0];
        this._seedCreateLoop(count, pathFinders, xPosFn, yPosFn, options);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _seedRight: {
      value: function SeedRight(count, pathFinders, options) {
        var _this7 = this;
        var width = this.dimensions.width,
            height = this.dimensions.height,
            unit = height / count,
            xPosFn = function () {
          return width - _this7.options.speed;
        },
            yPosFn = function (i) {
          return unit * i - unit / 2;
        };

        options.startingVelocity = [-this.options.speed, 0];
        this._seedCreateLoop(count, pathFinders, xPosFn, yPosFn, options);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _seedCreateLoop: {
      value: function SeedCreateLoop(count, pathFinders, xPosFn, yPosFn, options) {
        for (var i = 1; i < count + 1; i++) {
          var color = this._indexToRgbString(i),
              xPos = xPosFn(i),
              yPos = yPosFn(i);

          pathFinders.push(new PathFinder(this.imageArray, this.workingArray, color, xPos, yPos, options));
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _indexToRgbString: {
      value: function IndexToRgbString(i) {
        var color;
        if (i % 3 === 0) {
          color = "#0000ff";
        } else if (i % 2 === 0) {
          color = "#00ff00";
        } else {
          color = "#ff0000";
        }
        return color;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _getImageArray: {

      /**
       * Get a 2d array (width x height) representing each pixel of the source as an [r,g,b,a] array.
       * @param sourceContext
       */
      value: function GetImageArray(sourceContext) {
        var width = sourceContext.canvas.width,
            height = sourceContext.canvas.height,
            imageData = sourceContext.getImageData(0, 0, width, height),
            imageArray = [];

        for (var row = 0; row < height; row++) {
          imageArray.push([]);

          for (var col = 0; col < width; col++) {
            var pixel = [],
                position = row * width * 4 + col * 4;

            for (var part = 0; part < 4; part++) {
              pixel[part] = imageData.data[position + part];
            }

            imageArray[row].push(pixel);
          }
        }

        return imageArray;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _getWorkingArray: {

      /**
       * Create a 2d array with the same dimensions as the image, but filled with "null" pixels that
       * will get filled in when a pathFinder visits each pixel. Allows multiple pathFinders to
       * communicate which pixels have been covered.
       *
       * @param sourceContext
       * @returns {Array}
       * @private
       */
      value: function GetWorkingArray(sourceContext) {
        var width = sourceContext.canvas.width,
            height = sourceContext.canvas.height,
            workingArray = [];

        for (var row = 0; row < height; row++) {
          workingArray.push([]);

          for (var col = 0; col < width; col++) {
            workingArray[row].push([false, false, false]);
          }
        }

        return workingArray;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _getOutputDimensions: {
      value: function GetOutputDimensions(image) {
        var width, height;

        if (this.options.outputSize === "original") {
          width = image.width;
          height = image.height;
        } else {
          var container = image.parentNode,
              ratioW = container.clientWidth / image.width,
              ratioH = container.clientHeight / image.height,
              smallerRatio = ratioH <= ratioW ? ratioH : ratioW;

          width = image.width * smallerRatio;
          height = image.height * smallerRatio;

          if (1 < Math.round(smallerRatio)) {
            this.options.lineWidth *= smallerRatio;
          }
        }

        return {
          width: width,
          height: height
        };
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return Chromata;
})();

var MAX = 255;

var PathFinder = (function () {
  function PathFinder(pixelArray, workingArray, targetColor) {
    var initX = arguments[3] === undefined ? 0 : arguments[3];
    var initY = arguments[4] === undefined ? 0 : arguments[4];
    var options = arguments[5] === undefined ? {} : arguments[5];
    this.pixelArray = pixelArray;
    this.workingArray = workingArray;
    this.arrayWidth = pixelArray[0].length;
    this.arrayHeight = pixelArray.length;
    this.x = Math.round(initX);
    this.y = Math.round(initY);
    this.options = options;
    this.pathQueue = new PathQueue(10);
    this.velocity = options.startingVelocity;

    this.targetColor = typeof targetColor === "string" ? this._hexToRgb(targetColor) : targetColor;
    this.rgbIndex = this._getRgbIndex(this.targetColor);
  }

  _prototypeProperties(PathFinder, null, {
    getNextPoint: {

      /**
       * Get next coordinate point in path.
       *
       * @returns {[int, int, int]}
       */
      value: function getNextPoint() {
        var result,
            i = 0,
            limit = 5; // prevent an infinite loop

        do {
          result = this._getNextPixel();
          i++;
        } while (i <= limit && result.isPristine === false);

        return result.nextPixel;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _getNextPixel: {

      /**
       * Algorithm for finding the next point by picking the closest match out of an arc-shaped array of possible pixels
       * arranged pointing in the direction of velocity.
       *
       * @returns {{nextPixel: [int, int, int], isPristine: boolean}}
       * @private
       */
      value: function GetNextPixel() {
        var theta = this._getVelocityAngle(),
            isPristine,
            closestColor = 1000000,
            nextPixel,
            defaultNextPixel,
            arcSize = this.options.turningAngle,
            radius = Math.round(Math.sqrt(Math.pow(this.velocity[0], 2) + Math.pow(this.velocity[1], 2))),
            sampleSize = 4; // how many surrounding pixels to test for next point

        for (var angle = theta - arcSize / 2, deviance = -sampleSize / 2; angle <= theta + arcSize / 2; angle += arcSize / sampleSize, deviance++) {
          var x = this.x + Math.round(radius * Math.cos(angle)),
              y = this.y + Math.round(radius * Math.sin(angle)),
              colorDistance = MAX;

          if (this._isInRange(x, y)) {
            var visited = this.workingArray[y][x][this.rgbIndex],
                currentPixel = this.pixelArray[y][x],
                alpha = currentPixel[3];

            colorDistance = this._getColorDistance(currentPixel);

            if (0 < colorDistance && colorDistance < closestColor && !visited && alpha === MAX) {
              nextPixel = [x, y, MAX - colorDistance];
              closestColor = colorDistance;
            }
          }

          if (deviance === 0) {
            if (this.pixelArray[y][x][3] === MAX) {
              defaultNextPixel = [x, y, MAX - colorDistance];
            } else {
              defaultNextPixel = this.pathQueue.get(-2);
            }
          }
        }

        isPristine = typeof nextPixel !== "undefined";
        nextPixel = nextPixel || defaultNextPixel;

        this.velocity = [nextPixel[0] - this.x, nextPixel[1] - this.y];
        this.y = nextPixel[1];
        this.x = nextPixel[0];
        this._updateWorkingArray(nextPixel[1], nextPixel[0]);
        this.pathQueue.put(nextPixel);

        return {
          nextPixel: nextPixel,
          isPristine: isPristine
        };
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    getColor: {

      /**
       * Get an [r, g, b] array of the target color.
       * @returns {{r: *, g: *, b: *}}
       */
      value: function getColor() {
        return {
          r: this.targetColor[0],
          g: this.targetColor[1],
          b: this.targetColor[2]
        };
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _getVelocityAngle: {

      /**
       * Get the angle indicated by the velocity vector, correcting for the case that the angle would
       * take the pathfinder off the image canvas, in which case the angle will be set towards the
       * centre of the canvas.
       *
       * @returns {*}
       * @private
       */
      value: function GetVelocityAngle() {
        var projectedX = this.x + this.velocity[0],
            projectedY = this.y + this.velocity[1],
            margin = this.options.speed,
            angle;

        if (projectedX <= margin) {
          angle = 0;
        } else if (this.arrayWidth - margin <= projectedX) {
          angle = Math.PI;
        } else if (projectedY <= margin) {
          angle = Math.PI / 2;
        } else if (this.arrayHeight - margin <= projectedY) {
          angle = 3 / 2 * Math.PI;
        } else {
          var dy = this.y + this.velocity[1] - this.y;
          var dx = this.x + this.velocity[0] - this.x;
          angle = Math.atan2(dy, dx);
        }

        return angle;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _hexToRgb: {

      /**
       * From http://stackoverflow.com/a/5624139/772859
       * @param hex
       * @returns {{r: Number, g: Number, b: Number}}
       * @private
       */
      value: function HexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
          return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _getColorDistance: {
      value: function GetColorDistance(pixel) {
        return MAX - pixel[this.rgbIndex];
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _isInRange: {

      /**
       * Return true if the x, y points lie within the image dimensions.
       * @param x
       * @param y
       * @returns {boolean}
       * @private
       */
      value: function IsInRange(x, y) {
        return 0 < x && x < this.arrayWidth && 0 < y && y < this.arrayHeight;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _updateWorkingArray: {
      value: function UpdateWorkingArray(row, col) {
        this.workingArray[row][col][this.rgbIndex] = true;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _getRgbIndex: {
      value: function GetRgbIndex(targetColorArray) {
        var i;
        for (i = 0; i < 2; i++) {
          if (targetColorArray[i] !== 0) {
            break;
          }
        }

        return i;
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return PathFinder;
})();

/**
 * Implementation of a queue of a fixed size.
 */
var PathQueue = (function () {
  function PathQueue(size) {
    this.queue = [];
    this.size = size;
  }

  _prototypeProperties(PathQueue, null, {
    put: {

      /**
       * Put a new item in the queue. If this causes the queue to exceed its size limit, the oldest
       * item will be discarded.
       * @param item
       */
      value: function put(item) {
        this.queue.push(item);
        if (this.size < this.queue.length) {
          this.queue.shift();
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    get: {

      /**
       * Get an item from the queue, specified by index. 0 gets the oldest item in the queue, 1 the second oldest etc.
       * -1 gets the newest item, -2 the second newest etc.
       *
       * @param index
       * @returns {*}
       */
      value: function get() {
        var index = arguments[0] === undefined ? 0 : arguments[0];
        var length = this.queue.length;
        if (0 <= index && index <= length) {
          return this.queue[index];
        } else if (index < 0 && Math.abs(index) <= length) {
          return this.queue[length + index];
        } else {
          return undefined;
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    contains: {
      value: function contains(item) {
        var matches = this.queue.filter(function (point) {
          return point[0] === item[0] && point[1] === item[1];
        });

        return 0 < matches.length;
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return PathQueue;
})();

/**
 * Renders the points created by a Pathfinder
 */
var PathRenderer = (function () {
  function PathRenderer(context, pathFinder, options) {
    this.context = context;
    this.pathFinder = pathFinder;
    this.options = options;
    this.color = pathFinder.getColor();
  }

  _prototypeProperties(PathRenderer, null, {
    drawNextLine: {
      value: function drawNextLine() {
        if (this.options.lineMode === "smooth") {
          this._drawLineSmooth();
        } else {
          this._drawLineSquare();
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _drawLineSmooth: {
      value: function DrawLineSmooth() {
        var midX, midY, midColor, lineLength, nextPoint = this.pathFinder.getNextPoint(this.context);

        if (typeof this.currentPoint === "undefined") {
          this.currentPoint = nextPoint;
        }
        if (typeof this.controlPoint === "undefined") {
          this.controlPoint = nextPoint;
        }

        midX = Math.round((this.controlPoint[0] + nextPoint[0]) / 2);
        midY = Math.round((this.controlPoint[1] + nextPoint[1]) / 2);
        midColor = Math.floor((this.currentPoint[2] + nextPoint[2]) / 2);
        lineLength = this._getLineLength(this.currentPoint, nextPoint);

        if (lineLength <= this.options.speed * 3) {
          var grad = undefined,
              startColorValue = this.currentPoint[2],
              endColorValue = nextPoint[2];

          grad = this._createGradient(this.currentPoint, nextPoint, startColorValue, endColorValue);
          this.context.strokeStyle = grad;

          this.context.lineWidth = this.options.lineWidth;
          this.context.lineCap = "round";
          this.context.beginPath();

          this.context.moveTo(this.currentPoint[0], this.currentPoint[1]);
          this.context.quadraticCurveTo(this.controlPoint[0], this.controlPoint[1], midX, midY);
          this.context.stroke();
        }

        this.currentPoint = [midX, midY, midColor];
        this.controlPoint = nextPoint;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _drawLineSquare: {
      value: function DrawLineSquare() {
        var lineLength, nextPoint = this.pathFinder.getNextPoint(this.context);

        if (typeof this.currentPoint === "undefined") {
          this.currentPoint = nextPoint;
        }

        lineLength = this._getLineLength(this.currentPoint, nextPoint);

        if (lineLength <= this.options.speed + 1) {
          var grad = undefined,
              startColorValue = this.currentPoint[2],
              endColorValue = nextPoint[2];

          grad = this._createGradient(this.currentPoint, nextPoint, startColorValue, endColorValue);

          this.context.strokeStyle = grad;
          this.context.lineWidth = this.options.lineWidth;
          this.context.lineCap = "round";
          this.context.beginPath();

          this.context.moveTo(this.currentPoint[0], this.currentPoint[1]);
          this.context.lineTo(nextPoint[0], nextPoint[1]);
          this.context.stroke();
        }
        this.currentPoint = nextPoint;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _getLineLength: {
      value: function GetLineLength(p1, p2) {
        var dx = p2[0] - p1[0];
        var dy = p2[1] - p1[1];
        return Math.round(Math.sqrt(dx * dx + dy * dy));
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _createGradient: {
      value: function CreateGradient(p1, p2, color1, color2) {
        var grad = this.context.createLinearGradient(p1[0], p1[1], p2[0], p2[1]);
        grad.addColorStop(0, this._getStrokeColor(color1));
        grad.addColorStop(1, this._getStrokeColor(color2));
        return grad;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _getStrokeColor: {

      /**
       * Get an rgba color string based on the color value and the pathRenderer's color and color mode.
       *
       * @param colorValue
       * @returns {*}
       * @private
       */
      value: function GetStrokeColor(colorValue) {
        var colorString;

        if (this.options.colorMode === "color") {
          colorString = "rgba(" + (this.color.r !== 0 ? colorValue : 0) + ", " + (this.color.g !== 0 ? colorValue : 0) + ", " + (this.color.b !== 0 ? colorValue : 0) + ", " + 1 + ")";
        } else {
          // greyscale
          colorString = "rgba(" + colorValue + ", " + colorValue + ", " + colorValue + ", " + 1 + ")";
        }

        return colorString;
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return PathRenderer;
})();