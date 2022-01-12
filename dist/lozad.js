/*! lozad.js - v1.16.0-pictureFix - 2022-01-12
* https://github.com/ApoorvSaxena/lozad.js
* Copyright (c) 2022 Apoorv Saxena; Licensed MIT */


(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.lozad = factory());
}(this, (function () { 'use strict';

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  /**
   * Detect IE browser
   * @const {boolean}
   * @private
   */
  var isIE = typeof document !== 'undefined' && document.documentMode;

  /**
   *
   * @param {string} type
   *
   */
  var support = function support(type) {
    return window && window[type];
  };

  var validAttribute = ['data-iesrc', 'data-alt', 'data-src', 'data-srcset', 'data-background-image', 'data-toggle-class'];

  var defaultConfig = {
    rootMargin: '0px',
    threshold: 0,
    enableAutoReload: false,
    load: function load(element) {
      if (element.nodeName.toLowerCase() === 'picture') {
        var imgEl = element.querySelector('img');
        if (imgEl === null) {
          // Check to see if there isn't already an img tag
          var img = document.createElement('img');
          if (isIE && element.getAttribute('data-iesrc')) {
            img.src = element.getAttribute('data-iesrc');
          }

          if (element.getAttribute('data-alt')) {
            img.alt = element.getAttribute('data-alt');
          }

          element.appendChild(img);
        } else {
          // Gets an array of source elements
          // Node list converted to array because some browsers don't support forEach on a node list
          var sourceElements = [].concat(_toConsumableArray(element.querySelectorAll('source')));
          // Loop thrrough them all
          sourceElements.forEach(function (source) {
            // If there is a data-srcset attribute, make it a srcset attribute
            if (source.getAttribute('data-srcset')) {
              source.setAttribute('srcset', source.getAttribute('data-srcset'));
            }
          });
          if (imgEl.getAttribute('data-src')) {
            imgEl.src = imgEl.getAttribute('data-src');
          }

          if (imgEl.getAttribute('data-srcset')) {
            imgEl.setAttribute('srcset', imgEl.getAttribute('data-srcset'));
          }
        }
      }

      if (element.nodeName.toLowerCase() === 'video' && !element.getAttribute('data-src')) {
        if (element.children) {
          var childs = element.children;
          var childSrc = void 0;
          for (var i = 0; i <= childs.length - 1; i++) {
            childSrc = childs[i].getAttribute('data-src');
            if (childSrc) {
              childs[i].src = childSrc;
            }
          }

          element.load();
        }
      }

      if (element.getAttribute('data-poster')) {
        element.poster = element.getAttribute('data-poster');
      }

      if (element.getAttribute('data-src')) {
        element.src = element.getAttribute('data-src');
      }

      if (element.getAttribute('data-srcset')) {
        element.setAttribute('srcset', element.getAttribute('data-srcset'));
      }

      var backgroundImageDelimiter = ',';
      if (element.getAttribute('data-background-delimiter')) {
        backgroundImageDelimiter = element.getAttribute('data-background-delimiter');
      }

      if (element.getAttribute('data-background-image')) {
        element.style.backgroundImage = 'url(\'' + element.getAttribute('data-background-image').split(backgroundImageDelimiter).join('\'),url(\'') + '\')';
      } else if (element.getAttribute('data-background-image-set')) {
        var imageSetLinks = element.getAttribute('data-background-image-set').split(backgroundImageDelimiter);
        var firstUrlLink = imageSetLinks[0].substr(0, imageSetLinks[0].indexOf(' ')) || imageSetLinks[0]; // Substring before ... 1x
        firstUrlLink = firstUrlLink.indexOf('url(') === -1 ? 'url(' + firstUrlLink + ')' : firstUrlLink;
        if (imageSetLinks.length === 1) {
          element.style.backgroundImage = firstUrlLink;
        } else {
          element.setAttribute('style', (element.getAttribute('style') || '') + ('background-image: ' + firstUrlLink + '; background-image: -webkit-image-set(' + imageSetLinks + '); background-image: image-set(' + imageSetLinks + ')'));
        }
      }

      if (element.getAttribute('data-toggle-class')) {
        element.classList.toggle(element.getAttribute('data-toggle-class'));
      }
    },
    loaded: function loaded() {}
  };

  function markAsLoaded(element) {
    element.setAttribute('data-loaded', true);
  }

  function preLoad(element) {
    if (element.getAttribute('data-placeholder-background')) {
      element.style.background = element.getAttribute('data-placeholder-background');
    }
  }

  var isLoaded = function isLoaded(element) {
    return element.getAttribute('data-loaded') === 'true';
  };

  var onIntersection = function onIntersection(load, loaded) {
    return function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.intersectionRatio > 0 || entry.isIntersecting) {
          observer.unobserve(entry.target);

          if (!isLoaded(entry.target)) {
            load(entry.target);
            markAsLoaded(entry.target);
            loaded(entry.target);
          }
        }
      });
    };
  };

  var onMutation = function onMutation(load) {
    return function (entries) {
      entries.forEach(function (entry) {
        if (isLoaded(entry.target) && entry.type === 'attributes' && validAttribute.indexOf(entry.attributeName) > -1) {
          load(entry.target);
        }
      });
    };
  };

  var getElements = function getElements(selector) {
    var root = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

    if (selector instanceof Element) {
      return [selector];
    }

    if (selector instanceof NodeList) {
      return selector;
    }

    return root.querySelectorAll(selector);
  };

  function lozad () {
    var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '.lozad';
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var _Object$assign = Object.assign({}, defaultConfig, options),
        root = _Object$assign.root,
        rootMargin = _Object$assign.rootMargin,
        threshold = _Object$assign.threshold,
        enableAutoReload = _Object$assign.enableAutoReload,
        load = _Object$assign.load,
        loaded = _Object$assign.loaded;

    var observer = void 0;
    var mutationObserver = void 0;
    if (support('IntersectionObserver')) {
      observer = new IntersectionObserver(onIntersection(load, loaded), {
        root: root,
        rootMargin: rootMargin,
        threshold: threshold
      });
    }

    if (support('MutationObserver') && enableAutoReload) {
      mutationObserver = new MutationObserver(onMutation(load, loaded));
    }

    var elements = getElements(selector, root);
    for (var i = 0; i < elements.length; i++) {
      preLoad(elements[i]);
    }

    return {
      observe: function observe() {
        var elements = getElements(selector, root);

        for (var _i = 0; _i < elements.length; _i++) {
          if (isLoaded(elements[_i])) {
            continue;
          }

          if (observer) {
            if (mutationObserver && enableAutoReload) {
              mutationObserver.observe(elements[_i], { subtree: true, attributes: true, attributeFilter: validAttribute });
            }

            observer.observe(elements[_i]);
            continue;
          }

          load(elements[_i]);
          markAsLoaded(elements[_i]);
          loaded(elements[_i]);
        }
      },
      triggerLoad: function triggerLoad(element) {
        if (isLoaded(element)) {
          return;
        }

        load(element);
        markAsLoaded(element);
        loaded(element);
      },

      observer: observer,
      mutationObserver: mutationObserver
    };
  }

  return lozad;

})));
