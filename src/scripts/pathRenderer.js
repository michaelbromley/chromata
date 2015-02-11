

export default class PathRenderer {

    constructor(context, pathFinder) {
        this.context = context;
        this.pathFinder = pathFinder;
        this.color = pathFinder.getColor();
    }

    drawNextLine() {
        //var nextPoint = this.path[this.position + 1];

        //if (this.position < this.path.length - 2) {

        var controlPoint = this.pathFinder.getNextPoint(this.context);
        var nextPoint = this.pathFinder.getNextPoint(this.context);

        //debug
        //this.context.fillStyle = 'rgba(255,255,255,0.01)';
        //this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);

        if (typeof this.position === 'undefined') {
            this.position = nextPoint;
        }
        let colorValue = nextPoint[2];

        this.context.globalCompositeOperation = 'lighten';
        this.context.strokeStyle = this._getStrokeColor(colorValue);
        this.context.lineWidth = 5;
        this.context.lineCap = 'round';
        this.context.beginPath();
        this.context.moveTo(this.position[0], this.position[1]);
        //this.context.moveTo(currentPoint[0], currentPoint[1]);

        var midX = (controlPoint[0] + nextPoint[0]) / 2;
        var midY = (controlPoint[1] + nextPoint[1]) / 2;

        //this.context.lineTo(nextPoint[0], nextPoint[1]);
        this.context.quadraticCurveTo(controlPoint[0], controlPoint[1], midX, midY);

        this.context.stroke();
        //}

        this.position = [midX, midY];
    }

    _getStrokeColor(colorValue) {
        return 'rgb(' +
            (this.color.r !== 0 ? colorValue : 0) + ', ' +
            (this.color.g !== 0 ? colorValue : 0) + ', ' +
            (this.color.b !== 0 ? colorValue : 0) + ')';
    }
}