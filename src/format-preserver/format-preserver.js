module.exports = (function() {
  'use strict';

  var hasStyle = function(element, key, value) {
    return getComputedStyle(element)[key] === value || element.style[key] === value;
  };

  var isBold = function(element) {
    return hasStyle(element, 'font-weight', 'bold') || element.tagName === 'B';
  };

  var isItalic = function(element) {
    return hasStyle(element, 'font-style', 'italic') || element.tagName === 'I';
  };

  var isUnderline = function(element) {
    return hasStyle(element, 'text-decoration', 'underline') || element.tagName === 'U';
  };

  var marker = {
    bold: {
      test: isBold,
      startMarker: '#BOLD#',
      endMarker: '#ENDBOLD#',
      startStyle: '<span style="font-weight: bold">',
      endStyle: '</span>'
    },
    underline: {
      test: isUnderline,
      startMarker: '#UNDERLINE#',
      endMarker: '#ENDUNDERLINE#',
      startStyle: '<span style="text-decoration: underline">',
      endStyle: '</span>'
    },
    italic: {
      test: isItalic,
      startMarker: '#ITALIC#',
      endMarker: '#ENDITALIC#',
      startStyle: '<span style="font-style: italic">',
      endStyle: '</span>'
    }
  };

  for (var o in marker) {
    var styleMarker = marker[o];
    styleMarker.startRegex = new RegExp(styleMarker.startMarker, 'g');
    styleMarker.endRegex = new RegExp(styleMarker.endMarker, 'g');
  }

  var addMarker = function(element, marker) {
    element.textContent = [marker.startMarker, element.textContent, marker.endMarker].join('');
  };

  var getChildren = function(el) {
    var children = [];

    if (typeof el.length !== 'undefined') {
      for (var i = 0; i < el.length; i++) {
        var e = el[i];

        if (e.nodeType === Node.ELEMENT_NODE) {
          children = children.concat([].slice.call(e.children));
        }
      }

      return children;
    }


    if (el.nodeType === Node.ELEMENT_NODE) {
      return [].slice.call(el.children);
    }

    return [];
  };

  var getHtml = function(element) {
    var html = [];
    var list = [].slice.call(element);
    for (var k in list) {
      var node = list[k];
      switch (node.nodeType) {
        case Node.ELEMENT_NODE:
          html.push(node.innerHTML);
          break;
        case Node.TEXT_NODE:
          html.push(node.nodeValue);
          break;
        default:

      }
    }

    return html.join('');
  };

  var addMarkers = function(element) {
    var children = getChildren(element);

    if (children.length) {
      addMarkers(children);
    }

    for (var o in marker) {
      var styleMarker = marker[o];
      var list = [].slice.call(element);
      for (var k in list) {
        var listItem = list[k];
        if (listItem.nodeType === Node.ELEMENT_NODE && styleMarker.test(listItem)) {
          addMarker(listItem, styleMarker);
        }
      }
    }

    return getHtml(element);
  };

  var replaceMaker = function(element) {
    for (var o in marker) {
      var styleMarker = marker[o];

      element = element.replace(styleMarker.startRegex, styleMarker.startStyle);
      element = element.replace(styleMarker.endRegex, styleMarker.endStyle);

    }

    return element;
  };

  var maskHtmlEntities = function(str) {
    return str.replace(/&/g, '#AMP#');
  };

  var demaskHtmlEntities = function(str) {
    return str.replace(/#AMP#/g, '&')
  };

  var parseHtmlString = function(htmlString) {
    var tmpDocument = document.implementation.createHTMLDocument('parser');
    tmpDocument.body.innerHTML = maskHtmlEntities(htmlString);

    return tmpDocument.body.childNodes;
  };

  return {
    sanitize: function(htmlContent) {
      if (typeof htmlContent !== 'string') {
        return htmlContent;
      }
      var tmp = document.implementation.createHTMLDocument('sandbox').body;
      var elementCollection = parseHtmlString(htmlContent);

      tmp.innerHTML = addMarkers([].slice.call(elementCollection));

      return demaskHtmlEntities(replaceMaker(tmp.textContent || tmp.innerText || ''));
    }
  };
}());
