'use strict';

(function() {
  const autosize = require('autosize');
  const getCaretCoordinates = require('textarea-caret');

  function normalizeOptions(options) {
    if (!options) {
      options = {};
    }

    if (typeof options.scrollingCutoff === 'undefined') {
      options.scrollingCutoff = 0.7;
    }

    if (typeof options.scrollingCutoff === 'number') {
      // transform to function
      var cutoffPoint = options.scrollingCutoff;
      options.scrollingCutoff = function(
          distanceFromCaretToTopOfWritingArea, writingAreaHeight) {
            return distanceFromCaretToTopOfWritingArea / writingAreaHeight > cutoffPoint;
        };
    }

    if (typeof options.bottomMarginSize === 'undefined') {
      options.bottomMarginSize = 0.3;
    }

    if (typeof options.bottomMarginSize === 'number') {
      // transform to function
      var coefficient = options.bottomMarginSize;
      options.bottomMarginSize = function(writingAreaHeight) {
        return writingAreaHeight * coefficient;
      };
    }

    return options;
  }

  // Based on code from mst-avaleo (MIT license)
  // Finds the ancestor neighbor with scroll (could be the
  // element itself, too)
  function findScrollableAncestor(element) {
    while(element.parentNode !== document) {
      var elementStyle = window.getComputedStyle(element, null);
      var overflowValue = elementStyle.getPropertyValue('overflow-y');
      if (overflowValue === 'auto') {
        return element;
      }

      element = element.parentNode;
    }

    // we got to document, so there is no scrollable ancestor
    // we will get info from window object
    return window;
  };

  function visibleHeightOfScrollable(scrollable) {
    if(scrollable === window) {
      return scrollable.innerHeight;
    } else {
      return scrollable.offsetHeight;
    }
  }

  function scrollScrollable(scrollable, diff) {
    if(scrollable === window) {
      scrollable.scrollBy(0, diff); // x,y
    } else {
      scrollable.scrollTop += diff;
    }
  }

  function typewrite(textarea, options) {
    options = normalizeOptions(options);

    autosize(textarea);

    var scrollableAncestorEl = findScrollableAncestor(textarea);

    var writingAreaHeight = visibleHeightOfScrollable(scrollableAncestorEl);

    textarea.style.paddingBottom = options.bottomMarginSize(writingAreaHeight) + "px";
    textarea.style.boxSizing = "border-box";

    document.body.style.cursor = "text";

    document.body.onclick = function() {
      textarea.focus();
    }

    var currentHeight = textarea.offsetHeight;

    textarea.addEventListener('autosize:resized', function() {
        var coordinates = getCaretCoordinates(textarea, textarea.selectionEnd);

        // WRITING AREA: the visible area of the container the user writes in.

        // calculate distance of caret from top of the text
        var caretDistanceFromTopOfText = textarea.getBoundingClientRect().top;

        // calculate distance of caret from top of container (could be negative)
        var caretYPosition = caretDistanceFromTopOfText + coordinates.top;

        if(options.scrollingCutoff(caretYPosition, writingAreaHeight)) {
          // move things down
          var newHeight = textarea.offsetHeight;
          var diff = newHeight - currentHeight;
          scrollScrollable(scrollableAncestorEl, diff);
        }

        // update old height regardless
        currentHeight = textarea.offsetHeight;

    });
  }

  module.exports = typewrite;
})();
