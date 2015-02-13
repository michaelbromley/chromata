import Chromata from 'scripts/chromata';

const imageUrl = 'assets/images/face.jpg';

var image = document.querySelector('#image');

image.addEventListener('click', () => {
    new Chromata(image, {
        pathFinderCount: 60,
        speed: 4,
        turningAngle: Math.PI/ 0.5,
        colorMode: 'color',
        lineWidth: 1,
        lineMode: 'square',
        compositeOperation: 'default'
    });
});




