const path = require('path')
const { pipe } = require('../../utils')
const { readFile, writeFile } = require('../../utils/std').fs
const { resolveConfigStrategy } = require('../strategies/resolve')
const { cacheConfig, loadConfigCache } = require('../cache')
const { extractConfigs } = require('./extract')

/**
 * @typedef {Object} MetaData
 * @property {String} version
 * @property {String} config
 */

const installPackageJson = async ({
  installedMeta,
  upcomingMeta,
  configsPath,
  targetPath,
}) => {
  const configCache = installedMeta
    ? await loadConfigCache({
        configsMeta: installedMeta,
        configPath: 'package.json',
        targetPath,
      })
    : null
  const targetPackageJsonPath = path.resolve(targetPath, 'package.json')
  const rawTargetPackageJson = await readFile(targetPackageJsonPath)
  const targetPackageJson = JSON.parse(rawTargetPackageJson)
  const packageJsonPath = path.resolve(configsPath, 'package.json')
  const rawPackageJson = await readFile(packageJsonPath, 'utf8')
  let newPackageJson = { ...targetPackageJson }

  try {
    const cachedPackageJson = configCache ? JSON.parse(configCache) : {}
    const packageJson = JSON.parse(rawPackageJson)
    const newConfigs = extractConfigs(packageJson)

    newPackageJson = pipe(
      injectConfigs({
        configs: newConfigs,
        configsCache: cachedPackageJson,
      }),
      injectMetaData(upcomingMeta),
    )(targetPackageJson)
  } catch (err) {
    newPackageJson = pipe(injectMetaData(upcomingMeta))(targetPackageJson)
  }

  await writeFile(
    targetPackageJsonPath,
    JSON.stringify(newPackageJson, null, 2),
    'utf8',
  )
  await cacheConfig({
    configsMeta: upcomingMeta,
    configPath: 'package.json',
    configSource: rawPackageJson,
    targetPath,
  })
}

const injectConfigs = ({ configs, configsCache }) => packageJson => {
  const updatedPackageJson = { ...packageJson }

  Object.keys(configs).forEach(key => {
    const strategy = resolveConfigStrategy(key)

    if (strategy) {
      Object.assign(updatedPackageJson, {
        [key]: strategy.merge(key)({
          current: updatedPackageJson[key],
          upcoming: configs[key],
          cached: configsCache[key],
        }),
      })
    } else {
      Object.assign(updatedPackageJson, {
        [key]: configs[key],
      })
    }
  })

  return updatedPackageJson
}

/**
 * @param {MetaData} meta
 * @returns {Function}
 */
const injectMetaData = meta => packageJson => ({
  ...packageJson,
  sharec: {
    config: meta.config,
    version: meta.version,
  },
})

module.exports = {
  installPackageJson,
  injectConfigs,
  injectMetaData,
}
