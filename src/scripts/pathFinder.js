import PathQueue from 'scripts/pathQueue';

export default class PathFinder {

    constructor(pixelArray, workingArray, targetColor, initX = 0, initY = 0) {
        this.pixelArray = pixelArray;
        this.arrayWidth = pixelArray[0].length;
        this.arrayHeight = pixelArray.length;
        this.x = Math.round(initX);
        this.y = Math.round(initY);

        this.pathQueue = new PathQueue(5000);
        this.pathQueue.put([this.x, this.y, 0]);
        this.pathQueue.put([this.x, this.y, 0]);

        this.velocity = [10, 20];

        if (targetColor) {
            this.targetColor = typeof targetColor === 'string' ? this._hexToRgb(targetColor) : targetColor;
        } else {
            this.targetColor = pixelArray[initY][initX];
        }
    }

    /**
     * Algorithm for finding the next point by picking the closest match out of an arc-shaped array of possible pixels
     * arranged pointing in the direction of velocity.
     * @returns {*}
     */
    getNextPoint(context) {

        // get current angle of velocity
        var theta = this._getVelocityAngle();
        var closestColor = 1000000;
        var nextPixel = this.pathQueue.get(-2);

        var arcSize = Math.PI / 2; // the extent of the arc of pixels that will be checked
        var radius = Math.sqrt(Math.pow(this.velocity[0], 2) + Math.pow(this.velocity[1], 2));
        var sampleSize = 10; // how many pixels to test for best fit
        var newVelocity;

        for(let angle = theta - arcSize / 2 , deviance = -sampleSize/2; angle <= theta + arcSize / 2; angle += arcSize / sampleSize, deviance ++) {
            let x = this.x + Math.round(radius * Math.cos(angle));
            let y = this.y + Math.round(radius * Math.sin(angle));

            if (this._isInRange(x, y) && !this.pathQueue.contains([x, y])) {
                let currentPixel = this.pixelArray[y][x];
                let colorDistance = this._getColorDistance(currentPixel);
                //context.fillStyle = 'rgba(0, 255, 0, 0.5)';
                //context.fillRect(x, y, 1, 1);

                if (colorDistance < closestColor) {
                    nextPixel = [x, y, 255 - colorDistance];
                    closestColor = colorDistance;
                    newVelocity = ((sampleSize/2 - Math.abs(deviance)) / 5) * 0.01 + 0.995;
                }
            }
        }

        this.velocity = [(nextPixel[0] - this.x) * newVelocity, (nextPixel[1] - this.y) * newVelocity];
        this.y = nextPixel[1];
        this.x = nextPixel[0];
        this.pathQueue.put(nextPixel);
        return nextPixel;
    }

    getCurrentPoint() {
        return this.pathQueue.get(-2);
    }

    getControlPoint() {
        return this.pathQueue.get(-1);
    }

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
            margin = 20,
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
            let  dy = this.y + this.velocity[1] - this.y;
            let  dx = this.x + this.velocity[0] - this.x;
            angle = Math.atan2(dy, dx);
        }

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

    _getSearchBox(imageWidth, imageHeight, xPos, yPos) {
        var padding = this.searchSize / 2,
            startX = Math.max(xPos - padding, 0),
            startY = Math.max(yPos - padding, 0),
            endX = Math.min(xPos + padding, imageWidth),
            endY = Math.min(yPos + padding, imageHeight);

        // correct the position to ensure the whole box is always within the image area.
        startX = imageWidth - this.searchSize < startX ? imageWidth - this.searchSize : startX;
        endX = endX < this.searchSize ? this.searchSize : endX;
        startY = imageHeight - this.searchSize < startY ? imageHeight - this.searchSize : startY;
        endY = endY < this.searchSize ? this.searchSize : endY;

        return {
            startX: startX,
            endX: endX,
            startY: startY,
            endY: endY
        };
    }

    _getColorDistance(pixel) {
        var distance = 0;

        for (let i = 0; i < 3; i ++) {
            if (this.targetColor[i] !== 0) {
                distance += Math.abs(this.targetColor[i] - pixel[i]);
            }
        }

        return distance;
    }

    _setPixelAsVisited(point) {
        this.visitedPixels.push(point);
    }

    _pixelNotYetVisited(x, y) {
        var matches = this.visitedPixels.filter((point) => {
            return point[0] === x && point[1] === y;
        });

        return matches.length === 0;
    }

    /**
     * Return true if the x, y points lie within the image dimentions.
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
}