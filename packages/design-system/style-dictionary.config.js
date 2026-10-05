const StyleDictionary = require('style-dictionary');

module.exports = {
  source: ['tokens/**/*.json', '!tokens/index.json'],
  
  platforms: {
    // Web platform — outputs for React (JS + CSS variables)
    web: {
      transformGroup: 'css',
      transforms: ['attribute/cti', 'name/cti/kebab', 'time/seconds', 'content/quote'],
      buildPath: 'dist/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables'
        },
        {
          destination: 'index.js',
          format: 'javascript/es6'
        }
      ]
    },
    
    // Mobile platform — outputs for React Native (JSON)
    mobile: {
      transforms: ['attribute/cti', 'name/cti/kebab', 'time/seconds'],
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.json',
          format: 'json/flat'
        }
      ]
    }
  }
};
