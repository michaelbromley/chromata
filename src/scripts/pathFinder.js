export default class PathFinder {

    constructor(pixelArray, targetColor, initX = 0, initY = 0) {
        this.pixelArray = pixelArray;
        this.x = Math.round(initX);
        this.y = Math.round(initY);
        this.path = [];
        this.visitedPixels = [];

        if (targetColor) {
            this.targetColor = typeof targetColor === 'string' ? this._hexToRgb(targetColor) : targetColor;
        } else {
            this.targetColor = pixelArray[initY][initX];
        }

        this.path = [];
        this.visitedPixels = [
            [this.x, this.y]
        ];

        this.searchSize = 40; // size in pixels of the square search area when looking for next pixel to travel to.
    }

    getPath() {

        var arrayWidth = this.pixelArray[0].length,
            arrayHeight = this.pixelArray.length;

        for(let i = 0; i < 10000; i ++) {

            let closestMatch = 1000000,
                nextPoint,
                search = this._getSearchBox(arrayWidth, arrayHeight, this.x, this.y),
                distance = 10000,
                threshold = 250;

            do {
                let randomX = Math.min(Math.round(Math.random() * this.searchSize) + search.startX, arrayWidth - 1),
                    randomY = Math.min(Math.round(Math.random() * this.searchSize) + search.startY, arrayHeight - 1),
                    currentPixel = this.pixelArray[randomY][randomX];

                distance = this._getColorDistance(currentPixel);
                nextPoint = [randomX, randomY, 255 - distance];
            }
            while(threshold < distance);


            this.visitedPixels.push(nextPoint);
            this.x = nextPoint[0];
            this.y = nextPoint[1];
            this.path.push(nextPoint);

        }

        return this.path;
    }

    getColor() {
        return {
            r: this.targetColor[0],
            g: this.targetColor[1],
            b: this.targetColor[2]
        };
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

    _pixelNotYetVisited(x, y) {
        var matches = this.visitedPixels.filter((point) => {
            return point[0] === x && point[1] === y;
        });

        return matches.length === 0;
    }
}