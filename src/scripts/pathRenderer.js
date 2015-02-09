

export default class PathRenderer {

    constructor(context, path, color) {
        this.context = context;
        this.path = path;
        this.color = color;
        this.position = 0;
    }

    drawNextLine() {
        var nextPoint = this.path[this.position + 1];

        if (this.position < this.path.length - 2) {
            let colorValue = nextPoint[2];

            this.context.globalCompositeOperation = 'lighten';
            this.context.strokeStyle = this._getStrokeColor(colorValue);
            this.context.lineWidth = 10;
            this.context.lineCap = 'round';
            this.context.beginPath();
            this.context.moveTo(this.path[this.position][0], this.path[this.position][1]);

            //this.context.lineTo(nextPoint[0], nextPoint[1]);
            this.context.quadraticCurveTo(nextPoint[0], nextPoint[1], this.path[this.position + 2][0], this.path[this.position + 2][1]);

            this.context.stroke();
        }

        this.position ++;
    }

    _getStrokeColor(colorValue) {
        return 'rgb(' +
            (this.color.r !== 0 ? colorValue : 0) + ', ' +
            (this.color.g !== 0 ? colorValue : 0) + ', ' +
            (this.color.b !== 0 ? colorValue : 0) + ')';
    }
}