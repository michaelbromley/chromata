# Chromata

### A generative digital art tool.
Chromata is a small tool written in JavaScript which can turn any image into a unique, animated artwork.
Path finders are seeded on a canvas and independently trace their own path through the image,
reading the colour data of each pixel and altering their course based on a set of configurable rules.

### [Demo](http://www.michaelbromley.co.uk/experiments/chromata/)

### [Documentation](http://www.michaelbromley.co.uk/experiments/chromata/#about)

## Build

Chromata is written in ES6 JavaScript, and uses Babel for transpilation and Systemjs to handle module loading during the
build phase.

1. Clone the repo and then `npm install`
2. `gulp watch`
3. Test the output by altering the config in `src/scripts/init.js`

## License
MIT
