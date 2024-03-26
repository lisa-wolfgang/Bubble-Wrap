/**
 * A bubble type configuration.
 * @typedef {Object} BubbleConfig
 * @property {string} className The internal identifier used for this bubble type.
 * @property {number | null} charLimit The maximum character count allowed per bubble, or `null` for no limit.
 * @property {number} lineCount The number of lines per bubble.
 * @property {boolean} isSingleton Whether more than one bubble should be allowed at once.
 */

/**
 * A collection of bubble type configurations.
 * @type {Object.BubbleConfig}
 */
export default {
  dialogue: {
    className: "dialogue",
    charLimit: null,
    lineCount: 3,
    isSingleton: false
  },
  signboard: {
    className: "signboard",
    charLimit: null,
    lineCount: 3,
    isSingleton: false
  },
  item: {
    className: "item",
    charLimit: 204,
    lineCount: 4,
    isSingleton: true
  },
  compendium: {
    className: "compendium",
    charLimit: null,
    lineCount: 9,
    isSingleton: true
  },
  questBOTW: {
    className: "questBOTW",
    charLimit: null,
    lineCount: 11,
    isSingleton: true
  },
  questTOTK: {
    className: "questTOTK",
    charLimit: null,
    lineCount: 8,
    isSingleton: true
  },
  tip: {
    className: "tip",
    charLimit: null,
    lineCount: 3,
    isSingleton: true
  }
};
// TODO: Test for what actual `charLimit` values are
