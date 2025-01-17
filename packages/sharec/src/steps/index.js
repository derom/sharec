// Guards
const isAlreadyInstalled = require('./isAlreadyInstalled')
const isDependantOfSharec = require('./isDependantOfSharec')
const isIgnoresSharecConfigs = require('./isIgnoresSharecConfigs')
// Input
const readConfigs = require('./readConfigs')
const readTargetPackage = require('./readTargetPackage')
const readUpcomingPackage = require('./readUpcomingPackage')
const readCache = require('./readCache')
const readEditorconfig = require('./readEditorconfig')
const readPrettier = require('./readPrettier')
// Processing
const mergeConfigs = require('./mergeConfigs')
const insertEOL = require('./insertEOL')
const applyFormatting = require('./applyFormatting')
// Output
const writeConfigs = require('./writeConfigs')
const insertMeta = require('./insertMeta')
const writeCache = require('./writeCache')

/**
 * @typedef {Object} Input
 * @property {String} targetPath Target project path
 * @property {String} configPath Upcoming configuration path
 * @property {Object} options Different options from CLI
 * @property {Boolean} options.silent Disables all messages from sharec
 * @property {Boolean} options.overwrite Forcily replaces all configs by new ones
 * @property {Boolean} options.disappeara Do not write cache and sharec meta to target project
 * @property {Boolean} options.debug Enables debug messages
 */

/**
 * Composes steps in one function
 * Executes each step and pass result to the next one
 * @param {Array<Function>} steps Steps functions
 * @returns {Function}
 */
const composeSteps = (...steps) =>
  /**
   * @param {Input} input
   * @returns {Input}
   */
  async (input) => {
    let lastInput = input

    for (const step of steps) {
      lastInput = await step(lastInput)
    }

    return lastInput
  }

const steps = {
  isAlreadyInstalled,
  isDependantOfSharec,
  isIgnoresSharecConfigs,

  mergeConfigs,
  insertEOL,
  insertMeta,
  applyFormatting,

  readConfigs,
  readTargetPackage,
  readUpcomingPackage,
  readCache,
  readEditorconfig,
  readPrettier,

  writeConfigs,
  writeCache,
}

module.exports = {
  composeSteps,
  steps,
}
