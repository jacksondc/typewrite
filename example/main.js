'use strict';

// Run "browserify main.js -o bundle.js" (or equivalent) to update JS

var typewrite = require('..');

var write = document.querySelector(".write");

typewrite(write, {
  scrollingCutoff: function(a,b) {
    return a / b > 0.7;
  },
  bottomMarginSize: 0.3
});
