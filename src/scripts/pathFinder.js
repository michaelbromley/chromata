import PathQueue from 'scripts/pathQueue';

const MAX = 255;

export default class PathFinder {

    constructor(pixelArray, workingArray, targetColor, initX = 0, initY = 0, options = {}) {
        this.pixelArray = pixelArray;
        this.workingArray = workingArray;
        this.arrayWidth = pixelArray[0].length;
        this.arrayHeight = pixelArray.length;
        this.x = Math.round(initX);
        this.y = Math.round(initY);
        this.options = options;
        this.pathQueue = new PathQueue(10);
        this.velocity = options.startingVelocity;

        this.targetColor = typeof targetColor === 'string' ? this._hexToRgb(targetColor) : targetColor;
        this.rgbIndex = this._getRgbIndex(this.targetColor);

        if (this.options.key === 'low') {
            this.comparatorFn = (distance, closest) => {
                return 0 < distance && distance < closest;
            };
        } else {
            this.comparatorFn = (distance, closest) => {
                return  closest < distance && distance < MAX;
            };
        }
    }

    /**
     * Get next coordinate point in path.
     *
     * @returns {[int, int, int]}
     */
    getNextPoint() {

        var result,
            i = 0,
            limit = 5; // prevent an infinite loop

        do {
            result = this._getNextPixel();
            i++;
        } while(i <= limit && result.isPristine === false);

        return result.nextPixel;
    }

    /**
     * Algorithm for finding the next point by picking the closest match out of an arc-shaped array of possible pixels
     * arranged pointing in the direction of velocity.
     *
     * @returns {{nextPixel: [int, int, int], isPristine: boolean}}
     * @private
     */
    _getNextPixel() {
        var theta = this._getVelocityAngle(),
            isPristine,
            closestColor = this.options.key === 'low' ? 100000 : 0,
            nextPixel,
            defaultNextPixel,
            arcSize = this.options.turningAngle,
            radius = Math.round(Math.sqrt(Math.pow(this.velocity[0], 2) + Math.pow(this.velocity[1], 2))),
            sampleSize = 4; // how many surrounding pixels to test for next point

        for(let angle = theta - arcSize / 2 , deviance = -sampleSize/2; angle <= theta + arcSize / 2; angle += arcSize / sampleSize, deviance ++) {
            let x = this.x + Math.round(radius * Math.cos(angle)),
                y = this.y + Math.round(radius * Math.sin(angle)),
                colorDistance = MAX;

            if (this._isInRange(x, y)) {

                let visited = this.workingArray[y][x][this.rgbIndex],
                    currentPixel = this.pixelArray[y][x],
                    alpha = currentPixel[3];

                colorDistance = this._getColorDistance(currentPixel);

                if (this.comparatorFn(colorDistance, closestColor) && !visited && alpha === MAX) {
                    nextPixel = [x, y, MAX - colorDistance];
                    closestColor = colorDistance;
                }
            }

            if (deviance === 0) {
                let pa = this.pixelArray;
                if (pa[y] && pa[y][x] && pa[y][x][3] === MAX) {
                    defaultNextPixel = [x, y, MAX - colorDistance];
                } else {
                    defaultNextPixel = this.pathQueue.get(-2);
                }
            }
        }

        isPristine = typeof nextPixel !== 'undefined';
        nextPixel = nextPixel || defaultNextPixel;

        if (nextPixel) {
            this.velocity = [nextPixel[0] - this.x, nextPixel[1] - this.y];
            this.y = nextPixel[1];
            this.x = nextPixel[0];
            this._updateWorkingArray(nextPixel[1], nextPixel[0]);
            this.pathQueue.put(nextPixel);
        }

        return {
            nextPixel: nextPixel,
            isPristine: isPristine
        };
    }

    /**
     * Get an [r, g, b] array of the target color.
     * @returns {{r: *, g: *, b: *}}
     */
    getColor() {
        return {
            r: this.targetColor[0],
            g: this.targetColor[1],
            b: this.targetColor[2]
        };
    }

    /**
     * Get the angle indicated by the velocity vector, correcting for the case that the angle would
     * take the pathfinder off the image canvas, in which case the angle will be set towards the
     * centre of the canvas.
     *
     * @returns {*}
     * @private
     */
    _getVelocityAngle() {
        var projectedX = this.x + this.velocity[0],
            projectedY = this.y + this.velocity[1],
            margin = this.options.speed,
            dy = this.y + this.velocity[1] - this.y,
            dx = this.x + this.velocity[0] - this.x,
            angle;

        // has it gone out of bounds on the x axis?
        if (projectedX <= margin || this.arrayWidth - margin <= projectedX) {
            dx *= -1;
        }

        // has it gone out of bounds on the y axis?
        if (projectedY <= margin || this.arrayHeight - margin <= projectedY) {
            dy *= -1;
        }

        angle = Math.atan2(dy, dx);
        return angle;
    }

    /**
     * From http://stackoverflow.com/a/5624139/772859
     * @param hex
     * @returns {{r: Number, g: Number, b: Number}}
     * @private
     */
    _hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    }

    _getColorDistance(pixel) {
        return MAX - pixel[this.rgbIndex];
    }

    /**
     * Return true if the x, y points lie within the image dimensions.
     * @param x
     * @param y
     * @returns {boolean}
     * @private
     */
    _isInRange(x, y) {
        return 0 < x &&
            x < this.arrayWidth &&
            0 < y &&
            y < this.arrayHeight;
    }

    _updateWorkingArray(row, col) {
        this.workingArray[row][col][this.rgbIndex] = true;
    }

    _getRgbIndex(targetColorArray) {
        var i;
        for (i = 0; i < 2; i++) {
            if (targetColorArray[i] !== 0) {
                break;
            }
        }

        return i;
    }
}