import ExportType from "./ExportType.js";

/**
 * Content to be passed to a {@link Test}.
 * @typedef {Object} TestData
 * @property {string} inputDescription A description of the input bubbles being passed to the test.
 * @property {string} outputDescription A description of the expected output from the test.
 * @property {string[]} bubbles An array containing the `bubbleContentElement.innerHTML` of each bubble to be tested.
 * @property {Object.string} outputs An object of strings containing the expected output of the test for each export format.
 */

/**
 * An array of {@link TestData}.
 * @type {TestData[]}
 */
export default [
  {
    inputDescription: "Single-line bubble",
    outputDescription: "Single-line text node",
    bubbles: ["<div>a</div>"],
    outputs: {
      MSYT: '      - text: "a"',
      TOTKNXEditor: "  a",
      TOTKMSBTEditor: "a"
    }
  },
  {
    inputDescription: "Wrapping single-word bubble",
    outputDescription: "Multi-line text node",
    bubbles: ["<div>llamallamallamallamallamallamallamallamallama</div>"],
    outputs: {
      MSYT: '      - text: "llamallamallamallamallamallamallamallamal\\nlama"',
      TOTKNXEditor: "  llamallamallamallamallamallamallamallamal\n  lama",
      TOTKMSBTEditor: "llamallamallamallamallamallamallamallamal\nlama"
    }
  },
  {
    inputDescription: "Wrapping single-line bubble",
    outputDescription: "Multi-line text node",
    bubbles: [
      "<div>What they don't know is that we added one of those fancy switches to open the gate. We can access the room anytime...</div>"
    ],
    outputs: {
      MSYT: '      - text: "What they don\'t know is that we added\\none of those fancy switches to open the\\ngate. We can access the room anytime..."',
      TOTKNXEditor:
        "  What they don't know is that we added\n  one of those fancy switches to open the\n  gate. We can access the room anytime...",
      TOTKMSBTEditor:
        "What they don't know is that we added\none of those fancy switches to open the\ngate. We can access the room anytime..."
    }
  },
  {
    inputDescription: "Single-line bubble wrapped on hyphen",
    outputDescription: "Single-line text node",
    bubbles: ["<div>This is our final hour. All of this sword-swinging, arrow-slinging, bomb-flinging nonsense ends today!</div>"],
    outputs: {
      MSYT: '      - text: "This is our final hour. All of this sword-\\nswinging, arrow-slinging, bomb-flinging\\nnonsense ends today!"',
      TOTKNXEditor: "  This is our final hour. All of this sword-\n  swinging, arrow-slinging, bomb-flinging\n  nonsense ends today!",
      TOTKMSBTEditor: "This is our final hour. All of this sword-\nswinging, arrow-slinging, bomb-flinging\nnonsense ends today!"
    }
  },
  {
    inputDescription: "Manual two-line bubble",
    outputDescription: "Two-line text node",
    bubbles: ["<div>a</div><div>a<br></div>"],
    outputs: {
      MSYT: '      - text: "a\\na"',
      TOTKNXEditor: "  a\n  a",
      TOTKMSBTEditor: "a\na"
    }
  },
  {
    inputDescription: "Pasted two-line bubble",
    outputDescription: "Two-line text node",
    bubbles: ["<div>a<br>a</div>"],
    outputs: {
      MSYT: '      - text: "a\\na"',
      TOTKNXEditor: "  a\n  a",
      TOTKMSBTEditor: "a\na"
    }
  },
  {
    inputDescription: "Pasted three-line bubble",
    outputDescription: "Three-line text node",
    bubbles: [
      "<div>What they don't know is that we added<br>one of those fancy switches to open the<br>gate. We can access the room anytime...</div>"
    ],
    outputs: {
      MSYT: '      - text: "What they don\'t know is that we added\\none of those fancy switches to open the\\ngate. We can access the room anytime..."',
      TOTKNXEditor:
        "  What they don't know is that we added\n  one of those fancy switches to open the\n  gate. We can access the room anytime...",
      TOTKMSBTEditor:
        "What they don't know is that we added\none of those fancy switches to open the\ngate. We can access the room anytime..."
    }
  },
  {
    inputDescription: "Manual three-line bubble",
    outputDescription: "Three-line text node",
    bubbles: ["<div>a</div><div>a</div><div>a<br></div>"],
    outputs: {
      MSYT: '      - text: "a\\na\\na"',
      TOTKNXEditor: "  a\n  a\n  a",
      TOTKMSBTEditor: "a\na\na"
    }
  },
  {
    inputDescription: "Three-line bubble (one manual, one wrapping)",
    outputDescription: "Three-line text node",
    bubbles: ["<div>a</div><div>llamallamallamallamallamallamallamallamallama<br></div>"],
    outputs: {
      MSYT: '      - text: "a\\nllamallamallamallamallamallamallamallamal\\nlama"',
      TOTKNXEditor: "  a\n  llamallamallamallamallamallamallamallamal\n  lama",
      TOTKMSBTEditor: "a\nllamallamallamallamallamallamallamallamal\nlama"
    }
  },
  {
    inputDescription: "Three-line bubble (one manual, one wrapping) with control nodes",
    outputDescription: "Three-line text node with control nodes",
    bubbles: [
      '<div><span data-color="red">aaaaaaa</span><span data-color="white">aaaaaa</span></div><div><span data-size="125">llamallamallamallam</span><span data-size="100">allamallama</span><span data-pause="short"></span><span data-size="100">llamallamallama</span><br></div>'
    ],
    outputs: {
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
        '{{color id="0"}}aaaaaaa{{color id="65535"}}aaaaaa\n{{size value="125"}}llamallamallamallam{{size value="100"}}allamallama{{delay1}}llamal\nlamallama'
    }
  },
  {
    inputDescription: "Single-line bubble with custom-length pause node",
    outputDescription: "Single-line text node with pause control node",
    bubbles: ['<div><span>Just your average bubble...</span><span data-pause="25"></span></div>'],
    outputs: {
      MSYT: '      - text: "Just your average bubble..."\n      - control:\n          kind: pause\n          frames: 25',
      TOTKNXEditor: "  Just your average bubble...<1 Type='0' Data='1900'/>",
      TOTKMSBTEditor: 'Just your average bubble...{{delay frames="25"}}'
    }
  },
  {
    inputDescription: "Wrapping single-line bubble with control node at wrap",
    outputDescription: "Two-line text node",
    bubbles: [
      '<div><span>Looks like you need one of my </span><span data-color="blue">specialty </span><span>services! So what\'ll it be?</span></div>'
    ],
    outputs: {
      MSYT: '      - text: "Looks like you need one of my "\n      - control:\n          kind: set_colour\n          colour: blue\n      - text: "specialty \\n"\n      - control:\n          kind: reset_colour\n      - text: "services! So what\'ll it be?"',
      TOTKNXEditor:
        "  Looks like you need one of my <0 Type='3' Data='0100'/>specialty \n  <0 Type='3' Data='ffff'/>services! So what'll it be?",
      TOTKMSBTEditor: 'Looks like you need one of my {{color id="1"}}specialty \n{{color id="65535"}}services! So what\'ll it be?'
    }
  },
  {
    inputDescription: "Single-line bubble with nested control nodes",
    outputDescription: "Single-line text node with nested control nodes",
    bubbles: [
      '<div><span>Lots </span><span data-color="blue">of</span><span data-color="red"></span><span data-color="red"> </span><span data-color="red" data-size="125"></span><span data-color="red" data-size="125">con</span><span data-color="red"></span><span data-color="blue">t</span><span data-color="blue" data-size="80">r</span><span data-color="red" data-size="80">o</span><span data-color="red">l</span><span data-color="red"> n</span><span data-color="red" data-size="125">o</span><span data-color="white" data-size="125">d</span><span data-color="white">es</span><span data-color="red"></span><span></span></div>'
    ],
    outputs: {
      MSYT: '      - text: "Lots "\n      - control:\n          kind: set_colour\n          colour: blue\n      - text: "of"\n      - control:\n          kind: set_colour\n          colour: red\n      - text: " "\n      - control:\n          kind: text_size\n          percent: 125\n      - text: "con"\n      - control:\n          kind: set_colour\n          colour: blue\n      - control:\n          kind: text_size\n          percent: 100\n      - text: "t"\n      - control:\n          kind: text_size\n          percent: 80\n      - text: "r"\n      - control:\n          kind: set_colour\n          colour: red\n      - text: "o"\n      - control:\n          kind: text_size\n          percent: 100\n      - text: "l n"\n      - control:\n          kind: text_size\n          percent: 125\n      - text: "o"\n      - control:\n          kind: reset_colour\n      - text: "d"\n      - control:\n          kind: text_size\n          percent: 100\n      - text: "es"',
      TOTKNXEditor:
        "  Lots <0 Type='3' Data='0100'/>of<0 Type='3' Data='0000'/> <0 Type='2' Data='7d00'/>con<0 Type='3' Data='0100'/><0 Type='2' Data='6400'/>t<0 Type='2' Data='5000'/>r<0 Type='3' Data='0000'/>o<0 Type='2' Data='6400'/>l n<0 Type='2' Data='7d00'/>o<0 Type='3' Data='ffff'/>d<0 Type='2' Data='6400'/>es",
      TOTKMSBTEditor:
        'Lots {{color id="1"}}of{{color id="0"}} {{size value="125"}}con{{color id="1"}}{{size value="100"}}t{{size value="80"}}r{{color id="0"}}o{{size value="100"}}l n{{size value="125"}}o{{color id="65535"}}d{{size value="100"}}es'
    }
  },
  {
    inputDescription: "Two single-line bubbles",
    outputDescription: "Two-bubble text node",
    bubbles: ["<div>a</div>", "<div>a</div>"],
    outputs: {
      MSYT: '      - text: "a\\n\\n\\na"',
      TOTKNXEditor: "  a\n  \n  \n  a",
      TOTKMSBTEditor: "a\n\n\na"
    }
  },
  {
    inputDescription: "Three-line bubble (one manual, one wrapping) + single-line bubble",
    outputDescription: "Two-bubble text node",
    bubbles: ["<div>a</div><div>llamallamallamallamallamallamallamallamallama<br></div>", "<div>a</div>"],
    outputs: {
      MSYT: '      - text: "a\\nllamallamallamallamallamallamallamallamal\\nlama\\na"',
      TOTKNXEditor: "  a\n  llamallamallamallamallamallamallamallamal\n  lama\n  a",
      TOTKMSBTEditor: "a\nllamallamallamallamallamallamallamallamal\nlama\na"
    }
  },
  {
    inputDescription: "Three-line bubble (one manual, one wrapping) + wrapping single-line bubble",
    outputDescription: "Two-bubble text node",
    bubbles: [
      "<div>Hello, Link.</div><div>I have been awaiting your return for quite some time.<br></div>",
      '<div><span>Now I can finally avenge the </span><span data-color="grey"></span><span data-color="grey" data-size="80">embarrassing</span><span data-color="grey"></span><span> death of my master...</span></div>'
    ],
    outputs: {
      MSYT: '      - text: "Hello, Link.\\nI have been awaiting your return for quite\\nsome time.\\nNow I can finally avenge the "\n      - control:\n          kind: set_colour\n          colour: grey\n      - control:\n          kind: text_size\n          percent: 80\n      - text: "embarrassing\\n"\n      - control:\n          kind: reset_colour\n      - control:\n          kind: text_size\n          percent: 100\n      - text: "death of my master..."',
      TOTKNXEditor:
        "  Hello, Link.\n  I have been awaiting your return for quite\n  some time.\n  Now I can finally avenge the <0 Type='3' Data='0200'/><0 Type='2' Data='5000'/>embarrassing\n  <0 Type='3' Data='ffff'/><0 Type='2' Data='6400'/>death of my master...",
      TOTKMSBTEditor:
        'Hello, Link.\nI have been awaiting your return for quite\nsome time.\nNow I can finally avenge the {{color id="2"}}{{size value="80"}}embarrassing\n{{color id="65535"}}{{size value="100"}}death of my master...'
    }
  },
  {
    inputDescription: "Three single-line bubbles",
    outputDescription: "Three-bubble text node",
    bubbles: ["<div>a</div>", "<div>a</div>", "<div>a</div>"],
    outputs: {
      MSYT: '      - text: "a\\n\\n\\na\\n\\n\\na"',
      TOTKNXEditor: "  a\n  \n  \n  a\n  \n  \n  a",
      TOTKMSBTEditor: "a\n\n\na\n\n\na"
    }
  },
  {
    inputDescription: "Empty bubble surrounded by single-line bubbles",
    outputDescription: "Two-bubble text node",
    bubbles: ["<div>a</div>", "<div></div>", "<div>a</div>"],
    outputs: {
      MSYT: '      - text: "a\\n\\n\\na"',
      TOTKNXEditor: "  a\n  \n  \n  a",
      TOTKMSBTEditor: "a\n\n\na"
    }
  }
  // TODO: Add tests for animation/sound control nodes
];
