import ExportType from "./ExportType.js";

/**
 * Content to be passed to a {@link Test}.
 * @typedef {Object} TestData
 * @property {string} bubbleDescription A description of the input bubbles being passed to the test.
 * @property {string} exportDescription A description of the expected output from the test.
 * @property {string[]} bubbleContents An array containing the `bubbleContentElement.innerHTML` of each bubble to be tested.
 * @property {string[]} importContents An array containing the expected `bubbleContentElement.innerHTML` of each bubble after import.
 * @property {Object.string} exportFormats An object of strings containing the expected export formats for the test.
 */

/**
 * An array of {@link TestData}.
 * @type {TestData[]}
 */
export default [
  {
    bubbleDescription: "Single-line bubble",
    exportDescription: "Single-line text node",
    bubbleContents: ["<div>a</div>"],
    importContents: ["<div>a</div>"],
    exportFormats: {
      MSYT: '      - text: "a"',
      TOTKNXEditor: "  a",
      TOTKMSBTEditor: "a"
    }
  },
  {
    bubbleDescription: "Wrapping single-word bubble",
    exportDescription: "Multi-line text node",
    bubbleContents: ["<div>llamallamallamallamallamallamallamallamallama</div>"],
    importContents: ["<div>llamallamallamallamallamallamallamallamal</div><div>lama</div>"],
    exportFormats: {
      MSYT: '      - text: "llamallamallamallamallamallamallamallamal\\nlama"',
      TOTKNXEditor: "  llamallamallamallamallamallamallamallamal\n  lama",
      TOTKMSBTEditor: "llamallamallamallamallamallamallamallamal\nlama"
    }
  },
  {
    bubbleDescription: "Wrapping single-line bubble",
    exportDescription: "Multi-line text node",
    bubbleContents: [
      "<div>What they don't know is that we added one of those fancy switches to open the gate. We can access the room anytime...</div>"
    ],
    importContents: [
      "<div>What they don't know is that we added</div><div>one of those fancy switches to open the</div><div>gate. We can access the room anytime...</div>"
    ],
    exportFormats: {
      MSYT: '      - text: "What they don\'t know is that we added\\none of those fancy switches to open the\\ngate. We can access the room anytime..."',
      TOTKNXEditor:
        "  What they don't know is that we added\n  one of those fancy switches to open the\n  gate. We can access the room anytime...",
      TOTKMSBTEditor:
        "What they don't know is that we added\none of those fancy switches to open the\ngate. We can access the room anytime..."
    }
  },
  {
    bubbleDescription: "Single-line bubble wrapped on hyphen",
    exportDescription: "Single-line text node",
    bubbleContents: ["<div>This is our final hour. All of this sword-swinging, arrow-slinging, bomb-flinging nonsense ends today!</div>"],
    importContents: [
      "<div>This is our final hour. All of this sword-</div><div>swinging, arrow-slinging, bomb-flinging</div><div>nonsense ends today!</div>"
    ],
    exportFormats: {
      MSYT: '      - text: "This is our final hour. All of this sword-\\nswinging, arrow-slinging, bomb-flinging\\nnonsense ends today!"',
      TOTKNXEditor: "  This is our final hour. All of this sword-\n  swinging, arrow-slinging, bomb-flinging\n  nonsense ends today!",
      TOTKMSBTEditor: "This is our final hour. All of this sword-\nswinging, arrow-slinging, bomb-flinging\nnonsense ends today!"
    }
  },
  {
    bubbleDescription: "Manual two-line bubble",
    exportDescription: "Two-line text node",
    bubbleContents: ["<div>a</div><div>a<br></div>"],
    importContents: ["<div>a</div><div>a</div>"],
    exportFormats: {
      MSYT: '      - text: "a\\na"',
      TOTKNXEditor: "  a\n  a",
      TOTKMSBTEditor: "a\na"
    }
  },
  {
    bubbleDescription: "Pasted two-line bubble",
    exportDescription: "Two-line text node",
    bubbleContents: ["<div>a<br>a</div>"],
    importContents: ["<div>a</div><div>a</div>"],
    exportFormats: {
      MSYT: '      - text: "a\\na"',
      TOTKNXEditor: "  a\n  a",
      TOTKMSBTEditor: "a\na"
    }
  },
  {
    bubbleDescription: "Pasted three-line bubble",
    exportDescription: "Three-line text node",
    bubbleContents: [
      "<div>What they don't know is that we added<br>one of those fancy switches to open the<br>gate. We can access the room anytime...</div>"
    ],
    importContents: [
      "<div>What they don't know is that we added</div><div>one of those fancy switches to open the</div><div>gate. We can access the room anytime...</div>"
    ],
    exportFormats: {
      MSYT: '      - text: "What they don\'t know is that we added\\none of those fancy switches to open the\\ngate. We can access the room anytime..."',
      TOTKNXEditor:
        "  What they don't know is that we added\n  one of those fancy switches to open the\n  gate. We can access the room anytime...",
      TOTKMSBTEditor:
        "What they don't know is that we added\none of those fancy switches to open the\ngate. We can access the room anytime..."
    }
  },
  {
    bubbleDescription: "Manual three-line bubble",
    exportDescription: "Three-line text node",
    bubbleContents: ["<div>a</div><div>a</div><div>a<br></div>"],
    importContents: ["<div>a</div><div>a</div><div>a</div>"],
    exportFormats: {
      MSYT: '      - text: "a\\na\\na"',
      TOTKNXEditor: "  a\n  a\n  a",
      TOTKMSBTEditor: "a\na\na"
    }
  },
  {
    bubbleDescription: "Three-line bubble (one manual, one wrapping)",
    exportDescription: "Three-line text node",
    bubbleContents: ["<div>a</div><div>llamallamallamallamallamallamallamallamallama<br></div>"],
    importContents: ["<div>a</div><div>llamallamallamallamallamallamallamallamal</div><div>lama</div>"],
    exportFormats: {
      MSYT: '      - text: "a\\nllamallamallamallamallamallamallamallamal\\nlama"',
      TOTKNXEditor: "  a\n  llamallamallamallamallamallamallamallamal\n  lama",
      TOTKMSBTEditor: "a\nllamallamallamallamallamallamallamallamal\nlama"
    }
  },
  {
    bubbleDescription: "Three-line bubble (one manual, one wrapping) with control nodes",
    exportDescription: "Three-line text node with control nodes",
    bubbleContents: [
      '<div><span data-color="red">aaaaaaa</span>aaaaaa</div><div><span data-size="125">llamallamallamallam</span>allamallama<span data-pause="short"></span>llamallamallama<br></div>'
    ],
    importContents: [
      '<div><span data-color="red">aaaaaaa</span>aaaaaa</div><div><span data-size="125">llamallamallamallam</span>allamallama<span contenteditable="false" data-pause="short" title="Pause (short)"><span class="node-select"></span></span>llamal</div><div>lamallama</div>'
    ],
    exportFormats: {
      MSYT:
        "      - control:\n" +
        "          kind: set_colour\n" +
        "          colour: red\n" +
        '      - text: "aaaaaaa"\n' +
        "      - control:\n" +
        "          kind: reset_colour\n" +
        '      - text: "aaaaaa\\n"\n' +
        "      - control:\n" +
        "          kind: text_size\n" +
        "          percent: 125\n" +
        '      - text: "llamallamallamallam"\n' +
        "      - control:\n" +
        "          kind: text_size\n" +
        "          percent: 100\n" +
        '      - text: "allamallama"\n' +
        "      - control:\n" +
        "          kind: pause\n" +
        "          length: short\n" +
        '      - text: "llamal\\nlamallama"',
      TOTKNXEditor:
        "  <0 Type='3' Data='0000'/>aaaaaaa<0 Type='3' Data='ffff'/>aaaaaa\n  <0 Type='2' Data='7d00'/>llamallamallamallam<0 Type='2' Data='6400'/>allamallama<5 Type='0'/>llamal\n  lamallama",
      TOTKMSBTEditor:
        '{{color id="Orange"}}aaaaaaa{{color id="Default"}}aaaaaa\n{{size value="125"}}llamallamallamallam{{size value="100"}}allamallama{{delay8}}llamal\nlamallama'
    }
  },
  {
    bubbleDescription: "Single-line bubble with custom-length pause node",
    exportDescription: "Single-line text node with pause control node",
    bubbleContents: ['<div>Just your average bubble...<span data-pause="25"></span></div>'],
    importContents: [
      '<div>Just your average bubble...<span contenteditable="false" data-pause="25" title="Pause (25 frames)"><span class="node-select"></span></span></div>'
    ],
    exportFormats: {
      MSYT: '      - text: "Just your average bubble..."\n      - control:\n          kind: pause\n          frames: 25',
      TOTKNXEditor: "  Just your average bubble...<1 Type='0' Data='1900'/>",
      TOTKMSBTEditor: 'Just your average bubble...{{delay frames="25"}}'
    }
  },
  {
    bubbleDescription: "Wrapping single-line bubble with control node at wrap",
    exportDescription: "Two-line text node",
    bubbleContents: [
      '<div>Looks like you need one of my <span data-color="blue">specialty </span></div><div>services! So what\'ll it be?</div>'
    ],
    importContents: [
      '<div>Looks like you need one of my <span data-color="blue">specialty </span></div><div>services! So what\'ll it be?</div>'
    ],
    exportFormats: {
      MSYT: '      - text: "Looks like you need one of my "\n      - control:\n          kind: set_colour\n          colour: blue\n      - text: "specialty \\n"\n      - control:\n          kind: reset_colour\n      - text: "services! So what\'ll it be?"',
      TOTKNXEditor:
        "  Looks like you need one of my <0 Type='3' Data='0100'/>specialty \n  <0 Type='3' Data='ffff'/>services! So what'll it be?",
      TOTKMSBTEditor: 'Looks like you need one of my {{color id="Cyan"}}specialty \n{{color id="Default"}}services! So what\'ll it be?'
    }
  },
  {
    bubbleDescription: "Single-line bubble with nested control nodes",
    exportDescription: "Single-line text node with nested control nodes",
    bubbleContents: [
      '<div>Lots <span data-color="blue">of</span><span data-color="red"> </span><span data-color="red" data-size="125">con</span><span data-color="blue">t</span><span data-color="blue" data-size="80">r</span><span data-color="red" data-size="80">o</span><span data-color="red">l n</span><span data-color="red" data-size="125">o</span><span data-size="125">d</span>es</div>'
    ],
    importContents: [
      '<div>Lots <span data-color="blue">of</span><span data-color="red"> </span><span data-color="red" data-size="125">con</span><span data-color="blue">t</span><span data-color="blue" data-size="80">r</span><span data-color="red" data-size="80">o</span><span data-color="red">l n</span><span data-color="red" data-size="125">o</span><span data-size="125">d</span>es</div>'
    ],
    exportFormats: {
      MSYT: '      - text: "Lots "\n      - control:\n          kind: set_colour\n          colour: blue\n      - text: "of"\n      - control:\n          kind: set_colour\n          colour: red\n      - text: " "\n      - control:\n          kind: text_size\n          percent: 125\n      - text: "con"\n      - control:\n          kind: set_colour\n          colour: blue\n      - control:\n          kind: text_size\n          percent: 100\n      - text: "t"\n      - control:\n          kind: text_size\n          percent: 80\n      - text: "r"\n      - control:\n          kind: set_colour\n          colour: red\n      - text: "o"\n      - control:\n          kind: text_size\n          percent: 100\n      - text: "l n"\n      - control:\n          kind: text_size\n          percent: 125\n      - text: "o"\n      - control:\n          kind: reset_colour\n      - text: "d"\n      - control:\n          kind: text_size\n          percent: 100\n      - text: "es"',
      TOTKNXEditor:
        "  Lots <0 Type='3' Data='0100'/>of<0 Type='3' Data='0000'/> <0 Type='2' Data='7d00'/>con<0 Type='3' Data='0100'/><0 Type='2' Data='6400'/>t<0 Type='2' Data='5000'/>r<0 Type='3' Data='0000'/>o<0 Type='2' Data='6400'/>l n<0 Type='2' Data='7d00'/>o<0 Type='3' Data='ffff'/>d<0 Type='2' Data='6400'/>es",
      TOTKMSBTEditor:
        'Lots {{color id="Cyan"}}of{{color id="Orange"}} {{size value="125"}}con{{color id="Cyan"}}{{size value="100"}}t{{size value="80"}}r{{color id="Orange"}}o{{size value="100"}}l n{{size value="125"}}o{{color id="Default"}}d{{size value="100"}}es'
    }
  },
  {
    bubbleDescription: "Two single-line bubbles",
    exportDescription: "Two-bubble text node",
    bubbleContents: ["<div>a</div>", "<div>a</div>"],
    importContents: ["<div>a</div>", "<div>a</div>"],
    exportFormats: {
      MSYT: '      - text: "a\\n\\n\\na"',
      TOTKNXEditor: "  a\n  \n  \n  a",
      TOTKMSBTEditor: "a\n\n\na"
    }
  },
  {
    bubbleDescription: "Three-line bubble (one manual, one wrapping) + single-line bubble",
    exportDescription: "Two-bubble text node",
    bubbleContents: ["<div>a</div><div>llamallamallamallamallamallamallamallamallama<br></div>", "<div>a</div>"],
    importContents: ["<div>a</div><div>llamallamallamallamallamallamallamallamal</div><div>lama</div>", "<div>a</div>"],
    exportFormats: {
      MSYT: '      - text: "a\\nllamallamallamallamallamallamallamallamal\\nlama\\na"',
      TOTKNXEditor: "  a\n  llamallamallamallamallamallamallamallamal\n  lama\n  a",
      TOTKMSBTEditor: "a\nllamallamallamallamallamallamallamallamal\nlama\na"
    }
  },
  {
    bubbleDescription: "Three-line bubble (one manual, one wrapping) + wrapping single-line bubble",
    exportDescription: "Two-bubble text node",
    bubbleContents: [
      "<div>Hello, Link.</div><div>I have been awaiting your return for quite some time.<br></div>",
      '<div>Now I can finally avenge the <span data-color="grey" data-size="80">embarrassing</span> death of my master...</div>'
    ],
    importContents: [
      "<div>Hello, Link.</div><div>I have been awaiting your return for quite</div><div>some time.</div>",
      '<div>Now I can finally avenge the <span data-color="grey" data-size="80">embarrassing</span></div><div>death of my master...</div>'
    ],
    exportFormats: {
      MSYT: '      - text: "Hello, Link.\\nI have been awaiting your return for quite\\nsome time.\\nNow I can finally avenge the "\n      - control:\n          kind: set_colour\n          colour: grey\n      - control:\n          kind: text_size\n          percent: 80\n      - text: "embarrassing\\n"\n      - control:\n          kind: reset_colour\n      - control:\n          kind: text_size\n          percent: 100\n      - text: "death of my master..."',
      TOTKNXEditor:
        "  Hello, Link.\n  I have been awaiting your return for quite\n  some time.\n  Now I can finally avenge the <0 Type='3' Data='0200'/><0 Type='2' Data='5000'/>embarrassing\n  <0 Type='3' Data='ffff'/><0 Type='2' Data='6400'/>death of my master...",
      TOTKMSBTEditor:
        'Hello, Link.\nI have been awaiting your return for quite\nsome time.\nNow I can finally avenge the {{color id="Gray"}}{{size value="80"}}embarrassing\n{{color id="Default"}}{{size value="100"}}death of my master...'
    }
  },
  {
    bubbleDescription: "Three single-line bubbles",
    exportDescription: "Three-bubble text node",
    bubbleContents: ["<div>a</div>", "<div>a</div>", "<div>a</div>"],
    importContents: ["<div>a</div>", "<div>a</div>", "<div>a</div>"],
    exportFormats: {
      MSYT: '      - text: "a\\n\\n\\na\\n\\n\\na"',
      TOTKNXEditor: "  a\n  \n  \n  a\n  \n  \n  a",
      TOTKMSBTEditor: "a\n\n\na\n\n\na"
    }
  },
  {
    bubbleDescription: "Empty bubble surrounded by single-line bubbles",
    exportDescription: "Two-bubble text node",
    bubbleContents: ["<div>a</div>", "<div></div>", "<div>a</div>"],
    importContents: ["<div>a</div>", "<div>a</div>"],
    exportFormats: {
      MSYT: '      - text: "a\\n\\n\\na"',
      TOTKNXEditor: "  a\n  \n  \n  a",
      TOTKMSBTEditor: "a\n\n\na"
    }
  }
  // TODO: Add tests for animation/sound control nodes
];
