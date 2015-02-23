import PathFinder from 'scripts/pathFinder';
import PathRenderer from 'scripts/pathRenderer';


export default class Chromata {

    constructor(imageElement, options = {}) {
        var renderCanvas = document.createElement('canvas'),
            renderContext = renderCanvas.getContext('2d'),
            sourceCanvas = document.createElement('canvas'),
            sourceContext = sourceCanvas.getContext('2d'),
            image = new Image(),
            parentElement,
            dimensions;

        this.options = {
            pathFinderCount: options.pathFinderCount || 1,
            origin: options.origin || ['bottom'],
            speed: options.speed || 3,
            turningAngle: options.turningAngle || Math.PI,
            colorMode: options.colorMode || 'color',
            lineWidth: options.lineWidth || 2,
            lineMode: options.lineMode || 'smooth',
            compositeOperation: options.compositeOperation || 'lighten',
            outputSize: options.outputSize || 'original'
        };

        image.src = imageElement.src;
        parentElement = imageElement.parentNode;

        this.loader = new Promise(resolve => {
            image.addEventListener('load', () => {
                dimensions = this._getOutputDimensions(imageElement);
                sourceCanvas.width = renderCanvas.width = dimensions.width;
                sourceCanvas.height = renderCanvas.height =  dimensions.height;
                sourceContext.drawImage(image, 0, 0, dimensions.width, dimensions.height);

                imageElement.style.display = 'none';
                //parentElement.insertBefore(tmpCanvas, imageElement.nextSibling);
                parentElement.insertBefore(renderCanvas, imageElement.nextSibling);

                this.dimensions = dimensions;
                this.imageArray = this._getImageArray(sourceContext);
                this.workingArray = this._getWorkingArray(sourceContext);
                resolve();
            });
        });

        this.imageArray = [];
        this.sourceContext = sourceContext;
        this.renderContext = renderContext;
        this.image = image;
        this.isRunning = false;
        this.iterationCount = 0;
    }

    /**
     * Start the animation.
     */
    start() {
        this.loader.then(() => {

            this.isRunning = true;

            if (typeof this._tick === 'undefined') {
                this._run();
            } else {
                this._tick();
            }
        });
    }

    /**
     * Stop the animation. Returns the current iteration count.
     * @returns {number}
     */
    stop() {
        this.isRunning = false;
        return this.iterationCount;
    }

    /**
     * Start/stop the animation. If stopping, return the current iteration count.
     * @returns {*}
     */
    toggle() {
        if (this.isRunning) {
            return this.stop();
        } else {
            return this.start();
        }
    }

    /**
     * Clear the canvas and set the animation back to the start.
     */
    reset() {
        this.isRunning = false;
        this._tick = undefined;
        cancelAnimationFrame(this.raf);
        this.renderContext.clearRect(0, 0, this.dimensions.width, this.dimensions.height)
        this.workingArray = this._getWorkingArray(this.sourceContext);
    }

    /**
     * Set up the pathfinders and renderers and get the animation going.
     * @private
     */
    _run() {

        var renderers = [],
            pathFinders = this._initPathFinders(),
            renderOptions = {
                colorMode: this.options.colorMode,
                lineWidth: this.options.lineWidth,
                lineMode: this.options.lineMode,
                speed: this.options.speed
            };

        this.renderContext.globalCompositeOperation = this.options.compositeOperation;

        pathFinders.forEach((pathFinder) => {
            renderers.push(new PathRenderer(this.renderContext, pathFinder, renderOptions));
        });

        this._tick = () => {
            renderers.forEach(renderer => renderer.drawNextLine());
            this.iterationCount ++;

            if (this.isRunning) {
                this.raf = requestAnimationFrame(this._tick);
            }
        };

        this._tick();
    }

    /**
     * Create the pathfinders
     * @returns {Array}
     * @private
     */
    _initPathFinders() {
        var pathFinders = [],
            count = this.options.pathFinderCount,
            origins = this.options.origin,
            pathFindersPerOrigin = count / origins.length,
            options = {
                speed: this.options.speed,
                turningAngle: this.options.turningAngle
            };

        if (-1 < origins.indexOf('bottom')) {
            this._seedBottom(pathFindersPerOrigin, pathFinders, options);
        }
        if (-1 < origins.indexOf('top')) {
            this._seedTop(pathFindersPerOrigin, pathFinders, options);
        }
        if (-1 < origins.indexOf('left')) {
            this._seedLeft(pathFindersPerOrigin, pathFinders, options);
        }
        if (-1 < origins.indexOf('right')) {
            this._seedRight(pathFindersPerOrigin, pathFinders, options);
        }

        origins.forEach((origin) => {
            const matches = origin.match(/(\d{1,3})% (\d{1,3})%/);
            if (matches) {
                this._seedPoint(pathFindersPerOrigin, pathFinders, options, matches[1], matches[2]);
            }
        });

        return pathFinders;
    }

    _seedTop(count, pathFinders, options) {
        var width = this.dimensions.width,
            unit = width / count,
            xPosFn = i => unit * i - unit / 2,
            yPosFn = () => this.options.speed;

        options.startingVelocity = [0, this.options.speed];
        this._seedCreateLoop(count, pathFinders, xPosFn, yPosFn, options);
    }

    _seedBottom(count, pathFinders, options) {
        var width = this.dimensions.width,
            height = this.dimensions.height,
            unit = width / count,
            xPosFn = i => unit * i - unit / 2,
            yPosFn = () => height - this.options.speed;

        options.startingVelocity = [0, -this.options.speed];
        this._seedCreateLoop(count, pathFinders, xPosFn, yPosFn, options);
    }

    _seedLeft(count, pathFinders, options) {
        var height = this.dimensions.height,
            unit = height / count,
            xPosFn = () => this.options.speed,
            yPosFn = i => unit * i - unit / 2;

        options.startingVelocity = [this.options.speed, 0];
        this._seedCreateLoop(count, pathFinders, xPosFn, yPosFn, options);
    }

    _seedRight(count, pathFinders, options) {
        var width = this.dimensions.width,
            height = this.dimensions.height,
            unit = height / count,
            xPosFn = () => width - this.options.speed,
            yPosFn = i => unit * i - unit / 2;

        options.startingVelocity = [-this.options.speed, 0];
        this._seedCreateLoop(count, pathFinders, xPosFn, yPosFn, options);
    }

    _seedPoint(count, pathFinders, options, xPc, yPc) {
        var xPos = Math.floor(this.dimensions.width * xPc / 100),
            yPos = Math.floor(this.dimensions.width * yPc / 100);

        for (let i = 1; i < count + 1; i++) {
            let color = this._indexToRgbString(i),
                direction = i % 4;

            switch (direction) {
                case 0:
                    options.startingVelocity = [-this.options.speed, 0];
                    break;
                case 1:
                    options.startingVelocity = [0, this.options.speed];
                    break;
                case 2:
                    options.startingVelocity = [this.options.speed, 0];
                    break;
                case 3:
                    options.startingVelocity = [0, -this.options.speed];
                    break;
            }

            pathFinders.push(new PathFinder(this.imageArray, this.workingArray, color, xPos, yPos, options));
        }
    }

    _seedCreateLoop(count, pathFinders, xPosFn, yPosFn, options) {
        for (let i = 1; i < count + 1; i++) {
            let color = this._indexToRgbString(i),
                xPos = xPosFn(i),
                yPos = yPosFn(i);

            pathFinders.push(new PathFinder(this.imageArray, this.workingArray, color, xPos, yPos, options));
        }
    }

    _indexToRgbString(i) {
        var color;
        if (i % 3 === 0) {
            color = '#0000ff';
        } else if (i % 2 === 0) {
            color = '#00ff00';
        } else {
            color = '#ff0000';
        }
        return color;
    }

    /**
     * Get a 2d array (width x height) representing each pixel of the source as an [r,g,b,a] array.
     * @param sourceContext
     */
    _getImageArray(sourceContext) {
        var width = sourceContext.canvas.width,
            height = sourceContext.canvas.height,
            imageData = sourceContext.getImageData(0, 0, width, height),
            imageArray = [];

        for(let row = 0; row < height; row ++) {

            imageArray.push([]);

            for(let col = 0; col < width; col ++) {
                let pixel = [],
                    position = row * width * 4 + col * 4;

                for(let part = 0; part < 4; part ++) {
                    pixel[part] = imageData.data[position + part];
                }

                imageArray[row].push(pixel);
            }
        }

        return imageArray;
    }

    /**
     * Create a 2d array with the same dimensions as the image, but filled with "null" pixels that
     * will get filled in when a pathFinder visits each pixel. Allows multiple pathFinders to
     * communicate which pixels have been covered.
     *
     * @param sourceContext
     * @returns {Array}
     * @private
     */
    _getWorkingArray(sourceContext) {
        var width = sourceContext.canvas.width,
            height = sourceContext.canvas.height,
            workingArray = [];

        for(let row = 0; row < height; row ++) {

            workingArray.push([]);

            for(let col = 0; col < width; col ++) {
                workingArray[row].push([false, false, false]);
            }
        }

        return workingArray;
    }

    _getOutputDimensions(image) {

        var width,
            height;

        if (this.options.outputSize === 'original') {
            width = image.width;
            height = image.height;
        } else {
            let container = image.parentNode,
                ratioW = container.clientWidth / image.width,
                ratioH = container.clientHeight / image.height,
                smallerRatio = (ratioH <= ratioW) ? ratioH : ratioW;

            width = image.width * smallerRatio;
            height = image.height * smallerRatio;
        }

        return {
            width: width,
            height: height
        };
    }
}