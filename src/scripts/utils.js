/**
 * Static utilities class containing helper functions
 */
export default class Utils {

    static _indexToRgbString(i) {
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
    static _getImageArray(sourceContext) {
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
    static _getWorkingArray(sourceContext) {
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

    static _getOutputDimensions(image, size) {

        var width,
            height;

        if (size === 'original') {
            width = image.width;
            height = image.height;
        } else {
            let container = image.parentNode,
                ratioW = container.clientWidth / image.width,
                ratioH = container.clientHeight / image.height,
                smallerRatio = (ratioH <= ratioW) ? ratioH : ratioW;

            width = image.width * smallerRatio;
            height = image.height * smallerRatio;
        }

        return {
            width: width,
            height: height
        };
    }
}