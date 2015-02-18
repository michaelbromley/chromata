import Chromata from 'scripts/chromata';

const imageUrl = 'assets/images/face.jpg';

var image = document.querySelector('#image'),
    chromata;

chromata = new Chromata(image, {
    pathFinderCount: 300,
    speed: 6,
    turningAngle: Math.PI/1,
    colorMode: 'color',
    lineWidth: 1,
    lineMode: 'square',
    //compositeOperation: 'default',
    origin: 'bottom left right'
});


document.querySelector('#toggle').addEventListener('click', e => {
    var count = chromata.toggle();
    console.log('iterations: ' + count);
});




