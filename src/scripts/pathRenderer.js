/**
 * Renders the points created by a Pathfinder
 */
export default class PathRenderer {

    constructor(context, pathFinder, options) {
        this.context = context;
        this.pathFinder = pathFinder;
        this.options = options;
        this.color = pathFinder.getColor();
    }

    drawNextLine() {
        if (this.options.lineMode === 'smooth') {
            this._drawLineSmooth();
        } else if (this.options.lineMode === 'square') {
            this._drawLineSquare();
        } else {
            this._drawPoint();
        }
    }

    _drawLineSmooth() {
        var midX,
            midY,
            midColor,
            lineLength,
            nextPoint = this.pathFinder.getNextPoint(this.context);

        if (nextPoint) {

            if (typeof this.currentPoint === 'undefined') {
                this.currentPoint = nextPoint;
            }
            if (typeof this.controlPoint === 'undefined') {
                this.controlPoint = nextPoint;
            }

            midX = Math.round((this.controlPoint[0] + nextPoint[0]) / 2);
            midY = Math.round((this.controlPoint[1] + nextPoint[1]) / 2);
            midColor = Math.floor((this.currentPoint[2] + nextPoint[2]) / 2);
            lineLength = this._getLineLength(this.currentPoint, nextPoint);

            if (lineLength <= this.options.speed * 3) {
                let grad,
                    startColorValue = this.currentPoint[2],
                    endColorValue = nextPoint[2];

                grad = this._createGradient(this.currentPoint, nextPoint, startColorValue, endColorValue);
                this.context.strokeStyle = grad;

                this.context.lineWidth = this.options.lineWidth;
                this.context.lineCap = 'round';
                this.context.beginPath();

                this.context.moveTo(this.currentPoint[0], this.currentPoint[1]);
                this.context.quadraticCurveTo(this.controlPoint[0], this.controlPoint[1], midX, midY);
                this.context.stroke();
            }

            this.currentPoint = [midX, midY, midColor];
            this.controlPoint = nextPoint;
        }
    }

    _drawLineSquare() {
        var lineLength,
            nextPoint = this.pathFinder.getNextPoint(this.context);

        if(nextPoint) {

            if (typeof this.currentPoint === 'undefined') {
                this.currentPoint = nextPoint;
            }

            lineLength = this._getLineLength(this.currentPoint, nextPoint);

            if (lineLength <= this.options.speed + 1) {
                let grad,
                    startColorValue = this.currentPoint[2],
                    endColorValue = nextPoint[2];

                grad = this._createGradient(this.currentPoint, nextPoint, startColorValue, endColorValue);

                this.context.strokeStyle = grad;
                this.context.lineWidth = this.options.lineWidth;
                this.context.lineCap = 'round';
                this.context.beginPath();

                this.context.moveTo(this.currentPoint[0], this.currentPoint[1]);
                this.context.lineTo(nextPoint[0], nextPoint[1]);
                this.context.stroke();
            }
            this.currentPoint = nextPoint;
        }
    }

    _drawPoint() {
        var lineLength,
            nextPoint = this.pathFinder.getNextPoint(this.context);

        if(nextPoint) {

            if (typeof this.currentPoint === 'undefined') {
                this.currentPoint = nextPoint;
            }

            lineLength = this._getLineLength(this.currentPoint, nextPoint);

            if (lineLength >= this.options.speed * 2) {
                this.context.beginPath();

                this.context.arc(nextPoint[0], nextPoint[1], this.options.lineWidth , 0, 2 * Math.PI, false);
                this.context.fillStyle = this._getStrokeColor(nextPoint[2]);
                this.context.fill();

                this.currentPoint = nextPoint;
            }
        }
    }

    _getLineLength(p1, p2) {
        var dx = p2[0] - p1[0];
        var dy = p2[1] - p1[1];
        return Math.round(Math.sqrt(dx*dx + dy*dy));
    }

    _createGradient(p1, p2, color1, color2) {
        var grad = this.context.createLinearGradient(p1[0], p1[1], p2[0], p2[1]);
        grad.addColorStop(0, this._getStrokeColor(color1));
        grad.addColorStop(1, this._getStrokeColor(color2));
        return grad;
    }

    /**
     * Get an rgba color string based on the color value and the pathRenderer's color and color mode.
     *
     * @param colorValue
     * @returns {*}
     * @private
     */
    _getStrokeColor(colorValue) {
        var colorString;

        if (this.options.colorMode === 'color') {
            colorString = 'rgba(' +
            (this.color.r !== 0 ? colorValue : 0) + ', ' +
            (this.color.g !== 0 ? colorValue : 0) + ', ' +
            (this.color.b !== 0 ? colorValue : 0) + ', ' + 1 + ')';
        } else {
            // greyscale
            colorString = 'rgba(' + colorValue + ', ' + colorValue + ', ' + colorValue + ', ' + 1 + ')';
        }

        return colorString;
    }
}