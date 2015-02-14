import PathFinder from 'scripts/pathFinder';
import PathRenderer from 'scripts/pathRenderer';


export default class Chromata {

    constructor(imageElement, options) {
        var renderCanvas = document.createElement('canvas'),
            renderContext = renderCanvas.getContext('2d'),
            offscreenCanvas = document.createElement('canvas'),
            offscreenContext = offscreenCanvas.getContext('2d'),
            tmpCanvas = document.createElement('canvas'),
            tmpContext = tmpCanvas.getContext('2d'),
            image = new Image(),
            parentElement,
            loader;

        this.options = {
            pathFinderCount: options.pathFinderCount || 1,
            origin: options.origin || 'bottom',
            speed: options.speed || 3,
            turningAngle: options.turningAngle || Math.PI,
            colorMode: options.colorMode || 'color',
            lineWidth: options.lineWidth || 2,
            lineMode: options.lineMode || 'smooth',
            compositeOperation: options.compositeOperation || 'default'
        };

        image.src = imageElement.src;
        parentElement = imageElement.parentNode;

        loader = new Promise(resolve => {
            image.addEventListener('load', () => {
                tmpCanvas.width = renderCanvas.width = offscreenCanvas.width = image.width;
                tmpCanvas.height = renderCanvas.height = offscreenCanvas.height = image.height;
                tmpContext.drawImage(image, 0, 0);

                parentElement.removeChild(imageElement);
                parentElement.appendChild(renderCanvas);

                this.imageArray = this._getImageArray(tmpContext);
                this.workingArray = this._getWorkingArray(tmpContext);
                resolve();
            });
        });

        this.imageArray = [];
        this.renderContext = renderContext;
        this.offscreenContext = offscreenContext;
        this.image = image;

        this.renderContext.globalCompositeOperation = 'lighten';

        loader.then(() => this._run());
    }

    /**
     * Start the animation
     * @private
     */
    _run() {

        var tick,
            renderers = [],
            pathFinders = this._initPathFinders(),
            renderOptions = {
                colorMode: this.options.colorMode,
                lineWidth: this.options.lineWidth,
                lineMode: this.options.lineMode,
                compositeOperation: this.options.compositeOperation,
                speed: this.options.speed
            };



        pathFinders.forEach((pathFinder) => {
            renderers.push(new PathRenderer(this.renderContext, pathFinder, renderOptions));
        });

        tick = () => {
            renderers.forEach(renderer => renderer.drawNextLine());

            //this.renderContext.drawImage(this.offscreenContext.canvas, 0, 0);
            requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }

    /**
     * Create the pathfinders
     * @returns {Array}
     * @private
     */
    _initPathFinders() {
        var pathFinders = [],
            count = this.options.pathFinderCount,
            origins = this.options.origin.split(' '),
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

        return pathFinders;
    }

    _seedTop(count, pathFinders, options) {
        var width = this.image.width,
            unit = width / count,
            xPosFn = i => unit * i - unit / 2,
            yPosFn = () => this.options.speed;

        options.startingVelocity = [0, this.options.speed];
        this._seedCreateLoop(count, pathFinders, xPosFn, yPosFn, options);
    }

    _seedBottom(count, pathFinders, options) {
        var width = this.image.width,
            height = this.image.height,
            unit = width / count,
            xPosFn = i => unit * i - unit / 2,
            yPosFn = () => height - this.options.speed;

        options.startingVelocity = [0, -this.options.speed];
        this._seedCreateLoop(count, pathFinders, xPosFn, yPosFn, options);
    }

    _seedLeft(count, pathFinders, options) {
        var height = this.image.height,
            unit = height / count,
            xPosFn = () => this.options.speed,
            yPosFn = i => unit * i - unit / 2;

        options.startingVelocity = [this.options.speed, 0];
        this._seedCreateLoop(count, pathFinders, xPosFn, yPosFn, options);
    }

    _seedRight(count, pathFinders, options) {
        var width = this.image.width,
            height = this.image.height,
            unit = height / count,
            xPosFn = () => width - this.options.speed,
            yPosFn = i => unit * i - unit / 2;

        options.startingVelocity = [-this.options.speed, 0];
        this._seedCreateLoop(count, pathFinders, xPosFn, yPosFn, options);
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
}