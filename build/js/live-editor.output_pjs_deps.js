
(function(window, document, Math, undef) {

  var nop = function(){};

  var debug = (function() {
    if ("console" in window) {
      return function(msg) {
        window.console.log('Processing.js: ' + msg);
      };
    }
    return nop();
  }());

  var ajax = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType("text/plain");
    }
    xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT");
    xhr.send(null);
    // failed request?
    if (xhr.status !== 200 && xhr.status !== 0) { throw ("XMLHttpRequest failed, status code " + xhr.status); }
    return xhr.responseText;
  };

  var isDOMPresent = ("document" in this) && !("fake" in this.document);

  // document.head polyfill for the benefit of Firefox 3.6
  document.head = document.head || document.getElementsByTagName('head')[0];

  // Typed Arrays: fallback to WebGL arrays or Native JS arrays if unavailable
  function setupTypedArray(name, fallback) {
    // Check if TypedArray exists, and use if so.
    if (name in window) {
      return window[name];
    }

    // Check if WebGLArray exists
    if (typeof window[fallback] === "function") {
      return window[fallback];
    }

    // Use Native JS array
    return function(obj) {
      if (obj instanceof Array) {
        return obj;
      }
      if (typeof obj === "number") {
        var arr = [];
        arr.length = obj;
        return arr;
      }
    };
  }

  var Float32Array = setupTypedArray("Float32Array", "WebGLFloatArray"),
      Int32Array   = setupTypedArray("Int32Array",   "WebGLIntArray"),
      Uint16Array  = setupTypedArray("Uint16Array",  "WebGLUnsignedShortArray"),
      Uint8Array   = setupTypedArray("Uint8Array",   "WebGLUnsignedByteArray");

  /* Browsers fixes end */

  /**
   * NOTE: in releases we replace symbolic PConstants.* names with their values.
   * Using PConstants.* in code below is fine.  See tools/rewrite-pconstants.js.
   */
  var PConstants = {
    // NOTE(jeresig): Disable some constants as they were confusing users.
    //X: 0,
    //Y: 1,
    //Z: 2,

    //R: 3,
    //G: 4,
    //B: 5,
    //A: 6,

    //U: 7,
    //V: 8,

    NX: 9,
    NY: 10,
    NZ: 11,

    EDGE: 12,

    // Stroke
    SR: 13,
    SG: 14,
    SB: 15,
    SA: 16,

    SW: 17,

    // Transformations (2D and 3D)
    TX: 18,
    TY: 19,
    TZ: 20,

    VX: 21,
    VY: 22,
    VZ: 23,
    VW: 24,

    // Material properties
    AR: 25,
    AG: 26,
    AB: 27,

    DR: 3,
    DG: 4,
    DB: 5,
    DA: 6,

    SPR: 28,
    SPG: 29,
    SPB: 30,

    SHINE: 31,

    ER: 32,
    EG: 33,
    EB: 34,

    BEEN_LIT: 35,

    VERTEX_FIELD_COUNT: 36,

    // Renderers
    P2D:    1,
    JAVA2D: 1,
    WEBGL:  2,
    P3D:    2,
    OPENGL: 2,
    PDF:    0,
    DXF:    0,

    // Platform IDs
    OTHER:   0,
    WINDOWS: 1,
    MAXOSX:  2,
    LINUX:   3,

    EPSILON: 0.0001,

    MAX_FLOAT:  3.4028235e+38,
    MIN_FLOAT: -3.4028235e+38,
    MAX_INT:    2147483647,
    MIN_INT:   -2147483648,

    PI:         Math.PI,
    TWO_PI:     2 * Math.PI,
    HALF_PI:    Math.PI / 2,
    THIRD_PI:   Math.PI / 3,
    QUARTER_PI: Math.PI / 4,

    DEG_TO_RAD: Math.PI / 180,
    RAD_TO_DEG: 180 / Math.PI,

    WHITESPACE: " \t\n\r\f\u00A0",

    // Color modes
    RGB:   1,
    ARGB:  2,
    HSB:   3,
    ALPHA: 4,
    CMYK:  5,

    // Image file types
    TIFF:  0,
    TARGA: 1,
    JPEG:  2,
    GIF:   3,

    // Filter/convert types
    BLUR:      11,
    GRAY:      12,
    INVERT:    13,
    OPAQUE:    14,
    POSTERIZE: 15,
    THRESHOLD: 16,
    ERODE:     17,
    DILATE:    18,

    // Blend modes
    REPLACE:    0,
    BLEND:      1 << 0,
    ADD:        1 << 1,
    SUBTRACT:   1 << 2,
    LIGHTEST:   1 << 3,
    DARKEST:    1 << 4,
    DIFFERENCE: 1 << 5,
    EXCLUSION:  1 << 6,
    MULTIPLY:   1 << 7,
    SCREEN:     1 << 8,
    OVERLAY:    1 << 9,
    HARD_LIGHT: 1 << 10,
    SOFT_LIGHT: 1 << 11,
    DODGE:      1 << 12,
    BURN:       1 << 13,

    // Color component bit masks
    ALPHA_MASK: 0xff000000,
    RED_MASK:   0x00ff0000,
    GREEN_MASK: 0x0000ff00,
    BLUE_MASK:  0x000000ff,

    // Projection matrices
    CUSTOM:       0,
    ORTHOGRAPHIC: 2,
    PERSPECTIVE:  3,

    // Shapes
    POINT:          2,
    POINTS:         2,
    LINE:           4,
    LINES:          4,
    TRIANGLE:       8,
    TRIANGLES:      9,
    TRIANGLE_STRIP: 10,
    TRIANGLE_FAN:   11,
    QUAD:           16,
    QUADS:          16,
    QUAD_STRIP:     17,
    POLYGON:        20,
    PATH:           21,
    RECT:           30,
    ELLIPSE:        31,
    ARC:            32,
    SPHERE:         40,
    BOX:            41,

    GROUP:          0,
    PRIMITIVE:      1,
    //PATH:         21, // shared with Shape PATH
    GEOMETRY:       3,

    // Shape Vertex
    VERTEX:        0,
    BEZIER_VERTEX: 1,
    CURVE_VERTEX:  2,
    BREAK:         3,
    CLOSESHAPE:    4,

    // Shape closing modes
    OPEN:  1,
    CLOSE: 2,

    // Shape drawing modes
    CORNER:          0, // Draw mode convention to use (x, y) to (width, height)
    CORNERS:         1, // Draw mode convention to use (x1, y1) to (x2, y2) coordinates
    RADIUS:          2, // Draw mode from the center, and using the radius
    CENTER_RADIUS:   2, // Deprecated! Use RADIUS instead
    CENTER:          3, // Draw from the center, using second pair of values as the diameter
    DIAMETER:        3, // Synonym for the CENTER constant. Draw from the center
    CENTER_DIAMETER: 3, // Deprecated! Use DIAMETER instead

    // Text vertical alignment modes
    BASELINE: 0,   // Default vertical alignment for text placement
    TOP:      101, // Align text to the top
    BOTTOM:   102, // Align text from the bottom, using the baseline

    // UV Texture coordinate modes
    NORMAL:     1,
    NORMALIZED: 1,
    IMAGE:      2,

    // Text placement modes
    MODEL: 4,
    SHAPE: 5,

    // Stroke modes
    SQUARE:  'butt',
    ROUND:   'round',
    PROJECT: 'square',
    MITER:   'miter',
    BEVEL:   'bevel',

    // Lighting modes
    AMBIENT:     0,
    DIRECTIONAL: 1,
    //POINT:     2, Shared with Shape constant
    SPOT:        3,

    // Key constants

    // Both key and keyCode will be equal to these values
    BACKSPACE: 8,
    TAB:       9,
    ENTER:     10,
    RETURN:    13,
    ESC:       27,
    DELETE:    127,
    CODED:     0xffff,

    // p.key will be CODED and p.keyCode will be this value
    SHIFT:     16,
    CONTROL:   17,
    ALT:       18,
    CAPSLK:    20,
    PGUP:      33,
    PGDN:      34,
    END:       35,
    HOME:      36,
    LEFT:      37,
    UP:        38,
    RIGHT:     39,
    DOWN:      40,
    F1:        112,
    F2:        113,
    F3:        114,
    F4:        115,
    F5:        116,
    F6:        117,
    F7:        118,
    F8:        119,
    F9:        120,
    F10:       121,
    F11:       122,
    F12:       123,
    NUMLK:     144,
    META:      157,
    INSERT:    155,

    // Cursor types
    ARROW:    'default',
    CROSS:    'crosshair',
    HAND:     'pointer',
    MOVE:     'move',
    TEXT:     'text',
    WAIT:     'wait',
    NOCURSOR: "url('data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='), auto",

    // Hints
    DISABLE_OPENGL_2X_SMOOTH:     1,
    ENABLE_OPENGL_2X_SMOOTH:     -1,
    ENABLE_OPENGL_4X_SMOOTH:      2,
    ENABLE_NATIVE_FONTS:          3,
    DISABLE_DEPTH_TEST:           4,
    ENABLE_DEPTH_TEST:           -4,
    ENABLE_DEPTH_SORT:            5,
    DISABLE_DEPTH_SORT:          -5,
    DISABLE_OPENGL_ERROR_REPORT:  6,
    ENABLE_OPENGL_ERROR_REPORT:  -6,
    ENABLE_ACCURATE_TEXTURES:     7,
    DISABLE_ACCURATE_TEXTURES:   -7,
    HINT_COUNT:                  10,

    // PJS defined constants
    SINCOS_LENGTH:      720, // every half degree
    PRECISIONB:         15, // fixed point precision is limited to 15 bits!!
    PRECISIONF:         1 << 15,
    PREC_MAXVAL:        (1 << 15) - 1,
    PREC_ALPHA_SHIFT:   24 - 15,
    PREC_RED_SHIFT:     16 - 15,
    NORMAL_MODE_AUTO:   0,
    NORMAL_MODE_SHAPE:  1,
    NORMAL_MODE_VERTEX: 2,
    MAX_LIGHTS:         8
  };

  /**
   * Returns Java hashCode() result for the object. If the object has the "hashCode" function,
   * it preforms the call of this function. Otherwise it uses/creates the "$id" property,
   * which is used as the hashCode.
   *
   * @param {Object} obj          The object.
   * @returns {int}               The object's hash code.
   */
  function virtHashCode(obj) {
    if (typeof(obj) === "string") {
      var hash = 0;
      for (var i = 0; i < obj.length; ++i) {
        hash = (hash * 31 + obj.charCodeAt(i)) & 0xFFFFFFFF;
      }
      return hash;
    }
    if (typeof(obj) !== "object") {
      return obj & 0xFFFFFFFF;
    }
    if (obj.hashCode instanceof Function) {
      return obj.hashCode();
    }
    if (obj.$id === undef) {
        obj.$id = ((Math.floor(Math.random() * 0x10000) - 0x8000) << 16) | Math.floor(Math.random() * 0x10000);
    }
    return obj.$id;
  }

  /**
   * Returns Java equals() result for two objects. If the first object
   * has the "equals" function, it preforms the call of this function.
   * Otherwise the method uses the JavaScript === operator.
   *
   * @param {Object} obj          The first object.
   * @param {Object} other        The second object.
   *
   * @returns {boolean}           true if the objects are equal.
   */
  function virtEquals(obj, other) {
    if (obj === null || other === null) {
      return (obj === null) && (other === null);
    }
    if (typeof (obj) === "string") {
      return obj === other;
    }
    if (typeof(obj) !== "object") {
      return obj === other;
    }
    if (obj.equals instanceof Function) {
      return obj.equals(other);
    }
    return obj === other;
  }

  // Building defaultScope. Changing of the prototype protects
  // internal Processing code from the changes in defaultScope
  function DefaultScope() {}
  DefaultScope.prototype = PConstants;

  var defaultScope = new DefaultScope();
  defaultScope.PConstants  = PConstants;
  //defaultScope.PImage    = PImage;     // TODO
  //defaultScope.PShape    = PShape;     // TODO
  //defaultScope.PShapeSVG = PShapeSVG;  // TODO

  ////////////////////////////////////////////////////////////////////////////
  // Class inheritance helper methods
  ////////////////////////////////////////////////////////////////////////////

  defaultScope.defineProperty = function(obj, name, desc) {
    if("defineProperty" in Object) {
      Object.defineProperty(obj, name, desc);
    } else {
      if (desc.hasOwnProperty("get")) {
        obj.__defineGetter__(name, desc.get);
      }
      if (desc.hasOwnProperty("set")) {
        obj.__defineSetter__(name, desc.set);
      }
    }
  };

  var colors = {
    aliceblue:            "#f0f8ff",
    antiquewhite:         "#faebd7",
    aqua:                 "#00ffff",
    aquamarine:           "#7fffd4",
    azure:                "#f0ffff",
    beige:                "#f5f5dc",
    bisque:               "#ffe4c4",
    black:                "#000000",
    blanchedalmond:       "#ffebcd",
    blue:                 "#0000ff",
    blueviolet:           "#8a2be2",
    brown:                "#a52a2a",
    burlywood:            "#deb887",
    cadetblue:            "#5f9ea0",
    chartreuse:           "#7fff00",
    chocolate:            "#d2691e",
    coral:                "#ff7f50",
    cornflowerblue:       "#6495ed",
    cornsilk:             "#fff8dc",
    crimson:              "#dc143c",
    cyan:                 "#00ffff",
    darkblue:             "#00008b",
    darkcyan:             "#008b8b",
    darkgoldenrod:        "#b8860b",
    darkgray:             "#a9a9a9",
    darkgreen:            "#006400",
    darkkhaki:            "#bdb76b",
    darkmagenta:          "#8b008b",
    darkolivegreen:       "#556b2f",
    darkorange:           "#ff8c00",
    darkorchid:           "#9932cc",
    darkred:              "#8b0000",
    darksalmon:           "#e9967a",
    darkseagreen:         "#8fbc8f",
    darkslateblue:        "#483d8b",
    darkslategray:        "#2f4f4f",
    darkturquoise:        "#00ced1",
    darkviolet:           "#9400d3",
    deeppink:             "#ff1493",
    deepskyblue:          "#00bfff",
    dimgray:              "#696969",
    dodgerblue:           "#1e90ff",
    firebrick:            "#b22222",
    floralwhite:          "#fffaf0",
    forestgreen:          "#228b22",
    fuchsia:              "#ff00ff",
    gainsboro:            "#dcdcdc",
    ghostwhite:           "#f8f8ff",
    gold:                 "#ffd700",
    goldenrod:            "#daa520",
    gray:                 "#808080",
    green:                "#008000",
    greenyellow:          "#adff2f",
    honeydew:             "#f0fff0",
    hotpink:              "#ff69b4",
    indianred:            "#cd5c5c",
    indigo:               "#4b0082",
    ivory:                "#fffff0",
    khaki:                "#f0e68c",
    lavender:             "#e6e6fa",
    lavenderblush:        "#fff0f5",
    lawngreen:            "#7cfc00",
    lemonchiffon:         "#fffacd",
    lightblue:            "#add8e6",
    lightcoral:           "#f08080",
    lightcyan:            "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgrey:            "#d3d3d3",
    lightgreen:           "#90ee90",
    lightpink:            "#ffb6c1",
    lightsalmon:          "#ffa07a",
    lightseagreen:        "#20b2aa",
    lightskyblue:         "#87cefa",
    lightslategray:       "#778899",
    lightsteelblue:       "#b0c4de",
    lightyellow:          "#ffffe0",
    lime:                 "#00ff00",
    limegreen:            "#32cd32",
    linen:                "#faf0e6",
    magenta:              "#ff00ff",
    maroon:               "#800000",
    mediumaquamarine:     "#66cdaa",
    mediumblue:           "#0000cd",
    mediumorchid:         "#ba55d3",
    mediumpurple:         "#9370d8",
    mediumseagreen:       "#3cb371",
    mediumslateblue:      "#7b68ee",
    mediumspringgreen:    "#00fa9a",
    mediumturquoise:      "#48d1cc",
    mediumvioletred:      "#c71585",
    midnightblue:         "#191970",
    mintcream:            "#f5fffa",
    mistyrose:            "#ffe4e1",
    moccasin:             "#ffe4b5",
    navajowhite:          "#ffdead",
    navy:                 "#000080",
    oldlace:              "#fdf5e6",
    olive:                "#808000",
    olivedrab:            "#6b8e23",
    orange:               "#ffa500",
    orangered:            "#ff4500",
    orchid:               "#da70d6",
    palegoldenrod:        "#eee8aa",
    palegreen:            "#98fb98",
    paleturquoise:        "#afeeee",
    palevioletred:        "#d87093",
    papayawhip:           "#ffefd5",
    peachpuff:            "#ffdab9",
    peru:                 "#cd853f",
    pink:                 "#ffc0cb",
    plum:                 "#dda0dd",
    powderblue:           "#b0e0e6",
    purple:               "#800080",
    red:                  "#ff0000",
    rosybrown:            "#bc8f8f",
    royalblue:            "#4169e1",
    saddlebrown:          "#8b4513",
    salmon:               "#fa8072",
    sandybrown:           "#f4a460",
    seagreen:             "#2e8b57",
    seashell:             "#fff5ee",
    sienna:               "#a0522d",
    silver:               "#c0c0c0",
    skyblue:              "#87ceeb",
    slateblue:            "#6a5acd",
    slategray:            "#708090",
    snow:                 "#fffafa",
    springgreen:          "#00ff7f",
    steelblue:            "#4682b4",
    tan:                  "#d2b48c",
    teal:                 "#008080",
    thistle:              "#d8bfd8",
    tomato:               "#ff6347",
    turquoise:            "#40e0d0",
    violet:               "#ee82ee",
    wheat:                "#f5deb3",
    white:                "#ffffff",
    whitesmoke:           "#f5f5f5",
    yellow:               "#ffff00",
    yellowgreen:          "#9acd32"
  };

  // Unsupported Processing File and I/O operations.
  (function(Processing) {
    var unsupportedP5 = ("open() createOutput() createInput() BufferedReader selectFolder() " +
                         "dataPath() createWriter() selectOutput() beginRecord() " +
                         "saveStream() endRecord() selectInput() saveBytes() createReader() " +
                         "beginRaw() endRaw() PrintWriter delay()").split(" "),
        count = unsupportedP5.length,
        prettyName,
        p5Name;

    function createUnsupportedFunc(n) {
      return function() {
        throw "Processing.js does not support " + n + ".";
      };
    }

    while (count--) {
      prettyName = unsupportedP5[count];
      p5Name = prettyName.replace("()", "");

      Processing[p5Name] = createUnsupportedFunc(prettyName);
    }
  }(defaultScope));

  // screenWidth and screenHeight are shared by all instances.
  // and return the width/height of the browser's viewport.
  defaultScope.defineProperty(defaultScope, 'screenWidth',
    { get: function() { return window.innerWidth; } });

  defaultScope.defineProperty(defaultScope, 'screenHeight',
    { get: function() { return window.innerHeight; } });

  // Manage multiple Processing instances
  var processingInstances = [];
  var processingInstanceIds = {};

  var removeInstance = function(id) {
    processingInstances.splice(processingInstanceIds[id], 1);
    delete processingInstanceIds[id];
  };

  var addInstance = function(processing) {
    if (processing.externals.canvas.id === undef || !processing.externals.canvas.id.length) {
      processing.externals.canvas.id = "__processing" + processingInstances.length;
    }
    processingInstanceIds[processing.externals.canvas.id] = processingInstances.length;
    processingInstances.push(processing);
  };


  ////////////////////////////////////////////////////////////////////////////
  // PFONT.JS START
  ////////////////////////////////////////////////////////////////////////////

  /**
   * [internal function] computeFontMetrics() calculates various metrics for text
   * placement. Currently this function computes the ascent, descent and leading
   * (from "lead", used for vertical space) values for the currently active font.
   */
  function computeFontMetrics(pfont) {
    var emQuad = 250,
        correctionFactor = pfont.size / emQuad,
        canvas = document.createElement("canvas");
    canvas.width = 2*emQuad;
    canvas.height = 2*emQuad;
    canvas.style.opacity = 0;
    var cfmFont = pfont.getCSSDefinition(emQuad+"px", "normal"),
        ctx = canvas.getContext("2d");
    ctx.font = cfmFont;
    pfont.context2d = ctx;

    // Size the canvas using a string with common max-ascent and max-descent letters.
    // Changing the canvas dimensions resets the context, so we must reset the font.
    var protrusions = "dbflkhyjqpg";
    canvas.width = ctx.measureText(protrusions).width;
    ctx.font = cfmFont;

    // for text lead values, we meaure a multiline text container.
    var leadDiv = document.createElement("div");
    leadDiv.style.position = "absolute";
    leadDiv.style.opacity = 0;
    leadDiv.style.fontFamily = '"' + pfont.name + '"';
    leadDiv.style.fontSize = emQuad + "px";
    leadDiv.innerHTML = protrusions + "<br/>" + protrusions;
    document.body.appendChild(leadDiv);

    var w = canvas.width,
        h = canvas.height,
        baseline = h/2;

    // Set all canvas pixeldata values to 255, with all the content
    // data being 0. This lets us scan for data[i] != 255.
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "black";
    ctx.fillText(protrusions, 0, baseline);
    var pixelData = ctx.getImageData(0, 0, w, h).data;

    // canvas pixel data is w*4 by h*4, because R, G, B and A are separate,
    // consecutive values in the array, rather than stored as 32 bit ints.
    var i = 0,
        w4 = w * 4,
        len = pixelData.length;

    // Finding the ascent uses a normal, forward scanline
    while (++i < len && pixelData[i] === 255) {
      nop();
    }
    var ascent = Math.round(i / w4);

    // Finding the descent uses a reverse scanline
    i = len - 1;
    while (--i > 0 && pixelData[i] === 255) {
      nop();
    }
    var descent = Math.round(i / w4);

    // set font metrics
    pfont.ascent = correctionFactor * (baseline - ascent);
    pfont.descent = correctionFactor * (descent - baseline);

    // Then we try to get the real value from the browser
    if (document.defaultView.getComputedStyle) {
      var leadDivHeight = document.defaultView.getComputedStyle(leadDiv,null).getPropertyValue("height");
      leadDivHeight = correctionFactor * leadDivHeight.replace("px","");
      if (leadDivHeight >= pfont.size * 2) {
        pfont.leading = Math.round(leadDivHeight/2);
      }
    }
    document.body.removeChild(leadDiv);
  }

  // Defines system (non-SVG) font.
  function PFont(name, size) {
    // according to the P5 API, new PFont() is legal (albeit completely useless)
    if (name === undef) {
      name = "";
    }
    this.name = name;
    if (size === undef) {
      size = 0;
    }
    this.size = size;
    this.glyph = false;
    this.ascent = 0;
    this.descent = 0;
    // For leading, the "safe" value uses the standard TEX ratio
    this.leading = 1.2 * size;

    // Note that an italic, bold font must used "... Bold Italic"
    // in P5. "... Italic Bold" is treated as normal/normal.
    var illegalIndicator = name.indexOf(" Italic Bold");
    if (illegalIndicator !== -1) {
      name = name.substring(0, illegalIndicator);
    }

    // determine font style
    this.style = "normal";
    var italicsIndicator = name.indexOf(" Italic");
    if (italicsIndicator !== -1) {
      name = name.substring(0, italicsIndicator);
      this.style = "italic";
    }

    // determine font weight
    this.weight = "normal";
    var boldIndicator = name.indexOf(" Bold");
    if (boldIndicator !== -1) {
      name = name.substring(0, boldIndicator);
      this.weight = "bold";
    }

    // determine font-family name
    this.family = "sans-serif";
    if (name !== undef) {
      switch(name) {
        case "sans-serif":
        case "serif":
        case "monospace":
        case "fantasy":
        case "cursive":
          this.family = name;
          break;
        default:
          this.family = '"' + name + '", sans-serif';
          break;
      }
    }
    // Calculate the ascent/descent/leading value based on
    // how the browser renders this font.
    this.context2d = null;
    computeFontMetrics(this);
    this.css = this.getCSSDefinition();
    this.context2d.font = this.css;
  }

  /**
  * This function generates the CSS "font" string for this PFont
  */
  PFont.prototype.getCSSDefinition = function(fontSize, lineHeight) {
    if(fontSize===undef) {
      fontSize = this.size + "px";
    }
    if(lineHeight===undef) {
      lineHeight = this.leading + "px";
    }
    // CSS "font" definition: font-style font-variant font-weight font-size/line-height font-family
    var components = [this.style, "normal", this.weight, fontSize + "/" + lineHeight, this.family];
    return components.join(" ");
  };

  /**
  * We cannot rely on there being a 2d context available,
  * because we support OPENGL sketches, and canvas3d has
  * no "measureText" function in the API.
  */
  PFont.prototype.measureTextWidth = function(string) {
    return this.context2d.measureText(string).width;
  };

  /**
  * Global "loaded fonts" list, internal to PFont
  */
  PFont.PFontCache = {};

  /**
  * This function acts as single access point for getting and caching
  * fonts across all sketches handled by an instance of Processing.js
  */
  PFont.get = function(fontName, fontSize) {
    var cache = PFont.PFontCache;
    var idx = fontName+"/"+fontSize;
    if (!cache[idx]) {
      cache[idx] = new PFont(fontName, fontSize);
    }
    return cache[idx];
  };

  /**
  * Lists all standard fonts. Due to browser limitations, this list is
  * not the system font list, like in P5, but the CSS "genre" list.
  */
  PFont.list = function() {
    return ["sans-serif", "serif", "monospace", "fantasy", "cursive"];
  };

  /**
  * Loading external fonts through @font-face rules is handled by PFont,
  * to ensure fonts loaded in this way are globally available.
  */
  PFont.preloading = {
    // template element used to compare font sizes
    template: {},
    // indicates whether or not the reference tiny font has been loaded
    initialized: false,
    // load the reference tiny font via a css @font-face rule
    initialize: function() {
      var generateTinyFont = function() {
        var encoded = "#E3KAI2wAgT1MvMg7Eo3VmNtYX7ABi3CxnbHlm" +
                      "7Abw3kaGVhZ7ACs3OGhoZWE7A53CRobXR47AY3" +
                      "AGbG9jYQ7G03Bm1heH7ABC3CBuYW1l7Ae3AgcG" +
                      "9zd7AI3AE#B3AQ2kgTY18PPPUACwAg3ALSRoo3" +
                      "#yld0xg32QAB77#E777773B#E3C#I#Q77773E#" +
                      "Q7777777772CMAIw7AB77732B#M#Q3wAB#g3B#" +
                      "E#E2BB//82BB////w#B7#gAEg3E77x2B32B#E#" +
                      "Q#MTcBAQ32gAe#M#QQJ#E32M#QQJ#I#g32Q77#";
        var expand = function(input) {
                       return "AAAAAAAA".substr(~~input ? 7-input : 6);
                     };
        return encoded.replace(/[#237]/g, expand);
      };
      var fontface = document.createElement("style");
      fontface.setAttribute("type","text/css");
      fontface.innerHTML =  "@font-face {\n" +
                            '  font-family: "PjsEmptyFont";' + "\n" +
                            "  src: url('data:application/x-font-ttf;base64,"+generateTinyFont()+"')\n" +
                            "       format('truetype');\n" +
                            "}";
      document.head.appendChild(fontface);

      // set up the template element
      var element = document.createElement("span");
      element.style.cssText = 'position: absolute; top: 0; left: 0; opacity: 0; font-family: "PjsEmptyFont", fantasy;';
      element.innerHTML = "AAAAAAAA";
      document.body.appendChild(element);
      this.template = element;

      this.initialized = true;
    },
    // Shorthand function to get the computed width for an element.
    getElementWidth: function(element) {
      return document.defaultView.getComputedStyle(element,"").getPropertyValue("width");
    },
    // time taken so far in attempting to load a font
    timeAttempted: 0,
    // returns false if no fonts are pending load, or true otherwise.
    pending: function(intervallength) {
      if (!this.initialized) {
        this.initialize();
      }
      var element,
          computedWidthFont,
          computedWidthRef = this.getElementWidth(this.template);
      for (var i = 0; i < this.fontList.length; i++) {
        // compares size of text in pixels. if equal, custom font is not yet loaded
        element = this.fontList[i];
        computedWidthFont = this.getElementWidth(element);
        if (this.timeAttempted < 4000 && computedWidthFont === computedWidthRef) {
          this.timeAttempted += intervallength;
          return true;
        } else {
          document.body.removeChild(element);
          this.fontList.splice(i--, 1);
          this.timeAttempted = 0;
        }
      }
      // if there are no more fonts to load, pending is false
      if (this.fontList.length === 0) {
        return false;
      }
      // We should have already returned before getting here.
      // But, if we do get here, length!=0 so fonts are pending.
      return true;
    },
    // fontList contains elements to compare font sizes against a template
    fontList: [],
    // addedList contains the fontnames of all the fonts loaded via @font-face
    addedList: {},
    // adds a font to the font cache
    // creates an element using the font, to start loading the font,
    // and compare against a default font to see if the custom font is loaded
    add: function(fontSrc) {
      if (!this.initialized) {
       this.initialize();
      }
      // fontSrc can be a string or a javascript object
      // acceptable fonts are .ttf, .otf, and data uri
      var fontName = (typeof fontSrc === 'object' ? fontSrc.fontFace : fontSrc),
          fontUrl = (typeof fontSrc === 'object' ? fontSrc.url : fontSrc);

      // check whether we already created the @font-face rule for this font
      if (this.addedList[fontName]) {
        return;
      }

      // if we didn't, create the @font-face rule
      var style = document.createElement("style");
      style.setAttribute("type","text/css");
      style.innerHTML = "@font-face{\n  font-family: '" + fontName + "';\n  src:  url('" + fontUrl + "');\n}\n";
      document.head.appendChild(style);
      this.addedList[fontName] = true;

      // also create the element to load and compare the new font
      var element = document.createElement("span");
      element.style.cssText = "position: absolute; top: 0; left: 0; opacity: 0;";
      element.style.fontFamily = '"' + fontName + '", "PjsEmptyFont", fantasy';
      element.innerHTML = "AAAAAAAA";
      document.body.appendChild(element);
      this.fontList.push(element);
    }
  };


  // add to the default scope
  defaultScope.PFont = PFont;


  ////////////////////////////////////////////////////////////////////////////
  // PFONT.JS END
  ////////////////////////////////////////////////////////////////////////////


  var Processing = this.Processing = function(aCanvas, aCode) {
    // Previously we allowed calling Processing as a func instead of ctor, but no longer.
    if (!(this instanceof Processing)) {
      throw("called Processing constructor as if it were a function: missing 'new'.");
    }

    var curElement,
      pgraphicsMode = (aCanvas === undef && aCode === undef);

    if (pgraphicsMode) {
      curElement = document.createElement("canvas");
    } else {
      // We'll take a canvas element or a string for a canvas element's id
      curElement = typeof aCanvas === "string" ? document.getElementById(aCanvas) : aCanvas;
    }

    if (!(curElement instanceof HTMLCanvasElement)) {
      throw("called Processing constructor without passing canvas element reference or id.");
    }

    function unimplemented(s) {
      Processing.debug('Unimplemented - ' + s);
    }

    // When something new is added to "p." it must also be added to the "names" array.
    // The names array contains the names of everything that is inside "p."
    var p = this;

    // PJS specific (non-p5) methods and properties to externalize
    p.externals = {
      canvas:  curElement,
      context: undef,
      sketch:  undef
    };

    p.name            = 'Processing.js Instance'; // Set Processing defaults / environment variables
    p.use3DContext    = false; // default '2d' canvas context

    /**
     * Confirms if a Processing program is "focused", meaning that it is
     * active and will accept input from mouse or keyboard. This variable
     * is "true" if it is focused and "false" if not. This variable is
     * often used when you want to warn people they need to click on the
     * browser before it will work.
    */
    p.focused         = false;
    p.breakShape      = false;

    // Glyph path storage for textFonts
    p.glyphTable      = {};

    // Global vars for tracking mouse position
    p.pmouseX         = 0;
    p.pmouseY         = 0;
    p.mouseX          = 0;
    p.mouseY          = 0;
    p.mouseButton     = 0;
    p.mouseScroll     = 0;

    // Undefined event handlers to be replaced by user when needed
    p.mouseClicked    = undef;
    p.mouseDragged    = undef;
    p.mouseMoved      = undef;
    p.mousePressed    = undef;
    p.mouseReleased   = undef;
    p.mouseScrolled   = undef;
    p.mouseOver       = undef;
    p.mouseOut        = undef;
    p.touchStart      = undef;
    p.touchEnd        = undef;
    p.touchMove       = undef;
    p.touchCancel     = undef;
    p.key             = undef;
    p.keyCode         = undef;
    p.keyPressed      = nop; // needed to remove function checks
    p.keyReleased     = nop;
    p.keyTyped        = nop;
    p.draw            = undef;
    p.setup           = undef;

    // Remapped vars
    p.__mousePressed  = false;
    p.__keyPressed    = false;
    p.__frameRate     = 60;

    // XXX(jeresig): Added mouseIsPressed/keyIsPressed
    p.mouseIsPressed = false;
    p.keyIsPressed = false;

    // The current animation frame
    p.frameCount      = 0;

    // The height/width of the canvas
    p.width           = 100;
    p.height          = 100;

    // XXX(jeresig)
    p.angleMode = "radians";

    var PVector = p.PVector = (function() {
      function PVector(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
      }

      PVector.fromAngle = function(angle, v) {
        if (v === undef || v === null) {
          v = new PVector();
        }
        // XXX(jeresig)
        v.x = p.cos(angle);
        v.y = p.sin(angle);
        return v;
      };

      PVector.random2D = function(v) {
        return PVector.fromAngle(Math.random() * 360, v);
      };

      PVector.random3D = function(v) {
        var angle = Math.random() * 360;
        var vz = Math.random() * 2 - 1;
        var mult = Math.sqrt(1 - vz * vz);
        // XXX(jeresig)
        var vx = mult * p.cos(angle);
        var vy = mult * p.sin(angle);
        if (v === undef || v === null) {
          v = new PVector(vx, vy, vz);
        } else {
          v.set(vx, vy, vz);
        }
        return v;
      };

      PVector.dist = function(v1, v2) {
        return v1.dist(v2);
      };

      PVector.dot = function(v1, v2) {
        return v1.dot(v2);
      };

      PVector.cross = function(v1, v2) {
        return v1.cross(v2);
      };

      PVector.sub = function(v1, v2) {
        return new PVector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
      };

      PVector.angleBetween = function(v1, v2) {
        // XXX(jeresig)
        return p.acos(v1.dot(v2) / (v1.mag() * v2.mag()));
      };

      PVector.lerp = function(v1, v2, amt) {
        // non-static lerp mutates object, but this version returns a new vector
        var retval = new PVector(v1.x, v1.y, v1.z);
        retval.lerp(v2, amt);
        return retval;
      };

      // Common vector operations for PVector
      PVector.prototype = {
        set: function(v, y, z) {
          if (arguments.length === 1) {
            this.set(v.x || v[0] || 0,
                     v.y || v[1] || 0,
                     v.z || v[2] || 0);
          } else {
            this.x = v;
            this.y = y;
            this.z = z;
          }
        },
        get: function() {
          return new PVector(this.x, this.y, this.z);
        },
        mag: function() {
          var x = this.x,
              y = this.y,
              z = this.z;
          return Math.sqrt(x * x + y * y + z * z);
        },
        magSq: function() {
          var x = this.x,
              y = this.y,
              z = this.z;
          return (x * x + y * y + z * z);
        },
        setMag: function(v_or_len, len) {
          if (len === undef) {
            len = v_or_len;
            this.normalize();
            this.mult(len);
          } else {
            var v = v_or_len;
            v.normalize();
            v.mult(len);
            return v;
          }
        },
        add: function(v, y, z) {
          if (arguments.length === 1) {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
          } else {
            this.x += v;
            this.y += y;
            this.z += z;
          }
        },
        sub: function(v, y, z) {
          if (arguments.length === 1) {
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
          } else {
            this.x -= v;
            this.y -= y;
            this.z -= z;
          }
        },
        mult: function(v) {
          if (typeof v === 'number') {
            this.x *= v;
            this.y *= v;
            this.z *= v;
          } else {
            this.x *= v.x;
            this.y *= v.y;
            this.z *= v.z;
          }
        },
        div: function(v) {
          if (typeof v === 'number') {
            this.x /= v;
            this.y /= v;
            this.z /= v;
          } else {
            this.x /= v.x;
            this.y /= v.y;
            this.z /= v.z;
          }
        },
        rotate: function(angle) {
          var prev_x = this.x;
          var c = p.cos(angle);
          var s = p.sin(angle);
          this.x = c * this.x - s * this.y;
          this.y = s * prev_x + c * this.y;
        },
        dist: function(v) {
          var dx = this.x - v.x,
              dy = this.y - v.y,
              dz = this.z - v.z;
          return Math.sqrt(dx * dx + dy * dy + dz * dz);
        },
        dot: function(v, y, z) {
          if (arguments.length === 1) {
            return (this.x * v.x + this.y * v.y + this.z * v.z);
          }
          return (this.x * v + this.y * y + this.z * z);
        },
        cross: function(v) {
          var x = this.x,
              y = this.y,
              z = this.z;
          return new PVector(y * v.z - v.y * z,
                             z * v.x - v.z * x,
                             x * v.y - v.x * y);
        },
        lerp: function(v_or_x, amt_or_y, z, amt) {
          var lerp_val = function(start, stop, amt) {
            return start + (stop - start) * amt;
          };
          var x, y;
          if (arguments.length === 2) {
            // given vector and amt
            amt = amt_or_y;
            x = v_or_x.x;
            y = v_or_x.y;
            z = v_or_x.z;
          } else {
            // given x, y, z and amt
            x = v_or_x;
            y = amt_or_y;
          }
          this.x = lerp_val(this.x, x, amt);
          this.y = lerp_val(this.y, y, amt);
          this.z = lerp_val(this.z, z, amt);
        },
        normalize: function() {
          var m = this.mag();
          if (m > 0) {
            this.div(m);
          }
        },
        limit: function(high) {
          if (this.mag() > high) {
            this.normalize();
            this.mult(high);
          }
        },
        heading: function() {
          // XXX(jeresig)
          return -p.atan2(-this.y, this.x);
        },
        heading2D: function() {
          return this.heading();
        },
        toString: function() {
          return "[" + this.x + ", " + this.y + ", " + this.z + "]";
        },
        array: function() {
          return [this.x, this.y, this.z];
        }
      };

      function createPVectorMethod(method) {
        return function(v1, v2) {
          var v = v1.get();
          v[method](v2);
          return v;
        };
      }

      // Create the static methods of PVector automatically
      // We don't do toString because it causes a TypeError 
      //  when attempting to stringify PVector
      for (var method in PVector.prototype) {
        if (PVector.prototype.hasOwnProperty(method) && !PVector.hasOwnProperty(method) &&
              method !== "toString") {
          PVector[method] = createPVectorMethod(method);
        }
      }

      return PVector;
    }());

    // "Private" variables used to maintain state
    var curContext,
        curSketch,
        drawing, // hold a Drawing2D object
        online = true,
        doFill = true,
        fillStyle = [1.0, 1.0, 1.0, 1.0],
        currentFillColor = 0xFFFFFFFF,
        isFillDirty = true,
        doStroke = true,
        strokeStyle = [0.0, 0.0, 0.0, 1.0],
        currentStrokeColor = 0xFF000000,
        isStrokeDirty = true,
        lineWidth = 1,
        loopStarted = false,
        renderSmooth = false,
        doLoop = true,
        looping = 0,
        curRectMode = PConstants.CORNER,
        curEllipseMode = PConstants.CENTER,
        normalX = 0,
        normalY = 0,
        normalZ = 0,
        normalMode = PConstants.NORMAL_MODE_AUTO,
        curFrameRate = 60,
        curMsPerFrame = 1000/curFrameRate,
        curCursor = PConstants.ARROW,
        oldCursor = curElement.style.cursor,
        curShape = PConstants.POLYGON,
        curShapeCount = 0,
        curvePoints = [],
        curTightness = 0,
        curveDet = 20,
        curveInited = false,
        backgroundObj = -3355444, // rgb(204, 204, 204) is the default gray background colour
        bezDetail = 20,
        colorModeA = 255,
        colorModeX = 255,
        colorModeY = 255,
        colorModeZ = 255,
        pathOpen = false,
        mouseDragging = false,
        pmouseXLastFrame = 0,
        pmouseYLastFrame = 0,
        curColorMode = PConstants.RGB,
        curTint = null,
        curTint3d = null,
        getLoaded = false,
        start = Date.now(),
        timeSinceLastFPS = start,
        framesSinceLastFPS = 0,
        textcanvas,
        curveBasisMatrix,
        curveToBezierMatrix,
        curveDrawMatrix,
        bezierDrawMatrix,
        bezierBasisInverse,
        bezierBasisMatrix,
        curContextCache = { attributes: {}, locations: {} },
        // Shaders
        programObject3D,
        programObject2D,
        programObjectUnlitShape,
        boxBuffer,
        boxNormBuffer,
        boxOutlineBuffer,
        rectBuffer,
        rectNormBuffer,
        sphereBuffer,
        lineBuffer,
        fillBuffer,
        fillColorBuffer,
        strokeColorBuffer,
        pointBuffer,
        shapeTexVBO,
        canTex,   // texture for createGraphics
        textTex,   // texture for 3d tex
        curTexture = {width:0,height:0},
        curTextureMode = PConstants.IMAGE,
        usingTexture = false,
        textBuffer,
        textureBuffer,
        indexBuffer,
        // Text alignment
        horizontalTextAlignment = PConstants.LEFT,
        verticalTextAlignment = PConstants.BASELINE,
        textMode = PConstants.MODEL,
        // Font state
        curFontName = "Arial",
        curTextSize = 12,
        curTextAscent = 9,
        curTextDescent = 2,
        curTextLeading = 14,
        curTextFont = PFont.get(curFontName, curTextSize),
        // Pixels cache
        originalContext,
        proxyContext = null,
        isContextReplaced = false,
        setPixelsCached,
        maxPixelsCached = 1000,
        pressedKeysMap = [],
        lastPressedKeyCode = null,
        codedKeys = [ PConstants.SHIFT, PConstants.CONTROL, PConstants.ALT, PConstants.CAPSLK, PConstants.PGUP, PConstants.PGDN,
                      PConstants.END, PConstants.HOME, PConstants.LEFT, PConstants.UP, PConstants.RIGHT, PConstants.DOWN, PConstants.NUMLK,
                      PConstants.INSERT, PConstants.F1, PConstants.F2, PConstants.F3, PConstants.F4, PConstants.F5, PConstants.F6, PConstants.F7,
                      PConstants.F8, PConstants.F9, PConstants.F10, PConstants.F11, PConstants.F12, PConstants.META ];

    // Get padding and border style widths for mouse offsets
    var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;

    if (document.defaultView && document.defaultView.getComputedStyle) {
      stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(curElement, null)['paddingLeft'], 10)      || 0;
      stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(curElement, null)['paddingTop'], 10)       || 0;
      styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(curElement, null)['borderLeftWidth'], 10)  || 0;
      styleBorderTop   = parseInt(document.defaultView.getComputedStyle(curElement, null)['borderTopWidth'], 10)   || 0;
    }

    // User can only have MAX_LIGHTS lights
    var lightCount = 0;

    //sphere stuff
    var sphereDetailV = 0,
        sphereDetailU = 0,
        sphereX = [],
        sphereY = [],
        sphereZ = [],
        sinLUT = new Float32Array(PConstants.SINCOS_LENGTH),
        cosLUT = new Float32Array(PConstants.SINCOS_LENGTH),
        sphereVerts,
        sphereNorms;

    // Camera defaults and settings
    var cam,
        cameraInv,
        modelView,
        modelViewInv,
        userMatrixStack,
        userReverseMatrixStack,
        inverseCopy,
        projection,
        manipulatingCamera = false,
        frustumMode = false,
        cameraFOV = 60 * (Math.PI / 180),
        cameraX = p.width / 2,
        cameraY = p.height / 2,
        cameraZ = cameraY / Math.tan(cameraFOV / 2),
        cameraNear = cameraZ / 10,
        cameraFar = cameraZ * 10,
        cameraAspect = p.width / p.height;

    var vertArray = [],
        curveVertArray = [],
        curveVertCount = 0,
        isCurve = false,
        isBezier = false,
        firstVert = true;

    //PShape stuff
    var curShapeMode = PConstants.CORNER;

    // Stores states for pushStyle() and popStyle().
    var styleArray = [];

    ////////////////////////////////////////////////////////////////////////////
    // 2D/3D drawing handling
    ////////////////////////////////////////////////////////////////////////////
    var imageModeCorner = function(x, y, w, h, whAreSizes) {
      return {
        x: x,
        y: y,
        w: w,
        h: h
      };
    };
    var imageModeConvert = imageModeCorner;

    var imageModeCorners = function(x, y, w, h, whAreSizes) {
      return {
        x: x,
        y: y,
        w: whAreSizes ? w : w - x,
        h: whAreSizes ? h : h - y
      };
    };

    var imageModeCenter = function(x, y, w, h, whAreSizes) {
      return {
        x: x - w / 2,
        y: y - h / 2,
        w: w,
        h: h
      };
    };

    // Objects for shared, 2D and 3D contexts
    var DrawingShared = function(){};
    var Drawing2D = function(){};
    var DrawingPre = function(){};

    // Setup the prototype chain
    Drawing2D.prototype = new DrawingShared();
    Drawing2D.prototype.constructor = Drawing2D;
    DrawingPre.prototype = new DrawingShared();
    DrawingPre.prototype.constructor = DrawingPre;

    // A no-op function for when the user calls 3D functions from a 2D sketch
    // We can change this to a throw or console.error() later if we want
    DrawingShared.prototype.a3DOnlyFunction = nop;

    ////////////////////////////////////////////////////////////////////////////
    // Char handling
    ////////////////////////////////////////////////////////////////////////////
    var charMap = {};

    var Char = p.Character = function(chr) {
      if (typeof chr === 'string' && chr.length === 1) {
        this.code = chr.charCodeAt(0);
      } else if (typeof chr === 'number') {
        this.code = chr;
      } else if (chr instanceof Char) {
        this.code = chr;
      } else {
        this.code = NaN;
      }

      return (charMap[this.code] === undef) ? charMap[this.code] = this : charMap[this.code];
    };

    Char.prototype.toString = function() {
      return String.fromCharCode(this.code);
    };

    Char.prototype.valueOf = function() {
      return this.code;
    };

    ////////////////////////////////////////////////////////////////////////////
    // 2D Matrix
    ////////////////////////////////////////////////////////////////////////////
    /**
     * Helper function for printMatrix(). Finds the largest scalar
     * in the matrix, then number of digits left of the decimal.
     * Call from PMatrix2D and PMatrix3D's print() function.
     */
    var printMatrixHelper = function(elements) {
      var big = 0;
      for (var i = 0; i < elements.length; i++) {
        if (i !== 0) {
          big = Math.max(big, Math.abs(elements[i]));
        } else {
          big = Math.abs(elements[i]);
        }
      }

      var digits = (big + "").indexOf(".");
      if (digits === 0) {
        digits = 1;
      } else if (digits === -1) {
        digits = (big + "").length;
      }

      return digits;
    };
    /**
     * PMatrix2D is a 3x2 affine matrix implementation. The constructor accepts another PMatrix2D or a list of six float elements.
     * If no parameters are provided the matrix is set to the identity matrix.
     *
     * @param {PMatrix2D} matrix  the initial matrix to set to
     * @param {float} m00         the first element of the matrix
     * @param {float} m01         the second element of the matrix
     * @param {float} m02         the third element of the matrix
     * @param {float} m10         the fourth element of the matrix
     * @param {float} m11         the fifth element of the matrix
     * @param {float} m12         the sixth element of the matrix
     */
    var PMatrix2D = p.PMatrix2D = function() {
      if (arguments.length === 0) {
        this.reset();
      } else if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) {
        this.set(arguments[0].array());
      } else if (arguments.length === 6) {
        this.set(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
      }
    };
    /**
     * PMatrix2D methods
     */
    PMatrix2D.prototype = {
      /**
       * @member PMatrix2D
       * The set() function sets the matrix elements. The function accepts either another PMatrix2D, an array of elements, or a list of six floats.
       *
       * @param {PMatrix2D} matrix    the matrix to set this matrix to
       * @param {float[]} elements    an array of elements to set this matrix to
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the third element of the matrix
       * @param {float} m10           the fourth element of the matrix
       * @param {float} m11           the fith element of the matrix
       * @param {float} m12           the sixth element of the matrix
       */
      set: function() {
        if (arguments.length === 6) {
          var a = arguments;
          this.set([a[0], a[1], a[2],
                    a[3], a[4], a[5]]);
        } else if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) {
          this.elements = arguments[0].array();
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          this.elements = arguments[0].slice();
        }
      },
      /**
       * @member PMatrix2D
       * The get() function returns a copy of this PMatrix2D.
       *
       * @return {PMatrix2D} a copy of this PMatrix2D
       */
      get: function() {
        var outgoing = new PMatrix2D();
        outgoing.set(this.elements);
        return outgoing;
      },
      /**
       * @member PMatrix2D
       * The reset() function sets this PMatrix2D to the identity matrix.
       */
      reset: function() {
        this.set([1, 0, 0, 0, 1, 0]);
      },
      /**
       * @member PMatrix2D
       * The array() function returns a copy of the element values.
       * @addon
       *
       * @return {float[]} returns a copy of the element values
       */
      array: function array() {
        return this.elements.slice();
      },
      /**
       * @member PMatrix2D
       * The translate() function translates this matrix by moving the current coordinates to the location specified by tx and ty.
       *
       * @param {float} tx  the x-axis coordinate to move to
       * @param {float} ty  the y-axis coordinate to move to
       */
      translate: function(tx, ty) {
        this.elements[2] = tx * this.elements[0] + ty * this.elements[1] + this.elements[2];
        this.elements[5] = tx * this.elements[3] + ty * this.elements[4] + this.elements[5];
      },
      /**
       * @member PMatrix2D
       * The invTranslate() function translates this matrix by moving the current coordinates to the negative location specified by tx and ty.
       *
       * @param {float} tx  the x-axis coordinate to move to
       * @param {float} ty  the y-axis coordinate to move to
       */
      invTranslate: function(tx, ty) {
        this.translate(-tx, -ty);
      },
       /**
       * @member PMatrix2D
       * The transpose() function is not used in processingjs.
       */
      transpose: function() {
        // Does nothing in Processing.
      },
      /**
       * @member PMatrix2D
       * The mult() function multiplied this matrix.
       * If two array elements are passed in the function will multiply a two element vector against this matrix.
       * If target is null or not length four, a new float array will be returned.
       * The values for vec and target can be the same (though that's less efficient).
       * If two PVectors are passed in the function multiply the x and y coordinates of a PVector against this matrix.
       *
       * @param {PVector} source, target  the PVectors used to multiply this matrix
       * @param {float[]} source, target  the arrays used to multiply this matrix
       *
       * @return {PVector|float[]} returns a PVector or an array representing the new matrix
       */
      mult: function(source, target) {
        var x, y;
        if (source instanceof PVector) {
          x = source.x;
          y = source.y;
          if (!target) {
            target = new PVector();
          }
        } else if (source instanceof Array) {
          x = source[0];
          y = source[1];
          if (!target) {
            target = [];
          }
        }
        if (target instanceof Array) {
          target[0] = this.elements[0] * x + this.elements[1] * y + this.elements[2];
          target[1] = this.elements[3] * x + this.elements[4] * y + this.elements[5];
        } else if (target instanceof PVector) {
          target.x = this.elements[0] * x + this.elements[1] * y + this.elements[2];
          target.y = this.elements[3] * x + this.elements[4] * y + this.elements[5];
          target.z = 0;
        }
        return target;
      },
      /**
       * @member PMatrix2D
       * The multX() function calculates the x component of a vector from a transformation.
       *
       * @param {float} x the x component of the vector being transformed
       * @param {float} y the y component of the vector being transformed
       *
       * @return {float} returnes the result of the calculation
       */
      multX: function(x, y) {
        return (x * this.elements[0] + y * this.elements[1] + this.elements[2]);
      },
      /**
       * @member PMatrix2D
       * The multY() function calculates the y component of a vector from a transformation.
       *
       * @param {float} x the x component of the vector being transformed
       * @param {float} y the y component of the vector being transformed
       *
       * @return {float} returnes the result of the calculation
       */
      multY: function(x, y) {
        return (x * this.elements[3] + y * this.elements[4] + this.elements[5]);
      },
      /**
       * @member PMatrix2D
       * The skewX() function skews the matrix along the x-axis the amount specified by the angle parameter.
       * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
       *
       * @param {float} angle  angle of skew specified in radians
       */
      skewX: function(angle) {
        this.apply(1, 0, 1, angle, 0, 0);
      },
      /**
       * @member PMatrix2D
       * The skewY() function skews the matrix along the y-axis the amount specified by the angle parameter.
       * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
       *
       * @param {float} angle  angle of skew specified in radians
       */
      skewY: function(angle) {
        this.apply(1, 0, 1,  0, angle, 0);
      },
      /**
       * @member PMatrix2D
       * The determinant() function calvculates the determinant of this matrix.
       *
       * @return {float} the determinant of the matrix
       */
      determinant: function() {
        return (this.elements[0] * this.elements[4] - this.elements[1] * this.elements[3]);
      },
      /**
       * @member PMatrix2D
       * The invert() function inverts this matrix
       *
       * @return {boolean} true if successful
       */
      invert: function() {
        var d = this.determinant();
        if (Math.abs( d ) > PConstants.MIN_INT) {
          var old00 = this.elements[0];
          var old01 = this.elements[1];
          var old02 = this.elements[2];
          var old10 = this.elements[3];
          var old11 = this.elements[4];
          var old12 = this.elements[5];
          this.elements[0] =  old11 / d;
          this.elements[3] = -old10 / d;
          this.elements[1] = -old01 / d;
          this.elements[4] =  old00 / d;
          this.elements[2] = (old01 * old12 - old11 * old02) / d;
          this.elements[5] = (old10 * old02 - old00 * old12) / d;
          return true;
        }
        return false;
      },
      /**
       * @member PMatrix2D
       * The scale() function increases or decreases the size of a shape by expanding and contracting vertices. When only one parameter is specified scale will occur in all dimensions.
       * This is equivalent to a two parameter call.
       *
       * @param {float} sx  the amount to scale on the x-axis
       * @param {float} sy  the amount to scale on the y-axis
       */
      scale: function(sx, sy) {
        if (sx && !sy) {
          sy = sx;
        }
        if (sx && sy) {
          this.elements[0] *= sx;
          this.elements[1] *= sy;
          this.elements[3] *= sx;
          this.elements[4] *= sy;
        }
      },
       /**
        * @member PMatrix2D
        * The invScale() function decreases or increases the size of a shape by contracting and expanding vertices. When only one parameter is specified scale will occur in all dimensions.
        * This is equivalent to a two parameter call.
        *
        * @param {float} sx  the amount to scale on the x-axis
        * @param {float} sy  the amount to scale on the y-axis
        */
      invScale: function(sx, sy) {
        if (sx && !sy) {
          sy = sx;
        }
        this.scale(1 / sx, 1 / sy);
      },
      /**
       * @member PMatrix2D
       * The apply() function multiplies the current matrix by the one specified through the parameters. Note that either a PMatrix2D or a list of floats can be passed in.
       *
       * @param {PMatrix2D} matrix    the matrix to apply this matrix to
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the third element of the matrix
       * @param {float} m10           the fourth element of the matrix
       * @param {float} m11           the fith element of the matrix
       * @param {float} m12           the sixth element of the matrix
       */
      apply: function() {
        var source;
        if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) {
          source = arguments[0].array();
        } else if (arguments.length === 6) {
          source = Array.prototype.slice.call(arguments);
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          source = arguments[0];
        }

        var result = [0, 0, this.elements[2],
                      0, 0, this.elements[5]];
        var e = 0;
        for (var row = 0; row < 2; row++) {
          for (var col = 0; col < 3; col++, e++) {
            result[e] += this.elements[row * 3 + 0] * source[col + 0] +
                         this.elements[row * 3 + 1] * source[col + 3];
          }
        }
        this.elements = result.slice();
      },
      /**
       * @member PMatrix2D
       * The preApply() function applies another matrix to the left of this one. Note that either a PMatrix2D or elements of a matrix can be passed in.
       *
       * @param {PMatrix2D} matrix    the matrix to apply this matrix to
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the third element of the matrix
       * @param {float} m10           the fourth element of the matrix
       * @param {float} m11           the fith element of the matrix
       * @param {float} m12           the sixth element of the matrix
       */
      preApply: function() {
        var source;
        if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) {
          source = arguments[0].array();
        } else if (arguments.length === 6) {
          source = Array.prototype.slice.call(arguments);
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          source = arguments[0];
        }
        var result = [0, 0, source[2],
                      0, 0, source[5]];
        result[2] = source[2] + this.elements[2] * source[0] + this.elements[5] * source[1];
        result[5] = source[5] + this.elements[2] * source[3] + this.elements[5] * source[4];
        result[0] = this.elements[0] * source[0] + this.elements[3] * source[1];
        result[3] = this.elements[0] * source[3] + this.elements[3] * source[4];
        result[1] = this.elements[1] * source[0] + this.elements[4] * source[1];
        result[4] = this.elements[1] * source[3] + this.elements[4] * source[4];
        this.elements = result.slice();
      },
      /**
       * @member PMatrix2D
       * The rotate() function rotates the matrix.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      rotate: function(angle) {
        // XXX(jeresig)
        var c = p.cos(angle);
        var s = p.sin(angle);
        var temp1 = this.elements[0];
        var temp2 = this.elements[1];
        this.elements[0] =  c * temp1 + s * temp2;
        this.elements[1] = -s * temp1 + c * temp2;
        temp1 = this.elements[3];
        temp2 = this.elements[4];
        this.elements[3] =  c * temp1 + s * temp2;
        this.elements[4] = -s * temp1 + c * temp2;
      },
      /**
       * @member PMatrix2D
       * The rotateZ() function rotates the matrix.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      rotateZ: function(angle) {
        this.rotate(angle);
      },
      /**
       * @member PMatrix2D
       * The invRotateZ() function rotates the matrix in opposite direction.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      invRotateZ: function(angle) {
        // XXX(jeresig)
        this.rotateZ(angle - (p.angleMode === "degrees" ? 180 : Math.PI));
      },
      /**
       * @member PMatrix2D
       * The print() function prints out the elements of this matrix
       */
      print: function() {
        var digits = printMatrixHelper(this.elements);
        var output = "" + p.nfs(this.elements[0], digits, 4) + " " +
                     p.nfs(this.elements[1], digits, 4) + " " +
                     p.nfs(this.elements[2], digits, 4) + "\n" +
                     p.nfs(this.elements[3], digits, 4) + " " +
                     p.nfs(this.elements[4], digits, 4) + " " +
                     p.nfs(this.elements[5], digits, 4) + "\n\n";
        p.println(output);
      }
    };

    /**
     * PMatrix3D is a 4x4  matrix implementation. The constructor accepts another PMatrix3D or a list of six or sixteen float elements.
     * If no parameters are provided the matrix is set to the identity matrix.
     */
    var PMatrix3D = p.PMatrix3D = function() {
      // When a matrix is created, it is set to an identity matrix
      this.reset();
    };
    /**
     * PMatrix3D methods
     */
    PMatrix3D.prototype = {
      /**
       * @member PMatrix2D
       * The set() function sets the matrix elements. The function accepts either another PMatrix3D, an array of elements, or a list of six or sixteen floats.
       *
       * @param {PMatrix3D} matrix    the initial matrix to set to
       * @param {float[]} elements    an array of elements to set this matrix to
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the second element of the matrix
       * @param {float} m02           the third element of the matrix
       * @param {float} m03           the fourth element of the matrix
       * @param {float} m10           the fifth element of the matrix
       * @param {float} m11           the sixth element of the matrix
       * @param {float} m12           the seventh element of the matrix
       * @param {float} m13           the eight element of the matrix
       * @param {float} m20           the nineth element of the matrix
       * @param {float} m21           the tenth element of the matrix
       * @param {float} m22           the eleventh element of the matrix
       * @param {float} m23           the twelveth element of the matrix
       * @param {float} m30           the thirteenth element of the matrix
       * @param {float} m31           the fourtheenth element of the matrix
       * @param {float} m32           the fivetheenth element of the matrix
       * @param {float} m33           the sixteenth element of the matrix
       */
      set: function() {
        if (arguments.length === 16) {
          this.elements = Array.prototype.slice.call(arguments);
        } else if (arguments.length === 1 && arguments[0] instanceof PMatrix3D) {
          this.elements = arguments[0].array();
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          this.elements = arguments[0].slice();
        }
      },
      /**
       * @member PMatrix3D
       * The get() function returns a copy of this PMatrix3D.
       *
       * @return {PMatrix3D} a copy of this PMatrix3D
       */
      get: function() {
        var outgoing = new PMatrix3D();
        outgoing.set(this.elements);
        return outgoing;
      },
      /**
       * @member PMatrix3D
       * The reset() function sets this PMatrix3D to the identity matrix.
       */
      reset: function() {
        this.elements = [1,0,0,0,
                         0,1,0,0,
                         0,0,1,0,
                         0,0,0,1];
      },
      /**
       * @member PMatrix3D
       * The array() function returns a copy of the element values.
       * @addon
       *
       * @return {float[]} returns a copy of the element values
       */
      array: function array() {
        return this.elements.slice();
      },
      /**
       * @member PMatrix3D
       * The translate() function translates this matrix by moving the current coordinates to the location specified by tx, ty, and tz.
       *
       * @param {float} tx  the x-axis coordinate to move to
       * @param {float} ty  the y-axis coordinate to move to
       * @param {float} tz  the z-axis coordinate to move to
       */
      translate: function(tx, ty, tz) {
        if (tz === undef) {
          tz = 0;
        }

        this.elements[3]  += tx * this.elements[0]  + ty * this.elements[1]  + tz * this.elements[2];
        this.elements[7]  += tx * this.elements[4]  + ty * this.elements[5]  + tz * this.elements[6];
        this.elements[11] += tx * this.elements[8]  + ty * this.elements[9]  + tz * this.elements[10];
        this.elements[15] += tx * this.elements[12] + ty * this.elements[13] + tz * this.elements[14];
      },
      /**
       * @member PMatrix3D
       * The transpose() function transpose this matrix.
       */
      transpose: function() {
        var temp = this.elements[4];
        this.elements[4] = this.elements[1];
        this.elements[1] = temp;

        temp = this.elements[8];
        this.elements[8] = this.elements[2];
        this.elements[2] = temp;

        temp = this.elements[6];
        this.elements[6] = this.elements[9];
        this.elements[9] = temp;

        temp = this.elements[3];
        this.elements[3] = this.elements[12];
        this.elements[12] = temp;

        temp = this.elements[7];
        this.elements[7] = this.elements[13];
        this.elements[13] = temp;

        temp = this.elements[11];
        this.elements[11] = this.elements[14];
        this.elements[14] = temp;
      },
      /**
       * @member PMatrix3D
       * The mult() function multiplied this matrix.
       * If two array elements are passed in the function will multiply a two element vector against this matrix.
       * If target is null or not length four, a new float array will be returned.
       * The values for vec and target can be the same (though that's less efficient).
       * If two PVectors are passed in the function multiply the x and y coordinates of a PVector against this matrix.
       *
       * @param {PVector} source, target  the PVectors used to multiply this matrix
       * @param {float[]} source, target  the arrays used to multiply this matrix
       *
       * @return {PVector|float[]} returns a PVector or an array representing the new matrix
       */
      mult: function(source, target) {
        var x, y, z, w;
        if (source instanceof PVector) {
          x = source.x;
          y = source.y;
          z = source.z;
          w = 1;
          if (!target) {
            target = new PVector();
          }
        } else if (source instanceof Array) {
          x = source[0];
          y = source[1];
          z = source[2];
          w = source[3] || 1;

          if ( !target || (target.length !== 3 && target.length !== 4) ) {
            target = [0, 0, 0];
          }
        }

        if (target instanceof Array) {
          if (target.length === 3) {
            target[0] = this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3];
            target[1] = this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7];
            target[2] = this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11];
          } else if (target.length === 4) {
            target[0] = this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3] * w;
            target[1] = this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7] * w;
            target[2] = this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11] * w;
            target[3] = this.elements[12] * x + this.elements[13] * y + this.elements[14] * z + this.elements[15] * w;
          }
        }
        if (target instanceof PVector) {
          target.x = this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3];
          target.y = this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7];
          target.z = this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11];
        }
        return target;
      },
      /**
       * @member PMatrix3D
       * The preApply() function applies another matrix to the left of this one. Note that either a PMatrix3D or elements of a matrix can be passed in.
       *
       * @param {PMatrix3D} matrix    the matrix to apply this matrix to
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the second element of the matrix
       * @param {float} m02           the third element of the matrix
       * @param {float} m03           the fourth element of the matrix
       * @param {float} m10           the fifth element of the matrix
       * @param {float} m11           the sixth element of the matrix
       * @param {float} m12           the seventh element of the matrix
       * @param {float} m13           the eight element of the matrix
       * @param {float} m20           the nineth element of the matrix
       * @param {float} m21           the tenth element of the matrix
       * @param {float} m22           the eleventh element of the matrix
       * @param {float} m23           the twelveth element of the matrix
       * @param {float} m30           the thirteenth element of the matrix
       * @param {float} m31           the fourtheenth element of the matrix
       * @param {float} m32           the fivetheenth element of the matrix
       * @param {float} m33           the sixteenth element of the matrix
       */
      preApply: function() {
        var source;
        if (arguments.length === 1 && arguments[0] instanceof PMatrix3D) {
          source = arguments[0].array();
        } else if (arguments.length === 16) {
          source = Array.prototype.slice.call(arguments);
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          source = arguments[0];
        }

        var result = [0, 0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, 0];
        var e = 0;
        for (var row = 0; row < 4; row++) {
          for (var col = 0; col < 4; col++, e++) {
            result[e] += this.elements[col + 0] * source[row * 4 + 0] + this.elements[col + 4] *
                         source[row * 4 + 1] + this.elements[col + 8] * source[row * 4 + 2] +
                         this.elements[col + 12] * source[row * 4 + 3];
          }
        }
        this.elements = result.slice();
      },
      /**
       * @member PMatrix3D
       * The apply() function multiplies the current matrix by the one specified through the parameters. Note that either a PMatrix3D or a list of floats can be passed in.
       *
       * @param {PMatrix3D} matrix    the matrix to apply this matrix to
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the second element of the matrix
       * @param {float} m02           the third element of the matrix
       * @param {float} m03           the fourth element of the matrix
       * @param {float} m10           the fifth element of the matrix
       * @param {float} m11           the sixth element of the matrix
       * @param {float} m12           the seventh element of the matrix
       * @param {float} m13           the eight element of the matrix
       * @param {float} m20           the nineth element of the matrix
       * @param {float} m21           the tenth element of the matrix
       * @param {float} m22           the eleventh element of the matrix
       * @param {float} m23           the twelveth element of the matrix
       * @param {float} m30           the thirteenth element of the matrix
       * @param {float} m31           the fourtheenth element of the matrix
       * @param {float} m32           the fivetheenth element of the matrix
       * @param {float} m33           the sixteenth element of the matrix
       */
      apply: function() {
        var source;
        if (arguments.length === 1 && arguments[0] instanceof PMatrix3D) {
          source = arguments[0].array();
        } else if (arguments.length === 16) {
          source = Array.prototype.slice.call(arguments);
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          source = arguments[0];
        }

        var result = [0, 0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, 0];
        var e = 0;
        for (var row = 0; row < 4; row++) {
          for (var col = 0; col < 4; col++, e++) {
            result[e] += this.elements[row * 4 + 0] * source[col + 0] + this.elements[row * 4 + 1] *
                         source[col + 4] + this.elements[row * 4 + 2] * source[col + 8] +
                         this.elements[row * 4 + 3] * source[col + 12];
          }
        }
        this.elements = result.slice();
      },
      /**
       * @member PMatrix3D
       * The rotate() function rotates the matrix.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      rotate: function(angle, v0, v1, v2) {
        if (!v1) {
          this.rotateZ(angle);
        } else {
          // TODO should make sure this vector is normalized
          var c = p.cos(angle);
          var s = p.sin(angle);
          var t = 1.0 - c;

          this.apply((t * v0 * v0) + c,
                     (t * v0 * v1) - (s * v2),
                     (t * v0 * v2) + (s * v1),
                     0,
                     (t * v0 * v1) + (s * v2),
                     (t * v1 * v1) + c,
                     (t * v1 * v2) - (s * v0),
                     0,
                     (t * v0 * v2) - (s * v1),
                     (t * v1 * v2) + (s * v0),
                     (t * v2 * v2) + c,
                     0,
                     0, 0, 0, 1);
        }
      },
      /**
       * @member PMatrix3D
       * The invApply() function applies the inverted matrix to this matrix.
       *
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the second element of the matrix
       * @param {float} m02           the third element of the matrix
       * @param {float} m03           the fourth element of the matrix
       * @param {float} m10           the fifth element of the matrix
       * @param {float} m11           the sixth element of the matrix
       * @param {float} m12           the seventh element of the matrix
       * @param {float} m13           the eight element of the matrix
       * @param {float} m20           the nineth element of the matrix
       * @param {float} m21           the tenth element of the matrix
       * @param {float} m22           the eleventh element of the matrix
       * @param {float} m23           the twelveth element of the matrix
       * @param {float} m30           the thirteenth element of the matrix
       * @param {float} m31           the fourtheenth element of the matrix
       * @param {float} m32           the fivetheenth element of the matrix
       * @param {float} m33           the sixteenth element of the matrix
       *
       * @return {boolean} returns true if the operation was successful.
       */
      invApply: function() {
        if (inverseCopy === undef) {
          inverseCopy = new PMatrix3D();
        }
        var a = arguments;
        inverseCopy.set(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8],
                        a[9], a[10], a[11], a[12], a[13], a[14], a[15]);

        if (!inverseCopy.invert()) {
          return false;
        }
        this.preApply(inverseCopy);
        return true;
      },
      /**
       * @member PMatrix3D
       * The rotateZ() function rotates the matrix.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      rotateX: function(angle) {
        var c = p.cos(angle);
        var s = p.sin(angle);
        this.apply([1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]);
      },
      /**
       * @member PMatrix3D
       * The rotateY() function rotates the matrix.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      rotateY: function(angle) {
        var c = p.cos(angle);
        var s = p.sin(angle);
        this.apply([c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1]);
      },
      /**
       * @member PMatrix3D
       * The rotateZ() function rotates the matrix.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      rotateZ: function(angle) {
        // XXX(jeresig)
        var c = p.cos(angle);
        var s = p.sin(angle);
        this.apply([c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      },
      /**
       * @member PMatrix3D
       * The scale() function increases or decreases the size of a matrix by expanding and contracting vertices. When only one parameter is specified scale will occur in all dimensions.
       * This is equivalent to a three parameter call.
       *
       * @param {float} sx  the amount to scale on the x-axis
       * @param {float} sy  the amount to scale on the y-axis
       * @param {float} sz  the amount to scale on the z-axis
       */
      scale: function(sx, sy, sz) {
        if (sx && !sy && !sz) {
          sy = sz = sx;
        } else if (sx && sy && !sz) {
          sz = 1;
        }

        if (sx && sy && sz) {
          this.elements[0]  *= sx;
          this.elements[1]  *= sy;
          this.elements[2]  *= sz;
          this.elements[4]  *= sx;
          this.elements[5]  *= sy;
          this.elements[6]  *= sz;
          this.elements[8]  *= sx;
          this.elements[9]  *= sy;
          this.elements[10] *= sz;
          this.elements[12] *= sx;
          this.elements[13] *= sy;
          this.elements[14] *= sz;
        }
      },
      /**
       * @member PMatrix3D
       * The skewX() function skews the matrix along the x-axis the amount specified by the angle parameter.
       * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
       *
       * @param {float} angle  angle of skew specified in radians
       */
      skewX: function(angle) {
        // XXX(jeresig)
        var t = p.tan(angle);
        this.apply(1, t, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      },
      /**
       * @member PMatrix3D
       * The skewY() function skews the matrix along the y-axis the amount specified by the angle parameter.
       * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
       *
       * @param {float} angle  angle of skew specified in radians
       */
      skewY: function(angle) {
        // XXX(jeresig)
        var t = p.tan(angle);
        this.apply(1, 0, 0, 0, t, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      },
      multX: function(x, y, z, w) {
        if (!z) {
          return this.elements[0] * x + this.elements[1] * y + this.elements[3];
        }
        if (!w) {
          return this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3];
        }
        return this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3] * w;
      },
      multY: function(x, y, z, w) {
        if (!z) {
          return this.elements[4] * x + this.elements[5] * y + this.elements[7];
        }
        if (!w) {
          return this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7];
        }
        return this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7] * w;
      },
      multZ: function(x, y, z, w) {
        if (!w) {
          return this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11];
        }
        return this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11] * w;
      },
      multW: function(x, y, z, w) {
        if (!w) {
          return this.elements[12] * x + this.elements[13] * y + this.elements[14] * z + this.elements[15];
        }
        return this.elements[12] * x + this.elements[13] * y + this.elements[14] * z + this.elements[15] * w;
      },
      /**
       * @member PMatrix3D
       * The invert() function inverts this matrix
       *
       * @return {boolean} true if successful
       */
      invert: function() {
        var fA0 = this.elements[0] * this.elements[5] - this.elements[1] * this.elements[4];
        var fA1 = this.elements[0] * this.elements[6] - this.elements[2] * this.elements[4];
        var fA2 = this.elements[0] * this.elements[7] - this.elements[3] * this.elements[4];
        var fA3 = this.elements[1] * this.elements[6] - this.elements[2] * this.elements[5];
        var fA4 = this.elements[1] * this.elements[7] - this.elements[3] * this.elements[5];
        var fA5 = this.elements[2] * this.elements[7] - this.elements[3] * this.elements[6];
        var fB0 = this.elements[8] * this.elements[13] - this.elements[9] * this.elements[12];
        var fB1 = this.elements[8] * this.elements[14] - this.elements[10] * this.elements[12];
        var fB2 = this.elements[8] * this.elements[15] - this.elements[11] * this.elements[12];
        var fB3 = this.elements[9] * this.elements[14] - this.elements[10] * this.elements[13];
        var fB4 = this.elements[9] * this.elements[15] - this.elements[11] * this.elements[13];
        var fB5 = this.elements[10] * this.elements[15] - this.elements[11] * this.elements[14];

        // Determinant
        var fDet = fA0 * fB5 - fA1 * fB4 + fA2 * fB3 + fA3 * fB2 - fA4 * fB1 + fA5 * fB0;

        // Account for a very small value
        // return false if not successful.
        if (Math.abs(fDet) <= 1e-9) {
          return false;
        }

        var kInv = [];
        kInv[0]  = +this.elements[5] * fB5 - this.elements[6] * fB4 + this.elements[7] * fB3;
        kInv[4]  = -this.elements[4] * fB5 + this.elements[6] * fB2 - this.elements[7] * fB1;
        kInv[8]  = +this.elements[4] * fB4 - this.elements[5] * fB2 + this.elements[7] * fB0;
        kInv[12] = -this.elements[4] * fB3 + this.elements[5] * fB1 - this.elements[6] * fB0;
        kInv[1]  = -this.elements[1] * fB5 + this.elements[2] * fB4 - this.elements[3] * fB3;
        kInv[5]  = +this.elements[0] * fB5 - this.elements[2] * fB2 + this.elements[3] * fB1;
        kInv[9]  = -this.elements[0] * fB4 + this.elements[1] * fB2 - this.elements[3] * fB0;
        kInv[13] = +this.elements[0] * fB3 - this.elements[1] * fB1 + this.elements[2] * fB0;
        kInv[2]  = +this.elements[13] * fA5 - this.elements[14] * fA4 + this.elements[15] * fA3;
        kInv[6]  = -this.elements[12] * fA5 + this.elements[14] * fA2 - this.elements[15] * fA1;
        kInv[10] = +this.elements[12] * fA4 - this.elements[13] * fA2 + this.elements[15] * fA0;
        kInv[14] = -this.elements[12] * fA3 + this.elements[13] * fA1 - this.elements[14] * fA0;
        kInv[3]  = -this.elements[9] * fA5 + this.elements[10] * fA4 - this.elements[11] * fA3;
        kInv[7]  = +this.elements[8] * fA5 - this.elements[10] * fA2 + this.elements[11] * fA1;
        kInv[11] = -this.elements[8] * fA4 + this.elements[9] * fA2 - this.elements[11] * fA0;
        kInv[15] = +this.elements[8] * fA3 - this.elements[9] * fA1 + this.elements[10] * fA0;

        // Inverse using Determinant
        var fInvDet = 1.0 / fDet;
        kInv[0]  *= fInvDet;
        kInv[1]  *= fInvDet;
        kInv[2]  *= fInvDet;
        kInv[3]  *= fInvDet;
        kInv[4]  *= fInvDet;
        kInv[5]  *= fInvDet;
        kInv[6]  *= fInvDet;
        kInv[7]  *= fInvDet;
        kInv[8]  *= fInvDet;
        kInv[9]  *= fInvDet;
        kInv[10] *= fInvDet;
        kInv[11] *= fInvDet;
        kInv[12] *= fInvDet;
        kInv[13] *= fInvDet;
        kInv[14] *= fInvDet;
        kInv[15] *= fInvDet;

        this.elements = kInv.slice();
        return true;
      },
      toString: function() {
        var str = "";
        for (var i = 0; i < 15; i++) {
          str += this.elements[i] + ", ";
        }
        str += this.elements[15];
        return str;
      },
      /**
       * @member PMatrix3D
       * The print() function prints out the elements of this matrix
       */
      print: function() {
        var digits = printMatrixHelper(this.elements);

        var output = "" + p.nfs(this.elements[0], digits, 4) + " " + p.nfs(this.elements[1], digits, 4) +
                     " " + p.nfs(this.elements[2], digits, 4) + " " + p.nfs(this.elements[3], digits, 4) +
                     "\n" + p.nfs(this.elements[4], digits, 4) + " " + p.nfs(this.elements[5], digits, 4) +
                     " " + p.nfs(this.elements[6], digits, 4) + " " + p.nfs(this.elements[7], digits, 4) +
                     "\n" + p.nfs(this.elements[8], digits, 4) + " " + p.nfs(this.elements[9], digits, 4) +
                     " " + p.nfs(this.elements[10], digits, 4) + " " + p.nfs(this.elements[11], digits, 4) +
                     "\n" + p.nfs(this.elements[12], digits, 4) + " " + p.nfs(this.elements[13], digits, 4) +
                     " " + p.nfs(this.elements[14], digits, 4) + " " + p.nfs(this.elements[15], digits, 4) + "\n\n";
        p.println(output);
      },
      invTranslate: function(tx, ty, tz) {
        this.preApply(1, 0, 0, -tx, 0, 1, 0, -ty, 0, 0, 1, -tz, 0, 0, 0, 1);
      },
      invRotateX: function(angle) {
        // XXX(jeresig)
        var c = p.cos(-angle);
        var s = p.sin(-angle);
        this.preApply([1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]);
      },
      invRotateY: function(angle) {
        // XXX(jeresig)
        var c = p.cos(-angle);
        var s = p.sin(-angle);
        this.preApply([c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1]);
      },
      invRotateZ: function(angle) {
        // XXX(jeresig)
        var c = p.cos(-angle);
        var s = p.sin(-angle);
        this.preApply([c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      },
      invScale: function(x, y, z) {
        this.preApply([1 / x, 0, 0, 0, 0, 1 / y, 0, 0, 0, 0, 1 / z, 0, 0, 0, 0, 1]);
      }
    };

    /**
     * @private
     * The matrix stack stores the transformations and translations that occur within the space.
     */
    var PMatrixStack = p.PMatrixStack = function() {
      this.matrixStack = [];
    };

    /**
     * @member PMatrixStack
     * load pushes the matrix given in the function into the stack
     *
     * @param {Object | Array} matrix the matrix to be pushed into the stack
     */
    PMatrixStack.prototype.load = function() {
      var tmpMatrix = drawing.$newPMatrix();

      if (arguments.length === 1) {
        tmpMatrix.set(arguments[0]);
      } else {
        tmpMatrix.set(arguments);
      }
      this.matrixStack.push(tmpMatrix);
    };

    Drawing2D.prototype.$newPMatrix = function() {
      return new PMatrix2D();
    };
    
    /**
     * @member PMatrixStack
     * push adds a duplicate of the top of the stack onto the stack - uses the peek function
     */
    PMatrixStack.prototype.push = function() {
      this.matrixStack.push(this.peek());
    };

    /**
     * @member PMatrixStack
     * pop removes returns the matrix at the top of the stack
     *
     * @returns {Object} the matrix at the top of the stack
     */
    PMatrixStack.prototype.pop = function() {
      return this.matrixStack.pop();
    };

    /**
     * @member PMatrixStack
     * peek returns but doesn't remove the matrix at the top of the stack
     *
     * @returns {Object} the matrix at the top of the stack
     */
    PMatrixStack.prototype.peek = function() {
      var tmpMatrix = drawing.$newPMatrix();

      tmpMatrix.set(this.matrixStack[this.matrixStack.length - 1]);
      return tmpMatrix;
    };

    /**
     * @member PMatrixStack
     * this function multiplies the matrix at the top of the stack with the matrix given as a parameter
     *
     * @param {Object | Array} matrix the matrix to be multiplied into the stack
     */
    PMatrixStack.prototype.mult = function(matrix) {
      this.matrixStack[this.matrixStack.length - 1].apply(matrix);
    };

    ////////////////////////////////////////////////////////////////////////////
    // Array handling
    ////////////////////////////////////////////////////////////////////////////

    /**
    * The split() function breaks a string into pieces using a character or string
    * as the divider. The delim  parameter specifies the character or characters that
    * mark the boundaries between each piece. A String[] array is returned that contains
    * each of the pieces.
    * If the result is a set of numbers, you can convert the String[] array to to a float[]
    * or int[] array using the datatype conversion functions int() and float() (see example above).
    * The splitTokens() function works in a similar fashion, except that it splits using a range
    * of characters instead of a specific character or sequence.
    *
    * @param {String} str       the String to be split
    * @param {String} delim     the character or String used to separate the data
    *
    * @returns {string[]} The new string array
    *
    * @see splitTokens
    * @see join
    * @see trim
    */
    p.split = function(str, delim) {
      return str.split(delim);
    };

    /**
    * The splitTokens() function splits a String at one or many character "tokens." The tokens
    * parameter specifies the character or characters to be used as a boundary.
    * If no tokens character is specified, any whitespace character is used to split.
    * Whitespace characters include tab (\t), line feed (\n), carriage return (\r), form
    * feed (\f), and space. To convert a String to an array of integers or floats, use the
    * datatype conversion functions int() and float() to convert the array of Strings.
    *
    * @param {String} str       the String to be split
    * @param {Char[]} tokens    list of individual characters that will be used as separators
    *
    * @returns {string[]} The new string array
    *
    * @see split
    * @see join
    * @see trim
    */
    p.splitTokens = function(str, tokens) {
      if (arguments.length === 1) {
        tokens = "\n\t\r\f ";
      }

      tokens = "[" + tokens + "]";

      var ary = [];
      var index = 0;
      var pos = str.search(tokens);

      while (pos >= 0) {
        if (pos === 0) {
          str = str.substring(1);
        } else {
          ary[index] = str.substring(0, pos);
          index++;
          str = str.substring(pos);
        }
        pos = str.search(tokens);
      }

      if (str.length > 0) {
        ary[index] = str;
      }

      if (ary.length === 0) {
        ary = undef;
      }

      return ary;
    };

    /**
    * Expands an array by one element and adds data to the new position. The datatype of
    * the element parameter must be the same as the datatype of the array.
    * When using an array of objects, the data returned from the function must be cast to
    * the object array's data type. For example: SomeClass[] items = (SomeClass[])
    * append(originalArray, element).
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} array boolean[],
    * byte[], char[], int[], float[], or String[], or an array of objects
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} element new data for the array
    *
    * @returns Array (the same datatype as the input)
    *
    * @see shorten
    * @see expand
    */
    p.append = function(array, element) {
      array[array.length] = element;
      return array;
    };

    /**
    * Concatenates two arrays. For example, concatenating the array { 1, 2, 3 } and the
    * array { 4, 5, 6 } yields { 1, 2, 3, 4, 5, 6 }. Both parameters must be arrays of the
    * same datatype.
    * When using an array of objects, the data returned from the function must be cast to the
    * object array's data type. For example: SomeClass[] items = (SomeClass[]) concat(array1, array2).
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} array1 boolean[],
    * byte[], char[], int[], float[], String[], or an array of objects
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} array2 boolean[],
    * byte[], char[], int[], float[], String[], or an array of objects
    *
    * @returns Array (the same datatype as the input)
    *
    * @see splice
    */
    p.concat = function(array1, array2) {
      return array1.concat(array2);
    };

    /**
     * Sorts an array of numbers from smallest to largest and puts an array of
     * words in alphabetical order. The original array is not modified, a
     * re-ordered array is returned. The count parameter states the number of
     * elements to sort. For example if there are 12 elements in an array and
     * if count is the value 5, only the first five elements on the array will
     * be sorted. Alphabetical ordering is case insensitive.
     *
     * @param {String[] | int[] | float[]}  array Array of elements to sort
     * @param {int}                         numElem Number of elements to sort
     *
     * @returns {String[] | int[] | float[]} Array (same datatype as the input)
     *
     * @see reverse
    */
    p.sort = function(array, numElem) {
      var ret = [];

      // depending on the type used (int, float) or string
      // we'll need to use a different compare function
      if (array.length > 0) {
        // copy since we need to return another array
        var elemsToCopy = numElem > 0 ? numElem : array.length;
        for (var i = 0; i < elemsToCopy; i++) {
          ret.push(array[i]);
        }
        if (typeof array[0] === "string") {
          ret.sort();
        }
        // int or float
        else {
          ret.sort(function(a, b) {
            return a - b;
          });
        }

        // copy on the rest of the elements that were not sorted in case the user
        // only wanted a subset of an array to be sorted.
        if (numElem > 0) {
          for (var j = ret.length; j < array.length; j++) {
            ret.push(array[j]);
          }
        }
      }
      return ret;
    };

    /**
    * Inserts a value or array of values into an existing array. The first two parameters must
    * be of the same datatype. The array parameter defines the array which will be modified
    * and the second parameter defines the data which will be inserted. When using an array
    * of objects, the data returned from the function must be cast to the object array's data
    * type. For example: SomeClass[] items = (SomeClass[]) splice(array1, array2, index).
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} array boolean[],
    * byte[], char[], int[], float[], String[], or an array of objects
    * @param {boolean|byte|char|int|float|String|boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects}
    * value boolean, byte, char, int, float, String, boolean[], byte[], char[], int[],
    * float[], String[], or other Object: value or an array of objects to be spliced in
    * @param {int} index                position in the array from which to insert data
    *
    * @returns Array (the same datatype as the input)
    *
    * @see contract
    * @see subset
    */
    p.splice = function(array, value, index) {

      // Trying to splice an empty array into "array" in P5 won't do
      // anything, just return the original.
      if(value.length === 0)
      {
        return array;
      }

      // If the second argument was an array, we'll need to iterate over all
      // the "value" elements and add one by one because
      // array.splice(index, 0, value);
      // would create a multi-dimensional array which isn't what we want.
      if(value instanceof Array) {
        for(var i = 0, j = index; i < value.length; j++,i++) {
          array.splice(j, 0, value[i]);
        }
      } else {
        array.splice(index, 0, value);
      }

      return array;
    };

    /**
    * Extracts an array of elements from an existing array. The array parameter defines the
    * array from which the elements will be copied and the offset and length parameters determine
    * which elements to extract. If no length is given, elements will be extracted from the offset
    * to the end of the array. When specifying the offset remember the first array element is 0.
    * This function does not change the source array.
    * When using an array of objects, the data returned from the function must be cast to the
    * object array's data type.
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} array boolean[],
    * byte[], char[], int[], float[], String[], or an array of objects
    * @param {int} offset         position to begin
    * @param {int} length         number of values to extract
    *
    * @returns Array (the same datatype as the input)
    *
    * @see splice
    */
    p.subset = function(array, offset, length) {
      var end = (length !== undef) ? offset + length : array.length;
      return array.slice(offset, end);
    };

    /**
    * Combines an array of Strings into one String, each separated by the character(s) used for
    * the separator parameter. To join arrays of ints or floats, it's necessary to first convert
    * them to strings using nf() or nfs().
    *
    * @param {Array} array              array of Strings
    * @param {char|String} separator    char or String to be placed between each item
    *
    * @returns {String} The combined string
    *
    * @see split
    * @see trim
    * @see nf
    * @see nfs
    */
    p.join = function(array, seperator) {
      return array.join(seperator);
    };

    /**
    * Decreases an array by one element and returns the shortened array. When using an
    * array of objects, the data returned from the function must be cast to the object array's
    * data type. For example: SomeClass[] items = (SomeClass[]) shorten(originalArray).
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} array
    * boolean[], byte[], char[], int[], float[], or String[], or an array of objects
    *
    * @returns Array (the same datatype as the input)
    *
    * @see append
    * @see expand
    */
    p.shorten = function(ary) {
      var newary = [];

      // copy array into new array
      var len = ary.length;
      for (var i = 0; i < len; i++) {
        newary[i] = ary[i];
      }
      newary.pop();

      return newary;
    };

    /**
    * Increases the size of an array. By default, this function doubles the size of the array,
    * but the optional newSize parameter provides precise control over the increase in size.
    * When using an array of objects, the data returned from the function must be cast to the
    * object array's data type. For example: SomeClass[] items = (SomeClass[]) expand(originalArray).
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} ary
    * boolean[], byte[], char[], int[], float[], String[], or an array of objects
    * @param {int} newSize              positive int: new size for the array
    *
    * @returns Array (the same datatype as the input)
    *
    * @see contract
    */
    p.expand = function(ary, targetSize) {
      var temp = ary.slice(0),
          newSize = targetSize || ary.length * 2;
      temp.length = newSize;
      return temp;
    };

    /**
    * Copies an array (or part of an array) to another array. The src array is copied to the
    * dst array, beginning at the position specified by srcPos and into the position specified
    * by dstPos. The number of elements to copy is determined by length. The simplified version
    * with two arguments copies an entire array to another of the same size. It is equivalent
    * to "arrayCopy(src, 0, dst, 0, src.length)". This function is far more efficient for copying
    * array data than iterating through a for and copying each element.
    *
    * @param {Array} src an array of any data type: the source array
    * @param {Array} dest an array of any data type (as long as it's the same as src): the destination array
    * @param {int} srcPos     starting position in the source array
    * @param {int} destPos    starting position in the destination array
    * @param {int} length     number of array elements to be copied
    *
    * @returns none
    */
    p.arrayCopy = function() { // src, srcPos, dest, destPos, length) {
      var src, srcPos = 0, dest, destPos = 0, length;

      if (arguments.length === 2) {
        // recall itself and copy src to dest from start index 0 to 0 of src.length
        src = arguments[0];
        dest = arguments[1];
        length = src.length;
      } else if (arguments.length === 3) {
        // recall itself and copy src to dest from start index 0 to 0 of length
        src = arguments[0];
        dest = arguments[1];
        length = arguments[2];
      } else if (arguments.length === 5) {
        src = arguments[0];
        srcPos = arguments[1];
        dest = arguments[2];
        destPos = arguments[3];
        length = arguments[4];
      }

      // copy src to dest from index srcPos to index destPos of length recursivly on objects
      for (var i = srcPos, j = destPos; i < length + srcPos; i++, j++) {
        if (dest[j] !== undef) {
          dest[j] = src[i];
        } else {
          throw "array index out of bounds exception";
        }
      }
    };

    /**
    * Reverses the order of an array.
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]} array
    * boolean[], byte[], char[], int[], float[], or String[]
    *
    * @returns Array (the same datatype as the input)
    *
    * @see sort
    */
    p.reverse = function(array) {
      return array.reverse();
    };


    ////////////////////////////////////////////////////////////////////////////
    // Color functions
    ////////////////////////////////////////////////////////////////////////////

    // helper functions for internal blending modes
    p.mix = function(a, b, f) {
      return a + (((b - a) * f) >> 8);
    };

    p.peg = function(n) {
      return (n < 0) ? 0 : ((n > 255) ? 255 : n);
    };

    // blending modes
    /**
    * These are internal blending modes used for BlendColor()
    *
    * @param {Color} c1       First Color to blend
    * @param {Color} c2       Second Color to blend
    *
    * @returns {Color}        The blended Color
    *
    * @see BlendColor
    * @see Blend
    */
    p.modes = (function() {
      var ALPHA_MASK = PConstants.ALPHA_MASK,
        RED_MASK = PConstants.RED_MASK,
        GREEN_MASK = PConstants.GREEN_MASK,
        BLUE_MASK = PConstants.BLUE_MASK,
        min = Math.min,
        max = Math.max;

      function applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb) {
        var a = min(((c1 & 0xff000000) >>> 24) + f, 0xff) << 24;

        var r = (ar + (((cr - ar) * f) >> 8));
        r = ((r < 0) ? 0 : ((r > 255) ? 255 : r)) << 16;

        var g = (ag + (((cg - ag) * f) >> 8));
        g = ((g < 0) ? 0 : ((g > 255) ? 255 : g)) << 8;

        var b = ab + (((cb - ab) * f) >> 8);
        b = (b < 0) ? 0 : ((b > 255) ? 255 : b);

        return (a | r | g | b);
      }

      return {
        replace: function(c1, c2) {
          return c2;
        },
        blend: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK),
            ag = (c1 & GREEN_MASK),
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK),
            bg = (c2 & GREEN_MASK),
            bb = (c2 & BLUE_MASK);

          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  (ar + (((br - ar) * f) >> 8)) & RED_MASK |
                  (ag + (((bg - ag) * f) >> 8)) & GREEN_MASK |
                  (ab + (((bb - ab) * f) >> 8)) & BLUE_MASK);
        },
        add: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24;
          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  min(((c1 & RED_MASK) + ((c2 & RED_MASK) >> 8) * f), RED_MASK) & RED_MASK |
                  min(((c1 & GREEN_MASK) + ((c2 & GREEN_MASK) >> 8) * f), GREEN_MASK) & GREEN_MASK |
                  min((c1 & BLUE_MASK) + (((c2 & BLUE_MASK) * f) >> 8), BLUE_MASK));
        },
        subtract: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24;
          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  max(((c1 & RED_MASK) - ((c2 & RED_MASK) >> 8) * f), GREEN_MASK) & RED_MASK |
                  max(((c1 & GREEN_MASK) - ((c2 & GREEN_MASK) >> 8) * f), BLUE_MASK) & GREEN_MASK |
                  max((c1 & BLUE_MASK) - (((c2 & BLUE_MASK) * f) >> 8), 0));
        },
        lightest: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24;
          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  max(c1 & RED_MASK, ((c2 & RED_MASK) >> 8) * f) & RED_MASK |
                  max(c1 & GREEN_MASK, ((c2 & GREEN_MASK) >> 8) * f) & GREEN_MASK |
                  max(c1 & BLUE_MASK, ((c2 & BLUE_MASK) * f) >> 8));
        },
        darkest: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK),
            ag = (c1 & GREEN_MASK),
            ab = (c1 & BLUE_MASK),
            br = min(c1 & RED_MASK, ((c2 & RED_MASK) >> 8) * f),
            bg = min(c1 & GREEN_MASK, ((c2 & GREEN_MASK) >> 8) * f),
            bb = min(c1 & BLUE_MASK, ((c2 & BLUE_MASK) * f) >> 8);

          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  (ar + (((br - ar) * f) >> 8)) & RED_MASK |
                  (ag + (((bg - ag) * f) >> 8)) & GREEN_MASK |
                  (ab + (((bb - ab) * f) >> 8)) & BLUE_MASK);
        },
        difference: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = (ar > br) ? (ar - br) : (br - ar),
            cg = (ag > bg) ? (ag - bg) : (bg - ag),
            cb = (ab > bb) ? (ab - bb) : (bb - ab);

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        exclusion: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = ar + br - ((ar * br) >> 7),
            cg = ag + bg - ((ag * bg) >> 7),
            cb = ab + bb - ((ab * bb) >> 7);

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        multiply: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = (ar * br) >> 8,
            cg = (ag * bg) >> 8,
            cb = (ab * bb) >> 8;

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        screen: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = 255 - (((255 - ar) * (255 - br)) >> 8),
            cg = 255 - (((255 - ag) * (255 - bg)) >> 8),
            cb = 255 - (((255 - ab) * (255 - bb)) >> 8);

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        hard_light: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = (br < 128) ? ((ar * br) >> 7) : (255 - (((255 - ar) * (255 - br)) >> 7)),
            cg = (bg < 128) ? ((ag * bg) >> 7) : (255 - (((255 - ag) * (255 - bg)) >> 7)),
            cb = (bb < 128) ? ((ab * bb) >> 7) : (255 - (((255 - ab) * (255 - bb)) >> 7));

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        soft_light: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = ((ar * br) >> 7) + ((ar * ar) >> 8) - ((ar * ar * br) >> 15),
            cg = ((ag * bg) >> 7) + ((ag * ag) >> 8) - ((ag * ag * bg) >> 15),
            cb = ((ab * bb) >> 7) + ((ab * ab) >> 8) - ((ab * ab * bb) >> 15);

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        overlay: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = (ar < 128) ? ((ar * br) >> 7) : (255 - (((255 - ar) * (255 - br)) >> 7)),
            cg = (ag < 128) ? ((ag * bg) >> 7) : (255 - (((255 - ag) * (255 - bg)) >> 7)),
            cb = (ab < 128) ? ((ab * bb) >> 7) : (255 - (((255 - ab) * (255 - bb)) >> 7));

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        dodge: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK);

          var cr = 255;
          if (br !== 255) {
            cr = (ar << 8) / (255 - br);
            cr = (cr < 0) ? 0 : ((cr > 255) ? 255 : cr);
          }

          var cg = 255;
          if (bg !== 255) {
            cg = (ag << 8) / (255 - bg);
            cg = (cg < 0) ? 0 : ((cg > 255) ? 255 : cg);
          }

          var cb = 255;
          if (bb !== 255) {
            cb = (ab << 8) / (255 - bb);
            cb = (cb < 0) ? 0 : ((cb > 255) ? 255 : cb);
          }

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        burn: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK);

          var cr = 0;
          if (br !== 0) {
            cr = ((255 - ar) << 8) / br;
            cr = 255 - ((cr < 0) ? 0 : ((cr > 255) ? 255 : cr));
          }

          var cg = 0;
          if (bg !== 0) {
            cg = ((255 - ag) << 8) / bg;
            cg = 255 - ((cg < 0) ? 0 : ((cg > 255) ? 255 : cg));
          }

          var cb = 0;
          if (bb !== 0) {
            cb = ((255 - ab) << 8) / bb;
            cb = 255 - ((cb < 0) ? 0 : ((cb > 255) ? 255 : cb));
          }

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        }
      };
    }());

    function color$4(aValue1, aValue2, aValue3, aValue4) {
      var r, g, b, a;

      if (curColorMode === PConstants.HSB) {
        var rgb = p.color.toRGB(aValue1, aValue2, aValue3);
        r = rgb[0];
        g = rgb[1];
        b = rgb[2];
      } else {
        r = Math.round(255 * (aValue1 / colorModeX));
        g = Math.round(255 * (aValue2 / colorModeY));
        b = Math.round(255 * (aValue3 / colorModeZ));
      }

      a = Math.round(255 * (aValue4 / colorModeA));

      // Limit values less than 0 and greater than 255
      r = (r < 0) ? 0 : r;
      g = (g < 0) ? 0 : g;
      b = (b < 0) ? 0 : b;
      a = (a < 0) ? 0 : a;
      r = (r > 255) ? 255 : r;
      g = (g > 255) ? 255 : g;
      b = (b > 255) ? 255 : b;
      a = (a > 255) ? 255 : a;

      // Create color int
      return (a << 24) & PConstants.ALPHA_MASK | (r << 16) & PConstants.RED_MASK | (g << 8) & PConstants.GREEN_MASK | b & PConstants.BLUE_MASK;
    }

    function color$2(aValue1, aValue2) {
      var a;

      // Color int and alpha
      if (aValue1 & PConstants.ALPHA_MASK) {
        a = Math.round(255 * (aValue2 / colorModeA));
        // Limit values less than 0 and greater than 255
        a = (a > 255) ? 255 : a;
        a = (a < 0) ? 0 : a;

        return aValue1 - (aValue1 & PConstants.ALPHA_MASK) + ((a << 24) & PConstants.ALPHA_MASK);
      }
      // Grayscale and alpha
      if (curColorMode === PConstants.RGB) {
        return color$4(aValue1, aValue1, aValue1, aValue2);
      }
      if (curColorMode === PConstants.HSB) {
        return color$4(0, 0, (aValue1 / colorModeX) * colorModeZ, aValue2);
      }
    }

    function color$1(aValue1) {
      // Grayscale
      if (aValue1 <= colorModeX && aValue1 >= 0) {
          if (curColorMode === PConstants.RGB) {
            return color$4(aValue1, aValue1, aValue1, colorModeA);
          }
          if (curColorMode === PConstants.HSB) {
            return color$4(0, 0, (aValue1 / colorModeX) * colorModeZ, colorModeA);
          }
      }
      // Color int
      if (aValue1) {
        if (aValue1 > 2147483647) {
          // Java Overflow
          aValue1 -= 4294967296;
        }
        return aValue1;
      }
    }

    /**
    * Creates colors for storing in variables of the color datatype. The parameters are
    * interpreted as RGB or HSB values depending on the current colorMode(). The default
    * mode is RGB values from 0 to 255 and therefore, the function call color(255, 204, 0)
    * will return a bright yellow color. More about how colors are stored can be found in
    * the reference for the color datatype.
    *
    * @param {int|float} aValue1        red or hue or grey values relative to the current color range.
    * Also can be color value in hexadecimal notation (i.e. #FFCC00 or 0xFFFFCC00)
    * @param {int|float} aValue2        green or saturation values relative to the current color range
    * @param {int|float} aValue3        blue or brightness values relative to the current color range
    * @param {int|float} aValue4        relative to current color range. Represents alpha
    *
    * @returns {color} the color
    *
    * @see colorMode
    */
    p.color = function(aValue1, aValue2, aValue3, aValue4) {

      // 4 arguments: (R, G, B, A) or (H, S, B, A)
      if (aValue1 !== undef && aValue2 !== undef && aValue3 !== undef && aValue4 !== undef) {
        return color$4(aValue1, aValue2, aValue3, aValue4);
      }

      // 3 arguments: (R, G, B) or (H, S, B)
      if (aValue1 !== undef && aValue2 !== undef && aValue3 !== undef) {
        return color$4(aValue1, aValue2, aValue3, colorModeA);
      }

      // 2 arguments: (Color, A) or (Grayscale, A)
      if (aValue1 !== undef && aValue2 !== undef) {
        return color$2(aValue1, aValue2);
      }

      // 1 argument: (Grayscale) or (Color)
      if (typeof aValue1 === "number") {
        return color$1(aValue1);
      }

      // Default
      return color$4(colorModeX, colorModeY, colorModeZ, colorModeA);
    };

    // Ease of use function to extract the colour bits into a string
    p.color.toString = function(colorInt) {
      return "rgba(" + ((colorInt & PConstants.RED_MASK) >>> 16) + "," + ((colorInt & PConstants.GREEN_MASK) >>> 8) +
             "," + ((colorInt & PConstants.BLUE_MASK)) + "," + ((colorInt & PConstants.ALPHA_MASK) >>> 24) / 255 + ")";
    };

    // Easy of use function to pack rgba values into a single bit-shifted color int.
    p.color.toInt = function(r, g, b, a) {
      return (a << 24) & PConstants.ALPHA_MASK | (r << 16) & PConstants.RED_MASK | (g << 8) & PConstants.GREEN_MASK | b & PConstants.BLUE_MASK;
    };

    // Creates a simple array in [R, G, B, A] format, [255, 255, 255, 255]
    p.color.toArray = function(colorInt) {
      return [(colorInt & PConstants.RED_MASK) >>> 16, (colorInt & PConstants.GREEN_MASK) >>> 8,
              colorInt & PConstants.BLUE_MASK, (colorInt & PConstants.ALPHA_MASK) >>> 24];
    };

    // Creates a WebGL color array in [R, G, B, A] format. WebGL wants the color ranges between 0 and 1, [1, 1, 1, 1]
    p.color.toGLArray = function(colorInt) {
      return [((colorInt & PConstants.RED_MASK) >>> 16) / 255, ((colorInt & PConstants.GREEN_MASK) >>> 8) / 255,
              (colorInt & PConstants.BLUE_MASK) / 255, ((colorInt & PConstants.ALPHA_MASK) >>> 24) / 255];
    };

    // HSB conversion function from Mootools, MIT Licensed
    p.color.toRGB = function(h, s, b) {
      // Limit values greater than range
      h = (h > colorModeX) ? colorModeX : h;
      s = (s > colorModeY) ? colorModeY : s;
      b = (b > colorModeZ) ? colorModeZ : b;

      h = (h / colorModeX) * 360;
      s = (s / colorModeY) * 100;
      b = (b / colorModeZ) * 100;

      var br = Math.round(b / 100 * 255);

      if (s === 0) { // Grayscale
        return [br, br, br];
      }
      var hue = h % 360;
      var f = hue % 60;
      var p = Math.round((b * (100 - s)) / 10000 * 255);
      var q = Math.round((b * (6000 - s * f)) / 600000 * 255);
      var t = Math.round((b * (6000 - s * (60 - f))) / 600000 * 255);
      switch (Math.floor(hue / 60)) {
      case 0:
        return [br, t, p];
      case 1:
        return [q, br, p];
      case 2:
        return [p, br, t];
      case 3:
        return [p, q, br];
      case 4:
        return [t, p, br];
      case 5:
        return [br, p, q];
      }
    };

    function colorToHSB(colorInt) {
      var red, green, blue;

      red   = ((colorInt & PConstants.RED_MASK) >>> 16) / 255;
      green = ((colorInt & PConstants.GREEN_MASK) >>> 8) / 255;
      blue  = (colorInt & PConstants.BLUE_MASK) / 255;

      var max = p.max(p.max(red,green), blue),
          min = p.min(p.min(red,green), blue),
          hue, saturation;

      if (min === max) {
        return [0, 0, max*colorModeZ];
      }
      saturation = (max - min) / max;

      if (red === max) {
        hue = (green - blue) / (max - min);
      } else if (green === max) {
        hue = 2 + ((blue - red) / (max - min));
      } else {
        hue = 4 + ((red - green) / (max - min));
      }

      hue /= 6;

      if (hue < 0) {
        hue += 1;
      } else if (hue > 1) {
        hue -= 1;
      }
      return [hue*colorModeX, saturation*colorModeY, max*colorModeZ];
    }

    /**
    * Extracts the brightness value from a color.
    *
    * @param {color} colInt any value of the color datatype
    *
    * @returns {float} The brightness color value.
    *
    * @see red
    * @see green
    * @see blue
    * @see hue
    * @see saturation
    */
    p.brightness = function(colInt){
      return colorToHSB(colInt)[2];
    };

    /**
    * Extracts the saturation value from a color.
    *
    * @param {color} colInt any value of the color datatype
    *
    * @returns {float} The saturation color value.
    *
    * @see red
    * @see green
    * @see blue
    * @see hue
    * @see brightness
    */
    p.saturation = function(colInt){
      return colorToHSB(colInt)[1];
    };

    /**
    * Extracts the hue value from a color.
    *
    * @param {color} colInt any value of the color datatype
    *
    * @returns {float} The hue color value.
    *
    * @see red
    * @see green
    * @see blue
    * @see saturation
    * @see brightness
    */
    p.hue = function(colInt){
      return colorToHSB(colInt)[0];
    };

    /**
    * Extracts the red value from a color, scaled to match current colorMode().
    * This value is always returned as a float so be careful not to assign it to an int value.
    *
    * @param {color} aColor any value of the color datatype
    *
    * @returns {float} The red color value.
    *
    * @see green
    * @see blue
    * @see alpha
    * @see >> right shift
    * @see hue
    * @see saturation
    * @see brightness
    */
    p.red = function(aColor) {
      return ((aColor & PConstants.RED_MASK) >>> 16) / 255 * colorModeX;
    };

    /**
    * Extracts the green value from a color, scaled to match current colorMode().
    * This value is always returned as a float so be careful not to assign it to an int value.
    *
    * @param {color} aColor any value of the color datatype
    *
    * @returns {float} The green color value.
    *
    * @see red
    * @see blue
    * @see alpha
    * @see >> right shift
    * @see hue
    * @see saturation
    * @see brightness
    */
    p.green = function(aColor) {
      return ((aColor & PConstants.GREEN_MASK) >>> 8) / 255 * colorModeY;
    };

    /**
    * Extracts the blue value from a color, scaled to match current colorMode().
    * This value is always returned as a float so be careful not to assign it to an int value.
    *
    * @param {color} aColor any value of the color datatype
    *
    * @returns {float} The blue color value.
    *
    * @see red
    * @see green
    * @see alpha
    * @see >> right shift
    * @see hue
    * @see saturation
    * @see brightness
    */
    p.blue = function(aColor) {
      return (aColor & PConstants.BLUE_MASK) / 255 * colorModeZ;
    };

    /**
    * Extracts the alpha value from a color, scaled to match current colorMode().
    * This value is always returned as a float so be careful not to assign it to an int value.
    *
    * @param {color} aColor any value of the color datatype
    *
    * @returns {float} The alpha color value.
    *
    * @see red
    * @see green
    * @see blue
    * @see >> right shift
    * @see hue
    * @see saturation
    * @see brightness
    */
    p.alpha = function(aColor) {
      return ((aColor & PConstants.ALPHA_MASK) >>> 24) / 255 * colorModeA;
    };

    /**
    * Calculates a color or colors between two colors at a specific increment.
    * The amt parameter is the amount to interpolate between the two values where 0.0
    * equal to the first point, 0.1 is very near the first point, 0.5 is half-way in between, etc.
    *
    * @param {color} c1     interpolate from this color
    * @param {color} c2     interpolate to this color
    * @param {float} amt    between 0.0 and 1.0
    *
    * @returns {float} The blended color.
    *
    * @see blendColor
    * @see color
    */
    p.lerpColor = function(c1, c2, amt) {
      var r, g, b, a, r1, g1, b1, a1, r2, g2, b2, a2;
      var hsb1, hsb2, rgb, h, s;
      var colorBits1 = p.color(c1);
      var colorBits2 = p.color(c2);

      if (curColorMode === PConstants.HSB) {
        // Special processing for HSB mode.
        // Get HSB and Alpha values for Color 1 and 2
        hsb1 = colorToHSB(colorBits1);
        a1 = ((colorBits1 & PConstants.ALPHA_MASK) >>> 24) / colorModeA;
        hsb2 = colorToHSB(colorBits2);
        a2 = ((colorBits2 & PConstants.ALPHA_MASK) >>> 24) / colorModeA;

        // Return lerp value for each channel, for HSB components
        h = p.lerp(hsb1[0], hsb2[0], amt);
        s = p.lerp(hsb1[1], hsb2[1], amt);
        b = p.lerp(hsb1[2], hsb2[2], amt);
        rgb = p.color.toRGB(h, s, b);
        // ... and for Alpha-range
        a = p.lerp(a1, a2, amt) * colorModeA;

        return (a << 24) & PConstants.ALPHA_MASK |
               (rgb[0] << 16) & PConstants.RED_MASK |
               (rgb[1] << 8) & PConstants.GREEN_MASK |
               rgb[2] & PConstants.BLUE_MASK;
      }

      // Get RGBA values for Color 1 to floats
      r1 = (colorBits1 & PConstants.RED_MASK) >>> 16;
      g1 = (colorBits1 & PConstants.GREEN_MASK) >>> 8;
      b1 = (colorBits1 & PConstants.BLUE_MASK);
      a1 = ((colorBits1 & PConstants.ALPHA_MASK) >>> 24) / colorModeA;

      // Get RGBA values for Color 2 to floats
      r2 = (colorBits2 & PConstants.RED_MASK) >>> 16;
      g2 = (colorBits2 & PConstants.GREEN_MASK) >>> 8;
      b2 = (colorBits2 & PConstants.BLUE_MASK);
      a2 = ((colorBits2 & PConstants.ALPHA_MASK) >>> 24) / colorModeA;

      // Return lerp value for each channel, INT for color, Float for Alpha-range
      r = p.lerp(r1, r2, amt) | 0;
      g = p.lerp(g1, g2, amt) | 0;
      b = p.lerp(b1, b2, amt) | 0;
      a = p.lerp(a1, a2, amt) * colorModeA;

      return (a << 24) & PConstants.ALPHA_MASK |
             (r << 16) & PConstants.RED_MASK |
             (g << 8) & PConstants.GREEN_MASK |
             b & PConstants.BLUE_MASK;
    };

    /**
    * Changes the way Processing interprets color data. By default, fill(), stroke(), and background()
    * colors are set by values between 0 and 255 using the RGB color model. It is possible to change the
    * numerical range used for specifying colors and to switch color systems. For example, calling colorMode(RGB, 1.0)
    * will specify that values are specified between 0 and 1. The limits for defining colors are altered by setting the
    * parameters range1, range2, range3, and range 4.
    *
    * @param {MODE} mode Either RGB or HSB, corresponding to Red/Green/Blue and Hue/Saturation/Brightness
    * @param {int|float} range              range for all color elements
    * @param {int|float} range1             range for the red or hue depending on the current color mode
    * @param {int|float} range2             range for the green or saturation depending on the current color mode
    * @param {int|float} range3             range for the blue or brightness depending on the current color mode
    * @param {int|float} range4             range for the alpha
    *
    * @returns none
    *
    * @see background
    * @see fill
    * @see stroke
    */
    p.colorMode = function() { // mode, range1, range2, range3, range4
      curColorMode = arguments[0];
      if (arguments.length > 1) {
        colorModeX   = arguments[1];
        colorModeY   = arguments[2] || arguments[1];
        colorModeZ   = arguments[3] || arguments[1];
        colorModeA   = arguments[4] || arguments[1];
      }
    };

    /**
    * Blends two color values together based on the blending mode given as the MODE parameter.
    * The possible modes are described in the reference for the blend() function.
    *
    * @param {color} c1 color: the first color to blend
    * @param {color} c2 color: the second color to blend
    * @param {MODE} MODE Either BLEND, ADD, SUBTRACT, DARKEST, LIGHTEST, DIFFERENCE, EXCLUSION, MULTIPLY,
    * SCREEN, OVERLAY, HARD_LIGHT, SOFT_LIGHT, DODGE, or BURN
    *
    * @returns {float} The blended color.
    *
    * @see blend
    * @see color
    */
    p.blendColor = function(c1, c2, mode) {
      if (mode === PConstants.REPLACE) {
        return p.modes.replace(c1, c2);
      } else if (mode === PConstants.BLEND) {
        return p.modes.blend(c1, c2);
      } else if (mode === PConstants.ADD) {
        return p.modes.add(c1, c2);
      } else if (mode === PConstants.SUBTRACT) {
        return p.modes.subtract(c1, c2);
      } else if (mode === PConstants.LIGHTEST) {
        return p.modes.lightest(c1, c2);
      } else if (mode === PConstants.DARKEST) {
        return p.modes.darkest(c1, c2);
      } else if (mode === PConstants.DIFFERENCE) {
        return p.modes.difference(c1, c2);
      } else if (mode === PConstants.EXCLUSION) {
        return p.modes.exclusion(c1, c2);
      } else if (mode === PConstants.MULTIPLY) {
        return p.modes.multiply(c1, c2);
      } else if (mode === PConstants.SCREEN) {
        return p.modes.screen(c1, c2);
      } else if (mode === PConstants.HARD_LIGHT) {
        return p.modes.hard_light(c1, c2);
      } else if (mode === PConstants.SOFT_LIGHT) {
        return p.modes.soft_light(c1, c2);
      } else if (mode === PConstants.OVERLAY) {
        return p.modes.overlay(c1, c2);
      } else if (mode === PConstants.DODGE) {
        return p.modes.dodge(c1, c2);
      } else if (mode === PConstants.BURN) {
        return p.modes.burn(c1, c2);
      }
    };

    ////////////////////////////////////////////////////////////////////////////
    // Canvas-Matrix manipulation
    ////////////////////////////////////////////////////////////////////////////

    function saveContext() {
      curContext.save();
    }

    function restoreContext() {
      curContext.restore();
      isStrokeDirty = true;
      isFillDirty = true;
    }

    /**
    * Prints the current matrix to the text window.
    *
    * @returns none
    *
    * @see pushMatrix
    * @see popMatrix
    * @see resetMatrix
    * @see applyMatrix
    */
    p.printMatrix = function() {
      modelView.print();
    };

    /**
    * Specifies an amount to displace objects within the display window. The x parameter specifies left/right translation,
    * the y parameter specifies up/down translation, and the z parameter specifies translations toward/away from the screen.
    * Using this function with the z  parameter requires using the P3D or OPENGL parameter in combination with size as shown
    * in the above example. Transformations apply to everything that happens after and subsequent calls to the function
    * accumulates the effect. For example, calling translate(50, 0) and then translate(20, 0) is the same as translate(70, 0).
    * If translate() is called within draw(), the transformation is reset when the loop begins again.
    * This function can be further controlled by the pushMatrix() and popMatrix().
    *
    * @param {int|float} x        left/right translation
    * @param {int|float} y        up/down translation
    * @param {int|float} z        forward/back translation
    *
    * @returns none
    *
    * @see pushMatrix
    * @see popMatrix
    * @see scale
    * @see rotate
    * @see rotateX
    * @see rotateY
    * @see rotateZ
    */
    Drawing2D.prototype.translate = function(x, y) {
      modelView.translate(x, y);
      modelViewInv.invTranslate(x, y);
      curContext.translate(x, y);
    };
    
    /**
    * Increases or decreases the size of a shape by expanding and contracting vertices. Objects always scale from their
    * relative origin to the coordinate system. Scale values are specified as decimal percentages. For example, the
    * function call scale(2.0) increases the dimension of a shape by 200%. Transformations apply to everything that
    * happens after and subsequent calls to the function multiply the effect. For example, calling scale(2.0) and
    * then scale(1.5) is the same as scale(3.0). If scale() is called within draw(), the transformation is reset when
    * the loop begins again. Using this fuction with the z  parameter requires passing P3D or OPENGL into the size()
    * parameter as shown in the example above. This function can be further controlled by pushMatrix() and popMatrix().
    *
    * @param {int|float} size     percentage to scale the object
    * @param {int|float} x        percentage to scale the object in the x-axis
    * @param {int|float} y        percentage to scale the object in the y-axis
    * @param {int|float} z        percentage to scale the object in the z-axis
    *
    * @returns none
    *
    * @see pushMatrix
    * @see popMatrix
    * @see translate
    * @see rotate
    * @see rotateX
    * @see rotateY
    * @see rotateZ
    */
    Drawing2D.prototype.scale = function(x, y) {
      modelView.scale(x, y);
      modelViewInv.invScale(x, y);
      curContext.scale(x, y || x);
    };
    
    /**
    * Pushes the current transformation matrix onto the matrix stack. Understanding pushMatrix() and popMatrix()
    * requires understanding the concept of a matrix stack. The pushMatrix() function saves the current coordinate
    * system to the stack and popMatrix() restores the prior coordinate system. pushMatrix() and popMatrix() are
    * used in conjuction with the other transformation methods and may be embedded to control the scope of
    * the transformations.
    *
    * @returns none
    *
    * @see popMatrix
    * @see translate
    * @see rotate
    * @see rotateX
    * @see rotateY
    * @see rotateZ
    */
    Drawing2D.prototype.pushMatrix = function() {
      userMatrixStack.load(modelView);
      userReverseMatrixStack.load(modelViewInv);
      saveContext();
    };
    
    /**
    * Pops the current transformation matrix off the matrix stack. Understanding pushing and popping requires
    * understanding the concept of a matrix stack. The pushMatrix() function saves the current coordinate system to
    * the stack and popMatrix() restores the prior coordinate system. pushMatrix() and popMatrix() are used in
    * conjuction with the other transformation methods and may be embedded to control the scope of the transformations.
    *
    * @returns none
    *
    * @see popMatrix
    * @see pushMatrix
    */
    Drawing2D.prototype.popMatrix = function() {
      modelView.set(userMatrixStack.pop());
      modelViewInv.set(userReverseMatrixStack.pop());
      restoreContext();
    };
    
    /**
    * Replaces the current matrix with the identity matrix. The equivalent function in OpenGL is glLoadIdentity().
    *
    * @returns none
    *
    * @see popMatrix
    * @see pushMatrix
    * @see applyMatrix
    * @see printMatrix
    */
    Drawing2D.prototype.resetMatrix = function() {
      modelView.reset();
      modelViewInv.reset();
      curContext.setTransform(1,0,0,1,0,0);
    };
    
    /**
    * Multiplies the current matrix by the one specified through the parameters. This is very slow because it will
    * try to calculate the inverse of the transform, so avoid it whenever possible. The equivalent function
    * in OpenGL is glMultMatrix().
    *
    * @param {int|float} n00-n15      numbers which define the 4x4 matrix to be multiplied
    *
    * @returns none
    *
    * @see popMatrix
    * @see pushMatrix
    * @see resetMatrix
    * @see printMatrix
    */
    DrawingShared.prototype.applyMatrix = function() {
      var a = arguments;
      modelView.apply(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]);
      modelViewInv.invApply(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]);
    };

    Drawing2D.prototype.applyMatrix = function() {
      var a = arguments;
      for (var cnt = a.length; cnt < 16; cnt++) {
        a[cnt] = 0;
      }
      a[10] = a[15] = 1;
      DrawingShared.prototype.applyMatrix.apply(this, a);
    };

    /**
    * Rotates a shape around the x-axis the amount specified by the angle parameter. Angles should be
    * specified in radians (values from 0 to PI*2) or converted to radians with the radians()  function.
    * Objects are always rotated around their relative position to the origin and positive numbers
    * rotate objects in a counterclockwise direction. Transformations apply to everything that happens
    * after and subsequent calls to the function accumulates the effect. For example, calling rotateX(PI/2)
    * and then rotateX(PI/2) is the same as rotateX(PI). If rotateX() is called within the draw(), the
    * transformation is reset when the loop begins again. This function requires passing P3D or OPENGL
    * into the size() parameter as shown in the example above.
    *
    * @param {int|float} angleInRadians     angle of rotation specified in radians
    *
    * @returns none
    *
    * @see rotateY
    * @see rotateZ
    * @see rotate
    * @see translate
    * @see scale
    * @see popMatrix
    * @see pushMatrix
    */
    p.rotateX = function(angleInRadians) {
      modelView.rotateX(angleInRadians);
      modelViewInv.invRotateX(angleInRadians);
    };

    /**
    * Rotates a shape around the z-axis the amount specified by the angle parameter. Angles should be
    * specified in radians (values from 0 to PI*2) or converted to radians with the radians()  function.
    * Objects are always rotated around their relative position to the origin and positive numbers
    * rotate objects in a counterclockwise direction. Transformations apply to everything that happens
    * after and subsequent calls to the function accumulates the effect. For example, calling rotateZ(PI/2)
    * and then rotateZ(PI/2) is the same as rotateZ(PI). If rotateZ() is called within the draw(), the
    * transformation is reset when the loop begins again. This function requires passing P3D or OPENGL
    * into the size() parameter as shown in the example above.
    *
    * @param {int|float} angleInRadians     angle of rotation specified in radians
    *
    * @returns none
    *
    * @see rotateX
    * @see rotateY
    * @see rotate
    * @see translate
    * @see scale
    * @see popMatrix
    * @see pushMatrix
    */
    Drawing2D.prototype.rotateZ = function() {
      throw "rotateZ() is not supported in 2D mode. Use rotate(float) instead.";
    };
    
    /**
    * Rotates a shape around the y-axis the amount specified by the angle parameter. Angles should be
    * specified in radians (values from 0 to PI*2) or converted to radians with the radians()  function.
    * Objects are always rotated around their relative position to the origin and positive numbers
    * rotate objects in a counterclockwise direction. Transformations apply to everything that happens
    * after and subsequent calls to the function accumulates the effect. For example, calling rotateY(PI/2)
    * and then rotateY(PI/2) is the same as rotateY(PI). If rotateY() is called within the draw(), the
    * transformation is reset when the loop begins again. This function requires passing P3D or OPENGL
    * into the size() parameter as shown in the example above.
    *
    * @param {int|float} angleInRadians     angle of rotation specified in radians
    *
    * @returns none
    *
    * @see rotateX
    * @see rotateZ
    * @see rotate
    * @see translate
    * @see scale
    * @see popMatrix
    * @see pushMatrix
    */
    p.rotateY = function(angleInRadians) {
      modelView.rotateY(angleInRadians);
      modelViewInv.invRotateY(angleInRadians);
    };

    /**
    * Rotates a shape the amount specified by the angle parameter. Angles should be specified in radians
    * (values from 0 to TWO_PI) or converted to radians with the radians() function. Objects are always
    * rotated around their relative position to the origin and positive numbers rotate objects in a
    * clockwise direction. Transformations apply to everything that happens after and subsequent calls
    * to the function accumulates the effect. For example, calling rotate(HALF_PI) and then rotate(HALF_PI)
    * is the same as rotate(PI). All tranformations are reset when draw() begins again. Technically,
    * rotate() multiplies the current transformation matrix by a rotation matrix. This function can be
    * further controlled by the pushMatrix() and popMatrix().
    *
    * @param {int|float} angleInRadians     angle of rotation specified in radians
    *
    * @returns none
    *
    * @see rotateX
    * @see rotateY
    * @see rotateZ
    * @see rotate
    * @see translate
    * @see scale
    * @see popMatrix
    * @see pushMatrix
    */
    Drawing2D.prototype.rotate = function(angleInRadians) {
      modelView.rotateZ(angleInRadians);
      modelViewInv.invRotateZ(angleInRadians);
      // XXX(jeresig): Note, angleInRadians may be in degrees
      // depending upon the angleMode
      curContext.rotate(p.convertToRadians(angleInRadians));
    };
    
    /**
    * The pushStyle() function saves the current style settings and popStyle()  restores the prior settings.
    * Note that these functions are always used together. They allow you to change the style settings and later
    * return to what you had. When a new style is started with pushStyle(), it builds on the current style information.
    * The pushStyle() and popStyle() functions can be embedded to provide more control (see the second example
    * above for a demonstration.)
    * The style information controlled by the following functions are included in the style: fill(), stroke(), tint(),
    * strokeWeight(), strokeCap(), strokeJoin(), imageMode(), rectMode(), ellipseMode(), shapeMode(), colorMode(),
    * textAlign(), textFont(), textMode(), textSize(), textLeading(), emissive(), specular(), shininess(), ambient()
    *
    * @returns none
    *
    * @see popStyle
    */
    p.pushStyle = function() {
      // Save the canvas state.
      saveContext();

      p.pushMatrix();

      var newState = {
        'doFill': doFill,
        'currentFillColor': currentFillColor,
        'doStroke': doStroke,
        'currentStrokeColor': currentStrokeColor,
        'curTint': curTint,
        'curRectMode': curRectMode,
        'curColorMode': curColorMode,
        'colorModeX': colorModeX,
        'colorModeZ': colorModeZ,
        'colorModeY': colorModeY,
        'colorModeA': colorModeA,
        'curTextFont': curTextFont,
        'horizontalTextAlignment': horizontalTextAlignment,
        'verticalTextAlignment': verticalTextAlignment,
        'textMode': textMode,
        'curFontName': curFontName,
        'curTextSize': curTextSize,
        'curTextAscent': curTextAscent,
        'curTextDescent': curTextDescent,
        'curTextLeading': curTextLeading
      };

      styleArray.push(newState);
    };

    /**
    * The pushStyle() function saves the current style settings and popStyle()  restores the prior settings; these
    * functions are always used together. They allow you to change the style settings and later return to what you had.
    * When a new style is started with pushStyle(), it builds on the current style information. The pushStyle() and
    * popStyle() functions can be embedded to provide more control (see the second example above for a demonstration.)
    *
    * @returns none
    *
    * @see pushStyle
    */
    p.popStyle = function() {
      var oldState = styleArray.pop();

      if (oldState) {
        restoreContext();

        p.popMatrix();

        doFill = oldState.doFill;
        currentFillColor = oldState.currentFillColor;
        doStroke = oldState.doStroke;
        currentStrokeColor = oldState.currentStrokeColor;
        curTint = oldState.curTint;
        curRectMode = oldState.curRectmode;
        curColorMode = oldState.curColorMode;
        colorModeX = oldState.colorModeX;
        colorModeZ = oldState.colorModeZ;
        colorModeY = oldState.colorModeY;
        colorModeA = oldState.colorModeA;
        curTextFont = oldState.curTextFont;
        curFontName = oldState.curFontName;
        curTextSize = oldState.curTextSize;
        horizontalTextAlignment = oldState.horizontalTextAlignment;
        verticalTextAlignment = oldState.verticalTextAlignment;
        textMode = oldState.textMode;
        curTextAscent = oldState.curTextAscent;
        curTextDescent = oldState.curTextDescent;
        curTextLeading = oldState.curTextLeading;
      } else {
        throw "Too many popStyle() without enough pushStyle()";
      }
    };

    ////////////////////////////////////////////////////////////////////////////
    // Time based functions
    ////////////////////////////////////////////////////////////////////////////

    /**
    * Processing communicates with the clock on your computer.
    * The year() function returns the current year as an integer (2003, 2004, 2005, etc).
    *
    * @returns {float} The current year.
    *
    * @see millis
    * @see second
    * @see minute
    * @see hour
    * @see day
    * @see month
    */
    p.year = function() {
      return new Date().getFullYear();
    };
    /**
    * Processing communicates with the clock on your computer.
    * The month() function returns the current month as a value from 1 - 12.
    *
    * @returns {float} The current month.
    *
    * @see millis
    * @see second
    * @see minute
    * @see hour
    * @see day
    * @see year
    */
    p.month = function() {
      return new Date().getMonth() + 1;
    };
    /**
    * Processing communicates with the clock on your computer.
    * The day() function returns the current day as a value from 1 - 31.
    *
    * @returns {float} The current day.
    *
    * @see millis
    * @see second
    * @see minute
    * @see hour
    * @see month
    * @see year
    */
    p.day = function() {
      return new Date().getDate();
    };
    /**
    * Processing communicates with the clock on your computer.
    * The hour() function returns the current hour as a value from 0 - 23.
    *
    * @returns {float} The current hour.
    *
    * @see millis
    * @see second
    * @see minute
    * @see month
    * @see day
    * @see year
    */
    p.hour = function() {
      return new Date().getHours();
    };
    /**
    * Processing communicates with the clock on your computer.
    * The minute() function returns the current minute as a value from 0 - 59.
    *
    * @returns {float} The current minute.
    *
    * @see millis
    * @see second
    * @see month
    * @see hour
    * @see day
    * @see year
    */
    p.minute = function() {
      return new Date().getMinutes();
    };
    /**
    * Processing communicates with the clock on your computer.
    * The second() function returns the current second as a value from 0 - 59.
    *
    * @returns {float} The current minute.
    *
    * @see millis
    * @see month
    * @see minute
    * @see hour
    * @see day
    * @see year
    */
    p.second = function() {
      return new Date().getSeconds();
    };
    /**
    * Returns the number of milliseconds (thousandths of a second) since starting a sketch.
    * This information is often used for timing animation sequences.
    *
    * @returns {long} The number of milliseconds since starting the sketch.
    *
    * @see month
    * @see second
    * @see minute
    * @see hour
    * @see day
    * @see year
    */
    p.millis = function() {
      return Date.now() - start;
    };

    /**
    * Executes the code within draw() one time. This functions allows the program to update
    * the display window only when necessary, for example when an event registered by
    * mousePressed() or keyPressed() occurs.
    * In structuring a program, it only makes sense to call redraw() within events such as
    * mousePressed(). This is because redraw() does not run draw() immediately (it only sets
    * a flag that indicates an update is needed).
    * Calling redraw() within draw() has no effect because draw() is continuously called anyway.
    *
    * @returns none
    *
    * @see noLoop
    * @see loop
    */
    function redrawHelper() {
      var sec = (Date.now() - timeSinceLastFPS) / 1000;
      framesSinceLastFPS++;
      var fps = framesSinceLastFPS / sec;

      // recalculate FPS every half second for better accuracy.
      if (sec > 0.5) {
        timeSinceLastFPS = Date.now();
        framesSinceLastFPS = 0;
        p.__frameRate = fps;
      }

      p.frameCount++;
    }

    Drawing2D.prototype.redraw = function() {
      redrawHelper();

      curContext.lineWidth = lineWidth;
      var pmouseXLastEvent = p.pmouseX,
          pmouseYLastEvent = p.pmouseY;
      p.pmouseX = pmouseXLastFrame;
      p.pmouseY = pmouseYLastFrame;

      saveContext();
      p.draw();
      restoreContext();

      pmouseXLastFrame = p.mouseX;
      pmouseYLastFrame = p.mouseY;
      p.pmouseX = pmouseXLastEvent;
      p.pmouseY = pmouseYLastEvent;

      // Even if the user presses the mouse for less than the time of a single
      // frame, we want mouseIsPressed to be true for a single frame when
      // clicking, otherwise code that uses this boolean misses the click
      // completely. (This is hard to reproduce on a real mouse, but easy on a
      // trackpad with tap-to-click enabled.)
      p.mouseIsPressed = p.__mousePressed;
    };
    
    /**
    * Stops Processing from continuously executing the code within draw(). If loop() is
    * called, the code in draw() begin to run continuously again. If using noLoop() in
    * setup(), it should be the last line inside the block.
    * When noLoop() is used, it's not possible to manipulate or access the screen inside event
    * handling functions such as mousePressed() or keyPressed(). Instead, use those functions
    * to call redraw() or loop(), which will run draw(), which can update the screen properly.
    * This means that when noLoop() has been called, no drawing can happen, and functions like
    * saveFrame() or loadPixels() may not be used.
    * Note that if the sketch is resized, redraw() will be called to update the sketch, even
    * after noLoop() has been specified. Otherwise, the sketch would enter an odd state until
    * loop() was called.
    *
    * @returns none
    *
    * @see redraw
    * @see draw
    * @see loop
    */
    p.noLoop = function() {
      doLoop = false;
      loopStarted = false;
      clearInterval(looping);
      curSketch.onPause();
    };

    /**
    * Causes Processing to continuously execute the code within draw(). If noLoop() is called,
    * the code in draw() stops executing.
    *
    * @returns none
    *
    * @see noLoop
    */
    p.loop = function() {
      if (loopStarted) {
        return;
      }

      timeSinceLastFPS = Date.now();
      framesSinceLastFPS = 0;

      looping = window.setInterval(function() {
        try {
          curSketch.onFrameStart();
          p.redraw();
          curSketch.onFrameEnd();
        } catch(e_loop) {
          window.clearInterval(looping);
          throw e_loop;
        }
      }, curMsPerFrame);
      doLoop = true;
      loopStarted = true;
      curSketch.onLoop();
    };

    /**
    * Specifies the number of frames to be displayed every second. If the processor is not
    * fast enough to maintain the specified rate, it will not be achieved. For example, the
    * function call frameRate(30) will attempt to refresh 30 times a second. It is recommended
    * to set the frame rate within setup(). The default rate is 60 frames per second.
    *
    * @param {int} aRate        number of frames per second.
    *
    * @returns none
    *
    * @see delay
    */
    p.frameRate = function(aRate) {
      curFrameRate = aRate;
      curMsPerFrame = 1000 / curFrameRate;

      // clear and reset interval
      if (doLoop) {
        p.noLoop();
        p.loop();
      }
    };

    ////////////////////////////////////////////////////////////////////////////
    // JavaScript event binding and releasing
    ////////////////////////////////////////////////////////////////////////////

    var eventHandlers = [];

    function attachEventHandler(elem, type, fn) {
      if (elem.addEventListener) {
        elem.addEventListener(type, fn, false);
      } else {
        elem.attachEvent("on" + type, fn);
      }
      eventHandlers.push({elem: elem, type: type, fn: fn});
    }

    function detachEventHandler(eventHandler) {
      var elem = eventHandler.elem,
          type = eventHandler.type,
          fn   = eventHandler.fn;
      if (elem.removeEventListener) {
        elem.removeEventListener(type, fn, false);
      } else if (elem.detachEvent) {
        elem.detachEvent("on" + type, fn);
      }
    }

    /**
    * Quits/stops/exits the program. Programs without a draw() function exit automatically
    * after the last line has run, but programs with draw() run continuously until the
    * program is manually stopped or exit() is run.
    * Rather than terminating immediately, exit() will cause the sketch to exit after draw()
    * has completed (or after setup() completes if called during the setup() method).
    *
    * @returns none
    */
    p.exit = function() {
      window.clearInterval(looping);

      removeInstance(p.externals.canvas.id);

      // Step through the libraries to detach them
      for (var lib in Processing.lib) {
        if (Processing.lib.hasOwnProperty(lib)) {
          if (Processing.lib[lib].hasOwnProperty("detach")) {
            Processing.lib[lib].detach(p);
          }
        }
      }

      var i = eventHandlers.length;
      while (i--) {
        detachEventHandler(eventHandlers[i]);
      }
      curSketch.onExit();
    };

    ////////////////////////////////////////////////////////////////////////////
    // MISC functions
    ////////////////////////////////////////////////////////////////////////////

    /**
    * Sets the cursor to a predefined symbol, an image, or turns it on if already hidden.
    * If you are trying to set an image as the cursor, it is recommended to make the size
    * 16x16 or 32x32 pixels. It is not possible to load an image as the cursor if you are
    * exporting your program for the Web. The values for parameters x and y must be less
    * than the dimensions of the image.
    *
    * @param {MODE} MODE either ARROW, CROSS, HAND, MOVE, TEXT, WAIT
    * @param {PImage} image       any variable of type PImage
    * @param {int}    x           the horizonal active spot of the cursor
    * @param {int}    y           the vertical active spot of the cursor
    *
    * @returns none
    *
    * @see noCursor
    */
    p.cursor = function() {
      if (arguments.length > 1 || (arguments.length === 1 && arguments[0] instanceof p.PImage)) {
        var image = arguments[0],
          x, y;
        if (arguments.length >= 3) {
          x = arguments[1];
          y = arguments[2];
          if (x < 0 || y < 0 || y >= image.height || x >= image.width) {
            throw "x and y must be non-negative and less than the dimensions of the image";
          }
        } else {
          x = image.width >>> 1;
          y = image.height >>> 1;
        }

        // see https://developer.mozilla.org/en/Using_URL_values_for_the_cursor_property
        var imageDataURL = image.toDataURL();
        var style = "url(\"" + imageDataURL + "\") " + x + " " + y + ", default";
        curCursor = curElement.style.cursor = style;
      } else if (arguments.length === 1) {
        var mode = arguments[0];
        curCursor = curElement.style.cursor = mode;
      } else {
        curCursor = curElement.style.cursor = oldCursor;
      }
    };

    /**
    * Hides the cursor from view.
    *
    * @returns none
    *
    * @see cursor
    */
    p.noCursor = function() {
      curCursor = curElement.style.cursor = PConstants.NOCURSOR;
    };

    /**
    * Links to a webpage either in the same window or in a new window. The complete URL
    * must be specified.
    *
    * @param {String} href      complete url as a String in quotes
    * @param {String} target    name of the window to load the URL as a string in quotes
    *
    * @returns none
    */
    p.link = function(href, target) {
      if (target !== undef) {
        window.open(href, target);
      } else {
        window.location = href;
      }
    };

    // PGraphics methods
    // These functions exist only for compatibility with P5
    p.beginDraw = nop;
    p.endDraw = nop;

    /**
     * This function takes content from a canvas and turns it into an ImageData object to be used with a PImage
     *
     * @returns {ImageData}        ImageData object to attach to a PImage (1D array of pixel data)
     *
     * @see PImage
     */
    Drawing2D.prototype.toImageData = function(x, y, w, h) {
      x = x !== undef ? x : 0;
      y = y !== undef ? y : 0;
      w = w !== undef ? w : p.width;
      h = h !== undef ? h : p.height;
      return curContext.getImageData(x, y, w, h);
    };
    
    /**
    * Displays message in the browser's status area. This is the text area in the lower
    * left corner of the browser. The status() function will only work when the
    * Processing program is running in a web browser.
    *
    * @param {String} text      any valid String
    *
    * @returns none
    */
    p.status = function(text) {
      window.status = text;
    };

    ////////////////////////////////////////////////////////////////////////////
    // Binary Functions
    ////////////////////////////////////////////////////////////////////////////

    /**
    * Converts a byte, char, int, or color to a String containing the equivalent binary
    * notation. For example color(0, 102, 153, 255) will convert to the String
    * "11111111000000000110011010011001". This function can help make your geeky debugging
    * sessions much happier.
    *
    * @param {byte|char|int|color} num          byte, char, int, color: value to convert
    * @param {int} numBits                      number of digits to return
    *
    * @returns {String}
    *
    * @see unhex
    * @see hex
    * @see unbinary
    */
    p.binary = function(num, numBits) {
      var bit;
      if (numBits > 0) {
        bit = numBits;
      } else if(num instanceof Char) {
        bit = 16;
        num |= 0; // making it int
      } else {
        // autodetect, skipping zeros
        bit = 32;
        while (bit > 1 && !((num >>> (bit - 1)) & 1)) {
          bit--;
        }
      }
      var result = "";
      while (bit > 0) {
        result += ((num >>> (--bit)) & 1) ? "1" : "0";
      }
      return result;
    };

    /**
    * Converts a String representation of a binary number to its equivalent integer value.
    * For example, unbinary("00001000") will return 8.
    *
    * @param {String} binaryString String
    *
    * @returns {Int}
    *
    * @see hex
    * @see binary
    * @see unbinary
    */
    p.unbinary = function(binaryString) {
      var i = binaryString.length - 1, mask = 1, result = 0;
      while (i >= 0) {
        var ch = binaryString[i--];
        if (ch !== '0' && ch !== '1') {
          throw "the value passed into unbinary was not an 8 bit binary number";
        }
        if (ch === '1') {
          result += mask;
        }
        mask <<= 1;
      }
      return result;
    };

    /**
    * Number-to-String formatting function. Prepends "plus" or "minus" depending
    * on whether the value is positive or negative, respectively, after padding
    * the value with zeroes on the left and right, the number of zeroes used dictated
    * by the values 'leftDigits' and 'rightDigits'. 'value' cannot be an array.
    *
    * @param {int|float} value                 the number to format
    * @param {String} plus                     the prefix for positive numbers
    * @param {String} minus                    the prefix for negative numbers
    * @param {int} left                        number of digits to the left of the decimal point
    * @param {int} right                       number of digits to the right of the decimal point
    * @param {String} group                    string delimited for groups, such as the comma in "1,000"
    *
    * @returns {String or String[]}
    *
    * @see nfCore
    */
    function nfCoreScalar(value, plus, minus, leftDigits, rightDigits, group) {
      var sign = (value < 0) ? minus : plus;
      var autoDetectDecimals = rightDigits === 0;
      var rightDigitsOfDefault = (rightDigits === undef || rightDigits < 0) ? 0 : rightDigits;

      var absValue = Math.abs(value);
      if (autoDetectDecimals) {
        rightDigitsOfDefault = 1;
        absValue *= 10;
        while (Math.abs(Math.round(absValue) - absValue) > 1e-6 && rightDigitsOfDefault < 7) {
          ++rightDigitsOfDefault;
          absValue *= 10;
        }
      } else if (rightDigitsOfDefault !== 0) {
        absValue *= Math.pow(10, rightDigitsOfDefault);
      }

      // Using Java's default rounding policy HALF_EVEN. This policy is based
      // on the idea that 0.5 values round to the nearest even number, and
      // everything else is rounded normally.
      var number, doubled = absValue * 2;
      if (Math.floor(absValue) === absValue) {
        number = absValue;
      } else if (Math.floor(doubled) === doubled) {
        var floored = Math.floor(absValue);
        number = floored + (floored % 2);
      } else {
        number = Math.round(absValue);
      }

      var buffer = "";
      var totalDigits = leftDigits + rightDigitsOfDefault;
      while (totalDigits > 0 || number > 0) {
        totalDigits--;
        buffer = "" + (number % 10) + buffer;
        number = Math.floor(number / 10);
      }
      if (group !== undef) {
        var i = buffer.length - 3 - rightDigitsOfDefault;
        while(i > 0) {
          buffer = buffer.substring(0,i) + group + buffer.substring(i);
          i-=3;
        }
      }
      if (rightDigitsOfDefault > 0) {
        return sign + buffer.substring(0, buffer.length - rightDigitsOfDefault) +
               "." + buffer.substring(buffer.length - rightDigitsOfDefault, buffer.length);
      }
      return sign + buffer;
    }

    /**
    * Number-to-String formatting function. Prepends "plus" or "minus" depending
    * on whether the value is positive or negative, respectively, after padding
    * the value with zeroes on the left and right, the number of zeroes used dictated
    * by the values 'leftDigits' and 'rightDigits'. 'value' can be an array;
    * if the input is an array, each value in it is formatted separately, and
    * an array with formatted values is returned.
    *
    * @param {int|int[]|float|float[]} value   the number(s) to format
    * @param {String} plus                     the prefix for positive numbers
    * @param {String} minus                    the prefix for negative numbers
    * @param {int} left                        number of digits to the left of the decimal point
    * @param {int} right                       number of digits to the right of the decimal point
    * @param {String} group                    string delimited for groups, such as the comma in "1,000"
    *
    * @returns {String or String[]}
    *
    * @see nfCoreScalar
    */
    function nfCore(value, plus, minus, leftDigits, rightDigits, group) {
      if (value instanceof Array) {
        var arr = [];
        for (var i = 0, len = value.length; i < len; i++) {
          arr.push(nfCoreScalar(value[i], plus, minus, leftDigits, rightDigits, group));
        }
        return arr;
      }
      return nfCoreScalar(value, plus, minus, leftDigits, rightDigits, group);
    }

    /**
    * Utility function for formatting numbers into strings. There are two versions, one for
    * formatting floats and one for formatting ints. The values for the digits, left, and
    * right parameters should always be positive integers.
    * As shown in the above example, nf() is used to add zeros to the left and/or right
    * of a number. This is typically for aligning a list of numbers. To remove digits from
    * a floating-point number, use the int(), ceil(), floor(), or round() functions.
    *
    * @param {int|int[]|float|float[]} value   the number(s) to format
    * @param {int} left                        number of digits to the left of the decimal point
    * @param {int} right                       number of digits to the right of the decimal point
    *
    * @returns {String or String[]}
    *
    * @see nfs
    * @see nfp
    * @see nfc
    */
    p.nf = function(value, leftDigits, rightDigits) { return nfCore(value, "", "-", leftDigits, rightDigits); };

    /**
    * Utility function for formatting numbers into strings. Similar to nf()  but leaves a blank space in front
    * of positive numbers so they align with negative numbers in spite of the minus symbol. There are two
    * versions, one for formatting floats and one for formatting ints. The values for the digits, left,
    * and right parameters should always be positive integers.
    *
    * @param {int|int[]|float|float[]} value   the number(s) to format
    * @param {int} left                        number of digits to the left of the decimal point
    * @param {int} right                       number of digits to the right of the decimal point
    *
    * @returns {String or String[]}
    *
    * @see nf
    * @see nfp
    * @see nfc
    */
    p.nfs = function(value, leftDigits, rightDigits) { return nfCore(value, " ", "-", leftDigits, rightDigits); };

    /**
    * Utility function for formatting numbers into strings. Similar to nf()  but puts a "+" in front of
    * positive numbers and a "-" in front of negative numbers. There are two versions, one for formatting
    * floats and one for formatting ints. The values for the digits, left, and right parameters should
    * always be positive integers.
    *
    * @param {int|int[]|float|float[]} value   the number(s) to format
    * @param {int} left                        number of digits to the left of the decimal point
    * @param {int} right                       number of digits to the right of the decimal point
    *
    * @returns {String or String[]}
    *
    * @see nfs
    * @see nf
    * @see nfc
    */
    p.nfp = function(value, leftDigits, rightDigits) { return nfCore(value, "+", "-", leftDigits, rightDigits); };

    /**
    * Utility function for formatting numbers into strings and placing appropriate commas to mark
    * units of 1000. There are two versions, one for formatting ints and one for formatting an array
    * of ints. The value for the digits parameter should always be a positive integer.
    *
    * @param {int|int[]|float|float[]} value   the number(s) to format
    * @param {int} left                        number of digits to the left of the decimal point
    * @param {int} right                       number of digits to the right of the decimal point
    *
    * @returns {String or String[]}
    *
    * @see nf
    * @see nfs
    * @see nfp
    */
    p.nfc = function(value, leftDigits, rightDigits) { return nfCore(value, "", "-", leftDigits, rightDigits, ","); };

    var decimalToHex = function(d, padding) {
      //if there is no padding value added, default padding to 8 else go into while statement.
      padding = (padding === undef || padding === null) ? padding = 8 : padding;
      if (d < 0) {
        d = 0xFFFFFFFF + d + 1;
      }
      var hex = Number(d).toString(16).toUpperCase();
      while (hex.length < padding) {
        hex = "0" + hex;
      }
      if (hex.length >= padding) {
        hex = hex.substring(hex.length - padding, hex.length);
      }
      return hex;
    };

    // note: since we cannot keep track of byte, int types by default the returned string is 8 chars long
    // if no 2nd argument is passed.  closest compromise we can use to match java implementation Feb 5 2010
    // also the char parser has issues with chars that are not digits or letters IE: !@#$%^&*
    /**
    * Converts a byte, char, int, or color to a String containing the equivalent hexadecimal notation.
    * For example color(0, 102, 153, 255) will convert to the String "FF006699". This function can help
    * make your geeky debugging sessions much happier.
    *
    * @param {byte|char|int|Color} value   the value to turn into a hex string
    * @param {int} digits                 the number of digits to return
    *
    * @returns {String}
    *
    * @see unhex
    * @see binary
    * @see unbinary
    */
    p.hex = function(value, len) {
      if (arguments.length === 1) {
        if (value instanceof Char) {
          len = 4;
        } else { // int or byte, indistinguishable at the moment, default to 8
          len = 8;
        }
      }
      return decimalToHex(value, len);
    };

    function unhexScalar(hex) {
      var value = parseInt("0x" + hex, 16);

      // correct for int overflow java expectation
      if (value > 2147483647) {
        value -= 4294967296;
      }
      return value;
    }

    /**
    * Converts a String representation of a hexadecimal number to its equivalent integer value.
    *
    * @param {String} hex   the hex string to convert to an int
    *
    * @returns {int}
    *
    * @see hex
    * @see binary
    * @see unbinary
    */
    p.unhex = function(hex) {
      if (hex instanceof Array) {
        var arr = [];
        for (var i = 0; i < hex.length; i++) {
          arr.push(unhexScalar(hex[i]));
        }
        return arr;
      }
      return unhexScalar(hex);
    };

    // Load a file or URL into strings
    /**
    * Reads the contents of a file or url and creates a String array of its individual lines.
    * The filename parameter can also be a URL to a file found online.  If the file is not available or an error occurs,
    * null will be returned and an error message will be printed to the console. The error message does not halt
    * the program.
    *
    * @param {String} filename    name of the file or url to load
    *
    * @returns {String[]}
    *
    * @see loadBytes
    * @see saveStrings
    * @see saveBytes
    */
    p.loadStrings = function(filename) {
      if (localStorage[filename]) {
        return localStorage[filename].split("\n");
      }

      var filecontent = ajax(filename);
      if(typeof filecontent !== "string" || filecontent === "") {
        return [];
      }

      // deal with the fact that Windows uses \r\n, Unix uses \n,
      // Mac uses \r, and we actually expect \n
      filecontent = filecontent.replace(/(\r\n?)/g,"\n").replace(/\n$/,"");

      return filecontent.split("\n");
    };

    // Writes an array of strings to a file, one line per string
    /**
    * Writes an array of strings to a file, one line per string. This file is saved to the localStorage.
    *
    * @param {String} filename    name of the file to save to localStorage
    * @param {String[]} strings   string array to be written
    *
    * @see loadBytes
    * @see loadStrings
    * @see saveBytes
    */
    p.saveStrings = function(filename, strings) {
      localStorage[filename] = strings.join('\n');
    };

    /**
    * Reads the contents of a file or url and places it in a byte array. If a file is specified, it must be located in the localStorage.
    * The filename parameter can also be a URL to a file found online.
    *
    * @param {String} filename   name of a file in the localStorage or a URL.
    *
    * @returns {byte[]}
    *
    * @see loadStrings
    * @see saveStrings
    * @see saveBytes
    */
    p.loadBytes = function(url) {
      var string = ajax(url);
      var ret = [];

      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }

      return ret;
    };

    /**
     * Removes the first argument from the arguments set -- shifts.
     *
     * @param {Arguments} args  The Arguments object.
     *
     * @return {Object[]}       Returns an array of arguments except first one.
     *
     * @see #match
     */
    function removeFirstArgument(args) {
      return Array.prototype.slice.call(args, 1);
    }

    ////////////////////////////////////////////////////////////////////////////
    // String Functions
    ////////////////////////////////////////////////////////////////////////////
    /**
     * The matchAll() function is identical to match(), except that it returns an array of all matches in
     * the specified String, rather than just the first.
     *
     * @param {String} aString  the String to search inside
     * @param {String} aRegExp  the regexp to be used for matching
     *
     * @return {String[]} returns an array of matches
     *
     * @see #match
     */
    p.matchAll = function(aString, aRegExp) {
      var results = [],
          latest;
      var regexp = new RegExp(aRegExp, "g");
      while ((latest = regexp.exec(aString)) !== null) {
        results.push(latest);
        if (latest[0].length === 0) {
          ++regexp.lastIndex;
        }
      }
      return results.length > 0 ? results : null;
    };
    /**
     * The contains(string) function returns true if the string passed in the parameter
     * is a substring of this string. It returns false if the string passed
     * in the parameter is not a substring of this string.
     *
     * @param {String} The string to look for in the current string
     *
     * @return {boolean} returns true if this string contains
     * the string passed as parameter. returns false, otherwise.
     *
     */
    p.__contains = function (subject, subStr) {
      if (typeof subject !== "string") {
        return subject.contains.apply(subject, removeFirstArgument(arguments));
      }
      //Parameter is not null AND
      //The type of the parameter is the same as this object (string)
      //The javascript function that finds a substring returns 0 or higher
      return (
        (subject !== null) &&
        (subStr !== null) &&
        (typeof subStr === "string") &&
        (subject.indexOf(subStr) > -1)
      );
    };
    /**
     * The __replaceAll() function searches all matches between a substring (or regular expression) and a string,
     * and replaces the matched substring with a new substring
     *
     * @param {String} subject    a substring
     * @param {String} regex      a substring or a regular expression
     * @param {String} replace    the string to replace the found value
     *
     * @return {String} returns result
     *
     * @see #match
     */
    p.__replaceAll = function(subject, regex, replacement) {
      if (typeof subject !== "string") {
        return subject.replaceAll.apply(subject, removeFirstArgument(arguments));
      }

      return subject.replace(new RegExp(regex, "g"), replacement);
    };
    /**
     * The __replaceFirst() function searches first matche between a substring (or regular expression) and a string,
     * and replaces the matched substring with a new substring
     *
     * @param {String} subject    a substring
     * @param {String} regex      a substring or a regular expression
     * @param {String} replace    the string to replace the found value
     *
     * @return {String} returns result
     *
     * @see #match
     */
    p.__replaceFirst = function(subject, regex, replacement) {
      if (typeof subject !== "string") {
        return subject.replaceFirst.apply(subject, removeFirstArgument(arguments));
      }

      return subject.replace(new RegExp(regex, ""), replacement);
    };
    /**
     * The __replace() function searches all matches between a substring and a string,
     * and replaces the matched substring with a new substring
     *
     * @param {String} subject         a substring
     * @param {String} what         a substring to find
     * @param {String} replacement    the string to replace the found value
     *
     * @return {String} returns result
     */
    p.__replace = function(subject, what, replacement) {
      if (typeof subject !== "string") {
        return subject.replace.apply(subject, removeFirstArgument(arguments));
      }
      if (what instanceof RegExp) {
        return subject.replace(what, replacement);
      }

      if (typeof what !== "string") {
        what = what.toString();
      }
      if (what === "") {
        return subject;
      }

      var i = subject.indexOf(what);
      if (i < 0) {
        return subject;
      }

      var j = 0, result = "";
      do {
        result += subject.substring(j, i) + replacement;
        j = i + what.length;
      } while ( (i = subject.indexOf(what, j)) >= 0);
      return result + subject.substring(j);
    };
    /**
     * The __equals() function compares two strings (or objects) to see if they are the same.
     * This method is necessary because it's not possible to compare strings using the equality operator (==).
     * Returns true if the strings are the same and false if they are not.
     *
     * @param {String} subject  a string used for comparison
     * @param {String} other  a string used for comparison with
     *
     * @return {boolean} true is the strings are the same false otherwise
     */
    p.__equals = function(subject, other) {
      if (subject.equals instanceof Function) {
        return subject.equals.apply(subject, removeFirstArgument(arguments));
      }

      // TODO use virtEquals for HashMap here
      return subject.valueOf() === other.valueOf();
    };
    /**
     * The __equalsIgnoreCase() function compares two strings to see if they are the same.
     * Returns true if the strings are the same, either when forced to all lower case or
     * all upper case.
     *
     * @param {String} subject  a string used for comparison
     * @param {String} other  a string used for comparison with
     *
     * @return {boolean} true is the strings are the same, ignoring case. false otherwise
     */
    p.__equalsIgnoreCase = function(subject, other) {
      if (typeof subject !== "string") {
        return subject.equalsIgnoreCase.apply(subject, removeFirstArgument(arguments));
      }

      return subject.toLowerCase() === other.toLowerCase();
    };
    /**
     * The __toCharArray() function splits the string into a char array.
     *
     * @param {String} subject The string
     *
     * @return {Char[]} a char array
     */
    p.__toCharArray = function(subject) {
      if (typeof subject !== "string") {
        return subject.toCharArray.apply(subject, removeFirstArgument(arguments));
      }

      var chars = [];
      for (var i = 0, len = subject.length; i < len; ++i) {
        chars[i] = new Char(subject.charAt(i));
      }
      return chars;
    };
    /**
     * The __split() function splits a string using the regex delimiter
     * specified. If limit is specified, the resultant array will have number
     * of elements equal to or less than the limit.
     *
     * @param {String} subject string to be split
     * @param {String} regexp  regex string used to split the subject
     * @param {int}    limit   max number of tokens to be returned
     *
     * @return {String[]} an array of tokens from the split string
     */
    p.__split = function(subject, regex, limit) {
      if (typeof subject !== "string") {
        return subject.split.apply(subject, removeFirstArgument(arguments));
      }

      var pattern = new RegExp(regex);

      // If limit is not specified, use JavaScript's built-in String.split.
      if ((limit === undef) || (limit < 1)) {
        return subject.split(pattern);
      }

      // If limit is specified, JavaScript's built-in String.split has a
      // different behaviour than Java's. A Java-compatible implementation is
      // provided here.
      var result = [], currSubject = subject, pos;
      while (((pos = currSubject.search(pattern)) !== -1)
          && (result.length < (limit - 1))) {
        var match = pattern.exec(currSubject).toString();
        result.push(currSubject.substring(0, pos));
        currSubject = currSubject.substring(pos + match.length);
      }
      if ((pos !== -1) || (currSubject !== "")) {
        result.push(currSubject);
      }
      return result;
    };
    /**
     * The codePointAt() function returns the unicode value of the character at a given index of a string.
     *
     * @param  {int} idx         the index of the character
     *
     * @return {String} code     the String containing the unicode value of the character
     */
    p.__codePointAt = function(subject, idx) {
      var code = subject.charCodeAt(idx),
          hi,
          low;
      if (0xD800 <= code && code <= 0xDBFF) {
        hi = code;
        low = subject.charCodeAt(idx + 1);
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
      }
      return code;
    };
    /**
     * The match() function matches a string with a regular expression, and returns the match as an
     * array. The first index is the matching expression, and array elements
     * [1] and higher represent each of the groups (sequences found in parens).
     *
     * @param {String} str      the String to be searched
     * @param {String} regexp   the regexp to be used for matching
     *
     * @return {String[]} an array of matching strings
     */
    p.match = function(str, regexp) {
      return str.match(regexp);
    };
    /**
     * The startsWith() function tests if a string starts with the specified prefix.  If the prefix
     * is the empty String or equal to the subject String, startsWith() will also return true.
     *
     * @param {String} prefix   the String used to compare against the start of the subject String.
     * @param {int}    toffset  (optional) an offset into the subject String where searching should begin.
     *
     * @return {boolean} true if the subject String starts with the prefix.
     */
    p.__startsWith = function(subject, prefix, toffset) {
      if (typeof subject !== "string") {
        return subject.startsWith.apply(subject, removeFirstArgument(arguments));
      }

      toffset = toffset || 0;
      if (toffset < 0 || toffset > subject.length) {
        return false;
      }
      return (prefix === '' || prefix === subject) ? true : (subject.indexOf(prefix) === toffset);
    };
    /**
     * The endsWith() function tests if a string ends with the specified suffix.  If the suffix
     * is the empty String, endsWith() will also return true.
     *
     * @param {String} suffix   the String used to compare against the end of the subject String.
     *
     * @return {boolean} true if the subject String starts with the prefix.
     */
    p.__endsWith = function(subject, suffix) {
      if (typeof subject !== "string") {
        return subject.endsWith.apply(subject, removeFirstArgument(arguments));
      }

      var suffixLen = suffix ? suffix.length : 0;
      return (suffix === '' || suffix === subject) ? true :
        (subject.indexOf(suffix) === subject.length - suffixLen);
    };

    ////////////////////////////////////////////////////////////////////////////
    // Other java specific functions
    ////////////////////////////////////////////////////////////////////////////

    /**
     * The returns hash code of the.
     *
     * @param {Object} subject The string
     *
     * @return {int} a hash code
     */
    p.__hashCode = function(subject) {
      if (subject.hashCode instanceof Function) {
        return subject.hashCode.apply(subject, removeFirstArgument(arguments));
      }
      return virtHashCode(subject);
    };
    /**
     * The __printStackTrace() prints stack trace to the console.
     *
     * @param {Exception} subject The error
     */
    p.__printStackTrace = function(subject) {
      p.println("Exception: " + subject.toString() );
    };

    /**
     * Clears logs, if logger has been initialized
     */
    p._clearLogs = function() {
      if (Processing.logger.clear) {
        Processing.logger.clear();
      }
    };

    var logBuffer = [];

    /**
     * The println() function writes to the console area of the Processing environment.
     * Each call to this function creates a new line of output. Individual elements can be separated with quotes ("") and joined with the string concatenation operator (+).
     *
     * @param {String} message the string to write to the console
     *
     * @see #join
     * @see #print
     */
    p.println = function(message) {
      var bufferLen = logBuffer.length;
      if (bufferLen) {
        Processing.logger.log(logBuffer.join(""));
        logBuffer.length = 0; // clear log buffer
      }

      if (arguments.length === 0 && bufferLen === 0) {
        Processing.logger.log("");
      } else if (arguments.length !== 0) {
        Processing.logger.log(message);
      }
    };
    /**
     * The print() function writes to the console area of the Processing environment.
     *
     * @param {String} message the string to write to the console
     *
     * @see #join
     */
    p.print = function(message) {
      logBuffer.push(message);
    };

    // Alphanumeric chars arguments automatically converted to numbers when
    // passed in, and will come out as numbers.
    p.str = function(val) {
      if (val instanceof Array) {
        var arr = [];
        for (var i = 0; i < val.length; i++) {
          arr.push(val[i].toString() + "");
        }
        return arr;
      }
      return (val.toString() + "");
    };
    /**
     * Remove whitespace characters from the beginning and ending
     * of a String or a String array. Works like String.trim() but includes the
     * unicode nbsp character as well. If an array is passed in the function will return a new array not effecting the array passed in.
     *
     * @param {String} str    the string to trim
     * @param {String[]} str  the string array to trim
     *
     * @return {String|String[]} retrurns a string or an array will removed whitespaces
     */
    p.trim = function(str) {
      if (str instanceof Array) {
        var arr = [];
        for (var i = 0; i < str.length; i++) {
          arr.push(str[i].replace(/^\s*/, '').replace(/\s*$/, '').replace(/\r*$/, ''));
        }
        return arr;
      }
      return str.replace(/^\s*/, '').replace(/\s*$/, '').replace(/\r*$/, '');
    };

    // Conversion
    function booleanScalar(val) {
      if (typeof val === 'number') {
        return val !== 0;
      }
      if (typeof val === 'boolean') {
        return val;
      }
      if (typeof val === 'string') {
        return val.toLowerCase() === 'true';
      }
      if (val instanceof Char) {
        // 1, T or t
        return val.code === 49 || val.code === 84 || val.code === 116;
      }
    }

    /**
     * Converts the passed parameter to the function to its boolean value.
     * It will return an array of booleans if an array is passed in.
     *
     * @param {int, byte, string} val          the parameter to be converted to boolean
     * @param {int[], byte[], string[]} val    the array to be converted to boolean[]
     *
     * @return {boolean|boolean[]} returns a boolean or an array of booleans
     */
    p.parseBoolean = function (val) {
      if (val instanceof Array) {
        var ret = [];
        for (var i = 0; i < val.length; i++) {
          ret.push(booleanScalar(val[i]));
        }
        return ret;
      }
      return booleanScalar(val);
    };

    /**
     * Converts the passed parameter to the function to its byte value.
     * A byte is a number between -128 and 127.
     * It will return an array of bytes if an array is passed in.
     *
     * @param {int, char} what        the parameter to be conveted to byte
     * @param {int[], char[]} what    the array to be converted to byte[]
     *
     * @return {byte|byte[]} returns a byte or an array of bytes
     */
    p.parseByte = function(what) {
      if (what instanceof Array) {
        var bytes = [];
        for (var i = 0; i < what.length; i++) {
          bytes.push((0 - (what[i] & 0x80)) | (what[i] & 0x7F));
        }
        return bytes;
      }
      return (0 - (what & 0x80)) | (what & 0x7F);
    };

    /**
     * Converts the passed parameter to the function to its char value.
     * It will return an array of chars if an array is passed in.
     *
     * @param {int, byte} key        the parameter to be conveted to char
     * @param {int[], byte[]} key    the array to be converted to char[]
     *
     * @return {char|char[]} returns a char or an array of chars
     */
    p.parseChar = function(key) {
      if (typeof key === "number") {
        return new Char(String.fromCharCode(key & 0xFFFF));
      }
      if (key instanceof Array) {
        var ret = [];
        for (var i = 0; i < key.length; i++) {
          ret.push(new Char(String.fromCharCode(key[i] & 0xFFFF)));
        }
        return ret;
      }
      throw "char() may receive only one argument of type int, byte, int[], or byte[].";
    };

    // Processing doc claims good argument types are: int, char, byte, boolean,
    // String, int[], char[], byte[], boolean[], String[].
    // floats should not work. However, floats with only zeroes right of the
    // decimal will work because JS converts those to int.
    function floatScalar(val) {
      if (typeof val === 'number') {
        return val;
      }
      if (typeof val === 'boolean') {
        return val ? 1 : 0;
      }
      if (typeof val === 'string') {
        return parseFloat(val);
      }
      if (val instanceof Char) {
        return val.code;
      }
    }

    /**
     * Converts the passed parameter to the function to its float value.
     * It will return an array of floats if an array is passed in.
     *
     * @param {int, char, boolean, string} val            the parameter to be conveted to float
     * @param {int[], char[], boolean[], string[]} val    the array to be converted to float[]
     *
     * @return {float|float[]} returns a float or an array of floats
     */
    p.parseFloat = function(val) {
      if (val instanceof Array) {
        var ret = [];
        for (var i = 0; i < val.length; i++) {
          ret.push(floatScalar(val[i]));
        }
        return ret;
      }
      return floatScalar(val);
    };

    function intScalar(val, radix) {
      if (typeof val === 'number') {
        return val & 0xFFFFFFFF;
      }
      if (typeof val === 'boolean') {
        return val ? 1 : 0;
      }
      if (typeof val === 'string') {
        var number = parseInt(val, radix || 10); // Default to decimal radix.
        return number & 0xFFFFFFFF;
      }
      if (val instanceof Char) {
        return val.code;
      }
    }

    /**
     * Converts the passed parameter to the function to its int value.
     * It will return an array of ints if an array is passed in.
     *
     * @param {string, char, boolean, float} val            the parameter to be conveted to int
     * @param {string[], char[], boolean[], float[]} val    the array to be converted to int[]
     * @param {int} radix                                   optional the radix of the number (for js compatibility)
     *
     * @return {int|int[]} returns a int or an array of ints
     */
    p.parseInt = function(val, radix) {
      if (val instanceof Array) {
        var ret = [];
        for (var i = 0; i < val.length; i++) {
          if (typeof val[i] === 'string' && !/^\s*[+\-]?\d+\s*$/.test(val[i])) {
            ret.push(0);
          } else {
            ret.push(intScalar(val[i], radix));
          }
        }
        return ret;
      }
      return intScalar(val, radix);
    };

    p.__int_cast = function(val) {
      return 0|val;
    };

    p.__instanceof = function(obj, type) {
      if (typeof type !== "function") {
        throw "Function is expected as type argument for instanceof operator";
      }

      if (typeof obj === "string") {
        // special case for strings
        return type === Object || type === String;
      }

      if (obj instanceof type) {
        // fast check if obj is already of type instance
        return true;
      }

      if (typeof obj !== "object" || obj === null) {
        return false; // not an object or null
      }

      var objType = obj.constructor;
      if (type.$isInterface) {
        // expecting the interface
        // queueing interfaces from type and its base classes
        var interfaces = [];
        while (objType) {
          if (objType.$interfaces) {
            interfaces = interfaces.concat(objType.$interfaces);
          }
          objType = objType.$base;
        }
        while (interfaces.length > 0) {
          var i = interfaces.shift();
          if (i === type) {
            return true;
          }
          // wide search in base interfaces
          if (i.$interfaces) {
            interfaces = interfaces.concat(i.$interfaces);
          }
        }
        return false;
      }

      while (objType.hasOwnProperty("$base")) {
        objType = objType.$base;
        if (objType === type) {
          return true; // object was found
        }
      }

      return false;
    };

    ////////////////////////////////////////////////////////////////////////////
    // Math functions
    ////////////////////////////////////////////////////////////////////////////

    // Calculation
    /**
    * Calculates the absolute value (magnitude) of a number. The absolute value of a number is always positive.
    *
    * @param {int|float} value   int or float
    *
    * @returns {int|float}
    */
    p.abs = Math.abs;

    /**
    * Calculates the closest int value that is greater than or equal to the value of the parameter.
    * For example, ceil(9.03) returns the value 10.
    *
    * @param {float} value   float
    *
    * @returns {int}
    *
    * @see floor
    * @see round
    */
    p.ceil = Math.ceil;

    /**
    * Constrains a value to not exceed a maximum and minimum value.
    *
    * @param {int|float} value   the value to constrain
    * @param {int|float} value   minimum limit
    * @param {int|float} value   maximum limit
    *
    * @returns {int|float}
    *
    * @see max
    * @see min
    */
    p.constrain = function(aNumber, aMin, aMax) {
      return aNumber > aMax ? aMax : aNumber < aMin ? aMin : aNumber;
    };

    /**
    * Calculates the distance between two points.
    *
    * @param {int|float} x1     int or float: x-coordinate of the first point
    * @param {int|float} y1     int or float: y-coordinate of the first point
    * @param {int|float} z1     int or float: z-coordinate of the first point
    * @param {int|float} x2     int or float: x-coordinate of the second point
    * @param {int|float} y2     int or float: y-coordinate of the second point
    * @param {int|float} z2     int or float: z-coordinate of the second point
    *
    * @returns {float}
    */
    p.dist = function() {
      var dx, dy, dz;
      if (arguments.length === 4) {
        dx = arguments[0] - arguments[2];
        dy = arguments[1] - arguments[3];
        return Math.sqrt(dx * dx + dy * dy);
      }
      if (arguments.length === 6) {
        dx = arguments[0] - arguments[3];
        dy = arguments[1] - arguments[4];
        dz = arguments[2] - arguments[5];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
      }
    };

    /**
    * Returns Euler's number e (2.71828...) raised to the power of the value parameter.
    *
    * @param {int|float} value   int or float: the exponent to raise e to
    *
    * @returns {float}
    */
    p.exp = Math.exp;

    /**
    * Calculates the closest int value that is less than or equal to the value of the parameter.
    *
    * @param {int|float} value        the value to floor
    *
    * @returns {int|float}
    *
    * @see ceil
    * @see round
    */
    p.floor = Math.floor;

    /**
    * Calculates a number between two numbers at a specific increment. The amt  parameter is the
    * amount to interpolate between the two values where 0.0 equal to the first point, 0.1 is very
    * near the first point, 0.5 is half-way in between, etc. The lerp function is convenient for
    * creating motion along a straight path and for drawing dotted lines.
    *
    * @param {int|float} value1       float or int: first value
    * @param {int|float} value2       float or int: second value
    * @param {int|float} amt          float: between 0.0 and 1.0
    *
    * @returns {float}
    *
    * @see curvePoint
    * @see bezierPoint
    */
    p.lerp = function(value1, value2, amt) {
      return ((value2 - value1) * amt) + value1;
    };

    /**
    * Calculates the natural logarithm (the base-e logarithm) of a number. This function
    * expects the values greater than 0.0.
    *
    * @param {int|float} value        int or float: number must be greater then 0.0
    *
    * @returns {float}
    */
    p.log = Math.log;

    /**
    * Calculates the magnitude (or length) of a vector. A vector is a direction in space commonly
    * used in computer graphics and linear algebra. Because it has no "start" position, the magnitude
    * of a vector can be thought of as the distance from coordinate (0,0) to its (x,y) value.
    * Therefore, mag() is a shortcut for writing "dist(0, 0, x, y)".
    *
    * @param {int|float} a       float or int: first value
    * @param {int|float} b       float or int: second value
    * @param {int|float} c       float or int: third value
    *
    * @returns {float}
    *
    * @see dist
    */
    p.mag = function(a, b, c) {
      if (c) {
        return Math.sqrt(a * a + b * b + c * c);
      }

      return Math.sqrt(a * a + b * b);
    };

    /**
    * Re-maps a number from one range to another. In the example above, the number '25' is converted from
    * a value in the range 0..100 into a value that ranges from the left edge (0) to the right edge (width) of the screen.
    * Numbers outside the range are not clamped to 0 and 1, because out-of-range values are often intentional and useful.
    *
    * @param {float} value        The incoming value to be converted
    * @param {float} istart       Lower bound of the value's current range
    * @param {float} istop        Upper bound of the value's current range
    * @param {float} ostart       Lower bound of the value's target range
    * @param {float} ostop        Upper bound of the value's target range
    *
    * @returns {float}
    *
    * @see norm
    * @see lerp
    */
    p.map = function(value, istart, istop, ostart, ostop) {
      return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
    };

    /**
    * Determines the largest value in a sequence of numbers.
    *
    * @param {int|float} value1         int or float
    * @param {int|float} value2         int or float
    * @param {int|float} value3         int or float
    * @param {int|float} array          int or float array
    *
    * @returns {int|float}
    *
    * @see min
    */
    p.max = function() {
      if (arguments.length === 2) {
        return arguments[0] < arguments[1] ? arguments[1] : arguments[0];
      }
      var numbers = arguments.length === 1 ? arguments[0] : arguments; // if single argument, array is used
      if (! ("length" in numbers && numbers.length > 0)) {
        throw "Non-empty array is expected";
      }
      var max = numbers[0],
        count = numbers.length;
      for (var i = 1; i < count; ++i) {
        if (max < numbers[i]) {
          max = numbers[i];
        }
      }
      return max;
    };

    /**
    * Determines the smallest value in a sequence of numbers.
    *
    * @param {int|float} value1         int or float
    * @param {int|float} value2         int or float
    * @param {int|float} value3         int or float
    * @param {int|float} array          int or float array
    *
    * @returns {int|float}
    *
    * @see max
    */
    p.min = function() {
      if (arguments.length === 2) {
        return arguments[0] < arguments[1] ? arguments[0] : arguments[1];
      }
      var numbers = arguments.length === 1 ? arguments[0] : arguments; // if single argument, array is used
      if (! ("length" in numbers && numbers.length > 0)) {
        throw "Non-empty array is expected";
      }
      var min = numbers[0],
        count = numbers.length;
      for (var i = 1; i < count; ++i) {
        if (min > numbers[i]) {
          min = numbers[i];
        }
      }
      return min;
    };

    /**
    * Normalizes a number from another range into a value between 0 and 1.
    * Identical to map(value, low, high, 0, 1);
    * Numbers outside the range are not clamped to 0 and 1, because out-of-range
    * values are often intentional and useful.
    *
    * @param {float} aNumber    The incoming value to be converted
    * @param {float} low        Lower bound of the value's current range
    * @param {float} high       Upper bound of the value's current range
    *
    * @returns {float}
    *
    * @see map
    * @see lerp
    */
    p.norm = function(aNumber, low, high) {
      return (aNumber - low) / (high - low);
    };

    /**
    * Facilitates exponential expressions. The pow() function is an efficient way of
    * multiplying numbers by themselves (or their reciprocal) in large quantities.
    * For example, pow(3, 5) is equivalent to the expression 3*3*3*3*3 and pow(3, -5)
    * is equivalent to 1 / 3*3*3*3*3.
    *
    * @param {int|float} num        base of the exponential expression
    * @param {int|float} exponent   power of which to raise the base
    *
    * @returns {float}
    *
    * @see sqrt
    */
    p.pow = Math.pow;

    /**
    * Calculates the integer closest to the value parameter. For example, round(9.2) returns the value 9.
    *
    * @param {float} value        number to round
    *
    * @returns {int}
    *
    * @see floor
    * @see ceil
    */
    p.round = Math.round;

    /**
    * Squares a number (multiplies a number by itself). The result is always a positive number,
    * as multiplying two negative numbers always yields a positive result. For example, -1 * -1 = 1.
    *
    * @param {float} value        int or float
    *
    * @returns {float}
    *
    * @see sqrt
    */
    p.sq = function(aNumber) {
      return aNumber * aNumber;
    };

    /**
    * Calculates the square root of a number. The square root of a number is always positive,
    * even though there may be a valid negative root. The square root s of number a is such
    * that s*s = a. It is the opposite of squaring.
    *
    * @param {float} value        int or float, non negative
    *
    * @returns {float}
    *
    * @see pow
    * @see sq
    */
    p.sqrt = Math.sqrt;

    // Trigonometry
    p.convertToDegrees = function(angle) {
        return p.angleMode === "degrees" ?
            p.degrees(angle) :
            angle;
    };

    p.convertToRadians = function(angle) {
        return p.angleMode === "degrees" ?
            p.radians(angle) :
            angle;
    };

    var compose = function() {
        var args = arguments;

        return function() {
            var ret = arguments;

            for (var i = 0; i < args.length; i++) {
                ret = [ args[i].apply(args[i], ret) ];
            }

            return ret[0];
        };
    };

    /**
    * The inverse of cos(), returns the arc cosine of a value. This function expects the
    * values in the range of -1 to 1 and values are returned in the range 0 to PI (3.1415927).
    *
    * @param {float} value        the value whose arc cosine is to be returned
    *
    * @returns {float}
    *
    * @see cos
    * @see asin
    * @see atan
    */
    p.acos = compose(Math.acos, p.convertToDegrees);

    /**
    * The inverse of sin(), returns the arc sine of a value. This function expects the values
    * in the range of -1 to 1 and values are returned in the range -PI/2 to PI/2.
    *
    * @param {float} value        the value whose arc sine is to be returned
    *
    * @returns {float}
    *
    * @see sin
    * @see acos
    * @see atan
    */
    p.asin = compose(Math.asin, p.convertToDegrees);

    /**
    * The inverse of tan(), returns the arc tangent of a value. This function expects the values
    * in the range of -Infinity to Infinity (exclusive) and values are returned in the range -PI/2 to PI/2 .
    *
    * @param {float} value        -Infinity to Infinity (exclusive)
    *
    * @returns {float}
    *
    * @see tan
    * @see asin
    * @see acos
    */
    p.atan = compose(Math.atan, p.convertToDegrees);

    /**
    * Calculates the angle (in radians) from a specified point to the coordinate origin as measured from
    * the positive x-axis. Values are returned as a float in the range from PI to -PI. The atan2() function
    * is most often used for orienting geometry to the position of the cursor. Note: The y-coordinate of the
    * point is the first parameter and the x-coordinate is the second due the the structure of calculating the tangent.
    *
    * @param {float} y        y-coordinate of the point
    * @param {float} x        x-coordinate of the point
    *
    * @returns {float}
    *
    * @see tan
    */
    p.atan2 = compose(Math.atan2, p.convertToDegrees);

    /**
    * Calculates the cosine of an angle. This function expects the values of the angle parameter to be provided
    * in radians (values from 0 to PI*2). Values are returned in the range -1 to 1.
    *
    * @param {float} value        an angle in radians
    *
    * @returns {float}
    *
    * @see tan
    * @see sin
    */
    p.cos = compose(p.convertToRadians, Math.cos);

    /**
    * Converts a radian measurement to its corresponding value in degrees. Radians and degrees are two ways of
    * measuring the same thing. There are 360 degrees in a circle and 2*PI radians in a circle. For example,
    * 90 degrees = PI/2 = 1.5707964. All trigonometric methods in Processing require their parameters to be specified in radians.
    *
    * @param {int|float} value        an angle in radians
    *
    * @returns {float}
    *
    * @see radians
    */
    p.degrees = function(aAngle) {
      return (aAngle * 180) / Math.PI;
    };

    /**
    * Converts a degree measurement to its corresponding value in radians. Radians and degrees are two ways of
    * measuring the same thing. There are 360 degrees in a circle and 2*PI radians in a circle. For example,
    * 90 degrees = PI/2 = 1.5707964. All trigonometric methods in Processing require their parameters to be specified in radians.
    *
    * @param {int|float} value        an angle in radians
    *
    * @returns {float}
    *
    * @see degrees
    */
    p.radians = function(aAngle) {
      return (aAngle / 180) * Math.PI;
    };

    /**
    * Calculates the sine of an angle. This function expects the values of the angle parameter to be provided in
    * radians (values from 0 to 6.28). Values are returned in the range -1 to 1.
    *
    * @param {float} value        an angle in radians
    *
    * @returns {float}
    *
    * @see cos
    * @see radians
    */
    p.sin = compose(p.convertToRadians, Math.sin);

    /**
    * Calculates the ratio of the sine and cosine of an angle. This function expects the values of the angle
    * parameter to be provided in radians (values from 0 to PI*2). Values are returned in the range infinity to -infinity.
    *
    * @param {float} value        an angle in radians
    *
    * @returns {float}
    *
    * @see cos
    * @see sin
    * @see radians
    */
    p.tan = compose(p.convertToRadians, Math.tan);

    // XXX(jeresig): Need to set these globals later as they
    // use the new methods.
    cameraFOV = (p.angleMode === "degrees" ? 60 : p.radians(60));
    cameraZ = cameraY / p.tan(cameraFOV / 2);

    var currentRandom = Math.random;

    /**
    * Generates random numbers. Each time the random() function is called, it returns an unexpected value within
    * the specified range. If one parameter is passed to the function it will return a float between zero and the
    * value of the high parameter. The function call random(5) returns values between 0 and 5 (starting at zero,
    * up to but not including 5). If two parameters are passed, it will return a float with a value between the
    * parameters. The function call random(-5, 10.2) returns values starting at -5 up to (but not including) 10.2.
    * To convert a floating-point random number to an integer, use the int() function.
    *
    * @param {int|float} value1         if one parameter is used, the top end to random from, if two params the low end
    * @param {int|float} value2         the top end of the random range
    *
    * @returns {float}
    *
    * @see randomSeed
    * @see noise
    */
    p.random = function() {
      if(arguments.length === 0) {
        return currentRandom();
      }
      if(arguments.length === 1) {
        return currentRandom() * arguments[0];
      }
      var aMin = arguments[0], aMax = arguments[1];
      return currentRandom() * (aMax - aMin) + aMin;
    };

    // Pseudo-random generator
    function Marsaglia(i1, i2) {
      // from http://www.math.uni-bielefeld.de/~sillke/ALGORITHMS/random/marsaglia-c
      var z=i1 || 362436069, w= i2 || 521288629;
      var nextInt = function() {
        z=(36969*(z&65535)+(z>>>16)) & 0xFFFFFFFF;
        w=(18000*(w&65535)+(w>>>16)) & 0xFFFFFFFF;
        return (((z&0xFFFF)<<16) | (w&0xFFFF)) & 0xFFFFFFFF;
      };

      this.nextDouble = function() {
        var i = nextInt() / 4294967296;
        return i < 0 ? 1 + i : i;
      };
      this.nextInt = nextInt;
    }
    Marsaglia.createRandomized = function() {
      var now = new Date();
      return new Marsaglia((now / 60000) & 0xFFFFFFFF, now & 0xFFFFFFFF);
    };

    /**
    * Sets the seed value for random(). By default, random() produces different results each time the
    * program is run. Set the value parameter to a constant to return the same pseudo-random numbers
    * each time the software is run.
    *
    * @param {int|float} seed         int
    *
    * @see random
    * @see noise
    * @see noiseSeed
    */
    p.randomSeed = function(seed) {
      currentRandom = (new Marsaglia(seed)).nextDouble;
    };

    // Random
    // We have two random()'s in the code... what does this do ? and which one is current ?
    p.Random = function(seed) {
      var haveNextNextGaussian = false, nextNextGaussian, random;

      this.nextGaussian = function() {
        if (haveNextNextGaussian) {
          haveNextNextGaussian = false;
          return nextNextGaussian;
        }
        var v1, v2, s;
        do {
          v1 = 2 * random() - 1; // between -1.0 and 1.0
          v2 = 2 * random() - 1; // between -1.0 and 1.0
          s = v1 * v1 + v2 * v2;
        }
        while (s >= 1 || s === 0);

        var multiplier = Math.sqrt(-2 * Math.log(s) / s);
        nextNextGaussian = v2 * multiplier;
        haveNextNextGaussian = true;

        return v1 * multiplier;
      };

      // by default use standard random, otherwise seeded
      random = (seed === undef) ? Math.random : (new Marsaglia(seed)).nextDouble;
    };

    // Noise functions and helpers
    function PerlinNoise(seed) {
      var rnd = seed !== undef ? new Marsaglia(seed) : Marsaglia.createRandomized();
      var i, j;
      // http://www.noisemachine.com/talk1/17b.html
      // http://mrl.nyu.edu/~perlin/noise/
      // generate permutation
      var perm = new Uint8Array(512);
      for(i=0;i<256;++i) { perm[i] = i; }
      for(i=0;i<256;++i) { var t = perm[j = rnd.nextInt() & 0xFF]; perm[j] = perm[i]; perm[i] = t; }
      // copy to avoid taking mod in perm[0];
      for(i=0;i<256;++i) { perm[i + 256] = perm[i]; }

      function grad3d(i,x,y,z) {
        var h = i & 15; // convert into 12 gradient directions
        var u = h<8 ? x : y,
            v = h<4 ? y : h===12||h===14 ? x : z;
        return ((h&1) === 0 ? u : -u) + ((h&2) === 0 ? v : -v);
      }

      function grad2d(i,x,y) {
        var v = (i & 1) === 0 ? x : y;
        return (i&2) === 0 ? -v : v;
      }

      function grad1d(i,x) {
        return (i&1) === 0 ? -x : x;
      }

      function lerp(t,a,b) { return a + t * (b - a); }

      this.noise3d = function(x, y, z) {
        var X = Math.floor(x)&255, Y = Math.floor(y)&255, Z = Math.floor(z)&255;
        x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
        var fx = (3-2*x)*x*x, fy = (3-2*y)*y*y, fz = (3-2*z)*z*z;
        var p0 = perm[X]+Y, p00 = perm[p0] + Z, p01 = perm[p0 + 1] + Z,
            p1 = perm[X + 1] + Y, p10 = perm[p1] + Z, p11 = perm[p1 + 1] + Z;
        return lerp(fz,
          lerp(fy, lerp(fx, grad3d(perm[p00], x, y, z), grad3d(perm[p10], x-1, y, z)),
                   lerp(fx, grad3d(perm[p01], x, y-1, z), grad3d(perm[p11], x-1, y-1,z))),
          lerp(fy, lerp(fx, grad3d(perm[p00 + 1], x, y, z-1), grad3d(perm[p10 + 1], x-1, y, z-1)),
                   lerp(fx, grad3d(perm[p01 + 1], x, y-1, z-1), grad3d(perm[p11 + 1], x-1, y-1,z-1))));
      };

      this.noise2d = function(x, y) {
        var X = Math.floor(x)&255, Y = Math.floor(y)&255;
        x -= Math.floor(x); y -= Math.floor(y);
        var fx = (3-2*x)*x*x, fy = (3-2*y)*y*y;
        var p0 = perm[X]+Y, p1 = perm[X + 1] + Y;
        return lerp(fy,
          lerp(fx, grad2d(perm[p0], x, y), grad2d(perm[p1], x-1, y)),
          lerp(fx, grad2d(perm[p0 + 1], x, y-1), grad2d(perm[p1 + 1], x-1, y-1)));
      };

      this.noise1d = function(x) {
        var X = Math.floor(x)&255;
        x -= Math.floor(x);
        var fx = (3-2*x)*x*x;
        return lerp(fx, grad1d(perm[X], x), grad1d(perm[X+1], x-1));
      };
    }

    // processing defaults
    var noiseProfile = { generator: undef, octaves: 4, fallout: 0.5, seed: undef};

    /**
    * Returns the Perlin noise value at specified coordinates. Perlin noise is a random sequence
    * generator producing a more natural ordered, harmonic succession of numbers compared to the
    * standard random() function. It was invented by Ken Perlin in the 1980s and been used since
    * in graphical applications to produce procedural textures, natural motion, shapes, terrains etc.
    * The main difference to the random() function is that Perlin noise is defined in an infinite
    * n-dimensional space where each pair of coordinates corresponds to a fixed semi-random value
    * (fixed only for the lifespan of the program). The resulting value will always be between 0.0
    * and 1.0. Processing can compute 1D, 2D and 3D noise, depending on the number of coordinates
    * given. The noise value can be animated by moving through the noise space as demonstrated in
    * the example above. The 2nd and 3rd dimension can also be interpreted as time.
    * The actual noise is structured similar to an audio signal, in respect to the function's use
    * of frequencies. Similar to the concept of harmonics in physics, perlin noise is computed over
    * several octaves which are added together for the final result.
    * Another way to adjust the character of the resulting sequence is the scale of the input
    * coordinates. As the function works within an infinite space the value of the coordinates
    * doesn't matter as such, only the distance between successive coordinates does (eg. when using
    * noise() within a loop). As a general rule the smaller the difference between coordinates, the
    * smoother the resulting noise sequence will be. Steps of 0.005-0.03 work best for most applications,
    * but this will differ depending on use.
    *
    * @param {float} x          x coordinate in noise space
    * @param {float} y          y coordinate in noise space
    * @param {float} z          z coordinate in noise space
    *
    * @returns {float}
    *
    * @see random
    * @see noiseDetail
    */
    p.noise = function(x, y, z) {
      if(noiseProfile.generator === undef) {
        // caching
        noiseProfile.generator = new PerlinNoise(noiseProfile.seed);
      }
      var generator = noiseProfile.generator;
      var effect = 1, k = 1, sum = 0;
      for(var i=0; i<noiseProfile.octaves; ++i) {
        effect *= noiseProfile.fallout;
        switch (arguments.length) {
        case 1:
          sum += effect * (1 + generator.noise1d(k*x))/2; break;
        case 2:
          sum += effect * (1 + generator.noise2d(k*x, k*y))/2; break;
        case 3:
          sum += effect * (1 + generator.noise3d(k*x, k*y, k*z))/2; break;
        }
        k *= 2;
      }
      return sum;
    };

    /**
    * Adjusts the character and level of detail produced by the Perlin noise function.
    * Similar to harmonics in physics, noise is computed over several octaves. Lower octaves
    * contribute more to the output signal and as such define the overal intensity of the noise,
    * whereas higher octaves create finer grained details in the noise sequence. By default,
    * noise is computed over 4 octaves with each octave contributing exactly half than its
    * predecessor, starting at 50% strength for the 1st octave. This falloff amount can be
    * changed by adding an additional function parameter. Eg. a falloff factor of 0.75 means
    * each octave will now have 75% impact (25% less) of the previous lower octave. Any value
    * between 0.0 and 1.0 is valid, however note that values greater than 0.5 might result in
    * greater than 1.0 values returned by noise(). By changing these parameters, the signal
    * created by the noise() function can be adapted to fit very specific needs and characteristics.
    *
    * @param {int} octaves          number of octaves to be used by the noise() function
    * @param {float} falloff        falloff factor for each octave
    *
    * @see noise
    */
    p.noiseDetail = function(octaves, fallout) {
      noiseProfile.octaves = octaves;
      if(fallout !== undef) {
        noiseProfile.fallout = fallout;
      }
    };

    /**
    * Sets the seed value for noise(). By default, noise() produces different results each
    * time the program is run. Set the value parameter to a constant to return the same
    * pseudo-random numbers each time the software is run.
    *
    * @param {int} seed         int
    *
    * @returns {float}
    *
    * @see random
    * @see radomSeed
    * @see noise
    * @see noiseDetail
    */
    p.noiseSeed = function(seed) {
      noiseProfile.seed = seed;
      noiseProfile.generator = undef;
    };

    /**
    * Defines the dimension of the display window in units of pixels. The size() function must
    * be the first line in setup(). If size() is not called, the default size of the window is
    * 100x100 pixels. The system variables width and height are set by the parameters passed to
    * the size() function.
    *
    * @param {int} aWidth     width of the display window in units of pixels
    * @param {int} aHeight    height of the display window in units of pixels
    * @param {MODE} aMode     Either P2D, P3D, JAVA2D, or OPENGL
    *
    * @see createGraphics
    * @see screen
    */
    DrawingShared.prototype.size = function(aWidth, aHeight, aMode) {
      if (doStroke) {
        p.stroke(0);
      }

      if (doFill) {
        p.fill(255);
      }

      // The default 2d context has already been created in the p.init() stage if
      // a 3d context was not specified. This is so that a 2d context will be
      // available if size() was not called.
      var savedProperties = {
        fillStyle: curContext.fillStyle,
        strokeStyle: curContext.strokeStyle,
        lineCap: curContext.lineCap,
        lineJoin: curContext.lineJoin
      };
      // remove the style width and height properties to ensure that the canvas gets set to
      // aWidth and aHeight coming in
      if (curElement.style.length > 0 ) {
        curElement.style.removeProperty("width");
        curElement.style.removeProperty("height");
      }

      curElement.width = p.width = aWidth || 100;
      curElement.height = p.height = aHeight || 100;

      for (var prop in savedProperties) {
        if (savedProperties.hasOwnProperty(prop)) {
          curContext[prop] = savedProperties[prop];
        }
      }

      // make sure to set the default font the first time round.
      p.textFont(curTextFont);

      // Set the background to whatever it was called last as if background() was called before size()
      // If background() hasn't been called before, set background() to a light gray
      p.background();

      // set 5% for pixels to cache (or 1000)
      maxPixelsCached = Math.max(1000, aWidth * aHeight * 0.05);

      // Externalize the context
      p.externals.context = curContext;

      for (var i = 0; i < PConstants.SINCOS_LENGTH; i++) {
        // XXX(jeresig)
        sinLUT[i] = p.sin(p.angleMode === "degrees" ? i : p.radians(i));
        cosLUT[i] = p.cos(p.angleMode === "degrees" ? i : p.radians(i));
      }
    };

    Drawing2D.prototype.size = function(aWidth, aHeight, aMode) {
      if (curContext === undef) {
        // size() was called without p.init() default context, i.e. p.createGraphics()
        curContext = curElement.getContext("2d");
        userMatrixStack = new PMatrixStack();
        userReverseMatrixStack = new PMatrixStack();
        modelView = new PMatrix2D();
        modelViewInv = new PMatrix2D();
      }

      DrawingShared.prototype.size.apply(this, arguments);
    };

    ////////////////////////////////////////////////////////////////////////////
    // Coordinates
    ////////////////////////////////////////////////////////////////////////////

    /**
     * Takes a three-dimensional X, Y, Z position and returns the X value for
     * where it will appear on a (two-dimensional) screen.
     *
     * @param {int | float} x 3D x coordinate to be mapped
     * @param {int | float} y 3D y coordinate to be mapped
     * @param {int | float} z 3D z optional coordinate to be mapped
     *
     * @returns {float}
     *
     * @see screenY
     * @see screenZ
    */
    p.screenX = function( x, y, z ) {
      var mv = modelView.array();
      if( mv.length === 16 )
      {
        var ax = mv[ 0]*x + mv[ 1]*y + mv[ 2]*z + mv[ 3];
        var ay = mv[ 4]*x + mv[ 5]*y + mv[ 6]*z + mv[ 7];
        var az = mv[ 8]*x + mv[ 9]*y + mv[10]*z + mv[11];
        var aw = mv[12]*x + mv[13]*y + mv[14]*z + mv[15];

        var pj = projection.array();

        var ox = pj[ 0]*ax + pj[ 1]*ay + pj[ 2]*az + pj[ 3]*aw;
        var ow = pj[12]*ax + pj[13]*ay + pj[14]*az + pj[15]*aw;

        if ( ow !== 0 ){
          ox /= ow;
        }
        return p.width * ( 1 + ox ) / 2.0;
      }
      // We assume that we're in 2D
      return modelView.multX(x, y);
    };

    /**
     * Takes a three-dimensional X, Y, Z position and returns the Y value for
     * where it will appear on a (two-dimensional) screen.
     *
     * @param {int | float} x 3D x coordinate to be mapped
     * @param {int | float} y 3D y coordinate to be mapped
     * @param {int | float} z 3D z optional coordinate to be mapped
     *
     * @returns {float}
     *
     * @see screenX
     * @see screenZ
    */
    p.screenY = function screenY( x, y, z ) {
      var mv = modelView.array();
      if( mv.length === 16 ) {
        var ax = mv[ 0]*x + mv[ 1]*y + mv[ 2]*z + mv[ 3];
        var ay = mv[ 4]*x + mv[ 5]*y + mv[ 6]*z + mv[ 7];
        var az = mv[ 8]*x + mv[ 9]*y + mv[10]*z + mv[11];
        var aw = mv[12]*x + mv[13]*y + mv[14]*z + mv[15];

        var pj = projection.array();

        var oy = pj[ 4]*ax + pj[ 5]*ay + pj[ 6]*az + pj[ 7]*aw;
        var ow = pj[12]*ax + pj[13]*ay + pj[14]*az + pj[15]*aw;

        if ( ow !== 0 ){
          oy /= ow;
        }
        return p.height * ( 1 + oy ) / 2.0;
      }
      // We assume that we're in 2D
      return modelView.multY(x, y);
    };

    /**
     * Takes a three-dimensional X, Y, Z position and returns the Z value for
     * where it will appear on a (two-dimensional) screen.
     *
     * @param {int | float} x 3D x coordinate to be mapped
     * @param {int | float} y 3D y coordinate to be mapped
     * @param {int | float} z 3D z coordinate to be mapped
     *
     * @returns {float}
     *
     * @see screenX
     * @see screenY
    */
    p.screenZ = function screenZ( x, y, z ) {
      var mv = modelView.array();
      if( mv.length !== 16 ) {
        return 0;
      }

      var pj = projection.array();

      var ax = mv[ 0]*x + mv[ 1]*y + mv[ 2]*z + mv[ 3];
      var ay = mv[ 4]*x + mv[ 5]*y + mv[ 6]*z + mv[ 7];
      var az = mv[ 8]*x + mv[ 9]*y + mv[10]*z + mv[11];
      var aw = mv[12]*x + mv[13]*y + mv[14]*z + mv[15];

      var oz = pj[ 8]*ax + pj[ 9]*ay + pj[10]*az + pj[11]*aw;
      var ow = pj[12]*ax + pj[13]*ay + pj[14]*az + pj[15]*aw;

      if ( ow !== 0 ) {
        oz /= ow;
      }
      return ( oz + 1 ) / 2.0;
    };

    ////////////////////////////////////////////////////////////////////////////
    // Style functions
    ////////////////////////////////////////////////////////////////////////////
    /**
     * The fill() function sets the color used to fill shapes. For example, if you run <b>fill(204, 102, 0)</b>, all subsequent shapes will be filled with orange.
     * This color is either specified in terms of the RGB or HSB color depending on the current <b>colorMode()</b>
     *(the default color space is RGB, with each value in the range from 0 to 255).
     * <br><br>When using hexadecimal notation to specify a color, use "#" or "0x" before the values (e.g. #CCFFAA, 0xFFCCFFAA).
     * The # syntax uses six digits to specify a color (the way colors are specified in HTML and CSS). When using the hexadecimal notation starting with "0x",
     * the hexadecimal value must be specified with eight characters; the first two characters define the alpha component and the remainder the red, green, and blue components.
     * <br><br>The value for the parameter "gray" must be less than or equal to the current maximum value as specified by <b>colorMode()</b>. The default maximum value is 255.
     * <br><br>To change the color of an image (or a texture), use tint().
     *
     * @param {int|float} gray    number specifying value between white and black
     * @param {int|float} value1  red or hue value
     * @param {int|float} value2  green or saturation value
     * @param {int|float} value3  blue or brightness value
     * @param {int|float} alpha   opacity of the fill
     * @param {Color} color       any value of the color datatype
     * @param {int} hex           color value in hexadecimal notation (i.e. #FFCC00 or 0xFFFFCC00)
     *
     * @see #noFill()
     * @see #stroke()
     * @see #tint()
     * @see #background()
     * @see #colorMode()
     */
    DrawingShared.prototype.fill = function() {
      var color = p.color(arguments[0], arguments[1], arguments[2], arguments[3]);
      if(color === currentFillColor && doFill) {
        return;
      }
      doFill = true;
      currentFillColor = color;
    };

    Drawing2D.prototype.fill = function() {
      DrawingShared.prototype.fill.apply(this, arguments);
      isFillDirty = true;
    };
    
    function executeContextFill() {
      if(doFill) {
        if(isFillDirty) {
          curContext.fillStyle = p.color.toString(currentFillColor);
          isFillDirty = false;
        }
        curContext.fill();
      }
    }

    /**
     * The noFill() function disables filling geometry. If both <b>noStroke()</b> and <b>noFill()</b>
     * are called, no shapes will be drawn to the screen.
     *
     * @see #fill()
     *
     */
    p.noFill = function() {
      doFill = false;
    };

    /**
     * The stroke() function sets the color used to draw lines and borders around shapes. This color
     * is either specified in terms of the RGB or HSB color depending on the
     * current <b>colorMode()</b> (the default color space is RGB, with each
     * value in the range from 0 to 255).
     * <br><br>When using hexadecimal notation to specify a color, use "#" or
     * "0x" before the values (e.g. #CCFFAA, 0xFFCCFFAA). The # syntax uses six
     * digits to specify a color (the way colors are specified in HTML and CSS).
     * When using the hexadecimal notation starting with "0x", the hexadecimal
     * value must be specified with eight characters; the first two characters
     * define the alpha component and the remainder the red, green, and blue
     * components.
     * <br><br>The value for the parameter "gray" must be less than or equal
     * to the current maximum value as specified by <b>colorMode()</b>.
     * The default maximum value is 255.
     *
     * @param {int|float} gray    number specifying value between white and black
     * @param {int|float} value1  red or hue value
     * @param {int|float} value2  green or saturation value
     * @param {int|float} value3  blue or brightness value
     * @param {int|float} alpha   opacity of the stroke
     * @param {Color} color       any value of the color datatype
     * @param {int} hex           color value in hexadecimal notation (i.e. #FFCC00 or 0xFFFFCC00)
     *
     * @see #fill()
     * @see #noStroke()
     * @see #tint()
     * @see #background()
     * @see #colorMode()
     */
    DrawingShared.prototype.stroke = function() {
      var color = p.color(arguments[0], arguments[1], arguments[2], arguments[3]);
      if(color === currentStrokeColor && doStroke) {
        return;
      }
      doStroke = true;
      currentStrokeColor = color;
    };

    Drawing2D.prototype.stroke = function() {
      DrawingShared.prototype.stroke.apply(this, arguments);
      isStrokeDirty = true;
    };
    
    function executeContextStroke() {
      if(doStroke) {
        if(isStrokeDirty) {
          curContext.strokeStyle = p.color.toString(currentStrokeColor);
          isStrokeDirty = false;
        }
        curContext.stroke();
      }
    }

    /**
     * The noStroke() function disables drawing the stroke (outline). If both <b>noStroke()</b> and
     * <b>noFill()</b> are called, no shapes will be drawn to the screen.
     *
     * @see #stroke()
     */
    p.noStroke = function() {
      doStroke = false;
    };

    /**
     * The strokeWeight() function sets the width of the stroke used for lines, points, and the border around shapes.
     * All widths are set in units of pixels.
     *
     * @param {int|float} w the weight (in pixels) of the stroke
     */
    DrawingShared.prototype.strokeWeight = function(w) {
      lineWidth = w;
    };

    Drawing2D.prototype.strokeWeight = function(w) {
      DrawingShared.prototype.strokeWeight.apply(this, arguments);
      curContext.lineWidth = w;
    };

    /**
     * The strokeCap() function sets the style for rendering line endings. These ends are either squared, extended, or rounded and
     * specified with the corresponding parameters SQUARE, PROJECT, and ROUND. The default cap is ROUND.
     * This function is not available with the P2D, P3D, or OPENGL renderers
     *
     * @param {int} value Either SQUARE, PROJECT, or ROUND
     */
    p.strokeCap = function(value) {
      drawing.$ensureContext().lineCap = value;
    };

    /**
     * The strokeJoin() function sets the style of the joints which connect line segments.
     * These joints are either mitered, beveled, or rounded and specified with the corresponding parameters MITER, BEVEL, and ROUND. The default joint is MITER.
     * This function is not available with the P2D, P3D, or OPENGL renderers
     *
     * @param {int} value Either SQUARE, PROJECT, or ROUND
     */
    p.strokeJoin = function(value) {
      drawing.$ensureContext().lineJoin = value;
    };

    /**
     * The smooth() function draws all geometry with smooth (anti-aliased) edges. This will slow down the frame rate of the application,
     * but will enhance the visual refinement. <br/><br/>
     * Note that smooth() will also improve image quality of resized images, and noSmooth() will disable image (and font) smoothing altogether.
     *
     * @see #noSmooth()
     * @see #hint()
     * @see #size()
     */

    Drawing2D.prototype.smooth = function() {
      renderSmooth = true;
      var style = curElement.style;
      style.setProperty("image-rendering", "optimizeQuality", "important");
      style.setProperty("-ms-interpolation-mode", "bicubic", "important");
      if (curContext.hasOwnProperty("mozImageSmoothingEnabled")) {
        curContext.mozImageSmoothingEnabled = true;
      }
    };
    
    /**
     * The noSmooth() function draws all geometry with jagged (aliased) edges.
     *
     * @see #smooth()
     */

    Drawing2D.prototype.noSmooth = function() {
      renderSmooth = false;
      var style = curElement.style;
      style.setProperty("image-rendering", "optimizeSpeed", "important");
      style.setProperty("image-rendering", "-moz-crisp-edges", "important");
      style.setProperty("image-rendering", "-webkit-optimize-contrast", "important");
      style.setProperty("image-rendering", "optimize-contrast", "important");
      style.setProperty("-ms-interpolation-mode", "nearest-neighbor", "important");
      if (curContext.hasOwnProperty("mozImageSmoothingEnabled")) {
        curContext.mozImageSmoothingEnabled = false;
      }
    };
    
    ////////////////////////////////////////////////////////////////////////////
    // Vector drawing functions
    ////////////////////////////////////////////////////////////////////////////
    /**
     * The point() function draws a point, a coordinate in space at the dimension of one pixel.
     * The first parameter is the horizontal value for the point, the second
     * value is the vertical value for the point, and the optional third value
     * is the depth value. Drawing this shape in 3D using the <b>z</b>
     * parameter requires the P3D or OPENGL parameter in combination with
     * size as shown in the above example.
     *
     * @param {int|float} x x-coordinate of the point
     * @param {int|float} y y-coordinate of the point
     * @param {int|float} z z-coordinate of the point
     *
     * @see #beginShape()
     */
    Drawing2D.prototype.point = function(x, y) {
      if (!doStroke) {
        return;
      }

      if (!renderSmooth) {
        x = Math.round(x);
        y = Math.round(y);
      }
      curContext.fillStyle = p.color.toString(currentStrokeColor);
      isFillDirty = true;
      // Draw a circle for any point larger than 1px
      if (lineWidth > 1) {
        curContext.beginPath();
        curContext.arc(x, y, lineWidth / 2, 0, PConstants.TWO_PI, false);
        curContext.fill();
      } else {
        curContext.fillRect(x, y, 1, 1);
      }
    };
    
    /**
     * Using the <b>beginShape()</b> and <b>endShape()</b> functions allow creating more complex forms.
     * <b>beginShape()</b> begins recording vertices for a shape and <b>endShape()</b> stops recording.
     * The value of the <b>MODE</b> parameter tells it which types of shapes to create from the provided vertices.
     * With no mode specified, the shape can be any irregular polygon. After calling the <b>beginShape()</b> function,
     * a series of <b>vertex()</b> commands must follow. To stop drawing the shape, call <b>endShape()</b>.
     * The <b>vertex()</b> function with two parameters specifies a position in 2D and the <b>vertex()</b>
     * function with three parameters specifies a position in 3D. Each shape will be outlined with the current
     * stroke color and filled with the fill color.
     *
     * @param {int} MODE either POINTS, LINES, TRIANGLES, TRIANGLE_FAN, TRIANGLE_STRIP, QUADS, and QUAD_STRIP.
     *
     * @see endShape
     * @see vertex
     * @see curveVertex
     * @see bezierVertex
     */
    p.beginShape = function(type) {
      curShape = type;
      curvePoints = [];
      vertArray = [];
    };

    /**
     * All shapes are constructed by connecting a series of vertices. <b>vertex()</b> is used to specify the vertex
     * coordinates for points, lines, triangles, quads, and polygons and is used exclusively within the <b>beginShape()</b>
     * and <b>endShape()</b> function. <br /><br />Drawing a vertex in 3D using the <b>z</b> parameter requires the P3D or
     * OPENGL parameter in combination with size as shown in the above example.<br /><br />This function is also used to map a
     * texture onto the geometry. The <b>texture()</b> function declares the texture to apply to the geometry and the <b>u</b>
     * and <b>v</b> coordinates set define the mapping of this texture to the form. By default, the coordinates used for
     * <b>u</b> and <b>v</b> are specified in relation to the image's size in pixels, but this relation can be changed with
     * <b>textureMode()</b>.
     *
     * @param {int | float} x x-coordinate of the vertex
     * @param {int | float} y y-coordinate of the vertex
     * @param {int | float} z z-coordinate of the vertex
     * @param {int | float} u horizontal coordinate for the texture mapping
     * @param {int | float} v vertical coordinate for the texture mapping
     *
     * @see beginShape
     * @see endShape
     * @see bezierVertex
     * @see curveVertex
     * @see texture
     */

    Drawing2D.prototype.vertex = function(x, y, u, v) {
      var vert = [];

      if (firstVert) { firstVert = false; }
      vert["isVert"] = true;

      vert[0] = x;
      vert[1] = y;
      vert[2] = 0;
      vert[3] = u;
      vert[4] = v;

      // fill and stroke color
      vert[5] = currentFillColor;
      vert[6] = currentStrokeColor;

      vertArray.push(vert);
    };
    
    /**
     * this series of three operations is used a lot in Drawing2D.prototype.endShape
     * and has been split off as its own function, to tighten the code and allow for
     * fewer bugs.
     */
    function fillStrokeClose() {
      executeContextFill();
      executeContextStroke();
      curContext.closePath();
    }

    /**
     * The endShape() function is the companion to beginShape() and may only be called after beginShape().
     * When endshape() is called, all of image data defined since the previous call to beginShape() is written
     * into the image buffer.
     *
     * @param {int} MODE Use CLOSE to close the shape
     *
     * @see beginShape
     */
    Drawing2D.prototype.endShape = function(mode) {
      if (vertArray.length === 0) { return; }

      var closeShape = mode === PConstants.CLOSE;

      // if the shape is closed, the first element is also the last element
      if (closeShape) {
        vertArray.push(vertArray[0]);
      }

      var lineVertArray = [];
      var fillVertArray = [];
      var colorVertArray = [];
      var strokeVertArray = [];
      var texVertArray = [];
      var cachedVertArray;

      firstVert = true;
      var i, j, k;
      var vertArrayLength = vertArray.length;

      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        for (j = 0; j < 3; j++) {
          fillVertArray.push(cachedVertArray[j]);
        }
      }

      // 5,6,7,8
      // R,G,B,A - fill colour
      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        for (j = 5; j < 9; j++) {
          colorVertArray.push(cachedVertArray[j]);
        }
      }

      // 9,10,11,12
      // R, G, B, A - stroke colour
      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        for (j = 9; j < 13; j++) {
          strokeVertArray.push(cachedVertArray[j]);
        }
      }

      // texture u,v
      for (i = 0; i < vertArrayLength; i++) {
        cachedVertArray = vertArray[i];
        texVertArray.push(cachedVertArray[3]);
        texVertArray.push(cachedVertArray[4]);
      }

      // curveVertex
      if ( isCurve && (curShape === PConstants.POLYGON || curShape === undef) ) {
        if (vertArrayLength > 3) {
          var b = [],
              s = 1 - curTightness;
          curContext.beginPath();
          curContext.moveTo(vertArray[1][0], vertArray[1][1]);
            /*
            * Matrix to convert from Catmull-Rom to cubic Bezier
            * where t = curTightness
            * |0         1          0         0       |
            * |(t-1)/6   1          (1-t)/6   0       |
            * |0         (1-t)/6    1         (t-1)/6 |
            * |0         0          0         0       |
            */
          for (i = 1; (i+2) < vertArrayLength; i++) {
            cachedVertArray = vertArray[i];
            b[0] = [cachedVertArray[0], cachedVertArray[1]];
            b[1] = [cachedVertArray[0] + (s * vertArray[i+1][0] - s * vertArray[i-1][0]) / 6,
                   cachedVertArray[1] + (s * vertArray[i+1][1] - s * vertArray[i-1][1]) / 6];
            b[2] = [vertArray[i+1][0] + (s * vertArray[i][0] - s * vertArray[i+2][0]) / 6,
                   vertArray[i+1][1] + (s * vertArray[i][1] - s * vertArray[i+2][1]) / 6];
            b[3] = [vertArray[i+1][0], vertArray[i+1][1]];
            curContext.bezierCurveTo(b[1][0], b[1][1], b[2][0], b[2][1], b[3][0], b[3][1]);
          }
          fillStrokeClose();
        }
      }

      // bezierVertex
      else if ( isBezier && (curShape === PConstants.POLYGON || curShape === undef) ) {
        curContext.beginPath();
        for (i = 0; i < vertArrayLength; i++) {
          cachedVertArray = vertArray[i];
          if (vertArray[i]["isVert"]) { //if it is a vertex move to the position
            if (vertArray[i]["moveTo"]) {
              curContext.moveTo(cachedVertArray[0], cachedVertArray[1]);
            } else {
              curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);
            }
          } else { //otherwise continue drawing bezier
            curContext.bezierCurveTo(vertArray[i][0], vertArray[i][1], vertArray[i][2], vertArray[i][3], vertArray[i][4], vertArray[i][5]);
          }
        }
        fillStrokeClose();
      }

      // render the vertices provided
      else {
        if (curShape === PConstants.POINTS) {
          for (i = 0; i < vertArrayLength; i++) {
            cachedVertArray = vertArray[i];
            if (doStroke) {
              p.stroke(cachedVertArray[6]);
            }
            p.point(cachedVertArray[0], cachedVertArray[1]);
          }
        } else if (curShape === PConstants.LINES) {
          for (i = 0; (i + 1) < vertArrayLength; i+=2) {
            cachedVertArray = vertArray[i];
            if (doStroke) {
              p.stroke(vertArray[i+1][6]);
            }
            p.line(cachedVertArray[0], cachedVertArray[1], vertArray[i+1][0], vertArray[i+1][1]);
          }
        } else if (curShape === PConstants.TRIANGLES) {
          for (i = 0; (i + 2) < vertArrayLength; i+=3) {
            cachedVertArray = vertArray[i];
            curContext.beginPath();
            curContext.moveTo(cachedVertArray[0], cachedVertArray[1]);
            curContext.lineTo(vertArray[i+1][0], vertArray[i+1][1]);
            curContext.lineTo(vertArray[i+2][0], vertArray[i+2][1]);
            curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);

            if (doFill) {
              p.fill(vertArray[i+2][5]);
              executeContextFill();
            }
            if (doStroke) {
              p.stroke(vertArray[i+2][6]);
              executeContextStroke();
            }

            curContext.closePath();
          }
        } else if (curShape === PConstants.TRIANGLE_STRIP) {
          for (i = 0; (i+1) < vertArrayLength; i++) {
            cachedVertArray = vertArray[i];
            curContext.beginPath();
            curContext.moveTo(vertArray[i+1][0], vertArray[i+1][1]);
            curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);

            if (doStroke) {
              p.stroke(vertArray[i+1][6]);
            }
            if (doFill) {
              p.fill(vertArray[i+1][5]);
            }

            if (i + 2 < vertArrayLength) {
              curContext.lineTo(vertArray[i+2][0], vertArray[i+2][1]);
              if (doStroke) {
                p.stroke(vertArray[i+2][6]);
              }
              if (doFill) {
                p.fill(vertArray[i+2][5]);
              }
            }
            fillStrokeClose();
          }
        } else if (curShape === PConstants.TRIANGLE_FAN) {
          if (vertArrayLength > 2) {
            curContext.beginPath();
            curContext.moveTo(vertArray[0][0], vertArray[0][1]);
            curContext.lineTo(vertArray[1][0], vertArray[1][1]);
            curContext.lineTo(vertArray[2][0], vertArray[2][1]);

            if (doFill) {
              p.fill(vertArray[2][5]);
              executeContextFill();
            }
            if (doStroke) {
              p.stroke(vertArray[2][6]);
              executeContextStroke();
            }

            curContext.closePath();
            for (i = 3; i < vertArrayLength; i++) {
              cachedVertArray = vertArray[i];
              curContext.beginPath();
              curContext.moveTo(vertArray[0][0], vertArray[0][1]);
              curContext.lineTo(vertArray[i-1][0], vertArray[i-1][1]);
              curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);

              if (doFill) {
                p.fill(cachedVertArray[5]);
                executeContextFill();
              }
              if (doStroke) {
                p.stroke(cachedVertArray[6]);
                executeContextStroke();
              }

              curContext.closePath();
            }
          }
        } else if (curShape === PConstants.QUADS) {
          for (i = 0; (i + 3) < vertArrayLength; i+=4) {
            cachedVertArray = vertArray[i];
            curContext.beginPath();
            curContext.moveTo(cachedVertArray[0], cachedVertArray[1]);
            for (j = 1; j < 4; j++) {
              curContext.lineTo(vertArray[i+j][0], vertArray[i+j][1]);
            }
            curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);

            if (doFill) {
              p.fill(vertArray[i+3][5]);
              executeContextFill();
            }
            if (doStroke) {
              p.stroke(vertArray[i+3][6]);
              executeContextStroke();
            }

            curContext.closePath();
          }
        } else if (curShape === PConstants.QUAD_STRIP) {
          if (vertArrayLength > 3) {
            for (i = 0; (i+1) < vertArrayLength; i+=2) {
              cachedVertArray = vertArray[i];
              curContext.beginPath();
              if (i+3 < vertArrayLength) {
                curContext.moveTo(vertArray[i+2][0], vertArray[i+2][1]);
                curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);
                curContext.lineTo(vertArray[i+1][0], vertArray[i+1][1]);
                curContext.lineTo(vertArray[i+3][0], vertArray[i+3][1]);

                if (doFill) {
                  p.fill(vertArray[i+3][5]);
                }
                if (doStroke) {
                  p.stroke(vertArray[i+3][6]);
                }
              } else {
                curContext.moveTo(cachedVertArray[0], cachedVertArray[1]);
                curContext.lineTo(vertArray[i+1][0], vertArray[i+1][1]);
              }
              fillStrokeClose();
            }
          }
        } else {
          curContext.beginPath();
          curContext.moveTo(vertArray[0][0], vertArray[0][1]);
          for (i = 1; i < vertArrayLength; i++) {
            cachedVertArray = vertArray[i];
            if (cachedVertArray["isVert"]) { //if it is a vertex move to the position
              if (cachedVertArray["moveTo"]) {
                curContext.moveTo(cachedVertArray[0], cachedVertArray[1]);
              } else {
                curContext.lineTo(cachedVertArray[0], cachedVertArray[1]);
              }
            }
          }
          fillStrokeClose();
        }
      }

      // Reset some settings
      isCurve = false;
      isBezier = false;
      curveVertArray = [];
      curveVertCount = 0;

      // If the shape is closed, the first element was added as last element.
      // We must remove it again to prevent the list of vertices from growing
      // over successive calls to endShape(CLOSE)
      if (closeShape) {
        vertArray.pop();
      }
    };
    
    /**
     * The function splineForward() setup forward-differencing matrix to be used for speedy
     * curve rendering. It's based on using a specific number
     * of curve segments and just doing incremental adds for each
     * vertex of the segment, rather than running the mathematically
     * expensive cubic equation. This function is used by both curveDetail and bezierDetail.
     *
     * @param {int} segments      number of curve segments to use when drawing
     * @param {PMatrix3D} matrix  target object for the new matrix
     */
    var splineForward = function(segments, matrix) {
      var f = 1.0 / segments;
      var ff = f * f;
      var fff = ff * f;

      matrix.set(0, 0, 0, 1, fff, ff, f, 0, 6 * fff, 2 * ff, 0, 0, 6 * fff, 0, 0, 0);
    };

    /**
     * The curveInit() function set the number of segments to use when drawing a Catmull-Rom
     * curve, and setting the s parameter, which defines how tightly
     * the curve fits to each vertex. Catmull-Rom curves are actually
     * a subset of this curve type where the s is set to zero.
     * This in an internal function used by curveDetail() and curveTightness().
     */
    var curveInit = function() {
      // allocate only if/when used to save startup time
      if (!curveDrawMatrix) {
        curveBasisMatrix = new PMatrix3D();
        curveDrawMatrix = new PMatrix3D();
        curveInited = true;
      }

      var s = curTightness;
      curveBasisMatrix.set((s - 1) / 2, (s + 3) / 2, (-3 - s) / 2, (1 - s) / 2,
                           (1 - s), (-5 - s) / 2, (s + 2), (s - 1) / 2,
                           (s - 1) / 2, 0, (1 - s) / 2, 0, 0, 1, 0, 0);

      splineForward(curveDet, curveDrawMatrix);

      if (!bezierBasisInverse) {
        //bezierBasisInverse = bezierBasisMatrix.get();
        //bezierBasisInverse.invert();
        curveToBezierMatrix = new PMatrix3D();
      }

      // TODO only needed for PGraphicsJava2D? if so, move it there
      // actually, it's generally useful for other renderers, so keep it
      // or hide the implementation elsewhere.
      curveToBezierMatrix.set(curveBasisMatrix);
      curveToBezierMatrix.preApply(bezierBasisInverse);

      // multiply the basis and forward diff matrices together
      // saves much time since this needn't be done for each curve
      curveDrawMatrix.apply(curveBasisMatrix);
    };

    /**
     * Specifies vertex coordinates for Bezier curves. Each call to <b>bezierVertex()</b> defines the position of two control
     * points and one anchor point of a Bezier curve, adding a new segment to a line or shape. The first time
     * <b>bezierVertex()</b> is used within a <b>beginShape()</b> call, it must be prefaced with a call to <b>vertex()</b>
     * to set the first anchor point. This function must be used between <b>beginShape()</b> and <b>endShape()</b> and only
     * when there is no MODE parameter specified to <b>beginShape()</b>. Using the 3D version of requires rendering with P3D
     * or OPENGL (see the Environment reference for more information). <br /> <br /> <b>NOTE: </b> Fill does not work properly yet.
     *
     * @param {float | int} cx1 The x-coordinate of 1st control point
     * @param {float | int} cy1 The y-coordinate of 1st control point
     * @param {float | int} cz1 The z-coordinate of 1st control point
     * @param {float | int} cx2 The x-coordinate of 2nd control point
     * @param {float | int} cy2 The y-coordinate of 2nd control point
     * @param {float | int} cz2 The z-coordinate of 2nd control point
     * @param {float | int} x   The x-coordinate of the anchor point
     * @param {float | int} y   The y-coordinate of the anchor point
     * @param {float | int} z   The z-coordinate of the anchor point
     *
     * @see curveVertex
     * @see vertex
     * @see bezier
     */
    Drawing2D.prototype.bezierVertex = function() {
      isBezier = true;
      var vert = [];
      if (firstVert) {
        throw ("vertex() must be used at least once before calling bezierVertex()");
      }

      for (var i = 0; i < arguments.length; i++) {
        vert[i] = arguments[i];
      }
      vertArray.push(vert);
      vertArray[vertArray.length -1]["isVert"] = false;
    };
    
    /**
     * Sets a texture to be applied to vertex points. The <b>texture()</b> function
     * must be called between <b>beginShape()</b> and <b>endShape()</b> and before
     * any calls to vertex().
     *
     * When textures are in use, the fill color is ignored. Instead, use tint() to
     * specify the color of the texture as it is applied to the shape.
     *
     * @param {PImage} pimage the texture to apply
     *
     * @returns none
     *
     * @see textureMode
     * @see beginShape
     * @see endShape
     * @see vertex
    */
    p.texture = function(pimage) {
      var curContext = drawing.$ensureContext();

      if (pimage.__texture) {
        curContext.bindTexture(curContext.TEXTURE_2D, pimage.__texture);
      } else if (pimage.localName === "canvas") {
        curContext.bindTexture(curContext.TEXTURE_2D, canTex);
        curContext.texImage2D(curContext.TEXTURE_2D, 0, curContext.RGBA, curContext.RGBA, curContext.UNSIGNED_BYTE, pimage);
        curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_MAG_FILTER, curContext.LINEAR);
        curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_MIN_FILTER, curContext.LINEAR);
        curContext.generateMipmap(curContext.TEXTURE_2D);
        curTexture.width = pimage.width;
        curTexture.height = pimage.height;
      } else {
        var texture = curContext.createTexture(),
            cvs = document.createElement('canvas'),
            cvsTextureCtx = cvs.getContext('2d'),
            pot;

        // WebGL requires power of two textures
        if (pimage.width & (pimage.width-1) === 0) {
          cvs.width = pimage.width;
        } else {
          pot = 1;
          while (pot < pimage.width) {
            pot *= 2;
          }
          cvs.width = pot;
        }

        if (pimage.height & (pimage.height-1) === 0) {
          cvs.height = pimage.height;
        } else {
          pot = 1;
          while (pot < pimage.height) {
            pot *= 2;
          }
          cvs.height = pot;
        }

        cvsTextureCtx.drawImage(pimage.sourceImg, 0, 0, pimage.width, pimage.height, 0, 0, cvs.width, cvs.height);

        curContext.bindTexture(curContext.TEXTURE_2D, texture);
        curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_MIN_FILTER, curContext.LINEAR_MIPMAP_LINEAR);
        curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_MAG_FILTER, curContext.LINEAR);
        curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_WRAP_T, curContext.CLAMP_TO_EDGE);
        curContext.texParameteri(curContext.TEXTURE_2D, curContext.TEXTURE_WRAP_S, curContext.CLAMP_TO_EDGE);
        curContext.texImage2D(curContext.TEXTURE_2D, 0, curContext.RGBA, curContext.RGBA, curContext.UNSIGNED_BYTE, cvs);
        curContext.generateMipmap(curContext.TEXTURE_2D);

        pimage.__texture = texture;
        curTexture.width = pimage.width;
        curTexture.height = pimage.height;
      }

      usingTexture = true;
      curContext.useProgram(programObject3D);
      uniformi("usingTexture3d", programObject3D, "usingTexture", usingTexture);
    };

    /**
     * Sets the coordinate space for texture mapping. There are two options, IMAGE,
     * which refers to the actual coordinates of the image, and NORMALIZED, which
     * refers to a normalized space of values ranging from 0 to 1. The default mode
     * is IMAGE. In IMAGE, if an image is 100 x 200 pixels, mapping the image onto
     * the entire size of a quad would require the points (0,0) (0,100) (100,200) (0,200).
     * The same mapping in NORMAL_SPACE is (0,0) (0,1) (1,1) (0,1).
     *
     * @param MODE either IMAGE or NORMALIZED
     *
     * @returns none
     *
     * @see texture
    */
    p.textureMode = function(mode){
      curTextureMode = mode;
    };
    /**
     * The curveVertexSegment() function handle emitting a specific segment of Catmull-Rom curve. Internal helper function used by <b>curveVertex()</b>.
     */
    var curveVertexSegment = function(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4) {
      var x0 = x2;
      var y0 = y2;
      var z0 = z2;

      var draw = curveDrawMatrix.array();

      var xplot1 = draw[4] * x1 + draw[5] * x2 + draw[6] * x3 + draw[7] * x4;
      var xplot2 = draw[8] * x1 + draw[9] * x2 + draw[10] * x3 + draw[11] * x4;
      var xplot3 = draw[12] * x1 + draw[13] * x2 + draw[14] * x3 + draw[15] * x4;

      var yplot1 = draw[4] * y1 + draw[5] * y2 + draw[6] * y3 + draw[7] * y4;
      var yplot2 = draw[8] * y1 + draw[9] * y2 + draw[10] * y3 + draw[11] * y4;
      var yplot3 = draw[12] * y1 + draw[13] * y2 + draw[14] * y3 + draw[15] * y4;

      var zplot1 = draw[4] * z1 + draw[5] * z2 + draw[6] * z3 + draw[7] * z4;
      var zplot2 = draw[8] * z1 + draw[9] * z2 + draw[10] * z3 + draw[11] * z4;
      var zplot3 = draw[12] * z1 + draw[13] * z2 + draw[14] * z3 + draw[15] * z4;

      p.vertex(x0, y0, z0);
      for (var j = 0; j < curveDet; j++) {
        x0 += xplot1; xplot1 += xplot2; xplot2 += xplot3;
        y0 += yplot1; yplot1 += yplot2; yplot2 += yplot3;
        z0 += zplot1; zplot1 += zplot2; zplot2 += zplot3;
        p.vertex(x0, y0, z0);
      }
    };

    /**
     * Specifies vertex coordinates for curves. This function may only be used between <b>beginShape()</b> and
     * <b>endShape()</b> and only when there is no MODE parameter specified to <b>beginShape()</b>. The first and last points
     * in a series of <b>curveVertex()</b> lines will be used to guide the beginning and end of a the curve. A minimum of four
     * points is required to draw a tiny curve between the second and third points. Adding a fifth point with
     * <b>curveVertex()</b> will draw the curve between the second, third, and fourth points. The <b>curveVertex()</b> function
     * is an implementation of Catmull-Rom splines. Using the 3D version of requires rendering with P3D or OPENGL (see the
     * Environment reference for more information). <br /> <br /><b>NOTE: </b> Fill does not work properly yet.
     *
     * @param {float | int} x The x-coordinate of the vertex
     * @param {float | int} y The y-coordinate of the vertex
     * @param {float | int} z The z-coordinate of the vertex
     *
     * @see curve
     * @see beginShape
     * @see endShape
     * @see vertex
     * @see bezierVertex
     */
    Drawing2D.prototype.curveVertex = function(x, y) {
      isCurve = true;

      p.vertex(x, y);
    };
    
    /**
     * The curve() function draws a curved line on the screen. The first and second parameters
     * specify the beginning control point and the last two parameters specify
     * the ending control point. The middle parameters specify the start and
     * stop of the curve. Longer curves can be created by putting a series of
     * <b>curve()</b> functions together or using <b>curveVertex()</b>.
     * An additional function called <b>curveTightness()</b> provides control
     * for the visual quality of the curve. The <b>curve()</b> function is an
     * implementation of Catmull-Rom splines. Using the 3D version of requires
     * rendering with P3D or OPENGL (see the Environment reference for more
     * information).
     *
     * @param {int|float} x1 coordinates for the beginning control point
     * @param {int|float} y1 coordinates for the beginning control point
     * @param {int|float} z1 coordinates for the beginning control point
     * @param {int|float} x2 coordinates for the first point
     * @param {int|float} y2 coordinates for the first point
     * @param {int|float} z2 coordinates for the first point
     * @param {int|float} x3 coordinates for the second point
     * @param {int|float} y3 coordinates for the second point
     * @param {int|float} z3 coordinates for the second point
     * @param {int|float} x4 coordinates for the ending control point
     * @param {int|float} y4 coordinates for the ending control point
     * @param {int|float} z4 coordinates for the ending control point
     *
     * @see #curveVertex()
     * @see #curveTightness()
     * @see #bezier()
     */
    Drawing2D.prototype.curve = function() {
      if (arguments.length === 8) { // curve(x1, y1, x2, y2, x3, y3, x4, y4)
        p.beginShape();
        p.curveVertex(arguments[0], arguments[1]);
        p.curveVertex(arguments[2], arguments[3]);
        p.curveVertex(arguments[4], arguments[5]);
        p.curveVertex(arguments[6], arguments[7]);
        p.endShape();
      }
    };
    
    /**
     * The curveTightness() function modifies the quality of forms created with <b>curve()</b> and
     * <b>curveVertex()</b>. The parameter <b>squishy</b> determines how the
     * curve fits to the vertex points. The value 0.0 is the default value for
     * <b>squishy</b> (this value defines the curves to be Catmull-Rom splines)
     * and the value 1.0 connects all the points with straight lines.
     * Values within the range -5.0 and 5.0 will deform the curves but
     * will leave them recognizable and as values increase in magnitude,
     * they will continue to deform.
     *
     * @param {float} tightness amount of deformation from the original vertices
     *
     * @see #curve()
     * @see #curveVertex()
     *
     */
    p.curveTightness = function(tightness) {
      curTightness = tightness;
    };

    /**
     * The curveDetail() function sets the resolution at which curves display. The default value is 20.
     * This function is only useful when using the P3D or OPENGL renderer.
     *
     * @param {int} detail resolution of the curves
     *
     * @see curve()
     * @see curveVertex()
     * @see curveTightness()
     */
    p.curveDetail = function(detail) {
      curveDet = detail;
      curveInit();
    };

    /**
    * Modifies the location from which rectangles draw. The default mode is rectMode(CORNER), which
    * specifies the location to be the upper left corner of the shape and uses the third and fourth
    * parameters of rect() to specify the width and height. The syntax rectMode(CORNERS) uses the
    * first and second parameters of rect() to set the location of one corner and uses the third and
    * fourth parameters to set the opposite corner. The syntax rectMode(CENTER) draws the image from
    * its center point and uses the third and forth parameters of rect() to specify the image's width
    * and height. The syntax rectMode(RADIUS) draws the image from its center point and uses the third
    * and forth parameters of rect()  to specify half of the image's width and height. The parameter must
    * be written in ALL CAPS because Processing is a case sensitive language. Note: In version 125, the
    * mode named CENTER_RADIUS was shortened to RADIUS.
    *
    * @param {MODE} MODE      Either CORNER, CORNERS, CENTER, or RADIUS
    *
    * @see rect
    */
    p.rectMode = function(aRectMode) {
      curRectMode = aRectMode;
    };

    /**
    * Modifies the location from which images draw. The default mode is imageMode(CORNER), which specifies
    * the location to be the upper left corner and uses the fourth and fifth parameters of image() to set
    * the image's width and height. The syntax imageMode(CORNERS) uses the second and third parameters of
    * image() to set the location of one corner of the image and uses the fourth and fifth parameters to
    * set the opposite corner. Use imageMode(CENTER) to draw images centered at the given x and y position.
    * The parameter to imageMode() must be written in ALL CAPS because Processing is a case sensitive language.
    *
    * @param {MODE} MODE      Either CORNER, CORNERS, or CENTER
    *
    * @see loadImage
    * @see PImage
    * @see image
    * @see background
    */
    p.imageMode = function(mode) {
      switch (mode) {
      case PConstants.CORNER:
        imageModeConvert = imageModeCorner;
        break;
      case PConstants.CORNERS:
        imageModeConvert = imageModeCorners;
        break;
      case PConstants.CENTER:
        imageModeConvert = imageModeCenter;
        break;
      default:
        throw "Invalid imageMode";
      }
    };

    /**
    * The origin of the ellipse is modified by the ellipseMode() function. The default configuration is
    * ellipseMode(CENTER), which specifies the location of the ellipse as the center of the shape. The RADIUS
    * mode is the same, but the width and height parameters to ellipse()  specify the radius of the ellipse,
    * rather than the diameter. The CORNER mode draws the shape from the upper-left corner of its bounding box.
    * The CORNERS mode uses the four parameters to ellipse() to set two opposing corners of the ellipse's bounding
    * box. The parameter must be written in "ALL CAPS" because Processing is a case sensitive language.
    *
    * @param {MODE} MODE      Either CENTER, RADIUS, CORNER, or CORNERS.
    *
    * @see ellipse
    */
    p.ellipseMode = function(aEllipseMode) {
      curEllipseMode = aEllipseMode;
    };

    /**
     * The arc() function draws an arc in the display window.
     * Arcs are drawn along the outer edge of an ellipse defined by the
     * <b>x</b>, <b>y</b>, <b>width</b> and <b>height</b> parameters.
     * The origin or the arc's ellipse may be changed with the
     * <b>ellipseMode()</b> function.
     * The <b>start</b> and <b>stop</b> parameters specify the angles
     * at which to draw the arc.
     *
     * @param {float} a       x-coordinate of the arc's ellipse
     * @param {float} b       y-coordinate of the arc's ellipse
     * @param {float} c       width of the arc's ellipse
     * @param {float} d       height of the arc's ellipse
     * @param {float} start   angle to start the arc, specified in radians
     * @param {float} stop    angle to stop the arc, specified in radians
     *
     * @see #ellipseMode()
     * @see #ellipse()
     */
    p.arc = function(x, y, width, height, start, stop) {
      if (width <= 0 || stop < start) { return; }

      // XXX(jeresig)
      start = p.convertToRadians(start);
      stop = p.convertToRadians(stop);

      if (curEllipseMode === PConstants.CORNERS) {
        width = width - x;
        height = height - y;
      } else if (curEllipseMode === PConstants.RADIUS) {
        x = x - width;
        y = y - height;
        width = width * 2;
        height = height * 2;
      } else if (curEllipseMode === PConstants.CENTER) {
        x = x - width/2;
        y = y - height/2;
      }
      // make sure that we're starting at a useful point
      while (start < 0) {
        start += PConstants.TWO_PI;
        stop += PConstants.TWO_PI;
      }
      if (stop - start > PConstants.TWO_PI) {
        start = 0;
        stop = PConstants.TWO_PI;
      }
      var hr = width / 2;
      var vr = height / 2;
      var centerX = x + hr;
      var centerY = y + vr;
      // XXX(jeresig): Removed * 2 from these lines
      // seems to have been a mistake.
      var startLUT = 0 | (-0.5 + start * p.RAD_TO_DEG);
      var stopLUT = 0 | (0.5 + stop * p.RAD_TO_DEG);
      var i, j;
      if (doFill) {
        // shut off stroke for a minute
        var savedStroke = doStroke;
        doStroke = false;
        p.beginShape();
        p.vertex(centerX, centerY);
        for (i = startLUT; i <= stopLUT; i++) {
          j = i % PConstants.SINCOS_LENGTH;
          p.vertex(centerX + cosLUT[j] * hr, centerY + sinLUT[j] * vr);
        }
        p.endShape(PConstants.CLOSE);
        doStroke = savedStroke;
      }

      if (doStroke) {
        // and doesn't include the first (center) vertex.
        var savedFill = doFill;
        doFill = false;
        p.beginShape();
        for (i = startLUT; i <= stopLUT; i++) {
          j = i % PConstants.SINCOS_LENGTH;
          p.vertex(centerX + cosLUT[j] * hr, centerY + sinLUT[j] * vr);
        }
        p.endShape();
        doFill = savedFill;
      }
    };

    /**
    * Draws a line (a direct path between two points) to the screen. The version of line() with four parameters
    * draws the line in 2D. To color a line, use the stroke() function. A line cannot be filled, therefore the
    * fill()  method will not affect the color of a line. 2D lines are drawn with a width of one pixel by default,
    * but this can be changed with the strokeWeight()  function. The version with six parameters allows the line
    * to be placed anywhere within XYZ space. Drawing this shape in 3D using the z parameter requires the P3D or
    * OPENGL parameter in combination with size.
    *
    * @param {int|float} x1       x-coordinate of the first point
    * @param {int|float} y1       y-coordinate of the first point
    * @param {int|float} z1       z-coordinate of the first point
    * @param {int|float} x2       x-coordinate of the second point
    * @param {int|float} y2       y-coordinate of the second point
    * @param {int|float} z2       z-coordinate of the second point
    *
    * @see strokeWeight
    * @see strokeJoin
    * @see strokeCap
    * @see beginShape
    */
    Drawing2D.prototype.line = function(x1, y1, x2, y2) {
      if (!doStroke) {
        return;
      }
      if (!renderSmooth) {
        x1 = Math.round(x1);
        x2 = Math.round(x2);
        y1 = Math.round(y1);
        y2 = Math.round(y2);
      }
      // A line is only defined if it has different start and end coordinates.
      // If they are the same, we call point instead.
      if (x1 === x2 && y1 === y2) {
        p.point(x1, y1);
        return;
      }

      var swap = undef,
          lineCap = undef,
          drawCrisp = true,
          currentModelView = modelView.array(),
          identityMatrix = [1, 0, 0, 0, 1, 0];
      // Test if any transformations have been applied to the sketch
      for (var i = 0; i < 6 && drawCrisp; i++) {
        drawCrisp = currentModelView[i] === identityMatrix[i];
      }
      /* Draw crisp lines if the line is vertical or horizontal with the following method
       * If any transformations have been applied to the sketch, don't make the line crisp
       * If the line is directed up or to the left, reverse it by swapping x1/x2 or y1/y2
       * Make the line 1 pixel longer to work around cross-platform canvas implementations
       * If the lineWidth is odd, translate the line by 0.5 in the perpendicular direction
       * Even lineWidths do not need to be translated because the canvas will draw them on pixel boundaries
       * Change the cap to butt-end to work around cross-platform canvas implementations
       * Reverse the translate and lineCap canvas state changes after drawing the line
       */
      if (drawCrisp) {
        if (x1 === x2) {
          if (y1 > y2) {
            swap = y1;
            y1 = y2;
            y2 = swap;
          }
          y2++;
          if (lineWidth % 2 === 1) {
            curContext.translate(0.5, 0.0);
          }
        } else if (y1 === y2) {
          if (x1 > x2) {
            swap = x1;
            x1 = x2;
            x2 = swap;
          }
          x2++;
          if (lineWidth % 2 === 1) {
            curContext.translate(0.0, 0.5);
          }
        }
        if (lineWidth === 1) {
          lineCap = curContext.lineCap;
          curContext.lineCap = 'butt';
        }
      }
      curContext.beginPath();
      curContext.moveTo(x1 || 0, y1 || 0);
      curContext.lineTo(x2 || 0, y2 || 0);
      executeContextStroke();
      if (drawCrisp) {
        if (x1 === x2 && lineWidth % 2 === 1) {
          curContext.translate(-0.5, 0.0);
        } else if (y1 === y2 && lineWidth % 2 === 1) {
          curContext.translate(0.0, -0.5);
        }
        if (lineWidth === 1) {
          curContext.lineCap = lineCap;
        }
      }
    };
    
    /**
     * Draws a Bezier curve on the screen. These curves are defined by a series of anchor and control points. The first
     * two parameters specify the first anchor point and the last two parameters specify the other anchor point. The
     * middle parameters specify the control points which define the shape of the curve. Bezier curves were developed
     * by French engineer Pierre Bezier. Using the 3D version of requires rendering with P3D or OPENGL (see the
     * Environment reference for more information).
     *
     * @param {int | float} x1,y1,z1    coordinates for the first anchor point
     * @param {int | float} cx1,cy1,cz1 coordinates for the first control point
     * @param {int | float} cx2,cy2,cz2 coordinates for the second control point
     * @param {int | float} x2,y2,z2    coordinates for the second anchor point
     *
     * @see bezierVertex
     * @see curve
     */
    Drawing2D.prototype.bezier = function() {
      if (arguments.length !== 8) {
        throw("You must use 8 parameters for bezier() in 2D mode");
      }

      p.beginShape();
      p.vertex( arguments[0], arguments[1] );
      p.bezierVertex( arguments[2], arguments[3],
                      arguments[4], arguments[5],
                      arguments[6], arguments[7] );
      p.endShape();
    };
    
    /**
     * Sets the resolution at which Beziers display. The default value is 20. This function is only useful when using the P3D
     * or OPENGL renderer as the default (JAVA2D) renderer does not use this information.
     *
     * @param {int} detail resolution of the curves
     *
     * @see curve
     * @see curveVertex
     * @see curveTightness
     */
    p.bezierDetail = function( detail ){
      bezDetail = detail;
    };

    /**
     * The bezierPoint() function evalutes quadratic bezier at point t for points a, b, c, d.
     * The parameter t varies between 0 and 1. The a and d parameters are the
     * on-curve points, b and c are the control points. To make a two-dimensional
     * curve, call this function once with the x coordinates and a second time
     * with the y coordinates to get the location of a bezier curve at t.
     *
     * @param {float} a   coordinate of first point on the curve
     * @param {float} b   coordinate of first control point
     * @param {float} c   coordinate of second control point
     * @param {float} d   coordinate of second point on the curve
     * @param {float} t   value between 0 and 1
     *
     * @see #bezier()
     * @see #bezierVertex()
     * @see #curvePoint()
     */
    p.bezierPoint = function(a, b, c, d, t) {
      return (1 - t) * (1 - t) * (1 - t) * a + 3 * (1 - t) * (1 - t) * t * b + 3 * (1 - t) * t * t * c + t * t * t * d;
    };

    /**
     * The bezierTangent() function calculates the tangent of a point on a Bezier curve. There is a good
     * definition of "tangent" at Wikipedia: <a href="http://en.wikipedia.org/wiki/Tangent" target="new">http://en.wikipedia.org/wiki/Tangent</a>
     *
     * @param {float} a   coordinate of first point on the curve
     * @param {float} b   coordinate of first control point
     * @param {float} c   coordinate of second control point
     * @param {float} d   coordinate of second point on the curve
     * @param {float} t   value between 0 and 1
     *
     * @see #bezier()
     * @see #bezierVertex()
     * @see #curvePoint()
     */
    p.bezierTangent = function(a, b, c, d, t) {
      return (3 * t * t * (-a + 3 * b - 3 * c + d) + 6 * t * (a - 2 * b + c) + 3 * (-a + b));
    };

    /**
     * The curvePoint() function evalutes the Catmull-Rom curve at point t for points a, b, c, d. The
     * parameter t varies between 0 and 1, a and d are points on the curve,
     * and b and c are the control points. This can be done once with the x
     * coordinates and a second time with the y coordinates to get the
     * location of a curve at t.
     *
     * @param {int|float} a   coordinate of first point on the curve
     * @param {int|float} b   coordinate of second point on the curve
     * @param {int|float} c   coordinate of third point on the curve
     * @param {int|float} d   coordinate of fourth point on the curve
     * @param {float} t       value between 0 and 1
     *
     * @see #curve()
     * @see #curveVertex()
     * @see #bezierPoint()
     */
    p.curvePoint = function(a, b, c, d, t) {
      return 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
    };

    /**
     * The curveTangent() function calculates the tangent of a point on a Catmull-Rom curve.
     * There is a good definition of "tangent" at Wikipedia: <a href="http://en.wikipedia.org/wiki/Tangent" target="new">http://en.wikipedia.org/wiki/Tangent</a>.
     *
     * @param {int|float} a   coordinate of first point on the curve
     * @param {int|float} b   coordinate of first control point
     * @param {int|float} c   coordinate of second control point
     * @param {int|float} d   coordinate of second point on the curve
     * @param {float} t       value between 0 and 1
     *
     * @see #curve()
     * @see #curveVertex()
     * @see #curvePoint()
     * @see #bezierTangent()
     */
    p.curveTangent = function(a, b, c, d, t) {
      return 0.5 * ((-a + c) + 2 * (2 * a - 5 * b + 4 * c - d) * t + 3 * (-a + 3 * b - 3 * c + d) * t * t);
    };

    /**
     * A triangle is a plane created by connecting three points. The first two arguments specify the first point,
     * the middle two arguments specify the second point, and the last two arguments specify the third point.
     *
     * @param {int | float} x1 x-coordinate of the first point
     * @param {int | float} y1 y-coordinate of the first point
     * @param {int | float} x2 x-coordinate of the second point
     * @param {int | float} y2 y-coordinate of the second point
     * @param {int | float} x3 x-coordinate of the third point
     * @param {int | float} y3 y-coordinate of the third point
     */
    p.triangle = function(x1, y1, x2, y2, x3, y3) {
      p.beginShape(PConstants.TRIANGLES);
      p.vertex(x1, y1, 0);
      p.vertex(x2, y2, 0);
      p.vertex(x3, y3, 0);
      p.endShape();
    };

    /**
     * A quad is a quadrilateral, a four sided polygon. It is similar to a rectangle, but the angles between its
     * edges are not constrained to ninety degrees. The first pair of parameters (x1,y1) sets the first vertex
     * and the subsequent pairs should proceed clockwise or counter-clockwise around the defined shape.
     *
     * @param {float | int} x1 x-coordinate of the first corner
     * @param {float | int} y1 y-coordinate of the first corner
     * @param {float | int} x2 x-coordinate of the second corner
     * @param {float | int} y2 y-coordinate of the second corner
     * @param {float | int} x3 x-coordinate of the third corner
     * @param {float | int} y3 y-coordinate of the third corner
     * @param {float | int} x4 x-coordinate of the fourth corner
     * @param {float | int} y4 y-coordinate of the fourth corner
     */
    p.quad = function(x1, y1, x2, y2, x3, y3, x4, y4) {
      p.beginShape(PConstants.QUADS);
      p.vertex(x1, y1, 0);
      p.vertex(x2, y2, 0);
      p.vertex(x3, y3, 0);
      p.vertex(x4, y4, 0);
      p.endShape();
    };

    var roundedRect$2d = function(x, y, width, height, tl, tr, br, bl) {
      if (bl === undef) {
        tr = tl;
        br = tl;
        bl = tl;
      }
      var halfWidth = width / 2,
          halfHeight = height / 2;
      if (tl > halfWidth || tl > halfHeight) {
        tl = Math.min(halfWidth, halfHeight);
      }
      if (tr > halfWidth || tr > halfHeight) {
        tr = Math.min(halfWidth, halfHeight);
      }
      if (br > halfWidth || br > halfHeight) {
        br = Math.min(halfWidth, halfHeight);
      }
      if (bl > halfWidth || bl > halfHeight) {
        bl = Math.min(halfWidth, halfHeight);
      }
      // Translate the stroke by (0.5, 0.5) to draw a crisp border
      if (!doFill || doStroke) {
        curContext.translate(0.5, 0.5);
      }
      curContext.beginPath();
      curContext.moveTo(x + tl, y);
      curContext.lineTo(x + width - tr, y);
      curContext.quadraticCurveTo(x + width, y, x + width, y + tr);
      curContext.lineTo(x + width, y + height - br);
      curContext.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
      curContext.lineTo(x + bl, y + height);
      curContext.quadraticCurveTo(x, y + height, x, y + height - bl);
      curContext.lineTo(x, y + tl);
      curContext.quadraticCurveTo(x, y, x + tl, y);
      if (!doFill || doStroke) {
        curContext.translate(-0.5, -0.5);
      }
      executeContextFill();
      executeContextStroke();
    };

    /**
    * Draws a rectangle to the screen. A rectangle is a four-sided shape with every angle at ninety
    * degrees. The first two parameters set the location, the third sets the width, and the fourth
    * sets the height. The origin is changed with the rectMode() function.
    *
    * @param {int|float} x        x-coordinate of the rectangle
    * @param {int|float} y        y-coordinate of the rectangle
    * @param {int|float} width    width of the rectangle
    * @param {int|float} height   height of the rectangle
    *
    * @see rectMode
    * @see quad
    */
    Drawing2D.prototype.rect = function(x, y, width, height, tl, tr, br, bl) {
      if (!width && !height) {
        return;
      }

      if (curRectMode === PConstants.CORNERS) {
        width -= x;
        height -= y;
      } else if (curRectMode === PConstants.RADIUS) {
        width *= 2;
        height *= 2;
        x -= width / 2;
        y -= height / 2;
      } else if (curRectMode === PConstants.CENTER) {
        x -= width / 2;
        y -= height / 2;
      }

      if (!renderSmooth) {
        x = Math.round(x);
        y = Math.round(y);
        width = Math.round(width);
        height = Math.round(height);
      }
      if (tl !== undef) {
        roundedRect$2d(x, y, width, height, tl, tr, br, bl);
        return;
      }

      // Translate the line by (0.5, 0.5) to draw a crisp rectangle border
      if (doStroke && lineWidth % 2 === 1) {
        curContext.translate(0.5, 0.5);
      }
      curContext.beginPath();
      curContext.rect(x, y, width, height);
      executeContextFill();
      executeContextStroke();
      if (doStroke && lineWidth % 2 === 1) {
        curContext.translate(-0.5, -0.5);
      }
    };

    /**
     * Draws an ellipse (oval) in the display window. An ellipse with an equal <b>width</b> and <b>height</b> is a circle.
     * The first two parameters set the location, the third sets the width, and the fourth sets the height. The origin may be
     * changed with the <b>ellipseMode()</b> function.
     *
     * @param {float|int} x      x-coordinate of the ellipse
     * @param {float|int} y      y-coordinate of the ellipse
     * @param {float|int} width  width of the ellipse
     * @param {float|int} height height of the ellipse
     *
     * @see ellipseMode
     */
    Drawing2D.prototype.ellipse = function(x, y, width, height) {
      x = x || 0;
      y = y || 0;

      if (width <= 0 && height <= 0) {
        return;
      }

      if (curEllipseMode === PConstants.RADIUS) {
        width *= 2;
        height *= 2;
      } else if (curEllipseMode === PConstants.CORNERS) {
        width = width - x;
        height = height - y;
        x += width / 2;
        y += height / 2;
      } else if (curEllipseMode === PConstants.CORNER) {
        x += width / 2;
        y += height / 2;
      }

      // Shortcut for drawing a 2D circle
      if (width === height) {
        curContext.beginPath();
        curContext.arc(x, y, width / 2, 0, PConstants.TWO_PI, false);
        executeContextFill();
        executeContextStroke();
      } else {
        var w = width / 2,
            h = height / 2,
            C = 0.5522847498307933,
            c_x = C * w,
            c_y = C * h;

        p.beginShape();
        p.vertex(x + w, y);
        p.bezierVertex(x + w, y - c_y, x + c_x, y - h, x, y - h);
        p.bezierVertex(x - c_x, y - h, x - w, y - c_y, x - w, y);
        p.bezierVertex(x - w, y + c_y, x - c_x, y + h, x, y + h);
        p.bezierVertex(x + c_x, y + h, x + w, y + c_y, x + w, y);
        p.endShape();
      }
    };

    /**
    * Sets the current normal vector. This is for drawing three dimensional shapes and surfaces and
    * specifies a vector perpendicular to the surface of the shape which determines how lighting affects
    * it. Processing attempts to automatically assign normals to shapes, but since that's imperfect,
    * this is a better option when you want more control. This function is identical to glNormal3f() in OpenGL.
    *
    * @param {float} nx       x direction
    * @param {float} ny       y direction
    * @param {float} nz       z direction
    *
    * @see beginShape
    * @see endShape
    * @see lights
    */
    p.normal = function(nx, ny, nz) {
      if (arguments.length !== 3 || !(typeof nx === "number" && typeof ny === "number" && typeof nz === "number")) {
        throw "normal() requires three numeric arguments.";
      }

      normalX = nx;
      normalY = ny;
      normalZ = nz;

      if (curShape !== 0) {
        if (normalMode === PConstants.NORMAL_MODE_AUTO) {
          normalMode = PConstants.NORMAL_MODE_SHAPE;
        } else if (normalMode === PConstants.NORMAL_MODE_SHAPE) {
          normalMode = PConstants.NORMAL_MODE_VERTEX;
        }
      }
    };

    ////////////////////////////////////////////////////////////////////////////
    // Raster drawing functions
    ////////////////////////////////////////////////////////////////////////////

    /**
    * Saves an image from the display window. Images are saved in TIFF, TARGA, JPEG, and PNG format
    * depending on the extension within the filename  parameter. For example, "image.tif" will have
    * a TIFF image and "image.png" will save a PNG image. If no extension is included in the filename,
    * the image will save in TIFF format and .tif will be added to the name. These files are saved to
    * the sketch's folder, which may be opened by selecting "Show sketch folder" from the "Sketch" menu.
    * It is not possible to use save() while running the program in a web browser.  All images saved
    * from the main drawing window will be opaque. To save images without a background, use createGraphics().
    *
    * @param {String} filename      any sequence of letters and numbers
    *
    * @see saveFrame
    * @see createGraphics
    */
    p.save = function(file, img) {
      // file is unused at the moment
      // may implement this differently in later release
      if (img !== undef) {
        return window.open(img.toDataURL(),"_blank");
      }
      return window.open(p.externals.canvas.toDataURL(),"_blank");
    };

    var saveNumber = 0;

    p.saveFrame = function(file) {
      if(file === undef) {
        // use default name template if parameter is not specified
        file = "screen-####.png";
      }
      // Increment changeable part: screen-0000.png, screen-0001.png, ...
      var frameFilename = file.replace(/#+/, function(all) {
        var s = "" + (saveNumber++);
        while(s.length < all.length) {
          s = "0" + s;
        }
        return s;
      });
      p.save(frameFilename);
    };

    var utilityContext2d = document.createElement("canvas").getContext("2d");

    var canvasDataCache = [undef, undef, undef]; // we need three for now

    function getCanvasData(obj, w, h) {
      var canvasData = canvasDataCache.shift();

      if (canvasData === undef) {
        canvasData = {};
        canvasData.canvas = document.createElement("canvas");
        canvasData.context = canvasData.canvas.getContext('2d');
      }

      canvasDataCache.push(canvasData);

      var canvas = canvasData.canvas, context = canvasData.context,
          width = w || obj.width, height = h || obj.height;

      canvas.width = width;
      canvas.height = height;

      if (!obj) {
        context.clearRect(0, 0, width, height);
      } else if ("data" in obj) { // ImageData
        context.putImageData(obj, 0, 0);
      } else {
        context.clearRect(0, 0, width, height);
        context.drawImage(obj, 0, 0, width, height);
      }
      return canvasData;
    }

    /**
     * Handle the sketch code for pixels[] and pixels.length
     * parser code converts pixels[] to getPixels()
     * or setPixels(), .length becomes getLength()
     */
    function buildPixelsObject(pImage) {
      return {

        getLength: (function(aImg) {
          return function() {
            if (aImg.isRemote) {
              throw "Image is loaded remotely. Cannot get length.";
            } else {
              return aImg.imageData.data.length ? aImg.imageData.data.length/4 : 0;
            }
          };
        }(pImage)),

        getPixel: (function(aImg) {
          return function(i) {
            var offset = i*4,
              data = aImg.imageData.data;

            if (aImg.isRemote) {
              throw "Image is loaded remotely. Cannot get pixels.";
            }

            return (data[offset+3] << 24) & PConstants.ALPHA_MASK |
                   (data[offset] << 16) & PConstants.RED_MASK |
                   (data[offset+1] << 8) & PConstants.GREEN_MASK |
                   data[offset+2] & PConstants.BLUE_MASK;
          };
        }(pImage)),

        setPixel: (function(aImg) {
          return function(i, c) {
            var offset = i*4,
              data = aImg.imageData.data;

            if (aImg.isRemote) {
              throw "Image is loaded remotely. Cannot set pixel.";
            }

            data[offset+0] = (c & PConstants.RED_MASK) >>> 16;
            data[offset+1] = (c & PConstants.GREEN_MASK) >>> 8;
            data[offset+2] = (c & PConstants.BLUE_MASK);
            data[offset+3] = (c & PConstants.ALPHA_MASK) >>> 24;
            aImg.__isDirty = true;
          };
        }(pImage)),

        toArray: (function(aImg) {
          return function() {
            var arr = [],
              data = aImg.imageData.data,
              length = aImg.width * aImg.height;

            if (aImg.isRemote) {
              throw "Image is loaded remotely. Cannot get pixels.";
            }

            for (var i = 0, offset = 0; i < length; i++, offset += 4) {
              arr.push( (data[offset+3] << 24) & PConstants.ALPHA_MASK |
                        (data[offset] << 16) & PConstants.RED_MASK |
                        (data[offset+1] << 8) & PConstants.GREEN_MASK |
                        data[offset+2] & PConstants.BLUE_MASK );
            }
            return arr;
          };
        }(pImage)),

        set: (function(aImg) {
          return function(arr) {
            var offset,
              data,
              c;
            if (this.isRemote) {
              throw "Image is loaded remotely. Cannot set pixels.";
            }

            data = aImg.imageData.data;
            for (var i = 0, aL = arr.length; i < aL; i++) {
              c = arr[i];
              offset = i*4;

              data[offset+0] = (c & PConstants.RED_MASK) >>> 16;
              data[offset+1] = (c & PConstants.GREEN_MASK) >>> 8;
              data[offset+2] = (c & PConstants.BLUE_MASK);
              data[offset+3] = (c & PConstants.ALPHA_MASK) >>> 24;
            }
            aImg.__isDirty = true;
          };
        }(pImage))

      };
    }

    /**
    * Datatype for storing images. Processing can display .gif, .jpg, .tga, and .png images. Images may be
    * displayed in 2D and 3D space. Before an image is used, it must be loaded with the loadImage() function.
    * The PImage object contains fields for the width and height of the image, as well as an array called
    * pixels[]  which contains the values for every pixel in the image. A group of methods, described below,
    * allow easy access to the image's pixels and alpha channel and simplify the process of compositing.
    * Before using the pixels[] array, be sure to use the loadPixels() method on the image to make sure that the
    * pixel data is properly loaded. To create a new image, use the createImage() function (do not use new PImage()).
    *
    * @param {int} width                image width
    * @param {int} height               image height
    * @param {MODE} format              Either RGB, ARGB, ALPHA (grayscale alpha channel)
    *
    * @returns {PImage}
    *
    * @see loadImage
    * @see imageMode
    * @see createImage
    */
    var PImage = function(aWidth, aHeight, aFormat) {

      // Keep track of whether or not the cached imageData has been touched.
      this.__isDirty = false;

      if (aWidth instanceof HTMLImageElement) {
        // convert an <img> to a PImage
        this.fromHTMLImageData(aWidth);
      } else if (aHeight || aFormat) {
        this.width = aWidth || 1;
        this.height = aHeight || 1;

        // Stuff a canvas into sourceImg so image() calls can use drawImage like an <img>
        var canvas = this.sourceImg = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;

        //XXX(jeresig): Commenting out imageData stuff
        //var imageData = this.imageData = canvas.getContext('2d').createImageData(this.width, this.height);
        this.format = (aFormat === PConstants.ARGB || aFormat === PConstants.ALPHA) ? aFormat : PConstants.RGB;
        //if (this.format === PConstants.RGB) {
          // Set the alpha channel of an RGB image to opaque.
          //for (var i = 3, data = this.imageData.data, len = data.length; i < len; i += 4) {
            //data[i] = 255;
          //}
        //}

        //this.__isDirty = true;
        //this.updatePixels();
      } else {
        this.width = 0;
        this.height = 0;
        //XXX(jeresig): Commenting out imageData stuff
        //this.imageData = utilityContext2d.createImageData(1, 1);
        this.format = PConstants.ARGB;
      }

      //XXX(jeresig): Commenting out imageData stuff
      //this.pixels = buildPixelsObject(this);
    };
    PImage.prototype = {

      /**
       * Temporary hack to deal with cross-Processing-instance created PImage.  See
       * tickets #1623 and #1644.
       */
      __isPImage: true,

      /**
      * @member PImage
      * Updates the image with the data in its pixels[] array. Use in conjunction with loadPixels(). If
      * you're only reading pixels from the array, there's no need to call updatePixels().
      * Certain renderers may or may not seem to require loadPixels() or updatePixels(). However, the rule
      * is that any time you want to manipulate the pixels[] array, you must first call loadPixels(), and
      * after changes have been made, call updatePixels(). Even if the renderer may not seem to use this
      * function in the current Processing release, this will always be subject to change.
      * Currently, none of the renderers use the additional parameters to updatePixels().
      */
      updatePixels: function() {
        var canvas = this.sourceImg;
        if (canvas && canvas instanceof HTMLCanvasElement && this.__isDirty) {
          canvas.getContext('2d').putImageData(this.imageData, 0, 0);
        }
        this.__isDirty = false;
      },

      fromHTMLImageData: function(htmlImg) {
        // convert an <img> to a PImage
        var canvasData = getCanvasData(htmlImg);
        //XXX(jeresig): Commenting out imageData stuff
        //try {
          //var imageData = canvasData.context.getImageData(0, 0, htmlImg.width, htmlImg.height);
          //this.fromImageData(imageData);
        //} catch(e) {
          if (htmlImg.width && htmlImg.height) {
            this.isRemote = true;
            this.width = htmlImg.width;
            this.height = htmlImg.height;
          }
        //}
        this.sourceImg = htmlImg;
      },

      'get': function(x, y, w, h) {
        if (!arguments.length) {
          return p.get(this);
        }
        if (arguments.length === 2) {
          return p.get(x, y, this);
        }
        if (arguments.length === 4) {
          return p.get(x, y, w, h, this);
        }
      },

      /**
      * @member PImage
      * Changes the color of any pixel or writes an image directly into the image. The x and y parameter
      * specify the pixel or the upper-left corner of the image. The color parameter specifies the color value.
      * Setting the color of a single pixel with set(x, y) is easy, but not as fast as putting the data
      * directly into pixels[]. The equivalent statement to "set(x, y, #000000)" using pixels[] is
      * "pixels[y*width+x] = #000000". Processing requires calling loadPixels() to load the display window
      * data into the pixels[] array before getting the values and calling updatePixels() to update the window.
      *
      * @param {int} x        x-coordinate of the pixel or upper-left corner of the image
      * @param {int} y        y-coordinate of the pixel or upper-left corner of the image
      * @param {color} color  any value of the color datatype
      *
      * @see get
      * @see pixels[]
      * @see copy
      */
      'set': function(x, y, c) {
        p.set(x, y, c, this);
        this.__isDirty = true;
      },

      /**
      * @member PImage
      * Blends a region of pixels into the image specified by the img parameter. These copies utilize full
      * alpha channel support and a choice of the following modes to blend the colors of source pixels (A)
      * with the ones of pixels in the destination image (B):
      * BLEND - linear interpolation of colours: C = A*factor + B
      * ADD - additive blending with white clip: C = min(A*factor + B, 255)
      * SUBTRACT - subtractive blending with black clip: C = max(B - A*factor, 0)
      * DARKEST - only the darkest colour succeeds: C = min(A*factor, B)
      * LIGHTEST - only the lightest colour succeeds: C = max(A*factor, B)
      * DIFFERENCE - subtract colors from underlying image.
      * EXCLUSION - similar to DIFFERENCE, but less extreme.
      * MULTIPLY - Multiply the colors, result will always be darker.
      * SCREEN - Opposite multiply, uses inverse values of the colors.
      * OVERLAY - A mix of MULTIPLY and SCREEN. Multiplies dark values, and screens light values.
      * HARD_LIGHT - SCREEN when greater than 50% gray, MULTIPLY when lower.
      * SOFT_LIGHT - Mix of DARKEST and LIGHTEST. Works like OVERLAY, but not as harsh.
      * DODGE - Lightens light tones and increases contrast, ignores darks. Called "Color Dodge" in Illustrator and Photoshop.
      * BURN - Darker areas are applied, increasing contrast, ignores lights. Called "Color Burn" in Illustrator and Photoshop.
      * All modes use the alpha information (highest byte) of source image pixels as the blending factor.
      * If the source and destination regions are different sizes, the image will be automatically resized to
      * match the destination size. If the srcImg parameter is not used, the display window is used as the source image.
      * This function ignores imageMode().
      *
      * @param {int} x              X coordinate of the source's upper left corner
      * @param {int} y              Y coordinate of the source's upper left corner
      * @param {int} width          source image width
      * @param {int} height         source image height
      * @param {int} dx             X coordinate of the destinations's upper left corner
      * @param {int} dy             Y coordinate of the destinations's upper left corner
      * @param {int} dwidth         destination image width
      * @param {int} dheight        destination image height
      * @param {PImage} srcImg      an image variable referring to the source image
      * @param {MODE} MODE          Either BLEND, ADD, SUBTRACT, LIGHTEST, DARKEST, DIFFERENCE, EXCLUSION,
      * MULTIPLY, SCREEN, OVERLAY, HARD_LIGHT, SOFT_LIGHT, DODGE, BURN
      *
      * @see alpha
      * @see copy
      */
      blend: function(srcImg, x, y, width, height, dx, dy, dwidth, dheight, MODE) {
        if (arguments.length === 9) {
          p.blend(this, srcImg, x, y, width, height, dx, dy, dwidth, dheight, this);
        } else if (arguments.length === 10) {
          p.blend(srcImg, x, y, width, height, dx, dy, dwidth, dheight, MODE, this);
        }
        delete this.sourceImg;
      },

      /**
      * @member PImage
      * Copies a region of pixels from one image into another. If the source and destination regions
      * aren't the same size, it will automatically resize source pixels to fit the specified target region.
      * No alpha information is used in the process, however if the source image has an alpha channel set,
      * it will be copied as well. This function ignores imageMode().
      *
      * @param {int} sx             X coordinate of the source's upper left corner
      * @param {int} sy             Y coordinate of the source's upper left corner
      * @param {int} swidth         source image width
      * @param {int} sheight        source image height
      * @param {int} dx             X coordinate of the destinations's upper left corner
      * @param {int} dy             Y coordinate of the destinations's upper left corner
      * @param {int} dwidth         destination image width
      * @param {int} dheight        destination image height
      * @param {PImage} srcImg      an image variable referring to the source image
      *
      * @see alpha
      * @see blend
      */
      copy: function(srcImg, sx, sy, swidth, sheight, dx, dy, dwidth, dheight) {
        if (arguments.length === 8) {
          p.blend(this, srcImg, sx, sy, swidth, sheight, dx, dy, dwidth, PConstants.REPLACE, this);
        } else if (arguments.length === 9) {
          p.blend(srcImg, sx, sy, swidth, sheight, dx, dy, dwidth, dheight, PConstants.REPLACE, this);
        }
        delete this.sourceImg;
      },

      /**
      * @member PImage
      * Filters an image as defined by one of the following modes:
      * THRESHOLD - converts the image to black and white pixels depending if they are above or below
      * the threshold defined by the level parameter. The level must be between 0.0 (black) and 1.0(white).
      * If no level is specified, 0.5 is used.
      * GRAY - converts any colors in the image to grayscale equivalents
      * INVERT - sets each pixel to its inverse value
      * POSTERIZE - limits each channel of the image to the number of colors specified as the level parameter
      * BLUR - executes a Guassian blur with the level parameter specifying the extent of the blurring.
      * If no level parameter is used, the blur is equivalent to Guassian blur of radius 1.
      * OPAQUE - sets the alpha channel to entirely opaque.
      * ERODE - reduces the light areas with the amount defined by the level parameter.
      * DILATE - increases the light areas with the amount defined by the level parameter
      *
      * @param {MODE} MODE        Either THRESHOLD, GRAY, INVERT, POSTERIZE, BLUR, OPAQUE, ERODE, or DILATE
      * @param {int|float} param  in the range from 0 to 1
      */
      filter: function(mode, param) {
        if (arguments.length === 2) {
          p.filter(mode, param, this);
        } else if (arguments.length === 1) {
          // no param specified, send null to show its invalid
          p.filter(mode, null, this);
        }
        delete this.sourceImg;
      },

      /**
      * @member PImage
      * Saves the image into a file. Images are saved in TIFF, TARGA, JPEG, and PNG format depending on
      * the extension within the filename  parameter. For example, "image.tif" will have a TIFF image and
      * "image.png" will save a PNG image. If no extension is included in the filename, the image will save
      * in TIFF format and .tif will be added to the name. These files are saved to the sketch's folder,
      * which may be opened by selecting "Show sketch folder" from the "Sketch" menu. It is not possible to
      * use save() while running the program in a web browser.
      * To save an image created within the code, rather than through loading, it's necessary to make the
      * image with the createImage() function so it is aware of the location of the program and can therefore
      * save the file to the right place. See the createImage() reference for more information.
      *
      * @param {String} filename        a sequence of letters and numbers
      */
      save: function(file){
        p.save(file,this);
      },

      /**
      * @member PImage
      * Resize the image to a new width and height. To make the image scale proportionally, use 0 as the
      * value for the wide or high parameter.
      *
      * @param {int} wide         the resized image width
      * @param {int} high         the resized image height
      *
      * @see get
      */
      resize: function(w, h) {
        if (this.isRemote) { // Remote images cannot access imageData
          throw "Image is loaded remotely. Cannot resize.";
        }
        if (this.width !== 0 || this.height !== 0) {
          // make aspect ratio if w or h is 0
          if (w === 0 && h !== 0) {
            w = Math.floor(this.width / this.height * h);
          } else if (h === 0 && w !== 0) {
            h = Math.floor(this.height / this.width * w);
          }
          // put 'this.imageData' into a new canvas
          var canvas = getCanvasData(this.imageData).canvas;
          // pull imageData object out of canvas into ImageData object
          var imageData = getCanvasData(canvas, w, h).context.getImageData(0, 0, w, h);
          // set this as new pimage
          this.fromImageData(imageData);
        }
      },

      /**
      * @member PImage
      * Masks part of an image from displaying by loading another image and using it as an alpha channel.
      * This mask image should only contain grayscale data, but only the blue color channel is used. The
      * mask image needs to be the same size as the image to which it is applied.
      * In addition to using a mask image, an integer array containing the alpha channel data can be
      * specified directly. This method is useful for creating dynamically generated alpha masks. This
      * array must be of the same length as the target image's pixels array and should contain only grayscale
      * data of values between 0-255.
      *
      * @param {PImage} maskImg         any PImage object used as the alpha channel for "img", needs to be same
      *                                 size as "img"
      * @param {int[]} maskArray        any array of Integer numbers used as the alpha channel, needs to be same
      *                                 length as the image's pixel array
      */
      mask: function(mask) {
        var obj = this.toImageData(),
            i,
            size;

        if (mask instanceof PImage || mask.__isPImage) {
          if (mask.width === this.width && mask.height === this.height) {
            mask = mask.toImageData();

            for (i = 2, size = this.width * this.height * 4; i < size; i += 4) {
              // using it as an alpha channel
              obj.data[i + 1] = mask.data[i];
              // but only the blue color channel
            }
          } else {
            throw "mask must have the same dimensions as PImage.";
          }
        } else if (mask instanceof Array) {
          if (this.width * this.height === mask.length) {
            for (i = 0, size = mask.length; i < size; ++i) {
              obj.data[i * 4 + 3] = mask[i];
            }
          } else {
            throw "mask array must be the same length as PImage pixels array.";
          }
        }

        this.fromImageData(obj);
      },

      // These are intentionally left blank for PImages, we work live with pixels and draw as necessary
      /**
      * @member PImage
      * Loads the pixel data for the image into its pixels[] array. This function must always be called
      * before reading from or writing to pixels[].
      * Certain renderers may or may not seem to require loadPixels() or updatePixels(). However, the
      * rule is that any time you want to manipulate the pixels[] array, you must first call loadPixels(),
      * and after changes have been made, call updatePixels(). Even if the renderer may not seem to use
      * this function in the current Processing release, this will always be subject to change.
      */
      loadPixels: nop,

      toImageData: function() {
        if (this.isRemote) {
          return this.sourceImg;
        }

        if (!this.__isDirty) {
          return this.imageData;
        }

        var canvasData = getCanvasData(this.imageData);
        return canvasData.context.getImageData(0, 0, this.width, this.height);
      },

      toDataURL: function() {
        if (this.isRemote) { // Remote images cannot access imageData
          throw "Image is loaded remotely. Cannot create dataURI.";
        }
        var canvasData = getCanvasData(this.imageData);
        return canvasData.canvas.toDataURL();
      },

      fromImageData: function(canvasImg) {
        var w = canvasImg.width,
          h = canvasImg.height,
          canvas = document.createElement('canvas'),
          ctx = canvas.getContext('2d');

        this.width = canvas.width = w;
        this.height = canvas.height = h;

        ctx.putImageData(canvasImg, 0, 0);

        // changed for 0.9
        this.format = PConstants.ARGB;

        this.imageData = canvasImg;
        this.sourceImg = canvas;
      }
    };

    p.PImage = PImage;

    /**
    * Creates a new PImage (the datatype for storing images). This provides a fresh buffer of pixels to play
    * with. Set the size of the buffer with the width and height parameters. The format parameter defines how
    * the pixels are stored. See the PImage reference for more information.
    * Be sure to include all three parameters, specifying only the width and height (but no format) will
    * produce a strange error.
    * Advanced users please note that createImage() should be used instead of the syntax new PImage().
    *
    * @param {int} width                image width
    * @param {int} height               image height
    * @param {MODE} format              Either RGB, ARGB, ALPHA (grayscale alpha channel)
    *
    * @returns {PImage}
    *
    * @see PImage
    * @see PGraphics
    */
    p.createImage = function(w, h, mode) {
      return new PImage(w,h,mode);
    };

    // Loads an image for display. Type is an extension. Callback is fired on load.
    /**
    * Loads an image into a variable of type PImage. Four types of images ( .gif, .jpg, .tga, .png) images may
    * be loaded. To load correctly, images must be located in the data directory of the current sketch. In most
    * cases, load all images in setup() to preload them at the start of the program. Loading images inside draw()
    * will reduce the speed of a program.
    * The filename parameter can also be a URL to a file found online. For security reasons, a Processing sketch
    * found online can only download files from the same server from which it came. Getting around this restriction
    * requires a signed applet.
    * The extension parameter is used to determine the image type in cases where the image filename does not end
    * with a proper extension. Specify the extension as the second parameter to loadImage(), as shown in the
    * third example on this page.
    * If an image is not loaded successfully, the null value is returned and an error message will be printed to
    * the console. The error message does not halt the program, however the null value may cause a NullPointerException
    * if your code does not check whether the value returned from loadImage() is null.
    * Depending on the type of error, a PImage object may still be returned, but the width and height of the image
    * will be set to -1. This happens if bad image data is returned or cannot be decoded properly. Sometimes this happens
    * with image URLs that produce a 403 error or that redirect to a password prompt, because loadImage() will attempt
    * to interpret the HTML as image data.
    *
    * @param {String} filename        name of file to load, can be .gif, .jpg, .tga, or a handful of other image
    *                                 types depending on your platform.
    * @param {String} extension       the type of image to load, for example "png", "gif", "jpg"
    *
    * @returns {PImage}
    *
    * @see PImage
    * @see image
    * @see imageMode
    * @see background
    */
    p.loadImage = function(file, type, callback) {
      // if type is specified add it with a . to file to make the filename
      if (type) {
        file = file + "." + type;
      }
      var pimg;
      // if image is in the preloader cache return a new PImage
      if (curSketch.imageCache.images[file]) {
        pimg = new PImage(curSketch.imageCache.images[file]);
        pimg.loaded = true;
        return pimg;
      }
      // else async load it
      pimg = new PImage();
      var img = document.createElement('img');

      pimg.sourceImg = img;

      img.onload = (function(aImage, aPImage, aCallback) {
        var image = aImage;
        var pimg = aPImage;
        var callback = aCallback;
        return function() {
          // change the <img> object into a PImage now that its loaded
          pimg.fromHTMLImageData(image);
          pimg.loaded = true;
          if (callback) {
            callback();
          }
        };
      }(img, pimg, callback));

      img.src = file; // needs to be called after the img.onload function is declared or it wont work in opera
      return pimg;
    };

    // async loading of large images, same functionality as loadImage above
    /**
    * This function load images on a separate thread so that your sketch does not freeze while images load during
    * setup(). While the image is loading, its width and height will be 0. If an error occurs while loading the image,
    * its width and height will be set to -1. You'll know when the image has loaded properly because its width and
    * height will be greater than 0. Asynchronous image loading (particularly when downloading from a server) can
    * dramatically improve performance.
    * The extension parameter is used to determine the image type in cases where the image filename does not end
    * with a proper extension. Specify the extension as the second parameter to requestImage().
    *
    * @param {String} filename        name of file to load, can be .gif, .jpg, .tga, or a handful of other image
    *                                 types depending on your platform.
    * @param {String} extension       the type of image to load, for example "png", "gif", "jpg"
    *
    * @returns {PImage}
    *
    * @see PImage
    * @see loadImage
    */
    p.requestImage = p.loadImage;

    function get$2(x,y) {
      var data;
      // return the color at x,y (int) of curContext
      if (x >= p.width || x < 0 || y < 0 || y >= p.height) {
        // x,y is outside image return transparent black
        return 0;
      }

      // loadPixels() has been called
      if (isContextReplaced) {
        var offset = ((0|x) + p.width * (0|y)) * 4;
        data = p.imageData.data;
        return (data[offset + 3] << 24) & PConstants.ALPHA_MASK |
               (data[offset] << 16) & PConstants.RED_MASK |
               (data[offset + 1] << 8) & PConstants.GREEN_MASK |
               data[offset + 2] & PConstants.BLUE_MASK;
      }

      // x,y is inside canvas space
      data = p.toImageData(0|x, 0|y, 1, 1).data;
      return (data[3] << 24) & PConstants.ALPHA_MASK |
             (data[0] << 16) & PConstants.RED_MASK |
             (data[1] << 8) & PConstants.GREEN_MASK |
             data[2] & PConstants.BLUE_MASK;
    }
    function get$3(x,y,img) {
      if (img.isRemote) { // Remote images cannot access imageData
        throw "Image is loaded remotely. Cannot get x,y.";
      }
      // PImage.get(x,y) was called, return the color (int) at x,y of img
      var offset = y * img.width * 4 + (x * 4),
          data = img.imageData.data;
      return (data[offset + 3] << 24) & PConstants.ALPHA_MASK |
             (data[offset] << 16) & PConstants.RED_MASK |
             (data[offset + 1] << 8) & PConstants.GREEN_MASK |
             data[offset + 2] & PConstants.BLUE_MASK;
    }
    function get$4(x, y, w, h) {
      // return a PImage of w and h from cood x,y of curContext
      var c = new PImage(w, h, PConstants.ARGB);
      c.fromImageData(p.toImageData(x, y, w, h));
      return c;
    }
    function get$5(x, y, w, h, img) {
      if (img.isRemote) { // Remote images cannot access imageData
        throw "Image is loaded remotely. Cannot get x,y,w,h.";
      }
      // PImage.get(x,y,w,h) was called, return x,y,w,h PImage of img
      // offset start point needs to be *4
      var c = new PImage(w, h, PConstants.ARGB), cData = c.imageData.data,
        imgWidth = img.width, imgHeight = img.height, imgData = img.imageData.data;
      // Don't need to copy pixels from the image outside ranges.
      var startRow = Math.max(0, -y), startColumn = Math.max(0, -x),
        stopRow = Math.min(h, imgHeight - y), stopColumn = Math.min(w, imgWidth - x);
      for (var i = startRow; i < stopRow; ++i) {
        var sourceOffset = ((y + i) * imgWidth + (x + startColumn)) * 4;
        var targetOffset = (i * w + startColumn) * 4;
        for (var j = startColumn; j < stopColumn; ++j) {
          cData[targetOffset++] = imgData[sourceOffset++];
          cData[targetOffset++] = imgData[sourceOffset++];
          cData[targetOffset++] = imgData[sourceOffset++];
          cData[targetOffset++] = imgData[sourceOffset++];
        }
      }
      c.__isDirty = true;
      return c;
    }

    // Gets a single pixel or block of pixels from the current Canvas Context or a PImage
    /**
    * Reads the color of any pixel or grabs a section of an image. If no parameters are specified, the entire
    * image is returned. Get the value of one pixel by specifying an x,y coordinate. Get a section of the display
    * window by specifying an additional width and height parameter. If the pixel requested is outside of the image
    * window, black is returned. The numbers returned are scaled according to the current color ranges, but only RGB
    * values are returned by this function. For example, even though you may have drawn a shape with colorMode(HSB),
    * the numbers returned will be in RGB.
    * Getting the color of a single pixel with get(x, y) is easy, but not as fast as grabbing the data directly
    * from pixels[]. The equivalent statement to "get(x, y)" using pixels[] is "pixels[y*width+x]". Processing
    * requires calling loadPixels() to load the display window data into the pixels[] array before getting the values.
    * This function ignores imageMode().
    *
    * @param {int} x            x-coordinate of the pixel
    * @param {int} y            y-coordinate of the pixel
    * @param {int} width        width of pixel rectangle to get
    * @param {int} height       height of pixel rectangle to get
    *
    * @returns {Color|PImage}
    *
    * @see set
    * @see pixels[]
    * @see imageMode
    */
    p.get = function(x, y, w, h, img) {
      // for 0 2 and 4 arguments use curContext, otherwise PImage.get was called
      if (img !== undefined) {
        return get$5(x, y, w, h, img);
      }
      if (h !== undefined) {
        return get$4(x, y, w, h);
      }
      if (w !== undefined) {
        return get$3(x, y, w);
      }
      if (y !== undefined) {
        return get$2(x, y);
      }
      if (x !== undefined) {
        // PImage.get() was called, return a new PImage
        return get$5(0, 0, x.width, x.height, x);
      }

      return get$4(0, 0, p.width, p.height);
    };

    /**
     * Creates and returns a new <b>PGraphics</b> object of the types P2D, P3D, and JAVA2D. Use this class if you need to draw
     * into an off-screen graphics buffer. It's not possible to use <b>createGraphics()</b> with OPENGL, because it doesn't
     * allow offscreen use. The DXF and PDF renderers require the filename parameter. <br /><br /> It's important to call
     * any drawing commands between beginDraw() and endDraw() statements. This is also true for any commands that affect
     * drawing, such as smooth() or colorMode().<br /><br /> Unlike the main drawing surface which is completely opaque,
     * surfaces created with createGraphics() can have transparency. This makes it possible to draw into a graphics and
     * maintain the alpha channel.
     *
     * @param {int} width       width in pixels
     * @param {int} height      height in pixels
     * @param {int} renderer    Either P2D, P3D, JAVA2D, PDF, DXF
     * @param {String} filename the name of the file (not supported yet)
     */
    p.createGraphics = function(w, h, render) {
      var pg = new Processing();
      pg.size(w, h, render);
      return pg;
    };

    // pixels caching
    function resetContext() {
      if(isContextReplaced) {
        curContext = originalContext;
        isContextReplaced = false;

        p.updatePixels();
      }
    }
    function SetPixelContextWrapper() {
      function wrapFunction(newContext, name) {
        function wrapper() {
          resetContext();
          curContext[name].apply(curContext, arguments);
        }
        newContext[name] = wrapper;
      }
      function wrapProperty(newContext, name) {
        function getter() {
          resetContext();
          return curContext[name];
        }
        function setter(value) {
          resetContext();
          curContext[name] = value;
        }
        p.defineProperty(newContext, name, { get: getter, set: setter });
      }
      for(var n in curContext) {
        if(typeof curContext[n] === 'function') {
          wrapFunction(this, n);
        } else {
          wrapProperty(this, n);
        }
      }
    }
    function replaceContext() {
      if(isContextReplaced) {
        return;
      }
      p.loadPixels();
      if(proxyContext === null) {
        originalContext = curContext;
        proxyContext = new SetPixelContextWrapper();
      }
      isContextReplaced = true;
      curContext = proxyContext;
      setPixelsCached = 0;
    }

    function set$3(x, y, c) {
      if (x < p.width && x >= 0 && y >= 0 && y < p.height) {
        replaceContext();
        p.pixels.setPixel((0|x)+p.width*(0|y), c);
        if(++setPixelsCached > maxPixelsCached) {
          resetContext();
        }
      }
    }
    function set$4(x, y, obj, img) {
      if (img.isRemote) { // Remote images cannot access imageData
        throw "Image is loaded remotely. Cannot set x,y.";
      }
      var c = p.color.toArray(obj);
      var offset = y * img.width * 4 + (x*4);
      var data = img.imageData.data;
      data[offset] = c[0];
      data[offset+1] = c[1];
      data[offset+2] = c[2];
      data[offset+3] = c[3];
    }

    // Paints a pixel array into the canvas
    /**
    * Changes the color of any pixel or writes an image directly into the display window. The x and y parameters
    * specify the pixel to change and the color  parameter specifies the color value. The color parameter is affected
    * by the current color mode (the default is RGB values from 0 to 255). When setting an image, the x and y
    * parameters define the coordinates for the upper-left corner of the image.
    * Setting the color of a single pixel with set(x, y) is easy, but not as fast as putting the data directly
    * into pixels[]. The equivalent statement to "set(x, y, #000000)" using pixels[] is "pixels[y*width+x] = #000000".
    * You must call loadPixels() to load the display window data into the pixels[] array before setting the values
    * and calling updatePixels() to update the window with any changes. This function ignores imageMode().
    *
    * @param {int} x            x-coordinate of the pixel
    * @param {int} y            y-coordinate of the pixel
    * @param {Color} obj        any value of the color datatype
    * @param {PImage} img       any valid variable of type PImage
    *
    * @see get
    * @see pixels[]
    * @see imageMode
    */
    p.set = function(x, y, obj, img) {
      var color, oldFill;
      if (arguments.length === 3) {
        // called p.set(), was it with a color or a img ?
        if (typeof obj === "number") {
          set$3(x, y, obj);
        } else if (obj instanceof PImage || obj.__isPImage) {
          p.image(obj, x, y);
        }
      } else if (arguments.length === 4) {
        // PImage.set(x,y,c) was called, set coordinate x,y color to c of img
        set$4(x, y, obj, img);
      }
    };
    p.imageData = {};

    // handle the sketch code for pixels[]
    // parser code converts pixels[] to getPixels() or setPixels(),
    // .length becomes getLength()
    /**
    * Array containing the values for all the pixels in the display window. These values are of the color datatype.
    * This array is the size of the display window. For example, if the image is 100x100 pixels, there will be 10000
    * values and if the window is 200x300 pixels, there will be 60000 values. The index value defines the position
    * of a value within the array. For example, the statment color b = pixels[230] will set the variable b to be
    * equal to the value at that location in the array.
    * Before accessing this array, the data must loaded with the loadPixels() function. After the array data has
    * been modified, the updatePixels() function must be run to update the changes.
    *
    * @param {int} index      must not exceed the size of the array
    *
    * @see loadPixels
    * @see updatePixels
    * @see get
    * @see set
    * @see PImage
    */
    p.pixels = {
      getLength: function() { return p.imageData.data.length ? p.imageData.data.length/4 : 0; },
      getPixel: function(i) {
        var offset = i*4, data = p.imageData.data;
        return (data[offset+3] << 24) & 0xff000000 |
               (data[offset+0] << 16) & 0x00ff0000 |
               (data[offset+1] << 8) & 0x0000ff00 |
               data[offset+2] & 0x000000ff;
      },
      setPixel: function(i,c) {
        var offset = i*4, data = p.imageData.data;
        data[offset+0] = (c & 0x00ff0000) >>> 16; // RED_MASK
        data[offset+1] = (c & 0x0000ff00) >>> 8;  // GREEN_MASK
        data[offset+2] = (c & 0x000000ff);        // BLUE_MASK
        data[offset+3] = (c & 0xff000000) >>> 24; // ALPHA_MASK
      },
      toArray: function() {
        var arr = [], length = p.imageData.width * p.imageData.height, data = p.imageData.data;
        for (var i = 0, offset = 0; i < length; i++, offset += 4) {
          arr.push((data[offset+3] << 24) & 0xff000000 |
                   (data[offset+0] << 16) & 0x00ff0000 |
                   (data[offset+1] << 8) & 0x0000ff00 |
                   data[offset+2] & 0x000000ff);
        }
        return arr;
      },
      set: function(arr) {
        for (var i = 0, aL = arr.length; i < aL; i++) {
          this.setPixel(i, arr[i]);
        }
      }
    };

    // Gets a 1-Dimensional pixel array from Canvas
    /**
    * Loads the pixel data for the display window into the pixels[] array. This function must always be called
    * before reading from or writing to pixels[].
    * Certain renderers may or may not seem to require loadPixels() or updatePixels(). However, the rule is that
    * any time you want to manipulate the pixels[] array, you must first call loadPixels(), and after changes
    * have been made, call updatePixels(). Even if the renderer may not seem to use this function in the current
    * Processing release, this will always be subject to change.
    *
    * @see pixels[]
    * @see updatePixels
    */
    p.loadPixels = function() {
      p.imageData = drawing.$ensureContext().getImageData(0, 0, p.width, p.height);
    };

    // Draws a 1-Dimensional pixel array to Canvas
    /**
    * Updates the display window with the data in the pixels[] array. Use in conjunction with loadPixels(). If
    * you're only reading pixels from the array, there's no need to call updatePixels() unless there are changes.
    * Certain renderers may or may not seem to require loadPixels() or updatePixels(). However, the rule is that
    * any time you want to manipulate the pixels[] array, you must first call loadPixels(), and after changes
    * have been made, call updatePixels(). Even if the renderer may not seem to use this function in the current
    * Processing release, this will always be subject to change.
    * Currently, none of the renderers use the additional parameters to updatePixels(), however this may be
    * implemented in the future.
    *
    * @see loadPixels
    * @see pixels[]
    */
    p.updatePixels = function() {
      if (p.imageData) {
        drawing.$ensureContext().putImageData(p.imageData, 0, 0);
      }
    };

    /**
    * Set various hints and hacks for the renderer. This is used to handle obscure rendering features that cannot be
    * implemented in a consistent manner across renderers. Many options will often graduate to standard features
    * instead of hints over time.
    * hint(ENABLE_OPENGL_4X_SMOOTH) - Enable 4x anti-aliasing for OpenGL. This can help force anti-aliasing if
    * it has not been enabled by the user. On some graphics cards, this can also be set by the graphics driver's
    * control panel, however not all cards make this available. This hint must be called immediately after the
    * size() command because it resets the renderer, obliterating any settings and anything drawn (and like size(),
    * re-running the code that came before it again).
    * hint(DISABLE_OPENGL_2X_SMOOTH) - In Processing 1.0, Processing always enables 2x smoothing when the OpenGL
    * renderer is used. This hint disables the default 2x smoothing and returns the smoothing behavior found in
    * earlier releases, where smooth() and noSmooth() could be used to enable and disable smoothing, though the
    * quality was inferior.
    * hint(ENABLE_NATIVE_FONTS) - Use the native version fonts when they are installed, rather than the bitmapped
    * version from a .vlw file. This is useful with the JAVA2D renderer setting, as it will improve font rendering
    * speed. This is not enabled by default, because it can be misleading while testing because the type will look
    * great on your machine (because you have the font installed) but lousy on others' machines if the identical
    * font is unavailable. This option can only be set per-sketch, and must be called before any use of textFont().
    * hint(DISABLE_DEPTH_TEST) - Disable the zbuffer, allowing you to draw on top of everything at will. When depth
    * testing is disabled, items will be drawn to the screen sequentially, like a painting. This hint is most often
    * used to draw in 3D, then draw in 2D on top of it (for instance, to draw GUI controls in 2D on top of a 3D
    * interface). Starting in release 0149, this will also clear the depth buffer. Restore the default with
    * hint(ENABLE_DEPTH_TEST), but note that with the depth buffer cleared, any 3D drawing that happens later in
    * draw() will ignore existing shapes on the screen.
    * hint(ENABLE_DEPTH_SORT) - Enable primitive z-sorting of triangles and lines in P3D and OPENGL. This can slow
    * performance considerably, and the algorithm is not yet perfect. Restore the default with hint(DISABLE_DEPTH_SORT).
    * hint(DISABLE_OPENGL_ERROR_REPORT) - Speeds up the OPENGL renderer setting by not checking for errors while
    * running. Undo with hint(ENABLE_OPENGL_ERROR_REPORT).
    * As of release 0149, unhint() has been removed in favor of adding additional ENABLE/DISABLE constants to reset
    * the default behavior. This prevents the double negatives, and also reinforces which hints can be enabled or disabled.
    *
    * @param {MODE} item          constant: name of the hint to be enabled or disabled
    *
    * @see PGraphics
    * @see createGraphics
    * @see size
    */
    p.hint = function(which) {
      var curContext = drawing.$ensureContext();
      if (which === PConstants.DISABLE_DEPTH_TEST) {
         curContext.disable(curContext.DEPTH_TEST);
         curContext.depthMask(false);
         curContext.clear(curContext.DEPTH_BUFFER_BIT);
      }
      else if (which === PConstants.ENABLE_DEPTH_TEST) {
         curContext.enable(curContext.DEPTH_TEST);
         curContext.depthMask(true);
      }
    };

    /**
     * The background() function sets the color used for the background of the Processing window.
     * The default background is light gray. In the <b>draw()</b> function, the background color is used to clear the display window at the beginning of each frame.
     * An image can also be used as the background for a sketch, however its width and height must be the same size as the sketch window.
     * To resize an image 'b' to the size of the sketch window, use b.resize(width, height).
     * Images used as background will ignore the current <b>tint()</b> setting.
     * For the main drawing surface, the alpha value will be ignored. However,
     * alpha can be used on PGraphics objects from <b>createGraphics()</b>. This is
     * the only way to set all the pixels partially transparent, for instance.
     * If the 'gray' parameter is passed in the function sets the background to a grayscale value, based on the
     * current colorMode.
     * <p>
     * Note that background() should be called before any transformations occur,
     * because some implementations may require the current transformation matrix
     * to be identity before drawing.
     *
     * @param {int|float} gray    specifies a value between white and black
     * @param {int|float} value1  red or hue value (depending on the current color mode)
     * @param {int|float} value2  green or saturation value (depending on the current color mode)
     * @param {int|float} value3  blue or brightness value (depending on the current color mode)
     * @param {int|float} alpha   opacity of the background
     * @param {Color} color       any value of the color datatype
     * @param {int} hex           color value in hexadecimal notation (i.e. #FFCC00 or 0xFFFFCC00)
     * @param {PImage} image      an instance of a PImage to use as a background
     *
     * @see #stroke()
     * @see #fill()
     * @see #tint()
     * @see #colorMode()
     */
    var backgroundHelper = function(arg1, arg2, arg3, arg4) {
      var obj;

      if (arg1 instanceof PImage || arg1.__isPImage) {
        obj = arg1;

        if (!obj.loaded) {
          throw "Error using image in background(): PImage not loaded.";
        }
        if(obj.width !== p.width || obj.height !== p.height){
          throw "Background image must be the same dimensions as the canvas.";
        }
      } else {
        obj = p.color(arg1, arg2, arg3, arg4);
      }

      backgroundObj = obj;
    };

    Drawing2D.prototype.background = function(arg1, arg2, arg3, arg4) {
      if (arg1 !== undef) {
        backgroundHelper(arg1, arg2, arg3, arg4);
      }

      if (backgroundObj instanceof PImage || backgroundObj.__isPImage) {
        saveContext();
        curContext.setTransform(1, 0, 0, 1, 0, 0);
        p.image(backgroundObj, 0, 0);
        restoreContext();
      } else {
        saveContext();
        curContext.setTransform(1, 0, 0, 1, 0, 0);

        // If the background is transparent
        if (p.alpha(backgroundObj) !== colorModeA) {
          curContext.clearRect(0,0, p.width, p.height);
        }
        curContext.fillStyle = p.color.toString(backgroundObj);
        curContext.fillRect(0, 0, p.width, p.height);
        isFillDirty = true;
        restoreContext();
      }
    };
    
    // Draws an image to the Canvas
    /**
    * Displays images to the screen. The images must be in the sketch's "data" directory to load correctly. Select "Add
    * file..." from the "Sketch" menu to add the image. Processing currently works with GIF, JPEG, and Targa images. The
    * color of an image may be modified with the tint() function and if a GIF has transparency, it will maintain its
    * transparency. The img parameter specifies the image to display and the x and y parameters define the location of
    * the image from its upper-left corner. The image is displayed at its original size unless the width and height
    * parameters specify a different size. The imageMode() function changes the way the parameters work. A call to
    * imageMode(CORNERS) will change the width and height parameters to define the x and y values of the opposite
    * corner of the image.
    *
    * @param {PImage} img            the image to display
    * @param {int|float} x           x-coordinate of the image
    * @param {int|float} y           y-coordinate of the image
    * @param {int|float} width       width to display the image
    * @param {int|float} height      height to display the image
    *
    * @see loadImage
    * @see PImage
    * @see imageMode
    * @see tint
    * @see background
    * @see alpha
    */
    Drawing2D.prototype.image = function(img, x, y, w, h) {
      // Fix fractional positions
      x = Math.round(x);
      y = Math.round(y);

      if (img.width > 0) {
        var wid = w || img.width;
        var hgt = h || img.height;

        var bounds = imageModeConvert(x || 0, y || 0, w || img.width, h || img.height, arguments.length < 4);
        var fastImage = !!img.sourceImg && curTint === null;
        if (fastImage) {
          var htmlElement = img.sourceImg;
          if (img.__isDirty) {
            img.updatePixels();
          }
          // Using HTML element's width and height in case if the image was resized.
          curContext.drawImage(htmlElement, 0, 0,
            htmlElement.width, htmlElement.height, bounds.x, bounds.y, bounds.w, bounds.h);
        } else {
          var obj = img.toImageData();

          // Tint the image
          if (curTint !== null) {
            curTint(obj);
            img.__isDirty = true;
          }

          curContext.drawImage(getCanvasData(obj).canvas, 0, 0,
            img.width, img.height, bounds.x, bounds.y, bounds.w, bounds.h);
        }
      }
    };
    
    /**
     * The tint() function sets the fill value for displaying images. Images can be tinted to
     * specified colors or made transparent by setting the alpha.
     * <br><br>To make an image transparent, but not change it's color,
     * use white as the tint color and specify an alpha value. For instance,
     * tint(255, 128) will make an image 50% transparent (unless
     * <b>colorMode()</b> has been used).
     *
     * <br><br>When using hexadecimal notation to specify a color, use "#" or
     * "0x" before the values (e.g. #CCFFAA, 0xFFCCFFAA). The # syntax uses six
     * digits to specify a color (the way colors are specified in HTML and CSS).
     * When using the hexadecimal notation starting with "0x", the hexadecimal
     * value must be specified with eight characters; the first two characters
     * define the alpha component and the remainder the red, green, and blue
     * components.
     * <br><br>The value for the parameter "gray" must be less than or equal
     * to the current maximum value as specified by <b>colorMode()</b>.
     * The default maximum value is 255.
     * <br><br>The tint() method is also used to control the coloring of
     * textures in 3D.
     *
     * @param {int|float} gray    any valid number
     * @param {int|float} alpha    opacity of the image
     * @param {int|float} value1  red or hue value
     * @param {int|float} value2  green or saturation value
     * @param {int|float} value3  blue or brightness value
     * @param {int|float} color    any value of the color datatype
     * @param {int} hex            color value in hexadecimal notation (i.e. #FFCC00 or 0xFFFFCC00)
     *
     * @see #noTint()
     * @see #image()
     */
    p.tint = function(a1, a2, a3, a4) {
      var tintColor = p.color(a1, a2, a3, a4);
      var r = p.red(tintColor) / colorModeX;
      var g = p.green(tintColor) / colorModeY;
      var b = p.blue(tintColor) / colorModeZ;
      var a = p.alpha(tintColor) / colorModeA;
      curTint = function(obj) {
        var data = obj.data,
            length = 4 * obj.width * obj.height;
        for (var i = 0; i < length;) {
          data[i++] *= r;
          data[i++] *= g;
          data[i++] *= b;
          data[i++] *= a;
        }
      };
      // for overriding the color buffer when 3d rendering
      curTint3d = function(data){
        for (var i = 0; i < data.length;) {
          data[i++] = r;
          data[i++] = g;
          data[i++] = b;
          data[i++] = a;
        }
      };
    };

    /**
     * The noTint() function removes the current fill value for displaying images and reverts to displaying images with their original hues.
     *
     * @see #tint()
     * @see #image()
     */
    p.noTint = function() {
      curTint = null;
      curTint3d = null;
    };

    /**
    * Copies a region of pixels from the display window to another area of the display window and copies a region of pixels from an
    * image used as the srcImg  parameter into the display window. If the source and destination regions aren't the same size, it will
    * automatically resize the source pixels to fit the specified target region. No alpha information is used in the process, however
    * if the source image has an alpha channel set, it will be copied as well. This function ignores imageMode().
    *
    * @param {int} x            X coordinate of the source's upper left corner
    * @param {int} y            Y coordinate of the source's upper left corner
    * @param {int} width        source image width
    * @param {int} height       source image height
    * @param {int} dx           X coordinate of the destination's upper left corner
    * @param {int} dy           Y coordinate of the destination's upper left corner
    * @param {int} dwidth       destination image width
    * @param {int} dheight      destination image height
    * @param {PImage} srcImg    image variable referring to the source image
    *
    * @see blend
    * @see get
    */
    p.copy = function(src, sx, sy, sw, sh, dx, dy, dw, dh) {
      if (dh === undef) {
        // shift everything, and introduce p
        dh = dw;
        dw = dy;
        dy = dx;
        dx = sh;
        sh = sw;
        sw = sy;
        sy = sx;
        sx = src;
        src = p;
      }
      p.blend(src, sx, sy, sw, sh, dx, dy, dw, dh, PConstants.REPLACE);
    };

    /**
    * Blends a region of pixels from one image into another (or in itself again) with full alpha channel support. There
    * is a choice of the following modes to blend the source pixels (A) with the ones of pixels in the destination image (B):
    * BLEND - linear interpolation of colours: C = A*factor + B
    * ADD - additive blending with white clip: C = min(A*factor + B, 255)
    * SUBTRACT - subtractive blending with black clip: C = max(B - A*factor, 0)
    * DARKEST - only the darkest colour succeeds: C = min(A*factor, B)
    * LIGHTEST - only the lightest colour succeeds: C = max(A*factor, B)
    * DIFFERENCE - subtract colors from underlying image.
    * EXCLUSION - similar to DIFFERENCE, but less extreme.
    * MULTIPLY - Multiply the colors, result will always be darker.
    * SCREEN - Opposite multiply, uses inverse values of the colors.
    * OVERLAY - A mix of MULTIPLY and SCREEN. Multiplies dark values, and screens light values.
    * HARD_LIGHT - SCREEN when greater than 50% gray, MULTIPLY when lower.
    * SOFT_LIGHT - Mix of DARKEST and LIGHTEST. Works like OVERLAY, but not as harsh.
    * DODGE - Lightens light tones and increases contrast, ignores darks. Called "Color Dodge" in Illustrator and Photoshop.
    * BURN - Darker areas are applied, increasing contrast, ignores lights. Called "Color Burn" in Illustrator and Photoshop.
    * All modes use the alpha information (highest byte) of source image pixels as the blending factor. If the source and
    * destination regions are different sizes, the image will be automatically resized to match the destination size. If the
    * srcImg parameter is not used, the display window is used as the source image.  This function ignores imageMode().
    *
    * @param {int} x            X coordinate of the source's upper left corner
    * @param {int} y            Y coordinate of the source's upper left corner
    * @param {int} width        source image width
    * @param {int} height       source image height
    * @param {int} dx           X coordinate of the destination's upper left corner
    * @param {int} dy           Y coordinate of the destination's upper left corner
    * @param {int} dwidth       destination image width
    * @param {int} dheight      destination image height
    * @param {PImage} srcImg    image variable referring to the source image
    * @param {PImage} MODE      Either BLEND, ADD, SUBTRACT, LIGHTEST, DARKEST, DIFFERENCE, EXCLUSION, MULTIPLY, SCREEN,
    *                           OVERLAY, HARD_LIGHT, SOFT_LIGHT, DODGE, BURN
    * @see filter
    */
    p.blend = function(src, sx, sy, sw, sh, dx, dy, dw, dh, mode, pimgdest) {
      if (src.isRemote) {
        throw "Image is loaded remotely. Cannot blend image.";
      }

      if (mode === undef) {
        // shift everything, and introduce p
        mode = dh;
        dh = dw;
        dw = dy;
        dy = dx;
        dx = sh;
        sh = sw;
        sw = sy;
        sy = sx;
        sx = src;
        src = p;
      }

      var sx2 = sx + sw,
        sy2 = sy + sh,
        dx2 = dx + dw,
        dy2 = dy + dh,
        dest = pimgdest || p;

      // check if pimgdest is there and pixels, if so this was a call from pimg.blend
      if (pimgdest === undef || mode === undef) {
        p.loadPixels();
      }

      src.loadPixels();

      if (src === p && p.intersect(sx, sy, sx2, sy2, dx, dy, dx2, dy2)) {
        p.blit_resize(p.get(sx, sy, sx2 - sx, sy2 - sy), 0, 0, sx2 - sx - 1, sy2 - sy - 1,
                      dest.imageData.data, dest.width, dest.height, dx, dy, dx2, dy2, mode);
      } else {
        p.blit_resize(src, sx, sy, sx2, sy2, dest.imageData.data, dest.width, dest.height, dx, dy, dx2, dy2, mode);
      }

      if (pimgdest === undef) {
        p.updatePixels();
      }
    };

    // helper function for filter()
    var buildBlurKernel = function(r) {
      var radius = p.floor(r * 3.5), i, radiusi;
      radius = (radius < 1) ? 1 : ((radius < 248) ? radius : 248);
      if (p.shared.blurRadius !== radius) {
        p.shared.blurRadius = radius;
        p.shared.blurKernelSize = 1 + (p.shared.blurRadius<<1);
        p.shared.blurKernel = new Float32Array(p.shared.blurKernelSize);
        var sharedBlurKernal = p.shared.blurKernel;
        var sharedBlurKernelSize = p.shared.blurKernelSize;
        var sharedBlurRadius = p.shared.blurRadius;
        // init blurKernel
        for (i = 0; i < sharedBlurKernelSize; i++) {
          sharedBlurKernal[i] = 0;
        }
        var radiusiSquared = (radius - 1) * (radius - 1);
        for (i = 1; i < radius; i++) {
          sharedBlurKernal[radius + i] = sharedBlurKernal[radiusi] = radiusiSquared;
        }
        sharedBlurKernal[radius] = radius * radius;
      }
    };

    var blurARGB = function(r, aImg) {
      var sum, cr, cg, cb, ca, c, m;
      var read, ri, ym, ymi, bk0;
      var wh = aImg.pixels.getLength();
      var r2 = new Float32Array(wh);
      var g2 = new Float32Array(wh);
      var b2 = new Float32Array(wh);
      var a2 = new Float32Array(wh);
      var yi = 0;
      var x, y, i, offset;

      buildBlurKernel(r);

      var aImgHeight = aImg.height;
      var aImgWidth = aImg.width;
      var sharedBlurKernelSize = p.shared.blurKernelSize;
      var sharedBlurRadius = p.shared.blurRadius;
      var sharedBlurKernal = p.shared.blurKernel;
      var pix = aImg.imageData.data;

      for (y = 0; y < aImgHeight; y++) {
        for (x = 0; x < aImgWidth; x++) {
          cb = cg = cr = ca = sum = 0;
          read = x - sharedBlurRadius;
          if (read<0) {
            bk0 = -read;
            read = 0;
          } else {
            if (read >= aImgWidth) {
              break;
            }
            bk0=0;
          }
          for (i = bk0; i < sharedBlurKernelSize; i++) {
            if (read >= aImgWidth) {
              break;
            }
            offset = (read + yi) *4;
            m = sharedBlurKernal[i];
            ca += m * pix[offset + 3];
            cr += m * pix[offset];
            cg += m * pix[offset + 1];
            cb += m * pix[offset + 2];
            sum += m;
            read++;
          }
          ri = yi + x;
          a2[ri] = ca / sum;
          r2[ri] = cr / sum;
          g2[ri] = cg / sum;
          b2[ri] = cb / sum;
        }
        yi += aImgWidth;
      }

      yi = 0;
      ym = -sharedBlurRadius;
      ymi = ym*aImgWidth;

      for (y = 0; y < aImgHeight; y++) {
        for (x = 0; x < aImgWidth; x++) {
          cb = cg = cr = ca = sum = 0;
          if (ym<0) {
            bk0 = ri = -ym;
            read = x;
          } else {
            if (ym >= aImgHeight) {
              break;
            }
            bk0 = 0;
            ri = ym;
            read = x + ymi;
          }
          for (i = bk0; i < sharedBlurKernelSize; i++) {
            if (ri >= aImgHeight) {
              break;
            }
            m = sharedBlurKernal[i];
            ca += m * a2[read];
            cr += m * r2[read];
            cg += m * g2[read];
            cb += m * b2[read];
            sum += m;
            ri++;
            read += aImgWidth;
          }
          offset = (x + yi) *4;
          pix[offset] = cr / sum;
          pix[offset + 1] = cg / sum;
          pix[offset + 2] = cb / sum;
          pix[offset + 3] = ca / sum;
        }
        yi += aImgWidth;
        ymi += aImgWidth;
        ym++;
      }
    };

    // helper funtion for ERODE and DILATE modes of filter()
    var dilate = function(isInverted, aImg) {
      var currIdx = 0;
      var maxIdx = aImg.pixels.getLength();
      var out = new Int32Array(maxIdx);
      var currRowIdx, maxRowIdx, colOrig, colOut, currLum;
      var idxRight, idxLeft, idxUp, idxDown,
          colRight, colLeft, colUp, colDown,
          lumRight, lumLeft, lumUp, lumDown;

      if (!isInverted) {
        // erosion (grow light areas)
        while (currIdx<maxIdx) {
          currRowIdx = currIdx;
          maxRowIdx = currIdx + aImg.width;
          while (currIdx < maxRowIdx) {
            colOrig = colOut = aImg.pixels.getPixel(currIdx);
            idxLeft = currIdx - 1;
            idxRight = currIdx + 1;
            idxUp = currIdx - aImg.width;
            idxDown = currIdx + aImg.width;
            if (idxLeft < currRowIdx) {
              idxLeft = currIdx;
            }
            if (idxRight >= maxRowIdx) {
              idxRight = currIdx;
            }
            if (idxUp < 0) {
              idxUp = 0;
            }
            if (idxDown >= maxIdx) {
              idxDown = currIdx;
            }
            colUp = aImg.pixels.getPixel(idxUp);
            colLeft = aImg.pixels.getPixel(idxLeft);
            colDown = aImg.pixels.getPixel(idxDown);
            colRight = aImg.pixels.getPixel(idxRight);

            // compute luminance
            currLum = 77*(colOrig>>16&0xff) + 151*(colOrig>>8&0xff) + 28*(colOrig&0xff);
            lumLeft = 77*(colLeft>>16&0xff) + 151*(colLeft>>8&0xff) + 28*(colLeft&0xff);
            lumRight = 77*(colRight>>16&0xff) + 151*(colRight>>8&0xff) + 28*(colRight&0xff);
            lumUp = 77*(colUp>>16&0xff) + 151*(colUp>>8&0xff) + 28*(colUp&0xff);
            lumDown = 77*(colDown>>16&0xff) + 151*(colDown>>8&0xff) + 28*(colDown&0xff);

            if (lumLeft > currLum) {
              colOut = colLeft;
              currLum = lumLeft;
            }
            if (lumRight > currLum) {
              colOut = colRight;
              currLum = lumRight;
            }
            if (lumUp > currLum) {
              colOut = colUp;
              currLum = lumUp;
            }
            if (lumDown > currLum) {
              colOut = colDown;
              currLum = lumDown;
            }
            out[currIdx++] = colOut;
          }
        }
      } else {
        // dilate (grow dark areas)
        while (currIdx < maxIdx) {
          currRowIdx = currIdx;
          maxRowIdx = currIdx + aImg.width;
          while (currIdx < maxRowIdx) {
            colOrig = colOut = aImg.pixels.getPixel(currIdx);
            idxLeft = currIdx - 1;
            idxRight = currIdx + 1;
            idxUp = currIdx - aImg.width;
            idxDown = currIdx + aImg.width;
            if (idxLeft < currRowIdx) {
              idxLeft = currIdx;
            }
            if (idxRight >= maxRowIdx) {
              idxRight = currIdx;
            }
            if (idxUp < 0) {
              idxUp = 0;
            }
            if (idxDown >= maxIdx) {
              idxDown = currIdx;
            }
            colUp = aImg.pixels.getPixel(idxUp);
            colLeft = aImg.pixels.getPixel(idxLeft);
            colDown = aImg.pixels.getPixel(idxDown);
            colRight = aImg.pixels.getPixel(idxRight);

            // compute luminance
            currLum = 77*(colOrig>>16&0xff) + 151*(colOrig>>8&0xff) + 28*(colOrig&0xff);
            lumLeft = 77*(colLeft>>16&0xff) + 151*(colLeft>>8&0xff) + 28*(colLeft&0xff);
            lumRight = 77*(colRight>>16&0xff) + 151*(colRight>>8&0xff) + 28*(colRight&0xff);
            lumUp = 77*(colUp>>16&0xff) + 151*(colUp>>8&0xff) + 28*(colUp&0xff);
            lumDown = 77*(colDown>>16&0xff) + 151*(colDown>>8&0xff) + 28*(colDown&0xff);

            if (lumLeft < currLum) {
              colOut = colLeft;
              currLum = lumLeft;
            }
            if (lumRight < currLum) {
              colOut = colRight;
              currLum = lumRight;
            }
            if (lumUp < currLum) {
              colOut = colUp;
              currLum = lumUp;
            }
            if (lumDown < currLum) {
              colOut = colDown;
              currLum = lumDown;
            }
            out[currIdx++]=colOut;
          }
        }
      }
      aImg.pixels.set(out);
      //p.arraycopy(out,0,pixels,0,maxIdx);
    };

    /**
    * Filters the display window as defined by one of the following modes:
    * THRESHOLD - converts the image to black and white pixels depending if they are above or below the threshold
    * defined by the level parameter. The level must be between 0.0 (black) and 1.0(white). If no level is specified, 0.5 is used.
    * GRAY - converts any colors in the image to grayscale equivalents
    * INVERT - sets each pixel to its inverse value
    * POSTERIZE - limits each channel of the image to the number of colors specified as the level parameter
    * BLUR - executes a Guassian blur with the level parameter specifying the extent of the blurring. If no level parameter is
    * used, the blur is equivalent to Guassian blur of radius 1.
    * OPAQUE - sets the alpha channel to entirely opaque.
    * ERODE - reduces the light areas with the amount defined by the level parameter.
    * DILATE - increases the light areas with the amount defined by the level parameter.
    *
    * @param {MODE} MODE          Either THRESHOLD, GRAY, INVERT, POSTERIZE, BLUR, OPAQUE, ERODE, or DILATE
    * @param {int|float} level    defines the quality of the filter
    *
    * @see blend
    */
    p.filter = function(kind, param, aImg){
      var img, col, lum, i;

      if (arguments.length === 3) {
        aImg.loadPixels();
        img = aImg;
      } else {
        p.loadPixels();
        img = p;
      }

      if (param === undef) {
        param = null;
      }
      if (img.isRemote) { // Remote images cannot access imageData
        throw "Image is loaded remotely. Cannot filter image.";
      }
      // begin filter process
      var imglen = img.pixels.getLength();
      switch (kind) {
        case PConstants.BLUR:
          var radius = param || 1; // if no param specified, use 1 (default for p5)
          blurARGB(radius, img);
          break;

        case PConstants.GRAY:
          if (img.format === PConstants.ALPHA) { //trouble
            // for an alpha image, convert it to an opaque grayscale
            for (i = 0; i < imglen; i++) {
              col = 255 - img.pixels.getPixel(i);
              img.pixels.setPixel(i,(0xff000000 | (col << 16) | (col << 8) | col));
            }
            img.format = PConstants.RGB; //trouble
          } else {
            for (i = 0; i < imglen; i++) {
              col = img.pixels.getPixel(i);
              lum = (77*(col>>16&0xff) + 151*(col>>8&0xff) + 28*(col&0xff))>>8;
              img.pixels.setPixel(i,((col & PConstants.ALPHA_MASK) | lum<<16 | lum<<8 | lum));
            }
          }
          break;

        case PConstants.INVERT:
          for (i = 0; i < imglen; i++) {
            img.pixels.setPixel(i, (img.pixels.getPixel(i) ^ 0xffffff));
          }
          break;

        case PConstants.POSTERIZE:
          if (param === null) {
            throw "Use filter(POSTERIZE, int levels) instead of filter(POSTERIZE)";
          }
          var levels = p.floor(param);
          if ((levels < 2) || (levels > 255)) {
            throw "Levels must be between 2 and 255 for filter(POSTERIZE, levels)";
          }
          var levels1 = levels - 1;
          for (i = 0; i < imglen; i++) {
            var rlevel = (img.pixels.getPixel(i) >> 16) & 0xff;
            var glevel = (img.pixels.getPixel(i) >> 8) & 0xff;
            var blevel = img.pixels.getPixel(i) & 0xff;
            rlevel = (((rlevel * levels) >> 8) * 255) / levels1;
            glevel = (((glevel * levels) >> 8) * 255) / levels1;
            blevel = (((blevel * levels) >> 8) * 255) / levels1;
            img.pixels.setPixel(i, ((0xff000000 & img.pixels.getPixel(i)) | (rlevel << 16) | (glevel << 8) | blevel));
          }
          break;

        case PConstants.OPAQUE:
          for (i = 0; i < imglen; i++) {
            img.pixels.setPixel(i, (img.pixels.getPixel(i) | 0xff000000));
          }
          img.format = PConstants.RGB; //trouble
          break;

        case PConstants.THRESHOLD:
          if (param === null) {
            param = 0.5;
          }
          if ((param < 0) || (param > 1)) {
            throw "Level must be between 0 and 1 for filter(THRESHOLD, level)";
          }
          var thresh = p.floor(param * 255);
          for (i = 0; i < imglen; i++) {
            var max = p.max((img.pixels.getPixel(i) & PConstants.RED_MASK) >> 16, p.max((img.pixels.getPixel(i) & PConstants.GREEN_MASK) >> 8, (img.pixels.getPixel(i) & PConstants.BLUE_MASK)));
            img.pixels.setPixel(i, ((img.pixels.getPixel(i) & PConstants.ALPHA_MASK) | ((max < thresh) ? 0x000000 : 0xffffff)));
          }
          break;

        case PConstants.ERODE:
          dilate(true, img);
          break;

        case PConstants.DILATE:
          dilate(false, img);
          break;
      }
      img.updatePixels();
    };


    // shared variables for blit_resize(), filter_new_scanline(), filter_bilinear(), filter()
    // change this in the future to not be exposed to p
    p.shared = {
      fracU: 0,
      ifU: 0,
      fracV: 0,
      ifV: 0,
      u1: 0,
      u2: 0,
      v1: 0,
      v2: 0,
      sX: 0,
      sY: 0,
      iw: 0,
      iw1: 0,
      ih1: 0,
      ul: 0,
      ll: 0,
      ur: 0,
      lr: 0,
      cUL: 0,
      cLL: 0,
      cUR: 0,
      cLR: 0,
      srcXOffset: 0,
      srcYOffset: 0,
      r: 0,
      g: 0,
      b: 0,
      a: 0,
      srcBuffer: null,
      blurRadius: 0,
      blurKernelSize: 0,
      blurKernel: null
    };

    p.intersect = function(sx1, sy1, sx2, sy2, dx1, dy1, dx2, dy2) {
      var sw = sx2 - sx1 + 1;
      var sh = sy2 - sy1 + 1;
      var dw = dx2 - dx1 + 1;
      var dh = dy2 - dy1 + 1;
      if (dx1 < sx1) {
        dw += dx1 - sx1;
        if (dw > sw) {
          dw = sw;
        }
      } else {
        var w = sw + sx1 - dx1;
        if (dw > w) {
          dw = w;
        }
      }
      if (dy1 < sy1) {
        dh += dy1 - sy1;
        if (dh > sh) {
          dh = sh;
        }
      } else {
        var h = sh + sy1 - dy1;
        if (dh > h) {
          dh = h;
        }
      }
      return ! (dw <= 0 || dh <= 0);
    };

    var blendFuncs = {};
    blendFuncs[PConstants.BLEND] = p.modes.blend;
    blendFuncs[PConstants.ADD] = p.modes.add;
    blendFuncs[PConstants.SUBTRACT] = p.modes.subtract;
    blendFuncs[PConstants.LIGHTEST] = p.modes.lightest;
    blendFuncs[PConstants.DARKEST] = p.modes.darkest;
    blendFuncs[PConstants.REPLACE] = p.modes.replace;
    blendFuncs[PConstants.DIFFERENCE] = p.modes.difference;
    blendFuncs[PConstants.EXCLUSION] = p.modes.exclusion;
    blendFuncs[PConstants.MULTIPLY] = p.modes.multiply;
    blendFuncs[PConstants.SCREEN] = p.modes.screen;
    blendFuncs[PConstants.OVERLAY] = p.modes.overlay;
    blendFuncs[PConstants.HARD_LIGHT] = p.modes.hard_light;
    blendFuncs[PConstants.SOFT_LIGHT] = p.modes.soft_light;
    blendFuncs[PConstants.DODGE] = p.modes.dodge;
    blendFuncs[PConstants.BURN] = p.modes.burn;

    p.blit_resize = function(img, srcX1, srcY1, srcX2, srcY2, destPixels,
                             screenW, screenH, destX1, destY1, destX2, destY2, mode) {
      var x, y;
      if (srcX1 < 0) {
        srcX1 = 0;
      }
      if (srcY1 < 0) {
        srcY1 = 0;
      }
      if (srcX2 >= img.width) {
        srcX2 = img.width - 1;
      }
      if (srcY2 >= img.height) {
        srcY2 = img.height - 1;
      }
      var srcW = srcX2 - srcX1;
      var srcH = srcY2 - srcY1;
      var destW = destX2 - destX1;
      var destH = destY2 - destY1;

      if (destW <= 0 || destH <= 0 || srcW <= 0 || srcH <= 0 || destX1 >= screenW ||
          destY1 >= screenH || srcX1 >= img.width || srcY1 >= img.height) {
        return;
      }

      var dx = Math.floor(srcW / destW * PConstants.PRECISIONF);
      var dy = Math.floor(srcH / destH * PConstants.PRECISIONF);

      var pshared = p.shared;

      pshared.srcXOffset = Math.floor(destX1 < 0 ? -destX1 * dx : srcX1 * PConstants.PRECISIONF);
      pshared.srcYOffset = Math.floor(destY1 < 0 ? -destY1 * dy : srcY1 * PConstants.PRECISIONF);
      if (destX1 < 0) {
        destW += destX1;
        destX1 = 0;
      }
      if (destY1 < 0) {
        destH += destY1;
        destY1 = 0;
      }
      destW = Math.min(destW, screenW - destX1);
      destH = Math.min(destH, screenH - destY1);

      var destOffset = destY1 * screenW + destX1;
      var destColor;

      pshared.srcBuffer = img.imageData.data;
      pshared.iw = img.width;
      pshared.iw1 = img.width - 1;
      pshared.ih1 = img.height - 1;

      // cache for speed
      var filterBilinear = p.filter_bilinear,
        filterNewScanline = p.filter_new_scanline,
        blendFunc = blendFuncs[mode],
        blendedColor,
        idx,
        cULoffset,
        cURoffset,
        cLLoffset,
        cLRoffset,
        ALPHA_MASK = PConstants.ALPHA_MASK,
        RED_MASK = PConstants.RED_MASK,
        GREEN_MASK = PConstants.GREEN_MASK,
        BLUE_MASK = PConstants.BLUE_MASK,
        PREC_MAXVAL = PConstants.PREC_MAXVAL,
        PRECISIONB = PConstants.PRECISIONB,
        PREC_RED_SHIFT = PConstants.PREC_RED_SHIFT,
        PREC_ALPHA_SHIFT = PConstants.PREC_ALPHA_SHIFT,
        srcBuffer = pshared.srcBuffer,
        min = Math.min;

      for (y = 0; y < destH; y++) {

        pshared.sX = pshared.srcXOffset;
        pshared.fracV = pshared.srcYOffset & PREC_MAXVAL;
        pshared.ifV = PREC_MAXVAL - pshared.fracV;
        pshared.v1 = (pshared.srcYOffset >> PRECISIONB) * pshared.iw;
        pshared.v2 = min((pshared.srcYOffset >> PRECISIONB) + 1, pshared.ih1) * pshared.iw;

        for (x = 0; x < destW; x++) {
          idx = (destOffset + x) * 4;

          destColor = (destPixels[idx + 3] << 24) &
                      ALPHA_MASK | (destPixels[idx] << 16) &
                      RED_MASK   | (destPixels[idx + 1] << 8) &
                      GREEN_MASK |  destPixels[idx + 2] & BLUE_MASK;

          pshared.fracU = pshared.sX & PREC_MAXVAL;
          pshared.ifU = PREC_MAXVAL - pshared.fracU;
          pshared.ul = (pshared.ifU * pshared.ifV) >> PRECISIONB;
          pshared.ll = (pshared.ifU * pshared.fracV) >> PRECISIONB;
          pshared.ur = (pshared.fracU * pshared.ifV) >> PRECISIONB;
          pshared.lr = (pshared.fracU * pshared.fracV) >> PRECISIONB;
          pshared.u1 = (pshared.sX >> PRECISIONB);
          pshared.u2 = min(pshared.u1 + 1, pshared.iw1);

          cULoffset = (pshared.v1 + pshared.u1) * 4;
          cURoffset = (pshared.v1 + pshared.u2) * 4;
          cLLoffset = (pshared.v2 + pshared.u1) * 4;
          cLRoffset = (pshared.v2 + pshared.u2) * 4;

          pshared.cUL = (srcBuffer[cULoffset + 3] << 24) &
                        ALPHA_MASK | (srcBuffer[cULoffset] << 16) &
                        RED_MASK   | (srcBuffer[cULoffset + 1] << 8) &
                        GREEN_MASK |  srcBuffer[cULoffset + 2] & BLUE_MASK;

          pshared.cUR = (srcBuffer[cURoffset + 3] << 24) &
                        ALPHA_MASK | (srcBuffer[cURoffset] << 16) &
                        RED_MASK   | (srcBuffer[cURoffset + 1] << 8) &
                        GREEN_MASK |  srcBuffer[cURoffset + 2] & BLUE_MASK;

          pshared.cLL = (srcBuffer[cLLoffset + 3] << 24) &
                        ALPHA_MASK | (srcBuffer[cLLoffset] << 16) &
                        RED_MASK   | (srcBuffer[cLLoffset + 1] << 8) &
                        GREEN_MASK |  srcBuffer[cLLoffset + 2] & BLUE_MASK;

          pshared.cLR = (srcBuffer[cLRoffset + 3] << 24) &
                        ALPHA_MASK | (srcBuffer[cLRoffset] << 16) &
                        RED_MASK   | (srcBuffer[cLRoffset + 1] << 8) &
                        GREEN_MASK |  srcBuffer[cLRoffset + 2] & BLUE_MASK;

          pshared.r = ((pshared.ul * ((pshared.cUL & RED_MASK) >> 16) +
                       pshared.ll * ((pshared.cLL & RED_MASK) >> 16) +
                       pshared.ur * ((pshared.cUR & RED_MASK) >> 16) +
                       pshared.lr * ((pshared.cLR & RED_MASK) >> 16)) << PREC_RED_SHIFT) & RED_MASK;
          pshared.g = ((pshared.ul * (pshared.cUL & GREEN_MASK) +
                       pshared.ll * (pshared.cLL & GREEN_MASK) +
                       pshared.ur * (pshared.cUR & GREEN_MASK) +
                       pshared.lr * (pshared.cLR & GREEN_MASK)) >>> PRECISIONB) & GREEN_MASK;
          pshared.b = (pshared.ul * (pshared.cUL & BLUE_MASK) +
                       pshared.ll * (pshared.cLL & BLUE_MASK) +
                       pshared.ur * (pshared.cUR & BLUE_MASK) +
                       pshared.lr * (pshared.cLR & BLUE_MASK)) >>> PRECISIONB;
          pshared.a = ((pshared.ul * ((pshared.cUL & ALPHA_MASK) >>> 24) +
                       pshared.ll * ((pshared.cLL & ALPHA_MASK) >>> 24) +
                       pshared.ur * ((pshared.cUR & ALPHA_MASK) >>> 24) +
                       pshared.lr * ((pshared.cLR & ALPHA_MASK) >>> 24)) << PREC_ALPHA_SHIFT) & ALPHA_MASK;

          blendedColor = blendFunc(destColor, (pshared.a | pshared.r | pshared.g | pshared.b));

          destPixels[idx]     = (blendedColor & RED_MASK) >>> 16;
          destPixels[idx + 1] = (blendedColor & GREEN_MASK) >>> 8;
          destPixels[idx + 2] = (blendedColor & BLUE_MASK);
          destPixels[idx + 3] = (blendedColor & ALPHA_MASK) >>> 24;

          pshared.sX += dx;
        }
        destOffset += screenW;
        pshared.srcYOffset += dy;
      }
    };

    ////////////////////////////////////////////////////////////////////////////
    // Font handling
    ////////////////////////////////////////////////////////////////////////////

    /**
     * loadFont() Loads a font into a variable of type PFont.
     *
     * @param {String} name filename of the font to load
     * @param {int|float} size option font size (used internally)
     *
     * @returns {PFont} new PFont object
     *
     * @see #PFont
     * @see #textFont
     * @see #text
     * @see #createFont
     */
    p.loadFont = function(name, size) {
      if (name === undef) {
        throw("font name required in loadFont.");
      }
      if (name.indexOf(".svg") === -1) {
        if (size === undef) {
          size = curTextFont.size;
        }
        return PFont.get(name, size);
      }
      // If the font is a glyph, calculate by SVG table
      var font = p.loadGlyphs(name);

      return {
        name: name,
        css: '12px sans-serif',
        glyph: true,
        units_per_em: font.units_per_em,
        horiz_adv_x: 1 / font.units_per_em * font.horiz_adv_x,
        ascent: font.ascent,
        descent: font.descent,
        width: function(str) {
          var width = 0;
          var len = str.length;
          for (var i = 0; i < len; i++) {
            try {
              width += parseFloat(p.glyphLook(p.glyphTable[name], str[i]).horiz_adv_x);
            }
            catch(e) {
              Processing.debug(e);
            }
          }
          return width / p.glyphTable[name].units_per_em;
        }
      };
    };

    /**
     * createFont() Loads a font into a variable of type PFont.
     * Smooth and charset are ignored in Processing.js.
     *
     * @param {String}    name    filename of the font to load
     * @param {int|float} size    font size in pixels
     * @param {boolean}   smooth  not used in Processing.js
     * @param {char[]}    charset not used in Processing.js
     *
     * @returns {PFont} new PFont object
     *
     * @see #PFont
     * @see #textFont
     * @see #text
     * @see #loadFont
     */
    p.createFont = function(name, size) {
      // because Processing.js only deals with real fonts,
      // createFont is simply a wrapper for loadFont/2
      return p.loadFont(name, size);
    };

    /**
     * textFont() Sets the current font.
     *
     * @param {PFont}     pfont the PFont to load as current text font
     * @param {int|float} size optional font size in pixels
     *
     * @see #createFont
     * @see #loadFont
     * @see #PFont
     * @see #text
     */
    p.textFont = function(pfont, size) {
      if (size !== undef) {
        // If we're using an SVG glyph font, don't load from cache
        if (!pfont.glyph) {
          pfont = PFont.get(pfont.name, size);
        }
        curTextSize = size;
      }
      curTextFont = pfont;
      curFontName = curTextFont.name;
      curTextAscent = curTextFont.ascent;
      curTextDescent = curTextFont.descent;
      curTextLeading = curTextFont.leading;
      var curContext = drawing.$ensureContext();
      curContext.font = curTextFont.css;
    };

    /**
     * textSize() Sets the current font size in pixels.
     *
     * @param {int|float} size font size in pixels
     *
     * @see #textFont
     * @see #loadFont
     * @see #PFont
     * @see #text
     */
    p.textSize = function(size) {
      if (size !== curTextSize) {
        curTextFont = PFont.get(curFontName, size);
        curTextSize = size;
        // recache metrics
        curTextAscent = curTextFont.ascent;
        curTextDescent = curTextFont.descent;
        curTextLeading = curTextFont.leading;
        var curContext = drawing.$ensureContext();
        curContext.font = curTextFont.css;
      }
    };

    /**
     * textAscent() returns the maximum height a character extends above the baseline of the
     * current font at its current size, in pixels.
     *
     * @returns {float} height of the current font above the baseline, at its current size, in pixels
     *
     * @see #textDescent
     */
    p.textAscent = function() {
      return curTextAscent;
    };

    /**
     * textDescent() returns the maximum depth a character will protrude below the baseline of
     * the current font at its current size, in pixels.
     *
     * @returns {float} depth of the current font below the baseline, at its current size, in pixels
     *
     * @see #textAscent
     */
    p.textDescent = function() {
      return curTextDescent;
    };

    /**
     * textLeading() Sets the current font's leading, which is the distance
     * from baseline to baseline over consecutive lines, with additional vertical
     * spacing taking into account. Usually this value is 1.2 or 1.25 times the
     * textsize, but this value can be changed to effect vertically compressed
     * or stretched text.
     *
     * @param {int|float} the desired baseline-to-baseline size in pixels
     */
    p.textLeading = function(leading) {
      curTextLeading = leading;
    };

    /**
     * textAlign() Sets the current alignment for drawing text.
     *
     * @param {int} ALIGN  Horizontal alignment, either LEFT, CENTER, or RIGHT
     * @param {int} YALIGN optional vertical alignment, either TOP, BOTTOM, CENTER, or BASELINE
     *
     * @see #loadFont
     * @see #PFont
     * @see #text
     */
    p.textAlign = function(xalign, yalign) {
      horizontalTextAlignment = xalign;
      verticalTextAlignment = yalign || PConstants.BASELINE;
    };

    /**
     * toP5String converts things with arbitrary data type into
     * string values, for text rendering.
     *
     * @param {any} any object that can be converted into a string
     *
     * @return {String} the string representation of the input
     */
    function toP5String(obj) {
      if(obj instanceof String) {
        return obj;
      }
      if(typeof obj === 'number') {
        // check if an int
        if(obj === (0 | obj)) {
          return obj.toString();
        }
        return p.nf(obj, 0, 3);
      }
      if(obj === null || obj === undef) {
        return "";
      }
      return obj.toString();
    }

    /**
     * textWidth() Calculates and returns the width of any character or text string in pixels.
     *
     * @param {char|String} str char or String to be measured
     *
     * @return {float} width of char or String in pixels
     *
     * @see #loadFont
     * @see #PFont
     * @see #text
     * @see #textFont
     */
    Drawing2D.prototype.textWidth = function(str) {
      var lines = toP5String(str).split(/\r?\n/g), width = 0;
      var i, linesCount = lines.length;

      curContext.font = curTextFont.css;
      for (i = 0; i < linesCount; ++i) {
        width = Math.max(width, curTextFont.measureTextWidth(lines[i]));
      }
      return width | 0;
    };
    
    // A lookup table for characters that can not be referenced by Object
    p.glyphLook = function(font, chr) {
      try {
        switch (chr) {
        case "1":
          return font.one;
        case "2":
          return font.two;
        case "3":
          return font.three;
        case "4":
          return font.four;
        case "5":
          return font.five;
        case "6":
          return font.six;
        case "7":
          return font.seven;
        case "8":
          return font.eight;
        case "9":
          return font.nine;
        case "0":
          return font.zero;
        case " ":
          return font.space;
        case "$":
          return font.dollar;
        case "!":
          return font.exclam;
        case '"':
          return font.quotedbl;
        case "#":
          return font.numbersign;
        case "%":
          return font.percent;
        case "&":
          return font.ampersand;
        case "'":
          return font.quotesingle;
        case "(":
          return font.parenleft;
        case ")":
          return font.parenright;
        case "*":
          return font.asterisk;
        case "+":
          return font.plus;
        case ",":
          return font.comma;
        case "-":
          return font.hyphen;
        case ".":
          return font.period;
        case "/":
          return font.slash;
        case "_":
          return font.underscore;
        case ":":
          return font.colon;
        case ";":
          return font.semicolon;
        case "<":
          return font.less;
        case "=":
          return font.equal;
        case ">":
          return font.greater;
        case "?":
          return font.question;
        case "@":
          return font.at;
        case "[":
          return font.bracketleft;
        case "\\":
          return font.backslash;
        case "]":
          return font.bracketright;
        case "^":
          return font.asciicircum;
        case "`":
          return font.grave;
        case "{":
          return font.braceleft;
        case "|":
          return font.bar;
        case "}":
          return font.braceright;
        case "~":
          return font.asciitilde;
          // If the character is not 'special', access it by object reference
        default:
          return font[chr];
        }
      } catch(e) {
        Processing.debug(e);
      }
    };

    // Print some text to the Canvas
    Drawing2D.prototype.text$line = function(str, x, y, z, align) {
      var textWidth = 0, xOffset = 0;
      // If the font is a standard Canvas font...
      if (!curTextFont.glyph) {
        if (str && ("fillText" in curContext)) {
          if (isFillDirty) {
            curContext.fillStyle = p.color.toString(currentFillColor);
            isFillDirty = false;
          }

          // horizontal offset/alignment
          if(align === PConstants.RIGHT || align === PConstants.CENTER) {
            textWidth = curTextFont.measureTextWidth(str);

            if(align === PConstants.RIGHT) {
              xOffset = -textWidth;
            } else { // if(align === PConstants.CENTER)
              xOffset = -textWidth/2;
            }
          }

          curContext.fillText(str, x+xOffset, y);
        }
      } else {
        // If the font is a Batik SVG font...
        var font = p.glyphTable[curFontName];
        saveContext();
        curContext.translate(x, y + curTextSize);

        // horizontal offset/alignment
        if(align === PConstants.RIGHT || align === PConstants.CENTER) {
          textWidth = font.width(str);

          if(align === PConstants.RIGHT) {
            xOffset = -textWidth;
          } else { // if(align === PConstants.CENTER)
            xOffset = -textWidth/2;
          }
        }

        var upem   = font.units_per_em,
          newScale = 1 / upem * curTextSize;

        curContext.scale(newScale, newScale);

        for (var i=0, len=str.length; i < len; i++) {
          // Test character against glyph table
          try {
            p.glyphLook(font, str[i]).draw();
          } catch(e) {
            Processing.debug(e);
          }
        }
        restoreContext();
      }
    };
    

    /**
    * unbounded text function (z is an optional argument)
    */
    function text$4(str, x, y, z) {
      var lines, linesCount;
      if(str.indexOf('\n') < 0) {
        lines = [str];
        linesCount = 1;
      } else {
        lines = str.split(/\r?\n/g);
        linesCount = lines.length;
      }
      // handle text line-by-line

      var yOffset = 0;
      if(verticalTextAlignment === PConstants.TOP) {
        yOffset = curTextAscent + curTextDescent;
      } else if(verticalTextAlignment === PConstants.CENTER) {
        yOffset = curTextAscent/2 - (linesCount-1)*curTextLeading/2;
      } else if(verticalTextAlignment === PConstants.BOTTOM) {
        yOffset = -(curTextDescent + (linesCount-1)*curTextLeading);
      }

      for(var i=0;i<linesCount;++i) {
        var line = lines[i];
        drawing.text$line(line, x, y + yOffset, z, horizontalTextAlignment);
        yOffset += curTextLeading;
      }
    }


    /**
    * box-bounded text function (z is an optional argument)
    */
    function text$6(str, x, y, width, height, z) {
      // 'fail' on 0-valued dimensions
      if (str.length === 0 || width === 0 || height === 0) {
        return;
      }
      // also 'fail' if the text height is larger than the bounding height
      if(curTextSize > height) {
        return;
      }

      var spaceMark = -1;
      var start = 0;
      var lineWidth = 0;
      var drawCommands = [];

      // run through text, character-by-character
      for (var charPos=0, len=str.length; charPos < len; charPos++)
      {
        var currentChar = str[charPos];
        var spaceChar = (currentChar === " ");
        var letterWidth = curTextFont.measureTextWidth(currentChar);

        // if we aren't looking at a newline, and the text still fits, keep processing
        if (currentChar !== "\n" && (lineWidth + letterWidth <= width)) {
          if (spaceChar) { spaceMark = charPos; }
          lineWidth += letterWidth;
        }

        // if we're looking at a newline, or the text no longer fits, push the section that fit into the drawcommand list
        else
        {
          if (spaceMark + 1 === start) {
            if(charPos>0) {
              // Whole line without spaces so far.
              spaceMark = charPos;
            } else {
              // 'fail', because the line can't even fit the first character
              return;
            }
          }

          if (currentChar === "\n") {
            drawCommands.push({text:str.substring(start, charPos), width: lineWidth});
            start = charPos + 1;
          } else {
            // current is not a newline, which means the line doesn't fit in box. push text.
            // In Processing 1.5.1, the space is also pushed, so we push up to spaceMark+1,
            // rather than up to spaceMark, as was the case for Processing 1.5 and earlier.
            drawCommands.push({text:str.substring(start, spaceMark+1), width: lineWidth});
            start = spaceMark + 1;
          }

          // newline + return
          lineWidth = 0;
          charPos = start - 1;
        }
      }

      // push the remaining text
      if (start < len) {
        drawCommands.push({text:str.substring(start), width: lineWidth});
      }

      // resolve horizontal alignment
      var xOffset = 1,
          yOffset = curTextAscent;
      if (horizontalTextAlignment === PConstants.CENTER) {
        xOffset = width/2;
      } else if (horizontalTextAlignment === PConstants.RIGHT) {
        xOffset = width;
      }

      // resolve vertical alignment
      var linesCount = drawCommands.length,
          visibleLines = Math.min(linesCount, Math.floor(height/curTextLeading));
      if(verticalTextAlignment === PConstants.TOP) {
        yOffset = curTextAscent + curTextDescent;
      } else if(verticalTextAlignment === PConstants.CENTER) {
        yOffset = (height/2) - curTextLeading * (visibleLines/2 - 1);
      } else if(verticalTextAlignment === PConstants.BOTTOM) {
        yOffset = curTextDescent + curTextLeading;
      }

      var command,
          drawCommand,
          leading;
      for (command = 0; command < linesCount; command++) {
        leading = command * curTextLeading;
        // stop if not enough space for one more line draw
        if (yOffset + leading > height - curTextDescent) {
          break;
        }
        drawCommand = drawCommands[command];
        drawing.text$line(drawCommand.text, x + xOffset, y + yOffset + leading, z, horizontalTextAlignment);
      }
    }

    /**
     * text() Draws text to the screen.
     *
     * @param {String|char|int|float} data       the alphanumeric symbols to be displayed
     * @param {int|float}             x          x-coordinate of text
     * @param {int|float}             y          y-coordinate of text
     * @param {int|float}             z          optional z-coordinate of text
     * @param {String}                stringdata optional letters to be displayed
     * @param {int|float}             width      optional width of text box
     * @param {int|float}             height     optional height of text box
     *
     * @see #textAlign
     * @see #textMode
     * @see #loadFont
     * @see #PFont
     * @see #textFont
     */
    p.text = function() {
      //XXX(jeresig): Fix font constantly resetting
      if (curContext.font !== curTextFont.css) {
        curContext.font = curTextFont.css;
      }
      if (textMode === PConstants.SHAPE) {
        // TODO: requires beginRaw function
        return;
      }
      if (arguments.length === 3) { // for text( str, x, y)
        text$4(toP5String(arguments[0]), arguments[1], arguments[2], 0);
      } else if (arguments.length === 4) { // for text( str, x, y, z)
        text$4(toP5String(arguments[0]), arguments[1], arguments[2], arguments[3]);
      } else if (arguments.length === 5) { // for text( str, x, y , width, height)
        text$6(toP5String(arguments[0]), arguments[1], arguments[2], arguments[3], arguments[4], 0);
      } else if (arguments.length === 6) { // for text( stringdata, x, y , width, height, z)
        text$6(toP5String(arguments[0]), arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
      }
    };

    /**
     * Sets the way text draws to the screen. In the default configuration (the MODEL mode), it's possible to rotate,
     * scale, and place letters in two and three dimensional space. <br /><br /> Changing to SCREEN mode draws letters
     * directly to the front of the window and greatly increases rendering quality and speed when used with the P2D and
     * P3D renderers. textMode(SCREEN) with OPENGL and JAVA2D (the default) renderers will generally be slower, though
     * pixel accurate with P2D and P3D. With textMode(SCREEN), the letters draw at the actual size of the font (in pixels)
     * and therefore calls to <b>textSize()</b> will not affect the size of the letters. To create a font at the size you
     * desire, use the "Create font..." option in the Tools menu, or use the createFont() function. When using textMode(SCREEN),
     * any z-coordinate passed to a text() command will be ignored, because your computer screen is...flat!
     *
     * @param {int} MODE Either MODEL, SCREEN or SHAPE (not yet supported)
     *
     * @see loadFont
     * @see PFont
     * @see text
     * @see textFont
     * @see createFont
     */
    p.textMode = function(mode){
      textMode = mode;
    };

    // Load Batik SVG Fonts and parse to pre-def objects for quick rendering
    p.loadGlyphs = function(url) {
      var x, y, cx, cy, nx, ny, d, a, lastCom, lenC, horiz_adv_x, getXY = '[0-9\\-]+', path;

      // Return arrays of SVG commands and coords
      // get this to use p.matchAll() - will need to work around the lack of null return
      var regex = function(needle, hay) {
        var i = 0,
          results = [],
          latest, regexp = new RegExp(needle, "g");
        latest = results[i] = regexp.exec(hay);
        while (latest) {
          i++;
          latest = results[i] = regexp.exec(hay);
        }
        return results;
      };

      var buildPath = function(d) {
        var c = regex("[A-Za-z][0-9\\- ]+|Z", d);
        var beforePathDraw = function() {
          saveContext();
          return drawing.$ensureContext();
        };
        var afterPathDraw = function() {
          executeContextFill();
          executeContextStroke();
          restoreContext();
        };

        // Begin storing path object
        path = "return {draw:function(){var curContext=beforePathDraw();curContext.beginPath();";

        x = 0;
        y = 0;
        cx = 0;
        cy = 0;
        nx = 0;
        ny = 0;
        d = 0;
        a = 0;
        lastCom = "";
        lenC = c.length - 1;

        // Loop through SVG commands translating to canvas eqivs functions in path object
        for (var j = 0; j < lenC; j++) {
          var com = c[j][0], xy = regex(getXY, com);

          switch (com[0]) {
            case "M":
              //curContext.moveTo(x,-y);
              x = parseFloat(xy[0][0]);
              y = parseFloat(xy[1][0]);
              path += "curContext.moveTo(" + x + "," + (-y) + ");";
              break;

            case "L":
              //curContext.lineTo(x,-y);
              x = parseFloat(xy[0][0]);
              y = parseFloat(xy[1][0]);
              path += "curContext.lineTo(" + x + "," + (-y) + ");";
              break;

            case "H":
              //curContext.lineTo(x,-y)
              x = parseFloat(xy[0][0]);
              path += "curContext.lineTo(" + x + "," + (-y) + ");";
              break;

            case "V":
              //curContext.lineTo(x,-y);
              y = parseFloat(xy[0][0]);
              path += "curContext.lineTo(" + x + "," + (-y) + ");";
              break;

            case "T":
              //curContext.quadraticCurveTo(cx,-cy,nx,-ny);
              nx = parseFloat(xy[0][0]);
              ny = parseFloat(xy[1][0]);

              if (lastCom === "Q" || lastCom === "T") {
                d = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(cy - y, 2));
                // XXX(jeresig)
                a = (p.angleMode === "degrees" ? 180 : Math.PI) + p.atan2(cx - x, cy - y);
                cx = x + p.sin(a) * d;
                cy = y + p.cos(a) * d;
              } else {
                cx = x;
                cy = y;
              }

              path += "curContext.quadraticCurveTo(" + cx + "," + (-cy) + "," + nx + "," + (-ny) + ");";
              x = nx;
              y = ny;
              break;

            case "Q":
              //curContext.quadraticCurveTo(cx,-cy,nx,-ny);
              cx = parseFloat(xy[0][0]);
              cy = parseFloat(xy[1][0]);
              nx = parseFloat(xy[2][0]);
              ny = parseFloat(xy[3][0]);
              path += "curContext.quadraticCurveTo(" + cx + "," + (-cy) + "," + nx + "," + (-ny) + ");";
              x = nx;
              y = ny;
              break;

            case "Z":
              //curContext.closePath();
              path += "curContext.closePath();";
              break;
          }
          lastCom = com[0];
        }

        path += "afterPathDraw();";
        path += "curContext.translate(" + horiz_adv_x + ",0);";
        path += "}}";

        return ((new Function("beforePathDraw", "afterPathDraw", path))(beforePathDraw, afterPathDraw));
      };

      // Parse SVG font-file into block of Canvas commands
      var parseSVGFont = function(svg) {
        // Store font attributes
        var font = svg.getElementsByTagName("font");
        p.glyphTable[url].horiz_adv_x = font[0].getAttribute("horiz-adv-x");

        var font_face = svg.getElementsByTagName("font-face")[0];
        p.glyphTable[url].units_per_em = parseFloat(font_face.getAttribute("units-per-em"));
        p.glyphTable[url].ascent = parseFloat(font_face.getAttribute("ascent"));
        p.glyphTable[url].descent = parseFloat(font_face.getAttribute("descent"));

        var glyph = svg.getElementsByTagName("glyph"),
          len = glyph.length;

        // Loop through each glyph in the SVG
        for (var i = 0; i < len; i++) {
          // Store attributes for this glyph
          var unicode = glyph[i].getAttribute("unicode");
          var name = glyph[i].getAttribute("glyph-name");
          horiz_adv_x = glyph[i].getAttribute("horiz-adv-x");
          if (horiz_adv_x === null) {
            horiz_adv_x = p.glyphTable[url].horiz_adv_x;
          }
          d = glyph[i].getAttribute("d");
          // Split path commands in glpyh
          if (d !== undef) {
            path = buildPath(d);
            // Store glyph data to table object
            p.glyphTable[url][name] = {
              name: name,
              unicode: unicode,
              horiz_adv_x: horiz_adv_x,
              draw: path.draw
            };
          }
        } // finished adding glyphs to table
      };

      // Load and parse Batik SVG font as XML into a Processing Glyph object
      var loadXML = function() {
        var xmlDoc;

        try {
          xmlDoc = document.implementation.createDocument("", "", null);
        }
        catch(e_fx_op) {
          Processing.debug(e_fx_op.message);
          return;
        }

        try {
          xmlDoc.async = false;
          xmlDoc.load(url);
          parseSVGFont(xmlDoc.getElementsByTagName("svg")[0]);
        }
        catch(e_sf_ch) {
          // Google Chrome, Safari etc.
          Processing.debug(e_sf_ch);
          try {
            var xmlhttp = new window.XMLHttpRequest();
            xmlhttp.open("GET", url, false);
            xmlhttp.send(null);
            parseSVGFont(xmlhttp.responseXML.documentElement);
          }
          catch(e) {
            Processing.debug(e_sf_ch);
          }
        }
      };

      // Create a new object in glyphTable to store this font
      p.glyphTable[url] = {};

      // Begin loading the Batik SVG font...
      loadXML(url);

      // Return the loaded font for attribute grabbing
      return p.glyphTable[url];
    };

    /**
     * Gets the sketch parameter value. The parameter can be defined as the canvas attribute with
     * the "data-processing-" prefix or provided in the pjs directive (e.g. param-test="52").
     * The function tries the canvas attributes, then the pjs directive content.
     *
     * @param   {String}    name          The name of the param to read.
     *
     * @returns {String}    The parameter value, or null if parameter is not defined.
     */
    p.param = function(name) {
      // trying attribute that was specified in CANVAS
      var attributeName = "data-processing-" + name;
      if (curElement.hasAttribute(attributeName)) {
        return curElement.getAttribute(attributeName);
      }
      // trying child PARAM elements of the CANVAS
      for (var i = 0, len = curElement.childNodes.length; i < len; ++i) {
        var item = curElement.childNodes.item(i);
        if (item.nodeType !== 1 || item.tagName.toLowerCase() !== "param") {
          continue;
        }
        if (item.getAttribute("name") === name) {
          return item.getAttribute("value");
        }
      }
      // fallback to default params
      if (curSketch.params.hasOwnProperty(name)) {
        return curSketch.params[name];
      }
      return null;
    };

    ////////////////////////////////////////////////////////////////////////////
    // 2D/3D methods wiring utils
    ////////////////////////////////////////////////////////////////////////////
    function wireDimensionalFunctions(mode) {
      // Drawing2D
      if (mode === '2D') {
        drawing = new Drawing2D();
      } else {
        drawing = new DrawingPre();
      }

      // Wire up functions (Use DrawingPre properties names)
      for (var i in DrawingPre.prototype) {
        if (DrawingPre.prototype.hasOwnProperty(i) && i.indexOf("$") < 0) {
          p[i] = drawing[i];
        }
      }

      // Run initialization
      drawing.$init();
    }

    function createDrawingPreFunction(name) {
      return function() {
        wireDimensionalFunctions("2D");
        return drawing[name].apply(this, arguments);
      };
    }
    DrawingPre.prototype.translate = createDrawingPreFunction("translate");
    DrawingPre.prototype.scale = createDrawingPreFunction("scale");
    DrawingPre.prototype.pushMatrix = createDrawingPreFunction("pushMatrix");
    DrawingPre.prototype.popMatrix = createDrawingPreFunction("popMatrix");
    DrawingPre.prototype.resetMatrix = createDrawingPreFunction("resetMatrix");
    DrawingPre.prototype.applyMatrix = createDrawingPreFunction("applyMatrix");
    DrawingPre.prototype.rotate = createDrawingPreFunction("rotate");
    DrawingPre.prototype.rotateZ = createDrawingPreFunction("rotateZ");
    DrawingPre.prototype.redraw = createDrawingPreFunction("redraw");
    DrawingPre.prototype.toImageData = createDrawingPreFunction("toImageData");
    DrawingPre.prototype.ambientLight = createDrawingPreFunction("ambientLight");
    DrawingPre.prototype.directionalLight = createDrawingPreFunction("directionalLight");
    DrawingPre.prototype.lightFalloff = createDrawingPreFunction("lightFalloff");
    DrawingPre.prototype.lightSpecular = createDrawingPreFunction("lightSpecular");
    DrawingPre.prototype.pointLight = createDrawingPreFunction("pointLight");
    DrawingPre.prototype.noLights = createDrawingPreFunction("noLights");
    DrawingPre.prototype.spotLight = createDrawingPreFunction("spotLight");
    DrawingPre.prototype.beginCamera = createDrawingPreFunction("beginCamera");
    DrawingPre.prototype.endCamera = createDrawingPreFunction("endCamera");
    DrawingPre.prototype.frustum = createDrawingPreFunction("frustum");
    DrawingPre.prototype.box = createDrawingPreFunction("box");
    DrawingPre.prototype.sphere = createDrawingPreFunction("sphere");
    DrawingPre.prototype.ambient = createDrawingPreFunction("ambient");
    DrawingPre.prototype.emissive = createDrawingPreFunction("emissive");
    DrawingPre.prototype.shininess = createDrawingPreFunction("shininess");
    DrawingPre.prototype.specular = createDrawingPreFunction("specular");
    DrawingPre.prototype.fill = createDrawingPreFunction("fill");
    DrawingPre.prototype.stroke = createDrawingPreFunction("stroke");
    DrawingPre.prototype.strokeWeight = createDrawingPreFunction("strokeWeight");
    DrawingPre.prototype.smooth = createDrawingPreFunction("smooth");
    DrawingPre.prototype.noSmooth = createDrawingPreFunction("noSmooth");
    DrawingPre.prototype.point = createDrawingPreFunction("point");
    DrawingPre.prototype.vertex = createDrawingPreFunction("vertex");
    DrawingPre.prototype.endShape = createDrawingPreFunction("endShape");
    DrawingPre.prototype.bezierVertex = createDrawingPreFunction("bezierVertex");
    DrawingPre.prototype.curveVertex = createDrawingPreFunction("curveVertex");
    DrawingPre.prototype.curve = createDrawingPreFunction("curve");
    DrawingPre.prototype.line = createDrawingPreFunction("line");
    DrawingPre.prototype.bezier = createDrawingPreFunction("bezier");
    DrawingPre.prototype.rect = createDrawingPreFunction("rect");
    DrawingPre.prototype.ellipse = createDrawingPreFunction("ellipse");
    DrawingPre.prototype.background = createDrawingPreFunction("background");
    DrawingPre.prototype.image = createDrawingPreFunction("image");
    DrawingPre.prototype.textWidth = createDrawingPreFunction("textWidth");
    DrawingPre.prototype.text$line = createDrawingPreFunction("text$line");
    DrawingPre.prototype.$ensureContext = createDrawingPreFunction("$ensureContext");
    DrawingPre.prototype.$newPMatrix = createDrawingPreFunction("$newPMatrix");

    DrawingPre.prototype.size = function(aWidth, aHeight, aMode) {
      wireDimensionalFunctions(aMode === PConstants.WEBGL ? "3D" : "2D");
      p.size(aWidth, aHeight, aMode);
    };

    DrawingPre.prototype.$init = nop;

    Drawing2D.prototype.$init = function() {
      // Setup default 2d canvas context.
      // Moving this here removes the number of times we need to check the 3D variable
      p.size(p.width, p.height);

      curContext.lineCap = 'round';

      // Set default stroke and fill color
      p.noSmooth();
      p.disableContextMenu();
    };

    DrawingShared.prototype.$ensureContext = function() {
      return curContext;
    };

    //////////////////////////////////////////////////////////////////////////
    // Touch and Mouse event handling
    //////////////////////////////////////////////////////////////////////////

    function calculateOffset(curElement, event) {
      var element = curElement,
        offsetX = 0,
        offsetY = 0;

      p.pmouseX = p.mouseX;
      p.pmouseY = p.mouseY;

      // Find element offset
      if (element.offsetParent) {
        do {
          offsetX += element.offsetLeft;
          offsetY += element.offsetTop;
        } while (!!(element = element.offsetParent));
      }

      // Find Scroll offset
      element = curElement;
      do {
        offsetX -= element.scrollLeft || 0;
        offsetY -= element.scrollTop || 0;
      } while (!!(element = element.parentNode));

      // Add padding and border style widths to offset
      offsetX += stylePaddingLeft;
      offsetY += stylePaddingTop;

      offsetX += styleBorderLeft;
      offsetY += styleBorderTop;

      // Take into account any scrolling done
      offsetX += window.pageXOffset;
      offsetY += window.pageYOffset;

      return {'X':offsetX,'Y':offsetY};
    }

    function updateMousePosition(curElement, event) {
      var offset = calculateOffset(curElement, event);

      // Dropping support for IE clientX and clientY, switching to pageX and pageY so we don't have to calculate scroll offset.
      // Removed in ticket #184. See rev: 2f106d1c7017fed92d045ba918db47d28e5c16f4
      p.mouseX = event.pageX - offset.X;
      p.mouseY = event.pageY - offset.Y;
    }

    // Return a TouchEvent with canvas-specific x/y co-ordinates
    function addTouchEventOffset(t) {
      var offset = calculateOffset(t.changedTouches[0].target, t.changedTouches[0]),
          i;

      for (i = 0; i < t.touches.length; i++) {
        var touch = t.touches[i];
        touch.offsetX = touch.pageX - offset.X;
        touch.offsetY = touch.pageY - offset.Y;
      }
      for (i = 0; i < t.targetTouches.length; i++) {
        var targetTouch = t.targetTouches[i];
        targetTouch.offsetX = targetTouch.pageX - offset.X;
        targetTouch.offsetY = targetTouch.pageY - offset.Y;
      }
      for (i = 0; i < t.changedTouches.length; i++) {
        var changedTouch = t.changedTouches[i];
        changedTouch.offsetX = changedTouch.pageX - offset.X;
        changedTouch.offsetY = changedTouch.pageY - offset.Y;
      }

      return t;
    }

    attachEventHandler(curElement, "touchstart", function (t) {
      // Removes unwanted behaviour of the canvas when touching canvas
      curElement.setAttribute("style","-webkit-user-select: none");
      curElement.setAttribute("onclick","void(0)");
      curElement.setAttribute("style","-webkit-tap-highlight-color:rgba(0,0,0,0)");
      // Loop though eventHandlers and remove mouse listeners
      for (var i=0, ehl=eventHandlers.length; i<ehl; i++) {
        var type = eventHandlers[i].type;
        // Have this function remove itself from the eventHandlers list too
        if (type === "mouseout" ||  type === "mousemove" ||
            type === "mousedown" || type === "mouseup" ||
            type === "DOMMouseScroll" || type === "mousewheel" || type === "touchstart") {
          detachEventHandler(eventHandlers[i]);
        }
      }

      // If there are any native touch events defined in the sketch, connect all of them
      // Otherwise, connect all of the emulated mouse events
      if (p.touchStart !== undef || p.touchMove !== undef ||
          p.touchEnd !== undef || p.touchCancel !== undef) {
        attachEventHandler(curElement, "touchstart", function(t) {
          if (p.touchStart !== undef) {
            t = addTouchEventOffset(t);
            p.touchStart(t);
          }
        });

        attachEventHandler(curElement, "touchmove", function(t) {
          if (p.touchMove !== undef) {
            t.preventDefault(); // Stop the viewport from scrolling
            t = addTouchEventOffset(t);
            p.touchMove(t);
          }
        });

        attachEventHandler(curElement, "touchend", function(t) {
          if (p.touchEnd !== undef) {
            t = addTouchEventOffset(t);
            p.touchEnd(t);
          }
        });

        attachEventHandler(curElement, "touchcancel", function(t) {
          if (p.touchCancel !== undef) {
            t = addTouchEventOffset(t);
            p.touchCancel(t);
          }
        });

      } else {
        // Emulated touch start/mouse down event
        attachEventHandler(curElement, "touchstart", function(e) {
          updateMousePosition(curElement, e.touches[0]);

          // XXX(jeresig): Added mouseIsPressed/keyIsPressed
          p.mouseIsPressed = p.__mousePressed = true;
          p.mouseDragging = false;
          p.mouseButton = PConstants.LEFT;

          if (typeof p.mousePressed === "function") {
            p.mousePressed();
          }
        });

        // Emulated touch move/mouse move event
        attachEventHandler(curElement, "touchmove", function(e) {
          e.preventDefault();
          updateMousePosition(curElement, e.touches[0]);

          if (typeof p.mouseMoved === "function" && !p.__mousePressed) {
            p.mouseMoved();
          }
          if (typeof p.mouseDragged === "function" && p.__mousePressed) {
            p.mouseDragged();
            p.mouseDragging = true;
          }
        });

        // Emulated touch up/mouse up event
        attachEventHandler(curElement, "touchend", function(e) {
          p.__mousePressed = false;

          if (typeof p.mouseClicked === "function" && !p.mouseDragging) {
            p.mouseClicked();
          }

          if (typeof p.mouseReleased === "function") {
            p.mouseReleased();
          }
        });
      }

      // Refire the touch start event we consumed in this function
      curElement.dispatchEvent(t);
    });

    (function() {
      var enabled = true,
          contextMenu = function(e) {
            e.preventDefault();
            e.stopPropagation();
          };

      p.disableContextMenu = function() {
        if (!enabled) {
          return;
        }
        attachEventHandler(curElement, 'contextmenu', contextMenu);
        enabled = false;
      };

      p.enableContextMenu = function() {
        if (enabled) {
          return;
        }
        detachEventHandler({elem: curElement, type: 'contextmenu', fn: contextMenu});
        enabled = true;
      };
    }());

    attachEventHandler(curElement, "mousemove", function(e) {
      updateMousePosition(curElement, e);
      if (typeof p.mouseMoved === "function" && !p.__mousePressed) {
        p.mouseMoved();
      }
      if (typeof p.mouseDragged === "function" && p.__mousePressed) {
        p.mouseDragged();
        p.mouseDragging = true;
      }
    });

    attachEventHandler(curElement, "mouseout", function(e) {
      if (typeof p.mouseOut === "function") {
        p.mouseOut();
      }
    });

    attachEventHandler(curElement, "mouseover", function(e) {
      updateMousePosition(curElement, e);
      if (typeof p.mouseOver === "function") {
        p.mouseOver();
      }
    });

    attachEventHandler(curElement, "mousedown", function(e) {
      // XXX(jeresig): Added mouseIsPressed/keyIsPressed
      p.mouseIsPressed = p.__mousePressed = true;
      p.mouseDragging = false;
      switch (e.which) {
      case 1:
        p.mouseButton = PConstants.LEFT;
        break;
      case 2:
        p.mouseButton = PConstants.CENTER;
        break;
      case 3:
        p.mouseButton = PConstants.RIGHT;
        break;
      }

      if (typeof p.mousePressed === "function") {
        p.mousePressed();
      }
    });

    attachEventHandler(curElement, "mouseup", function(e) {
      p.__mousePressed = false;

      if (typeof p.mouseClicked === "function" && !p.mouseDragging) {
        p.mouseClicked();
      }

      if (typeof p.mouseReleased === "function") {
        p.mouseReleased();
      }
    });

    var mouseWheelHandler = function(e) {
      var delta = 0;

      if (e.wheelDelta) {
        delta = e.wheelDelta / 120;
        if (window.opera) {
          delta = -delta;
        }
      } else if (e.detail) {
        delta = -e.detail / 3;
      }

      p.mouseScroll = delta;

      if (delta && typeof p.mouseScrolled === 'function') {
        p.mouseScrolled();
      }
    };

    // Support Gecko and non-Gecko scroll events
    attachEventHandler(document, 'DOMMouseScroll', mouseWheelHandler);
    attachEventHandler(document, 'mousewheel', mouseWheelHandler);

    //////////////////////////////////////////////////////////////////////////
    // Keyboard Events
    //////////////////////////////////////////////////////////////////////////

    // Get the DOM element if string was passed
    if (typeof curElement === "string") {
      curElement = document.getElementById(curElement);
    }

    // In order to catch key events in a canvas, it needs to be "specially focusable",
    // by assigning it a tabindex. If no tabindex is specified on-page, set this to 0.
    if (!curElement.getAttribute("tabindex")) {
      curElement.setAttribute("tabindex", 0);
    }

    function getKeyCode(e) {
      var code = e.which || e.keyCode;
      switch (code) {
        case 13: // ENTER
          return 10;
        case 91: // META L (Saf/Mac)
        case 93: // META R (Saf/Mac)
        case 224: // META (FF/Mac)
          return 157;
        case 57392: // CONTROL (Op/Mac)
          return 17;
        case 46: // DELETE
          return 127;
        case 45: // INSERT
          return 155;
      }
      return code;
    }

    function getKeyChar(e) {
      var c = e.which || e.keyCode;
      var anyShiftPressed = e.shiftKey || e.ctrlKey || e.altKey || e.metaKey;
      switch (c) {
        case 13:
          c = anyShiftPressed ? 13 : 10; // RETURN vs ENTER (Mac)
          break;
        case 8:
          c = anyShiftPressed ? 127 : 8; // DELETE vs BACKSPACE (Mac)
          break;
      }
      return new Char(c);
    }

    function suppressKeyEvent(e) {
      if (typeof e.preventDefault === "function") {
        e.preventDefault();
      } else if (typeof e.stopPropagation === "function") {
        e.stopPropagation();
      }
      return false;
    }

    function updateKeyPressed() {
      var ch;
      for (ch in pressedKeysMap) {
        if (pressedKeysMap.hasOwnProperty(ch)) {
          // XXX(jeresig): Added mouseIsPressed/keyIsPressed
          p.keyIsPressed = p.__keyPressed = true;
          return;
        }
      }
      // XXX(jeresig): Added mouseIsPressed/keyIsPressed
      p.keyIsPressed = p.__keyPressed = false;
    }

    function resetKeyPressed() {
      // XXX(jeresig): Added mouseIsPressed/keyIsPressed
      p.keyIsPressed = p.__keyPressed = false;
      pressedKeysMap = [];
      lastPressedKeyCode = null;
    }

    function simulateKeyTyped(code, c) {
      pressedKeysMap[code] = c;
      lastPressedKeyCode = null;
      p.key = c;
      p.keyCode = code;
      p.keyPressed();
      if (!p.__usingDebugger) {
        p.keyCode = 0;
        // When the debugger is in use all callbacks are queued and thus not
        // run synchronously therefore, setting keyCode = 0; immediatedly as 
        // it is without this check results keyCode being 0 when keyPressed()
        // is finally run which is not the behaviour we want.
        // The ProcessingDebugger sets keyCode to 0 right before it calls 
        // keyTyped().
        // https://github.com/kevinb7/stepper/blob/master/src/processing-debugger.ts#L41-L43
      }
      p.keyTyped();
      updateKeyPressed();
    }

    function handleKeydown(e) {
      var code = getKeyCode(e);
      if (code === PConstants.DELETE || code === PConstants.BACKSPACE) {
        simulateKeyTyped(code, new Char(code));
        return suppressKeyEvent(e);
      }
      if (codedKeys.indexOf(code) < 0) {
        lastPressedKeyCode = code;
        return;
      }
      var c = new Char(PConstants.CODED);
      p.key = c;
      p.keyCode = code;
      pressedKeysMap[code] = c;
      p.keyPressed();
      lastPressedKeyCode = null;
      updateKeyPressed();
      return suppressKeyEvent(e);
    }

    function handleKeypress(e) {
      if (lastPressedKeyCode === null) {
        return; // processed in handleKeydown
      }
      var code = lastPressedKeyCode, c = getKeyChar(e);
      simulateKeyTyped(code, c);
      return suppressKeyEvent(e);
    }

    function handleKeyup(e) {
      var code = getKeyCode(e), c = pressedKeysMap[code];
      if (c === undef) {
        return; // no keyPressed event was generated.
      }
      p.key = c;
      p.keyCode = code;
      p.keyReleased();
      delete pressedKeysMap[code];
      updateKeyPressed();
    }

    // Send aCode Processing syntax to be converted to JavaScript
    if (!pgraphicsMode) {
      if (aCode instanceof Processing.Sketch) {
        // Use sketch as is
        curSketch = aCode;
      } else if (typeof aCode === "function") {
        // Wrap function with default sketch parameters
        curSketch = new Processing.Sketch(aCode);
      } else if (!aCode) {
        // Empty sketch
        curSketch = new Processing.Sketch(function (){});
      } else {
//#if PARSER
        // Compile the code
        curSketch = Processing.compile(aCode);
//#else
//      throw "PJS compile is not supported";
//#endif
      }

      // Expose internal field for diagnostics and testing
      p.externals.sketch = curSketch;

      wireDimensionalFunctions();

      // the onfocus and onblur events are handled in two parts.
      // 1) the p.focused property is handled per sketch
      curElement.onfocus = function() {
        p.focused = true;
      };

      curElement.onblur = function() {
        p.focused = false;
        if (!curSketch.options.globalKeyEvents) {
          resetKeyPressed();
        }
      };

      // 2) looping status is handled per page, based on the pauseOnBlur @pjs directive
      if (curSketch.options.pauseOnBlur) {
        attachEventHandler(window, 'focus', function() {
          if (doLoop) {
            p.loop();
          }
        });

        attachEventHandler(window, 'blur', function() {
          if (doLoop && loopStarted) {
            p.noLoop();
            doLoop = true; // make sure to keep this true after the noLoop call
          }
          resetKeyPressed();
        });
      }

      // if keyboard events should be handled globally, the listeners should
      // be bound to the document window, rather than to the current canvas
      var keyTrigger = curSketch.options.globalKeyEvents ? window : curElement;
      attachEventHandler(keyTrigger, "keydown", handleKeydown);
      attachEventHandler(keyTrigger, "keypress", handleKeypress);
      attachEventHandler(keyTrigger, "keyup", handleKeyup);

      // Step through the libraries that were attached at doc load...
      for (var i in Processing.lib) {
        if (Processing.lib.hasOwnProperty(i)) {
          if(Processing.lib[i].hasOwnProperty("attach")) {
            // use attach function if present
            Processing.lib[i].attach(p);
          } else if(Processing.lib[i] instanceof Function)  {
            // Init the libraries in the context of this p_instance (legacy)
            Processing.lib[i].call(this);
          }
        }
      }

      // sketch execute test interval, used to reschedule
      // an execute when preloads have not yet finished.
      var retryInterval = 100;

      var executeSketch = function(processing) {
        // Don't start until all specified images and fonts in the cache are preloaded
        if (!(curSketch.imageCache.pending || PFont.preloading.pending(retryInterval))) {
          // the opera preload cache can only be cleared once we start
          if (window.opera) {
            var link,
                element,
                operaCache=curSketch.imageCache.operaCache;
            for (link in operaCache) {
              if(operaCache.hasOwnProperty(link)) {
                element = operaCache[link];
                if (element !== null) {
                  document.body.removeChild(element);
                }
                delete(operaCache[link]);
              }
            }
          }

          curSketch.attach(processing, defaultScope);

          // pass a reference to the p instance for this sketch.
          curSketch.onLoad(processing);

          // Run void setup()
          if (processing.setup) {
            processing.setup();
            // if any transforms were performed in setup reset to identity matrix
            // so draw loop is unpolluted
            processing.resetMatrix();
            curSketch.onSetup();
          }

          // some pixels can be cached, flushing
          resetContext();

          if (processing.draw) {
            if (!doLoop) {
              processing.redraw();
            } else {
              processing.loop();
            }
          }
        } else {
          window.setTimeout(function() { executeSketch(processing); }, retryInterval);
        }
      };

      // Only store an instance of non-createGraphics instances.
      addInstance(this);

      // The parser adds custom methods to the processing context
      // this renames p to processing so these methods will run
      executeSketch(p);
    } else {
      // No executable sketch was specified
      // or called via createGraphics
      curSketch = new Processing.Sketch();

      wireDimensionalFunctions();

      // Hack to make PGraphics work again after splitting size()
      p.size = function(w, h, render) {
        if (render && render === PConstants.WEBGL) {
          wireDimensionalFunctions('3D');
        } else {
          wireDimensionalFunctions('2D');
        }

        p.size(w, h, render);
      };
    }
  }; // Processing() ends

  // Place-holder for overridable debugging function
  Processing.debug = debug;

  Processing.prototype = defaultScope;

  // tinylog lite JavaScript library
  // http://purl.eligrey.com/tinylog/lite
  /*global tinylog,print*/
  var tinylogLite = (function() {
    "use strict";

    var tinylogLite = {},
      undef = "undefined",
      func = "function",
      False = !1,
      True = !0,
      logLimit = 512,
      log = "log";

    if (typeof tinylog !== undef && typeof tinylog[log] === func) {
      // pre-existing tinylog present
      tinylogLite[log] = tinylog[log];
    } else if (typeof document !== undef && !document.fake) {
      (function() {
        // DOM document
        var doc = document,

        $div = "div",
        $style = "style",
        $title = "title",

        containerStyles = {
          zIndex: 10000,
          position: "fixed",
          bottom: "0px",
          width: "100%",
          height: "15%",
          fontFamily: "sans-serif",
          color: "#ccc",
          backgroundColor: "black",
          paddingBottom: "5px"
        },
        outputStyles = {
          position: "relative",
          fontFamily: "monospace",
          overflow: "auto",
          height: "100%",
          paddingTop: "5px"
        },
        resizerStyles = {
          height: "5px",
          marginTop: "-5px",
          cursor: "n-resize",
          backgroundColor: "darkgrey"
        },
        closeButtonStyles = {
          position: "absolute",
          top: "5px",
          right: "20px",
          color: "#111",
          MozBorderRadius: "4px",
          webkitBorderRadius: "4px",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "normal",
          textAlign: "center",
          padding: "3px 5px",
          backgroundColor: "#333",
          fontSize: "12px"
        },
        entryStyles = {
          //borderBottom: "1px solid #d3d3d3",
          minHeight: "16px"
        },
        entryTextStyles = {
          fontSize: "12px",
          margin: "0 8px 0 8px",
          maxWidth: "100%",
          whiteSpace: "pre-wrap",
          overflow: "auto"
        },

        view = doc.defaultView,
          docElem = doc.body || doc.documentElement,
          docElemStyle = docElem[$style],

        setStyles = function() {
          var i = arguments.length,
            elemStyle, styles, style;

          while (i--) {
            styles = arguments[i--];
            elemStyle = arguments[i][$style];

            for (style in styles) {
              if (styles.hasOwnProperty(style)) {
                elemStyle[style] = styles[style];
              }
            }
          }
        },

        observer = function(obj, event, handler) {
          if (obj.addEventListener) {
            obj.addEventListener(event, handler, False);
          } else if (obj.attachEvent) {
            obj.attachEvent("on" + event, handler);
          }
          return [obj, event, handler];
        },
        unobserve = function(obj, event, handler) {
          if (obj.removeEventListener) {
            obj.removeEventListener(event, handler, False);
          } else if (obj.detachEvent) {
            obj.detachEvent("on" + event, handler);
          }
        },
        clearChildren = function(node) {
          var children = node.childNodes,
            child = children.length;

          while (child--) {
            node.removeChild(children.item(0));
          }
        },
        append = function(to, elem) {
          return to.appendChild(elem);
        },
        createElement = function(localName) {
          return doc.createElement(localName);
        },
        createTextNode = function(text) {
          return doc.createTextNode(text);
        },

        createLog = tinylogLite[log] = function(message) {
          // don't show output log until called once
          var uninit,
            originalPadding = docElemStyle.paddingBottom,
            container = createElement($div),
            containerStyle = container[$style],
            resizer = append(container, createElement($div)),
            output = append(container, createElement($div)),
            closeButton = append(container, createElement($div)),
            resizingLog = False,
            previousHeight = False,
            previousScrollTop = False,
            messages = 0,

            updateSafetyMargin = function() {
              // have a blank space large enough to fit the output box at the page bottom
              docElemStyle.paddingBottom = container.clientHeight + "px";
            },
            setContainerHeight = function(height) {
              var viewHeight = view.innerHeight,
                resizerHeight = resizer.clientHeight;

              // constrain the container inside the viewport's dimensions
              if (height < 0) {
                height = 0;
              } else if (height + resizerHeight > viewHeight) {
                height = viewHeight - resizerHeight;
              }

              containerStyle.height = height / viewHeight * 100 + "%";

              updateSafetyMargin();
            },
            observers = [
              observer(doc, "mousemove", function(evt) {
                if (resizingLog) {
                  setContainerHeight(view.innerHeight - evt.clientY);
                  output.scrollTop = previousScrollTop;
                }
              }),

              observer(doc, "mouseup", function() {
                if (resizingLog) {
                  resizingLog = previousScrollTop = False;
                }
              }),

              observer(resizer, "dblclick", function(evt) {
                evt.preventDefault();

                if (previousHeight) {
                  setContainerHeight(previousHeight);
                  previousHeight = False;
                } else {
                  previousHeight = container.clientHeight;
                  containerStyle.height = "0px";
                }
              }),

              observer(resizer, "mousedown", function(evt) {
                evt.preventDefault();
                resizingLog = True;
                previousScrollTop = output.scrollTop;
              }),

              observer(resizer, "contextmenu", function() {
                resizingLog = False;
              }),

              observer(closeButton, "click", function() {
                uninit();
              })
            ];

          uninit = function() {
            // remove observers
            var i = observers.length;

            while (i--) {
              unobserve.apply(tinylogLite, observers[i]);
            }

            // remove tinylog lite from the DOM
            docElem.removeChild(container);
            docElemStyle.paddingBottom = originalPadding;

            clearChildren(output);
            clearChildren(container);

            tinylogLite[log] = createLog;
          };

          setStyles(
          container, containerStyles, output, outputStyles, resizer, resizerStyles, closeButton, closeButtonStyles);

          closeButton[$title] = "Close Log";
          append(closeButton, createTextNode("\u2716"));

          resizer[$title] = "Double-click to toggle log minimization";

          docElem.insertBefore(container, docElem.firstChild);

          tinylogLite[log] = function(message) {
            if (messages === logLimit) {
              output.removeChild(output.firstChild);
            } else {
              messages++;
            }

            var entry = append(output, createElement($div)),
              entryText = append(entry, createElement($div));

            entry[$title] = (new Date()).toLocaleTimeString();

            setStyles(
            entry, entryStyles, entryText, entryTextStyles);

            append(entryText, createTextNode(message));
            output.scrollTop = output.scrollHeight;
          };

          tinylogLite.clear = function() {
            messages = 0;
            clearChildren(output);
          };

          tinylogLite[log](message);
          updateSafetyMargin();
        };
      }());
    } else if (typeof print === func) { // JS shell
      tinylogLite[log] = print;
    }

    return tinylogLite;
  }());
  // end of tinylog lite JavaScript library

  Processing.logger = tinylogLite;

  Processing.version = "@VERSION@";

  // Share lib space
  Processing.lib = {};

  Processing.registerLibrary = function(name, desc) {
    Processing.lib[name] = desc;

    if(desc.hasOwnProperty("init")) {
      desc.init(defaultScope);
    }
  };

  // Store Processing instances. Only Processing.instances,
  // Processing.getInstanceById are exposed.
  Processing.instances = processingInstances;

  Processing.getInstanceById = function(name) {
    return processingInstances[processingInstanceIds[name]];
  };

  Processing.Sketch = function(attachFunction) {
    this.attachFunction = attachFunction; // can be optional
    this.options = {
      pauseOnBlur: false,
      globalKeyEvents: false
    };

    /* Optional Sketch event hooks:
     *   onLoad - parsing/preloading is done, before sketch starts
     *   onSetup - setup() has been called, before first draw()
     *   onPause - noLoop() has been called, pausing draw loop
     *   onLoop - loop() has been called, resuming draw loop
     *   onFrameStart - draw() loop about to begin
     *   onFrameEnd - draw() loop finished
     *   onExit - exit() done being called
     */
    this.onLoad = nop;
    this.onSetup = nop;
    this.onPause = nop;
    this.onLoop = nop;
    this.onFrameStart = nop;
    this.onFrameEnd = nop;
    this.onExit = nop;

    this.params = {};
    this.imageCache = {
      pending: 0,
      images: {},
      // Opera requires special administration for preloading
      operaCache: {},
      // Specify an optional img arg if the image is already loaded in the DOM,
      // otherwise href will get loaded.
      add: function(href, img) {
        // Prevent muliple loads for an image, in case it gets
        // preloaded more than once, or is added via JS and then preloaded.
        if (this.images[href]) {
          return;
        }

        if (!isDOMPresent) {
          this.images[href] = null;
        }

        // No image in the DOM, kick-off a background load
        if (!img) {
          img = new Image();
          img.onload = (function(owner) {
            return function() {
              owner.pending--;
            };
          }(this));
          this.pending++;
          img.src = href;
        }

        this.images[href] = img;

        // Opera will not load images until they are inserted into the DOM.
        if (window.opera) {
          var div = document.createElement("div");
          div.appendChild(img);
          // we can't use "display: none", since that makes it invisible, and thus not load
          div.style.position = "absolute";
          div.style.opacity = 0;
          div.style.width = "1px";
          div.style.height= "1px";
          if (!this.operaCache[href]) {
            document.body.appendChild(div);
            this.operaCache[href] = div;
          }
        }
      }
    };
    this.sourceCode = undefined;
    this.attach = function(processing) {
      // either attachFunction or sourceCode must be present on attach
      if(typeof this.attachFunction === "function") {
        this.attachFunction(processing);
      } else if(this.sourceCode) {
        var func = ((new Function("return (" + this.sourceCode + ");"))());
        func(processing);
        this.attachFunction = func;
      } else {
        throw "Unable to attach sketch to the processing instance";
      }
    };
//#if PARSER
    this.toString = function() {
      var i;
      var code = "((function(Sketch) {\n";
      code += "var sketch = new Sketch(\n" + this.sourceCode + ");\n";
      for(i in this.options) {
        if(this.options.hasOwnProperty(i)) {
          var value = this.options[i];
          code += "sketch.options." + i + " = " +
            (typeof value === 'string' ? '\"' + value + '\"' : "" + value) + ";\n";
        }
      }
      for(i in this.imageCache) {
        if(this.options.hasOwnProperty(i)) {
          code += "sketch.imageCache.add(\"" + i + "\");\n";
        }
      }
      // TODO serialize fonts
      code += "return sketch;\n})(Processing.Sketch))";
      return code;
    };
//#endif
  };

//#if PARSER
  /**
   * aggregate all source code into a single file, then rewrite that
   * source and bind to canvas via new Processing(canvas, sourcestring).
   * @param {CANVAS} canvas The html canvas element to bind to
   * @param {String[]} source The array of files that must be loaded
   */
  var loadSketchFromSources = function(canvas, sources) {
    var code = [], errors = [], sourcesCount = sources.length, loaded = 0;

    function ajaxAsync(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          var error;
          if (xhr.status !== 200 && xhr.status !== 0) {
            error = "Invalid XHR status " + xhr.status;
          } else if (xhr.responseText === "") {
            // Give a hint when loading fails due to same-origin issues on file:/// urls
            if ( ("withCredentials" in new XMLHttpRequest()) &&
                 (new XMLHttpRequest()).withCredentials === false &&
                 window.location.protocol === "file:" ) {
              error = "XMLHttpRequest failure, possibly due to a same-origin policy violation. You can try loading this page in another browser, or load it from http://localhost using a local webserver. See the Processing.js README for a more detailed explanation of this problem and solutions.";
            } else {
              error = "File is empty.";
            }
          }

          callback(xhr.responseText, error);
        }
      };
      xhr.open("GET", url, true);
      if (xhr.overrideMimeType) {
        xhr.overrideMimeType("application/json");
      }
      xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT"); // no cache
      xhr.send(null);
    }

    function loadBlock(index, filename) {
      function callback(block, error) {
        code[index] = block;
        ++loaded;
        if (error) {
          errors.push(filename + " ==> " + error);
        }
        if (loaded === sourcesCount) {
          if (errors.length === 0) {
            try {
              return new Processing(canvas, code.join("\n"));
            } catch(e) {
              throw "Processing.js: Unable to execute pjs sketch: " + e;
            }
          } else {
            throw "Processing.js: Unable to load pjs sketch files: " + errors.join("\n");
          }
        }
      }
      if (filename.charAt(0) === '#') {
        // trying to get script from the element
        var scriptElement = document.getElementById(filename.substring(1));
        if (scriptElement) {
          callback(scriptElement.text || scriptElement.textContent);
        } else {
          callback("", "Unable to load pjs sketch: element with id \'" + filename.substring(1) + "\' was not found");
        }
        return;
      }

      ajaxAsync(filename, callback);
    }

    for (var i = 0; i < sourcesCount; ++i) {
      loadBlock(i, sources[i]);
    }
  };

  /**
   * Automatic initialization function.
   */
  var init = function() {
    document.removeEventListener('DOMContentLoaded', init, false);

    var canvas = document.getElementsByTagName('canvas'),
      filenames;

    for (var i = 0, l = canvas.length; i < l; i++) {
      // datasrc and data-src are deprecated.
      var processingSources = canvas[i].getAttribute('data-processing-sources');
      if (processingSources === null) {
        // Temporary fallback for datasrc and data-src
        processingSources = canvas[i].getAttribute('data-src');
        if (processingSources === null) {
          processingSources = canvas[i].getAttribute('datasrc');
        }
      }
      if (processingSources) {
        filenames = processingSources.split(' ');
        for (var j = 0; j < filenames.length;) {
          if (filenames[j]) {
            j++;
          } else {
            filenames.splice(j, 1);
          }
        }
        loadSketchFromSources(canvas[i], filenames);
      }
    }

    // also process all <script>-indicated sketches, if there are any
    var scripts = document.getElementsByTagName('script');
    var s, source, instance;
    for (s = 0; s < scripts.length; s++) {
      var script = scripts[s];
      if (!script.getAttribute) {
        continue;
      }

      var type = script.getAttribute("type");
      if (type && (type.toLowerCase() === "text/processing" || type.toLowerCase() === "application/processing")) {
        var target = script.getAttribute("data-processing-target");
        canvas = undef;
        if (target) {
          canvas = document.getElementById(target);
        } else {
          var nextSibling = script.nextSibling;
          while (nextSibling && nextSibling.nodeType !== 1) {
            nextSibling = nextSibling.nextSibling;
          }
          if (nextSibling.nodeName.toLowerCase() === "canvas") {
            canvas = nextSibling;
          }
        }

        if (canvas) {
          if (script.getAttribute("src")) {
            filenames = script.getAttribute("src").split(/\s+/);
            loadSketchFromSources(canvas, filenames);
            continue;
          }
          source =  script.textContent || script.text;
          instance = new Processing(canvas, source);
        }
      }
    }
  };

  /**
   * Make loadSketchFromSources publically visible
   */
  Processing.loadSketchFromSources = loadSketchFromSources;

  /**
   * Disable the automatic loading of all sketches on the page
   */
  Processing.disableInit = function() {
    if(isDOMPresent) {
      document.removeEventListener('DOMContentLoaded', init, false);
    }
  };
//#endif

  if(isDOMPresent) {
    window['Processing'] = Processing;
//#if PARSER
    document.addEventListener('DOMContentLoaded', init, false);
//#endif
  } else {
    // DOM is not found
    this.Processing = Processing;
  }
}(window, window.document, Math));

// 2.1.11
var JSHINT;
if (typeof window === 'undefined') window = {};
(function () {
var require;
require=(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],2:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":1}],3:[function(require,module,exports){
(function(){// jshint -W001

"use strict";

// Identifiers provided by the ECMAScript standard.

exports.reservedVars = {
  arguments : false,
  NaN       : false
};

exports.ecmaIdentifiers = {
  Array              : false,
  Boolean            : false,
  Date               : false,
  decodeURI          : false,
  decodeURIComponent : false,
  encodeURI          : false,
  encodeURIComponent : false,
  Error              : false,
  "eval"             : false,
  EvalError          : false,
  Function           : false,
  hasOwnProperty     : false,
  isFinite           : false,
  isNaN              : false,
  JSON               : false,
  Math               : false,
  Map                : false,
  Number             : false,
  Object             : false,
  parseInt           : false,
  parseFloat         : false,
  RangeError         : false,
  ReferenceError     : false,
  RegExp             : false,
  Set                : false,
  String             : false,
  SyntaxError        : false,
  TypeError          : false,
  URIError           : false,
  WeakMap            : false
};

// Global variables commonly provided by a web browser environment.

exports.browser = {
  Audio                : false,
  Blob                 : false,
  addEventListener     : false,
  applicationCache     : false,
  atob                 : false,
  blur                 : false,
  btoa                 : false,
  clearInterval        : false,
  clearTimeout         : false,
  close                : false,
  closed               : false,
  CustomEvent          : false,
  DOMParser            : false,
  defaultStatus        : false,
  document             : false,
  Element              : false,
  ElementTimeControl   : false,
  event                : false,
  FileReader           : false,
  FormData             : false,
  focus                : false,
  frames               : false,
  getComputedStyle     : false,
  HTMLElement          : false,
  HTMLAnchorElement    : false,
  HTMLBaseElement      : false,
  HTMLBlockquoteElement: false,
  HTMLBodyElement      : false,
  HTMLBRElement        : false,
  HTMLButtonElement    : false,
  HTMLCanvasElement    : false,
  HTMLDirectoryElement : false,
  HTMLDivElement       : false,
  HTMLDListElement     : false,
  HTMLFieldSetElement  : false,
  HTMLFontElement      : false,
  HTMLFormElement      : false,
  HTMLFrameElement     : false,
  HTMLFrameSetElement  : false,
  HTMLHeadElement      : false,
  HTMLHeadingElement   : false,
  HTMLHRElement        : false,
  HTMLHtmlElement      : false,
  HTMLIFrameElement    : false,
  HTMLImageElement     : false,
  HTMLInputElement     : false,
  HTMLIsIndexElement   : false,
  HTMLLabelElement     : false,
  HTMLLayerElement     : false,
  HTMLLegendElement    : false,
  HTMLLIElement        : false,
  HTMLLinkElement      : false,
  HTMLMapElement       : false,
  HTMLMenuElement      : false,
  HTMLMetaElement      : false,
  HTMLModElement       : false,
  HTMLObjectElement    : false,
  HTMLOListElement     : false,
  HTMLOptGroupElement  : false,
  HTMLOptionElement    : false,
  HTMLParagraphElement : false,
  HTMLParamElement     : false,
  HTMLPreElement       : false,
  HTMLQuoteElement     : false,
  HTMLScriptElement    : false,
  HTMLSelectElement    : false,
  HTMLStyleElement     : false,
  HTMLTableCaptionElement: false,
  HTMLTableCellElement : false,
  HTMLTableColElement  : false,
  HTMLTableElement     : false,
  HTMLTableRowElement  : false,
  HTMLTableSectionElement: false,
  HTMLTextAreaElement  : false,
  HTMLTitleElement     : false,
  HTMLUListElement     : false,
  HTMLVideoElement     : false,
  history              : false,
  Image                : false,
  length               : false,
  localStorage         : false,
  location             : false,
  MessageChannel       : false,
  MessageEvent         : false,
  MessagePort          : false,
  MouseEvent           : false,
  moveBy               : false,
  moveTo               : false,
  MutationObserver     : false,
  name                 : false,
  Node                 : false,
  NodeFilter           : false,
  navigator            : false,
  onbeforeunload       : true,
  onblur               : true,
  onerror              : true,
  onfocus              : true,
  onload               : true,
  onresize             : true,
  onunload             : true,
  open                 : false,
  openDatabase         : false,
  opener               : false,
  Option               : false,
  parent               : false,
  print                : false,
  removeEventListener  : false,
  resizeBy             : false,
  resizeTo             : false,
  screen               : false,
  scroll               : false,
  scrollBy             : false,
  scrollTo             : false,
  sessionStorage       : false,
  setInterval          : false,
  setTimeout           : false,
  SharedWorker         : false,
  status               : false,
  SVGAElement          : false,
  SVGAltGlyphDefElement: false,
  SVGAltGlyphElement   : false,
  SVGAltGlyphItemElement: false,
  SVGAngle             : false,
  SVGAnimateColorElement: false,
  SVGAnimateElement    : false,
  SVGAnimateMotionElement: false,
  SVGAnimateTransformElement: false,
  SVGAnimatedAngle     : false,
  SVGAnimatedBoolean   : false,
  SVGAnimatedEnumeration: false,
  SVGAnimatedInteger   : false,
  SVGAnimatedLength    : false,
  SVGAnimatedLengthList: false,
  SVGAnimatedNumber    : false,
  SVGAnimatedNumberList: false,
  SVGAnimatedPathData  : false,
  SVGAnimatedPoints    : false,
  SVGAnimatedPreserveAspectRatio: false,
  SVGAnimatedRect      : false,
  SVGAnimatedString    : false,
  SVGAnimatedTransformList: false,
  SVGAnimationElement  : false,
  SVGCSSRule           : false,
  SVGCircleElement     : false,
  SVGClipPathElement   : false,
  SVGColor             : false,
  SVGColorProfileElement: false,
  SVGColorProfileRule  : false,
  SVGComponentTransferFunctionElement: false,
  SVGCursorElement     : false,
  SVGDefsElement       : false,
  SVGDescElement       : false,
  SVGDocument          : false,
  SVGElement           : false,
  SVGElementInstance   : false,
  SVGElementInstanceList: false,
  SVGEllipseElement    : false,
  SVGExternalResourcesRequired: false,
  SVGFEBlendElement    : false,
  SVGFEColorMatrixElement: false,
  SVGFEComponentTransferElement: false,
  SVGFECompositeElement: false,
  SVGFEConvolveMatrixElement: false,
  SVGFEDiffuseLightingElement: false,
  SVGFEDisplacementMapElement: false,
  SVGFEDistantLightElement: false,
  SVGFEFloodElement    : false,
  SVGFEFuncAElement    : false,
  SVGFEFuncBElement    : false,
  SVGFEFuncGElement    : false,
  SVGFEFuncRElement    : false,
  SVGFEGaussianBlurElement: false,
  SVGFEImageElement    : false,
  SVGFEMergeElement    : false,
  SVGFEMergeNodeElement: false,
  SVGFEMorphologyElement: false,
  SVGFEOffsetElement   : false,
  SVGFEPointLightElement: false,
  SVGFESpecularLightingElement: false,
  SVGFESpotLightElement: false,
  SVGFETileElement     : false,
  SVGFETurbulenceElement: false,
  SVGFilterElement     : false,
  SVGFilterPrimitiveStandardAttributes: false,
  SVGFitToViewBox      : false,
  SVGFontElement       : false,
  SVGFontFaceElement   : false,
  SVGFontFaceFormatElement: false,
  SVGFontFaceNameElement: false,
  SVGFontFaceSrcElement: false,
  SVGFontFaceUriElement: false,
  SVGForeignObjectElement: false,
  SVGGElement          : false,
  SVGGlyphElement      : false,
  SVGGlyphRefElement   : false,
  SVGGradientElement   : false,
  SVGHKernElement      : false,
  SVGICCColor          : false,
  SVGImageElement      : false,
  SVGLangSpace         : false,
  SVGLength            : false,
  SVGLengthList        : false,
  SVGLineElement       : false,
  SVGLinearGradientElement: false,
  SVGLocatable         : false,
  SVGMPathElement      : false,
  SVGMarkerElement     : false,
  SVGMaskElement       : false,
  SVGMatrix            : false,
  SVGMetadataElement   : false,
  SVGMissingGlyphElement: false,
  SVGNumber            : false,
  SVGNumberList        : false,
  SVGPaint             : false,
  SVGPathElement       : false,
  SVGPathSeg           : false,
  SVGPathSegArcAbs     : false,
  SVGPathSegArcRel     : false,
  SVGPathSegClosePath  : false,
  SVGPathSegCurvetoCubicAbs: false,
  SVGPathSegCurvetoCubicRel: false,
  SVGPathSegCurvetoCubicSmoothAbs: false,
  SVGPathSegCurvetoCubicSmoothRel: false,
  SVGPathSegCurvetoQuadraticAbs: false,
  SVGPathSegCurvetoQuadraticRel: false,
  SVGPathSegCurvetoQuadraticSmoothAbs: false,
  SVGPathSegCurvetoQuadraticSmoothRel: false,
  SVGPathSegLinetoAbs  : false,
  SVGPathSegLinetoHorizontalAbs: false,
  SVGPathSegLinetoHorizontalRel: false,
  SVGPathSegLinetoRel  : false,
  SVGPathSegLinetoVerticalAbs: false,
  SVGPathSegLinetoVerticalRel: false,
  SVGPathSegList       : false,
  SVGPathSegMovetoAbs  : false,
  SVGPathSegMovetoRel  : false,
  SVGPatternElement    : false,
  SVGPoint             : false,
  SVGPointList         : false,
  SVGPolygonElement    : false,
  SVGPolylineElement   : false,
  SVGPreserveAspectRatio: false,
  SVGRadialGradientElement: false,
  SVGRect              : false,
  SVGRectElement       : false,
  SVGRenderingIntent   : false,
  SVGSVGElement        : false,
  SVGScriptElement     : false,
  SVGSetElement        : false,
  SVGStopElement       : false,
  SVGStringList        : false,
  SVGStylable          : false,
  SVGStyleElement      : false,
  SVGSwitchElement     : false,
  SVGSymbolElement     : false,
  SVGTRefElement       : false,
  SVGTSpanElement      : false,
  SVGTests             : false,
  SVGTextContentElement: false,
  SVGTextElement       : false,
  SVGTextPathElement   : false,
  SVGTextPositioningElement: false,
  SVGTitleElement      : false,
  SVGTransform         : false,
  SVGTransformList     : false,
  SVGTransformable     : false,
  SVGURIReference      : false,
  SVGUnitTypes         : false,
  SVGUseElement        : false,
  SVGVKernElement      : false,
  SVGViewElement       : false,
  SVGViewSpec          : false,
  SVGZoomAndPan        : false,
  TimeEvent            : false,
  top                  : false,
  WebSocket            : false,
  window               : false,
  Worker               : false,
  XMLHttpRequest       : false,
  XMLSerializer        : false,
  XPathEvaluator       : false,
  XPathException       : false,
  XPathExpression      : false,
  XPathNamespace       : false,
  XPathNSResolver      : false,
  XPathResult          : false
};

exports.devel = {
  alert  : false,
  confirm: false,
  console: false,
  Debug  : false,
  opera  : false,
  prompt : false
};

exports.worker = {
  importScripts: true,
  postMessage  : true,
  self         : true
};

// Widely adopted global names that are not part of ECMAScript standard
exports.nonstandard = {
  escape  : false,
  unescape: false
};

// Globals provided by popular JavaScript environments.

exports.couch = {
  "require" : false,
  respond   : false,
  getRow    : false,
  emit      : false,
  send      : false,
  start     : false,
  sum       : false,
  log       : false,
  exports   : false,
  module    : false,
  provides  : false
};

exports.node = {
  __filename    : false,
  __dirname     : false,
  Buffer        : false,
  console       : false,
  exports       : true,  // In Node it is ok to exports = module.exports = foo();
  GLOBAL        : false,
  global        : false,
  module        : false,
  process       : false,
  require       : false,
  setTimeout    : false,
  clearTimeout  : false,
  setInterval   : false,
  clearInterval : false,
  setImmediate  : false, // v0.9.1+
  clearImmediate: false  // v0.9.1+
};

exports.phantom = {
  phantom      : true,
  require      : true,
  WebPage      : true,
  console      : true, // in examples, but undocumented
  exports      : true  // v1.7+
};

exports.rhino = {
  defineClass  : false,
  deserialize  : false,
  gc           : false,
  help         : false,
  importPackage: false,
  "java"       : false,
  load         : false,
  loadClass    : false,
  print        : false,
  quit         : false,
  readFile     : false,
  readUrl      : false,
  runCommand   : false,
  seal         : false,
  serialize    : false,
  spawn        : false,
  sync         : false,
  toint32      : false,
  version      : false
};

exports.shelljs = {
  target       : false,
  echo         : false,
  exit         : false,
  cd           : false,
  pwd          : false,
  ls           : false,
  find         : false,
  cp           : false,
  rm           : false,
  mv           : false,
  mkdir        : false,
  test         : false,
  cat          : false,
  sed          : false,
  grep         : false,
  which        : false,
  dirs         : false,
  pushd        : false,
  popd         : false,
  env          : false,
  exec         : false,
  chmod        : false,
  config       : false,
  error        : false,
  tempdir      : false
};

exports.typed = {
  ArrayBuffer         : false,
  ArrayBufferView     : false,
  DataView            : false,
  Float32Array        : false,
  Float64Array        : false,
  Int16Array          : false,
  Int32Array          : false,
  Int8Array           : false,
  Uint16Array         : false,
  Uint32Array         : false,
  Uint8Array          : false,
  Uint8ClampedArray   : false
};

exports.wsh = {
  ActiveXObject            : true,
  Enumerator               : true,
  GetObject                : true,
  ScriptEngine             : true,
  ScriptEngineBuildVersion : true,
  ScriptEngineMajorVersion : true,
  ScriptEngineMinorVersion : true,
  VBArray                  : true,
  WSH                      : true,
  WScript                  : true,
  XDomainRequest           : true
};

// Globals provided by popular JavaScript libraries.

exports.dojo = {
  dojo     : false,
  dijit    : false,
  dojox    : false,
  define   : false,
  "require": false
};

exports.jquery = {
  "$"    : false,
  jQuery : false
};

exports.mootools = {
  "$"           : false,
  "$$"          : false,
  Asset         : false,
  Browser       : false,
  Chain         : false,
  Class         : false,
  Color         : false,
  Cookie        : false,
  Core          : false,
  Document      : false,
  DomReady      : false,
  DOMEvent      : false,
  DOMReady      : false,
  Drag          : false,
  Element       : false,
  Elements      : false,
  Event         : false,
  Events        : false,
  Fx            : false,
  Group         : false,
  Hash          : false,
  HtmlTable     : false,
  Iframe        : false,
  IframeShim    : false,
  InputValidator: false,
  instanceOf    : false,
  Keyboard      : false,
  Locale        : false,
  Mask          : false,
  MooTools      : false,
  Native        : false,
  Options       : false,
  OverText      : false,
  Request       : false,
  Scroller      : false,
  Slick         : false,
  Slider        : false,
  Sortables     : false,
  Spinner       : false,
  Swiff         : false,
  Tips          : false,
  Type          : false,
  typeOf        : false,
  URI           : false,
  Window        : false
};

exports.prototypejs = {
  "$"               : false,
  "$$"              : false,
  "$A"              : false,
  "$F"              : false,
  "$H"              : false,
  "$R"              : false,
  "$break"          : false,
  "$continue"       : false,
  "$w"              : false,
  Abstract          : false,
  Ajax              : false,
  Class             : false,
  Enumerable        : false,
  Element           : false,
  Event             : false,
  Field             : false,
  Form              : false,
  Hash              : false,
  Insertion         : false,
  ObjectRange       : false,
  PeriodicalExecuter: false,
  Position          : false,
  Prototype         : false,
  Selector          : false,
  Template          : false,
  Toggle            : false,
  Try               : false,
  Autocompleter     : false,
  Builder           : false,
  Control           : false,
  Draggable         : false,
  Draggables        : false,
  Droppables        : false,
  Effect            : false,
  Sortable          : false,
  SortableObserver  : false,
  Sound             : false,
  Scriptaculous     : false
};

exports.yui = {
  YUI       : false,
  Y         : false,
  YUI_config: false
};


})()
},{}],4:[function(require,module,exports){
(function(){"use strict";

// XXX(jeresig): Used for i18n string extraction
var $ = { _: function (msg) { return msg; } };

var errors = {
  // JSHint options
  E001: $._("Bad option: '{a}'."),
  E002: $._("Bad option value."),

  // JSHint input
  E003: $._("Expected a JSON value."),
  E004: $._("Input is neither a string nor an array of strings."),
  E005: $._("Input is empty."),
  E006: $._("Unexpected early end of program."),

  // Strict mode
  E007: $._("Missing \"use strict\" statement."),
  E008: $._("Strict violation."),
  E009: $._("Option 'validthis' can't be used in a global scope."),
  E010: $._("'with' is not allowed in strict mode."),

  // Constants
  E011: $._("const '{a}' has already been declared."),
  E012: $._("const '{a}' is initialized to 'undefined'."),
  E013: $._("Attempting to override '{a}' which is a constant."),

  // Regular expressions
  E014: $._("A regular expression literal can be confused with '/='."),
  E015: $._("Unclosed regular expression."),
  E016: $._("Invalid regular expression."),

  // Tokens
  E017: $._("It looks like your comment isn't closed. Use \"*/\" to end a multi-line comment."),
  E018: $._("It looks like you never started your comment. Use \"/*\" to start a multi-line comment."),
  E019: $._("Unmatched \"{a}\"."),
  E020: $._("I thought you were going to type \"{a}\" to match \"{b}\" from line {c} but you typed \"{d}\""),
  E021: $._("I thought you were going to type \"{a}\" but you typed \"{b}\"!"),
  E022: $._("Line breaking error '{a}'."),
  E023: $._("I think you're missing a \"{a}\"!"),
  E024: $._("Unexpected \"{a}\"."),
  E025: $._("I think you're missing ':' on a case clause."),
  E026: $._("I think you're missing a '}' to match '{' from line {a}."),
  E027: $._("I think you're missing a ']' to match '[' from line {a}."),
  E028: $._("Illegal comma."),
  E029: $._("Unclosed string! Make sure you end your string with a quote."),

  // Everything else
  E030: $._("I thought you were going to type an identifier but you typed '{a}'."),
  E031: $._("The left side of an assignment must be a single variable name, not an expression."), // FIXME: Rephrase
  E032: $._("I thought you were going to type a number or 'false' but you typed '{a}'."),
  E033: $._("I thought you were going to type an operator but you typed '{a}'."),
  E034: $._("get/set are ES5 features."),
  E035: $._("I think you're missing a property name."),
  E036: $._("I thought you were going to type a statement but you typed a block instead."),
  E037: null, // Vacant
  E038: null, // Vacant
  E039: $._("Function declarations are not invocable. Wrap the whole function invocation in parens."),
  E040: $._("Each value should have its own case label."),
  E041: $._("Unrecoverable syntax error."),
  E042: $._("Stopping."),
  E043: $._("Too many errors."),
  E044: $._("'{a}' is already defined and can't be redefined."),
  E045: $._("Invalid for each loop."),
  E046: $._("A yield statement shall be within a generator function (with syntax: `function*`)"),
  E047: $._("A generator function shall contain a yield statement."),
  E048: $._("Let declaration not directly within block."),
  E049: $._("A {a} cannot be named '{b}'."),
  E050: $._("Mozilla requires the yield expression to be parenthesized here."),
  E051: $._("Regular parameters cannot come after default parameters."),
  E052: $._("I think you meant to type a value or variable name before that comma?"),
  E053: $._("I think you either have an extra comma or a missing argument?")
};

var warnings = {
  W001: $._("'hasOwnProperty' is a really bad name."),
  W002: $._("Value of '{a}' may be overwritten in IE 8 and earlier."),
  W003: $._("'{a}' was used before it was defined."),
  W004: $._("'{a}' is already defined."),
  W005: $._("A dot following a number can be confused with a decimal point."),
  W006: $._("Confusing minuses."),
  W007: $._("Confusing pluses."),
  W008: $._("Please put a 0 in front of the decimal point: \"{a}\"!"),
  W009: $._("The array literal notation [] is preferrable."),
  W010: $._("The object literal notation {} is preferrable."),
  W011: $._("Unexpected space after '{a}'."),
  W012: $._("Unexpected space before '{a}'."),
  W013: $._("I think you're missing a space after \"{a}\"."),
  W014: $._("Bad line breaking before '{a}'."),
  W015: $._("Expected '{a}' to have an indentation at {b} instead at {c}."),
  W016: $._("Unexpected use of '{a}'."),
  W017: $._("Bad operand."),
  W018: $._("Confusing use of '{a}'."),
  W019: $._("Use the isNaN function to compare with NaN."),
  W020: $._("Read only."),
  W021: $._("'{a}' is a function."),
  W022: $._("Do not assign to the exception parameter."),
  W023: $._("I thought you were going to type an identifier in an assignment but you typed a function invocation instead."),
  W024: $._("I thought you were going to type an identifier but you typed '{a}' (a reserved word)."),
  W025: $._("I think you're missing the name in your function declaration."),
  W026: $._("Inner functions should be listed at the top of the outer function."),
  W027: $._("Unreachable '{a}' after '{b}'."),
  W028: $._("Label '{a}' on {b} statement."),
  W030: $._("I thought you were going to type an assignment or function call but you typed an expression instead."),
  W031: $._("Do not use 'new' for side effects."),
  W032: $._("It looks like you have an unnecessary semicolon."),
  W033: $._("It looks like you're missing a semicolon."),
  W034: $._("Unnecessary directive \"{a}\"."),
  W035: $._("Empty block."),
  W036: $._("Unexpected /*member '{a}'."),
  W037: $._("'{a}' is a statement label."),
  W038: $._("'{a}' used out of scope."),
  W039: $._("'{a}' is not allowed."),
  W040: $._("Possible strict violation."),
  W041: $._("Use '{a}' to compare with '{b}'."),
  W042: $._("Avoid EOL escaping."),
  W043: $._("Bad escaping of EOL. Use option multistr if needed."),
  W044: $._("Bad or unnecessary escaping."),
  W045: $._("Bad number '{a}'."),
  W046: $._("Don't use extra leading zeros \"{a}\"."),
  W047: $._("A trailing decimal point can be confused with a dot: '{a}'."),
  W048: $._("Unexpected control character in regular expression."),
  W049: $._("Unexpected escaped character '{a}' in regular expression."),
  W050: $._("JavaScript URL."),
  W051: $._("Variables should not be deleted."),
  W052: $._("Unexpected '{a}'."),
  W053: $._("Do not use {a} as a constructor."),
  W054: $._("The Function constructor is a form of eval."),
  W055: $._("A constructor name should start with an uppercase letter."),
  W056: $._("Bad constructor."),
  W057: $._("Weird construction. Is 'new' necessary?"),
  W058: $._("I think you're missing the \"()\" to invoke the constructor."),
  W059: $._("Avoid arguments.{a}."),
  W060: $._("document.write can be a form of eval."),
  W061: $._("eval can be harmful."),
  W062: $._("Wrap an immediate function invocation in parens " +
    "to assist the reader in understanding that the expression " +
    "is the result of a function, and not the function itself."),
  W063: $._("Math is not a function."),
  W064: $._("I think you're missing using 'new' to call a constructor."),
  W065: $._("It looks like you're missing a radix parameter."),
  W066: $._("Implied eval. Consider passing a function instead of a string."),
  W067: $._("Bad invocation."),
  W068: $._("Wrapping non-IIFE function literals in parens is unnecessary."),
  W069: $._("['{a}'] is better written in dot notation."),
  W070: $._("Extra comma. (it breaks older versions of IE)"),
  W071: $._("This function has too many statements. ({a})"),
  W072: $._("This function has too many parameters. ({a})"),
  W073: $._("Blocks are nested too deeply. ({a})"),
  W074: $._("This function's cyclomatic complexity is too high. ({a})"),
  W075: $._("Duplicate key '{a}'."),
  W076: $._("Unexpected parameter '{a}' in get {b} function."),
  W077: $._("Expected a single parameter in set {a} function."),
  W078: $._("Setter is defined without getter."),
  W079: $._("Redefinition of '{a}'."),
  W080: $._("It's not necessary to initialize '{a}' to 'undefined'."),
  W081: $._("Too many var statements."),
  W082: $._("Function declarations should not be placed in blocks. " +
    "Use a function expression or move the statement to the top of " +
    "the outer function."),
  W083: $._("It's not a good idea to define functions within a loop. Can you define them outside instead?"),
  W084: $._("I thought you were going to type a conditional expression but you typed an assignment instead."),
  W085: $._("Don't use 'with'."),
  W086: $._("Did you forget a 'break' statement before '{a}'?"),
  W087: $._("Forgotten 'debugger' statement?"),
  W088: $._("Creating global 'for' variable. Should be 'for (var {a} ...'."),
  W089: $._("The body of a for in should be wrapped in an if statement to filter " +
    "unwanted properties from the prototype."),
  W090: $._("'{a}' is not a statement label."),
  W091: $._("'{a}' is out of scope."),
  W092: $._("Wrap the /regexp/ literal in parens to disambiguate the slash operator."),
  W093: $._("Did you mean to return a conditional instead of an assignment?"),
  W094: $._("Unexpected comma."),
  W095: $._("I thought you were going to type a string but you typed {a}."),
  W096: $._("The '{a}' key may produce unexpected results."),
  W097: $._("Use the function form of \"use strict\"."),
  W098: $._("'{a}' is defined but never used."),
  W099: $._("Mixed spaces and tabs."),
  W100: $._("This character may get silently deleted by one or more browsers."),
  W101: $._("Line is too long."),
  W102: $._("Trailing whitespace."),
  W103: $._("The '{a}' property is deprecated."),
  W104: $._("'{a}' is only available in JavaScript 1.7."),
  W105: $._("Unexpected {a} in '{b}'."),
  W106: $._("Identifier '{a}' is not in camel case."),
  W107: $._("Script URL."),
  W108: $._("Strings must use doublequote."),
  W109: $._("Strings must use singlequote."),
  W110: $._("Mixed double and single quotes."),
  W112: $._("Unclosed string! Make sure you end your string with a quote."),
  W113: $._("Control character in string: {a}."),
  W114: $._("Avoid {a}."),
  W115: $._("Octal literals are not allowed in strict mode."),
  W116: $._("I thought you were going to type \"{a}\" but you typed \"{b}\"."),
  W117: $._("\"{a}\" is not defined. Make sure you're spelling it correctly and that you declared it."),
  W118: $._("'{a}' is only available in Mozilla JavaScript extensions (use moz option)."),
  W119: $._("'{a}' is only available in ES6 (use esnext option)."),
  W120: $._("You might be leaking a variable ({a}) here."),
  W121: $._("I thought you were going to type a conditional expression but you typed an assignment instead. Maybe you meant to type === instead of =?"),
  
};

var info = {
  I001: $._("Comma warnings can be turned off with 'laxcomma'."),
  I002: $._("Reserved words as properties can be used under the 'es5' option."),
  I003: $._("ES5 option is now set per default")
};

exports.errors = {};
exports.warnings = {};
exports.info = {};

for (var code in errors) {
  exports.errors[code] = { code: code, desc: errors[code] };
}

for (var code in warnings) {
  exports.warnings[code] = { code: code, desc: warnings[code] };
}

for (var code in info) {
  exports.info[code] = { code: code, desc: info[code] };
}

})()
},{}],5:[function(require,module,exports){
/*
 * Regular expressions. Some of these are stupidly long.
 */

/*jshint maxlen:1000 */

"use string";

// Unsafe comment or string (ax)
exports.unsafeString =
  /@cc|<\/?|script|\]\s*\]|<\s*!|&lt/i;

// Unsafe characters that are silently deleted by one or more browsers (cx)
exports.unsafeChars =
  /[\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/;

// Characters in strings that need escaping (nx and nxg)
exports.needEsc =
  /[\u0000-\u001f&<"\/\\\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/;

exports.needEscGlobal =
  /[\u0000-\u001f&<"\/\\\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

// Star slash (lx)
exports.starSlash = /\*\//;

// Identifier (ix)
exports.identifier = /^([a-zA-Z_$][a-zA-Z0-9_$]*)$/;

// JavaScript URL (jx)
exports.javascriptURL = /^(?:javascript|jscript|ecmascript|vbscript|mocha|livescript)\s*:/i;

// Catches /* falls through */ comments (ft)
exports.fallsThrough = /^\s*\/\*\s*falls?\sthrough\s*\*\/\s*$/;

},{}],6:[function(require,module,exports){
"use strict";

var state = {
  syntax: {},

  reset: function () {
    this.tokens = {
      prev: null,
      next: null,
      curr: null
    };

    this.option = {};
    this.ignored = {};
    this.directive = {};
    this.jsonMode = false;
    this.jsonWarnings = [];
    this.lines = [];
    this.tab = "";
    this.cache = {}; // Node.JS doesn't have Map. Sniff.
  }
};

exports.state = state;

},{}],7:[function(require,module,exports){
(function(){"use strict";

exports.register = function (linter) {
  // Check for properties named __proto__. This special property was
  // deprecated and then re-introduced for ES6.

  linter.on("Identifier", function style_scanProto(data) {
    if (linter.getOption("proto")) {
      return;
    }

    if (data.name === "__proto__") {
      linter.warn("W103", {
        line: data.line,
        char: data.char,
        data: [ data.name ]
      });
    }
  });

  // Check for properties named __iterator__. This is a special property
  // available only in browsers with JavaScript 1.7 implementation.

  linter.on("Identifier", function style_scanIterator(data) {
    if (linter.getOption("iterator")) {
      return;
    }

    if (data.name === "__iterator__") {
      linter.warn("W104", {
        line: data.line,
        char: data.char,
        data: [ data.name ]
      });
    }
  });

  // Check for dangling underscores.

  linter.on("Identifier", function style_scanDangling(data) {
    if (!linter.getOption("nomen")) {
      return;
    }

    // Underscore.js
    if (data.name === "_") {
      return;
    }

    // In Node, __dirname and __filename should be ignored.
    if (linter.getOption("node")) {
      if (/^(__dirname|__filename)$/.test(data.name) && !data.isProperty) {
        return;
      }
    }

    if (/^(_+.*|.*_+)$/.test(data.name)) {
      linter.warn("W105", {
        line: data.line,
        char: data.from,
        data: [ "dangling '_'", data.name ]
      });
    }
  });

  // Check that all identifiers are using camelCase notation.
  // Exceptions: names like MY_VAR and _myVar.

  linter.on("Identifier", function style_scanCamelCase(data) {
    if (!linter.getOption("camelcase")) {
      return;
    }

    if (data.name.replace(/^_+/, "").indexOf("_") > -1 && !data.name.match(/^[A-Z0-9_]*$/)) {
      linter.warn("W106", {
        line: data.line,
        char: data.from,
        data: [ data.name ]
      });
    }
  });

  // Enforce consistency in style of quoting.

  linter.on("String", function style_scanQuotes(data) {
    var quotmark = linter.getOption("quotmark");
    var code;

    if (!quotmark) {
      return;
    }

    // If quotmark is set to 'single' warn about all double-quotes.

    if (quotmark === "single" && data.quote !== "'") {
      code = "W109";
    }

    // If quotmark is set to 'double' warn about all single-quotes.

    if (quotmark === "double" && data.quote !== "\"") {
      code = "W108";
    }

    // If quotmark is set to true, remember the first quotation style
    // and then warn about all others.

    if (quotmark === true) {
      if (!linter.getCache("quotmark")) {
        linter.setCache("quotmark", data.quote);
      }

      if (linter.getCache("quotmark") !== data.quote) {
        code = "W110";
      }
    }

    if (code) {
      linter.warn(code, {
        line: data.line,
        char: data.char,
      });
    }
  });

  linter.on("Number", function style_scanNumbers(data) {
    if (data.value.charAt(0) === ".") {
      // Warn about a leading decimal point.
      linter.warn("W008", {
        line: data.line,
        char: data.char,
        data: [ data.value ]
      });
    }

    if (data.value.substr(data.value.length - 1) === ".") {
      // Warn about a trailing decimal point.
      linter.warn("W047", {
        line: data.line,
        char: data.char,
        data: [ data.value ]
      });
    }

    if (/^00+/.test(data.value)) {
      // Multiple leading zeroes.
      linter.warn("W046", {
        line: data.line,
        char: data.char,
        data: [ data.value ]
      });
    }
  });

  // Warn about script URLs.

  linter.on("String", function style_scanJavaScriptURLs(data) {
    var re = /^(?:javascript|jscript|ecmascript|vbscript|mocha|livescript)\s*:/i;

    if (linter.getOption("scripturl")) {
      return;
    }

    if (re.test(data.value)) {
      linter.warn("W107", {
        line: data.line,
        char: data.char
      });
    }
  });
};
})()
},{}],8:[function(require,module,exports){
(function(){/*
 * Lexical analysis and token construction.
 */

"use strict";

var events = require("events");
var reg    = require("./reg.js");
var state  = require("./state.js").state;

// Some of these token types are from JavaScript Parser API
// while others are specific to JSHint parser.
// JS Parser API: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

var Token = {
  Identifier: 1,
  Punctuator: 2,
  NumericLiteral: 3,
  StringLiteral: 4,
  Comment: 5,
  Keyword: 6,
  NullLiteral: 7,
  BooleanLiteral: 8,
  RegExp: 9
};

// This is auto generated from the unicode tables.
// The tables are at:
// http://www.fileformat.info/info/unicode/category/Lu/list.htm
// http://www.fileformat.info/info/unicode/category/Ll/list.htm
// http://www.fileformat.info/info/unicode/category/Lt/list.htm
// http://www.fileformat.info/info/unicode/category/Lm/list.htm
// http://www.fileformat.info/info/unicode/category/Lo/list.htm
// http://www.fileformat.info/info/unicode/category/Nl/list.htm

var unicodeLetterTable = [
  170, 170, 181, 181, 186, 186, 192, 214,
  216, 246, 248, 705, 710, 721, 736, 740, 748, 748, 750, 750,
  880, 884, 886, 887, 890, 893, 902, 902, 904, 906, 908, 908,
  910, 929, 931, 1013, 1015, 1153, 1162, 1319, 1329, 1366,
  1369, 1369, 1377, 1415, 1488, 1514, 1520, 1522, 1568, 1610,
  1646, 1647, 1649, 1747, 1749, 1749, 1765, 1766, 1774, 1775,
  1786, 1788, 1791, 1791, 1808, 1808, 1810, 1839, 1869, 1957,
  1969, 1969, 1994, 2026, 2036, 2037, 2042, 2042, 2048, 2069,
  2074, 2074, 2084, 2084, 2088, 2088, 2112, 2136, 2308, 2361,
  2365, 2365, 2384, 2384, 2392, 2401, 2417, 2423, 2425, 2431,
  2437, 2444, 2447, 2448, 2451, 2472, 2474, 2480, 2482, 2482,
  2486, 2489, 2493, 2493, 2510, 2510, 2524, 2525, 2527, 2529,
  2544, 2545, 2565, 2570, 2575, 2576, 2579, 2600, 2602, 2608,
  2610, 2611, 2613, 2614, 2616, 2617, 2649, 2652, 2654, 2654,
  2674, 2676, 2693, 2701, 2703, 2705, 2707, 2728, 2730, 2736,
  2738, 2739, 2741, 2745, 2749, 2749, 2768, 2768, 2784, 2785,
  2821, 2828, 2831, 2832, 2835, 2856, 2858, 2864, 2866, 2867,
  2869, 2873, 2877, 2877, 2908, 2909, 2911, 2913, 2929, 2929,
  2947, 2947, 2949, 2954, 2958, 2960, 2962, 2965, 2969, 2970,
  2972, 2972, 2974, 2975, 2979, 2980, 2984, 2986, 2990, 3001,
  3024, 3024, 3077, 3084, 3086, 3088, 3090, 3112, 3114, 3123,
  3125, 3129, 3133, 3133, 3160, 3161, 3168, 3169, 3205, 3212,
  3214, 3216, 3218, 3240, 3242, 3251, 3253, 3257, 3261, 3261,
  3294, 3294, 3296, 3297, 3313, 3314, 3333, 3340, 3342, 3344,
  3346, 3386, 3389, 3389, 3406, 3406, 3424, 3425, 3450, 3455,
  3461, 3478, 3482, 3505, 3507, 3515, 3517, 3517, 3520, 3526,
  3585, 3632, 3634, 3635, 3648, 3654, 3713, 3714, 3716, 3716,
  3719, 3720, 3722, 3722, 3725, 3725, 3732, 3735, 3737, 3743,
  3745, 3747, 3749, 3749, 3751, 3751, 3754, 3755, 3757, 3760,
  3762, 3763, 3773, 3773, 3776, 3780, 3782, 3782, 3804, 3805,
  3840, 3840, 3904, 3911, 3913, 3948, 3976, 3980, 4096, 4138,
  4159, 4159, 4176, 4181, 4186, 4189, 4193, 4193, 4197, 4198,
  4206, 4208, 4213, 4225, 4238, 4238, 4256, 4293, 4304, 4346,
  4348, 4348, 4352, 4680, 4682, 4685, 4688, 4694, 4696, 4696,
  4698, 4701, 4704, 4744, 4746, 4749, 4752, 4784, 4786, 4789,
  4792, 4798, 4800, 4800, 4802, 4805, 4808, 4822, 4824, 4880,
  4882, 4885, 4888, 4954, 4992, 5007, 5024, 5108, 5121, 5740,
  5743, 5759, 5761, 5786, 5792, 5866, 5870, 5872, 5888, 5900,
  5902, 5905, 5920, 5937, 5952, 5969, 5984, 5996, 5998, 6000,
  6016, 6067, 6103, 6103, 6108, 6108, 6176, 6263, 6272, 6312,
  6314, 6314, 6320, 6389, 6400, 6428, 6480, 6509, 6512, 6516,
  6528, 6571, 6593, 6599, 6656, 6678, 6688, 6740, 6823, 6823,
  6917, 6963, 6981, 6987, 7043, 7072, 7086, 7087, 7104, 7141,
  7168, 7203, 7245, 7247, 7258, 7293, 7401, 7404, 7406, 7409,
  7424, 7615, 7680, 7957, 7960, 7965, 7968, 8005, 8008, 8013,
  8016, 8023, 8025, 8025, 8027, 8027, 8029, 8029, 8031, 8061,
  8064, 8116, 8118, 8124, 8126, 8126, 8130, 8132, 8134, 8140,
  8144, 8147, 8150, 8155, 8160, 8172, 8178, 8180, 8182, 8188,
  8305, 8305, 8319, 8319, 8336, 8348, 8450, 8450, 8455, 8455,
  8458, 8467, 8469, 8469, 8473, 8477, 8484, 8484, 8486, 8486,
  8488, 8488, 8490, 8493, 8495, 8505, 8508, 8511, 8517, 8521,
  8526, 8526, 8544, 8584, 11264, 11310, 11312, 11358,
  11360, 11492, 11499, 11502, 11520, 11557, 11568, 11621,
  11631, 11631, 11648, 11670, 11680, 11686, 11688, 11694,
  11696, 11702, 11704, 11710, 11712, 11718, 11720, 11726,
  11728, 11734, 11736, 11742, 11823, 11823, 12293, 12295,
  12321, 12329, 12337, 12341, 12344, 12348, 12353, 12438,
  12445, 12447, 12449, 12538, 12540, 12543, 12549, 12589,
  12593, 12686, 12704, 12730, 12784, 12799, 13312, 13312,
  19893, 19893, 19968, 19968, 40907, 40907, 40960, 42124,
  42192, 42237, 42240, 42508, 42512, 42527, 42538, 42539,
  42560, 42606, 42623, 42647, 42656, 42735, 42775, 42783,
  42786, 42888, 42891, 42894, 42896, 42897, 42912, 42921,
  43002, 43009, 43011, 43013, 43015, 43018, 43020, 43042,
  43072, 43123, 43138, 43187, 43250, 43255, 43259, 43259,
  43274, 43301, 43312, 43334, 43360, 43388, 43396, 43442,
  43471, 43471, 43520, 43560, 43584, 43586, 43588, 43595,
  43616, 43638, 43642, 43642, 43648, 43695, 43697, 43697,
  43701, 43702, 43705, 43709, 43712, 43712, 43714, 43714,
  43739, 43741, 43777, 43782, 43785, 43790, 43793, 43798,
  43808, 43814, 43816, 43822, 43968, 44002, 44032, 44032,
  55203, 55203, 55216, 55238, 55243, 55291, 63744, 64045,
  64048, 64109, 64112, 64217, 64256, 64262, 64275, 64279,
  64285, 64285, 64287, 64296, 64298, 64310, 64312, 64316,
  64318, 64318, 64320, 64321, 64323, 64324, 64326, 64433,
  64467, 64829, 64848, 64911, 64914, 64967, 65008, 65019,
  65136, 65140, 65142, 65276, 65313, 65338, 65345, 65370,
  65382, 65470, 65474, 65479, 65482, 65487, 65490, 65495,
  65498, 65500, 65536, 65547, 65549, 65574, 65576, 65594,
  65596, 65597, 65599, 65613, 65616, 65629, 65664, 65786,
  65856, 65908, 66176, 66204, 66208, 66256, 66304, 66334,
  66352, 66378, 66432, 66461, 66464, 66499, 66504, 66511,
  66513, 66517, 66560, 66717, 67584, 67589, 67592, 67592,
  67594, 67637, 67639, 67640, 67644, 67644, 67647, 67669,
  67840, 67861, 67872, 67897, 68096, 68096, 68112, 68115,
  68117, 68119, 68121, 68147, 68192, 68220, 68352, 68405,
  68416, 68437, 68448, 68466, 68608, 68680, 69635, 69687,
  69763, 69807, 73728, 74606, 74752, 74850, 77824, 78894,
  92160, 92728, 110592, 110593, 119808, 119892, 119894, 119964,
  119966, 119967, 119970, 119970, 119973, 119974, 119977, 119980,
  119982, 119993, 119995, 119995, 119997, 120003, 120005, 120069,
  120071, 120074, 120077, 120084, 120086, 120092, 120094, 120121,
  120123, 120126, 120128, 120132, 120134, 120134, 120138, 120144,
  120146, 120485, 120488, 120512, 120514, 120538, 120540, 120570,
  120572, 120596, 120598, 120628, 120630, 120654, 120656, 120686,
  120688, 120712, 120714, 120744, 120746, 120770, 120772, 120779,
  131072, 131072, 173782, 173782, 173824, 173824, 177972, 177972,
  177984, 177984, 178205, 178205, 194560, 195101
];

var identifierStartTable = [];

for (var i = 0; i < 128; i++) {
  identifierStartTable[i] =
    i === 36 ||           // $
    i >= 65 && i <= 90 || // A-Z
    i === 95 ||           // _
    i >= 97 && i <= 122;  // a-z
}

var identifierPartTable = [];

for (var i = 0; i < 128; i++) {
  identifierPartTable[i] =
    identifierStartTable[i] || // $, _, A-Z, a-z
    i >= 48 && i <= 57;        // 0-9
}

// Object that handles postponed lexing verifications that checks the parsed
// environment state.

function asyncTrigger() {
  var _checks = [];

  return {
    push: function (fn) {
      _checks.push(fn);
    },

    check: function () {
      for (var check = 0; check < _checks.length; ++check) {
        _checks[check]();
      }

      _checks.splice(0, _checks.length);
    }
  };
}

/*
 * Lexer for JSHint.
 *
 * This object does a char-by-char scan of the provided source code
 * and produces a sequence of tokens.
 *
 *   var lex = new Lexer("var i = 0;");
 *   lex.start();
 *   lex.token(); // returns the next token
 *
 * You have to use the token() method to move the lexer forward
 * but you don't have to use its return value to get tokens. In addition
 * to token() method returning the next token, the Lexer object also
 * emits events.
 *
 *   lex.on("Identifier", function (data) {
 *     if (data.name.indexOf("_") >= 0) {
 *       // Produce a warning.
 *     }
 *   });
 *
 * Note that the token() method returns tokens in a JSLint-compatible
 * format while the event emitter uses a slightly modified version of
 * Mozilla's JavaScript Parser API. Eventually, we will move away from
 * JSLint format.
 */
function Lexer(source) {
  var lines = source;

  if (typeof lines === "string") {
    lines = lines
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n");
  }

  // If the first line is a shebang (#!), make it a blank and move on.
  // Shebangs are used by Node scripts.

  if (lines[0] && lines[0].substr(0, 2) === "#!") {
    lines[0] = "";
  }

  this.emitter = new events.EventEmitter();
  this.source = source;
  this.setLines(lines);
  this.prereg = true;

  this.line = 0;
  this.char = 1;
  this.from = 1;
  this.input = "";

  for (var i = 0; i < state.option.indent; i += 1) {
    state.tab += " ";
  }
}

Lexer.prototype = {
  _lines: [],

  getLines: function () {
    this._lines = state.lines;
    return this._lines;
  },

  setLines: function (val) {
    this._lines = val;
    state.lines = this._lines;
  },

  /*
   * Return the next i character without actually moving the
   * char pointer.
   */
  peek: function (i) {
    return this.input.charAt(i || 0);
  },

  /*
   * Move the char pointer forward i times.
   */
  skip: function (i) {
    i = i || 1;
    this.char += i;
    this.input = this.input.slice(i);
  },

  /*
   * Subscribe to a token event. The API for this method is similar
   * Underscore.js i.e. you can subscribe to multiple events with
   * one call:
   *
   *   lex.on("Identifier Number", function (data) {
   *     // ...
   *   });
   */
  on: function (names, listener) {
    names.split(" ").forEach(function (name) {
      this.emitter.on(name, listener);
    }.bind(this));
  },

  /*
   * Trigger a token event. All arguments will be passed to each
   * listener.
   */
  trigger: function () {
    this.emitter.emit.apply(this.emitter, Array.prototype.slice.call(arguments));
  },

  /*
   * Postpone a token event. the checking condition is set as
   * last parameter, and the trigger function is called in a
   * stored callback. To be later called using the check() function
   * by the parser. This avoids parser's peek() to give the lexer
   * a false context.
   */
  triggerAsync: function (type, args, checks, fn) {
    checks.push(function () {
      if (fn()) {
        this.trigger(type, args);
      }
    }.bind(this));
  },

  /*
   * Extract a punctuator out of the next sequence of characters
   * or return 'null' if its not possible.
   *
   * This method's implementation was heavily influenced by the
   * scanPunctuator function in the Esprima parser's source code.
   */
  scanPunctuator: function () {
    var ch1 = this.peek();
    var ch2, ch3, ch4;

    switch (ch1) {
    // Most common single-character punctuators
    case ".":
      if ((/^[0-9]$/).test(this.peek(1))) {
        return null;
      }
      if (this.peek(1) === "." && this.peek(2) === ".") {
        return {
          type: Token.Punctuator,
          value: "..."
        };
      }
      /* falls through */
    case "(":
    case ")":
    case ";":
    case ",":
    case "{":
    case "}":
    case "[":
    case "]":
    case ":":
    case "~":
    case "?":
      return {
        type: Token.Punctuator,
        value: ch1
      };

    // A pound sign (for Node shebangs)
    case "#":
      return {
        type: Token.Punctuator,
        value: ch1
      };

    // We're at the end of input
    case "":
      return null;
    }

    // Peek more characters

    ch2 = this.peek(1);
    ch3 = this.peek(2);
    ch4 = this.peek(3);

    // 4-character punctuator: >>>=

    if (ch1 === ">" && ch2 === ">" && ch3 === ">" && ch4 === "=") {
      return {
        type: Token.Punctuator,
        value: ">>>="
      };
    }

    // 3-character punctuators: === !== >>> <<= >>=

    if (ch1 === "=" && ch2 === "=" && ch3 === "=") {
      return {
        type: Token.Punctuator,
        value: "==="
      };
    }

    if (ch1 === "!" && ch2 === "=" && ch3 === "=") {
      return {
        type: Token.Punctuator,
        value: "!=="
      };
    }

    if (ch1 === ">" && ch2 === ">" && ch3 === ">") {
      return {
        type: Token.Punctuator,
        value: ">>>"
      };
    }

    if (ch1 === "<" && ch2 === "<" && ch3 === "=") {
      return {
        type: Token.Punctuator,
        value: "<<="
      };
    }

    if (ch1 === ">" && ch2 === ">" && ch3 === "=") {
      return {
        type: Token.Punctuator,
        value: ">>="
      };
    }

    // Fat arrow punctuator
    if (ch1 === "=" && ch2 === ">") {
      return {
        type: Token.Punctuator,
        value: ch1 + ch2
      };
    }

    // 2-character punctuators: <= >= == != ++ -- << >> && ||
    // += -= *= %= &= |= ^= (but not /=, see below)
    if (ch1 === ch2 && ("+-<>&|".indexOf(ch1) >= 0)) {
      return {
        type: Token.Punctuator,
        value: ch1 + ch2
      };
    }

    if ("<>=!+-*%&|^".indexOf(ch1) >= 0) {
      if (ch2 === "=") {
        return {
          type: Token.Punctuator,
          value: ch1 + ch2
        };
      }

      return {
        type: Token.Punctuator,
        value: ch1
      };
    }

    // Special case: /=. We need to make sure that this is an
    // operator and not a regular expression.

    if (ch1 === "/") {
      if (ch2 === "=" && /\/=(?!(\S*\/[gim]?))/.test(this.input)) {
        // /= is not a part of a regular expression, return it as a
        // punctuator.
        return {
          type: Token.Punctuator,
          value: "/="
        };
      }

      return {
        type: Token.Punctuator,
        value: "/"
      };
    }

    return null;
  },

  /*
   * Extract a comment out of the next sequence of characters and/or
   * lines or return 'null' if its not possible. Since comments can
   * span across multiple lines this method has to move the char
   * pointer.
   *
   * In addition to normal JavaScript comments (// and /*) this method
   * also recognizes JSHint- and JSLint-specific comments such as
   * /*jshint, /*jslint, /*globals and so on.
   */
  scanComments: function () {
    var ch1 = this.peek();
    var ch2 = this.peek(1);
    var rest = this.input.substr(2);
    var startLine = this.line;
    var startChar = this.char;

    // Create a comment token object and make sure it
    // has all the data JSHint needs to work with special
    // comments.

    function commentToken(label, body, opt) {
      var special = ["jshint", "jslint", "members", "member", "globals", "global", "exported"];
      var isSpecial = false;
      var value = label + body;
      var commentType = "plain";
      opt = opt || {};

      if (opt.isMultiline) {
        value += "*/";
      }

      special.forEach(function (str) {
        if (isSpecial) {
          return;
        }

        // Don't recognize any special comments other than jshint for single-line
        // comments. This introduced many problems with legit comments.
        if (label === "//" && str !== "jshint") {
          return;
        }

        if (body.substr(0, str.length) === str) {
          isSpecial = true;
          label = label + str;
          body = body.substr(str.length);
        }

        if (!isSpecial && body.charAt(0) === " " && body.substr(1, str.length) === str) {
          isSpecial = true;
          label = label + " " + str;
          body = body.substr(str.length + 1);
        }

        if (!isSpecial) {
          return;
        }

        switch (str) {
        case "member":
          commentType = "members";
          break;
        case "global":
          commentType = "globals";
          break;
        default:
          commentType = str;
        }
      });

      return {
        type: Token.Comment,
        commentType: commentType,
        value: value,
        body: body,
        isSpecial: isSpecial,
        isMultiline: opt.isMultiline || false,
        isMalformed: opt.isMalformed || false
      };
    }

    // End of unbegun comment. Raise an error and skip that input.
    if (ch1 === "*" && ch2 === "/") {
      this.trigger("error", {
        code: "E018",
        line: startLine,
        character: startChar
      });

      this.skip(2);
      return null;
    }

    // Comments must start either with // or /*
    if (ch1 !== "/" || (ch2 !== "*" && ch2 !== "/")) {
      return null;
    }

    // One-line comment
    if (ch2 === "/") {
      this.skip(this.input.length); // Skip to the EOL.
      return commentToken("//", rest);
    }

    var body = "";

    /* Multi-line comment */
    if (ch2 === "*") {
      this.skip(2);

      while (this.peek() !== "*" || this.peek(1) !== "/") {
        if (this.peek() === "") { // End of Line
          body += "\n";

          // If we hit EOF and our comment is still unclosed,
          // trigger an error and end the comment implicitly.
          if (!this.nextLine()) {
            this.trigger("error", {
              code: "E017",
              line: startLine,
              character: startChar
            });

            return commentToken("/*", body, {
              isMultiline: true,
              isMalformed: true
            });
          }
        } else {
          body += this.peek();
          this.skip();
        }
      }

      this.skip(2);
      return commentToken("/*", body, { isMultiline: true });
    }
  },

  /*
   * Extract a keyword out of the next sequence of characters or
   * return 'null' if its not possible.
   */
  scanKeyword: function () {
    var result = /^[a-zA-Z_$][a-zA-Z0-9_$]*/.exec(this.input);
    var keywords = [
      "if", "in", "do", "var", "for", "new",
      "try", "let", "this", "else", "case",
      "void", "with", "enum", "while", "break",
      "catch", "throw", "const", "yield", "class",
      "super", "return", "typeof", "delete",
      "switch", "export", "import", "default",
      "finally", "extends", "function", "continue",
      "debugger", "instanceof"
    ];

    if (result && keywords.indexOf(result[0]) >= 0) {
      return {
        type: Token.Keyword,
        value: result[0]
      };
    }

    return null;
  },

  /*
   * Extract a JavaScript identifier out of the next sequence of
   * characters or return 'null' if its not possible. In addition,
   * to Identifier this method can also produce BooleanLiteral
   * (true/false) and NullLiteral (null).
   */
  scanIdentifier: function () {
    var id = "";
    var index = 0;
    var type, char;

    // Detects any character in the Unicode categories "Uppercase
    // letter (Lu)", "Lowercase letter (Ll)", "Titlecase letter
    // (Lt)", "Modifier letter (Lm)", "Other letter (Lo)", or
    // "Letter number (Nl)".
    //
    // Both approach and unicodeLetterTable were borrowed from
    // Google's Traceur.

    function isUnicodeLetter(code) {
      for (var i = 0; i < unicodeLetterTable.length;) {
        if (code < unicodeLetterTable[i++]) {
          return false;
        }

        if (code <= unicodeLetterTable[i++]) {
          return true;
        }
      }

      return false;
    }

    function isHexDigit(str) {
      return (/^[0-9a-fA-F]$/).test(str);
    }

    var readUnicodeEscapeSequence = function () {
      /*jshint validthis:true */
      index += 1;

      if (this.peek(index) !== "u") {
        return null;
      }

      var ch1 = this.peek(index + 1);
      var ch2 = this.peek(index + 2);
      var ch3 = this.peek(index + 3);
      var ch4 = this.peek(index + 4);
      var code;

      if (isHexDigit(ch1) && isHexDigit(ch2) && isHexDigit(ch3) && isHexDigit(ch4)) {
        code = parseInt(ch1 + ch2 + ch3 + ch4, 16);

        if (isUnicodeLetter(code)) {
          index += 5;
          return "\\u" + ch1 + ch2 + ch3 + ch4;
        }

        return null;
      }

      return null;
    }.bind(this);

    var getIdentifierStart = function () {
      /*jshint validthis:true */
      var chr = this.peek(index);
      var code = chr.charCodeAt(0);

      if (code === 92) {
        return readUnicodeEscapeSequence();
      }

      if (code < 128) {
        if (identifierStartTable[code]) {
          index += 1;
          return chr;
        }

        return null;
      }

      if (isUnicodeLetter(code)) {
        index += 1;
        return chr;
      }

      return null;
    }.bind(this);

    var getIdentifierPart = function () {
      /*jshint validthis:true */
      var chr = this.peek(index);
      var code = chr.charCodeAt(0);

      if (code === 92) {
        return readUnicodeEscapeSequence();
      }

      if (code < 128) {
        if (identifierPartTable[code]) {
          index += 1;
          return chr;
        }

        return null;
      }

      if (isUnicodeLetter(code)) {
        index += 1;
        return chr;
      }

      return null;
    }.bind(this);

    char = getIdentifierStart();
    if (char === null) {
      return null;
    }

    id = char;
    for (;;) {
      char = getIdentifierPart();

      if (char === null) {
        break;
      }

      id += char;
    }

    switch (id) {
    case "true":
    case "false":
      type = Token.BooleanLiteral;
      break;
    case "null":
      type = Token.NullLiteral;
      break;
    default:
      type = Token.Identifier;
    }

    return {
      type: type,
      value: id
    };
  },

  /*
   * Extract a numeric literal out of the next sequence of
   * characters or return 'null' if its not possible. This method
   * supports all numeric literals described in section 7.8.3
   * of the EcmaScript 5 specification.
   *
   * This method's implementation was heavily influenced by the
   * scanNumericLiteral function in the Esprima parser's source code.
   */
  scanNumericLiteral: function () {
    var index = 0;
    var value = "";
    var length = this.input.length;
    var char = this.peek(index);
    var bad;

    function isDecimalDigit(str) {
      return (/^[0-9]$/).test(str);
    }

    function isOctalDigit(str) {
      return (/^[0-7]$/).test(str);
    }

    function isHexDigit(str) {
      return (/^[0-9a-fA-F]$/).test(str);
    }

    function isIdentifierStart(ch) {
      return (ch === "$") || (ch === "_") || (ch === "\\") ||
        (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");
    }

    // Numbers must start either with a decimal digit or a point.

    if (char !== "." && !isDecimalDigit(char)) {
      return null;
    }

    if (char !== ".") {
      value = this.peek(index);
      index += 1;
      char = this.peek(index);

      if (value === "0") {
        // Base-16 numbers.
        if (char === "x" || char === "X") {
          index += 1;
          value += char;

          while (index < length) {
            char = this.peek(index);
            if (!isHexDigit(char)) {
              break;
            }
            value += char;
            index += 1;
          }

          if (value.length <= 2) { // 0x
            return {
              type: Token.NumericLiteral,
              value: value,
              isMalformed: true
            };
          }

          if (index < length) {
            char = this.peek(index);
            if (isIdentifierStart(char)) {
              return null;
            }
          }

          return {
            type: Token.NumericLiteral,
            value: value,
            base: 16,
            isMalformed: false
          };
        }

        // Base-8 numbers.
        if (isOctalDigit(char)) {
          index += 1;
          value += char;
          bad = false;

          while (index < length) {
            char = this.peek(index);

            // Numbers like '019' (note the 9) are not valid octals
            // but we still parse them and mark as malformed.

            if (isDecimalDigit(char)) {
              bad = true;
            } else if (!isOctalDigit(char)) {
              break;
            }
            value += char;
            index += 1;
          }

          if (index < length) {
            char = this.peek(index);
            if (isIdentifierStart(char)) {
              return null;
            }
          }

          return {
            type: Token.NumericLiteral,
            value: value,
            base: 8,
            isMalformed: false
          };
        }

        // Decimal numbers that start with '0' such as '09' are illegal
        // but we still parse them and return as malformed.

        if (isDecimalDigit(char)) {
          index += 1;
          value += char;
        }
      }

      while (index < length) {
        char = this.peek(index);
        if (!isDecimalDigit(char)) {
          break;
        }
        value += char;
        index += 1;
      }
    }

    // Decimal digits.

    if (char === ".") {
      value += char;
      index += 1;

      while (index < length) {
        char = this.peek(index);
        if (!isDecimalDigit(char)) {
          break;
        }
        value += char;
        index += 1;
      }
    }

    // Exponent part.

    if (char === "e" || char === "E") {
      value += char;
      index += 1;
      char = this.peek(index);

      if (char === "+" || char === "-") {
        value += this.peek(index);
        index += 1;
      }

      char = this.peek(index);
      if (isDecimalDigit(char)) {
        value += char;
        index += 1;

        while (index < length) {
          char = this.peek(index);
          if (!isDecimalDigit(char)) {
            break;
          }
          value += char;
          index += 1;
        }
      } else {
        return null;
      }
    }

    if (index < length) {
      char = this.peek(index);
      if (isIdentifierStart(char)) {
        return null;
      }
    }

    return {
      type: Token.NumericLiteral,
      value: value,
      base: 10,
      isMalformed: !isFinite(value)
    };
  },

  /*
   * Extract a string out of the next sequence of characters and/or
   * lines or return 'null' if its not possible. Since strings can
   * span across multiple lines this method has to move the char
   * pointer.
   *
   * This method recognizes pseudo-multiline JavaScript strings:
   *
   *   var str = "hello\
   *   world";
   */
  scanStringLiteral: function (checks) {
    /*jshint loopfunc:true */
    var quote = this.peek();

    // String must start with a quote.
    if (quote !== "\"" && quote !== "'") {
      return null;
    }

    // In JSON strings must always use double quotes.
    this.triggerAsync("warning", {
      code: "W108",
      line: this.line,
      character: this.char // +1?
    }, checks, function () { return state.jsonMode && quote !== "\""; });

    var value = "";
    var startLine = this.line;
    var startChar = this.char;
    var allowNewLine = false;

    this.skip();

    while (this.peek() !== quote) {
      while (this.peek() === "") { // End Of Line

        // If an EOL is not preceded by a backslash, show a warning
        // and proceed like it was a legit multi-line string where
        // author simply forgot to escape the newline symbol.
        //
        // Another approach is to implicitly close a string on EOL
        // but it generates too many false positives.

        if (!allowNewLine) {
          this.trigger("warning", {
            code: "W112",
            line: this.line,
            character: this.char
          });
        } else {
          allowNewLine = false;

          // Otherwise show a warning if multistr option was not set.
          // For JSON, show warning no matter what.

          this.triggerAsync("warning", {
            code: "W043",
            line: this.line,
            character: this.char
          }, checks, function () { return !state.option.multistr; });

          this.triggerAsync("warning", {
            code: "W042",
            line: this.line,
            character: this.char
          }, checks, function () { return state.jsonMode && state.option.multistr; });
        }

        // If we get an EOF inside of an unclosed string, show an
        // error and implicitly close it at the EOF point.

        if (!this.nextLine()) {
          this.trigger("error", {
            code: "E029",
            line: startLine,
            character: startChar
          });

          return {
            type: Token.StringLiteral,
            value: value,
            isUnclosed: true,
            quote: quote
          };
        }
      }

      allowNewLine = false;
      var char = this.peek();
      var jump = 1; // A length of a jump, after we're done
                    // parsing this character.

      if (char < " ") {
        // Warn about a control character in a string.
        this.trigger("warning", {
          code: "W113",
          line: this.line,
          character: this.char,
          data: [ "<non-printable>" ]
        });
      }

      // Special treatment for some escaped characters.

      if (char === "\\") {
        this.skip();
        char = this.peek();

        switch (char) {
        case "'":
          this.triggerAsync("warning", {
            code: "W114",
            line: this.line,
            character: this.char,
            data: [ "\\'" ]
          }, checks, function () {return state.jsonMode; });
          break;
        case "b":
          char = "\b";
          break;
        case "f":
          char = "\f";
          break;
        case "n":
          char = "\n";
          break;
        case "r":
          char = "\r";
          break;
        case "t":
          char = "\t";
          break;
        case "0":
          char = "\0";

          // Octal literals fail in strict mode.
          // Check if the number is between 00 and 07.
          var n = parseInt(this.peek(1), 10);
          this.triggerAsync("warning", {
            code: "W115",
            line: this.line,
            character: this.char
          }, checks,
          function () { return n >= 0 && n <= 7 && state.directive["use strict"]; });
          break;
        case "u":
          char = String.fromCharCode(parseInt(this.input.substr(1, 4), 16));
          jump = 5;
          break;
        case "v":
          this.triggerAsync("warning", {
            code: "W114",
            line: this.line,
            character: this.char,
            data: [ "\\v" ]
          }, checks, function () { return state.jsonMode; });

          char = "\v";
          break;
        case "x":
          var x = parseInt(this.input.substr(1, 2), 16);

          this.triggerAsync("warning", {
            code: "W114",
            line: this.line,
            character: this.char,
            data: [ "\\x-" ]
          }, checks, function () { return state.jsonMode; });

          char = String.fromCharCode(x);
          jump = 3;
          break;
        case "\\":
        case "\"":
        case "/":
          break;
        case "":
          allowNewLine = true;
          char = "";
          break;
        case "!":
          if (value.slice(value.length - 2) === "<") {
            break;
          }

          /*falls through */
        default:
          // Weird escaping.
          this.trigger("warning", {
            code: "W044",
            line: this.line,
            character: this.char
          });
        }
      }

      value += char;
      this.skip(jump);
    }

    this.skip();
    return {
      type: Token.StringLiteral,
      value: value,
      isUnclosed: false,
      quote: quote
    };
  },

  /*
   * Extract a regular expression out of the next sequence of
   * characters and/or lines or return 'null' if its not possible.
   *
   * This method is platform dependent: it accepts almost any
   * regular expression values but then tries to compile and run
   * them using system's RegExp object. This means that there are
   * rare edge cases where one JavaScript engine complains about
   * your regular expression while others don't.
   */
  scanRegExp: function () {
    var index = 0;
    var length = this.input.length;
    var char = this.peek();
    var value = char;
    var body = "";
    var flags = [];
    var malformed = false;
    var isCharSet = false;
    var terminated;

    var scanUnexpectedChars = function () {
      // Unexpected control character
      if (char < " ") {
        malformed = true;
        this.trigger("warning", {
          code: "W048",
          line: this.line,
          character: this.char
        });
      }

      // Unexpected escaped character
      if (char === "<") {
        malformed = true;
        this.trigger("warning", {
          code: "W049",
          line: this.line,
          character: this.char,
          data: [ char ]
        });
      }
    }.bind(this);

    // Regular expressions must start with '/'
    if (!this.prereg || char !== "/") {
      return null;
    }

    index += 1;
    terminated = false;

    // Try to get everything in between slashes. A couple of
    // cases aside (see scanUnexpectedChars) we don't really
    // care whether the resulting expression is valid or not.
    // We will check that later using the RegExp object.

    while (index < length) {
      char = this.peek(index);
      value += char;
      body += char;

      if (isCharSet) {
        if (char === "]") {
          if (this.peek(index - 1) !== "\\" || this.peek(index - 2) === "\\") {
            isCharSet = false;
          }
        }

        if (char === "\\") {
          index += 1;
          char = this.peek(index);
          body += char;
          value += char;

          scanUnexpectedChars();
        }

        index += 1;
        continue;
      }

      if (char === "\\") {
        index += 1;
        char = this.peek(index);
        body += char;
        value += char;

        scanUnexpectedChars();

        if (char === "/") {
          index += 1;
          continue;
        }

        if (char === "[") {
          index += 1;
          continue;
        }
      }

      if (char === "[") {
        isCharSet = true;
        index += 1;
        continue;
      }

      if (char === "/") {
        body = body.substr(0, body.length - 1);
        terminated = true;
        index += 1;
        break;
      }

      index += 1;
    }

    // A regular expression that was never closed is an
    // error from which we cannot recover.

    if (!terminated) {
      this.trigger("error", {
        code: "E015",
        line: this.line,
        character: this.from
      });

      return void this.trigger("fatal", {
        line: this.line,
        from: this.from
      });
    }

    // Parse flags (if any).

    while (index < length) {
      char = this.peek(index);
      if (!/[gim]/.test(char)) {
        break;
      }
      flags.push(char);
      value += char;
      index += 1;
    }

    // Check regular expression for correctness.

    try {
      new RegExp(body, flags.join(""));
    } catch (err) {
      malformed = true;
      this.trigger("error", {
        code: "E016",
        line: this.line,
        character: this.char,
        data: [ err.message ] // Platform dependent!
      });
    }

    return {
      type: Token.RegExp,
      value: value,
      flags: flags,
      isMalformed: malformed
    };
  },

  /*
   * Scan for any occurence of mixed tabs and spaces. If smarttabs option
   * is on, ignore tabs followed by spaces.
   *
   * Tabs followed by one space followed by a block comment are allowed.
   */
  scanMixedSpacesAndTabs: function () {
    var at, match;

    if (state.option.smarttabs) {
      // Negative look-behind for "//"
      match = this.input.match(/(\/\/|^\s?\*)? \t/);
      at = match && !match[1] ? 0 : -1;
    } else {
      at = this.input.search(/ \t|\t [^\*]/);
    }

    return at;
  },

  /*
   * Scan for characters that get silently deleted by one or more browsers.
   */
  scanUnsafeChars: function () {
    return this.input.search(reg.unsafeChars);
  },

  /*
   * Produce the next raw token or return 'null' if no tokens can be matched.
   * This method skips over all space characters.
   */
  next: function (checks) {
    this.from = this.char;

    // Move to the next non-space character.
    var start;
    if (/\s/.test(this.peek())) {
      start = this.char;

      while (/\s/.test(this.peek())) {
        this.from += 1;
        this.skip();
      }

      if (this.peek() === "") { // EOL
        if (!/^\s*$/.test(this.getLines()[this.line - 1]) && state.option.trailing) {
          this.trigger("warning", { code: "W102", line: this.line, character: start });
        }
      }
    }

    // Methods that work with multi-line structures and move the
    // character pointer.

    var match = this.scanComments() ||
      this.scanStringLiteral(checks);

    if (match) {
      return match;
    }

    // Methods that don't move the character pointer.

    match =
      this.scanRegExp() ||
      this.scanPunctuator() ||
      this.scanKeyword() ||
      this.scanIdentifier() ||
      this.scanNumericLiteral();

    if (match) {
      this.skip(match.value.length);
      return match;
    }

    // No token could be matched, give up.

    return null;
  },

  /*
   * Switch to the next line and reset all char pointers. Once
   * switched, this method also checks for mixed spaces and tabs
   * and other minor warnings.
   */
  nextLine: function () {
    var char;

    if (this.line >= this.getLines().length) {
      return false;
    }

    this.input = this.getLines()[this.line];
    this.line += 1;
    this.char = 1;
    this.from = 1;

    char = this.scanMixedSpacesAndTabs();
    if (char >= 0) {
      this.trigger("warning", { code: "W099", line: this.line, character: char + 1 });
    }

    this.input = this.input.replace(/\t/g, state.tab);
    char = this.scanUnsafeChars();

    if (char >= 0) {
      this.trigger("warning", { code: "W100", line: this.line, character: char });
    }

    // If there is a limit on line length, warn when lines get too
    // long.

    if (state.option.maxlen && state.option.maxlen < this.input.length) {
      this.trigger("warning", { code: "W101", line: this.line, character: this.input.length });
    }

    return true;
  },

  /*
   * This is simply a synonym for nextLine() method with a friendlier
   * public name.
   */
  start: function () {
    this.nextLine();
  },

  /*
   * Produce the next token. This function is called by advance() to get
   * the next token. It retuns a token in a JSLint-compatible format.
   */
  token: function () {
    /*jshint loopfunc:true */
    var checks = asyncTrigger();
    var token;


    function isReserved(token, isProperty) {
      if (!token.reserved) {
        return false;
      }
      var meta = token.meta;

      if (meta && meta.isFutureReservedWord && state.option.inES5()) {
        // ES3 FutureReservedWord in an ES5 environment.
        if (!meta.es5) {
          return false;
        }

        // Some ES5 FutureReservedWord identifiers are active only
        // within a strict mode environment.
        if (meta.strictOnly) {
          if (!state.option.strict && !state.directive["use strict"]) {
            return false;
          }
        }

        if (isProperty) {
          return false;
        }
      }

      return true;
    }

    // Produce a token object.
    var create = function (type, value, isProperty) {
      /*jshint validthis:true */
      var obj;

      if (type !== "(endline)" && type !== "(end)") {
        this.prereg = false;
      }

      if (type === "(punctuator)") {
        switch (value) {
        case ".":
        case ")":
        case "~":
        case "#":
        case "]":
          this.prereg = false;
          break;
        default:
          this.prereg = true;
        }

        obj = Object.create(state.syntax[value] || state.syntax["(error)"]);
      }

      if (type === "(identifier)") {
        if (value === "return" || value === "case" || value === "typeof") {
          this.prereg = true;
        }

        if (state.syntax.hasOwnProperty(value)) {
          obj = Object.create(state.syntax[value] || state.syntax["(error)"]);

          // If this can't be a reserved keyword, reset the object.
          if (!isReserved(obj, isProperty && type === "(identifier)")) {
            obj = null;
          }
        }
      }

      if (!obj) {
        obj = Object.create(state.syntax[type]);
      }

      obj.identifier = (type === "(identifier)");
      obj.type = obj.type || type;
      obj.value = value;
      obj.line = this.line;
      obj.character = this.char;
      obj.from = this.from;

      if (isProperty && obj.identifier) {
        obj.isProperty = isProperty;
      }

      obj.check = checks.check;

      return obj;
    }.bind(this);

    for (;;) {
      if (!this.input.length) {
        return create(this.nextLine() ? "(endline)" : "(end)", "");
      }

      token = this.next(checks);

      if (!token) {
        if (this.input.length) {
          // Unexpected character.
          this.trigger("error", {
            code: "E024",
            line: this.line,
            character: this.char,
            data: [ this.peek() ]
          });

          this.input = "";
        }

        continue;
      }

      switch (token.type) {
      case Token.StringLiteral:
        this.triggerAsync("String", {
          line: this.line,
          char: this.char,
          from: this.from,
          value: token.value,
          quote: token.quote
        }, checks, function () { return true; });

        return create("(string)", token.value);
      case Token.Identifier:
        this.trigger("Identifier", {
          line: this.line,
          char: this.char,
          from: this.form,
          name: token.value,
          isProperty: state.tokens.curr.id === "."
        });

        /* falls through */
      case Token.Keyword:
      case Token.NullLiteral:
      case Token.BooleanLiteral:
        return create("(identifier)", token.value, state.tokens.curr.id === ".");

      case Token.NumericLiteral:
        if (token.isMalformed) {
          this.trigger("warning", {
            code: "W045",
            line: this.line,
            character: this.char,
            data: [ token.value ]
          });
        }

        this.triggerAsync("warning", {
          code: "W114",
          line: this.line,
          character: this.char,
          data: [ "0x-" ]
        }, checks, function () { return token.base === 16 && state.jsonMode; });

        this.triggerAsync("warning", {
          code: "W115",
          line: this.line,
          character: this.char
        }, checks, function () {
          return state.directive["use strict"] && token.base === 8;
        });

        this.trigger("Number", {
          line: this.line,
          char: this.char,
          from: this.from,
          value: token.value,
          base: token.base,
          isMalformed: token.malformed
        });

        return create("(number)", token.value);

      case Token.RegExp:
        return create("(regexp)", token.value);

      case Token.Comment:
        state.tokens.curr.comment = true;

        if (token.isSpecial) {
          return {
            id: '(comment)',
            value: token.value,
            body: token.body,
            type: token.commentType,
            isSpecial: token.isSpecial,
            line: this.line,
            character: this.char,
            from: this.from
          };
        }

        break;

      case "":
        break;

      default:
        return create("(punctuator)", token.value);
      }
    }
  }
};

exports.Lexer = Lexer;

})()
},{"events":2,"./reg.js":5,"./state.js":6}],"jshint":[function(require,module,exports){
module.exports=require('FD4Lxs');
},{}],"FD4Lxs":[function(require,module,exports){
(function(){/*!
 * JSHint, by JSHint Community.
 *
 * This file (and this file only) is licensed under the same slightly modified
 * MIT license that JSLint is. It stops evil-doers everywhere:
 *
 *   Copyright (c) 2002 Douglas Crockford  (www.JSLint.com)
 *
 *   Permission is hereby granted, free of charge, to any person obtaining
 *   a copy of this software and associated documentation files (the "Software"),
 *   to deal in the Software without restriction, including without limitation
 *   the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *   and/or sell copies of the Software, and to permit persons to whom
 *   the Software is furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included
 *   in all copies or substantial portions of the Software.
 *
 *   The Software shall be used for Good, not Evil.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 *   DEALINGS IN THE SOFTWARE.
 *
 */

/*jshint quotmark:double */
/*global console:true */
/*exported console */

var events   = require("events");
var vars     = require("./vars.js");
var messages = require("./messages.js");
var Lexer    = require("./lex.js").Lexer;
var reg      = require("./reg.js");
var state    = require("./state.js").state;
var style    = require("./style.js");

// We need this module here because environments such as IE and Rhino
// don't necessarilly expose the 'console' API and browserify uses
// it to log things. It's a sad state of affair, really.
var console = require("console-browserify");

// We build the application inside a function so that we produce only a singleton
// variable. That function will be invoked immediately, and its return value is
// the JSHINT function itself.

var JSHINT = (function () {
  "use strict";

  var anonname, // The guessed name for anonymous functions.
    api, // Extension API

    // These are operators that should not be used with the ! operator.
    bang = {
      "<"  : true,
      "<=" : true,
      "==" : true,
      "===": true,
      "!==": true,
      "!=" : true,
      ">"  : true,
      ">=" : true,
      "+"  : true,
      "-"  : true,
      "*"  : true,
      "/"  : true,
      "%"  : true
    },

    // These are the JSHint boolean options.
    boolOptions = {
      asi         : true, // if automatic semicolon insertion should be tolerated
      bitwise     : true, // if bitwise operators should not be allowed
      boss        : true, // if advanced usage of assignments should be allowed
      browser     : true, // if the standard browser globals should be predefined
      camelcase   : true, // if identifiers should be required in camel case
      couch       : true, // if CouchDB globals should be predefined
      curly       : true, // if curly braces around all blocks should be required
      debug       : true, // if debugger statements should be allowed
      devel       : true, // if logging globals should be predefined (console, alert, etc.)
      dojo        : true, // if Dojo Toolkit globals should be predefined
      eqeqeq      : true, // if === should be required
      eqnull      : true, // if == null comparisons should be tolerated
      es3         : true, // if ES3 syntax should be allowed
      es5         : true, // if ES5 syntax should be allowed (is now set per default)
      esnext      : true, // if es.next specific syntax should be allowed
      moz         : true, // if mozilla specific syntax should be allowed
      evil        : true, // if eval should be allowed
      expr        : true, // if ExpressionStatement should be allowed as Programs
      forin       : true, // if for in statements must filter
      funcscope   : true, // if only function scope should be used for scope tests
      gcl         : true, // if JSHint should be compatible with Google Closure Linter
      globalstrict: true, // if global "use strict"; should be allowed (also enables 'strict')
      immed       : true, // if immediate invocations must be wrapped in parens
      iterator    : true, // if the `__iterator__` property should be allowed
      jquery      : true, // if jQuery globals should be predefined
      lastsemic   : true, // if semicolons may be ommitted for the trailing
                          // statements inside of a one-line blocks.
      laxbreak    : true, // if line breaks should not be checked
      laxcomma    : true, // if line breaks should not be checked around commas
      loopfunc    : true, // if functions should be allowed to be defined within
                          // loops
      mootools    : true, // if MooTools globals should be predefined
      multistr    : true, // allow multiline strings
      newcap      : true, // if constructor names must be capitalized
      noarg       : true, // if arguments.caller and arguments.callee should be
                          // disallowed
      node        : true, // if the Node.js environment globals should be
                          // predefined
      noempty     : true, // if empty blocks should be disallowed
      nonew       : true, // if using `new` for side-effects should be disallowed
      nonstandard : true, // if non-standard (but widely adopted) globals should
                          // be predefined
      nomen       : true, // if names should be checked
      onevar      : true, // if only one var statement per function should be
                          // allowed
      passfail    : true, // if the scan should stop on first error
      phantom     : true, // if PhantomJS symbols should be allowed
      plusplus    : true, // if increment/decrement should not be allowed
      proto       : true, // if the `__proto__` property should be allowed
      prototypejs : true, // if Prototype and Scriptaculous globals should be
                          // predefined
      rhino       : true, // if the Rhino environment globals should be predefined
      shelljs     : true, // if ShellJS globals should be predefined
      typed       : true, // if typed array globals should be predefined
      undef       : true, // if variables should be declared before used
      scripturl   : true, // if script-targeted URLs should be tolerated
      shadow      : true, // if variable shadowing should be tolerated
      smarttabs   : true, // if smarttabs should be tolerated
                          // (http://www.emacswiki.org/emacs/SmartTabs)
      strict      : true, // require the "use strict"; pragma
      sub         : true, // if all forms of subscript notation are tolerated
      supernew    : true, // if `new function () { ... };` and `new Object;`
                          // should be tolerated
      trailing    : true, // if trailing whitespace rules apply
      validthis   : true, // if 'this' inside a non-constructor function is valid.
                          // This is a function scoped option only.
      withstmt    : true, // if with statements should be allowed
      white       : true, // if strict whitespace rules apply
      worker      : true, // if Web Worker script symbols should be allowed
      wsh         : true, // if the Windows Scripting Host environment globals
                          // should be predefined
      yui         : true, // YUI variables should be predefined

      // Obsolete options
      onecase     : true, // if one case switch statements should be allowed
      regexp      : true, // if the . should not be allowed in regexp literals
      regexdash   : true  // if unescaped first/last dash (-) inside brackets
                          // should be tolerated
    },

    // These are the JSHint options that can take any value
    // (we use this object to detect invalid options)
    valOptions = {
      maxlen       : false,
      indent       : false,
      maxerr       : false,
      predef       : false,
      quotmark     : false, //'single'|'double'|true
      scope        : false,
      maxstatements: false, // {int} max statements per function
      maxdepth     : false, // {int} max nested block depth per function
      maxparams    : false, // {int} max params per function
      maxcomplexity: false, // {int} max cyclomatic complexity per function
      unused       : true,  // warn if variables are unused. Available options:
                            //   false    - don't check for unused variables
                            //   true     - "vars" + check last function param
                            //   "vars"   - skip checking unused function params
                            //   "strict" - "vars" + check all function params
      latedef      : false  // warn if the variable is used before its definition
                            //   false    - don't emit any warnings
                            //   true     - warn if any variable is used before its definition
                            //   "nofunc" - warn for any variable but function declarations
    },

    // These are JSHint boolean options which are shared with JSLint
    // where the definition in JSHint is opposite JSLint
    invertedOptions = {
      bitwise : true,
      forin   : true,
      newcap  : true,
      nomen   : true,
      plusplus: true,
      regexp  : true,
      undef   : true,
      white   : true,

      // Inverted and renamed, use JSHint name here
      eqeqeq  : true,
      onevar  : true,
      strict  : true
    },

    // These are JSHint boolean options which are shared with JSLint
    // where the name has been changed but the effect is unchanged
    renamedOptions = {
      eqeq   : "eqeqeq",
      vars   : "onevar",
      windows: "wsh",
      sloppy : "strict"
    },

    declared, // Globals that were declared using /*global ... */ syntax.
    exported, // Variables that are used outside of the current file.

    functionicity = [
      "closure", "exception", "global", "label",
      "outer", "unused", "var"
    ],

    funct, // The current function
    functions, // All of the functions

    global, // The global scope
    implied, // Implied globals
    inblock,
    indent,
    lookahead,
    lex,
    member,
    membersOnly,
    noreach,
    predefined,   // Global variables defined by option

    scope,  // The current scope
    stack,
    unuseds,
    urls,
    warnings,

    extraModules = [],
    emitter = new events.EventEmitter(),
        
    hasOwnProperty = Object.prototype.hasOwnProperty,
    _ = {};

  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  _.contains = function(obj, target) {
    if (obj === null || obj === undefined) {
      return false;
    }
    return obj.indexOf(target) !== -1;
  };

  function checkOption(name, t) {
    name = name.trim();

    if (/^[+-]W\d{3}$/g.test(name)) {
      return true;
    }

    if (valOptions[name] === undefined && boolOptions[name] === undefined) {
      if (t.type !== "jslint") {
        error("E001", t, name);
        return false;
      }
    }

    return true;
  }

  function isString(obj) {
    return Object.prototype.toString.call(obj) === "[object String]";
  }

  function isIdentifier(tkn, value) {
    if (!tkn)
      return false;

    if (!tkn.identifier || tkn.value !== value)
      return false;

    return true;
  }

  function isReserved(token) {
    if (!token.reserved) {
      return false;
    }
    var meta = token.meta;

    if (meta && meta.isFutureReservedWord && state.option.inES5()) {
      // ES3 FutureReservedWord in an ES5 environment.
      if (!meta.es5) {
        return false;
      }

      // Some ES5 FutureReservedWord identifiers are active only
      // within a strict mode environment.
      if (meta.strictOnly) {
        if (!state.option.strict && !state.directive["use strict"]) {
          return false;
        }
      }

      if (token.isProperty) {
        return false;
      }
    }

    return true;
  }

  function supplant(str, data) {
    return str.replace(/\{([^{}]*)\}/g, function (a, b) {
      var r = data[b];
      return typeof r === "string" || typeof r === "number" ? r : a;
    });
  }

  function combine(t, o) {
    var n;
    for (n in o) {
      if (_.has(o, n) && !_.has(JSHINT.blacklist, n)) {
        t[n] = o[n];
      }
    }
  }

  function updatePredefined() {
    Object.keys(JSHINT.blacklist).forEach(function (key) {
      delete predefined[key];
    });
  }

  function assume() {
    if (state.option.es5) {
      warning("I003");
    }
    if (state.option.couch) {
      combine(predefined, vars.couch);
    }

    if (state.option.rhino) {
      combine(predefined, vars.rhino);
    }

    if (state.option.shelljs) {
      combine(predefined, vars.shelljs);
      combine(predefined, vars.node);
    }
    if (state.option.typed) {
      combine(predefined, vars.typed);
    }

    if (state.option.phantom) {
      combine(predefined, vars.phantom);
    }

    if (state.option.prototypejs) {
      combine(predefined, vars.prototypejs);
    }

    if (state.option.node) {
      combine(predefined, vars.node);
      combine(predefined, vars.typed);
    }

    if (state.option.devel) {
      combine(predefined, vars.devel);
    }

    if (state.option.dojo) {
      combine(predefined, vars.dojo);
    }

    if (state.option.browser) {
      combine(predefined, vars.browser);
      combine(predefined, vars.typed);
    }

    if (state.option.nonstandard) {
      combine(predefined, vars.nonstandard);
    }

    if (state.option.jquery) {
      combine(predefined, vars.jquery);
    }

    if (state.option.mootools) {
      combine(predefined, vars.mootools);
    }

    if (state.option.worker) {
      combine(predefined, vars.worker);
    }

    if (state.option.wsh) {
      combine(predefined, vars.wsh);
    }

    if (state.option.globalstrict && state.option.strict !== false) {
      state.option.strict = true;
    }

    if (state.option.yui) {
      combine(predefined, vars.yui);
    }

    // Let's assume that chronologically ES3 < ES5 < ES6/ESNext < Moz

    state.option.inMoz = function (strict) {
      if (strict) {
        return state.option.moz && !state.option.esnext;
      }
      return state.option.moz;
    };

    state.option.inESNext = function (strict) {
      if (strict) {
        return !state.option.moz && state.option.esnext;
      }
      return state.option.moz || state.option.esnext;
    };

    state.option.inES5 = function (/* strict */) {
      return !state.option.es3;
    };

    state.option.inES3 = function (strict) {
      if (strict) {
        return !state.option.moz && !state.option.esnext && state.option.es3;
      }
      return state.option.es3;
    };
  }

  // Produce an error warning.
  function quit(code, line, chr) {
    var percentage = Math.floor((line / state.lines.length) * 100);
    var message = messages.errors[code].desc;

    throw {
      name: "JSHintError",
      line: line,
      character: chr,
      message: message + " (" + percentage + "% scanned).",
      raw: message,
      code: code
    };
  }

  function isundef(scope, code, token, a) {
    return JSHINT.undefs.push([scope, code, token, a]);
  }

  function warning(code, t, a, b, c, d) {
    var ch, l, w, msg;

    if (/^W\d{3}$/.test(code)) {
      if (state.ignored[code])
        return;

      msg = messages.warnings[code];
    } else if (/E\d{3}/.test(code)) {
      msg = messages.errors[code];
    } else if (/I\d{3}/.test(code)) {
      msg = messages.info[code];
    }

    t = t || state.tokens.next;
    if (t.id === "(end)") {  // `~
      t = state.tokens.curr;
    }

    l = t.line || 0;
    ch = t.from || 0;

    w = {
      id: "(error)",
      raw: msg.desc,
      code: msg.code,
      evidence: state.lines[l - 1] || "",
      line: l,
      character: ch,
      scope: JSHINT.scope,
      a: a,
      b: b,
      c: c,
      d: d
    };

    w.reason = supplant(msg.desc, w);
    JSHINT.errors.push(w);

    if (state.option.passfail) {
      quit("E042", l, ch);
    }

    warnings += 1;
    if (warnings >= state.option.maxerr) {
      quit("E043", l, ch);
    }

    return w;
  }

  function warningAt(m, l, ch, a, b, c, d) {
    return warning(m, {
      line: l,
      from: ch
    }, a, b, c, d);
  }

  function error(m, t, a, b, c, d) {
    warning(m, t, a, b, c, d);
  }

  function errorAt(m, l, ch, a, b, c, d) {
    return error(m, {
      line: l,
      from: ch
    }, a, b, c, d);
  }

  // Tracking of "internal" scripts, like eval containing a static string
  function addInternalSrc(elem, src) {
    var i;
    i = {
      id: "(internal)",
      elem: elem,
      value: src
    };
    JSHINT.internals.push(i);
    return i;
  }

  function addlabel(t, type, tkn, islet) {
    // Define t in the current function in the current scope.
    if (type === "exception") {
      if (_.has(funct["(context)"], t)) {
        if (funct[t] !== true && !state.option.node) {
          warning("W002", state.tokens.next, t);
        }
      }
    }

    if (_.has(funct, t) && !funct["(global)"]) {
      if (funct[t] === true) {
        if (state.option.latedef) {
          if ((state.option.latedef === true && _.contains([funct[t], type], "unction")) ||
              !_.contains([funct[t], type], "unction")) {
            warning("W003", state.tokens.next, t);
          }
        }
      } else {
        if (!state.option.shadow && type !== "exception" ||
              (funct["(blockscope)"].getlabel(t))) {
          warning("W004", state.tokens.next, t);
        }
      }
    }

    // a double definition of a let variable in same block throws a TypeError
    if (funct["(blockscope)"] && funct["(blockscope)"].current.has(t)) {
      error("E044", state.tokens.next, t);
    }

    // if the identifier is from a let, adds it only to the current blockscope
    if (islet) {
      funct["(blockscope)"].current.add(t, type, state.tokens.curr);
    } else {

      funct[t] = type;

      if (tkn) {
        funct["(tokens)"][t] = tkn;
      }

      if (funct["(global)"]) {
        global[t] = funct;
        if (_.has(implied, t)) {
          if (state.option.latedef) {
            if ((state.option.latedef === true && _.contains([funct[t], type], "unction")) ||
                !_.contains([funct[t], type], "unction")) {
              warning("W003", state.tokens.next, t);
            }
          }

          delete implied[t];
        }
      } else {
        scope[t] = funct;
      }
    }
  }

  function doOption() {
    var nt = state.tokens.next;
    var body = nt.body.split(",").map(function (s) { return s.trim(); });
    var predef = {};

    if (nt.type === "globals") {
      body.forEach(function (g) {
        g = g.split(":");
        var key = (g[0] || "").trim();
        var val = (g[1] || "").trim();

        if (key.charAt(0) === "-") {
          key = key.slice(1);
          val = false;

          JSHINT.blacklist[key] = key;
          updatePredefined();
        } else {
          predef[key] = (val === "true");
        }
      });

      combine(predefined, predef);

      for (var key in predef) {
        if (_.has(predef, key)) {
          declared[key] = nt;
        }
      }
    }

    if (nt.type === "exported") {
      body.forEach(function (e) {
        exported[e] = true;
      });
    }

    if (nt.type === "members") {
      membersOnly = membersOnly || {};

      body.forEach(function (m) {
        var ch1 = m.charAt(0);
        var ch2 = m.charAt(m.length - 1);

        if (ch1 === ch2 && (ch1 === "\"" || ch1 === "'")) {
          m = m
            .substr(1, m.length - 2)
            .replace("\\b", "\b")
            .replace("\\t", "\t")
            .replace("\\n", "\n")
            .replace("\\v", "\v")
            .replace("\\f", "\f")
            .replace("\\r", "\r")
            .replace("\\\\", "\\")
            .replace("\\\"", "\"");
        }

        membersOnly[m] = false;
      });
    }

    var numvals = [
      "maxstatements",
      "maxparams",
      "maxdepth",
      "maxcomplexity",
      "maxerr",
      "maxlen",
      "indent"
    ];

    if (nt.type === "jshint" || nt.type === "jslint") {
      body.forEach(function (g) {
        g = g.split(":");
        var key = (g[0] || "").trim();
        var val = (g[1] || "").trim();

        if (!checkOption(key, nt)) {
          return;
        }

        if (numvals.indexOf(key) >= 0) {

          // GH988 - numeric options can be disabled by setting them to `false`
          if (val !== "false") {
            val = +val;

            if (typeof val !== "number" || !isFinite(val) || val <= 0 || Math.floor(val) !== val) {
              error("E032", nt, g[1].trim());
              return;
            }

            if (key === "indent") {
              state.option["(explicitIndent)"] = true;
            }
            state.option[key] = val;
          } else {
            if (key === "indent") {
              state.option["(explicitIndent)"] = false;
            } else {
              state.option[key] = false;
            }
          }

          return;
        }

        if (key === "validthis") {
          // `validthis` is valid only within a function scope.
          if (funct["(global)"]) {
            error("E009");
          } else {
            if (val === "true" || val === "false") {
              state.option.validthis = (val === "true");
            } else {
              error("E002", nt);
            }
          }
          return;
        }

        if (key === "quotmark") {
          switch (val) {
          case "true":
          case "false":
            state.option.quotmark = (val === "true");
            break;
          case "double":
          case "single":
            state.option.quotmark = val;
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        if (key === "unused") {
          switch (val) {
          case "true":
            state.option.unused = true;
            break;
          case "false":
            state.option.unused = false;
            break;
          case "vars":
          case "strict":
            state.option.unused = val;
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        if (key === "latedef") {
          switch (val) {
          case "true":
            state.option.latedef = true;
            break;
          case "false":
            state.option.latedef = false;
            break;
          case "nofunc":
            state.option.latedef = "nofunc";
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        var match = /^([+-])(W\d{3})$/g.exec(key);
        if (match) {
          // ignore for -W..., unignore for +W...
          state.ignored[match[2]] = (match[1] === "-");
          return;
        }

        var tn;
        if (val === "true" || val === "false") {
          if (nt.type === "jslint") {
            tn = renamedOptions[key] || key;
            state.option[tn] = (val === "true");

            if (invertedOptions[tn] !== undefined) {
              state.option[tn] = !state.option[tn];
            }
          } else {
            state.option[key] = (val === "true");
          }

          if (key === "newcap") {
            state.option["(explicitNewcap)"] = true;
          }
          return;
        }

        error("E002", nt);
      });

      assume();
    }
  }

  // We need a peek function. If it has an argument, it peeks that much farther
  // ahead. It is used to distinguish
  //     for ( var i in ...
  // from
  //     for ( var i = ...

  function peek(p) {
    var i = p || 0, j = 0, t;

    while (j <= i) {
      t = lookahead[j];
      if (!t) {
        t = lookahead[j] = lex.token();
      }
      j += 1;
    }
    return t;
  }

  // Produce the next token. It looks for programming errors.

  function advance(id, t) {
    switch (state.tokens.curr.id) {
    case "(number)":
      if (state.tokens.next.id === ".") {
        warning("W005", state.tokens.curr);
      }
      break;
    case "-":
      if (state.tokens.next.id === "-" || state.tokens.next.id === "--") {
        warning("W006");
      }
      break;
    case "+":
      if (state.tokens.next.id === "+" || state.tokens.next.id === "++") {
        warning("W007");
      }
      break;
    }

    if (state.tokens.curr.type === "(string)" || state.tokens.curr.identifier) {
      anonname = state.tokens.curr.value;
    }

    if (id && state.tokens.next.id !== id) {
      if (t) {
        if (state.tokens.next.id === "(end)") {
          error("E019", t, t.id);
        } else {
          error("E020", state.tokens.next, id, t.id, t.line, state.tokens.next.value);
        }
      } else if (state.tokens.next.type !== "(identifier)" || state.tokens.next.value !== id) {
        warning("W116", state.tokens.next, id, state.tokens.next.value);
      }
    }

    state.tokens.prev = state.tokens.curr;
    state.tokens.curr = state.tokens.next;
    for (;;) {
      state.tokens.next = lookahead.shift() || lex.token();

      if (!state.tokens.next) { // No more tokens left, give up
        quit("E041", state.tokens.curr.line);
      }

      if (state.tokens.next.id === "(end)" || state.tokens.next.id === "(error)") {
        return;
      }

      if (state.tokens.next.check) {
        state.tokens.next.check();
      }

      if (state.tokens.next.isSpecial) {
        doOption();
      } else {
        if (state.tokens.next.id !== "(endline)") {
          break;
        }
      }
    }
  }

  function isInfix(token) {
    return token.infix || (!token.identifier && !!token.led);
  }

  function isEndOfExpr() {
    var curr = state.tokens.curr;
    var next = state.tokens.next;
    if (next.id === ";" || next.id === "}" || next.id === ":") {
      return true;
    }
    if (isInfix(next) === isInfix(curr) || (curr.id === "yield" && state.option.inMoz(true))) {
      return curr.line !== next.line;
    }
    return false;
  }

  // This is the heart of JSHINT, the Pratt parser. In addition to parsing, it
  // is looking for ad hoc lint patterns. We add .fud to Pratt's model, which is
  // like .nud except that it is only used on the first token of a statement.
  // Having .fud makes it much easier to define statement-oriented languages like
  // JavaScript. I retained Pratt's nomenclature.

  // .nud  Null denotation
  // .fud  First null denotation
  // .led  Left denotation
  //  lbp  Left binding power
  //  rbp  Right binding power

  // They are elements of the parsing method called Top Down Operator Precedence.

  function expression(rbp, initial) {
    var left, isArray = false, isObject = false, isLetExpr = false;

    // if current expression is a let expression
    if (!initial && state.tokens.next.value === "let" && peek(0).value === "(") {
      if (!state.option.inMoz(true)) {
        warning("W118", state.tokens.next, "let expressions");
      }
      isLetExpr = true;
      // create a new block scope we use only for the current expression
      funct["(blockscope)"].stack();
      advance("let");
      advance("(");
      state.syntax["let"].fud.call(state.syntax["let"].fud, false);
      advance(")");
    }

    if (state.tokens.next.id === "(end)")
      error("E006", state.tokens.curr);

    advance();

    if (initial) {
      anonname = "anonymous";
      funct["(verb)"] = state.tokens.curr.value;
    }

    if (initial === true && state.tokens.curr.fud) {
      left = state.tokens.curr.fud();
    } else {
      if (state.tokens.curr.nud) {
        left = state.tokens.curr.nud();
      } else {
        if (state.tokens.curr.value === ",") {
          error("E052", state.tokens.curr, state.tokens.curr.id);
        } else {
          error("E030", state.tokens.curr, state.tokens.curr.id);
        }
      }

      while (rbp < state.tokens.next.lbp && !isEndOfExpr()) {
        isArray = state.tokens.curr.value === "Array";
        isObject = state.tokens.curr.value === "Object";

        // #527, new Foo.Array(), Foo.Array(), new Foo.Object(), Foo.Object()
        // Line breaks in IfStatement heads exist to satisfy the checkJSHint
        // "Line too long." error.
        if (left && (left.value || (left.first && left.first.value))) {
          // If the left.value is not "new", or the left.first.value is a "."
          // then safely assume that this is not "new Array()" and possibly
          // not "new Object()"...
          if (left.value !== "new" ||
            (left.first && left.first.value && left.first.value === ".")) {
            isArray = false;
            // ...In the case of Object, if the left.value and state.tokens.curr.value
            // are not equal, then safely assume that this not "new Object()"
            if (left.value !== state.tokens.curr.value) {
              isObject = false;
            }
          }
        }

        advance();

        if (isArray && state.tokens.curr.id === "(" && state.tokens.next.id === ")") {
          warning("W009", state.tokens.curr);
        }

        if (isObject && state.tokens.curr.id === "(" && state.tokens.next.id === ")") {
          warning("W010", state.tokens.curr);
        }

        if (left && state.tokens.curr.led) {
          left = state.tokens.curr.led(left);
        } else {
          error("E033", state.tokens.curr, state.tokens.curr.id);
        }
      }
    }
    if (isLetExpr) {
      funct["(blockscope)"].unstack();
    }
    return left;
  }


// Functions for conformance of style.

  function adjacent(left, right) {
    left = left || state.tokens.curr;
    right = right || state.tokens.next;
    if (state.option.white) {
      if (left.character !== right.from && left.line === right.line) {
        left.from += (left.character - left.from);
        warning("W011", left, left.value);
      }
    }
  }

  function nobreak(left, right) {
    left = left || state.tokens.curr;
    right = right || state.tokens.next;
    if (state.option.white && (left.character !== right.from || left.line !== right.line)) {
      warning("W012", right, right.value);
    }
  }

  function nospace(left, right) {
    left = left || state.tokens.curr;
    right = right || state.tokens.next;
    if (state.option.white && !left.comment) {
      if (left.line === right.line) {
        adjacent(left, right);
      }
    }
  }

  function nonadjacent(left, right) {
    if (state.option.white) {
      left = left || state.tokens.curr;
      right = right || state.tokens.next;

      if (left.value === ";" && right.value === ";") {
        return;
      }

      if (left.line === right.line && left.character === right.from) {
        left.from += (left.character - left.from);
        warning("W013", left, left.value);
      }
    }
  }

  function nobreaknonadjacent(left, right) {
    left = left || state.tokens.curr;
    right = right || state.tokens.next;
    if (!state.option.laxbreak && left.line !== right.line) {
      warning("W014", right, right.value);
    } else if (state.option.white) {
      left = left || state.tokens.curr;
      right = right || state.tokens.next;
      if (left.character === right.from) {
        left.from += (left.character - left.from);
        warning("W013", left, left.value);
      }
    }
  }

  function indentation(bias) {
    if (!state.option.white && !state.option["(explicitIndent)"]) {
      return;
    }

    if (state.tokens.next.id === "(end)") {
      return;
    }

    var i = indent + (bias || 0);
    if (state.tokens.next.from !== i) {
      warning("W015", state.tokens.next, state.tokens.next.value, i, state.tokens.next.from);
    }
  }

  function nolinebreak(t) {
    t = t || state.tokens.curr;
    if (t.line !== state.tokens.next.line) {
      warning("E022", t, t.value);
    }
  }

  function nobreakcomma(left, right) {
    if (left.line !== right.line) {
      if (!state.option.laxcomma) {
        if (comma.first) {
          warning("I001");
          comma.first = false;
        }
        warning("W014", left, right.value);
      }
    } else if (!left.comment && left.character !== right.from && state.option.white) {
      left.from += (left.character - left.from);
      warning("W011", left, left.value);
    }
  }

  function comma(opts) {
    opts = opts || {};

    if (!opts.peek) {
      nobreakcomma(state.tokens.curr, state.tokens.next);
      advance(",");
    } else {
      nobreakcomma(state.tokens.prev, state.tokens.curr);
    }

    // TODO: This is a temporary solution to fight against false-positives in
    // arrays and objects with trailing commas (see GH-363). The best solution
    // would be to extract all whitespace rules out of parser.

    if (state.tokens.next.value !== "]" && state.tokens.next.value !== "}") {
      nonadjacent(state.tokens.curr, state.tokens.next);
    }

    if (state.tokens.next.identifier && !(opts.property && state.option.inES5())) {
      // Keywords that cannot follow a comma operator.
      switch (state.tokens.next.value) {
      case "break":
      case "case":
      case "catch":
      case "continue":
      case "default":
      case "do":
      case "else":
      case "finally":
      case "for":
      case "if":
      case "in":
      case "instanceof":
      case "return":
      case "switch":
      case "throw":
      case "try":
      case "var":
      case "let":
      case "while":
      case "with":
        error("E024", state.tokens.next, state.tokens.next.value);
        return false;
      }
    }

    if (state.tokens.next.type === "(punctuator)") {
      switch (state.tokens.next.value) {
      case "}":
      case "]":
      case ",":
        if (opts.allowTrailing) {
          return true;
        }

        /* falls through */
      case ")":
        var errorCode = "E024";
        if (state.tokens.next.value === ")") {
          errorCode = "E053";
        } else if (state.tokens.next.value === ",") {
          errorCode = "E052";
        }
        error(errorCode, state.tokens.next, state.tokens.next.value);
        return false;
      }
    }
    return true;
  }

  // Functional constructors for making the symbols that will be inherited by
  // tokens.

  function symbol(s, p) {
    var x = state.syntax[s];
    if (!x || typeof x !== "object") {
      state.syntax[s] = x = {
        id: s,
        lbp: p,
        value: s
      };
    }
    return x;
  }

  function delim(s) {
    return symbol(s, 0);
  }

  function stmt(s, f) {
    var x = delim(s);
    x.identifier = x.reserved = true;
    x.fud = f;
    return x;
  }

  function blockstmt(s, f) {
    var x = stmt(s, f);
    x.block = true;
    return x;
  }

  function reserveName(x) {
    var c = x.id.charAt(0);
    if ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z")) {
      x.identifier = x.reserved = true;
    }
    return x;
  }

  function prefix(s, f) {
    var x = symbol(s, 150);
    reserveName(x);
    x.nud = (typeof f === "function") ? f : function () {
      this.right = expression(150);
      this.arity = "unary";
      if (this.id === "++" || this.id === "--") {
        if (state.option.plusplus) {
          warning("W016", this, this.id);
        } else if ((!this.right.identifier || isReserved(this.right)) &&
            this.right.id !== "." && this.right.id !== "[") {
          warning("W017", this);
        }
      }
      return this;
    };
    return x;
  }

  function type(s, f) {
    var x = delim(s);
    x.type = s;
    x.nud = f;
    return x;
  }

  function reserve(name, func) {
    var x = type(name, func);
    x.identifier = true;
    x.reserved = true;
    return x;
  }

  function FutureReservedWord(name, meta) {
    var x = type(name, (meta && meta.nud) || function () {
      return this;
    });

    meta = meta || {};
    meta.isFutureReservedWord = true;

    x.value = name;
    x.identifier = true;
    x.reserved = true;
    x.meta = meta;

    return x;
  }

  function reservevar(s, v) {
    return reserve(s, function () {
      if (typeof v === "function") {
        v(this);
      }
      return this;
    });
  }

  function infix(s, f, p, w) {
    var x = symbol(s, p);
    reserveName(x);
    x.infix = true;
    x.led = function (left) {
      if (!w) {
        nobreaknonadjacent(state.tokens.prev, state.tokens.curr);
        nonadjacent(state.tokens.curr, state.tokens.next);
      }
      if (s === "in" && left.id === "!") {
        warning("W018", left, "!");
      }
      if (typeof f === "function") {
        return f(left, this);
      } else {
        this.left = left;
        this.right = expression(p);
        return this;
      }
    };
    return x;
  }


  function application(s) {
    var x = symbol(s, 42);

    x.led = function (left) {
      if (!state.option.inESNext()) {
        warning("W104", state.tokens.curr, "arrow function syntax (=>)");
      }

      nobreaknonadjacent(state.tokens.prev, state.tokens.curr);
      nonadjacent(state.tokens.curr, state.tokens.next);

      this.left = left;
      this.right = doFunction(undefined, undefined, false, left);
      return this;
    };
    return x;
  }

  function relation(s, f) {
    var x = symbol(s, 100);

    x.led = function (left) {
      nobreaknonadjacent(state.tokens.prev, state.tokens.curr);
      nonadjacent(state.tokens.curr, state.tokens.next);
      var right = expression(100);

      if (isIdentifier(left, "NaN") || isIdentifier(right, "NaN")) {
        warning("W019", this);
      } else if (f) {
        f.apply(this, [left, right]);
      }

      if (!left || !right) {
        quit("E041", state.tokens.curr.line);
      }

      if (left.id === "!") {
        warning("W018", left, "!");
      }

      if (right.id === "!") {
        warning("W018", right, "!");
      }

      this.left = left;
      this.right = right;
      return this;
    };
    return x;
  }

  function isPoorRelation(node) {
    return node &&
        ((node.type === "(number)" && +node.value === 0) ||
         (node.type === "(string)" && node.value === "") ||
         (node.type === "null" && !state.option.eqnull) ||
        node.type === "true" ||
        node.type === "false" ||
        node.type === "undefined");
  }

  function assignop(s, f, p) {
    var x = infix(s, typeof f === "function" ? f : function (left, that) {
      that.left = left;

      if (left) {
        if (predefined[left.value] === false &&
            scope[left.value]["(global)"] === true) {
          warning("W020", left);
        } else if (left["function"]) {
          warning("W021", left, left.value);
        }

        if (funct[left.value] === "const") {
          error("E013", left, left.value);
        }

        if (left.id === ".") {
          if (!left.left) {
            warning("E031", that);
          } else if (left.left.value === "arguments" && !state.directive["use strict"]) {
            warning("E031", that);
          }

          that.right = expression(10);
          return that;
        } else if (left.id === "[") {
          if (state.tokens.curr.left.first) {
            state.tokens.curr.left.first.forEach(function (t) {
              if (funct[t.value] === "const") {
                error("E013", t, t.value);
              }
            });
          } else if (!left.left) {
            warning("E031", that);
          } else if (left.left.value === "arguments" && !state.directive["use strict"]) {
            warning("E031", that);
          }
          that.right = expression(10);
          return that;
        } else if (left.identifier && !isReserved(left)) {
          if (funct[left.value] === "exception") {
            warning("W022", left);
          }
          that.right = expression(10);
          return that;
        }

        if (left === state.syntax["function"]) {
          warning("W023", state.tokens.curr);
        }
      }

      error("E031", that);
    }, p);

    x.exps = true;
    x.assign = true;
    return x;
  }


  function bitwise(s, f, p) {
    var x = symbol(s, p);
    reserveName(x);
    x.led = (typeof f === "function") ? f : function (left) {
      if (state.option.bitwise) {
        warning("W016", this, this.id);
      }
      this.left = left;
      this.right = expression(p);
      return this;
    };
    return x;
  }


  function bitwiseassignop(s) {
    return assignop(s, function (left, that) {
      if (state.option.bitwise) {
        warning("W016", that, that.id);
      }
      nonadjacent(state.tokens.prev, state.tokens.curr);
      nonadjacent(state.tokens.curr, state.tokens.next);
      if (left) {
        if (left.id === "." || left.id === "[" ||
            (left.identifier && !isReserved(left))) {
          expression(10);
          return that;
        }
        if (left === state.syntax["function"]) {
          warning("W023", state.tokens.curr);
        }
        return that;
      }
      error("E031", that);
    }, 20);
  }


  function suffix(s) {
    var x = symbol(s, 150);

    x.led = function (left) {
      if (state.option.plusplus) {
        warning("W016", this, this.id);
      } else if ((!left.identifier || isReserved(left)) && left.id !== "." && left.id !== "[") {
        warning("W017", this);
      }

      this.left = left;
      return this;
    };
    return x;
  }

  // fnparam means that this identifier is being defined as a function
  // argument (see identifier())
  // prop means that this identifier is that of an object property

  function optionalidentifier(fnparam, prop) {
    if (!state.tokens.next.identifier) {
      return;
    }

    advance();

    var curr = state.tokens.curr;
    var val  = state.tokens.curr.value;

    if (!isReserved(curr)) {
      return val;
    }

    if (prop) {
      if (state.option.inES5()) {
        return val;
      }
    }

    if (fnparam && val === "undefined") {
      return val;
    }

    // Display an info message about reserved words as properties
    // and ES5 but do it only once.
    if (prop && !api.getCache("displayed:I002")) {
      api.setCache("displayed:I002", true);
      warning("I002");
    }

    warning("W024", state.tokens.curr, state.tokens.curr.id);
    return val;
  }

  // fnparam means that this identifier is being defined as a function
  // argument
  // prop means that this identifier is that of an object property
  function identifier(fnparam, prop) {
    var i = optionalidentifier(fnparam, prop);
    if (i) {
      return i;
    }
    if (state.tokens.curr.id === "function" && state.tokens.next.id === "(") {
      warning("W025");
    } else {
      error("E030", state.tokens.next, state.tokens.next.value);
    }
  }


  function reachable(s) {
    var i = 0, t;
    if (state.tokens.next.id !== ";" || noreach) {
      return;
    }
    for (;;) {
      do {
        t = peek(i);
        i += 1;
      } while (t.id != "(end)" && t.id === "(comment)");

      if (t.reach) {
        return;
      }
      if (t.id !== "(endline)") {
        if (t.id === "function") {
          if (!state.option.latedef) {
            break;
          }

          warning("W026", t);
          break;
        }

        warning("W027", t, t.value, s);
        break;
      }
    }
  }


  function statement(noindent) {
    var values;
    var i = indent, r, s = scope, t = state.tokens.next;

    if (t.id === ";") {
      advance(";");
      return;
    }

    // Is this a labelled statement?
    var res = isReserved(t);

    // We're being more tolerant here: if someone uses
    // a FutureReservedWord as a label, we warn but proceed
    // anyway.

    if (res && t.meta && t.meta.isFutureReservedWord && peek().id === ":") {
      warning("W024", t, t.id);
      res = false;
    }

    // detect a destructuring assignment
    if (_.has(["[", "{"], t.value)) {
      if (lookupBlockType().isDestAssign) {
        if (!state.option.inESNext()) {
          warning("W104", state.tokens.curr, "destructuring expression");
        }
        values = destructuringExpression();
        values.forEach(function (tok) {
          isundef(funct, "W117", tok.token, tok.id);
        });
        advance("=");
        destructuringExpressionMatch(values, expression(10, true));
        advance(";");
        return;
      }
    }
    if (t.identifier && !res && peek().id === ":") {
      advance();
      advance(":");
      scope = Object.create(s);
      addlabel(t.value, "label");

      if (!state.tokens.next.labelled && state.tokens.next.value !== "{") {
        warning("W028", state.tokens.next, t.value, state.tokens.next.value);
      }

      state.tokens.next.label = t.value;
      t = state.tokens.next;
    }

    // Is it a lonely block?

    if (t.id === "{") {
      block(true, true);
      return;
    }

    // Parse the statement.

    if (!noindent) {
      indentation();
    }
    r = expression(0, true);

    // Look for the final semicolon.

    if (!t.block) {
      if (!state.option.expr && (!r || !r.exps)) {
        warning("W030", state.tokens.curr);
      } else if (state.option.nonew && r && r.left && r.id === "(" && r.left.id === "new") {
        warning("W031", t);
      }

      if (state.tokens.next.id !== ";") {
        if (!state.option.asi) {
          // If this is the last statement in a block that ends on
          // the same line *and* option lastsemic is on, ignore the warning.
          // Otherwise, complain about missing semicolon.
          if (!state.option.lastsemic || state.tokens.next.id !== "}" ||
            state.tokens.next.line !== state.tokens.curr.line) {
            warningAt("W033", state.tokens.curr.line, state.tokens.curr.character);
          }
        }
      } else {
        adjacent(state.tokens.curr, state.tokens.next);
        advance(";");
        nonadjacent(state.tokens.curr, state.tokens.next);
      }
    }

    // Restore the indentation.

    indent = i;
    scope = s;
    return r;
  }


  function statements(startLine) {
    var a = [], p;

    while (!state.tokens.next.reach && state.tokens.next.id !== "(end)") {
      if (state.tokens.next.id === ";") {
        p = peek();

        if (!p || (p.id !== "(" && p.id !== "[")) {
          warning("W032");
        }

        advance(";");
      } else {
        a.push(statement(startLine === state.tokens.next.line));
      }
    }
    return a;
  }


  /*
   * read all directives
   * recognizes a simple form of asi, but always
   * warns, if it is used
   */
  function directives() {
    var i, p, pn;

    for (;;) {
      if (state.tokens.next.id === "(string)") {
        p = peek(0);
        if (p.id === "(endline)") {
          i = 1;
          do {
            pn = peek(i);
            i = i + 1;
          } while (pn.id === "(endline)");

          if (pn.id !== ";") {
            if (pn.id !== "(string)" && pn.id !== "(number)" &&
              pn.id !== "(regexp)" && pn.identifier !== true &&
              pn.id !== "}") {
              break;
            }
            warning("W033", state.tokens.next);
          } else {
            p = pn;
          }
        } else if (p.id === "}") {
          // Directive with no other statements, warn about missing semicolon
          warning("W033", p);
        } else if (p.id !== ";") {
          break;
        }

        indentation();
        advance();
        if (state.directive[state.tokens.curr.value]) {
          warning("W034", state.tokens.curr, state.tokens.curr.value);
        }

        if (state.tokens.curr.value === "use strict") {
          if (!state.option["(explicitNewcap)"])
            state.option.newcap = true;
          state.option.undef = true;
        }

        // there's no directive negation, so always set to true
        state.directive[state.tokens.curr.value] = true;

        if (p.id === ";") {
          advance(";");
        }
        continue;
      }
      break;
    }
  }


  /*
   * Parses a single block. A block is a sequence of statements wrapped in
   * braces.
   *
   * ordinary - true for everything but function bodies and try blocks.
   * stmt   - true if block can be a single statement (e.g. in if/for/while).
   * isfunc - true if block is a function body
   */
  function block(ordinary, stmt, isfunc, isfatarrow) {
    var a,
      b = inblock,
      old_indent = indent,
      m,
      s = scope,
      t,
      line,
      d;

    inblock = ordinary;

    if (!ordinary || !state.option.funcscope)
      scope = Object.create(scope);

    nonadjacent(state.tokens.curr, state.tokens.next);
    t = state.tokens.next;

    var metrics = funct["(metrics)"];
    metrics.nestedBlockDepth += 1;
    metrics.verifyMaxNestedBlockDepthPerFunction();

    if (state.tokens.next.id === "{") {
      advance("{");

      // create a new block scope
      funct["(blockscope)"].stack();

      line = state.tokens.curr.line;
      if (state.tokens.next.id !== "}") {
        indent += state.option.indent;
        while (!ordinary && state.tokens.next.from > indent) {
          indent += state.option.indent;
        }

        if (isfunc) {
          m = {};
          for (d in state.directive) {
            if (_.has(state.directive, d)) {
              m[d] = state.directive[d];
            }
          }
          directives();

          if (state.option.strict && funct["(context)"]["(global)"]) {
            if (!m["use strict"] && !state.directive["use strict"]) {
              warning("E007");
            }
          }
        }

        a = statements(line);

        metrics.statementCount += a.length;

        if (isfunc) {
          state.directive = m;
        }

        indent -= state.option.indent;
        if (line !== state.tokens.next.line) {
          indentation();
        }
      } else if (line !== state.tokens.next.line) {
        indentation();
      }
      advance("}", t);

      funct["(blockscope)"].unstack();

      indent = old_indent;
    } else if (!ordinary) {
      if (isfunc) {
        m = {};
        if (stmt && !isfatarrow && !state.option.inMoz(true)) {
          error("W118", state.tokens.curr, "function closure expressions");
        }

        if (!stmt) {
          for (d in state.directive) {
            if (_.has(state.directive, d)) {
              m[d] = state.directive[d];
            }
          }
        }
        expression(10);

        if (state.option.strict && funct["(context)"]["(global)"]) {
          if (!m["use strict"] && !state.directive["use strict"]) {
            warning("E007");
          }
        }
      } else {
        error("E021", state.tokens.next, "{", state.tokens.next.value);
      }
    } else {

      // check to avoid let declaration not within a block
      funct["(nolet)"] = true;

      if (!stmt || state.option.curly) {
        warning("W116", state.tokens.next, "{", state.tokens.next.value);
      }

      noreach = true;
      indent += state.option.indent;
      // test indentation only if statement is in new line
      a = [statement(state.tokens.next.line === state.tokens.curr.line)];
      indent -= state.option.indent;
      noreach = false;

      delete funct["(nolet)"];
    }
    funct["(verb)"] = null;
    if (!ordinary || !state.option.funcscope) scope = s;
    inblock = b;
    if (ordinary && state.option.noempty && (!a || a.length === 0)) {
      warning("W035");
    }
    metrics.nestedBlockDepth -= 1;
    return a;
  }


  function countMember(m) {
    if (membersOnly && typeof membersOnly[m] !== "boolean") {
      warning("W036", state.tokens.curr, m);
    }
    if (typeof member[m] === "number") {
      member[m] += 1;
    } else {
      member[m] = 1;
    }
  }


  function note_implied(tkn) {
    var name = tkn.value, line = tkn.line, a = implied[name];
    if (typeof a === "function") {
      a = false;
    }

    if (!a) {
      a = [line];
      implied[name] = a;
    } else if (a[a.length - 1] !== line) {
      a.push(line);
    }
  }


  // Build the syntax table by declaring the syntactic elements of the language.

  type("(number)", function () {
    return this;
  });

  type("(string)", function () {
    return this;
  });

  state.syntax["(identifier)"] = {
    type: "(identifier)",
    lbp: 0,
    identifier: true,
    nud: function () {
      var v = this.value,
        s = scope[v],
        f;

      if (typeof s === "function") {
        // Protection against accidental inheritance.
        s = undefined;
      } else if (typeof s === "boolean") {
        f = funct;
        funct = functions[0];
        addlabel(v, "var");
        s = funct;
        funct = f;
      }
      var block;
      if (_.has(funct, "(blockscope)")) {
        block = funct["(blockscope)"].getlabel(v);
      }

      // The name is in scope and defined in the current function.
      if (funct === s || block) {
        // Change 'unused' to 'var', and reject labels.
        // the name is in a block scope
        switch (block ? block[v]["(type)"] : funct[v]) {
        case "unused":
          if (block) block[v]["(type)"] = "var";
          else funct[v] = "var";
          break;
        case "unction":
          if (block) block[v]["(type)"] = "function";
          else funct[v] = "function";
          this["function"] = true;
          break;
        case "function":
          this["function"] = true;
          break;
        case "label":
          warning("W037", state.tokens.curr, v);
          break;
        }
      } else if (funct["(global)"]) {
        // The name is not defined in the function.  If we are in the global
        // scope, then we have an undefined variable.
        //
        // Operators typeof and delete do not raise runtime errors even if
        // the base object of a reference is null so no need to display warning
        // if we're inside of typeof or delete.

        if (typeof predefined[v] !== "boolean") {
          // Attempting to subscript a null reference will throw an
          // error, even within the typeof and delete operators
          if (!(anonname === "typeof" || anonname === "delete") ||
            (state.tokens.next && (state.tokens.next.value === "." ||
              state.tokens.next.value === "["))) {

            // if we're in a list comprehension, variables are declared
            // locally and used before being defined. So we check
            // the presence of the given variable in the comp array
            // before declaring it undefined.

            if (!funct["(comparray)"].check(v)) {
              isundef(funct, "W117", state.tokens.curr, v);
            }
          }
        }

        note_implied(state.tokens.curr);
      } else {
        // If the name is already defined in the current
        // function, but not as outer, then there is a scope error.

        switch (funct[v]) {
        case "closure":
        case "function":
        case "var":
        case "unused":
          warning("W038", state.tokens.curr, v);
          break;
        case "label":
          warning("W037", state.tokens.curr, v);
          break;
        case "outer":
        case "global":
          break;
        default:
          // If the name is defined in an outer function, make an outer entry,
          // and if it was unused, make it var.
          if (s === true) {
            funct[v] = true;
          } else if (s === null) {
            warning("W039", state.tokens.curr, v);
            note_implied(state.tokens.curr);
          } else if (typeof s !== "object") {
            // Operators typeof and delete do not raise runtime errors even
            // if the base object of a reference is null so no need to
            //
            // display warning if we're inside of typeof or delete.
            // Attempting to subscript a null reference will throw an
            // error, even within the typeof and delete operators
            if (!(anonname === "typeof" || anonname === "delete") ||
              (state.tokens.next &&
                (state.tokens.next.value === "." || state.tokens.next.value === "["))) {

              isundef(funct, "W117", state.tokens.curr, v);
            }
            funct[v] = true;
            note_implied(state.tokens.curr);
          } else {
            switch (s[v]) {
            case "function":
            case "unction":
              this["function"] = true;
              s[v] = "closure";
              funct[v] = s["(global)"] ? "global" : "outer";
              break;
            case "var":
            case "unused":
              s[v] = "closure";
              funct[v] = s["(global)"] ? "global" : "outer";
              break;
            case "closure":
              funct[v] = s["(global)"] ? "global" : "outer";
              break;
            case "label":
              warning("W037", state.tokens.curr, v);
            }
          }
        }
      }
      return this;
    },
    led: function () {
      error("E033", state.tokens.next, state.tokens.next.value);
    }
  };

  type("(regexp)", function () {
    return this;
  });

  // ECMAScript parser

  delim("(endline)");
  delim("(begin)");
  delim("(end)").reach = true;
  delim("(error)").reach = true;
  delim("}").reach = true;
  delim(")");
  delim("]");
  delim("\"").reach = true;
  delim("'").reach = true;
  delim(";");
  delim(":").reach = true;
  delim("#");

  reserve("else");
  reserve("case").reach = true;
  reserve("catch");
  reserve("default").reach = true;
  reserve("finally");
  reservevar("arguments", function (x) {
    if (state.directive["use strict"] && funct["(global)"]) {
      warning("E008", x);
    }
  });
  reservevar("eval");
  reservevar("false");
  reservevar("Infinity");
  reservevar("null");
  reservevar("this", function (x) {
    if (state.directive["use strict"] && !state.option.validthis && ((funct["(statement)"] &&
        funct["(name)"].charAt(0) > "Z") || funct["(global)"])) {
      warning("W040", x);
    }
  });
  reservevar("true");
  reservevar("undefined");

  assignop("=", "assign", 20);
  assignop("+=", "assignadd", 20);
  assignop("-=", "assignsub", 20);
  assignop("*=", "assignmult", 20);
  assignop("/=", "assigndiv", 20).nud = function () {
    error("E014");
  };
  assignop("%=", "assignmod", 20);

  bitwiseassignop("&=", "assignbitand", 20);
  bitwiseassignop("|=", "assignbitor", 20);
  bitwiseassignop("^=", "assignbitxor", 20);
  bitwiseassignop("<<=", "assignshiftleft", 20);
  bitwiseassignop(">>=", "assignshiftright", 20);
  bitwiseassignop(">>>=", "assignshiftrightunsigned", 20);
  infix(",", function (left, that) {
    var expr;
    that.exprs = [left];
    if (!comma({peek: true})) {
      return that;
    }
    while (true) {
      if (!(expr = expression(10)))  {
        break;
      }
      that.exprs.push(expr);
      if (state.tokens.next.value !== "," || !comma()) {
        break;
      }
    }
    return that;
  }, 10, true);

  infix("?", function (left, that) {
    increaseComplexityCount();
    that.left = left;
    that.right = expression(10);
    advance(":");
    that["else"] = expression(10);
    return that;
  }, 30);

  var orPrecendence = 40;
  infix("||", function (left, that) {
    increaseComplexityCount();
    that.left = left;
    that.right = expression(orPrecendence);
    return that;
  }, orPrecendence);
  infix("&&", "and", 50);
  bitwise("|", "bitor", 70);
  bitwise("^", "bitxor", 80);
  bitwise("&", "bitand", 90);
  relation("==", function (left, right) {
    var eqnull = state.option.eqnull && (left.value === "null" || right.value === "null");

    if (!eqnull && state.option.eqeqeq)
      warning("W116", this, "===", "==");
    else if (isPoorRelation(left))
      warning("W041", this, "===", left.value);
    else if (isPoorRelation(right))
      warning("W041", this, "===", right.value);

    return this;
  });
  relation("===");
  relation("!=", function (left, right) {
    var eqnull = state.option.eqnull &&
        (left.value === "null" || right.value === "null");

    if (!eqnull && state.option.eqeqeq) {
      warning("W116", this, "!==", "!=");
    } else if (isPoorRelation(left)) {
      warning("W041", this, "!==", left.value);
    } else if (isPoorRelation(right)) {
      warning("W041", this, "!==", right.value);
    }
    return this;
  });
  relation("!==");
  relation("<");
  relation(">");
  relation("<=");
  relation(">=");
  bitwise("<<", "shiftleft", 120);
  bitwise(">>", "shiftright", 120);
  bitwise(">>>", "shiftrightunsigned", 120);
  infix("in", "in", 120);
  infix("instanceof", "instanceof", 120);
  infix("+", function (left, that) {
    var right = expression(130);
    if (left && right && left.id === "(string)" && right.id === "(string)") {
      left.value += right.value;
      left.character = right.character;
      if (!state.option.scripturl && reg.javascriptURL.test(left.value)) {
        warning("W050", left);
      }
      return left;
    }
    that.left = left;
    that.right = right;
    return that;
  }, 130);
  prefix("+", "num");
  prefix("+++", function () {
    warning("W007");
    this.right = expression(150);
    this.arity = "unary";
    return this;
  });
  infix("+++", function (left) {
    warning("W007");
    this.left = left;
    this.right = expression(130);
    return this;
  }, 130);
  infix("-", "sub", 130);
  prefix("-", "neg");
  prefix("---", function () {
    warning("W006");
    this.right = expression(150);
    this.arity = "unary";
    return this;
  });
  infix("---", function (left) {
    warning("W006");
    this.left = left;
    this.right = expression(130);
    return this;
  }, 130);
  infix("*", "mult", 140);
  infix("/", "div", 140);
  infix("%", "mod", 140);

  suffix("++", "postinc");
  prefix("++", "preinc");
  state.syntax["++"].exps = true;

  suffix("--", "postdec");
  prefix("--", "predec");
  state.syntax["--"].exps = true;
  prefix("delete", function () {
    var p = expression(10);
    if (!p || (p.id !== "." && p.id !== "[")) {
      warning("W051");
    }
    this.first = p;
    return this;
  }).exps = true;

  prefix("~", function () {
    if (state.option.bitwise) {
      warning("W052", this, "~");
    }
    expression(150);
    return this;
  });

  prefix("...", function () {
    if (!state.option.inESNext()) {
      warning("W104", this, "spread/rest operator");
    }
    if (!state.tokens.next.identifier) {
      error("E030", state.tokens.next, state.tokens.next.value);
    }
    expression(150);
    return this;
  });

  prefix("!", function () {
    this.right = expression(150);
    this.arity = "unary";

    if (!this.right) { // '!' followed by nothing? Give up.
      quit("E041", this.line || 0);
    }

    if (bang[this.right.id] === true) {
      warning("W018", this, "!");
    }
    return this;
  });

  prefix("typeof", "typeof");
  prefix("new", function () {
    var c = expression(155), i;
    if (c && c.id !== "function") {
      if (c.identifier) {
        c["new"] = true;
        switch (c.value) {
        case "Number":
        case "String":
        case "Boolean":
        case "Math":
        case "JSON":
          warning("W053", state.tokens.prev, c.value);
          break;
        case "Function":
          if (!state.option.evil) {
            warning("W054");
          }
          break;
        case "Date":
        case "RegExp":
          break;
        default:
          if (c.id !== "function") {
            i = c.value.substr(0, 1);
            if (state.option.newcap && (i < "A" || i > "Z") && !_.has(global, c.value)) {
              warning("W055", state.tokens.curr);
            }
          }
        }
      } else {
        if (c.id !== "." && c.id !== "[" && c.id !== "(") {
          warning("W056", state.tokens.curr);
        }
      }
    } else {
      if (!state.option.supernew)
        warning("W057", this);
    }
    adjacent(state.tokens.curr, state.tokens.next);
    if (state.tokens.next.id !== "(" && !state.option.supernew) {
      warning("W058", state.tokens.curr, state.tokens.curr.value);
    }
    this.first = c;
    return this;
  });
  state.syntax["new"].exps = true;

  prefix("void").exps = true;

  infix(".", function (left, that) {
    adjacent(state.tokens.prev, state.tokens.curr);
    nobreak();
    var m = identifier(false, true);

    if (typeof m === "string") {
      countMember(m);
    }

    that.left = left;
    that.right = m;

    if (m && m === "hasOwnProperty" && state.tokens.next.value === "=") {
      warning("W001");
    }

    if (left && left.value === "arguments" && (m === "callee" || m === "caller")) {
      if (state.option.noarg)
        warning("W059", left, m);
      else if (state.directive["use strict"])
        error("E008");
    } else if (!state.option.evil && left && left.value === "document" &&
        (m === "write" || m === "writeln")) {
      warning("W060", left);
    }

    if (!state.option.evil && (m === "eval" || m === "execScript")) {
      warning("W061");
    }

    return that;
  }, 160, true);

  infix("(", function (left, that) {
    if (state.tokens.prev.id !== "}" && state.tokens.prev.id !== ")") {
      nobreak(state.tokens.prev, state.tokens.curr);
    }

    nospace();
    if (state.option.immed && left && !left.immed && left.id === "function") {
      warning("W062");
    }

    var n = 0;
    var p = [];

    if (left) {
      if (left.type === "(identifier)") {
        if (left.value.match(/^[A-Z]([A-Z0-9_$]*[a-z][A-Za-z0-9_$]*)?$/)) {
          if ("Number String Boolean Date Object".indexOf(left.value) === -1) {
            if (left.value === "Math") {
              warning("W063", left);
            } else if (state.option.newcap) {
              warning("W064", left);
            }
          }
        }
      }
    }

    if (state.tokens.next.id !== ")") {
      for (;;) {
        p[p.length] = expression(10);
        n += 1;
        if (state.tokens.next.id !== ",") {
          break;
        }
        comma();
      }
    }

    advance(")");
    nospace(state.tokens.prev, state.tokens.curr);

    if (typeof left === "object") {
      if (left.value === "parseInt" && n === 1) {
        warning("W065", state.tokens.curr);
      }
      if (!state.option.evil) {
        if (left.value === "eval" || left.value === "Function" ||
            left.value === "execScript") {
          warning("W061", left);

          if (p[0] && [0].id === "(string)") {
            addInternalSrc(left, p[0].value);
          }
        } else if (p[0] && p[0].id === "(string)" &&
             (left.value === "setTimeout" ||
            left.value === "setInterval")) {
          warning("W066", left);
          addInternalSrc(left, p[0].value);

        // window.setTimeout/setInterval
        } else if (p[0] && p[0].id === "(string)" &&
             left.value === "." &&
             left.left.value === "window" &&
             (left.right === "setTimeout" ||
            left.right === "setInterval")) {
          warning("W066", left);
          addInternalSrc(left, p[0].value);
        }
      }
      if (!left.identifier && left.id !== "." && left.id !== "[" &&
          left.id !== "(" && left.id !== "&&" && left.id !== "||" &&
          left.id !== "?") {
        warning("W067", left);
      }
    }

    that.left = left;
    return that;
  }, 155, true).exps = true;

  prefix("(", function () {
    nospace();
    var bracket, brackets = [];
    var pn, pn1, i = 0;
    var ret;

    do {
      pn = peek(i);
      i += 1;
      pn1 = peek(i);
      i += 1;
    } while (pn.value !== ")" && pn1.value !== "=>" && pn1.value !== ";" && pn1.type !== "(end)");

    if (state.tokens.next.id === "function") {
      state.tokens.next.immed = true;
    }

    var exprs = [];

    if (state.tokens.next.id !== ")") {
      for (;;) {
        if (pn1.value === "=>" && state.tokens.next.value === "{") {
          bracket = state.tokens.next;
          bracket.left = destructuringExpression();
          brackets.push(bracket);
          for (var t in bracket.left) {
            exprs.push(bracket.left[t].token);
          }
        } else {
          exprs.push(expression(10));
        }
        if (state.tokens.next.id !== ",") {
          break;
        }
        comma();
      }
    }

    advance(")", this);
    nospace(state.tokens.prev, state.tokens.curr);
    if (state.option.immed && exprs[0] && exprs[0].id === "function") {
      if (state.tokens.next.id !== "(" &&
        (state.tokens.next.id !== "." || (peek().value !== "call" && peek().value !== "apply"))) {
        warning("W068", this);
      }
    }

    if (state.tokens.next.value === "=>") {
      return exprs;
    }
    if (!exprs.length) {
      return;
    }
    if (exprs.length > 1) {
      ret = Object.create(state.syntax[","]);
      ret.exprs = exprs;
    } else {
      ret = exprs[0];
    }
    if (ret) {
      ret.paren = true;
    }
    return ret;
  });

  application("=>");

  infix("[", function (left, that) {
    nobreak(state.tokens.prev, state.tokens.curr);
    nospace();
    var e = expression(10), s;
    if (e && e.type === "(string)") {
      if (!state.option.evil && (e.value === "eval" || e.value === "execScript")) {
        warning("W061", that);
      }

      countMember(e.value);
      if (!state.option.sub && reg.identifier.test(e.value)) {
        s = state.syntax[e.value];
        if (!s || !isReserved(s)) {
          warning("W069", state.tokens.prev, e.value);
        }
      }
    }
    advance("]", that);

    if (e && e.value === "hasOwnProperty" && state.tokens.next.value === "=") {
      warning("W001");
    }

    nospace(state.tokens.prev, state.tokens.curr);
    that.left = left;
    that.right = e;
    return that;
  }, 160, true);

  function comprehensiveArrayExpression() {
    var res = {};
    res.exps = true;
    funct["(comparray)"].stack();

    // Handle reversed for expressions, used in spidermonkey
    var reversed = false;
    if (state.tokens.next.value !== "for") {
      reversed = true;
      if (!state.option.inMoz(true)) {
        warning("W116", state.tokens.next, "for", state.tokens.next.value);
      }
      funct["(comparray)"].setState("use");
      res.right = expression(10);
    }

    advance("for");
    if (state.tokens.next.value === "each") {
      advance("each");
      if (!state.option.inMoz(true)) {
        warning("W118", state.tokens.curr, "for each");
      }
    }
    advance("(");
    funct["(comparray)"].setState("define");
    res.left = expression(130);
    if (_.contains(["in", "of"], state.tokens.next.value)) {
      advance();
    } else {
      error("E045", state.tokens.curr);
    }
    funct["(comparray)"].setState("generate");
    expression(10);

    advance(")");
    if (state.tokens.next.value === "if") {
      advance("if");
      advance("(");
      funct["(comparray)"].setState("filter");
      res.filter = expression(10);
      advance(")");
    }

    if (!reversed) {
      funct["(comparray)"].setState("use");
      res.right = expression(10);
    }

    advance("]");
    funct["(comparray)"].unstack();
    return res;
  }

  prefix("[", function () {
    var blocktype = lookupBlockType(true);
    if (blocktype.isCompArray) {
      if (!state.option.inESNext()) {
        warning("W119", state.tokens.curr, "array comprehension");
      }
      return comprehensiveArrayExpression();
    } else if (blocktype.isDestAssign && !state.option.inESNext()) {
      warning("W104", state.tokens.curr, "destructuring assignment");
    }
    var b = state.tokens.curr.line !== state.tokens.next.line;
    this.first = [];
    if (b) {
      indent += state.option.indent;
      if (state.tokens.next.from === indent + state.option.indent) {
        indent += state.option.indent;
      }
    }
    while (state.tokens.next.id !== "(end)") {
      while (state.tokens.next.id === ",") {
        if (!state.option.inES5())
          warning("W070");
        advance(",");
      }
      if (state.tokens.next.id === "]") {
        break;
      }
      if (b && state.tokens.curr.line !== state.tokens.next.line) {
        indentation();
      }
      this.first.push(expression(10));
      if (state.tokens.next.id === ",") {
        comma({ allowTrailing: true });
        if (state.tokens.next.id === "]" && !state.option.inES5(true)) {
          warning("W070", state.tokens.curr);
          break;
        }
      } else {
        break;
      }
    }
    if (b) {
      indent -= state.option.indent;
      indentation();
    }
    advance("]", this);
    return this;
  }, 160);


  function property_name() {
    var id = optionalidentifier(false, true);

    if (!id) {
      if (state.tokens.next.id === "(string)") {
        id = state.tokens.next.value;
        advance();
      } else if (state.tokens.next.id === "(number)") {
        id = state.tokens.next.value.toString();
        advance();
      }
    }

    if (id === "hasOwnProperty") {
      warning("W001");
    }

    return id;
  }


  function functionparams(parsed) {
    var curr, next;
    var params = [];
    var ident;
    var tokens = [];
    var t;
    var pastDefault = false;

    if (parsed) {
      if (parsed instanceof Array) {
        for (var i in parsed) {
          curr = parsed[i];
          if (_.contains(["{", "["], curr.id)) {
            for (t in curr.left) {
              t = tokens[t];
              if (t.id) {
                params.push(t.id);
                addlabel(t.id, "unused", t.token);
              }
            }
          } else if (curr.value === "...") {
            if (!state.option.inESNext()) {
              warning("W104", curr, "spread/rest operator");
            }
            continue;
          } else {
            addlabel(curr.value, "unused", curr);
          }
        }
        return params;
      } else {
        if (parsed.identifier === true) {
          addlabel(parsed.value, "unused", parsed);
          return [parsed];
        }
      }
    }

    next = state.tokens.next;

    advance("(");
    nospace();

    if (state.tokens.next.id === ")") {
      advance(")");
      return;
    }

    for (;;) {
      if (_.contains(["{", "["], state.tokens.next.id)) {
        tokens = destructuringExpression();
        for (t in tokens) {
          t = tokens[t];
          if (t.id) {
            params.push(t.id);
            addlabel(t.id, "unused", t.token);
          }
        }
      } else if (state.tokens.next.value === "...") {
        if (!state.option.inESNext()) {
          warning("W104", state.tokens.next, "spread/rest operator");
        }
        advance("...");
        nospace();
        ident = identifier(true);
        params.push(ident);
        addlabel(ident, "unused", state.tokens.curr);
      } else {
        ident = identifier(true);
        params.push(ident);
        addlabel(ident, "unused", state.tokens.curr);
      }

      // it is a syntax error to have a regular argument after a default argument
      if (pastDefault) {
        if (state.tokens.next.id !== "=") {
          error("E051", state.tokens.current);
        }
      }
      if (state.tokens.next.id === "=") {
        if (!state.option.inESNext()) {
          warning("W119", state.tokens.next, "default parameters");
        }
        advance("=");
        pastDefault = true;
        expression(10);
      }
      if (state.tokens.next.id === ",") {
        comma();
      } else {
        advance(")", next);
        nospace(state.tokens.prev, state.tokens.curr);
        return params;
      }
    }
  }


  function doFunction(name, statement, generator, fatarrowparams) {
    var f;
    var oldOption = state.option;
    var oldIgnored = state.ignored;
    var oldScope  = scope;

    state.option = Object.create(state.option);
    state.ignored = Object.create(state.ignored);
    scope  = Object.create(scope);

    funct = {
      "(name)"      : name || "\"" + anonname + "\"",
      "(line)"      : state.tokens.next.line,
      "(character)" : state.tokens.next.character,
      "(context)"   : funct,
      "(breakage)"  : 0,
      "(loopage)"   : 0,
      "(metrics)"   : createMetrics(state.tokens.next),
      "(scope)"     : scope,
      "(statement)" : statement,
      "(tokens)"    : {},
      "(blockscope)": funct["(blockscope)"],
      "(comparray)" : funct["(comparray)"]
    };

    if (generator) {
      funct["(generator)"] = true;
    }

    f = funct;
    state.tokens.curr.funct = funct;

    functions.push(funct);

    if (name) {
      addlabel(name, "function");
    }

    funct["(params)"] = functionparams(fatarrowparams);
    funct["(metrics)"].verifyMaxParametersPerFunction(funct["(params)"]);

    block(false, true, true, fatarrowparams ? true:false);

    if (generator && funct["(generator)"] !== "yielded") {
      error("E047", state.tokens.curr);
    }

    funct["(metrics)"].verifyMaxStatementsPerFunction();
    funct["(metrics)"].verifyMaxComplexityPerFunction();
    funct["(unusedOption)"] = state.option.unused;

    scope = oldScope;
    state.option = oldOption;
    state.ignored = oldIgnored;
    funct["(last)"] = state.tokens.curr.line;
    funct["(lastcharacter)"] = state.tokens.curr.character;
    funct = funct["(context)"];

    return f;
  }

  function createMetrics(functionStartToken) {
    return {
      statementCount: 0,
      nestedBlockDepth: -1,
      ComplexityCount: 1,

      verifyMaxStatementsPerFunction: function () {
        if (state.option.maxstatements &&
          this.statementCount > state.option.maxstatements) {
          warning("W071", functionStartToken, this.statementCount);
        }
      },

      verifyMaxParametersPerFunction: function (params) {
        params = params || [];

        if (state.option.maxparams && params.length > state.option.maxparams) {
          warning("W072", functionStartToken, params.length);
        }
      },

      verifyMaxNestedBlockDepthPerFunction: function () {
        if (state.option.maxdepth &&
          this.nestedBlockDepth > 0 &&
          this.nestedBlockDepth === state.option.maxdepth + 1) {
          warning("W073", null, this.nestedBlockDepth);
        }
      },

      verifyMaxComplexityPerFunction: function () {
        var max = state.option.maxcomplexity;
        var cc = this.ComplexityCount;
        if (max && cc > max) {
          warning("W074", functionStartToken, cc);
        }
      }
    };
  }

  function increaseComplexityCount() {
    funct["(metrics)"].ComplexityCount += 1;
  }

  // Parse assignments that were found instead of conditionals.
  // For example: if (a = 1) { ... }

  function checkCondAssignment(expr) {
    var id, paren;
    if (expr) {
      id = expr.id;
      paren = expr.paren;
      if (id === "," && (expr = expr.exprs[expr.exprs.length - 1])) {
        id = expr.id;
        paren = paren || expr.paren;
      }
    }
    switch (id) {
    case "=":
      if (!paren && !state.option.boss) {
        warning("W121");
        break;
      }
    case "+=":
    case "-=":
    case "*=":
    case "%=":
    case "&=":
    case "|=":
    case "^=":
    case "/=":
      if (!paren && !state.option.boss) {
        warning("W084");
      }
    }
  }


  (function (x) {
    x.nud = function (isclassdef) {
      var b, f, i, p, t, g;
      var props = {}; // All properties, including accessors
      var tag = "";

      function saveProperty(name, tkn) {
        if (props[name] && _.has(props, name))
          warning("W075", state.tokens.next, i);
        else
          props[name] = {};

        props[name].basic = true;
        props[name].basictkn = tkn;
      }

      function saveSetter(name, tkn) {
        if (props[name] && _.has(props, name)) {
          if (props[name].basic || props[name].setter)
            warning("W075", state.tokens.next, i);
        } else {
          props[name] = {};
        }

        props[name].setter = true;
        props[name].setterToken = tkn;
      }

      function saveGetter(name) {
        if (props[name] && _.has(props, name)) {
          if (props[name].basic || props[name].getter)
            warning("W075", state.tokens.next, i);
        } else {
          props[name] = {};
        }

        props[name].getter = true;
        props[name].getterToken = state.tokens.curr;
      }

      b = state.tokens.curr.line !== state.tokens.next.line;
      if (b) {
        indent += state.option.indent;
        if (state.tokens.next.from === indent + state.option.indent) {
          indent += state.option.indent;
        }
      }

      for (;;) {
        if (state.tokens.next.id === "}") {
          break;
        }

        if (b) {
          indentation();
        }

        if (isclassdef && state.tokens.next.value === "static") {
          advance("static");
          tag = "static ";
        }

        if (state.tokens.next.value === "get" && peek().id !== ":") {
          advance("get");

          if (!state.option.inES5(!isclassdef)) {
            error("E034");
          }

          i = property_name();
          if (!i) {
            error("E035");
          }

          // It is a Syntax Error if PropName of MethodDefinition is
          // "constructor" and SpecialMethod of MethodDefinition is true.
          if (isclassdef && i === "constructor") {
            error("E049", state.tokens.next, "class getter method", i);
          }

          saveGetter(tag + i);
          t = state.tokens.next;
          adjacent(state.tokens.curr, state.tokens.next);
          f = doFunction();
          p = f["(params)"];

          if (p) {
            warning("W076", t, p[0], i);
          }

          adjacent(state.tokens.curr, state.tokens.next);
        } else if (state.tokens.next.value === "set" && peek().id !== ":") {
          advance("set");

          if (!state.option.inES5(!isclassdef)) {
            error("E034");
          }

          i = property_name();
          if (!i) {
            error("E035");
          }

          // It is a Syntax Error if PropName of MethodDefinition is
          // "constructor" and SpecialMethod of MethodDefinition is true.
          if (isclassdef && i === "constructor") {
            error("E049", state.tokens.next, "class setter method", i);
          }

          saveSetter(tag + i, state.tokens.next);
          t = state.tokens.next;
          adjacent(state.tokens.curr, state.tokens.next);
          f = doFunction();
          p = f["(params)"];

          if (!p || p.length !== 1) {
            warning("W077", t, i);
          }
        } else {
          g = false;
          if (state.tokens.next.value === "*" && state.tokens.next.type === "(punctuator)") {
            if (!state.option.inESNext()) {
              warning("W104", state.tokens.next, "generator functions");
            }
            advance("*");
            g = true;
          }
          i = property_name();
          saveProperty(tag + i, state.tokens.next);

          if (typeof i !== "string") {
            break;
          }

          if (state.tokens.next.value === "(") {
            if (!state.option.inESNext()) {
              warning("W104", state.tokens.curr, "concise methods");
            }
            doFunction(i, undefined, g);
          } else if (!isclassdef) {
            advance(":");
            nonadjacent(state.tokens.curr, state.tokens.next);
            expression(10);
          }
        }
        // It is a Syntax Error if PropName of MethodDefinition is "prototype".
        if (isclassdef && i === "prototype") {
          error("E049", state.tokens.next, "class method", i);
        }

        countMember(i);
        if (isclassdef) {
          tag = "";
          continue;
        }
        if (state.tokens.next.id === ",") {
          comma({ allowTrailing: true, property: true });
          if (state.tokens.next.id === ",") {
            warning("W070", state.tokens.curr);
          } else if (state.tokens.next.id === "}" && !state.option.inES5(true)) {
            warning("W070", state.tokens.curr);
          }
        } else {
          break;
        }
      }
      if (b) {
        indent -= state.option.indent;
        indentation();
      }
      advance("}", this);

      // Check for lonely setters if in the ES5 mode.
      if (state.option.inES5()) {
        for (var name in props) {
          if (_.has(props, name) && props[name].setter && !props[name].getter) {
            warning("W078", props[name].setterToken);
          }
        }
      }
      return this;
    };
    x.fud = function () {
      error("E036", state.tokens.curr);
    };
  }(delim("{")));

  function destructuringExpression() {
    var id, ids;
    var identifiers = [];
    if (!state.option.inESNext()) {
      warning("W104", state.tokens.curr, "destructuring expression");
    }
    var nextInnerDE = function () {
      var ident;
      if (_.contains(["[", "{"], state.tokens.next.value)) {
        ids = destructuringExpression();
        for (var id in ids) {
          id = ids[id];
          identifiers.push({ id: id.id, token: id.token });
        }
      } else if (state.tokens.next.value === ",") {
        identifiers.push({ id: null, token: state.tokens.curr });
      } else {
        ident = identifier();
        if (ident)
          identifiers.push({ id: ident, token: state.tokens.curr });
      }
    };
    if (state.tokens.next.value === "[") {
      advance("[");
      nextInnerDE();
      while (state.tokens.next.value !== "]") {
        advance(",");
        nextInnerDE();
      }
      advance("]");
    } else if (state.tokens.next.value === "{") {
      advance("{");
      id = identifier();
      if (state.tokens.next.value === ":") {
        advance(":");
        nextInnerDE();
      } else {
        identifiers.push({ id: id, token: state.tokens.curr });
      }
      while (state.tokens.next.value !== "}") {
        advance(",");
        id = identifier();
        if (state.tokens.next.value === ":") {
          advance(":");
          nextInnerDE();
        } else {
          identifiers.push({ id: id, token: state.tokens.curr });
        }
      }
      advance("}");
    }
    return identifiers;
  }
  function destructuringExpressionMatch(tokens, value) {
    if (value.first) {
      for (var i = 0; i < tokens.length && i < value.first.length; i++) {
        var token = tokens[i];
        var val = value.first[i];
        if (token && val) {
          token.first = val;
        } else if (token && token.first && !val) {
          warning("W080", token.first, token.first.value);
        } /* else {
          XXX value is discarded: wouldn't it need a warning ?
        } */
      }
    }
  }

  var conststatement = stmt("const", function (prefix) {
    var tokens, value;
    // state variable to know if it is a lone identifier, or a destructuring statement.
    var lone;

    if (!state.option.inESNext()) {
      warning("W104", state.tokens.curr, "const");
    }

    this.first = [];
    for (;;) {
      var names = [];
      nonadjacent(state.tokens.curr, state.tokens.next);
      if (_.contains(["{", "["], state.tokens.next.value)) {
        tokens = destructuringExpression();
        lone = false;
      } else {
        tokens = [ { id: identifier(), token: state.tokens.curr } ];
        lone = true;
      }
      for (var t in tokens) {
        t = tokens[t];
        if (funct[t.id] === "const") {
          warning("E011", null, t.id);
        }
        if (funct["(global)"] && predefined[t.id] === false) {
          warning("W079", t.token, t.id);
        }
        if (t.id) {
          addlabel(t.id, "const");
          names.push(t.token);
        }
      }
      if (prefix) {
        break;
      }

      this.first = this.first.concat(names);

      if (state.tokens.next.id !== "=") {
        warning("E012", state.tokens.curr, state.tokens.curr.value);
      }

      if (state.tokens.next.id === "=") {
        nonadjacent(state.tokens.curr, state.tokens.next);
        advance("=");
        nonadjacent(state.tokens.curr, state.tokens.next);
        if (state.tokens.next.id === "undefined") {
          warning("W080", state.tokens.prev, state.tokens.prev.value);
        }
        if (peek(0).id === "=" && state.tokens.next.identifier) {
          warning("W120", state.tokens.next, state.tokens.next.value);
        }
        value = expression(10);
        if (lone) {
          tokens[0].first = value;
        } else {
          destructuringExpressionMatch(names, value);
        }
      }

      if (state.tokens.next.id !== ",") {
        break;
      }
      comma();
    }
    return this;
  });
  conststatement.exps = true;
  var varstatement = stmt("var", function (prefix) {
    // JavaScript does not have block scope. It only has function scope. So,
    // declaring a variable in a block can have unexpected consequences.
    var tokens, lone, value;

    if (funct["(onevar)"] && state.option.onevar) {
      warning("W081");
    } else if (!funct["(global)"]) {
      funct["(onevar)"] = true;
    }

    this.first = [];
    for (;;) {
      var names = [];
      nonadjacent(state.tokens.curr, state.tokens.next);
      if (_.contains(["{", "["], state.tokens.next.value)) {
        tokens = destructuringExpression();
        lone = false;
      } else {
        tokens = [ { id: identifier(), token: state.tokens.curr } ];
        lone = true;
      }
      for (var t in tokens) {
        t = tokens[t];
        if (state.option.inESNext() && funct[t.id] === "const") {
          warning("E011", null, t.id);
        }
        if (funct["(global)"] && predefined[t.id] === false) {
          warning("W079", t.token, t.id);
        }
        if (t.id) {
          addlabel(t.id, "unused", t.token);
          names.push(t.token);
        }
      }
      if (prefix) {
        break;
      }

      this.first = this.first.concat(names);

      if (state.tokens.next.id === "=") {
        nonadjacent(state.tokens.curr, state.tokens.next);
        advance("=");
        nonadjacent(state.tokens.curr, state.tokens.next);
        if (state.tokens.next.id === "undefined") {
          warning("W080", state.tokens.prev, state.tokens.prev.value);
        }
        if (peek(0).id === "=" && state.tokens.next.identifier) {
          warning("W120", state.tokens.next, state.tokens.next.value);
        }
        value = expression(10);
        if (lone) {
          tokens[0].first = value;
        } else {
          destructuringExpressionMatch(names, value);
        }
      }

      if (state.tokens.next.id !== ",") {
        break;
      }
      comma();
    }
    return this;
  });
  varstatement.exps = true;
  var letstatement = stmt("let", function (prefix) {
    var tokens, lone, value, letblock;

    if (!state.option.inESNext()) {
      warning("W104", state.tokens.curr, "let");
    }

    if (state.tokens.next.value === "(") {
      if (!state.option.inMoz(true)) {
        warning("W118", state.tokens.next, "let block");
      }
      advance("(");
      funct["(blockscope)"].stack();
      letblock = true;
    } else if (funct["(nolet)"]) {
      error("E048", state.tokens.curr);
    }

    if (funct["(onevar)"] && state.option.onevar) {
      warning("W081");
    } else if (!funct["(global)"]) {
      funct["(onevar)"] = true;
    }

    this.first = [];
    for (;;) {
      var names = [];
      nonadjacent(state.tokens.curr, state.tokens.next);
      if (_.contains(["{", "["], state.tokens.next.value)) {
        tokens = destructuringExpression();
        lone = false;
      } else {
        tokens = [ { id: identifier(), token: state.tokens.curr.value } ];
        lone = true;
      }
      for (var t in tokens) {
        t = tokens[t];
        if (state.option.inESNext() && funct[t.id] === "const") {
          warning("E011", null, t.id);
        }
        if (funct["(global)"] && predefined[t.id] === false) {
          warning("W079", t.token, t.id);
        }
        if (t.id && !funct["(nolet)"]) {
          addlabel(t.id, "unused", t.token, true);
          names.push(t.token);
        }
      }
      if (prefix) {
        break;
      }

      this.first = this.first.concat(names);

      if (state.tokens.next.id === "=") {
        nonadjacent(state.tokens.curr, state.tokens.next);
        advance("=");
        nonadjacent(state.tokens.curr, state.tokens.next);
        if (state.tokens.next.id === "undefined") {
          warning("W080", state.tokens.prev, state.tokens.prev.value);
        }
        if (peek(0).id === "=" && state.tokens.next.identifier) {
          warning("W120", state.tokens.next, state.tokens.next.value);
        }
        value = expression(10);
        if (lone) {
          tokens[0].first = value;
        } else {
          destructuringExpressionMatch(names, value);
        }
      }

      if (state.tokens.next.id !== ",") {
        break;
      }
      comma();
    }
    if (letblock) {
      advance(")");
      block(true, true);
      this.block = true;
      funct["(blockscope)"].unstack();
    }

    return this;
  });
  letstatement.exps = true;

  blockstmt("class", function () {
    return classdef.call(this, true);
  });

  function classdef(stmt) {
    /*jshint validthis:true */
    if (!state.option.inESNext()) {
      warning("W104", state.tokens.curr, "class");
    }
    if (stmt) {
      // BindingIdentifier
      this.name = identifier();
      addlabel(this.name, "unused", state.tokens.curr);
    } else if (state.tokens.next.identifier && state.tokens.next.value !== "extends") {
      // BindingIdentifier(opt)
      this.name = identifier();
    }
    classtail(this);
    return this;
  }

  function classtail(c) {
    var strictness = state.directive["use strict"];

    // ClassHeritage(opt)
    if (state.tokens.next.value === "extends") {
      advance("extends");
      c.heritage = expression(10);
    }

    // A ClassBody is always strict code.
    state.directive["use strict"] = true;
    advance("{");
    // ClassBody(opt)
    c.body = state.syntax["{"].nud(true);
    state.directive["use strict"] = strictness;
  }

  blockstmt("function", function () {
    var generator = false;
    if (state.tokens.next.value === "*") {
      advance("*");
      if (state.option.inESNext(true)) {
        generator = true;
      } else {
        warning("W119", state.tokens.curr, "function*");
      }
    }
    if (inblock) {
      warning("W082", state.tokens.curr);

    }
    var i = identifier();
    if (funct[i] === "const") {
      warning("E011", null, i);
    }
    adjacent(state.tokens.curr, state.tokens.next);
    addlabel(i, "unction", state.tokens.curr);

    doFunction(i, { statement: true }, generator);
    if (state.tokens.next.id === "(" && state.tokens.next.line === state.tokens.curr.line) {
      error("E039");
    }
    return this;
  });

  prefix("function", function () {
    var generator = false;
    if (state.tokens.next.value === "*") {
      if (!state.option.inESNext()) {
        warning("W119", state.tokens.curr, "function*");
      }
      advance("*");
      generator = true;
    }
    var i = optionalidentifier();
    if (i || state.option.gcl) {
      adjacent(state.tokens.curr, state.tokens.next);
    } else {
      nonadjacent(state.tokens.curr, state.tokens.next);
    }
    doFunction(i, undefined, generator);
    if (!state.option.loopfunc && funct["(loopage)"]) {
      warning("W083");
    }
    return this;
  });

  blockstmt("if", function () {
    var t = state.tokens.next;
    increaseComplexityCount();
    state.condition = true;
    advance("(");
    nonadjacent(this, t);
    nospace();
    checkCondAssignment(expression(0));
    advance(")", t);
    state.condition = false;
    nospace(state.tokens.prev, state.tokens.curr);
    block(true, true);
    if (state.tokens.next.id === "else") {
      nonadjacent(state.tokens.curr, state.tokens.next);
      advance("else");
      if (state.tokens.next.id === "if" || state.tokens.next.id === "switch") {
        statement(true);
      } else {
        block(true, true);
      }
    }
    return this;
  });

  blockstmt("try", function () {
    var b;

    function doCatch() {
      var oldScope = scope;
      var e;

      advance("catch");
      nonadjacent(state.tokens.curr, state.tokens.next);
      advance("(");

      scope = Object.create(oldScope);

      e = state.tokens.next.value;
      if (state.tokens.next.type !== "(identifier)") {
        e = null;
        warning("E030", state.tokens.next, e);
      }

      advance();

      funct = {
        "(name)"     : "(catch)",
        "(line)"     : state.tokens.next.line,
        "(character)": state.tokens.next.character,
        "(context)"  : funct,
        "(breakage)" : funct["(breakage)"],
        "(loopage)"  : funct["(loopage)"],
        "(scope)"    : scope,
        "(statement)": false,
        "(metrics)"  : createMetrics(state.tokens.next),
        "(catch)"    : true,
        "(tokens)"   : {},
        "(blockscope)": funct["(blockscope)"],
        "(comparray)": funct["(comparray)"]
      };

      if (e) {
        addlabel(e, "exception");
      }

      if (state.tokens.next.value === "if") {
        if (!state.option.inMoz(true)) {
          warning("W118", state.tokens.curr, "catch filter");
        }
        advance("if");
        expression(0);
      }

      advance(")");

      state.tokens.curr.funct = funct;
      functions.push(funct);

      block(false);

      scope = oldScope;

      funct["(last)"] = state.tokens.curr.line;
      funct["(lastcharacter)"] = state.tokens.curr.character;
      funct = funct["(context)"];
    }

    block(false);

    while (state.tokens.next.id === "catch") {
      increaseComplexityCount();
      if (b && (!state.option.inMoz(true))) {
        warning("W118", state.tokens.next, "multiple catch blocks");
      }
      doCatch();
      b = true;
    }

    if (state.tokens.next.id === "finally") {
      advance("finally");
      block(false);
      return;
    }

    if (!b) {
      error("E021", state.tokens.next, "catch", state.tokens.next.value);
    }

    return this;
  });

  blockstmt("while", function () {
    var t = state.tokens.next;
    funct["(breakage)"] += 1;
    funct["(loopage)"] += 1;
    increaseComplexityCount();
    advance("(");
    nonadjacent(this, t);
    nospace();
    checkCondAssignment(expression(0));
    advance(")", t);
    nospace(state.tokens.prev, state.tokens.curr);
    block(true, true);
    funct["(breakage)"] -= 1;
    funct["(loopage)"] -= 1;
    return this;
  }).labelled = true;

  blockstmt("with", function () {
    var t = state.tokens.next;
    if (state.directive["use strict"]) {
      error("E010", state.tokens.curr);
    } else if (!state.option.withstmt) {
      warning("W085", state.tokens.curr);
    }

    advance("(");
    nonadjacent(this, t);
    nospace();
    expression(0);
    advance(")", t);
    nospace(state.tokens.prev, state.tokens.curr);
    block(true, true);

    return this;
  });

  blockstmt("switch", function () {
    var t = state.tokens.next,
      g = false;
    funct["(breakage)"] += 1;
    advance("(");
    nonadjacent(this, t);
    nospace();
    checkCondAssignment(expression(0));
    advance(")", t);
    nospace(state.tokens.prev, state.tokens.curr);
    nonadjacent(state.tokens.curr, state.tokens.next);
    t = state.tokens.next;
    advance("{");
    nonadjacent(state.tokens.curr, state.tokens.next);
    indent += state.option.indent;
    this.cases = [];

    for (;;) {
      switch (state.tokens.next.id) {
      case "case":
        switch (funct["(verb)"]) {
        case "yield":
        case "break":
        case "case":
        case "continue":
        case "return":
        case "switch":
        case "throw":
          break;
        default:
          // You can tell JSHint that you don't use break intentionally by
          // adding a comment /* falls through */ on a line just before
          // the next `case`.
          if (!reg.fallsThrough.test(state.lines[state.tokens.next.line - 2])) {
            warning("W086", state.tokens.curr, "case");
          }
        }
        indentation(-state.option.indent);
        advance("case");
        this.cases.push(expression(20));
        increaseComplexityCount();
        g = true;
        advance(":");
        funct["(verb)"] = "case";
        break;
      case "default":
        switch (funct["(verb)"]) {
        case "yield":
        case "break":
        case "continue":
        case "return":
        case "throw":
          break;
        default:
          // Do not display a warning if 'default' is the first statement or if
          // there is a special /* falls through */ comment.
          if (this.cases.length) {
            if (!reg.fallsThrough.test(state.lines[state.tokens.next.line - 2])) {
              warning("W086", state.tokens.curr, "default");
            }
          }
        }
        indentation(-state.option.indent);
        advance("default");
        g = true;
        advance(":");
        break;
      case "}":
        indent -= state.option.indent;
        indentation();
        advance("}", t);
        funct["(breakage)"] -= 1;
        funct["(verb)"] = undefined;
        return;
      case "(end)":
        error("E023", state.tokens.next, "}");
        return;
      default:
        if (g) {
          switch (state.tokens.curr.id) {
          case ",":
            error("E040");
            return;
          case ":":
            g = false;
            statements();
            break;
          default:
            error("E025", state.tokens.curr);
            return;
          }
        } else {
          if (state.tokens.curr.id === ":") {
            advance(":");
            error("E024", state.tokens.curr, ":");
            statements();
          } else {
            error("E021", state.tokens.next, "case", state.tokens.next.value);
            return;
          }
        }
      }
    }
  }).labelled = true;

  stmt("debugger", function () {
    if (!state.option.debug) {
      warning("W087", this);
    }
    return this;
  }).exps = true;

  (function () {
    var x = stmt("do", function () {
      funct["(breakage)"] += 1;
      funct["(loopage)"] += 1;
      increaseComplexityCount();

      this.first = block(true, true);
      advance("while");
      var t = state.tokens.next;
      nonadjacent(state.tokens.curr, t);
      advance("(");
      nospace();
      checkCondAssignment(expression(0));
      advance(")", t);
      nospace(state.tokens.prev, state.tokens.curr);
      funct["(breakage)"] -= 1;
      funct["(loopage)"] -= 1;
      return this;
    });
    x.labelled = true;
    x.exps = true;
  }());

  blockstmt("for", function () {
    var s, t = state.tokens.next;
    var letscope = false;
    var foreachtok = null;

    if (t.value === "each") {
      foreachtok = t;
      advance("each");
      if (!state.option.inMoz(true)) {
        warning("W118", state.tokens.curr, "for each");
      }
    }

    funct["(breakage)"] += 1;
    funct["(loopage)"] += 1;
    increaseComplexityCount();
    advance("(");
    nonadjacent(this, t);
    nospace();

    // what kind of for(…) statement it is? for(…of…)? for(…in…)? for(…;…;…)?
    var nextop; // contains the token of the "in" or "of" operator
    var i = 0;
    var inof = ["in", "of"];
    do {
      nextop = peek(i);
      ++i;
    } while (!_.contains(inof, nextop.value) && nextop.value !== ";" &&
          nextop.type !== "(end)");

    // if we're in a for (… in|of …) statement
    if (_.contains(inof, nextop.value)) {
      if (!state.option.inESNext() && nextop.value === "of") {
        error("W104", nextop, "for of");
      }
      if (state.tokens.next.id === "var") {
        advance("var");
        state.syntax["var"].fud.call(state.syntax["var"].fud, true);
      } else if (state.tokens.next.id === "let") {
        advance("let");
        // create a new block scope
        letscope = true;
        funct["(blockscope)"].stack();
        state.syntax["let"].fud.call(state.syntax["let"].fud, true);
      } else {
        switch (funct[state.tokens.next.value]) {
        case "unused":
          funct[state.tokens.next.value] = "var";
          break;
        case "var":
          break;
        default:
          if (!funct["(blockscope)"].getlabel(state.tokens.next.value))
            warning("W088", state.tokens.next, state.tokens.next.value);
        }
        advance();
      }
      advance(nextop.value);
      expression(20);
      advance(")", t);
      s = block(true, true);
      if (state.option.forin && s && (s.length > 1 || typeof s[0] !== "object" ||
          s[0].value !== "if")) {
        warning("W089", this);
      }
      funct["(breakage)"] -= 1;
      funct["(loopage)"] -= 1;
    } else {
      if (foreachtok) {
        error("E045", foreachtok);
      }
      if (state.tokens.next.id !== ";") {
        if (state.tokens.next.id === "var") {
          advance("var");
          state.syntax["var"].fud.call(state.syntax["var"].fud);
        } else if (state.tokens.next.id === "let") {
          advance("let");
          // create a new block scope
          letscope = true;
          funct["(blockscope)"].stack();
          state.syntax["let"].fud.call(state.syntax["let"].fud);
        } else {
          for (;;) {
            expression(0, "for");
            if (state.tokens.next.id !== ",") {
              break;
            }
            comma();
          }
        }
      }
      nolinebreak(state.tokens.curr);
      advance(";");
      if (state.tokens.next.id !== ";") {
        checkCondAssignment(expression(0));
      }
      nolinebreak(state.tokens.curr);
      advance(";");
      if (state.tokens.next.id === ";") {
        error("E021", state.tokens.next, ")", ";");
      }
      if (state.tokens.next.id !== ")") {
        for (;;) {
          expression(0, "for");
          if (state.tokens.next.id !== ",") {
            break;
          }
          comma();
        }
      }
      advance(")", t);
      nospace(state.tokens.prev, state.tokens.curr);
      block(true, true);
      funct["(breakage)"] -= 1;
      funct["(loopage)"] -= 1;

    }
    // unstack loop blockscope
    if (letscope) {
      funct["(blockscope)"].unstack();
    }
    return this;
  }).labelled = true;


  stmt("break", function () {
    var v = state.tokens.next.value;

    if (funct["(breakage)"] === 0)
      warning("W052", state.tokens.next, this.value);

    if (!state.option.asi)
      nolinebreak(this);

    if (state.tokens.next.id !== ";" && !state.tokens.next.reach) {
      if (state.tokens.curr.line === state.tokens.next.line) {
        if (funct[v] !== "label") {
          warning("W090", state.tokens.next, v);
        } else if (scope[v] !== funct) {
          warning("W091", state.tokens.next, v);
        }
        this.first = state.tokens.next;
        advance();
      }
    }
    reachable("break");
    return this;
  }).exps = true;


  stmt("continue", function () {
    var v = state.tokens.next.value;

    if (funct["(breakage)"] === 0)
      warning("W052", state.tokens.next, this.value);

    if (!state.option.asi)
      nolinebreak(this);

    if (state.tokens.next.id !== ";" && !state.tokens.next.reach) {
      if (state.tokens.curr.line === state.tokens.next.line) {
        if (funct[v] !== "label") {
          warning("W090", state.tokens.next, v);
        } else if (scope[v] !== funct) {
          warning("W091", state.tokens.next, v);
        }
        this.first = state.tokens.next;
        advance();
      }
    } else if (!funct["(loopage)"]) {
      warning("W052", state.tokens.next, this.value);
    }
    reachable("continue");
    return this;
  }).exps = true;


  stmt("return", function () {
    if (this.line === state.tokens.next.line) {
      if (state.tokens.next.id === "(regexp)")
        warning("W092");

      if (state.tokens.next.id !== ";" && !state.tokens.next.reach) {
        nonadjacent(state.tokens.curr, state.tokens.next);
        this.first = expression(0);

        if (this.first &&
            this.first.type === "(punctuator)" && this.first.value === "=" && !state.option.boss) {
          warningAt("W093", this.first.line, this.first.character);
        }
      }
    } else {
      if (state.tokens.next.type === "(punctuator)" &&
        ["[", "{", "+", "-"].indexOf(state.tokens.next.value) > -1) {
        nolinebreak(this); // always warn (Line breaking error)
      }
    }
    reachable("return");
    return this;
  }).exps = true;

  (function (x) {
    x.exps = true;
    x.lbp = 25;
  }(prefix("yield", function () {
    var prev = state.tokens.prev;
    if (state.option.inESNext(true) && !funct["(generator)"]) {
      error("E046", state.tokens.curr, "yield");
    } else if (!state.option.inESNext()) {
      warning("W104", state.tokens.curr, "yield");
    }
    funct["(generator)"] = "yielded";
    if (this.line === state.tokens.next.line || !state.option.inMoz(true)) {
      if (state.tokens.next.id === "(regexp)")
        warning("W092");

      if (state.tokens.next.id !== ";" && !state.tokens.next.reach && state.tokens.next.nud) {
        nobreaknonadjacent(state.tokens.curr, state.tokens.next);
        this.first = expression(10);

        if (this.first.type === "(punctuator)" && this.first.value === "=" && !state.option.boss) {
          warningAt("W093", this.first.line, this.first.character);
        }
      }

      if (state.option.inMoz(true) && state.tokens.next.id !== ")" &&
          (prev.lbp > 30 || (!prev.assign && !isEndOfExpr()) || prev.id === "yield")) {
        error("E050", this);
      }
    } else if (!state.option.asi) {
      nolinebreak(this); // always warn (Line breaking error)
    }
    return this;
  })));


  stmt("throw", function () {
    nolinebreak(this);
    nonadjacent(state.tokens.curr, state.tokens.next);
    this.first = expression(20);
    reachable("throw");
    return this;
  }).exps = true;

  stmt("import", function () {
    if (!state.option.inESNext()) {
      warning("W119", state.tokens.curr, "import");
    }

    if (state.tokens.next.identifier) {
      this.name = identifier();
      addlabel(this.name, "unused", state.tokens.curr);
    } else {
      advance("{");
      for (;;) {
        var importName;
        if (state.tokens.next.type === "default") {
          importName = "default";
          advance("default");
        } else {
          importName = identifier();
        }
        if (state.tokens.next.value === "as") {
          advance("as");
          importName = identifier();
        }
        addlabel(importName, "unused", state.tokens.curr);

        if (state.tokens.next.value === ",") {
          advance(",");
        } else if (state.tokens.next.value === "}") {
          advance("}");
          break;
        } else {
          error("E024", state.tokens.next, state.tokens.next.value);
          break;
        }
      }
    }

    advance("from");
    advance("(string)");
    return this;
  }).exps = true;

  stmt("export", function () {
    if (!state.option.inESNext()) {
      warning("W119", state.tokens.curr, "export");
    }

    if (state.tokens.next.type === "default") {
      advance("default");
      if (state.tokens.next.id === "function" || state.tokens.next.id === "class") {
        this.block = true;
      }
      this.exportee = expression(10);

      return this;
    }

    if (state.tokens.next.value === "{") {
      advance("{");
      for (;;) {
        identifier();

        if (state.tokens.next.value === ",") {
          advance(",");
        } else if (state.tokens.next.value === "}") {
          advance("}");
          break;
        } else {
          error("E024", state.tokens.next, state.tokens.next.value);
          break;
        }
      }
      return this;
    }

    if (state.tokens.next.id === "var") {
      advance("var");
      state.syntax["var"].fud.call(state.syntax["var"].fud);
    } else if (state.tokens.next.id === "let") {
      advance("let");
      state.syntax["let"].fud.call(state.syntax["let"].fud);
    } else if (state.tokens.next.id === "const") {
      advance("const");
      state.syntax["const"].fud.call(state.syntax["const"].fud);
    } else if (state.tokens.next.id === "function") {
      this.block = true;
      advance("function");
      state.syntax["function"].fud();
    } else if (state.tokens.next.id === "class") {
      this.block = true;
      advance("class");
      state.syntax["class"].fud();
    } else {
      error("E024", state.tokens.next, state.tokens.next.value);
    }

    return this;
  }).exps = true;

  // Future Reserved Words

  FutureReservedWord("abstract");
  FutureReservedWord("boolean");
  FutureReservedWord("byte");
  FutureReservedWord("char");
  FutureReservedWord("class", { es5: true, nud: classdef });
  FutureReservedWord("double");
  FutureReservedWord("enum", { es5: true });
  FutureReservedWord("export", { es5: true });
  FutureReservedWord("extends", { es5: true });
  FutureReservedWord("final");
  FutureReservedWord("float");
  FutureReservedWord("goto");
  FutureReservedWord("implements", { es5: true, strictOnly: true });
  FutureReservedWord("import", { es5: true });
  FutureReservedWord("int");
  FutureReservedWord("interface", { es5: true, strictOnly: true });
  FutureReservedWord("long");
  FutureReservedWord("native");
  FutureReservedWord("package", { es5: true, strictOnly: true });
  FutureReservedWord("private", { es5: true, strictOnly: true });
  FutureReservedWord("protected", { es5: true, strictOnly: true });
  FutureReservedWord("public", { es5: true, strictOnly: true });
  FutureReservedWord("short");
  FutureReservedWord("static", { es5: true, strictOnly: true });
  FutureReservedWord("super", { es5: true });
  FutureReservedWord("synchronized");
  FutureReservedWord("throws");
  FutureReservedWord("transient");
  FutureReservedWord("volatile");

  // this function is used to determine wether a squarebracket or a curlybracket
  // expression is a comprehension array, destructuring assignment or a json value.

  var lookupBlockType = function () {
    var pn, pn1;
    var i = -1;
    var bracketStack = 0;
    var ret = {};
    if (_.contains(["[", "{"], state.tokens.curr.value))
      bracketStack += 1;
    do {
      pn = (i === -1) ? state.tokens.next : peek(i);
      pn1 = peek(i + 1);
      i = i + 1;
      if (_.contains(["[", "{"], pn.value)) {
        bracketStack += 1;
      } else if (_.contains(["]", "}"], pn.value)) {
        bracketStack -= 1;
      }
      if (pn.identifier && pn.value === "for" && bracketStack === 1) {
        ret.isCompArray = true;
        ret.notJson = true;
        break;
      }
      if (_.contains(["}", "]"], pn.value) && pn1.value === "=" && bracketStack === 0) {
        ret.isDestAssign = true;
        ret.notJson = true;
        break;
      }
      if (pn.value === ";") {
        ret.isBlock = true;
        ret.notJson = true;
      }
    } while (bracketStack > 0 && pn.id !== "(end)" && i < 15);
    return ret;
  };

  // Check whether this function has been reached for a destructuring assign with undeclared values
  function destructuringAssignOrJsonValue() {
    // lookup for the assignment (esnext only)
    // if it has semicolons, it is a block, so go parse it as a block
    // or it's not a block, but there are assignments, check for undeclared variables

    var block = lookupBlockType();
    if (block.notJson) {
      if (!state.option.inESNext() && block.isDestAssign) {
        warning("W104", state.tokens.curr, "destructuring assignment");
      }
      statements();
    // otherwise parse json value
    } else {
      state.option.laxbreak = true;
      state.jsonMode = true;
      jsonValue();
    }
  }

  // array comprehension parsing function
  // parses and defines the three states of the list comprehension in order
  // to avoid defining global variables, but keeping them to the list comprehension scope
  // only. The order of the states are as follows:
  //  * "use" which will be the returned iterative part of the list comprehension
  //  * "define" which will define the variables local to the list comprehension
  //  * "filter" which will help filter out values

  var arrayComprehension = function () {
    var CompArray = function () {
      this.mode = "use";
      this.variables = [];
    };
    var _carrays = [];
    var _current;
    function declare(v) {
      var l = _current.variables.filter(function (elt) {
        // if it has, change its undef state
        if (elt.value === v) {
          elt.undef = false;
          return v;
        }
      }).length;
      return l !== 0;
    }
    function use(v) {
      var l = _current.variables.filter(function (elt) {
        // and if it has been defined
        if (elt.value === v && !elt.undef) {
          if (elt.unused === true) {
            elt.unused = false;
          }
          return v;
        }
      }).length;
      // otherwise we warn about it
      return (l === 0);
    }
    return {stack: function () {
          _current = new CompArray();
          _carrays.push(_current);
        },
        unstack: function () {
          _current.variables.filter(function (v) {
            if (v.unused)
              warning("W098", v.token, v.value);
            if (v.undef)
              isundef(v.funct, "W117", v.token, v.value);
          });
          _carrays.splice(-1, 1);
          _current = _carrays[_carrays.length - 1];
        },
        setState: function (s) {
          if (_.contains(["use", "define", "generate", "filter"], s))
            _current.mode = s;
        },
        check: function (v) {
          if (!_current) {
            return;
          }
          // When we are in "use" state of the list comp, we enqueue that var
          if (_current && _current.mode === "use") {
            if (use(v)) {
              _current.variables.push({
                funct: funct,
                token: state.tokens.curr,
                value: v,
                undef: true,
                unused: false
              });
            }
            return true;
          // When we are in "define" state of the list comp,
          } else if (_current && _current.mode === "define") {
            // check if the variable has been used previously
            if (!declare(v)) {
              _current.variables.push({
                funct: funct,
                token: state.tokens.curr,
                value: v,
                undef: false,
                unused: true
              });
            }
            return true;
          // When we are in the "generate" state of the list comp,
          } else if (_current && _current.mode === "generate") {
            isundef(funct, "W117", state.tokens.curr, v);
            return true;
          // When we are in "filter" state,
          } else if (_current && _current.mode === "filter") {
            // we check whether current variable has been declared
            if (use(v)) {
              // if not we warn about it
              isundef(funct, "W117", state.tokens.curr, v);
            }
            return true;
          }
          return false;
        }
        };
  };


  // Parse JSON

  function jsonValue() {

    function jsonObject() {
      var o = {}, t = state.tokens.next;
      advance("{");
      if (state.tokens.next.id !== "}") {
        for (;;) {
          if (state.tokens.next.id === "(end)") {
            error("E026", state.tokens.next, t.line);
          } else if (state.tokens.next.id === "}") {
            warning("W094", state.tokens.curr);
            break;
          } else if (state.tokens.next.id === ",") {
            error("E028", state.tokens.next);
          } else if (state.tokens.next.id !== "(string)") {
            warning("W095", state.tokens.next, state.tokens.next.value);
          }
          if (o[state.tokens.next.value] === true) {
            warning("W075", state.tokens.next, state.tokens.next.value);
          } else if ((state.tokens.next.value === "__proto__" &&
            !state.option.proto) || (state.tokens.next.value === "__iterator__" &&
            !state.option.iterator)) {
            warning("W096", state.tokens.next, state.tokens.next.value);
          } else {
            o[state.tokens.next.value] = true;
          }
          advance();
          advance(":");
          jsonValue();
          if (state.tokens.next.id !== ",") {
            break;
          }
          advance(",");
        }
      }
      advance("}");
    }

    function jsonArray() {
      var t = state.tokens.next;
      advance("[");
      if (state.tokens.next.id !== "]") {
        for (;;) {
          if (state.tokens.next.id === "(end)") {
            error("E027", state.tokens.next, t.line);
          } else if (state.tokens.next.id === "]") {
            warning("W094", state.tokens.curr);
            break;
          } else if (state.tokens.next.id === ",") {
            error("E028", state.tokens.next);
          }
          jsonValue();
          if (state.tokens.next.id !== ",") {
            break;
          }
          advance(",");
        }
      }
      advance("]");
    }

    switch (state.tokens.next.id) {
    case "{":
      jsonObject();
      break;
    case "[":
      jsonArray();
      break;
    case "true":
    case "false":
    case "null":
    case "(number)":
    case "(string)":
      advance();
      break;
    case "-":
      advance("-");
      if (state.tokens.curr.character !== state.tokens.next.from) {
        warning("W011", state.tokens.curr);
      }
      adjacent(state.tokens.curr, state.tokens.next);
      advance("(number)");
      break;
    default:
      error("E003", state.tokens.next);
    }
  }

  var blockScope = function () {
    var _current = {};
    var _variables = [_current];

    function _checkBlockLabels() {
      for (var t in _current) {
        if (_current[t]["(type)"] === "unused") {
          if (state.option.unused) {
            var tkn = _current[t]["(token)"];
            var line = tkn.line;
            var chr  = tkn.character;
            warningAt("W098", line, chr, t);
          }
        }
      }
    }

    return {
      stack: function () {
        _current = {};
        _variables.push(_current);
      },

      unstack: function () {
        _checkBlockLabels();
        _variables.splice(_variables.length - 1, 1);
        _current = _variables[_variables.length - 1];
      },

      getlabel: function (l) {
        for (var i = _variables.length - 1 ; i >= 0; --i) {
          if (_.has(_variables[i], l)) {
            return _variables[i];
          }
        }
      },

      current: {
        has: function (t) {
          return _.has(_current, t);
        },
        add: function (t, type, tok) {
          _current[t] = { "(type)" : type,
                  "(token)": tok };
        }
      }
    };
  };

  // The actual JSHINT function itself.
  var itself = function (s, o, g) {
    var i, k, x;
    var optionKeys;
    var newOptionObj = {};
    var newIgnoredObj = {};

    state.reset();

    if (o && o.scope) {
      JSHINT.scope = o.scope;
    } else {
      JSHINT.errors = [];
      JSHINT.undefs = [];
      JSHINT.internals = [];
      JSHINT.blacklist = {};
      JSHINT.scope = "(main)";
    }

    predefined = Object.create(null);
    combine(predefined, vars.ecmaIdentifiers);
    combine(predefined, vars.reservedVars);

    combine(predefined, g || {});

    declared = Object.create(null);
    exported = Object.create(null);

    function each(obj, cb) {
      if (!obj)
        return;

      if (!Array.isArray(obj) && typeof obj === "object")
        obj = Object.keys(obj);

      obj.forEach(cb);
    }

    if (o) {
      each(o.predef || null, function (item) {
        var slice, prop;

        if (item[0] === "-") {
          slice = item.slice(1);
          JSHINT.blacklist[slice] = slice;
        } else {
          prop = Object.getOwnPropertyDescriptor(o.predef, item);
          predefined[item] = prop ? prop.value : false;
        }
      });

      each(o.exported || null, function (item) {
        exported[item] = true;
      });

      delete o.predef;
      delete o.exported;

      optionKeys = Object.keys(o);
      for (x = 0; x < optionKeys.length; x++) {
        if (/^-W\d{3}$/g.test(optionKeys[x])) {
          newIgnoredObj[optionKeys[x].slice(1)] = true;
        } else {
          newOptionObj[optionKeys[x]] = o[optionKeys[x]];

          if (optionKeys[x] === "newcap" && o[optionKeys[x]] === false)
            newOptionObj["(explicitNewcap)"] = true;

          if (optionKeys[x] === "indent")
            newOptionObj["(explicitIndent)"] = o[optionKeys[x]] === false ? false : true;
        }
      }
    }

    state.option = newOptionObj;
    state.ignored = newIgnoredObj;

    state.option.indent = state.option.indent || 4;
    state.option.maxerr = state.option.maxerr || 50;

    indent = 1;
    global = Object.create(predefined);
    scope = global;
    funct = {
      "(global)":   true,
      "(name)":   "(global)",
      "(scope)":    scope,
      "(breakage)": 0,
      "(loopage)":  0,
      "(tokens)":   {},
      "(metrics)":   createMetrics(state.tokens.next),
      "(blockscope)": blockScope(),
      "(comparray)": arrayComprehension()
    };
    functions = [funct];
    urls = [];
    stack = null;
    member = {};
    membersOnly = null;
    implied = {};
    inblock = false;
    lookahead = [];
    warnings = 0;
    unuseds = [];

    if (!isString(s) && !Array.isArray(s)) {
      errorAt("E004", 0);
      return false;
    }

    api = {
      get isJSON() {
        return state.jsonMode;
      },

      getOption: function (name) {
        return state.option[name] || null;
      },

      getCache: function (name) {
        return state.cache[name];
      },

      setCache: function (name, value) {
        state.cache[name] = value;
      },

      warn: function (code, data) {
        warningAt.apply(null, [ code, data.line, data.char ].concat(data.data));
      },

      on: function (names, listener) {
        names.split(" ").forEach(function (name) {
          emitter.on(name, listener);
        }.bind(this));
      }
    };

    emitter.removeAllListeners();
    (extraModules || []).forEach(function (func) {
      func(api);
    });

    state.tokens.prev = state.tokens.curr = state.tokens.next = state.syntax["(begin)"];

    lex = new Lexer(s);

    lex.on("warning", function (ev) {
      warningAt.apply(null, [ ev.code, ev.line, ev.character].concat(ev.data));
    });

    lex.on("error", function (ev) {
      errorAt.apply(null, [ ev.code, ev.line, ev.character ].concat(ev.data));
    });

    lex.on("fatal", function (ev) {
      quit("E041", ev.line, ev.from);
    });

    lex.on("Identifier", function (ev) {
      emitter.emit("Identifier", ev);
    });

    lex.on("String", function (ev) {
      emitter.emit("String", ev);
    });

    lex.on("Number", function (ev) {
      emitter.emit("Number", ev);
    });

    lex.start();

    // Check options
    for (var name in o) {
      if (_.has(o, name)) {
        checkOption(name, state.tokens.curr);
      }
    }

    assume();

    // combine the passed globals after we've assumed all our options
    combine(predefined, g || {});

    //reset values
    comma.first = true;

    try {
      advance();
      switch (state.tokens.next.id) {
      case "{":
      case "[":
        destructuringAssignOrJsonValue();
        break;
      default:
        directives();

        if (state.directive["use strict"]) {
          if (!state.option.globalstrict && !(state.option.node || state.option.phantom)) {
            warning("W097", state.tokens.prev);
          }
        }

        statements();
      }
      advance((state.tokens.next && state.tokens.next.value !== ".")  ? "(end)" : undefined);
      funct["(blockscope)"].unstack();

      var markDefined = function (name, context) {
        do {
          if (typeof context[name] === "string") {
            // JSHINT marks unused variables as 'unused' and
            // unused function declaration as 'unction'. This
            // code changes such instances back 'var' and
            // 'closure' so that the code in JSHINT.data()
            // doesn't think they're unused.

            if (context[name] === "unused")
              context[name] = "var";
            else if (context[name] === "unction")
              context[name] = "closure";

            return true;
          }

          context = context["(context)"];
        } while (context);

        return false;
      };

      var clearImplied = function (name, line) {
        if (!implied[name])
          return;

        var newImplied = [];
        for (var i = 0; i < implied[name].length; i += 1) {
          if (implied[name][i] !== line)
            newImplied.push(implied[name][i]);
        }

        if (newImplied.length === 0)
          delete implied[name];
        else
          implied[name] = newImplied;
      };

      var warnUnused = function (name, tkn, type, unused_opt) {
        var line = tkn.line;
        var chr  = tkn.character;

        if (unused_opt === undefined) {
          unused_opt = state.option.unused;
        }

        if (unused_opt === true) {
          unused_opt = "last-param";
        }

        var warnable_types = {
          "vars": ["var"],
          "last-param": ["var", "param"],
          "strict": ["var", "param", "last-param"]
        };

        if (unused_opt) {
          if (warnable_types[unused_opt] && warnable_types[unused_opt].indexOf(type) !== -1) {
            warningAt("W098", line, chr, name);
          }
        }

        unuseds.push({
          name: name,
          line: line,
          character: chr
        });
      };

      var checkUnused = function (func, key) {
        var type = func[key];
        var tkn = func["(tokens)"][key];

        if (key.charAt(0) === "(")
          return;

        if (type !== "unused" && type !== "unction")
          return;

        // Params are checked separately from other variables.
        if (func["(params)"] && func["(params)"].indexOf(key) !== -1)
          return;

        // Variable is in global scope and defined as exported.
        if (func["(global)"] && _.has(exported, key)) {
          return;
        }

        warnUnused(key, tkn, "var");
      };

      // Check queued 'x is not defined' instances to see if they're still undefined.
      for (i = 0; i < JSHINT.undefs.length; i += 1) {
        k = JSHINT.undefs[i].slice(0);

        if (markDefined(k[2].value, k[0])) {
          clearImplied(k[2].value, k[2].line);
        } else if (state.option.undef) {
          warning.apply(warning, k.slice(1));
        }
      }

      functions.forEach(function (func) {
        if (func["(unusedOption)"] === false) {
          return;
        }

        for (var key in func) {
          if (_.has(func, key)) {
            checkUnused(func, key);
          }
        }

        if (!func["(params)"])
          return;

        var params = func["(params)"].slice();
        var param  = params.pop();
        var type, unused_opt;

        while (param) {
          type = func[param];
          unused_opt = func["(unusedOption)"] || state.option.unused;
          unused_opt = unused_opt === true ? "last-param" : unused_opt;

          // 'undefined' is a special case for (function (window, undefined) { ... })();
          // patterns.

          if (param === "undefined")
            return;

          if (type === "unused" || type === "unction") {
            warnUnused(param, func["(tokens)"][param], "param", func["(unusedOption)"]);
          } else if (unused_opt === "last-param") {
            return;
          }

          param = params.pop();
        }
      });

      for (var key in declared) {
        if (_.has(declared, key) && !_.has(global, key)) {
          warnUnused(key, declared[key], "var");
        }
      }

    } catch (err) {
      if (err && err.name === "JSHintError") {
        var nt = state.tokens.next || {};
        JSHINT.errors.push({
          scope     : "(main)",
          raw       : err.raw,
          code      : err.code,
          reason    : err.message,
          line      : err.line || nt.line,
          character : err.character || nt.from
        }, null);
      } else {
        throw err;
      }
    }

    // Loop over the listed "internals", and check them as well.

    if (JSHINT.scope === "(main)") {
      o = o || {};

      for (i = 0; i < JSHINT.internals.length; i += 1) {
        k = JSHINT.internals[i];
        o.scope = k.elem;
        itself(k.value, o, g);
      }
    }

    return JSHINT.errors.length === 0;
  };

  // Modules.
  itself.addModule = function (func) {
    extraModules.push(func);
  };

  itself.addModule(style.register);

  // Data summary.
  itself.data = function () {
    var data = {
      functions: [],
      options: state.option
    };

    var implieds = [];
    var members = [];
    var fu, f, i, j, n, globals;

    if (itself.errors.length) {
      data.errors = itself.errors;
    }

    if (state.jsonMode) {
      data.json = true;
    }

    for (n in implied) {
      if (_.has(implied, n)) {
        implieds.push({
          name: n,
          line: implied[n]
        });
      }
    }

    if (implieds.length > 0) {
      data.implieds = implieds;
    }

    if (urls.length > 0) {
      data.urls = urls;
    }

    globals = Object.keys(scope);
    if (globals.length > 0) {
      data.globals = globals;
    }

    for (i = 1; i < functions.length; i += 1) {
      f = functions[i];
      fu = {};

      for (j = 0; j < functionicity.length; j += 1) {
        fu[functionicity[j]] = [];
      }

      for (j = 0; j < functionicity.length; j += 1) {
        if (fu[functionicity[j]].length === 0) {
          delete fu[functionicity[j]];
        }
      }

      fu.name = f["(name)"];
      fu.param = f["(params)"];
      fu.line = f["(line)"];
      fu.character = f["(character)"];
      fu.last = f["(last)"];
      fu.lastcharacter = f["(lastcharacter)"];

      fu.metrics = {
        complexity: f["(metrics)"].ComplexityCount,
        parameters: (f["(params)"] || []).length,
        statements: f["(metrics)"].statementCount
      };

      data.functions.push(fu);
    }

    if (unuseds.length > 0) {
      data.unused = unuseds;
    }

    members = [];
    for (n in member) {
      if (typeof member[n] === "number") {
        data.member = member;
        break;
      }
    }

    return data;
  };

  itself.jshint = itself;

  return itself;
}());

// Make JSHINT a Node module, if possible.
if (typeof exports === "object" && exports) {
  exports.JSHINT = JSHINT;
}

})()
},{"events":2,"./vars.js":3,"./messages.js":4,"./lex.js":8,"./reg.js":5,"./state.js":6,"./style.js":7,"console-browserify":9}],9:[function(require,module,exports){
(function(global){/*global window, global*/
var util = require("util")
var assert = require("assert")

var slice = Array.prototype.slice
var console
var times = {}

if (typeof global !== "undefined" && global.console) {
    console = global.console
} else if (typeof window !== "undefined" && window.console) {
    console = window.console
} else {
    console = window.console = {}
}

var functions = [
    [log, "log"]
    , [info, "info"]
    , [warn, "warn"]
    , [error, "error"]
    , [time, "time"]
    , [timeEnd, "timeEnd"]
    , [trace, "trace"]
    , [dir, "dir"]
    , [assert, "assert"]
]

for (var i = 0; i < functions.length; i++) {
    var tuple = functions[i]
    var f = tuple[0]
    var name = tuple[1]

    if (!console[name]) {
        console[name] = f
    }
}

module.exports = console

function log() {}

function info() {
    console.log.apply(console, arguments)
}

function warn() {
    console.log.apply(console, arguments)
}

function error() {
    console.warn.apply(console, arguments)
}

function time(label) {
    times[label] = Date.now()
}

function timeEnd(label) {
    var time = times[label]
    if (!time) {
        throw new Error("No such label: " + label)
    }

    var duration = Date.now() - time
    console.log(label + ": " + duration + "ms")
}

function trace() {
    var err = new Error()
    err.name = "Trace"
    err.message = util.format.apply(null, arguments)
    console.error(err.stack)
}

function dir(object) {
    console.log(util.inspect(object) + "\n")
}

function assert(expression) {
    if (!expression) {
        var arr = slice.call(arguments, 1)
        assert.ok(false, util.format.apply(null, arr))
    }
}

})(window)
},{"util":10,"assert":11}],10:[function(require,module,exports){
var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
}


function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

},{"events":2}],11:[function(require,module,exports){
(function(){// UTILITY
var util = require('util');
var Buffer = require("buffer").Buffer;
var pSlice = Array.prototype.slice;

function objectKeys(object) {
  if (Object.keys) return Object.keys(object);
  var result = [];
  for (var name in object) {
    if (Object.prototype.hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.message = options.message;
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
};
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (value === undefined) {
    return '' + value;
  }
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (typeof value === 'function' || value instanceof RegExp) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (typeof s == 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

assert.AssertionError.prototype.toString = function() {
  if (this.message) {
    return [this.name + ':', this.message].join(' ');
  } else {
    return [
      this.name + ':',
      truncate(JSON.stringify(this.actual, replacer), 128),
      this.operator,
      truncate(JSON.stringify(this.expected, replacer), 128)
    ].join(' ');
  }
};

// assert.AssertionError instanceof Error

assert.AssertionError.__proto__ = Error.prototype;

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!!!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (expected instanceof RegExp) {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail('Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail('Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

})()
},{"util":10,"buffer":12}],13:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],12:[function(require,module,exports){
(function(){function SlowBuffer (size) {
    this.length = size;
};

var assert = require('assert');

exports.INSPECT_MAX_BYTES = 50;


function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

SlowBuffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
    case 'binary':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

SlowBuffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

SlowBuffer.prototype.binaryWrite = SlowBuffer.prototype.asciiWrite;

SlowBuffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

SlowBuffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

SlowBuffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

SlowBuffer.prototype.binarySlice = SlowBuffer.prototype.asciiSlice;

SlowBuffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<SlowBuffer ' + out.join(' ') + '>';
};


SlowBuffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


SlowBuffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


SlowBuffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  SlowBuffer._charsWritten = i * 2;
  return i;
};


SlowBuffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};


// slice(start, end)
SlowBuffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;

  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  return new Buffer(this, end - start, +start);
};

SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend) {
  var temp = [];
  for (var i=sourcestart; i<sourceend; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=targetstart; i<targetstart+temp.length; i++) {
    target[i] = temp[i-targetstart];
  }
};

SlowBuffer.prototype.fill = function(value, start, end) {
  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  for (var i = start; i < end; i++) {
    this[i] = value;
  }
}

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}


// Buffer

function Buffer(subject, encoding, offset) {
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    this.parent = subject;
    this.offset = offset;
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    if (this.length > Buffer.poolSize) {
      // Big buffer, just alloc one.
      this.parent = new SlowBuffer(this.length);
      this.offset = 0;

    } else {
      // Small buffer.
      if (!pool || pool.length - pool.used < this.length) allocPool();
      this.parent = pool;
      this.offset = pool.used;
      pool.used += this.length;
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        if (subject instanceof Buffer) {
          this.parent[i + this.offset] = subject.readUInt8(i);
        }
        else {
          this.parent[i + this.offset] = subject[i];
        }
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    }
  }

}

function isArrayIsh(subject) {
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

exports.SlowBuffer = SlowBuffer;
exports.Buffer = Buffer;

Buffer.poolSize = 8 * 1024;
var pool;

function allocPool() {
  pool = new SlowBuffer(Buffer.poolSize);
  pool.used = 0;
}


// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof SlowBuffer;
};

Buffer.concat = function (list, totalLength) {
  if (!Array.isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

// Inspect
Buffer.prototype.inspect = function inspect() {
  var out = [],
      len = this.length;

  for (var i = 0; i < len; i++) {
    out[i] = toHex(this.parent[i + this.offset]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }

  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i];
};


Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i] = v;
};


// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')
Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  var ret;
  switch (encoding) {
    case 'hex':
      ret = this.parent.hexWrite(string, this.offset + offset, length);
      break;

    case 'utf8':
    case 'utf-8':
      ret = this.parent.utf8Write(string, this.offset + offset, length);
      break;

    case 'ascii':
      ret = this.parent.asciiWrite(string, this.offset + offset, length);
      break;

    case 'binary':
      ret = this.parent.binaryWrite(string, this.offset + offset, length);
      break;

    case 'base64':
      // Warning: maxLength not taken into account in base64Write
      ret = this.parent.base64Write(string, this.offset + offset, length);
      break;

    case 'ucs2':
    case 'ucs-2':
      ret = this.parent.ucs2Write(string, this.offset + offset, length);
      break;

    default:
      throw new Error('Unknown encoding');
  }

  Buffer._charsWritten = SlowBuffer._charsWritten;

  return ret;
};


// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();

  if (typeof start == 'undefined' || start < 0) {
    start = 0;
  } else if (start > this.length) {
    start = this.length;
  }

  if (typeof end == 'undefined' || end > this.length) {
    end = this.length;
  } else if (end < 0) {
    end = 0;
  }

  start = start + this.offset;
  end = end + this.offset;

  switch (encoding) {
    case 'hex':
      return this.parent.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.parent.utf8Slice(start, end);

    case 'ascii':
      return this.parent.asciiSlice(start, end);

    case 'binary':
      return this.parent.binarySlice(start, end);

    case 'base64':
      return this.parent.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.parent.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


// byteLength
Buffer.byteLength = SlowBuffer.byteLength;


// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  return this.parent.fill(value,
                          start + this.offset,
                          end + this.offset);
};


// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  end || (end = this.length);
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  return this.parent.copy(target.parent,
                          target_start + target.offset,
                          start + this.offset,
                          end + this.offset);
};


// slice(start, end)
Buffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;
  if (end > this.length) throw new Error('oob');
  if (start > end) throw new Error('oob');

  return new Buffer(this.parent, end - start, +start + this.offset);
};


// Legacy methods for backwards compatibility.

Buffer.prototype.utf8Slice = function(start, end) {
  return this.toString('utf8', start, end);
};

Buffer.prototype.binarySlice = function(start, end) {
  return this.toString('binary', start, end);
};

Buffer.prototype.asciiSlice = function(start, end) {
  return this.toString('ascii', start, end);
};

Buffer.prototype.utf8Write = function(string, offset) {
  return this.write(string, offset, 'utf8');
};

Buffer.prototype.binaryWrite = function(string, offset) {
  return this.write(string, offset, 'binary');
};

Buffer.prototype.asciiWrite = function(string, offset) {
  return this.write(string, offset, 'ascii');
};

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  return buffer.parent[buffer.offset + offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset] << 8;
    if (offset + 1 < buffer.length) {
      val |= buffer.parent[buffer.offset + offset + 1];
    }
  } else {
    val = buffer.parent[buffer.offset + offset];
    if (offset + 1 < buffer.length) {
      val |= buffer.parent[buffer.offset + offset + 1] << 8;
    }
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    if (offset + 1 < buffer.length)
      val = buffer.parent[buffer.offset + offset + 1] << 16;
    if (offset + 2 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 2] << 8;
    if (offset + 3 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 3];
    val = val + (buffer.parent[buffer.offset + offset] << 24 >>> 0);
  } else {
    if (offset + 2 < buffer.length)
      val = buffer.parent[buffer.offset + offset + 2] << 16;
    if (offset + 1 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 1] << 8;
    val |= buffer.parent[buffer.offset + offset];
    if (offset + 3 < buffer.length)
      val = val + (buffer.parent[buffer.offset + offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  neg = buffer.parent[buffer.offset + offset] & 0x80;
  if (!neg) {
    return (buffer.parent[buffer.offset + offset]);
  }

  return ((0xff - buffer.parent[buffer.offset + offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  if (offset < buffer.length) {
    buffer.parent[buffer.offset + offset] = value;
  }
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
    buffer.parent[buffer.offset + offset + i] =
        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
            (isBigEndian ? 1 - i : i) * 8;
  }

}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
    buffer.parent[buffer.offset + offset + i] =
        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;
SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;
SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;
SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;
SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;
SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;
SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;
SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;
SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;
SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;
SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;
SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;
SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;
SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;
SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;
SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;
SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;
SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;
SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;
SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;
SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;
SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;
SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;
SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;
SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;
SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;
SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;
SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;

})()
},{"assert":11,"./buffer_ieee754":13,"base64-js":14}],14:[function(require,module,exports){
(function (exports) {
  'use strict';

  var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  function b64ToByteArray(b64) {
    var i, j, l, tmp, placeHolders, arr;
  
    if (b64.length % 4 > 0) {
      throw 'Invalid string. Length must be a multiple of 4';
    }

    // the number of equal signs (place holders)
    // if there are two placeholders, than the two characters before it
    // represent one byte
    // if there is only one, then the three characters before it represent 2 bytes
    // this is just a cheap hack to not do indexOf twice
    placeHolders = b64.indexOf('=');
    placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

    // base64 is 4/3 + up to two characters of the original data
    arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

    // if there are placeholders, only get up to the last complete 4 chars
    l = placeHolders > 0 ? b64.length - 4 : b64.length;

    for (i = 0, j = 0; i < l; i += 4, j += 3) {
      tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
      arr.push((tmp & 0xFF0000) >> 16);
      arr.push((tmp & 0xFF00) >> 8);
      arr.push(tmp & 0xFF);
    }

    if (placeHolders === 2) {
      tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
      arr.push(tmp & 0xFF);
    } else if (placeHolders === 1) {
      tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
      arr.push((tmp >> 8) & 0xFF);
      arr.push(tmp & 0xFF);
    }

    return arr;
  }

  function uint8ToBase64(uint8) {
    var i,
      extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
      output = "",
      temp, length;

    function tripletToBase64 (num) {
      return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
    };

    // go through the array every three bytes, we'll deal with trailing stuff later
    for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
      temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
      output += tripletToBase64(temp);
    }

    // pad the end with zeros, but make sure to not forget the extra bytes
    switch (extraBytes) {
      case 1:
        temp = uint8[uint8.length - 1];
        output += lookup[temp >> 2];
        output += lookup[(temp << 4) & 0x3F];
        output += '==';
        break;
      case 2:
        temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
        output += lookup[temp >> 10];
        output += lookup[(temp >> 4) & 0x3F];
        output += lookup[(temp << 2) & 0x3F];
        output += '=';
        break;
    }

    return output;
  }

  module.exports.toByteArray = b64ToByteArray;
  module.exports.fromByteArray = uint8ToBase64;
}());

},{}]},{},["FD4Lxs"])
;
JSHINT = require('jshint').JSHINT;
}());
/*
  Copyright (C) 2013 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2013 Thaddee Tyl <thaddee.tyl@gmail.com>
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*jslint bitwise:true plusplus:true */
/*global esprima:true, define:true, exports:true, window: true,
createLocationMarker: true,
throwError: true, generateStatement: true, peek: true,
parseAssignmentExpression: true, parseBlock: true, parseExpression: true,
parseFunctionDeclaration: true, parseFunctionExpression: true,
parseFunctionSourceElements: true, parseVariableIdentifier: true,
parseLeftHandSideExpression: true,
parseUnaryExpression: true,
parseStatement: true, parseSourceElement: true */

(function (root, factory) {
    'use strict';

    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.esprima = {}));
    }
}(this, function (exports) {
    'use strict';

    var Token,
        TokenName,
        FnExprTokens,
        Syntax,
        PropertyKind,
        Messages,
        Regex,
        SyntaxTreeDelegate,
        source,
        strict,
        index,
        lineNumber,
        lineStart,
        length,
        delegate,
        lookahead,
        state,
        extra;

    Token = {
        BooleanLiteral: 1,
        EOF: 2,
        Identifier: 3,
        Keyword: 4,
        NullLiteral: 5,
        NumericLiteral: 6,
        Punctuator: 7,
        StringLiteral: 8,
        RegularExpression: 9
    };

    TokenName = {};
    TokenName[Token.BooleanLiteral] = 'Boolean';
    TokenName[Token.EOF] = '<end>';
    TokenName[Token.Identifier] = 'Identifier';
    TokenName[Token.Keyword] = 'Keyword';
    TokenName[Token.NullLiteral] = 'Null';
    TokenName[Token.NumericLiteral] = 'Numeric';
    TokenName[Token.Punctuator] = 'Punctuator';
    TokenName[Token.StringLiteral] = 'String';
    TokenName[Token.RegularExpression] = 'RegularExpression';

    // A function following one of those tokens is an expression.
    FnExprTokens = ['(', '{', '[', 'in', 'typeof', 'instanceof', 'new',
                    'return', 'case', 'delete', 'throw', 'void',
                    // assignment operators
                    '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=',
                    '&=', '|=', '^=', ',',
                    // binary/unary operators
                    '+', '-', '*', '/', '%', '++', '--', '<<', '>>', '>>>', '&',
                    '|', '^', '!', '~', '&&', '||', '?', ':', '===', '==', '>=',
                    '<=', '<', '>', '!=', '!=='];

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement'
    };

    PropertyKind = {
        Data: 1,
        Get: 2,
        Set: 4
    };

    // Error messages should be identical to V8.
    Messages = {
        UnexpectedToken:  'Unexpected token %0',
        UnexpectedNumber:  'Unexpected number',
        UnexpectedString:  'Unexpected string',
        UnexpectedIdentifier:  'Unexpected identifier',
        UnexpectedReserved:  'Unexpected reserved word',
        UnexpectedEOS:  'Unexpected end of input',
        NewlineAfterThrow:  'Illegal newline after throw',
        InvalidRegExp: 'Invalid regular expression',
        UnterminatedRegExp:  'Invalid regular expression: missing /',
        InvalidLHSInAssignment:  'Invalid left-hand side in assignment',
        InvalidLHSInForIn:  'Invalid left-hand side in for-in',
        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
        NoCatchOrFinally:  'Missing catch or finally after try',
        UnknownLabel: 'Undefined label \'%0\'',
        Redeclaration: '%0 \'%1\' has already been declared',
        IllegalContinue: 'Illegal continue statement',
        IllegalBreak: 'Illegal break statement',
        IllegalReturn: 'Illegal return statement',
        StrictModeWith:  'Strict mode code may not include a with statement',
        StrictCatchVariable:  'Catch variable may not be eval or arguments in strict mode',
        StrictVarName:  'Variable name may not be eval or arguments in strict mode',
        StrictParamName:  'Parameter name eval or arguments is not allowed in strict mode',
        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
        StrictFunctionName:  'Function name may not be eval or arguments in strict mode',
        StrictOctalLiteral:  'Octal literals are not allowed in strict mode.',
        StrictDelete:  'Delete of an unqualified identifier in strict mode.',
        StrictDuplicateProperty:  'Duplicate data property in object literal not allowed in strict mode',
        AccessorDataProperty:  'Object literal may not have data and accessor property with the same name',
        AccessorGetSet:  'Object literal may not have multiple get/set accessors with the same name',
        StrictLHSAssignment:  'Assignment to eval or arguments is not allowed in strict mode',
        StrictLHSPostfix:  'Postfix increment/decrement may not have eval or arguments operand in strict mode',
        StrictLHSPrefix:  'Prefix increment/decrement may not have eval or arguments operand in strict mode',
        StrictReservedWord:  'Use of future reserved word in strict mode'
    };

    // See also tools/generate-unicode-regex.py.
    Regex = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };

    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.

    function assert(condition, message) {
        if (!condition) {
            throw new Error('ASSERT: ' + message);
        }
    }

    function isDecimalDigit(ch) {
        return (ch >= 48 && ch <= 57);   // 0..9
    }

    function isHexDigit(ch) {
        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
    }

    function isOctalDigit(ch) {
        return '01234567'.indexOf(ch) >= 0;
    }


    // 7.2 White Space

    function isWhiteSpace(ch) {
        return (ch === 32) ||  // space
            (ch === 9) ||      // tab
            (ch === 0xB) ||
            (ch === 0xC) ||
            (ch === 0xA0) ||
            (ch >= 0x1680 && '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF'.indexOf(String.fromCharCode(ch)) > 0);
    }

    // 7.3 Line Terminators

    function isLineTerminator(ch) {
        return (ch === 10) || (ch === 13) || (ch === 0x2028) || (ch === 0x2029);
    }

    // 7.6 Identifier Names and Identifiers

    function isIdentifierStart(ch) {
        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
            (ch >= 65 && ch <= 90) ||         // A..Z
            (ch >= 97 && ch <= 122) ||        // a..z
            (ch === 92) ||                    // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(String.fromCharCode(ch)));
    }

    function isIdentifierPart(ch) {
        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
            (ch >= 65 && ch <= 90) ||         // A..Z
            (ch >= 97 && ch <= 122) ||        // a..z
            (ch >= 48 && ch <= 57) ||         // 0..9
            (ch === 92) ||                    // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(String.fromCharCode(ch)));
    }

    // 7.6.1.2 Future Reserved Words

    function isFutureReservedWord(id) {
        switch (id) {
        case 'class':
        case 'enum':
        case 'export':
        case 'extends':
        case 'import':
        case 'super':
            return true;
        default:
            return false;
        }
    }

    function isStrictModeReservedWord(id) {
        switch (id) {
        case 'implements':
        case 'interface':
        case 'package':
        case 'private':
        case 'protected':
        case 'public':
        case 'static':
        case 'yield':
        case 'let':
            return true;
        default:
            return false;
        }
    }

    function isRestrictedWord(id) {
        return id === 'eval' || id === 'arguments';
    }

    // 7.6.1.1 Keywords

    function isKeyword(id) {
        if (strict && isStrictModeReservedWord(id)) {
            return true;
        }

        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.

        switch (id.length) {
        case 2:
            return (id === 'if') || (id === 'in') || (id === 'do');
        case 3:
            return (id === 'var') || (id === 'for') || (id === 'new') ||
                (id === 'try') || (id === 'let');
        case 4:
            return (id === 'this') || (id === 'else') || (id === 'case') ||
                (id === 'void') || (id === 'with') || (id === 'enum');
        case 5:
            return (id === 'while') || (id === 'break') || (id === 'catch') ||
                (id === 'throw') || (id === 'const') || (id === 'yield') ||
                (id === 'class') || (id === 'super');
        case 6:
            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
                (id === 'switch') || (id === 'export') || (id === 'import');
        case 7:
            return (id === 'default') || (id === 'finally') || (id === 'extends');
        case 8:
            return (id === 'function') || (id === 'continue') || (id === 'debugger');
        case 10:
            return (id === 'instanceof');
        default:
            return false;
        }
    }

    // 7.4 Comments

    function addComment(type, value, start, end, loc) {
        var comment;

        assert(typeof start === 'number', 'Comment must have valid position');

        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (state.lastCommentStart >= start) {
            return;
        }
        state.lastCommentStart = start;

        comment = {
            type: type,
            value: value
        };
        if (extra.range) {
            comment.range = [start, end];
        }
        if (extra.loc) {
            comment.loc = loc;
        }
        extra.comments.push(comment);
    }

    function skipSingleLineComment() {
        var start, loc, ch, comment;

        start = index - 2;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart - 2
            }
        };

        while (index < length) {
            ch = source.charCodeAt(index);
            ++index;
            if (isLineTerminator(ch)) {
                if (extra.comments) {
                    comment = source.slice(start + 2, index - 1);
                    loc.end = {
                        line: lineNumber,
                        column: index - lineStart - 1
                    };
                    addComment('Line', comment, start, index - 1, loc);
                }
                if (ch === 13 && source.charCodeAt(index) === 10) {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
                return;
            }
        }

        if (extra.comments) {
            comment = source.slice(start + 2, index);
            loc.end = {
                line: lineNumber,
                column: index - lineStart
            };
            addComment('Line', comment, start, index, loc);
        }
    }

    function skipMultiLineComment() {
        var start, loc, ch, comment;

        if (extra.comments) {
            start = index - 2;
            loc = {
                start: {
                    line: lineNumber,
                    column: index - lineStart - 2
                }
            };
        }

        while (index < length) {
            ch = source.charCodeAt(index);
            if (isLineTerminator(ch)) {
                if (ch === 13 && source.charCodeAt(index + 1) === 10) {
                    ++index;
                }
                ++lineNumber;
                ++index;
                lineStart = index;
                if (index >= length) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
            } else if (ch === 42) {
                // Block comment ends with '*/' (char #42, char #47).
                if (source.charCodeAt(index + 1) === 47) {
                    ++index;
                    ++index;
                    if (extra.comments) {
                        comment = source.slice(start + 2, index - 2);
                        loc.end = {
                            line: lineNumber,
                            column: index - lineStart
                        };
                        addComment('Block', comment, start, index, loc);
                    }
                    return;
                }
                ++index;
            } else {
                ++index;
            }
        }

        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }

    function skipComment() {
        var ch;

        while (index < length) {
            ch = source.charCodeAt(index);

            if (isWhiteSpace(ch)) {
                ++index;
            } else if (isLineTerminator(ch)) {
                ++index;
                if (ch === 13 && source.charCodeAt(index) === 10) {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
            } else if (ch === 47) { // 47 is '/'
                ch = source.charCodeAt(index + 1);
                if (ch === 47) {
                    ++index;
                    ++index;
                    skipSingleLineComment();
                } else if (ch === 42) {  // 42 is '*'
                    ++index;
                    ++index;
                    skipMultiLineComment();
                } else {
                    break;
                }
            } else {
                break;
            }
        }
    }

    function scanHexEscape(prefix) {
        var i, len, ch, code = 0;

        len = (prefix === 'u') ? 4 : 2;
        for (i = 0; i < len; ++i) {
            if (index < length && isHexDigit(source[index])) {
                ch = source[index++];
                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code);
    }

    function getEscapedIdentifier() {
        var ch, id;

        ch = source.charCodeAt(index++);
        id = String.fromCharCode(ch);

        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch === 92) {
            if (source.charCodeAt(index) !== 117) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
            ++index;
            ch = scanHexEscape('u');
            if (!ch || ch === '\\' || !isIdentifierStart(ch.charCodeAt(0))) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
            id = ch;
        }

        while (index < length) {
            ch = source.charCodeAt(index);
            if (!isIdentifierPart(ch)) {
                break;
            }
            ++index;
            id += String.fromCharCode(ch);

            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch === 92) {
                id = id.substr(0, id.length - 1);
                if (source.charCodeAt(index) !== 117) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
                ++index;
                ch = scanHexEscape('u');
                if (!ch || ch === '\\' || !isIdentifierPart(ch.charCodeAt(0))) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
                id += ch;
            }
        }

        return id;
    }

    function getIdentifier() {
        var start, ch;

        start = index++;
        while (index < length) {
            ch = source.charCodeAt(index);
            if (ch === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index = start;
                return getEscapedIdentifier();
            }
            if (isIdentifierPart(ch)) {
                ++index;
            } else {
                break;
            }
        }

        return source.slice(start, index);
    }

    function scanIdentifier() {
        var start, id, type;

        start = index;

        // Backslash (char #92) starts an escaped character.
        id = (source.charCodeAt(index) === 92) ? getEscapedIdentifier() : getIdentifier();

        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id.length === 1) {
            type = Token.Identifier;
        } else if (isKeyword(id)) {
            type = Token.Keyword;
        } else if (id === 'null') {
            type = Token.NullLiteral;
        } else if (id === 'true' || id === 'false') {
            type = Token.BooleanLiteral;
        } else {
            type = Token.Identifier;
        }

        return {
            type: type,
            value: id,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }


    // 7.7 Punctuators

    function scanPunctuator() {
        var start = index,
            code = source.charCodeAt(index),
            code2,
            ch1 = source[index],
            ch2,
            ch3,
            ch4;

        switch (code) {

        // Check for most common single-character punctuators.
        case 46:   // . dot
        case 40:   // ( open bracket
        case 41:   // ) close bracket
        case 59:   // ; semicolon
        case 44:   // , comma
        case 123:  // { open curly brace
        case 125:  // } close curly brace
        case 91:   // [
        case 93:   // ]
        case 58:   // :
        case 63:   // ?
        case 126:  // ~
            ++index;
            if (extra.tokenize) {
                if (code === 40) {
                    extra.openParenToken = extra.tokens.length;
                } else if (code === 123) {
                    extra.openCurlyToken = extra.tokens.length;
                }
            }
            return {
                type: Token.Punctuator,
                value: String.fromCharCode(code),
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };

        default:
            code2 = source.charCodeAt(index + 1);

            // '=' (char #61) marks an assignment or comparison operator.
            if (code2 === 61) {
                switch (code) {
                case 37:  // %
                case 38:  // &
                case 42:  // *:
                case 43:  // +
                case 45:  // -
                case 47:  // /
                case 60:  // <
                case 62:  // >
                case 94:  // ^
                case 124: // |
                    index += 2;
                    return {
                        type: Token.Punctuator,
                        value: String.fromCharCode(code) + String.fromCharCode(code2),
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        range: [start, index]
                    };

                case 33: // !
                case 61: // =
                    index += 2;

                    // !== and ===
                    if (source.charCodeAt(index) === 61) {
                        ++index;
                    }
                    return {
                        type: Token.Punctuator,
                        value: source.slice(start, index),
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        range: [start, index]
                    };
                default:
                    break;
                }
            }
            break;
        }

        // Peek more characters.

        ch2 = source[index + 1];
        ch3 = source[index + 2];
        ch4 = source[index + 3];

        // 4-character punctuator: >>>=

        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
            if (ch4 === '=') {
                index += 4;
                return {
                    type: Token.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }
        }

        // 3-character punctuators: === !== >>> <<= >>=

        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '>>>',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === '<' && ch2 === '<' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '<<=',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === '>' && ch2 === '>' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '>>=',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // Other 2-character punctuators: ++ -- << >> && ||

        if (ch1 === ch2 && ('+-<>&|'.indexOf(ch1) >= 0)) {
            index += 2;
            return {
                type: Token.Punctuator,
                value: ch1 + ch2,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
            ++index;
            return {
                type: Token.Punctuator,
                value: ch1,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }

    // 7.8.3 Numeric Literals

    function scanHexLiteral(start) {
        var number = '';

        while (index < length) {
            if (!isHexDigit(source[index])) {
                break;
            }
            number += source[index++];
        }

        if (number.length === 0) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        if (isIdentifierStart(source.charCodeAt(index))) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        return {
            type: Token.NumericLiteral,
            value: parseInt('0x' + number, 16),
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    function scanOctalLiteral(start) {
        var number = '0' + source[index++];
        while (index < length) {
            if (!isOctalDigit(source[index])) {
                break;
            }
            number += source[index++];
        }

        if (isIdentifierStart(source.charCodeAt(index)) || isDecimalDigit(source.charCodeAt(index))) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        return {
            type: Token.NumericLiteral,
            value: parseInt(number, 8),
            octal: true,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    function scanNumericLiteral() {
        var number, start, ch;

        ch = source[index];
        assert(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'),
            'Numeric literal must start with a decimal digit or a decimal point');

        start = index;
        number = '';
        if (ch !== '.') {
            number = source[index++];
            ch = source[index];

            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            if (number === '0') {
                if (ch === 'x' || ch === 'X') {
                    ++index;
                    return scanHexLiteral(start);
                }
                if (isOctalDigit(ch)) {
                    return scanOctalLiteral(start);
                }

                // decimal number starts with '0' such as '09' is illegal.
                if (ch && isDecimalDigit(ch.charCodeAt(0))) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
            }

            while (isDecimalDigit(source.charCodeAt(index))) {
                number += source[index++];
            }
            ch = source[index];
        }

        if (ch === '.') {
            number += source[index++];
            while (isDecimalDigit(source.charCodeAt(index))) {
                number += source[index++];
            }
            ch = source[index];
        }

        if (ch === 'e' || ch === 'E') {
            number += source[index++];

            ch = source[index];
            if (ch === '+' || ch === '-') {
                number += source[index++];
            }
            if (isDecimalDigit(source.charCodeAt(index))) {
                while (isDecimalDigit(source.charCodeAt(index))) {
                    number += source[index++];
                }
            } else {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
        }

        if (isIdentifierStart(source.charCodeAt(index))) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        return {
            type: Token.NumericLiteral,
            value: parseFloat(number),
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    // 7.8.4 String Literals

    function scanStringLiteral() {
        var str = '', quote, start, ch, code, unescaped, restore, octal = false;

        quote = source[index];
        assert((quote === '\'' || quote === '"'),
            'String literal must starts with a quote');

        start = index;
        ++index;

        while (index < length) {
            ch = source[index++];

            if (ch === quote) {
                quote = '';
                break;
            } else if (ch === '\\') {
                ch = source[index++];
                if (!ch || !isLineTerminator(ch.charCodeAt(0))) {
                    switch (ch) {
                    case 'n':
                        str += '\n';
                        break;
                    case 'r':
                        str += '\r';
                        break;
                    case 't':
                        str += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore = index;
                        unescaped = scanHexEscape(ch);
                        if (unescaped) {
                            str += unescaped;
                        } else {
                            index = restore;
                            str += ch;
                        }
                        break;
                    case 'b':
                        str += '\b';
                        break;
                    case 'f':
                        str += '\f';
                        break;
                    case 'v':
                        str += '\x0B';
                        break;

                    default:
                        if (isOctalDigit(ch)) {
                            code = '01234567'.indexOf(ch);

                            // \0 is not octal escape sequence
                            if (code !== 0) {
                                octal = true;
                            }

                            if (index < length && isOctalDigit(source[index])) {
                                octal = true;
                                code = code * 8 + '01234567'.indexOf(source[index++]);

                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch) >= 0 &&
                                        index < length &&
                                        isOctalDigit(source[index])) {
                                    code = code * 8 + '01234567'.indexOf(source[index++]);
                                }
                            }
                            str += String.fromCharCode(code);
                        } else {
                            str += ch;
                        }
                        break;
                    }
                } else {
                    ++lineNumber;
                    if (ch ===  '\r' && source[index] === '\n') {
                        ++index;
                    }
                }
            } else if (isLineTerminator(ch.charCodeAt(0))) {
                break;
            } else {
                str += ch;
            }
        }

        if (quote !== '') {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        return {
            type: Token.StringLiteral,
            value: str,
            octal: octal,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    function scanRegExp() {
        var str, ch, start, pattern, flags, value, classMarker = false, restore, terminated = false;

        lookahead = null;
        skipComment();

        start = index;
        ch = source[index];
        assert(ch === '/', 'Regular expression literal must start with a slash');
        str = source[index++];

        while (index < length) {
            ch = source[index++];
            str += ch;
            if (classMarker) {
                if (ch === ']') {
                    classMarker = false;
                }
            } else {
                if (ch === '\\') {
                    ch = source[index++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator(ch.charCodeAt(0))) {
                        throwError({}, Messages.UnterminatedRegExp);
                    }
                    str += ch;
                } else if (ch === '/') {
                    terminated = true;
                    break;
                } else if (ch === '[') {
                    classMarker = true;
                } else if (isLineTerminator(ch.charCodeAt(0))) {
                    throwError({}, Messages.UnterminatedRegExp);
                }
            }
        }

        if (!terminated) {
            throwError({}, Messages.UnterminatedRegExp);
        }

        // Exclude leading and trailing slash.
        pattern = str.substr(1, str.length - 2);

        flags = '';
        while (index < length) {
            ch = source[index];
            if (!isIdentifierPart(ch.charCodeAt(0))) {
                break;
            }

            ++index;
            if (ch === '\\' && index < length) {
                ch = source[index];
                if (ch === 'u') {
                    ++index;
                    restore = index;
                    ch = scanHexEscape('u');
                    if (ch) {
                        flags += ch;
                        for (str += '\\u'; restore < index; ++restore) {
                            str += source[restore];
                        }
                    } else {
                        index = restore;
                        flags += 'u';
                        str += '\\u';
                    }
                } else {
                    str += '\\';
                }
            } else {
                flags += ch;
                str += ch;
            }
        }

        try {
            value = new RegExp(pattern, flags);
        } catch (e) {
            throwError({}, Messages.InvalidRegExp);
        }

        peek();


        if (extra.tokenize) {
            return {
                type: Token.RegularExpression,
                value: value,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }
        return {
            literal: str,
            value: value,
            range: [start, index]
        };
    }

    function collectRegex() {
        var pos, loc, regex, token;

        skipComment();

        pos = index;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        regex = scanRegExp();
        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };

        if (!extra.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra.tokens.length > 0) {
                token = extra.tokens[extra.tokens.length - 1];
                if (token.range[0] === pos && token.type === 'Punctuator') {
                    if (token.value === '/' || token.value === '/=') {
                        extra.tokens.pop();
                    }
                }
            }

            extra.tokens.push({
                type: 'RegularExpression',
                value: regex.literal,
                range: [pos, index],
                loc: loc
            });
        }

        return regex;
    }

    function isIdentifierName(token) {
        return token.type === Token.Identifier ||
            token.type === Token.Keyword ||
            token.type === Token.BooleanLiteral ||
            token.type === Token.NullLiteral;
    }

    function advanceSlash() {
        var prevToken,
            checkToken;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken = extra.tokens[extra.tokens.length - 1];
        if (!prevToken) {
            // Nothing before that: it cannot be a division.
            return collectRegex();
        }
        if (prevToken.type === 'Punctuator') {
            if (prevToken.value === ')') {
                checkToken = extra.tokens[extra.openParenToken - 1];
                if (checkToken &&
                        checkToken.type === 'Keyword' &&
                        (checkToken.value === 'if' ||
                         checkToken.value === 'while' ||
                         checkToken.value === 'for' ||
                         checkToken.value === 'with')) {
                    return collectRegex();
                }
                return scanPunctuator();
            }
            if (prevToken.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra.tokens[extra.openCurlyToken - 3] &&
                        extra.tokens[extra.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken = extra.tokens[extra.openCurlyToken - 4];
                    if (!checkToken) {
                        return scanPunctuator();
                    }
                } else if (extra.tokens[extra.openCurlyToken - 4] &&
                        extra.tokens[extra.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken = extra.tokens[extra.openCurlyToken - 5];
                    if (!checkToken) {
                        return collectRegex();
                    }
                } else {
                    return scanPunctuator();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens.indexOf(checkToken.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator();
                }
                // It is a declaration.
                return collectRegex();
            }
            return collectRegex();
        }
        if (prevToken.type === 'Keyword') {
            return collectRegex();
        }
        return scanPunctuator();
    }

    function advance() {
        var ch;

        skipComment();

        if (index >= length) {
            return {
                type: Token.EOF,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [index, index]
            };
        }

        ch = source.charCodeAt(index);

        // Very common: ( and ) and ;
        if (ch === 40 || ch === 41 || ch === 58) {
            return scanPunctuator();
        }

        // String literal starts with single quote (#39) or double quote (#34).
        if (ch === 39 || ch === 34) {
            return scanStringLiteral();
        }

        if (isIdentifierStart(ch)) {
            return scanIdentifier();
        }

        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch === 46) {
            if (isDecimalDigit(source.charCodeAt(index + 1))) {
                return scanNumericLiteral();
            }
            return scanPunctuator();
        }

        if (isDecimalDigit(ch)) {
            return scanNumericLiteral();
        }

        // Slash (/) char #47 can also start a regex.
        if (extra.tokenize && ch === 47) {
            return advanceSlash();
        }

        return scanPunctuator();
    }

    function collectToken() {
        var start, loc, token, range, value;

        skipComment();
        start = index;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        token = advance();
        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };

        if (token.type !== Token.EOF) {
            range = [token.range[0], token.range[1]];
            value = source.slice(token.range[0], token.range[1]);
            extra.tokens.push({
                type: TokenName[token.type],
                value: value,
                range: range,
                loc: loc
            });
        }

        return token;
    }

    function lex() {
        var token;

        token = lookahead;
        index = token.range[1];
        lineNumber = token.lineNumber;
        lineStart = token.lineStart;

        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();

        index = token.range[1];
        lineNumber = token.lineNumber;
        lineStart = token.lineStart;

        return token;
    }

    function peek() {
        var pos, line, start;

        pos = index;
        line = lineNumber;
        start = lineStart;
        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();
        index = pos;
        lineNumber = line;
        lineStart = start;
    }

    SyntaxTreeDelegate = {

        name: 'SyntaxTree',

        markStart: function () {
            if (extra.loc) {
                state.markerStack.push(index - lineStart);
                state.markerStack.push(lineNumber);
            }
            if (extra.range) {
                state.markerStack.push(index);
            }
        },

        markEnd: function (node) {
            if (extra.range) {
                node.range = [state.markerStack.pop(), index];
            }
            if (extra.loc) {
                node.loc = {
                    start: {
                        line: state.markerStack.pop(),
                        column: state.markerStack.pop()
                    },
                    end: {
                        line: lineNumber,
                        column: index - lineStart
                    }
                };
                this.postProcess(node);
            }
            return node;
        },

        markEndIf: function (node) {
            if (node.range || node.loc) {
                if (extra.loc) {
                    state.markerStack.pop();
                    state.markerStack.pop();
                }
                if (extra.range) {
                    state.markerStack.pop();
                }
            } else {
                this.markEnd(node);
            }
            return node;
        },

        postProcess: function (node) {
            if (extra.source) {
                node.loc.source = extra.source;
            }
            return node;
        },

        createArrayExpression: function (elements) {
            return {
                type: Syntax.ArrayExpression,
                elements: elements
            };
        },

        createAssignmentExpression: function (operator, left, right) {
            return {
                type: Syntax.AssignmentExpression,
                operator: operator,
                left: left,
                right: right
            };
        },

        createBinaryExpression: function (operator, left, right) {
            var type = (operator === '||' || operator === '&&') ? Syntax.LogicalExpression :
                        Syntax.BinaryExpression;
            return {
                type: type,
                operator: operator,
                left: left,
                right: right
            };
        },

        createBlockStatement: function (body) {
            return {
                type: Syntax.BlockStatement,
                body: body
            };
        },

        createBreakStatement: function (label) {
            return {
                type: Syntax.BreakStatement,
                label: label
            };
        },

        createCallExpression: function (callee, args) {
            return {
                type: Syntax.CallExpression,
                callee: callee,
                'arguments': args
            };
        },

        createCatchClause: function (param, body) {
            return {
                type: Syntax.CatchClause,
                param: param,
                body: body
            };
        },

        createConditionalExpression: function (test, consequent, alternate) {
            return {
                type: Syntax.ConditionalExpression,
                test: test,
                consequent: consequent,
                alternate: alternate
            };
        },

        createContinueStatement: function (label) {
            return {
                type: Syntax.ContinueStatement,
                label: label
            };
        },

        createDebuggerStatement: function () {
            return {
                type: Syntax.DebuggerStatement
            };
        },

        createDoWhileStatement: function (body, test) {
            return {
                type: Syntax.DoWhileStatement,
                body: body,
                test: test
            };
        },

        createEmptyStatement: function () {
            return {
                type: Syntax.EmptyStatement
            };
        },

        createExpressionStatement: function (expression) {
            return {
                type: Syntax.ExpressionStatement,
                expression: expression
            };
        },

        createForStatement: function (init, test, update, body) {
            return {
                type: Syntax.ForStatement,
                init: init,
                test: test,
                update: update,
                body: body
            };
        },

        createForInStatement: function (left, right, body) {
            return {
                type: Syntax.ForInStatement,
                left: left,
                right: right,
                body: body,
                each: false
            };
        },

        createFunctionDeclaration: function (id, params, defaults, body) {
            return {
                type: Syntax.FunctionDeclaration,
                id: id,
                params: params,
                defaults: defaults,
                body: body,
                rest: null,
                generator: false,
                expression: false
            };
        },

        createFunctionExpression: function (id, params, defaults, body) {
            return {
                type: Syntax.FunctionExpression,
                id: id,
                params: params,
                defaults: defaults,
                body: body,
                rest: null,
                generator: false,
                expression: false
            };
        },

        createIdentifier: function (name) {
            return {
                type: Syntax.Identifier,
                name: name
            };
        },

        createIfStatement: function (test, consequent, alternate) {
            return {
                type: Syntax.IfStatement,
                test: test,
                consequent: consequent,
                alternate: alternate
            };
        },

        createLabeledStatement: function (label, body) {
            return {
                type: Syntax.LabeledStatement,
                label: label,
                body: body
            };
        },

        createLiteral: function (token) {
            return {
                type: Syntax.Literal,
                value: token.value,
                raw: source.slice(token.range[0], token.range[1])
            };
        },

        createMemberExpression: function (accessor, object, property) {
            return {
                type: Syntax.MemberExpression,
                computed: accessor === '[',
                object: object,
                property: property
            };
        },

        createNewExpression: function (callee, args) {
            return {
                type: Syntax.NewExpression,
                callee: callee,
                'arguments': args
            };
        },

        createObjectExpression: function (properties) {
            return {
                type: Syntax.ObjectExpression,
                properties: properties
            };
        },

        createPostfixExpression: function (operator, argument) {
            return {
                type: Syntax.UpdateExpression,
                operator: operator,
                argument: argument,
                prefix: false
            };
        },

        createProgram: function (body) {
            return {
                type: Syntax.Program,
                body: body
            };
        },

        createProperty: function (kind, key, value) {
            return {
                type: Syntax.Property,
                key: key,
                value: value,
                kind: kind
            };
        },

        createReturnStatement: function (argument) {
            return {
                type: Syntax.ReturnStatement,
                argument: argument
            };
        },

        createSequenceExpression: function (expressions) {
            return {
                type: Syntax.SequenceExpression,
                expressions: expressions
            };
        },

        createSwitchCase: function (test, consequent) {
            return {
                type: Syntax.SwitchCase,
                test: test,
                consequent: consequent
            };
        },

        createSwitchStatement: function (discriminant, cases) {
            return {
                type: Syntax.SwitchStatement,
                discriminant: discriminant,
                cases: cases
            };
        },

        createThisExpression: function () {
            return {
                type: Syntax.ThisExpression
            };
        },

        createThrowStatement: function (argument) {
            return {
                type: Syntax.ThrowStatement,
                argument: argument
            };
        },

        createTryStatement: function (block, guardedHandlers, handlers, finalizer) {
            return {
                type: Syntax.TryStatement,
                block: block,
                guardedHandlers: guardedHandlers,
                handlers: handlers,
                finalizer: finalizer
            };
        },

        createUnaryExpression: function (operator, argument) {
            if (operator === '++' || operator === '--') {
                return {
                    type: Syntax.UpdateExpression,
                    operator: operator,
                    argument: argument,
                    prefix: true
                };
            }
            return {
                type: Syntax.UnaryExpression,
                operator: operator,
                argument: argument,
                prefix: true
            };
        },

        createVariableDeclaration: function (declarations, kind) {
            return {
                type: Syntax.VariableDeclaration,
                declarations: declarations,
                kind: kind
            };
        },

        createVariableDeclarator: function (id, init) {
            return {
                type: Syntax.VariableDeclarator,
                id: id,
                init: init
            };
        },

        createWhileStatement: function (test, body) {
            return {
                type: Syntax.WhileStatement,
                test: test,
                body: body
            };
        },

        createWithStatement: function (object, body) {
            return {
                type: Syntax.WithStatement,
                object: object,
                body: body
            };
        }
    };

    // Return true if there is a line terminator before the next token.

    function peekLineTerminator() {
        var pos, line, start, found;

        pos = index;
        line = lineNumber;
        start = lineStart;
        skipComment();
        found = lineNumber !== line;
        index = pos;
        lineNumber = line;
        lineStart = start;

        return found;
    }

    // Throw an exception

    function throwError(token, messageFormat) {
        var error,
            args = Array.prototype.slice.call(arguments, 2),
            msg = messageFormat.replace(
                /%(\d)/g,
                function (whole, index) {
                    assert(index < args.length, 'Message reference must be in range');
                    return args[index];
                }
            );

        if (typeof token.lineNumber === 'number') {
            error = new Error('Line ' + token.lineNumber + ': ' + msg);
            error.index = token.range[0];
            error.lineNumber = token.lineNumber;
            error.column = token.range[0] - lineStart + 1;
        } else {
            error = new Error('Line ' + lineNumber + ': ' + msg);
            error.index = index;
            error.lineNumber = lineNumber;
            error.column = index - lineStart + 1;
        }

        error.description = msg;
        throw error;
    }

    function throwErrorTolerant() {
        try {
            throwError.apply(null, arguments);
        } catch (e) {
            if (extra.errors) {
                extra.errors.push(e);
            } else {
                throw e;
            }
        }
    }


    // Throw an exception because of the token.

    function throwUnexpected(token) {
        if (token.type === Token.EOF) {
            throwError(token, Messages.UnexpectedEOS);
        }

        if (token.type === Token.NumericLiteral) {
            throwError(token, Messages.UnexpectedNumber);
        }

        if (token.type === Token.StringLiteral) {
            throwError(token, Messages.UnexpectedString);
        }

        if (token.type === Token.Identifier) {
            throwError(token, Messages.UnexpectedIdentifier);
        }

        if (token.type === Token.Keyword) {
            if (isFutureReservedWord(token.value)) {
                throwError(token, Messages.UnexpectedReserved);
            } else if (strict && isStrictModeReservedWord(token.value)) {
                throwErrorTolerant(token, Messages.StrictReservedWord);
                return;
            }
            throwError(token, Messages.UnexpectedToken, token.value);
        }

        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError(token, Messages.UnexpectedToken, token.value);
    }

    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.

    function expect(value) {
        var token = lex();
        if (token.type !== Token.Punctuator || token.value !== value) {
            throwUnexpected(token);
        }
    }

    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.

    function expectKeyword(keyword) {
        var token = lex();
        if (token.type !== Token.Keyword || token.value !== keyword) {
            throwUnexpected(token);
        }
    }

    // Return true if the next token matches the specified punctuator.

    function match(value) {
        return lookahead.type === Token.Punctuator && lookahead.value === value;
    }

    // Return true if the next token matches the specified keyword

    function matchKeyword(keyword) {
        return lookahead.type === Token.Keyword && lookahead.value === keyword;
    }

    // Return true if the next token is an assignment operator

    function matchAssign() {
        var op;

        if (lookahead.type !== Token.Punctuator) {
            return false;
        }
        op = lookahead.value;
        return op === '=' ||
            op === '*=' ||
            op === '/=' ||
            op === '%=' ||
            op === '+=' ||
            op === '-=' ||
            op === '<<=' ||
            op === '>>=' ||
            op === '>>>=' ||
            op === '&=' ||
            op === '^=' ||
            op === '|=';
    }

    function consumeSemicolon() {
        var line;

        // Catch the very common case first: immediately a semicolon (char #59).
        if (source.charCodeAt(index) === 59) {
            lex();
            return;
        }

        line = lineNumber;
        skipComment();
        if (lineNumber !== line) {
            return;
        }

        if (match(';')) {
            lex();
            return;
        }

        if (lookahead.type !== Token.EOF && !match('}')) {
            throwUnexpected(lookahead);
        }
    }

    // Return true if provided expression is LeftHandSideExpression

    function isLeftHandSide(expr) {
        return expr.type === Syntax.Identifier || expr.type === Syntax.MemberExpression;
    }

    // 11.1.4 Array Initialiser

    function parseArrayInitialiser() {
        var elements = [];

        expect('[');

        while (!match(']')) {
            if (match(',')) {
                lex();
                elements.push(null);
            } else {
                elements.push(parseAssignmentExpression());

                if (!match(']')) {
                    expect(',');
                }
            }
        }

        expect(']');

        return delegate.createArrayExpression(elements);
    }

    // 11.1.5 Object Initialiser

    function parsePropertyFunction(param, first) {
        var previousStrict, body;

        previousStrict = strict;
        skipComment();
        delegate.markStart();
        body = parseFunctionSourceElements();
        if (first && strict && isRestrictedWord(param[0].name)) {
            throwErrorTolerant(first, Messages.StrictParamName);
        }
        strict = previousStrict;
        return delegate.markEnd(delegate.createFunctionExpression(null, param, [], body));
    }

    function parseObjectPropertyKey() {
        var token;

        skipComment();
        delegate.markStart();
        token = lex();

        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.

        if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {
            if (strict && token.octal) {
                throwErrorTolerant(token, Messages.StrictOctalLiteral);
            }
            return delegate.markEnd(delegate.createLiteral(token));
        }

        return delegate.markEnd(delegate.createIdentifier(token.value));
    }

    function parseObjectProperty() {
        var token, key, id, value, param;

        token = lookahead;
        skipComment();
        delegate.markStart();

        if (token.type === Token.Identifier) {

            id = parseObjectPropertyKey();

            // Property Assignment: Getter and Setter.

            if (token.value === 'get' && !match(':')) {
                key = parseObjectPropertyKey();
                expect('(');
                expect(')');
                value = parsePropertyFunction([]);
                return delegate.markEnd(delegate.createProperty('get', key, value));
            }
            if (token.value === 'set' && !match(':')) {
                key = parseObjectPropertyKey();
                expect('(');
                token = lookahead;
                if (token.type !== Token.Identifier) {
                    expect(')');
                    throwErrorTolerant(token, Messages.UnexpectedToken, token.value);
                    value = parsePropertyFunction([]);
                } else {
                    param = [ parseVariableIdentifier() ];
                    expect(')');
                    value = parsePropertyFunction(param, token);
                }
                return delegate.markEnd(delegate.createProperty('set', key, value));
            }
            expect(':');
            value = parseAssignmentExpression();
            return delegate.markEnd(delegate.createProperty('init', id, value));
        }
        if (token.type === Token.EOF || token.type === Token.Punctuator) {
            throwUnexpected(token);
        } else {
            key = parseObjectPropertyKey();
            expect(':');
            value = parseAssignmentExpression();
            return delegate.markEnd(delegate.createProperty('init', key, value));
        }
    }

    function parseObjectInitialiser() {
        var properties = [], property, name, key, kind, map = {}, toString = String;

        expect('{');

        while (!match('}')) {
            property = parseObjectProperty();

            if (property.key.type === Syntax.Identifier) {
                name = property.key.name;
            } else {
                name = toString(property.key.value);
            }
            kind = (property.kind === 'init') ? PropertyKind.Data : (property.kind === 'get') ? PropertyKind.Get : PropertyKind.Set;

            key = '$' + name;
            if (Object.prototype.hasOwnProperty.call(map, key)) {
                if (map[key] === PropertyKind.Data) {
                    if (strict && kind === PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.StrictDuplicateProperty);
                    } else if (kind !== PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.AccessorDataProperty);
                    }
                } else {
                    if (kind === PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.AccessorDataProperty);
                    } else if (map[key] & kind) {
                        throwErrorTolerant({}, Messages.AccessorGetSet);
                    }
                }
                map[key] |= kind;
            } else {
                map[key] = kind;
            }

            properties.push(property);

            if (!match('}')) {
                expect(',');
            }
        }

        expect('}');

        return delegate.createObjectExpression(properties);
    }

    // 11.1.6 The Grouping Operator

    function parseGroupExpression() {
        var expr;

        expect('(');

        expr = parseExpression();

        expect(')');

        return expr;
    }


    // 11.1 Primary Expressions

    function parsePrimaryExpression() {
        var type, token, expr;

        if (match('(')) {
            return parseGroupExpression();
        }

        type = lookahead.type;
        delegate.markStart();

        if (type === Token.Identifier) {
            expr =  delegate.createIdentifier(lex().value);
        } else if (type === Token.StringLiteral || type === Token.NumericLiteral) {
            if (strict && lookahead.octal) {
                throwErrorTolerant(lookahead, Messages.StrictOctalLiteral);
            }
            expr = delegate.createLiteral(lex());
        } else if (type === Token.Keyword) {
            if (matchKeyword('this')) {
                lex();
                expr = delegate.createThisExpression();
            } else if (matchKeyword('function')) {
                expr = parseFunctionExpression();
            }
        } else if (type === Token.BooleanLiteral) {
            token = lex();
            token.value = (token.value === 'true');
            expr = delegate.createLiteral(token);
        } else if (type === Token.NullLiteral) {
            token = lex();
            token.value = null;
            expr = delegate.createLiteral(token);
        } else if (match('[')) {
            expr = parseArrayInitialiser();
        } else if (match('{')) {
            expr = parseObjectInitialiser();
        } else if (match('/') || match('/=')) {
            if (typeof extra.tokens !== 'undefined') {
                expr = delegate.createLiteral(collectRegex());
            } else {
                expr = delegate.createLiteral(scanRegExp());
            }
        }

        if (expr) {
            return delegate.markEnd(expr);
        }

        throwUnexpected(lex());
    }

    // 11.2 Left-Hand-Side Expressions

    function parseArguments() {
        var args = [];

        expect('(');

        if (!match(')')) {
            while (index < length) {
                args.push(parseAssignmentExpression());
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }

        expect(')');

        return args;
    }

    function parseNonComputedProperty() {
        var token;

        delegate.markStart();
        token = lex();

        if (!isIdentifierName(token)) {
            throwUnexpected(token);
        }

        return delegate.markEnd(delegate.createIdentifier(token.value));
    }

    function parseNonComputedMember() {
        expect('.');

        return parseNonComputedProperty();
    }

    function parseComputedMember() {
        var expr;

        expect('[');

        expr = parseExpression();

        expect(']');

        return expr;
    }

    function parseNewExpression() {
        var callee, args;

        delegate.markStart();
        expectKeyword('new');
        callee = parseLeftHandSideExpression();
        args = match('(') ? parseArguments() : [];

        return delegate.markEnd(delegate.createNewExpression(callee, args));
    }

    function parseLeftHandSideExpressionAllowCall() {
        var marker, expr, args, property;

        marker = createLocationMarker();

        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

        while (match('.') || match('[') || match('(')) {
            if (match('(')) {
                args = parseArguments();
                expr = delegate.createCallExpression(expr, args);
            } else if (match('[')) {
                property = parseComputedMember();
                expr = delegate.createMemberExpression('[', expr, property);
            } else {
                property = parseNonComputedMember();
                expr = delegate.createMemberExpression('.', expr, property);
            }
            if (marker) {
                marker.end();
                marker.apply(expr);
            }
        }

        return expr;
    }

    function parseLeftHandSideExpression() {
        var marker, expr, property;

        marker = createLocationMarker();

        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

        while (match('.') || match('[')) {
            if (match('[')) {
                property = parseComputedMember();
                expr = delegate.createMemberExpression('[', expr, property);
            } else {
                property = parseNonComputedMember();
                expr = delegate.createMemberExpression('.', expr, property);
            }
            if (marker) {
                marker.end();
                marker.apply(expr);
            }
        }

        return expr;
    }

    // 11.3 Postfix Expressions

    function parsePostfixExpression() {
        var expr, token;

        delegate.markStart();
        expr = parseLeftHandSideExpressionAllowCall();

        if (lookahead.type === Token.Punctuator) {
            if ((match('++') || match('--')) && !peekLineTerminator()) {
                // 11.3.1, 11.3.2
                if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                    throwErrorTolerant({}, Messages.StrictLHSPostfix);
                }

                if (!isLeftHandSide(expr)) {
                    throwError({}, Messages.InvalidLHSInAssignment);
                }

                token = lex();
                expr = delegate.createPostfixExpression(token.value, expr);
            }
        }

        return delegate.markEndIf(expr);
    }

    // 11.4 Unary Operators

    function parseUnaryExpression() {
        var token, expr;

        delegate.markStart();

        if (lookahead.type !== Token.Punctuator && lookahead.type !== Token.Keyword) {
            expr = parsePostfixExpression();
        } else if (match('++') || match('--')) {
            token = lex();
            expr = parseUnaryExpression();
            // 11.4.4, 11.4.5
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                throwErrorTolerant({}, Messages.StrictLHSPrefix);
            }

            if (!isLeftHandSide(expr)) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }

            expr = delegate.createUnaryExpression(token.value, expr);
        } else if (match('+') || match('-') || match('~') || match('!')) {
            token = lex();
            expr = parseUnaryExpression();
            expr = delegate.createUnaryExpression(token.value, expr);
        } else if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
            token = lex();
            expr = parseUnaryExpression();
            expr = delegate.createUnaryExpression(token.value, expr);
            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
                throwErrorTolerant({}, Messages.StrictDelete);
            }
        } else {
            expr = parsePostfixExpression();
        }

        return delegate.markEndIf(expr);
    }

    function binaryPrecedence(token, allowIn) {
        var prec = 0;

        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
            return 0;
        }

        switch (token.value) {
        case '||':
            prec = 1;
            break;

        case '&&':
            prec = 2;
            break;

        case '|':
            prec = 3;
            break;

        case '^':
            prec = 4;
            break;

        case '&':
            prec = 5;
            break;

        case '==':
        case '!=':
        case '===':
        case '!==':
            prec = 6;
            break;

        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec = 7;
            break;

        case 'in':
            prec = allowIn ? 7 : 0;
            break;

        case '<<':
        case '>>':
        case '>>>':
            prec = 8;
            break;

        case '+':
        case '-':
            prec = 9;
            break;

        case '*':
        case '/':
        case '%':
            prec = 11;
            break;

        default:
            break;
        }

        return prec;
    }

    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators

    function parseBinaryExpression() {
        var marker, markers, expr, token, prec, previousAllowIn, stack, right, operator, left, i;

        previousAllowIn = state.allowIn;
        state.allowIn = true;

        marker = createLocationMarker();
        left = parseUnaryExpression();

        token = lookahead;
        prec = binaryPrecedence(token, previousAllowIn);
        if (prec === 0) {
            return left;
        }
        token.prec = prec;
        lex();

        markers = [marker, createLocationMarker()];
        right = parseUnaryExpression();

        stack = [left, token, right];

        while ((prec = binaryPrecedence(lookahead, previousAllowIn)) > 0) {

            // Reduce: make a binary expression from the three topmost entries.
            while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
                right = stack.pop();
                operator = stack.pop().value;
                left = stack.pop();
                expr = delegate.createBinaryExpression(operator, left, right);
                markers.pop();
                marker = markers.pop();
                if (marker) {
                    marker.end();
                    marker.apply(expr);
                }
                stack.push(expr);
                markers.push(marker);
            }

            // Shift.
            token = lex();
            token.prec = prec;
            stack.push(token);
            markers.push(createLocationMarker());
            expr = parseUnaryExpression();
            stack.push(expr);
        }

        state.allowIn = previousAllowIn;

        // Final reduce to clean-up the stack.
        i = stack.length - 1;
        expr = stack[i];
        markers.pop();
        while (i > 1) {
            expr = delegate.createBinaryExpression(stack[i - 1].value, stack[i - 2], expr);
            i -= 2;
            marker = markers.pop();
            if (marker) {
                marker.end();
                marker.apply(expr);
            }
        }

        return expr;
    }


    // 11.12 Conditional Operator

    function parseConditionalExpression() {
        var expr, previousAllowIn, consequent, alternate;

        delegate.markStart();
        expr = parseBinaryExpression();

        if (match('?')) {
            lex();
            previousAllowIn = state.allowIn;
            state.allowIn = true;
            consequent = parseAssignmentExpression();
            state.allowIn = previousAllowIn;
            expect(':');
            alternate = parseAssignmentExpression();

            expr = delegate.markEnd(delegate.createConditionalExpression(expr, consequent, alternate));
        } else {
            delegate.markEnd({});
        }

        return expr;
    }

    // 11.13 Assignment Operators

    function parseAssignmentExpression() {
        var token, left, right, node;

        token = lookahead;
        delegate.markStart();
        node = left = parseConditionalExpression();

        if (matchAssign()) {
            // LeftHandSideExpression
            if (!isLeftHandSide(left)) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }

            // 11.13.1
            if (strict && left.type === Syntax.Identifier && isRestrictedWord(left.name)) {
                throwErrorTolerant(token, Messages.StrictLHSAssignment);
            }

            token = lex();
            right = parseAssignmentExpression();
            node = delegate.createAssignmentExpression(token.value, left, right);
        }

        return delegate.markEndIf(node);
    }

    // 11.14 Comma Operator

    function parseExpression() {
        var expr;

        delegate.markStart();
        expr = parseAssignmentExpression();

        if (match(',')) {
            expr = delegate.createSequenceExpression([ expr ]);

            while (index < length) {
                if (!match(',')) {
                    break;
                }
                lex();
                expr.expressions.push(parseAssignmentExpression());
            }
        }

        return delegate.markEndIf(expr);
    }

    // 12.1 Block

    function parseStatementList() {
        var list = [],
            statement;

        while (index < length) {
            if (match('}')) {
                break;
            }
            statement = parseSourceElement();
            if (typeof statement === 'undefined') {
                break;
            }
            list.push(statement);
        }

        return list;
    }

    function parseBlock() {
        var block;

        skipComment();
        delegate.markStart();
        expect('{');

        block = parseStatementList();

        expect('}');

        return delegate.markEnd(delegate.createBlockStatement(block));
    }

    // 12.2 Variable Statement

    function parseVariableIdentifier() {
        var token;

        skipComment();
        delegate.markStart();
        token = lex();

        if (token.type !== Token.Identifier) {
            throwUnexpected(token);
        }

        return delegate.markEnd(delegate.createIdentifier(token.value));
    }

    function parseVariableDeclaration(kind) {
        var init = null, id;

        skipComment();
        delegate.markStart();
        id = parseVariableIdentifier();

        // 12.2.1
        if (strict && isRestrictedWord(id.name)) {
            throwErrorTolerant({}, Messages.StrictVarName);
        }

        if (kind === 'const') {
            expect('=');
            init = parseAssignmentExpression();
        } else if (match('=')) {
            lex();
            init = parseAssignmentExpression();
        }

        return delegate.markEnd(delegate.createVariableDeclarator(id, init));
    }

    function parseVariableDeclarationList(kind) {
        var list = [];

        do {
            list.push(parseVariableDeclaration(kind));
            if (!match(',')) {
                break;
            }
            lex();
        } while (index < length);

        return list;
    }

    function parseVariableStatement() {
        var declarations;

        expectKeyword('var');

        declarations = parseVariableDeclarationList();

        consumeSemicolon();

        return delegate.createVariableDeclaration(declarations, 'var');
    }

    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration(kind) {
        var declarations;

        skipComment();
        delegate.markStart();

        expectKeyword(kind);

        declarations = parseVariableDeclarationList(kind);

        consumeSemicolon();

        return delegate.markEnd(delegate.createVariableDeclaration(declarations, kind));
    }

    // 12.3 Empty Statement

    function parseEmptyStatement() {
        expect(';');
        return delegate.createEmptyStatement();
    }

    // 12.4 Expression Statement

    function parseExpressionStatement() {
        var expr = parseExpression();
        consumeSemicolon();
        return delegate.createExpressionStatement(expr);
    }

    // 12.5 If statement

    function parseIfStatement() {
        var test, consequent, alternate;

        expectKeyword('if');

        expect('(');

        test = parseExpression();

        expect(')');

        consequent = parseStatement();

        if (matchKeyword('else')) {
            lex();
            alternate = parseStatement();
        } else {
            alternate = null;
        }

        return delegate.createIfStatement(test, consequent, alternate);
    }

    // 12.6 Iteration Statements

    function parseDoWhileStatement() {
        var body, test, oldInIteration;

        expectKeyword('do');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        expectKeyword('while');

        expect('(');

        test = parseExpression();

        expect(')');

        if (match(';')) {
            lex();
        }

        return delegate.createDoWhileStatement(body, test);
    }

    function parseWhileStatement() {
        var test, body, oldInIteration;

        expectKeyword('while');

        expect('(');

        test = parseExpression();

        expect(')');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        return delegate.createWhileStatement(test, body);
    }

    function parseForVariableDeclaration() {
        var token, declarations;

        delegate.markStart();
        token = lex();
        declarations = parseVariableDeclarationList();

        return delegate.markEnd(delegate.createVariableDeclaration(declarations, token.value));
    }

    function parseForStatement() {
        var init, test, update, left, right, body, oldInIteration;

        init = test = update = null;

        expectKeyword('for');

        expect('(');

        if (match(';')) {
            lex();
        } else {
            if (matchKeyword('var') || matchKeyword('let')) {
                state.allowIn = false;
                init = parseForVariableDeclaration();
                state.allowIn = true;

                if (init.declarations.length === 1 && matchKeyword('in')) {
                    lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                }
            } else {
                state.allowIn = false;
                init = parseExpression();
                state.allowIn = true;

                if (matchKeyword('in')) {
                    // LeftHandSideExpression
                    if (!isLeftHandSide(init)) {
                        throwError({}, Messages.InvalidLHSInForIn);
                    }

                    lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                }
            }

            if (typeof left === 'undefined') {
                expect(';');
            }
        }

        if (typeof left === 'undefined') {

            if (!match(';')) {
                test = parseExpression();
            }
            expect(';');

            if (!match(')')) {
                update = parseExpression();
            }
        }

        expect(')');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        return (typeof left === 'undefined') ?
                delegate.createForStatement(init, test, update, body) :
                delegate.createForInStatement(left, right, body);
    }

    // 12.7 The continue statement

    function parseContinueStatement() {
        var label = null, key;

        expectKeyword('continue');

        // Optimize the most common form: 'continue;'.
        if (source.charCodeAt(index) === 59) {
            lex();

            if (!state.inIteration) {
                throwError({}, Messages.IllegalContinue);
            }

            return delegate.createContinueStatement(null);
        }

        if (peekLineTerminator()) {
            if (!state.inIteration) {
                throwError({}, Messages.IllegalContinue);
            }

            return delegate.createContinueStatement(null);
        }

        if (lookahead.type === Token.Identifier) {
            label = parseVariableIdentifier();

            key = '$' + label.name;
            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError({}, Messages.UnknownLabel, label.name);
            }
        }

        consumeSemicolon();

        if (label === null && !state.inIteration) {
            throwError({}, Messages.IllegalContinue);
        }

        return delegate.createContinueStatement(label);
    }

    // 12.8 The break statement

    function parseBreakStatement() {
        var label = null, key;

        expectKeyword('break');

        // Catch the very common case first: immediately a semicolon (char #59).
        if (source.charCodeAt(index) === 59) {
            lex();

            if (!(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
            }

            return delegate.createBreakStatement(null);
        }

        if (peekLineTerminator()) {
            if (!(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
            }

            return delegate.createBreakStatement(null);
        }

        if (lookahead.type === Token.Identifier) {
            label = parseVariableIdentifier();

            key = '$' + label.name;
            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError({}, Messages.UnknownLabel, label.name);
            }
        }

        consumeSemicolon();

        if (label === null && !(state.inIteration || state.inSwitch)) {
            throwError({}, Messages.IllegalBreak);
        }

        return delegate.createBreakStatement(label);
    }

    // 12.9 The return statement

    function parseReturnStatement() {
        var argument = null;

        expectKeyword('return');

        if (!state.inFunctionBody) {
            throwErrorTolerant({}, Messages.IllegalReturn);
        }

        // 'return' followed by a space and an identifier is very common.
        if (source.charCodeAt(index) === 32) {
            if (isIdentifierStart(source.charCodeAt(index + 1))) {
                argument = parseExpression();
                consumeSemicolon();
                return delegate.createReturnStatement(argument);
            }
        }

        if (peekLineTerminator()) {
            return delegate.createReturnStatement(null);
        }

        if (!match(';')) {
            if (!match('}') && lookahead.type !== Token.EOF) {
                argument = parseExpression();
            }
        }

        consumeSemicolon();

        return delegate.createReturnStatement(argument);
    }

    // 12.10 The with statement

    function parseWithStatement() {
        var object, body;

        if (strict) {
            throwErrorTolerant({}, Messages.StrictModeWith);
        }

        expectKeyword('with');

        expect('(');

        object = parseExpression();

        expect(')');

        body = parseStatement();

        return delegate.createWithStatement(object, body);
    }

    // 12.10 The swith statement

    function parseSwitchCase() {
        var test,
            consequent = [],
            statement;

        skipComment();
        delegate.markStart();
        if (matchKeyword('default')) {
            lex();
            test = null;
        } else {
            expectKeyword('case');
            test = parseExpression();
        }
        expect(':');

        while (index < length) {
            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
                break;
            }
            statement = parseStatement();
            consequent.push(statement);
        }

        return delegate.markEnd(delegate.createSwitchCase(test, consequent));
    }

    function parseSwitchStatement() {
        var discriminant, cases, clause, oldInSwitch, defaultFound;

        expectKeyword('switch');

        expect('(');

        discriminant = parseExpression();

        expect(')');

        expect('{');

        if (match('}')) {
            lex();
            return delegate.createSwitchStatement(discriminant);
        }

        cases = [];

        oldInSwitch = state.inSwitch;
        state.inSwitch = true;
        defaultFound = false;

        while (index < length) {
            if (match('}')) {
                break;
            }
            clause = parseSwitchCase();
            if (clause.test === null) {
                if (defaultFound) {
                    throwError({}, Messages.MultipleDefaultsInSwitch);
                }
                defaultFound = true;
            }
            cases.push(clause);
        }

        state.inSwitch = oldInSwitch;

        expect('}');

        return delegate.createSwitchStatement(discriminant, cases);
    }

    // 12.13 The throw statement

    function parseThrowStatement() {
        var argument;

        expectKeyword('throw');

        if (peekLineTerminator()) {
            throwError({}, Messages.NewlineAfterThrow);
        }

        argument = parseExpression();

        consumeSemicolon();

        return delegate.createThrowStatement(argument);
    }

    // 12.14 The try statement

    function parseCatchClause() {
        var param, body;

        skipComment();
        delegate.markStart();
        expectKeyword('catch');

        expect('(');
        if (match(')')) {
            throwUnexpected(lookahead);
        }

        param = parseVariableIdentifier();
        // 12.14.1
        if (strict && isRestrictedWord(param.name)) {
            throwErrorTolerant({}, Messages.StrictCatchVariable);
        }

        expect(')');
        body = parseBlock();
        return delegate.markEnd(delegate.createCatchClause(param, body));
    }

    function parseTryStatement() {
        var block, handlers = [], finalizer = null;

        expectKeyword('try');

        block = parseBlock();

        if (matchKeyword('catch')) {
            handlers.push(parseCatchClause());
        }

        if (matchKeyword('finally')) {
            lex();
            finalizer = parseBlock();
        }

        if (handlers.length === 0 && !finalizer) {
            throwError({}, Messages.NoCatchOrFinally);
        }

        return delegate.createTryStatement(block, [], handlers, finalizer);
    }

    // 12.15 The debugger statement

    function parseDebuggerStatement() {
        expectKeyword('debugger');

        consumeSemicolon();

        return delegate.createDebuggerStatement();
    }

    // 12 Statements

    function parseStatement() {
        var type = lookahead.type,
            expr,
            labeledBody,
            key;

        if (type === Token.EOF) {
            throwUnexpected(lookahead);
        }

        skipComment();
        delegate.markStart();

        if (type === Token.Punctuator) {
            switch (lookahead.value) {
            case ';':
                return delegate.markEnd(parseEmptyStatement());
            case '{':
                return delegate.markEnd(parseBlock());
            case '(':
                return delegate.markEnd(parseExpressionStatement());
            default:
                break;
            }
        }

        if (type === Token.Keyword) {
            switch (lookahead.value) {
            case 'break':
                return delegate.markEnd(parseBreakStatement());
            case 'continue':
                return delegate.markEnd(parseContinueStatement());
            case 'debugger':
                return delegate.markEnd(parseDebuggerStatement());
            case 'do':
                return delegate.markEnd(parseDoWhileStatement());
            case 'for':
                return delegate.markEnd(parseForStatement());
            case 'function':
                return delegate.markEnd(parseFunctionDeclaration());
            case 'if':
                return delegate.markEnd(parseIfStatement());
            case 'return':
                return delegate.markEnd(parseReturnStatement());
            case 'switch':
                return delegate.markEnd(parseSwitchStatement());
            case 'throw':
                return delegate.markEnd(parseThrowStatement());
            case 'try':
                return delegate.markEnd(parseTryStatement());
            case 'var':
                return delegate.markEnd(parseVariableStatement());
            case 'while':
                return delegate.markEnd(parseWhileStatement());
            case 'with':
                return delegate.markEnd(parseWithStatement());
            default:
                break;
            }
        }

        expr = parseExpression();

        // 12.12 Labelled Statements
        if ((expr.type === Syntax.Identifier) && match(':')) {
            lex();

            key = '$' + expr.name;
            if (Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError({}, Messages.Redeclaration, 'Label', expr.name);
            }

            state.labelSet[key] = true;
            labeledBody = parseStatement();
            delete state.labelSet[key];
            return delegate.markEnd(delegate.createLabeledStatement(expr, labeledBody));
        }

        consumeSemicolon();

        return delegate.markEnd(delegate.createExpressionStatement(expr));
    }

    // 13 Function Definition

    function parseFunctionSourceElements() {
        var sourceElement, sourceElements = [], token, directive, firstRestricted,
            oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody;

        skipComment();
        delegate.markStart();
        expect('{');

        while (index < length) {
            if (lookahead.type !== Token.StringLiteral) {
                break;
            }
            token = lookahead;

            sourceElement = parseSourceElement();
            sourceElements.push(sourceElement);
            if (sourceElement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = source.slice(token.range[0] + 1, token.range[1] - 1);
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }

        oldLabelSet = state.labelSet;
        oldInIteration = state.inIteration;
        oldInSwitch = state.inSwitch;
        oldInFunctionBody = state.inFunctionBody;

        state.labelSet = {};
        state.inIteration = false;
        state.inSwitch = false;
        state.inFunctionBody = true;

        while (index < length) {
            if (match('}')) {
                break;
            }
            sourceElement = parseSourceElement();
            if (typeof sourceElement === 'undefined') {
                break;
            }
            sourceElements.push(sourceElement);
        }

        expect('}');

        state.labelSet = oldLabelSet;
        state.inIteration = oldInIteration;
        state.inSwitch = oldInSwitch;
        state.inFunctionBody = oldInFunctionBody;

        return delegate.markEnd(delegate.createBlockStatement(sourceElements));
    }

    function parseParams(firstRestricted) {
        var param, params = [], token, stricted, paramSet, key, message;
        expect('(');

        if (!match(')')) {
            paramSet = {};
            while (index < length) {
                token = lookahead;
                param = parseVariableIdentifier();
                key = '$' + token.value;
                if (strict) {
                    if (isRestrictedWord(token.value)) {
                        stricted = token;
                        message = Messages.StrictParamName;
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet, key)) {
                        stricted = token;
                        message = Messages.StrictParamDupe;
                    }
                } else if (!firstRestricted) {
                    if (isRestrictedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictParamName;
                    } else if (isStrictModeReservedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet, key)) {
                        firstRestricted = token;
                        message = Messages.StrictParamDupe;
                    }
                }
                params.push(param);
                paramSet[key] = true;
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }

        expect(')');

        return {
            params: params,
            stricted: stricted,
            firstRestricted: firstRestricted,
            message: message
        };
    }

    function parseFunctionDeclaration() {
        var id, params = [], body, token, stricted, tmp, firstRestricted, message, previousStrict;

        skipComment();
        delegate.markStart();

        expectKeyword('function');
        token = lookahead;
        id = parseVariableIdentifier();
        if (strict) {
            if (isRestrictedWord(token.value)) {
                throwErrorTolerant(token, Messages.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord(token.value)) {
                firstRestricted = token;
                message = Messages.StrictFunctionName;
            } else if (isStrictModeReservedWord(token.value)) {
                firstRestricted = token;
                message = Messages.StrictReservedWord;
            }
        }

        tmp = parseParams(firstRestricted);
        params = tmp.params;
        stricted = tmp.stricted;
        firstRestricted = tmp.firstRestricted;
        if (tmp.message) {
            message = tmp.message;
        }

        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (strict && firstRestricted) {
            throwError(firstRestricted, message);
        }
        if (strict && stricted) {
            throwErrorTolerant(stricted, message);
        }
        strict = previousStrict;

        return delegate.markEnd(delegate.createFunctionDeclaration(id, params, [], body));
    }

    function parseFunctionExpression() {
        var token, id = null, stricted, firstRestricted, message, tmp, params = [], body, previousStrict;

        delegate.markStart();
        expectKeyword('function');

        if (!match('(')) {
            token = lookahead;
            id = parseVariableIdentifier();
            if (strict) {
                if (isRestrictedWord(token.value)) {
                    throwErrorTolerant(token, Messages.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictFunctionName;
                } else if (isStrictModeReservedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                }
            }
        }

        tmp = parseParams(firstRestricted);
        params = tmp.params;
        stricted = tmp.stricted;
        firstRestricted = tmp.firstRestricted;
        if (tmp.message) {
            message = tmp.message;
        }

        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (strict && firstRestricted) {
            throwError(firstRestricted, message);
        }
        if (strict && stricted) {
            throwErrorTolerant(stricted, message);
        }
        strict = previousStrict;

        return delegate.markEnd(delegate.createFunctionExpression(id, params, [], body));
    }

    // 14 Program

    function parseSourceElement() {
        if (lookahead.type === Token.Keyword) {
            switch (lookahead.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration(lookahead.value);
            case 'function':
                return parseFunctionDeclaration();
            default:
                return parseStatement();
            }
        }

        if (lookahead.type !== Token.EOF) {
            return parseStatement();
        }
    }

    function parseSourceElements() {
        var sourceElement, sourceElements = [], token, directive, firstRestricted;

        while (index < length) {
            token = lookahead;
            if (token.type !== Token.StringLiteral) {
                break;
            }

            sourceElement = parseSourceElement();
            sourceElements.push(sourceElement);
            if (sourceElement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = source.slice(token.range[0] + 1, token.range[1] - 1);
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }

        while (index < length) {
            sourceElement = parseSourceElement();
            if (typeof sourceElement === 'undefined') {
                break;
            }
            sourceElements.push(sourceElement);
        }
        return sourceElements;
    }

    function parseProgram() {
        var body;

        skipComment();
        delegate.markStart();
        strict = false;
        peek();
        body = parseSourceElements();
        return delegate.markEnd(delegate.createProgram(body));
    }

    function filterTokenLocation() {
        var i, entry, token, tokens = [];

        for (i = 0; i < extra.tokens.length; ++i) {
            entry = extra.tokens[i];
            token = {
                type: entry.type,
                value: entry.value
            };
            if (extra.range) {
                token.range = entry.range;
            }
            if (extra.loc) {
                token.loc = entry.loc;
            }
            tokens.push(token);
        }

        extra.tokens = tokens;
    }

    function LocationMarker() {
        this.marker = [index, lineNumber, index - lineStart, 0, 0, 0];
    }

    LocationMarker.prototype = {
        constructor: LocationMarker,

        end: function () {
            this.marker[3] = index;
            this.marker[4] = lineNumber;
            this.marker[5] = index - lineStart;
        },

        apply: function (node) {
            if (extra.range) {
                node.range = [this.marker[0], this.marker[3]];
            }
            if (extra.loc) {
                node.loc = {
                    start: {
                        line: this.marker[1],
                        column: this.marker[2]
                    },
                    end: {
                        line: this.marker[4],
                        column: this.marker[5]
                    }
                };
            }
            node = delegate.postProcess(node);
        }
    };

    function createLocationMarker() {
        if (!extra.loc && !extra.range) {
            return null;
        }

        skipComment();

        return new LocationMarker();
    }

    function tokenize(code, options) {
        var toString,
            token,
            tokens;

        toString = String;
        if (typeof code !== 'string' && !(code instanceof String)) {
            code = toString(code);
        }

        delegate = SyntaxTreeDelegate;
        source = code;
        index = 0;
        lineNumber = (source.length > 0) ? 1 : 0;
        lineStart = 0;
        length = source.length;
        lookahead = null;
        state = {
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false,
            lastCommentStart: -1,
        };

        extra = {};

        // Options matching.
        options = options || {};

        // Of course we collect tokens here.
        options.tokens = true;
        extra.tokens = [];
        extra.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra.openParenToken = -1;
        extra.openCurlyToken = -1;

        extra.range = (typeof options.range === 'boolean') && options.range;
        extra.loc = (typeof options.loc === 'boolean') && options.loc;

        if (typeof options.comment === 'boolean' && options.comment) {
            extra.comments = [];
        }
        if (typeof options.tolerant === 'boolean' && options.tolerant) {
            extra.errors = [];
        }

        if (length > 0) {
            if (typeof source[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code instanceof String) {
                    source = code.valueOf();
                }
            }
        }

        try {
            peek();
            if (lookahead.type === Token.EOF) {
                return extra.tokens;
            }

            token = lex();
            while (lookahead.type !== Token.EOF) {
                try {
                    token = lex();
                } catch (lexError) {
                    token = lookahead;
                    if (extra.errors) {
                        extra.errors.push(lexError);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError;
                    }
                }
            }

            filterTokenLocation();
            tokens = extra.tokens;
            if (typeof extra.comments !== 'undefined') {
                tokens.comments = extra.comments;
            }
            if (typeof extra.errors !== 'undefined') {
                tokens.errors = extra.errors;
            }
        } catch (e) {
            throw e;
        } finally {
            extra = {};
        }
        return tokens;
    }

    function parse(code, options) {
        var program, toString;

        toString = String;
        if (typeof code !== 'string' && !(code instanceof String)) {
            code = toString(code);
        }

        delegate = SyntaxTreeDelegate;
        source = code;
        index = 0;
        lineNumber = (source.length > 0) ? 1 : 0;
        lineStart = 0;
        length = source.length;
        lookahead = null;
        state = {
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false,
            lastCommentStart: -1,
            markerStack: []
        };

        extra = {};
        if (typeof options !== 'undefined') {
            extra.range = (typeof options.range === 'boolean') && options.range;
            extra.loc = (typeof options.loc === 'boolean') && options.loc;

            if (extra.loc && options.source !== null && options.source !== undefined) {
                extra.source = toString(options.source);
            }

            if (typeof options.tokens === 'boolean' && options.tokens) {
                extra.tokens = [];
            }
            if (typeof options.comment === 'boolean' && options.comment) {
                extra.comments = [];
            }
            if (typeof options.tolerant === 'boolean' && options.tolerant) {
                extra.errors = [];
            }
        }

        if (length > 0) {
            if (typeof source[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code instanceof String) {
                    source = code.valueOf();
                }
            }
        }

        try {
            program = parseProgram();
            if (typeof extra.comments !== 'undefined') {
                program.comments = extra.comments;
            }
            if (typeof extra.tokens !== 'undefined') {
                filterTokenLocation();
                program.tokens = extra.tokens;
            }
            if (typeof extra.errors !== 'undefined') {
                program.errors = extra.errors;
            }
        } catch (e) {
            throw e;
        } finally {
            extra = {};
        }

        return program;
    }

    // Sync with package.json and component.json.
    exports.version = '1.1.0-dev';

    exports.tokenize = tokenize;

    exports.parse = parse;

    // Deep copy.
    exports.Syntax = (function () {
        var name, types = {};

        if (typeof Object.create === 'function') {
            types = Object.create(null);
        }

        for (name in Syntax) {
            if (Syntax.hasOwnProperty(name)) {
                types[name] = Syntax[name];
            }
        }

        if (typeof Object.freeze === 'function') {
            Object.freeze(types);
        }

        return types;
    }());

}));
/* vim: set sw=4 ts=4 et tw=80 : */
/*
 * StructuredJS provides an API for static analysis of code based on an abstract
 * syntax tree generated by Esprima (compliant with the Mozilla Parser
 * API at https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API).
 *
 * Dependencies: esprima.js, underscore.js
 */
(function(global) {
    /* Detect npm versus browser usage */
    var exports;
    var esprima;
    var _;

    // Cache all the structure tests
    var structureCache = {};

    // Cache the most recently-parsed code and tree
    var cachedCode;
    var cachedCodeTree;

    if (typeof module !== "undefined" && module.exports) {
        exports = module.exports = {};
        esprima = require("esprima");
        _ = require("underscore");
    } else {
        exports = this.Structured = {};
        esprima = global.esprima;
        _ = global._;
    }

    if (!esprima || !_) {
        throw "Error: Both Esprima and UnderscoreJS are required dependencies.";
    }

    /*
     * Introspects a callback to determine it's parameters and then
     * produces a constraint that contains the appropriate variables and callbacks.
     *
     * This allows a much terser definition of callback function where you don't have to
     * explicitly state the parameters in a separate list
     */
    function makeConstraint(callback) {
        var paramText = /^function [^\(]*\(([^\)]*)\)/.exec(callback)[1];
        var params = paramText.match(/[$_a-zA-z0-9]+/g);

        for (var key in params) {
            if (params[key][0] !== "$") {
                console.warn("Invalid parameter in constraint (should begin with a '$'): ", params[key]);
                return null;
            }
        }
        return {
            variables: params,
            fn: callback
        };
    }

    /*
     * Returns true if the code (a string) matches the structure in rawStructure
     * Throws an exception if code is not parseable.
     *
     * Example:
     *     var code = "if (y > 30 && x > 13) {x += y;}";
     *     var rawStructure = function structure() { if (_) {} };
     *     match(code, rawStructure);
     *
     * options.varCallbacks is an object that maps user variable strings like
     *  "$myVar", "$a, $b, $c" etc to callbacks. These callbacks receive the
     *  potential Esprima structure values assigned to each of the user
     *  variables specified in the string, and can accept/reject that value
     *  by returning true/false. The callbacks can also specify a failure
     *  message instead by returning an object of the form
     *  {failure: "Your failure message"}, in which case the message will be
     *  returned as the property "failure" on the varCallbacks object if
     *  there is no valid match. A valid matching requires that every
     *  varCallback return true.
     *
     * Advanced Example:
     *   var varCallbacks = [
     *     function($foo) {
     *         return $foo.value > 92;
     *     },
     *     function($foo, $bar, $baz) {
     *         if ($foo.value > $bar.value) {
     *            return {failure: "Check the relationship between values."};
     *         }
     *         return $baz.value !== 48;
     *     }
     *   ];
     *   var code = "var a = 400; var b = 120; var c = 500; var d = 49;";
     *   var rawStructure = function structure() {
     *       var _ = $foo; var _ = $bar; var _ = $baz;
     *   };
     *   match(code, rawStructure, {varCallbacks: varCallbacks});
     */
    var originalVarCallbacks;
    function match(code, rawStructure, options) {
        options = options || {};
        // Many possible inputs formats are accepted for varCallbacks
        // Constraints can be:
        // 1. a function (from which we will extract the variables)  
        // 2. an objects (which already has separate .fn and .variables properties)
        //
        // It will also accept a list of either of the above (or a mix of the two).
        // Finally it can accept an object for which the keys are the variables and 
        // the values are the callbacks (This option is mainly for historical reasons)
        var varCallbacks = options.varCallbacks || [];
        // We need to keep a hold of the original varCallbacks object because 
        // When structured first came out it returned the failure message by 
        // changing the .failure property on the varCallbacks object and some uses rely on that.
        // We hope to get rid of this someday.
        // TODO: Change over the code so to have a better API
        originalVarCallbacks = varCallbacks;
        if (varCallbacks instanceof Function || (varCallbacks.fn && varCallbacks.variables)) {
            varCallbacks = [varCallbacks];
        }
        if (varCallbacks instanceof Array) {
            for (var key in varCallbacks) {
                if (varCallbacks[key] instanceof Function) {
                    varCallbacks[key] = makeConstraint(varCallbacks[key]);
                }
            }
        } else {
            var realCallbacks = [];
            for (var vars in varCallbacks) {
                if (varCallbacks.hasOwnProperty(vars) && vars !== "failure") {
                    realCallbacks.push({
                        variables: vars.match(/[$_a-zA-z0-9]+/g),
                        fn: varCallbacks[vars]
                    });
                }
            }
            varCallbacks = realCallbacks;
        }
        var wildcardVars = {
            order: [],
            skipData: {},
            values: {}
        };
        // Note: After the parse, structure contains object references into
        // wildcardVars[values] that must be maintained. So, beware of
        // JSON.parse(JSON.stringify), etc. as the tree is no longer static.
        var structure = parseStructureWithVars(rawStructure, wildcardVars);

        // Cache the parsed code tree, or pull from cache if it exists
        var codeTree = (cachedCode === code ?
            cachedCodeTree :
            typeof code === "object" ?
            deepClone(code) :
            esprima.parse(code));

        cachedCode = code;
        cachedCodeTree = codeTree;

        foldConstants(codeTree);
        var toFind = structure.body || structure;
        var peers = [];
        if (_.isArray(structure.body)) {
            toFind = structure.body[0];
            peers = structure.body.slice(1);
        }
        var result;
        var matchResult = {
            _: [],
            vars: {}
        };
        if (wildcardVars.order.length === 0 || options.single) {
            // With no vars to match, our normal greedy approach works great.
            result = checkMatchTree(codeTree, toFind, peers, wildcardVars, matchResult, options);
        } else {
            // If there are variables to match, we must do a potentially
            // exhaustive search across the possible ways to match the vars.
            result = anyPossible(0, wildcardVars, varCallbacks, matchResult, options);
        }
        return result;

        /*
         * Checks whether any possible valid variable assignment for this i
         *  results in a valid match.
         *
         * We orchestrate this check by building skipData, which specifies
         *  for each variable how many possible matches it should skip before
         *  it guesses a match. The iteration over the tree is the same
         *  every time -- if the first guess fails, the next run will skip the
         *  first guess and instead take the second appearance, and so on.
         *
         * When there are multiple variables, changing an earlier (smaller i)
         *  variable guess means that we must redo the guessing for the later
         *  variables (larger i).
         *
         * Returning false involves exhausting all possibilities. In the worst
         *  case, this will mean exponentially many possibilities -- variables
         *  are expensive for all but small tests.
         *
         * wildcardVars = wVars:
         *     .values[varName] contains the guessed node value of each
         *     variable, or the empty object if none.
         *     .skipData[varName] contains the number of potential matches of
         *          this var to skip before choosing a guess to assign to values
         *     .leftToSkip[varName] stores the number of skips left to do
         *         (used during the match algorithm)
         *     .order[i] is the name of the ith occurring variable.
         */
        function anyPossible(i, wVars, varCallbacks, matchResults, options) {
            var order = wVars.order; // Just for ease-of-notation.
            wVars.skipData[order[i]] = 0;
            do {
                // Reset the skip # for all later variables.
                for (var rest = i + 1; rest < order.length; rest += 1) {
                    wVars.skipData[order[rest]] = 0;
                }
                // Check for a match only if we have reached the last var in
                // order (and so set skipData for all vars). Otherwise,
                // recurse to check all possible values of the next var.
                if (i === order.length - 1) {
                    // Reset the wildcard vars' guesses. Delete the properties
                    // rather than setting to {} in order to maintain shared
                    // object references in the structure tree (toFind, peers)
                    _.each(wVars.values, function(value, key) {
                        _.each(wVars.values[key], function(v, k) {
                            delete wVars.values[key][k];
                        });
                    });
                    wVars.leftToSkip = _.extend({}, wVars.skipData);
                    // Use a copy of peers because peers is destructively
                    // modified in checkMatchTree (via checkNodeArray).
                    if (checkMatchTree(codeTree, toFind, peers.slice(), wVars, matchResults, options) &&
                        checkUserVarCallbacks(wVars, varCallbacks)) {
                        return matchResults;
                    }
                } else if (anyPossible(i + 1, wVars, varCallbacks, matchResults, options)) {
                    return matchResults;
                }
                // This guess didn't work out -- skip it and try the next.
                wVars.skipData[order[i]] += 1;
                // The termination condition is when we have run out of values
                // to skip and values is no longer defined for this var after
                // the match algorithm. That means that there is no valid
                // assignment for this and later vars given the assignments to
                // previous vars (set by skipData).
            } while (!_.isEmpty(wVars.values[order[i]]));
            return false;
        }
    }

    /*
     * Checks the user-defined variable callbacks and returns a boolean for
     *   whether or not the wVars assignment of the wildcard variables results
     *   in every varCallback returning true as required.
     *
     * If any varCallback returns false, this function also returns false.
     *
     * Format of varCallbacks: An object containing:
     *     keys of the form: "$someVar" or "$foo, $bar, $baz" to mimic an
     *        array (as JS keys must be strings).
     *     values containing function callbacks. These callbacks must return
     *        true/false. They may alternately return an object of the form
     *        {failure: "The failure message."}. If the callback returns the
     *        failure object, then the relevant failure message will be returned
     *        via varCallbacks.failure.
     *        These callbacks are passed a parameter list corresponding to
     *         the Esprima parse structures assigned to the variables in
     *         the key (see example).
     *
     * Example varCallbacks object:
     *    {
     *     "$foo": function(fooObj) {
     *         return fooObj.value > 92;
     *     },
     *     "$foo, $bar, $baz": function(fooObj, barObj, bazObj) {
     *         if (fooObj.value > barObj.value) {
     *            return {failure: "Check the relationship between values."}
     *         }
     *         return bazObj !== 48;
     *     }
     *   }
     */
    function checkUserVarCallbacks(wVars, varCallbacks) {
        // Clear old failure message if needed
        delete originalVarCallbacks.failure;
        for (var key in varCallbacks) {
            // Property strings may be "$foo, $bar, $baz" to mimic arrays.
            var varNames = varCallbacks[key].variables;
            var varValues = _.map(varNames, function(varName) {
                varName = stringLeftTrim(varName); // Trim whitespace
                // If the var name is in the structure, then it will always
                // exist in wVars.values after we find a match prior to
                // checking the var callbacks. So, if a variable name is not
                // defined here, it is because that var name does not exist in
                // the user-defined structure.
                if (!_.has(wVars.values, varName)) {
                    console.error("Callback var " + varName + " doesn't exist");
                    return undefined;
                }
                // Convert each var name to the Esprima structure it has
                // been assigned in the parse. Make a deep copy.
                return deepClone(wVars.values[varName]);
            });
            // Call the user-defined callback, passing in the var values as
            // parameters in the order that the vars were defined in the
            // property string.
            var result = varCallbacks[key].fn.apply(null, varValues);
            if (!result || _.has(result, "failure")) {
                // Set the failure message if the user callback provides one.
                if (_.has(result, "failure")) {
                    originalVarCallbacks.failure = result.failure;
                }
                return false;
            }
        }
        return true;

        /* Trim is only a string method in IE9+, so use a regex if needed. */
        function stringLeftTrim(str) {
            if (String.prototype.trim) {
                return str.trim();
            }
            return str.replace(/^\s+|\s+$/g, "");
        }
    }

    function parseStructure(structure) {
        if (typeof structure === "object") {
            return deepClone(structure);
        }

        if (structureCache[structure]) {
            return JSON.parse(structureCache[structure]);
        }

        // Wrapped in parentheses so function() {} becomes valid Javascript.
        var fullTree = esprima.parse("(" + structure + ")");

        if (fullTree.body[0].expression.type !== "FunctionExpression" ||
            !fullTree.body[0].expression.body) {
            throw "Poorly formatted structure code";
        }

        var tree = fullTree.body[0].expression.body;
        structureCache[structure] = JSON.stringify(tree);
        return tree;
    }

    /*
     * Returns a tree parsed out of the structure. The returned tree is an
     *    abstract syntax tree with wildcard properties set to undefined.
     *
     * structure is a specification looking something like:
     *        function structure() {if (_) { var _ = 3; }}
     *    where _ denotes a blank (anything can go there),
     *    and code can go before or after any statement (only the nesting and
     *        relative ordering matter).
     */
    function parseStructureWithVars(structure, wVars) {
        var tree = parseStructure(structure);
        foldConstants(tree);
        simplifyTree(tree, wVars);
        return tree;
    }

    /*
     * Constant folds the syntax tree
     */
    function foldConstants(tree) {
        for (var key in tree) {
            if (!tree.hasOwnProperty(key)) {
                continue; // Inherited property
            }

            var ast = tree[key];
            if (_.isObject(ast)) {
                foldConstants(ast);

                /*
                 * Currently, we only fold + and - applied to a number literal.
                 * This is easy to extend, but it means we lose the ability to match
                 * potentially useful expressions like 5 + 5 with a pattern like _ + _.
                 */
                if (ast.type == esprima.Syntax.UnaryExpression) {
                    var argument = ast.argument;
                    if (argument.type === esprima.Syntax.Literal &&
                        _.isNumber(argument.value)) {
                        if (ast.operator === "-") {
                            argument.value = -argument.value;
                            tree[key] = argument;
                        } else if (ast.operator === "+") {
                            argument.value = +argument.value;
                            tree[key] = argument;
                        }
                    }
                }
            }
        }
    }

    /*
     * Recursively traverses the tree and sets _ properties to undefined
     * and empty bodies to null.
     *
     *  Wildcards are explicitly set to undefined -- these undefined properties
     *  must exist and be non-null in order for code to match the structure.
     *
     *  Wildcard variables are set up such that the first occurrence of the
     *   variable in the structure tree is set to {wildcardVar: varName},
     *   and all later occurrences just refer to wVars.values[varName],
     *   which is an object assigned during the matching algorithm to have
     *   properties identical to our guess for the node matching the variable.
     *   (maintaining the reference). In effect, these later accesses
     *   to tree[key] mimic tree[key] simply being set to the variable value.
     *
     *  Empty statements are deleted from the tree -- they need not be matched.
     *
     *  If the subtree is an array, we just iterate over the array using
     *    for (var key in tree)
     *
     */
    function simplifyTree(tree, wVars) {
        for (var key in tree) {
            if (!tree.hasOwnProperty(key)) {
                continue; // Inherited property
            }
            if (_.isObject(tree[key])) {
                if (isWildcard(tree[key])) {
                    tree[key] = undefined;
                } else if (isWildcardVar(tree[key])) {
                    var varName = tree[key].name;
                    if (!wVars.values[varName]) {
                        // Perform setup for the first occurrence.
                        wVars.values[varName] = {}; // Filled in later.
                        tree[key] = {
                            wildcardVar: varName
                        };
                        wVars.order.push(varName);
                        wVars.skipData[varName] = 0;
                    } else {
                        tree[key] = wVars.values[varName]; // Reference.
                    }
                } else if (tree[key].type === esprima.Syntax.EmptyStatement) {
                    // Arrays are objects, but delete tree[key] does not
                    //  update the array length property -- so, use splice.
                    _.isArray(tree) ? tree.splice(key, 1) : delete tree[key];
                } else {
                    simplifyTree(tree[key], wVars);
                }
            }
        }
    }

    /*
     * Returns whether the structure node is intended as a wildcard node, which
     * can be filled in by anything in others' code.
     */
    function isWildcard(node) {
        return node.name && node.name === "_";
    }

    /* Returns whether the structure node is intended as a wildcard variable. */
    function isWildcardVar(node) {
        return (node.name && _.isString(node.name) && node.name.length >= 2 &&
            node.name[0] === "$");
    }

    /*
     *
     */
    function isGlob(node) {
        return node && node.name &&
            ((node.name === "glob_" && "_") ||
                (node.name.indexOf("glob$") === 0 && node.name.slice(5))) ||
            node && node.expression && isGlob(node.expression);
    }

    /*
     * Returns true if currTree matches the wildcard structure toFind.
     *
     * currTree: The syntax node tracking our current place in the user's code.
     * toFind: The syntax node from the structure that we wish to find.
     * peersToFind: The remaining ordered syntax nodes that we must find after
     *     toFind (and on the same level as toFind).
     */
    function checkMatchTree(currTree, toFind, peersToFind, wVars, matchResults, options) {
        if (_.isArray(toFind)) {
            console.error("toFind should never be an array.");
            console.error(toFind);
        }
        if (exactMatchNode(currTree, toFind, peersToFind, wVars, matchResults, options)) {
            return matchResults;
        }
        // Don't recurse if we're just checking a single node.
        if (options.single) {
            return false;
        }
        // Check children.
        for (var key in currTree) {
            if (!currTree.hasOwnProperty(key) || !_.isObject(currTree[key])) {
                continue; // Skip inherited properties
            }
            // Recursively check for matches
            if ((_.isArray(currTree[key]) &&
                    checkNodeArray(currTree[key], toFind, peersToFind, wVars, matchResults, options)) ||
                (!_.isArray(currTree[key]) &&
                    checkMatchTree(currTree[key], toFind, peersToFind, wVars, matchResults, options))) {
                return matchResults;
            }
        }
        return false;
    }

    /*
     * Returns true if this level of nodeArr matches the node in
     * toFind, and also matches all the nodes in peersToFind in order.
     */
    function checkNodeArray(nodeArr, toFind, peersToFind, wVars, matchResults, options) {
        var curGlob;

        for (var i = 0; i < nodeArr.length; i += 1) {
            if (isGlob(toFind)) {
                if (!curGlob) {
                    curGlob = [];
                    var globName = isGlob(toFind);
                    if (globName === "_") {
                        matchResults._.push(curGlob);
                    } else {
                        matchResults.vars[globName] = curGlob;
                    }
                }
                curGlob.push(nodeArr[i]);
            } else if (checkMatchTree(nodeArr[i], toFind, peersToFind, wVars, matchResults, options)) {
                if (!peersToFind || peersToFind.length === 0) {
                    return matchResults;
                    // Found everything needed on this level.
                } else {
                    // We matched this node, but we still have more nodes on
                    // this level we need to match on subsequent iterations
                    toFind = peersToFind.shift(); // Destructive.
                }
            }
        }

        if (curGlob) {
            return matchResults;
        } else if (isGlob(toFind)) {
            var globName = isGlob(toFind);
            if (globName === "_") {
                matchResults._.push([]);
            } else {
                matchResults.vars[globName] = [];
            }
            return matchResults;
        }

        return false;
    }


    /*
     * This discards all wildcard vars that were part of a failed match
     * this provides an important speedup by stopping anyPossible from having to increment
     * every match on a doomed set of arguments.
     * If the any argument set fails no amount of incrementing can save it.
     */
    function discardWVarsOnFailureDecorator(callback) {
        return function(currTree, toFind, peersToFind, wVars, matchResults, options) {
            var lastWVar;
            for (lastWVar=0; lastWVar<wVars.order.length; lastWVar++) {
                var candidate = wVars.values[wVars.order[lastWVar]];
                if (_.isEmpty(candidate)) {
                    break;
                }
            }
            var result = callback(currTree, toFind, peersToFind, wVars, matchResults, options);
            if (!result) {
                for (; lastWVar<wVars.order.length; lastWVar++) {
                    var candidate = wVars.values[wVars.order[lastWVar]];
                    if (!_.isEmpty(candidate)) {
                        // Reset the wildcard vars' guesses. Delete the properties
                        // rather than setting to {} in order to maintain shared
                        // object references in the structure tree (toFind, peers)
                        _.each(candidate, function(v, k) {
                            delete candidate[k];
                        });
                    } else {
                        break;
                    }
                }
                wVars._last = lastWVar;
            }
            return result;
        };
    }

    /*
     * Returns true if and only if all arguments from the pattern match the corresponding
     * argument in the test code
     */
    var checkArgumentsArray = discardWVarsOnFailureDecorator(function(nodeArr, toFind, peersToFind, wVars, matchResults, options) {
        var curGlob;

        for (var i = 0; i < nodeArr.length; i += 1) {
            if (isGlob(toFind)) {
                if (!curGlob) {
                    curGlob = [];
                    var globName = isGlob(toFind);
                    if (globName === "_") {
                        matchResults._.push(curGlob);
                    } else {
                        matchResults.vars[globName] = curGlob;
                    }
                }
                curGlob.push(nodeArr[i]);
            } else {
                if (checkMatchTree(nodeArr[i], toFind, peersToFind, wVars, matchResults, options)) {
                    if (!peersToFind || peersToFind.length === 0) {
                        return matchResults;
                    } else {
                        toFind = peersToFind.shift();
                    }
                } else {
                    return false;
                }
            }
        }

        if (curGlob) {
            return matchResults;
        } else if (isGlob(toFind)) {
            var globName = isGlob(toFind);
            if (globName === "_") {
                matchResults._.push([]);
            } else {
                matchResults.vars[globName] = [];
            }
            return matchResults;
        }

        return false;
    });

    /*
     * Checks whether the currNode exactly matches the node toFind.
     *
     * A match is exact if for every non-null property on toFind, that
     * property exists on currNode and:
     *     0. If the property is undefined on toFind, it must exist on currNode.
     *     1. Otherwise, the values have the same type (ie, they match).
     *     2. If the values are numbers or strings, they match.
     *     3. If the values are arrays, checkNodeArray on the arrays returns true.
     *     4. If the values are objects, checkMatchTree on those objects
     *         returns true (the objects recursively match to the extent we
     *         care about, though they may not match exactly).
     */
    function exactMatchNode(currNode, toFind, peersToFind, wVars, matchResults, options) {
        var rootToSet;

        if (!matchResults.root && currNode.type !== "Program") {
            rootToSet = currNode;
        }

        for (var key in toFind) {
            // Ignore inherited properties; also, null properties can be
            // anything and do not have to exist.
            if (!toFind.hasOwnProperty(key) || toFind[key] === null) {
                continue;
            }
            var subFind = toFind[key];
            var subCurr = currNode[key];
            // Undefined properties can be anything, but they must exist.
            if (subFind === undefined) {
                if (subCurr === null || subCurr === undefined) {
                    return false;
                } else {
                    matchResults._.push(subCurr);
                    continue;
                }
            }
            // currNode does not have the key, but toFind does
            if (subCurr === undefined || subCurr === null) {
                if (key === "wildcardVar") {
                    if (wVars.leftToSkip && wVars.leftToSkip[subFind] > 0) {
                        wVars.leftToSkip[subFind] -= 1;
                        return false; // Skip, this does not match our wildcard
                    }
                    // We have skipped the required number, so take this guess.
                    // Copy over all of currNode's properties into
                    //  wVars.values[subFind] so the var references set up in
                    //  simplifyTree behave like currNode. Shallow copy.
                    _.extend(wVars.values[subFind], currNode);
                    matchResults.vars[subFind.slice(1)] = currNode;
                    if (rootToSet) {
                        matchResults.root = rootToSet;
                    }
                    return matchResults; // This node is now our variable.
                }
                return false;
            }
            // Now handle arrays/objects/values
            if (_.isObject(subCurr) !== _.isObject(subFind) ||
                _.isArray(subCurr) !== _.isArray(subFind) ||
                (typeof(subCurr) !== typeof(subFind))) {
                console.error("Object/array/other type mismatch.");
                return false;
            } else if (_.isArray(subCurr)) {
                // Both are arrays, do a recursive compare.
                // (Arrays are objects so do this check before the object check)
                if (subFind.length === 0) {
                    continue; // Empty arrays can match any array.
                }
                var newToFind = subFind[0];
                var peers = subFind.slice(1);
                if (key === "params" || key === "arguments") {
                    if (!checkArgumentsArray(subCurr, newToFind, peers, wVars, matchResults, options)) {
                        return false;
                    }
                } else if (!checkNodeArray(subCurr, newToFind, peers, wVars, matchResults, options)) {
                    return false;
                }
            } else if (_.isObject(subCurr)) {
                // Both are objects, so do a recursive compare.
                if (!checkMatchTree(subCurr, subFind, peersToFind, wVars, matchResults, options)) {
                    return false;
                }
            } else if (!_.isObject(subCurr)) {
                // Check that the non-object (number/string) values match
                if (subCurr !== subFind) {
                    return false;
                }
            } else { // Logically impossible, but as a robustness catch.
                console.error("Some weird never-before-seen situation!");
                console.error(currNode);
                console.error(subCurr);
                throw "Error: logic inside of structure analysis code broke.";
            }
        }
        if (toFind === undefined) {
            matchResults._.push(currNode);
        }
        if (rootToSet) {
            matchResults.root = rootToSet;
        }
        return matchResults;
    }

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /*
     * Takes in a string for a structure and returns HTML for nice styling.
     * The blanks (_) are enclosed in span.structuredjs_blank, and the
     * structured.js variables ($someVar) are enclosed in span.structuredjs_var
     * for special styling.
     *
     * See pretty-display/index.html for a demo and sample stylesheet.
     *
     * Only works when RainbowJS (http://craig.is/making/rainbows) is
     * included on the page; if RainbowJS is not available, simply
     * returns the code string. RainbowJS is not available as an npm
     * module.
     */
    function prettyHtml(code, callback) {
        if (!Rainbow) {
            return code;
        }
        Rainbow.color(code, "javascript", function(formattedCode) {
            var output = ("<pre class='rainbowjs'>" +
                addStyling(formattedCode) + "</pre>");
            callback(output);
        });
    }

    /*
     * Helper function for prettyHtml that takes in a string (the formatted
     * output of RainbowJS) and inserts special StructuredJS spans for
     * blanks (_) and variables ($something).
     *
     * The optional parameter maintainStyles should be set to true if the
     * caller wishes to keep the class assignments from the previous call
     * to addStyling and continue where we left off. This parameter is
     * valuable for visual consistency across different structures that share
     * variables.
     */
    function addStyling(code, maintainStyles) {
        if (!maintainStyles) {
            addStyling.styleMap = {};
            addStyling.counter = 0;
        }
        // First replace underscores with empty structuredjs_blank spans
        // Regex: Match any underscore _ that is not preceded or followed by an
        // alphanumeric character.
        code = code.replace(/(^|[^A-Za-z0-9])_(?![A-Za-z0-9])/g,
            "$1<span class='structuredjs_blank'></span>");
        // Next replace variables with empty structuredjs_var spans numbered
        // with classes.
        // This regex is in two parts:
        //  Part 1, delimited by the non-capturing parentheses `(?: ...)`:
        //    (^|[^\w])\$(\w+)
        //    Match any $ that is preceded by either a 'start of line', or a
        //    non-alphanumeric character, and is followed by at least one
        //    alphanumeric character (the variable name).
        //  Part 2, also delimited by the non-capturing parentheses:
        //      ()\$<span class="function call">(\w+)<\/span>
        //      Match any function call immediately preceded by a dollar sign,
        //      where the Rainbow syntax highlighting separated a $foo()
        //      function call by placing the dollar sign outside.
        //      the function call span to create
        //      $<span class="function call">foo</span>.
        // We combine the two parts with an | (an OR) so that either matches.
        // The reason we do this all in one go rather than in two separate
        // calls to replace is so that we color the string in order,
        // rather than coloring all non-function calls and then going back
        // to do all function calls (a minor point, but otherwise the
        // interactive pretty display becomes jarring as previous
        // function call colors change when new variables are introduced.)
        // Finally, add the /g flag for global replacement.
        var regexVariables = /(?:(^|[^\w])\$(\w+))|(?:\$<span class="function call">(\w+)<\/span>)/g;
        return code.replace(regexVariables,
            function(m, prev, varName, fnVarName) {
                // Necessary to handle the fact we are essentially performing
                // two regexes at once as outlined above.
                prev = prev || "";
                varName = varName || fnVarName;
                var fn = addStyling;
                // Assign the next available class to this variable if it does
                // not yet exist in our style mapping.
                if (!(varName in fn.styleMap)) {
                    fn.styleMap[varName] = (fn.counter < fn.styles.length ?
                        fn.styles[fn.counter] : "extra");
                    fn.counter += 1;
                }
                return (prev + "<span class='structuredjs_var " +
                    fn.styleMap[varName] + "'>" + "</span>");
            }
        );
    }
    // Store some properties on the addStyling function to maintain the
    // styleMap between runs if desired.
    // Right now just support 7 different variables. Just add more if needed.
    addStyling.styles = ["one", "two", "three", "four", "five", "six",
        "seven"
    ];
    addStyling.styleMap = {};
    addStyling.counter = 0;

    function getSingleData(node, data) {
        if (!node || node.type !== "Identifier") {
            return;
        }

        if (node.name === "_") {
            if (!data._ || data._.length === 0) {
                throw "No _ data available.";
            }

            return data._.shift();
        } else if (node.name && node.name.indexOf("$") === 0) {
            var name = node.name.slice(1);

            if (!data.vars || !(name in data.vars)) {
                throw "No vars available.";
            }

            return data.vars[name];
        }
    }

    function getGlobData(node, data) {
        var check = node && node.expression || node;

        if (!check || check.type !== "Identifier") {
            return;
        }

        if (check.name === "glob_") {
            if (!data._ || data._.length === 0) {
                throw "No _ data available.";
            }

            return data._.shift();
        } else if (check.name && check.name.indexOf("glob$") === 0) {
            var name = check.name.slice(5);

            if (!data.vars || !(name in data.vars)) {
                throw "No vars available.";
            }

            return data.vars[name];
        }
    }

    function injectData(node, data) {
        if (!node) {
            return node;
        }

        for (var prop in node) {
            if (!node.hasOwnProperty(prop)) {
                continue;
            }

            if (node[prop] && typeof node[prop] === "object" && "length" in node[prop]) {
                for (var i = 0; i < node[prop].length; i++) {
                    var globData = getGlobData(node[prop][i], data);

                    if (globData) {
                        node[prop].splice.apply(node[prop],
                            [i, 1].concat(globData));
                        break;
                    } else if (typeof node[prop][i] === "object") {
                        var singleData = getSingleData(node[prop][i], data);

                        if (singleData) {
                            node[prop][i] = singleData;
                        } else if (typeof node[prop][i] === "object") {
                            injectData(node[prop][i], data);
                        }
                    }
                }
            } else {
                var singleData = getSingleData(node[prop], data);

                if (singleData) {
                    node[prop] = singleData;
                } else if (typeof node[prop] === "object") {
                    injectData(node[prop], data);
                }
            }
        }

        return node;
    }

    exports.match = match;
    exports.matchNode = function(code, rawStructure, options) {
        options = options || {};
        options.single = true;
        return match(code, rawStructure, options);
    };
    exports.injectData = function(node, data) {
        node = parseStructure(node);
        data = deepClone(data);
        return injectData(node, data);
    };
    exports.prettify = prettyHtml;
})(typeof window !== "undefined" ? window : global);
/*
 TraceKit - Cross brower stack traces - github.com/occ/TraceKit
 MIT license
*/

(function(window, undefined) {


var TraceKit = {};
var _oldTraceKit = window.TraceKit;

// global reference to slice
var _slice = [].slice;
var UNKNOWN_FUNCTION = '?';


/**
 * _has, a better form of hasOwnProperty
 * Example: _has(MainHostObject, property) === true/false
 *
 * @param {Object} host object to check property
 * @param {string} key to check
 */
function _has(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}

function _isUndefined(what) {
    return typeof what === 'undefined';
}

/**
 * TraceKit.noConflict: Export TraceKit out to another variable
 * Example: var TK = TraceKit.noConflict()
 */
TraceKit.noConflict = function noConflict() {
    window.TraceKit = _oldTraceKit;
    return TraceKit;
};

/**
 * TraceKit.wrap: Wrap any function in a TraceKit reporter
 * Example: func = TraceKit.wrap(func);
 *
 * @param {Function} func Function to be wrapped
 * @return {Function} The wrapped func
 */
TraceKit.wrap = function traceKitWrapper(func) {
    function wrapped() {
        try {
            return func.apply(this, arguments);
        } catch (e) {
            TraceKit.report(e);
            throw e;
        }
    }
    return wrapped;
};

/**
 * TraceKit.report: cross-browser processing of unhandled exceptions
 *
 * Syntax:
 *   TraceKit.report.subscribe(function(stackInfo) { ... })
 *   TraceKit.report.unsubscribe(function(stackInfo) { ... })
 *   TraceKit.report(exception)
 *   try { ...code... } catch(ex) { TraceKit.report(ex); }
 *
 * Supports:
 *   - Firefox: full stack trace with line numbers, plus column number
 *              on top frame; column number is not guaranteed
 *   - Opera:   full stack trace with line and column numbers
 *   - Chrome:  full stack trace with line and column numbers
 *   - Safari:  line and column number for the top frame only; some frames
 *              may be missing, and column number is not guaranteed
 *   - IE:      line and column number for the top frame only; some frames
 *              may be missing, and column number is not guaranteed
 *
 * In theory, TraceKit should work on all of the following versions:
 *   - IE5.5+ (only 8.0 tested)
 *   - Firefox 0.9+ (only 3.5+ tested)
 *   - Opera 7+ (only 10.50 tested; versions 9 and earlier may require
 *     Exceptions Have Stacktrace to be enabled in opera:config)
 *   - Safari 3+ (only 4+ tested)
 *   - Chrome 1+ (only 5+ tested)
 *   - Konqueror 3.5+ (untested)
 *
 * Requires TraceKit.computeStackTrace.
 *
 * Tries to catch all unhandled exceptions and report them to the
 * subscribed handlers. Please note that TraceKit.report will rethrow the
 * exception. This is REQUIRED in order to get a useful stack trace in IE.
 * If the exception does not reach the top of the browser, you will only
 * get a stack trace from the point where TraceKit.report was called.
 *
 * Handlers receive a stackInfo object as described in the
 * TraceKit.computeStackTrace docs.
 */
TraceKit.report = (function reportModuleWrapper() {
    var handlers = [],
        lastException = null,
        lastExceptionStack = null;

    /**
     * Add a crash handler.
     * @param {Function} handler
     */
    function subscribe(handler) {
        installGlobalHandler();
        handlers.push(handler);
    }

    /**
     * Remove a crash handler.
     * @param {Function} handler
     */
    function unsubscribe(handler) {
        for (var i = handlers.length - 1; i >= 0; --i) {
            if (handlers[i] === handler) {
                handlers.splice(i, 1);
            }
        }
    }

    /**
     * Dispatch stack information to all handlers.
     * @param {Object.<string, *>} stack
     */
    function notifyHandlers(stack, windowError) {
        var exception = null;
        if (windowError && !TraceKit.collectWindowErrors) {
          return;
        }
        for (var i in handlers) {
            if (_has(handlers, i)) {
                try {
                    handlers[i].apply(null, [stack].concat(_slice.call(arguments, 2)));
                } catch (inner) {
                    exception = inner;
                }
            }
        }

        if (exception) {
            throw exception;
        }
    }

    var _oldOnerrorHandler, _onErrorHandlerInstalled;

    /**
     * Ensures all global unhandled exceptions are recorded.
     * Supported by Gecko and IE.
     * @param {string} message Error message.
     * @param {string} url URL of script that generated the exception.
     * @param {(number|string)} lineNo The line number at which the error
     * occurred.
     */
    function traceKitWindowOnError(message, url, lineNo) {
        var stack = null;

        if (lastExceptionStack) {
            TraceKit.computeStackTrace.augmentStackTraceWithInitialElement(lastExceptionStack, url, lineNo, message);
            stack = lastExceptionStack;
            lastExceptionStack = null;
            lastException = null;
        } else {
            var location = {
                'url': url,
                'line': lineNo
            };
            location.func = TraceKit.computeStackTrace.guessFunctionName(location.url, location.line);
            location.context = TraceKit.computeStackTrace.gatherContext(location.url, location.line);
            stack = {
                'mode': 'onerror',
                'message': message,
                'url': document.location.href,
                'stack': [location],
                'useragent': navigator.userAgent
            };
        }

        notifyHandlers(stack, 'from window.onerror');

        if (_oldOnerrorHandler) {
            return _oldOnerrorHandler.apply(this, arguments);
        }

        return false;
    }

    function installGlobalHandler ()
    {
        if (_onErrorHandlerInstalled === true) {
            return;
        }
        _oldOnerrorHandler = window.onerror;
        window.onerror = traceKitWindowOnError;
        _onErrorHandlerInstalled = true;
    }

    /**
     * Reports an unhandled Error to TraceKit.
     * @param {Error} ex
     */
    function report(ex) {
        var args = _slice.call(arguments, 1);
        if (lastExceptionStack) {
            if (lastException === ex) {
                return; // already caught by an inner catch block, ignore
            } else {
                var s = lastExceptionStack;
                lastExceptionStack = null;
                lastException = null;
                notifyHandlers.apply(null, [s, null].concat(args));
            }
        }

        var stack = TraceKit.computeStackTrace(ex);
        lastExceptionStack = stack;
        lastException = ex;

        // If the stack trace is incomplete, wait for 2 seconds for
        // slow slow IE to see if onerror occurs or not before reporting
        // this exception; otherwise, we will end up with an incomplete
        // stack trace
        window.setTimeout(function () {
            if (lastException === ex) {
                lastExceptionStack = null;
                lastException = null;
                notifyHandlers.apply(null, [stack, null].concat(args));
            }
        }, (stack.incomplete ? 2000 : 0));

        throw ex; // re-throw to propagate to the top level (and cause window.onerror)
    }

    report.subscribe = subscribe;
    report.unsubscribe = unsubscribe;
    return report;
}());

/**
 * TraceKit.computeStackTrace: cross-browser stack traces in JavaScript
 *
 * Syntax:
 *   s = TraceKit.computeStackTrace.ofCaller([depth])
 *   s = TraceKit.computeStackTrace(exception) // consider using TraceKit.report instead (see below)
 * Returns:
 *   s.name              - exception name
 *   s.message           - exception message
 *   s.stack[i].url      - JavaScript or HTML file URL
 *   s.stack[i].func     - function name, or empty for anonymous functions (if guessing did not work)
 *   s.stack[i].args     - arguments passed to the function, if known
 *   s.stack[i].line     - line number, if known
 *   s.stack[i].column   - column number, if known
 *   s.stack[i].context  - an array of source code lines; the middle element corresponds to the correct line#
 *   s.mode              - 'stack', 'stacktrace', 'multiline', 'callers', 'onerror', or 'failed' -- method used to collect the stack trace
 *
 * Supports:
 *   - Firefox:  full stack trace with line numbers and unreliable column
 *               number on top frame
 *   - Opera 10: full stack trace with line and column numbers
 *   - Opera 9-: full stack trace with line numbers
 *   - Chrome:   full stack trace with line and column numbers
 *   - Safari:   line and column number for the topmost stacktrace element
 *               only
 *   - IE:       no line numbers whatsoever
 *
 * Tries to guess names of anonymous functions by looking for assignments
 * in the source code. In IE and Safari, we have to guess source file names
 * by searching for function bodies inside all page scripts. This will not
 * work for scripts that are loaded cross-domain.
 * Here be dragons: some function names may be guessed incorrectly, and
 * duplicate functions may be mismatched.
 *
 * TraceKit.computeStackTrace should only be used for tracing purposes.
 * Logging of unhandled exceptions should be done with TraceKit.report,
 * which builds on top of TraceKit.computeStackTrace and provides better
 * IE support by utilizing the window.onerror event to retrieve information
 * about the top of the stack.
 *
 * Note: In IE and Safari, no stack trace is recorded on the Error object,
 * so computeStackTrace instead walks its *own* chain of callers.
 * This means that:
 *  * in Safari, some methods may be missing from the stack trace;
 *  * in IE, the topmost function in the stack trace will always be the
 *    caller of computeStackTrace.
 *
 * This is okay for tracing (because you are likely to be calling
 * computeStackTrace from the function you want to be the topmost element
 * of the stack trace anyway), but not okay for logging unhandled
 * exceptions (because your catch block will likely be far away from the
 * inner function that actually caused the exception).
 *
 * Tracing example:
 *     function trace(message) {
 *         var stackInfo = TraceKit.computeStackTrace.ofCaller();
 *         var data = message + "\n";
 *         for(var i in stackInfo.stack) {
 *             var item = stackInfo.stack[i];
 *             data += (item.func || '[anonymous]') + "() in " + item.url + ":" + (item.line || '0') + "\n";
 *         }
 *         if (window.console)
 *             console.info(data);
 *         else
 *             alert(data);
 *     }
 */
TraceKit.computeStackTrace = (function computeStackTraceWrapper() {
    var debug = false,
        sourceCache = {};

    /**
     * Attempts to retrieve source code via XMLHttpRequest, which is used
     * to look up anonymous function names.
     * @param {string} url URL of source code.
     * @return {string} Source contents.
     */
    function loadSource(url) {
        if (!TraceKit.remoteFetching) { //Only attempt request if remoteFetching is on.
            return '';
        }
        try {
            var getXHR = function() {
                try {
                    return new window.XMLHttpRequest();
                } catch (e) {
                    // explicitly bubble up the exception if not found
                    return new window.ActiveXObject('Microsoft.XMLHTTP');
                }
            };

            var request = getXHR();
            request.open('GET', url, false);
            request.send('');
            return request.responseText;
        } catch (e) {
            return '';
        }
    }

    /**
     * Retrieves source code from the source code cache.
     * @param {string} url URL of source code.
     * @return {Array.<string>} Source contents.
     */
    function getSource(url) {
        if (!_has(sourceCache, url)) {
            // URL needs to be able to fetched within the acceptable domain.  Otherwise,
            // cross-domain errors will be triggered.
            var source = '';
            if (url.indexOf(document.domain) !== -1) {
                source = loadSource(url);
            }
            sourceCache[url] = source ? source.split('\n') : [];
        }

        return sourceCache[url];
    }

    /**
     * Tries to use an externally loaded copy of source code to determine
     * the name of a function by looking at the name of the variable it was
     * assigned to, if any.
     * @param {string} url URL of source code.
     * @param {(string|number)} lineNo Line number in source code.
     * @return {string} The function name, if discoverable.
     */
    function guessFunctionName(url, lineNo) {
        var reFunctionArgNames = /function ([^(]*)\(([^)]*)\)/,
            reGuessFunction = /['"]?([0-9A-Za-z$_]+)['"]?\s*[:=]\s*(function|eval|new Function)/,
            line = '',
            maxLines = 10,
            source = getSource(url),
            m;

        if (!source.length) {
            return UNKNOWN_FUNCTION;
        }

        // Walk backwards from the first line in the function until we find the line which
        // matches the pattern above, which is the function definition
        for (var i = 0; i < maxLines; ++i) {
            line = source[lineNo - i] + line;

            if (!_isUndefined(line)) {
                if ((m = reGuessFunction.exec(line))) {
                    return m[1];
                } else if ((m = reFunctionArgNames.exec(line))) {
                    return m[1];
                }
            }
        }

        return UNKNOWN_FUNCTION;
    }

    /**
     * Retrieves the surrounding lines from where an exception occurred.
     * @param {string} url URL of source code.
     * @param {(string|number)} line Line number in source code to centre
     * around for context.
     * @return {?Array.<string>} Lines of source code.
     */
    function gatherContext(url, line) {
        var source = getSource(url);

        if (!source.length) {
            return null;
        }

        var context = [],
            // linesBefore & linesAfter are inclusive with the offending line.
            // if linesOfContext is even, there will be one extra line
            //   *before* the offending line.
            linesBefore = Math.floor(TraceKit.linesOfContext / 2),
            // Add one extra line if linesOfContext is odd
            linesAfter = linesBefore + (TraceKit.linesOfContext % 2),
            start = Math.max(0, line - linesBefore - 1),
            end = Math.min(source.length, line + linesAfter - 1);

        line -= 1; // convert to 0-based index

        for (var i = start; i < end; ++i) {
            if (!_isUndefined(source[i])) {
                context.push(source[i]);
            }
        }

        return context.length > 0 ? context : null;
    }

    /**
     * Escapes special characters, except for whitespace, in a string to be
     * used inside a regular expression as a string literal.
     * @param {string} text The string.
     * @return {string} The escaped string literal.
     */
    function escapeRegExp(text) {
        return text.replace(/[\-\[\]{}()*+?.,\\\^$|#]/g, '\\$&');
    }

    /**
     * Escapes special characters in a string to be used inside a regular
     * expression as a string literal. Also ensures that HTML entities will
     * be matched the same as their literal friends.
     * @param {string} body The string.
     * @return {string} The escaped string.
     */
    function escapeCodeAsRegExpForMatchingInsideHTML(body) {
        return escapeRegExp(body).replace('<', '(?:<|&lt;)').replace('>', '(?:>|&gt;)').replace('&', '(?:&|&amp;)').replace('"', '(?:"|&quot;)').replace(/\s+/g, '\\s+');
    }

    /**
     * Determines where a code fragment occurs in the source code.
     * @param {RegExp} re The function definition.
     * @param {Array.<string>} urls A list of URLs to search.
     * @return {?Object.<string, (string|number)>} An object containing
     * the url, line, and column number of the defined function.
     */
    function findSourceInUrls(re, urls) {
        var source, m;
        for (var i = 0, j = urls.length; i < j; ++i) {
            // console.log('searching', urls[i]);
            if ((source = getSource(urls[i])).length) {
                source = source.join('\n');
                if ((m = re.exec(source))) {
                    // console.log('Found function in ' + urls[i]);

                    return {
                        'url': urls[i],
                        'line': source.substring(0, m.index).split('\n').length,
                        'column': m.index - source.lastIndexOf('\n', m.index) - 1
                    };
                }
            }
        }

        // console.log('no match');

        return null;
    }

    /**
     * Determines at which column a code fragment occurs on a line of the
     * source code.
     * @param {string} fragment The code fragment.
     * @param {string} url The URL to search.
     * @param {(string|number)} line The line number to examine.
     * @return {?number} The column number.
     */
    function findSourceInLine(fragment, url, line) {
        var source = getSource(url),
            re = new RegExp('\\b' + escapeRegExp(fragment) + '\\b'),
            m;

        line -= 1;

        if (source && source.length > line && (m = re.exec(source[line]))) {
            return m.index;
        }

        return null;
    }

    /**
     * Determines where a function was defined within the source code.
     * @param {(Function|string)} func A function reference or serialized
     * function definition.
     * @return {?Object.<string, (string|number)>} An object containing
     * the url, line, and column number of the defined function.
     */
    function findSourceByFunctionBody(func) {
        var urls = [window.location.href],
            scripts = document.getElementsByTagName('script'),
            body,
            code = '' + func,
            codeRE = /^function(?:\s+([\w$]+))?\s*\(([\w\s,]*)\)\s*\{\s*(\S[\s\S]*\S)\s*\}\s*$/,
            eventRE = /^function on([\w$]+)\s*\(event\)\s*\{\s*(\S[\s\S]*\S)\s*\}\s*$/,
            re,
            parts,
            result;

        for (var i = 0; i < scripts.length; ++i) {
            var script = scripts[i];
            if (script.src) {
                urls.push(script.src);
            }
        }

        if (!(parts = codeRE.exec(code))) {
            re = new RegExp(escapeRegExp(code).replace(/\s+/g, '\\s+'));
        }

        // not sure if this is really necessary, but I don’t have a test
        // corpus large enough to confirm that and it was in the original.
        else {
            var name = parts[1] ? '\\s+' + parts[1] : '',
                args = parts[2].split(',').join('\\s*,\\s*');

            body = escapeRegExp(parts[3]).replace(/;$/, ';?'); // semicolon is inserted if the function ends with a comment.replace(/\s+/g, '\\s+');
            re = new RegExp('function' + name + '\\s*\\(\\s*' + args + '\\s*\\)\\s*{\\s*' + body + '\\s*}');
        }

        // look for a normal function definition
        if ((result = findSourceInUrls(re, urls))) {
            return result;
        }

        // look for an old-school event handler function
        if ((parts = eventRE.exec(code))) {
            var event = parts[1];
            body = escapeCodeAsRegExpForMatchingInsideHTML(parts[2]);

            // look for a function defined in HTML as an onXXX handler
            re = new RegExp('on' + event + '=[\\\'"]\\s*' + body + '\\s*[\\\'"]', 'i');

            if ((result = findSourceInUrls(re, urls[0]))) {
                return result;
            }

            // look for ???
            re = new RegExp(body);

            if ((result = findSourceInUrls(re, urls))) {
                return result;
            }
        }

        return null;
    }

    // Contents of Exception in various browsers.
    //
    // SAFARI:
    // ex.message = Can't find variable: qq
    // ex.line = 59
    // ex.sourceId = 580238192
    // ex.sourceURL = http://...
    // ex.expressionBeginOffset = 96
    // ex.expressionCaretOffset = 98
    // ex.expressionEndOffset = 98
    // ex.name = ReferenceError
    //
    // FIREFOX:
    // ex.message = qq is not defined
    // ex.fileName = http://...
    // ex.lineNumber = 59
    // ex.stack = ...stack trace... (see the example below)
    // ex.name = ReferenceError
    //
    // CHROME:
    // ex.message = qq is not defined
    // ex.name = ReferenceError
    // ex.type = not_defined
    // ex.arguments = ['aa']
    // ex.stack = ...stack trace...
    //
    // INTERNET EXPLORER:
    // ex.message = ...
    // ex.name = ReferenceError
    //
    // OPERA:
    // ex.message = ...message... (see the example below)
    // ex.name = ReferenceError
    // ex.opera#sourceloc = 11  (pretty much useless, duplicates the info in ex.message)
    // ex.stacktrace = n/a; see 'opera:config#UserPrefs|Exceptions Have Stacktrace'

    /**
     * Computes stack trace information from the stack property.
     * Chrome and Gecko use this property.
     * @param {Error} ex
     * @return {?Object.<string, *>} Stack trace information.
     */
    function computeStackTraceFromStackProp(ex) {
        if (!ex.stack) {
            return null;
        }

        var url = "\\(?((?:file|http|https):.*?):(\\d+)(?::(\\d+))?\\)?";
        var chrome = new RegExp("^\\s*at (?:((?:\\[object object\\])?\\S+(?: \\[as \\S+\\])?) )?(?:\\(eval at \\S+ " + url + ", (.*?):(\\d+)(?::(\\d+))?\\)|" + url + ")\\s*$", i),
            gecko = /^\s*(\S*)(?:\((.*?)\))?@((?:file|http|https).*?):(\d+)(?::(\d+))?\s*$/i,
            lines = ex.stack.split('\n'),
            stack = [],
            parts,
            element,
            reference = /^(.*) is undefined$/.exec(ex.message);

        for (var i = 0, j = lines.length; i < j; ++i) {
            if ((parts = gecko.exec(lines[i]))) {
                element = {
                    'url': parts[3],
                    'func': parts[1] || UNKNOWN_FUNCTION,
                    'args': parts[2] ? parts[2].split(',') : '',
                    'line': +parts[4],
                    'column': parts[5] ? +parts[5] : null
                };
            } else if ((parts = chrome.exec(lines[i]))) {
               if(parts[5] !== undefined) {
                  element = {
                    'url': parts[5],
                    'func': parts[1] || 'unknown',
                    'line': +parts[6],
                    'column': parts[7] ? +parts[7] : null
                  };
                } else {
                  element = {
                    'url': parts[8],
                    'func': parts[1] || 'unknown',
                    'line': +parts[9],
                    'column': parts[10] ? +parts[10] : null
                  };
               }
            } else {
                continue;
            }

            if (!element.func && element.line) {
                element.func = guessFunctionName(element.url, element.line);
            }

            if (element.line) {
                element.context = gatherContext(element.url, element.line);
            }

            stack.push(element);
        }

        if (stack[0] && stack[0].line && !stack[0].column && reference) {
            stack[0].column = findSourceInLine(reference[1], stack[0].url, stack[0].line);
        }

        if (!stack.length) {
            return null;
        }

        return {
            'mode': 'stack',
            'name': ex.name,
            'message': ex.message,
            'url': document.location.href,
            'stack': stack,
            'useragent': navigator.userAgent
        };
    }

    /**
     * Computes stack trace information from the stacktrace property.
     * Opera 10 uses this property.
     * @param {Error} ex
     * @return {?Object.<string, *>} Stack trace information.
     */
    function computeStackTraceFromStacktraceProp(ex) {
        // Access and store the stacktrace property before doing ANYTHING
        // else to it because Opera is not very good at providing it
        // reliably in other circumstances.
        var stacktrace = ex.stacktrace;

        var testRE = / line (\d+), column (\d+) in (?:<anonymous function: ([^>]+)>|([^\)]+))\((.*)\) in (.*):\s*$/i,
            lines = stacktrace.split('\n'),
            stack = [],
            parts;

        for (var i = 0, j = lines.length; i < j; i += 2) {
            if ((parts = testRE.exec(lines[i]))) {
                var element = {
                    'line': +parts[1],
                    'column': +parts[2],
                    'func': parts[3] || parts[4],
                    'args': parts[5] ? parts[5].split(',') : [],
                    'url': parts[6]
                };

                if (!element.func && element.line) {
                    element.func = guessFunctionName(element.url, element.line);
                }
                if (element.line) {
                    try {
                        element.context = gatherContext(element.url, element.line);
                    } catch (exc) {}
                }

                if (!element.context) {
                    element.context = [lines[i + 1]];
                }

                stack.push(element);
            }
        }

        if (!stack.length) {
            return null;
        }

        return {
            'mode': 'stacktrace',
            'name': ex.name,
            'message': ex.message,
            'url': document.location.href,
            'stack': stack,
            'useragent': navigator.userAgent
        };
    }

    /**
     * NOT TESTED.
     * Computes stack trace information from an error message that includes
     * the stack trace.
     * Opera 9 and earlier use this method if the option to show stack
     * traces is turned on in opera:config.
     * @param {Error} ex
     * @return {?Object.<string, *>} Stack information.
     */
    function computeStackTraceFromOperaMultiLineMessage(ex) {
        // Opera includes a stack trace into the exception message. An example is:
        //
        // Statement on line 3: Undefined variable: undefinedFunc
        // Backtrace:
        //   Line 3 of linked script file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.js: In function zzz
        //         undefinedFunc(a);
        //   Line 7 of inline#1 script in file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.html: In function yyy
        //           zzz(x, y, z);
        //   Line 3 of inline#1 script in file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.html: In function xxx
        //           yyy(a, a, a);
        //   Line 1 of function script
        //     try { xxx('hi'); return false; } catch(ex) { TraceKit.report(ex); }
        //   ...

        var lines = ex.message.split('\n');
        if (lines.length < 4) {
            return null;
        }

        var lineRE1 = /^\s*Line (\d+) of linked script ((?:file|http|https)\S+)(?:: in function (\S+))?\s*$/i,
            lineRE2 = /^\s*Line (\d+) of inline#(\d+) script in ((?:file|http|https)\S+)(?:: in function (\S+))?\s*$/i,
            lineRE3 = /^\s*Line (\d+) of function script\s*$/i,
            stack = [],
            scripts = document.getElementsByTagName('script'),
            inlineScriptBlocks = [],
            parts,
            i,
            len,
            source;

        for (i in scripts) {
            if (_has(scripts, i) && !scripts[i].src) {
                inlineScriptBlocks.push(scripts[i]);
            }
        }

        for (i = 2, len = lines.length; i < len; i += 2) {
            var item = null;
            if ((parts = lineRE1.exec(lines[i]))) {
                item = {
                    'url': parts[2],
                    'func': parts[3],
                    'line': +parts[1]
                };
            } else if ((parts = lineRE2.exec(lines[i]))) {
                item = {
                    'url': parts[3],
                    'func': parts[4]
                };
                var relativeLine = (+parts[1]); // relative to the start of the <SCRIPT> block
                var script = inlineScriptBlocks[parts[2] - 1];
                if (script) {
                    source = getSource(item.url);
                    if (source) {
                        source = source.join('\n');
                        var pos = source.indexOf(script.innerText);
                        if (pos >= 0) {
                            item.line = relativeLine + source.substring(0, pos).split('\n').length;
                        }
                    }
                }
            } else if ((parts = lineRE3.exec(lines[i]))) {
                var url = window.location.href.replace(/#.*$/, ''),
                    line = parts[1];
                var re = new RegExp(escapeCodeAsRegExpForMatchingInsideHTML(lines[i + 1]));
                source = findSourceInUrls(re, [url]);
                item = {
                    'url': url,
                    'line': source ? source.line : line,
                    'func': ''
                };
            }

            if (item) {
                if (!item.func) {
                    item.func = guessFunctionName(item.url, item.line);
                }
                var context = gatherContext(item.url, item.line);
                var midline = (context ? context[Math.floor(context.length / 2)] : null);
                if (context && midline.replace(/^\s*/, '') === lines[i + 1].replace(/^\s*/, '')) {
                    item.context = context;
                } else {
                    // if (context) alert("Context mismatch. Correct midline:\n" + lines[i+1] + "\n\nMidline:\n" + midline + "\n\nContext:\n" + context.join("\n") + "\n\nURL:\n" + item.url);
                    item.context = [lines[i + 1]];
                }
                stack.push(item);
            }
        }
        if (!stack.length) {
            return null; // could not parse multiline exception message as Opera stack trace
        }

        return {
            'mode': 'multiline',
            'name': ex.name,
            'message': lines[0],
            'url': document.location.href,
            'stack': stack,
            'useragent': navigator.userAgent
        };
    }

    /**
     * Adds information about the first frame to incomplete stack traces.
     * Safari and IE require this to get complete data on the first frame.
     * @param {Object.<string, *>} stackInfo Stack trace information from
     * one of the compute* methods.
     * @param {string} url The URL of the script that caused an error.
     * @param {(number|string)} lineNo The line number of the script that
     * caused an error.
     * @param {string=} message The error generated by the browser, which
     * hopefully contains the name of the object that caused the error.
     * @return {boolean} Whether or not the stack information was
     * augmented.
     */
    function augmentStackTraceWithInitialElement(stackInfo, url, lineNo, message) {
        var initial = {
            'url': url,
            'line': lineNo
        };

        if (initial.url && initial.line) {
            stackInfo.incomplete = false;

            if (!initial.func) {
                initial.func = guessFunctionName(initial.url, initial.line);
            }

            if (!initial.context) {
                initial.context = gatherContext(initial.url, initial.line);
            }

            var reference = / '([^']+)' /.exec(message);
            if (reference) {
                initial.column = findSourceInLine(reference[1], initial.url, initial.line);
            }

            if (stackInfo.stack.length > 0) {
                if (stackInfo.stack[0].url === initial.url) {
                    if (stackInfo.stack[0].line === initial.line) {
                        return false; // already in stack trace
                    } else if (!stackInfo.stack[0].line && stackInfo.stack[0].func === initial.func) {
                        stackInfo.stack[0].line = initial.line;
                        stackInfo.stack[0].context = initial.context;
                        return false;
                    }
                }
            }

            stackInfo.stack.unshift(initial);
            stackInfo.partial = true;
            return true;
        } else {
            stackInfo.incomplete = true;
        }

        return false;
    }

    /**
     * Computes stack trace information by walking the arguments.caller
     * chain at the time the exception occurred. This will cause earlier
     * frames to be missed but is the only way to get any stack trace in
     * Safari and IE. The top frame is restored by
     * {@link augmentStackTraceWithInitialElement}.
     * @param {Error} ex
     * @return {?Object.<string, *>} Stack trace information.
     */
    function computeStackTraceByWalkingCallerChain(ex, depth) {
        var functionName = /function\s+([_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)?\s*\(/i,
            stack = [],
            funcs = {},
            recursion = false,
            parts,
            item,
            source;

        for (var curr = computeStackTraceByWalkingCallerChain.caller; curr && !recursion; curr = curr.caller) {
            if (curr === computeStackTrace || curr === TraceKit.report) {
                // console.log('skipping internal function');
                continue;
            }

            item = {
                'url': null,
                'func': UNKNOWN_FUNCTION,
                'line': null,
                'column': null
            };

            if (curr.name) {
                item.func = curr.name;
            } else if ((parts = functionName.exec(curr.toString()))) {
                item.func = parts[1];
            }

            if ((source = findSourceByFunctionBody(curr))) {
                item.url = source.url;
                item.line = source.line;

                if (item.func === UNKNOWN_FUNCTION) {
                    item.func = guessFunctionName(item.url, item.line);
                }

                var reference = / '([^']+)' /.exec(ex.message || ex.description);
                if (reference) {
                    item.column = findSourceInLine(reference[1], source.url, source.line);
                }
            }

            if (funcs['' + curr]) {
                recursion = true;
            }else{
                funcs['' + curr] = true;
            }

            stack.push(item);
        }

        if (depth) {
            // console.log('depth is ' + depth);
            // console.log('stack is ' + stack.length);
            stack.splice(0, depth);
        }

        var result = {
            'mode': 'callers',
            'name': ex.name,
            'message': ex.message,
            'url': document.location.href,
            'stack': stack,
            'useragent': navigator.userAgent
        };
        augmentStackTraceWithInitialElement(result, ex.sourceURL || ex.fileName, ex.line || ex.lineNumber, ex.message || ex.description);
        return result;
    }

    /**
     * Computes a stack trace for an exception.
     * @param {Error} ex
     * @param {(string|number)=} depth
     */
    function computeStackTrace(ex, depth) {
        var stack = null;
        depth = (depth == null ? 0 : +depth);

        try {
            // This must be tried first because Opera 10 *destroys*
            // its stacktrace property if you try to access the stack
            // property first!!
            stack = computeStackTraceFromStacktraceProp(ex);
            if (stack) {
                return stack;
            }
        } catch (e) {
            if (debug) {
                throw e;
            }
        }

        try {
            stack = computeStackTraceFromStackProp(ex);
            if (stack) {
                return stack;
            }
        } catch (e) {
            if (debug) {
                throw e;
            }
        }

        try {
            stack = computeStackTraceFromOperaMultiLineMessage(ex);
            if (stack) {
                return stack;
            }
        } catch (e) {
            if (debug) {
                throw e;
            }
        }

        try {
            stack = computeStackTraceByWalkingCallerChain(ex, depth + 1);
            if (stack) {
                return stack;
            }
        } catch (e) {
            if (debug) {
                throw e;
            }
        }

        return {
            'mode': 'failed'
        };
    }

    /**
     * Logs a stacktrace starting from the previous call and working down.
     * @param {(number|string)=} depth How many frames deep to trace.
     * @return {Object.<string, *>} Stack trace information.
     */
    function computeStackTraceOfCaller(depth) {
        depth = (depth == null ? 0 : +depth) + 1; // "+ 1" because "ofCaller" should drop one frame
        try {
            throw new Error();
        } catch (ex) {
            return computeStackTrace(ex, depth + 1);
        }
    }

    computeStackTrace.augmentStackTraceWithInitialElement = augmentStackTraceWithInitialElement;
    computeStackTrace.guessFunctionName = guessFunctionName;
    computeStackTrace.gatherContext = gatherContext;
    computeStackTrace.ofCaller = computeStackTraceOfCaller;

    return computeStackTrace;
}());

/**
 * Extends support for global error handling for asynchronous browser
 * functions. Adopted from Closure Library's errorhandler.js
 */
(function extendToAsynchronousCallbacks() {
    var _helper = function _helper(fnName) {
        var originalFn = window[fnName];
        window[fnName] = function traceKitAsyncExtension() {
            // Make a copy of the arguments
            var args = _slice.call(arguments);
            var originalCallback = args[0];
            if (typeof (originalCallback) === 'function') {
                args[0] = TraceKit.wrap(originalCallback);
            }
            // IE < 9 doesn't support .call/.apply on setInterval/setTimeout, but it
            // also only supports 2 argument and doesn't care what "this" is, so we
            // can just call the original function directly.
            if (originalFn.apply) {
                return originalFn.apply(this, args);
            } else {
                return originalFn(args[0], args[1]);
            }
        };
    };

    _helper('setTimeout');
    _helper('setInterval');
}());

//Default options:
if (!TraceKit.remoteFetching) {
  TraceKit.remoteFetching = true;
}
if (!TraceKit.collectWindowErrors) {
  TraceKit.collectWindowErrors = true;
}
if (!TraceKit.linesOfContext || TraceKit.linesOfContext < 1) {
  // 5 lines before, the offending line, 5 lines after
  TraceKit.linesOfContext = 11;
}



// Export to global object
window.TraceKit = TraceKit;

}(window));
