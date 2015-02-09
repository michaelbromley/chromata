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

                this.pixelArray = this._getPixelArray(tmpContext);
                resolve();
            });
        });

        this.pixelArray = [];
        this.context = outputContext;
        this.image = image;
        this.loader = loader;
    }

    run() {

        this.loader.then(() => {

            var pathFinders = [],
                renderers = [];

            pathFinders.push(new PathFinder(this.pixelArray, '#0000ff', 470, 30));
            pathFinders.push(new PathFinder(this.pixelArray, '#00ff00', 250, 450));
            pathFinders.push(new PathFinder(this.pixelArray, '#ff0000', 30, 250));

            console.time('getting paths');
            pathFinders.forEach((pathFinder) => {
                var path = pathFinder.getPath();
                renderers.push(new PathRenderer(this.context, path, pathFinder.getColor()));
            });
            console.timeEnd('getting paths');

            window.setInterval(() => {
                renderers.forEach(renderer => renderer.drawNextLine());
            }, 10);

        });
    }




    /**
     * Get a 2d array (width x height) representing each pixel of the source as an [r,g,b,a] array.
     * @param sourceContext
     */
    _getPixelArray(sourceContext) {
        var width = sourceContext.canvas.width,
            height = sourceContext.canvas.height,
            imageData = sourceContext.getImageData(0, 0, width, height),
            pixelArray = [];

        for(let row = 0; row < height; row ++) {

            pixelArray.push([]);

            for(let col = 0; col < width; col ++) {
                let pixel = [],
                    position = row * width * 4 + col * 4;

                for(let part = 0; part < 4; part ++) {
                    pixel[part] = imageData.data[position + part];
                }

                pixelArray[row].push(pixel);
            }
        }

        return pixelArray;
    }
}