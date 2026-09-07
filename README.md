# Bubble Wrap

A visual text bubble editor for _The Legend of Zelda: Breath of the Wild_ and _The Legend of Zelda: Tears of the Kingdom_.

## Features

### Automatic text wrapping

The editor works just like a regular text box, eliminating guesswork and providing instant visual feedback. The spacing and wrapping behaviors have been tested for accuracy against a variety of vanilla text. The currently supported formats are:

- NPC dialogue
- Sign dialogs
- Item descriptions (also accounts for the in-game character limit)
- Hyrule Compendium entries
- Quest logs
- Loading screen tips

### Hassle-free control nodes

Coloring, resizing, and adding pauses is as easy as selecting a portion of text and applying the desired effect. In addition, presets are available for the most common animation/sound control nodes, but with full support for custom values. When it comes time to export, the control nodes are intelligently inserted to avoid the need for manual reordering.

### Effortless syntax conversion

Easily import and export your bubbles from the clipboard with your format/editor of choice:

- Plain text
- MSYT files
- YAML files
- Wild Bits
- NX Editor (TOTK only)
- MSBT Editor (TOTK only)

When importing, both full message entries and syntax fragments are supported. Unrecognized/unsupported control nodes will remain as red lines, but they are lost when switching to a different export format.

Bubble Wrap will also automatically replace sneaky variants of apostrophes and other characters with the correct in-game versions.

## Install

Bubble Wrap is a web application: simply visit https://lisa-wolfgang.github.io/Bubble-Wrap to start using it.

If supported by your browser, you may also install Bubble Wrap as a "standalone" application, although this still requires Internet access. If you need offline access, see [CONTRIBUTING.md](CONTRIBUTING.md) for guidance on running the application locally.

## Contributing

Pull requests are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) for more information.
