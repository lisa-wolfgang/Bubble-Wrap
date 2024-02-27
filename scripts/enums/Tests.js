/** Content to be passed to a {@link Test}. */
export default [
  {
    inputDescription: "Single-line bubble",
    outputDescription: "Single-line text node",
    bubbles: ["<div>a</div>"],
    outputs: ['      - text: "a"']
  },
  {
    inputDescription: "Wrapping single-word bubble",
    outputDescription: "Multi-line text node",
    bubbles: ["<div>llamallamallamallamallamallamallamallamallama</div>"],
    outputs: ['      - text: "llamallamallamallamallamallamallamallamal\\nlama"']
  },
  {
    inputDescription: "Wrapping single-line bubble",
    outputDescription: "Multi-line text node",
    bubbles: ["<div>What they don't know is that we added one of those fancy switches to open the gate. We can access the room anytime...</div>"],
    outputs: ['      - text: "What they don\'t know is that we added\\none of those fancy switches to open the\\ngate. We can access the room anytime..."']
  },
  {
    inputDescription: "Single-line bubble wrapped on hyphen",
    outputDescription: "Single-line text node",
    bubbles: ["<div>This is our final hour. All of this sword-swinging, arrow-slinging, bomb-flinging nonsense ends today!</div>"],
    outputs: ['      - text: "This is our final hour. All of this sword-\\nswinging, arrow-slinging, bomb-flinging\\nnonsense ends today!"']
  },
  {
    inputDescription: "Manual two-line bubble",
    outputDescription: "Two-line text node",
    bubbles: ["<div>a</div><div>a<br></div>"],
    outputs: ['      - text: "a\\na"']
  },
  {
    inputDescription: "Pasted two-line bubble",
    outputDescription: "Two-line text node",
    bubbles: ["<div>a<br>a</div>"],
    outputs: ['      - text: "a\\na"']
  },
  {
    inputDescription: "Pasted three-line bubble",
    outputDescription: "Three-line text node",
    bubbles: ["<div>What they don't know is that we added<br>one of those fancy switches to open the<br>gate. We can access the room anytime...</div>"],
    outputs: ['      - text: "What they don\'t know is that we added\\none of those fancy switches to open the\\ngate. We can access the room anytime..."']
  },
  {
    inputDescription: "Manual three-line bubble",
    outputDescription: "Three-line text node",
    bubbles: ["<div>a</div><div>a</div><div>a<br></div>"],
    outputs: ['      - text: "a\\na\\na"']
  },
  {
    inputDescription: "Three-line bubble (one manual, one wrapping)",
    outputDescription: "Three-line text node",
    bubbles: ["<div>a</div><div>llamallamallamallamallamallamallamallamallama<br></div>"],
    outputs: ['      - text: "a\\nllamallamallamallamallamallamallamallamal\\nlama"']
  },
  {
    inputDescription: "Three-line bubble (one manual, one wrapping) with control nodes",
    outputDescription: "Three-line text node with control nodes",
    bubbles: ['<div><span data-color="red">aaaaaaa</span><span data-color="white">aaaaaa</span></div><div><span data-size="125">llamallamallamallam</span><span data-size="100">allamallama</span><span data-pause="short"></span><span data-size="100">llamallamallama</span><br></div>'],
    outputs: ["      - control:\n" + "          kind: set_colour\n" + "          colour: red\n" + '      - text: "aaaaaaa"\n' + "      - control:\n" + "          kind: reset_colour\n" + '      - text: "aaaaaa\\n"\n' + "      - control:\n" + "          kind: text_size\n" + "          percent: 125\n" + '      - text: "llamallamallamallam"\n' + "      - control:\n" + "          kind: text_size\n" + "          percent: 100\n" + '      - text: "allamallama"\n' + "      - control:\n" + "          kind: pause\n" + "          length: short\n" + '      - text: "llamal\\nlamallama"']
  },
  {
    inputDescription: "Two single-line bubbles",
    outputDescription: "Two-bubble text node",
    bubbles: ["<div>a</div>", "<div>a</div>"],
    outputs: ['      - text: "a\\n\\n\\na"']
  },
  {
    inputDescription: "Three-line bubble (one manual, one wrapping) + single-line bubble",
    outputDescription: "Two-bubble text node",
    bubbles: ["<div>a</div><div>llamallamallamallamallamallamallamallamallama<br></div>", "<div>a</div>"],
    outputs: ['      - text: "a\\nllamallamallamallamallamallamallamallamal\\nlama\\na"']
  },
  {
    inputDescription: "Three-line bubble (one manual, one wrapping) + wrapping single-line bubble",
    outputDescription: "Two-bubble text node",
    bubbles: ["<div>Hello, Link.</div><div>I have been awaiting your return for quite some time.<br></div>", '<div><span>Now I can finally avenge the </span><span data-color="grey"></span><span data-color="grey" data-size="80">embarrassing</span><span data-color="grey"></span><span> death of my master...</span></div>'],
    outputs: ['      - text: "Hello, Link.\\nI have been awaiting your return for quite\\nsome time.\\nNow I can finally avenge the "\n      - control:\n          kind: set_colour\n          colour: grey\n      - control:\n          kind: text_size\n          percent: 80\n      - text: "embarrassing\\n"\n      - control:\n          kind: reset_colour\n      - control:\n          kind: text_size\n          percent: 100\n      - text: "death of my master..."']
  },
  {
    inputDescription: "Three single-line bubbles",
    outputDescription: "Three-bubble text node",
    bubbles: ["<div>a</div>", "<div>a</div>", "<div>a</div>"],
    outputs: ['      - text: "a\\n\\n\\na\\n\\n\\na"']
  },
  {
    inputDescription: "Empty bubble surrounded by single-line bubbles",
    outputDescription: "Two-bubble text node",
    bubbles: ["<div>a</div>", "<div></div>", "<div>a</div>"],
    outputs: ['      - text: "a\\n\\n\\na"']
  }
];
