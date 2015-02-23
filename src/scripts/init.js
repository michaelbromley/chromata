import Chromata from 'scripts/chromata';

const imageUrl = 'assets/images/face.jpg';

var image = document.querySelector('#image'),
    chromata;

chromata = new Chromata(image, {
    pathFinderCount: 30,
    speed: 5,
    turningAngle: Math.PI/10,
    colorMode: 'color',
    lineWidth: 5,
    lineMode: 'smooth',
    //compositeOperation: 'default',
    origin: ['50% 30%', 'bottom', 'top'],
    outputSize: 'container' // original, container
});


document.querySelector('#toggle').addEventListener('click', e => {
    var count = chromata.toggle();
    console.log('iterations: ' + count);
});

document.querySelector('#reset').addEventListener('click', e => {
    chromata.reset();
});




