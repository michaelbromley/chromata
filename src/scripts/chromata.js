import Utils from 'scripts/utils';
import PathFinder from 'scripts/pathFinder';
import PathRenderer from 'scripts/pathRenderer';


export default class Chromata {

    constructor(imageElement, options = {}) {
        var renderCanvas = document.createElement('canvas'),
            renderContext = renderCanvas.getContext('2d'),
            sourceCanvas = document.createElement('canvas'),
            sourceContext = sourceCanvas.getContext('2d'),
            image = new Image(),
            dimensions,
            ready = false;

        this.options = this._mergeOptions(options);

        image.src = imageElement.src;
        image.addEventListener('load', () => {
            dimensions = Utils._getOutputDimensions(imageElement, this.options.outputSize);
            sourceCanvas.width = renderCanvas.width = dimensions.width;
            sourceCanvas.height = renderCanvas.height =  dimensions.height;
            sourceContext.drawImage(image, 0, 0, dimensions.width, dimensions.height);

            this.dimensions = dimensions;
            this.imageArray = Utils._getImageArray(sourceContext);
            this.workingArray = Utils._getWorkingArray(sourceContext);

            ready = true;
        });

        this.loader = callback => {
            if (!ready) {
                setTimeout(() => this.loader(callback), 50);
            } else {
                callback();
            }
        };

        this.imageArray = [];
        this.sourceImageElement = imageElement;
        this.sourceContext = sourceContext;
        this.renderContext = renderContext;
        this.isRunning = false;
        this.iterationCount = 0;
    }

    /**
     * Start the animation.
     */
    start() {
        this.loader(() => {

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
        this.renderContext.clearRect(0, 0, this.dimensions.width, this.dimensions.height);
        this.workingArray = Utils._getWorkingArray(this.sourceContext);
        this._removeRenderCanvas();
    }

    /**
     * Merge any user-supplied config options with the defaults and perform some validation.
     * @param options
     * @private
     */
    _mergeOptions(options) {

        var defaults = {
            colorMode: 'color',
            compositeOperation: 'lighten',
            iterationLimit: 0,
            key: 'low',
            lineWidth: 2,
            lineMode: 'smooth',
            origin: ['bottom'],
            outputSize: 'original',
            pathFinderCount: 30,
            speed: 7,
            turningAngle: Math.PI
        };

        var merged = {};

        for(var prop in defaults) {
            if (defaults.hasOwnProperty(prop)) {
                merged[prop] = options[prop] || defaults[prop];
            }
        }

        // some validation
        merged.origin = merged.origin.constructor === Array ? merged.origin : defaults.origin;
        merged.pathFinderCount =  this._limitToRange(merged.pathFinderCount, 1, 10000);
        merged.lineWidth =  this._limitToRange(merged.lineWidth, 1, 100);
        merged.speed =  this._limitToRange(merged.speed, 1, 100);
        merged.turningAngle =  this._limitToRange(merged.turningAngle, 0.1, 10);

        return merged;
    }

    _limitToRange(val, low, high) {
        return Math.min(Math.max(val, low), high);
    }

    /**
     * Hide the source image element and append the render canvas directly after it in the DOM.
     * @private
     */
    _appendRenderCanvas() {
        var parentElement = this.sourceImageElement.parentNode;

        this.sourceImageElement.style.display = 'none';
        parentElement.insertBefore(this.renderContext.canvas, this.sourceImageElement.nextSibling);
    }

    /**
     * Unhide the source image and remove the render canvas from the DOM.
     * @private
     */
    _removeRenderCanvas() {
        this.sourceImageElement.style.display = '';
        this.renderContext.canvas.parentNode.removeChild(this.renderContext.canvas);
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

        this._appendRenderCanvas();

        this.renderContext.globalCompositeOperation = this.options.compositeOperation;

        pathFinders.forEach((pathFinder) => {
            renderers.push(new PathRenderer(this.renderContext, pathFinder, renderOptions));
        });

        this._tick = () => {

            if (0 < this.options.iterationLimit && this.options.iterationLimit <= this.iterationCount) {
                this.isRunning = false;
                this.options.iterationLimit = 0;
            }

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
                turningAngle: this.options.turningAngle,
                key: this.options.key
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
            yPos = Math.floor(this.dimensions.height * yPc / 100);

        for (let i = 1; i < count + 1; i++) {
            let color = Utils._indexToRgbString(i),
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
            let color = Utils._indexToRgbString(i),
                xPos = xPosFn(i),
                yPos = yPosFn(i);

            pathFinders.push(new PathFinder(this.imageArray, this.workingArray, color, xPos, yPos, options));
        }
    }
}

window.Chromata = Chromata;
