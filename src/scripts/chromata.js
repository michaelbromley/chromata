import PathFinder from 'scripts/pathFinder';
import PathRenderer from 'scripts/pathRenderer';


export default class Chromata {

    constructor(imageUrl) {
        var outputCanvas = document.createElement('canvas'),
            outputContext = outputCanvas.getContext('2d'),
            tmpCanvas = document.createElement('canvas'),
            tmpContext = tmpCanvas.getContext('2d'),
            image = new Image(),
            loader;

        outputContext.globalCompositeOperation = 'screen';
        image.src = imageUrl;

        loader = new Promise((resolve) => {
            image.addEventListener('load', () => {
                tmpCanvas.width = outputCanvas.width = image.width;
                tmpCanvas.height = outputCanvas.height = image.height;
                tmpContext.drawImage(image, 0, 0);
                //document.body.appendChild(tmpCanvas);
                document.body.appendChild(outputCanvas);

                this.imageArray = this._getImageArray(tmpContext);
                this.workingArray = this._getWorkingArray(tmpContext);
                resolve();
            });
        });

        this.imageArray = [];
        this.context = outputContext;
        this.image = image;
        this.loader = loader;
    }

    run() {

        this.loader.then(() => {

            var pathFinders = [],
                renderers = [];

            pathFinders.push(new PathFinder(this.imageArray, this.workingArray, '#0000ff', 250, 250));
            pathFinders.push(new PathFinder(this.imageArray, this.workingArray, '#00ff00', 250, 250));
            pathFinders.push(new PathFinder(this.imageArray, this.workingArray, '#ff0000', 250, 250));

            console.time('getting paths');
            pathFinders.forEach((pathFinder) => {
                renderers.push(new PathRenderer(this.context, pathFinder));
            });
            console.timeEnd('getting paths');

            document.querySelector('canvas').addEventListener('click', () => {
                //renderers.forEach(renderer => renderer.drawNextLine());
            });

            setInterval(() => {
                renderers.forEach(renderer => renderer.drawNextLine());
            }, 300);

        });
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
     * Create a 2d array with the same dimentions as the image, but filled with "null" pixels that
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
                workingArray[row].push([null, null, null]);
            }
        }

        return workingArray;
    }
}