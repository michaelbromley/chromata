import Chromata from 'scripts/chromata';

const imageUrl = 'assets/images/face.jpg';

var image = document.querySelector('#image'),
    chromata;

chromata = new Chromata(image, {
    pathFinderCount: 90,
    speed: 7,
    turningAngle: Math.PI/0.5,
    colorMode: 'color',
    lineWidth: 4,
    lineMode: 'square',
    //compositeOperation: 'default',
    origin: ['bottom'],
    outputSize: 'container', // original, container
    key: 'low',
    backgroundColor: 'hsla(34, 70%, 70%, 0.6)',
    iterationLimit: 145
});
chromata.start();


document.querySelector('#toggle').addEventListener('click', e => {
    var count = chromata.toggle();
    console.log('iterations: ' + count);
});

document.querySelector('#reset').addEventListener('click', e => {
    chromata.reset();
});




