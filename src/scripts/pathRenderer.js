

export default class PathRenderer {

    constructor(context, pathFinder, options) {
        this.context = context;
        this.pathFinder = pathFinder;
        this.options = options;
        this.color = pathFinder.getColor();
        this.compositeOperation = this._getCompositeOperation();
    }

    drawNextLine() {

        if (this.options.lineMode === 'smooth') {
            this._drawLineSmooth();
        } else {
            this._drawLineSquare();
        }
    }

    _drawLineSmooth() {
        var nextPoint = this.pathFinder.getNextPoint(this.context);

        if (typeof this.position === 'undefined') {
            this.position = nextPoint;
        }
        if (typeof this.controlPoint === 'undefined') {
            this.controlPoint = nextPoint;
        }

        var midX = (this.controlPoint[0] + nextPoint[0]) / 2;
        var midY = (this.controlPoint[1] + nextPoint[1]) / 2;

        var dx = nextPoint[0] - this.position[0];
        var dy = nextPoint[1] - this.position[1];
        var lineLength = Math.round(Math.sqrt(dx*dx + dy*dy));

        if (lineLength <= this.options.speed * 3) {
            let colorValue = nextPoint[2];

            this.context.globalCompositeOperation = this.compositeOperation;
            this.context.strokeStyle = this._getStrokeColor(colorValue);
            this.context.lineWidth = this.options.lineWidth;
            this.context.lineCap = 'round';
            this.context.beginPath();

            this.context.moveTo(this.position[0], this.position[1]);
            this.context.quadraticCurveTo(this.controlPoint[0], this.controlPoint[1], midX, midY);
            this.context.lineTo(nextPoint[0], nextPoint[1]);
            this.context.stroke();
        }

        this.position = [midX, midY];
        this.controlPoint = nextPoint;
    }


    _drawLineSquare() {
        var nextPoint = this.pathFinder.getNextPoint(this.context);

        if (typeof this.position === 'undefined') {
            this.position = nextPoint;
        }

        var dx = nextPoint[0] - this.position[0];
        var dy = nextPoint[1] - this.position[1];
        var lineLength = Math.round(Math.sqrt(dx*dx + dy*dy));

        if (lineLength <= this.options.speed + 1) {
            let colorValue = nextPoint[2];

            this.context.globalCompositeOperation = this.compositeOperation;
            this.context.strokeStyle = this._getStrokeColor(colorValue);
            this.context.lineWidth = this.options.lineWidth;
            this.context.lineCap = 'square';
            this.context.beginPath();

            this.context.moveTo(this.position[0], this.position[1]);
            this.context.lineTo(nextPoint[0], nextPoint[1]);
            this.context.stroke();
        }
        this.position = nextPoint;
    }

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

    _getCompositeOperation() {
        var operation;

        if (this.options.compositeOperation === 'default') {
            operation = this.options.colorMode === 'color' ? 'lighten' : 'lighten';
        } else {
            operation = this.options.compositeOperation;
        }

        return operation;
    }
}