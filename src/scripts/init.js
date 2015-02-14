import Chromata from 'scripts/chromata';

const imageUrl = 'assets/images/face.jpg';

var image = document.querySelector('#image');

image.addEventListener('click', () => {
    new Chromata(image, {
        pathFinderCount: 150,
        speed: 5,
        turningAngle: Math.PI/0.5,
        colorMode: 'color',
        lineWidth: 2,
        lineMode: 'square',
        compositeOperation: 'screen',
        origin: 'bottom top left right'
    });
});




