/**
 * Detect IE browser
 * @const {boolean}
 * @private
 */
const isIE = typeof document !== 'undefined' && document.documentMode

/**
 *
 * @param {string} type
 *
 */
const support = type => window && window[type]

const validAttribute = ['data-iesrc', 'data-alt', 'data-src', 'data-srcset', 'data-background-image', 'data-toggle-class']

const defaultConfig = {
  rootMargin: '0px',
  threshold: 0,
  enableAutoReload: false,
  load(element) {
    if (element.nodeName.toLowerCase() === 'picture') {
      const imgEl = element.querySelector('img')
      if (imgEl === null) { // Check to see if there isn't already an img tag
        const img = document.createElement('img')
        if (isIE && element.getAttribute('data-iesrc')) {
          img.src = element.getAttribute('data-iesrc')
        }

        if (element.getAttribute('data-alt')) {
          img.alt = element.getAttribute('data-alt')
        }

        element.appendChild(img)
      } else {
        // Gets an array of source elements
        // Node list converted to array because some browsers don't support forEach on a node list
        const sourceElements = [...element.querySelectorAll('source')]
        // Loop thrrough them all
        sourceElements.forEach(source => {
          // If there is a data-srcset attribute, make it a srcset attribute
          if (source.getAttribute('data-srcset')) {
            source.setAttribute('srcset', source.getAttribute('data-srcset'))
          }
        })
        if (imgEl.getAttribute('data-src')) {
          imgEl.src = imgEl.getAttribute('data-src')
        }

        if (imgEl.getAttribute('data-srcset')) {
          imgEl.setAttribute('srcset', imgEl.getAttribute('data-srcset'))
        }
      }
    }

    if (element.nodeName.toLowerCase() === 'video' && !element.getAttribute('data-src')) {
      if (element.children) {
        const childs = element.children
        let childSrc
        for (let i = 0; i <= childs.length - 1; i++) {
          childSrc = childs[i].getAttribute('data-src')
          if (childSrc) {
            childs[i].src = childSrc
          }
        }

        element.load()
      }
    }

    if (element.getAttribute('data-poster')) {
      element.poster = element.getAttribute('data-poster')
    }

    if (element.getAttribute('data-src')) {
      element.src = element.getAttribute('data-src')
    }

    if (element.getAttribute('data-srcset')) {
      element.setAttribute('srcset', element.getAttribute('data-srcset'))
    }

    let backgroundImageDelimiter = ','
    if (element.getAttribute('data-background-delimiter')) {
      backgroundImageDelimiter = element.getAttribute('data-background-delimiter')
    }

    if (element.getAttribute('data-background-image')) {
      element.style.backgroundImage = `url('${element.getAttribute('data-background-image').split(backgroundImageDelimiter).join('\'),url(\'')}')`
    } else if (element.getAttribute('data-background-image-set')) {
      const imageSetLinks = element.getAttribute('data-background-image-set').split(backgroundImageDelimiter)
      let firstUrlLink = (imageSetLinks[0].substr(0, imageSetLinks[0].indexOf(' ')) || imageSetLinks[0]) // Substring before ... 1x
      firstUrlLink = firstUrlLink.indexOf('url(') === -1 ? `url(${firstUrlLink})` : firstUrlLink
      if (imageSetLinks.length === 1) {
        element.style.backgroundImage = firstUrlLink
      } else {
        element.setAttribute('style', (element.getAttribute('style') || '') + `background-image: ${firstUrlLink}; background-image: -webkit-image-set(${imageSetLinks}); background-image: image-set(${imageSetLinks})`)
      }
    }

    if (element.getAttribute('data-toggle-class')) {
      element.classList.toggle(element.getAttribute('data-toggle-class'))
    }
  },
  loaded() {}
}

function markAsLoaded(element) {
  element.setAttribute('data-loaded', true)
}

function preLoad(element) {
  if (element.getAttribute('data-placeholder-background')) {
    element.style.background = element.getAttribute('data-placeholder-background')
  }
}

const isLoaded = element => element.getAttribute('data-loaded') === 'true'

const onIntersection = (load, loaded) => (entries, observer) => {
  entries.forEach(entry => {
    if (entry.intersectionRatio > 0 || entry.isIntersecting) {
      observer.unobserve(entry.target)

      if (!isLoaded(entry.target)) {
        load(entry.target)
        markAsLoaded(entry.target)
        loaded(entry.target)
      }
    }
  })
}

const onMutation = load => entries => {
  entries.forEach(entry => {
    if (isLoaded(entry.target) && entry.type === 'attributes' && validAttribute.indexOf(entry.attributeName) > -1) {
      load(entry.target)
    }
  })
}

const getElements = (selector, root = document) => {
  if (selector instanceof Element) {
    return [selector]
  }

  if (selector instanceof NodeList) {
    return selector
  }

  return root.querySelectorAll(selector)
}

export default function (selector = '.lozad', options = {}) {
  const {root, rootMargin, threshold, enableAutoReload, load, loaded} = Object.assign({}, defaultConfig, options)
  let observer
  let mutationObserver
  if (support('IntersectionObserver')) {
    observer = new IntersectionObserver(onIntersection(load, loaded), {
      root,
      rootMargin,
      threshold
    })
  }

  if (support('MutationObserver') && enableAutoReload) {
    mutationObserver = new MutationObserver(onMutation(load, loaded))
  }

  const elements = getElements(selector, root)
  for (let i = 0; i < elements.length; i++) {
    preLoad(elements[i])
  }

  return {
    observe() {
      const elements = getElements(selector, root)

      for (let i = 0; i < elements.length; i++) {
        if (isLoaded(elements[i])) {
          continue
        }

        if (observer) {
          if (mutationObserver && enableAutoReload) {
            mutationObserver.observe(elements[i], {subtree: true, attributes: true, attributeFilter: validAttribute})
          }

          observer.observe(elements[i])
          continue
        }

        load(elements[i])
        markAsLoaded(elements[i])
        loaded(elements[i])
      }
    },
    triggerLoad(element) {
      if (isLoaded(element)) {
        return
      }

      load(element)
      markAsLoaded(element)
      loaded(element)
    },
    observer,
    mutationObserver
  }
}
