const { vol } = require('memfs')
const pick = require('lodash/pick')
const { fixture } = require('testUtils')
const {
  getCurrentPackageJsonMetaData,
  extractConfigs,
  extractMetaData,
} = require('../extract')

describe('core > package > extract >', () => {
  const packageJsonConfigsExtractionFxt = fixture(
    'package/json/06-configs-extraction/current.json',
    'json',
  )

  beforeEach(() => {
    vol.reset()
  })

  describe('getCurrentPackageJsonMetaData', () => {
    it('should extract sharec meta data from target project package.json', async () => {
      expect.assertions(1)

      const metaData = {
        version: '1.0.0',
        config: 'awesome-config',
      }
      const dir = {
        '/target/package.json': JSON.stringify(
          {
            sharec: metaData,
          },
          null,
          2,
        ),
      }
      vol.fromJSON(dir, '/')

      const receivedMetaData = await getCurrentPackageJsonMetaData('/target')

      expect(receivedMetaData).toEqual(metaData)
    })

    it('should return null if sharec meta data is not exist', async () => {
      expect.assertions(1)

      const dir = {
        '/target/package.json': JSON.stringify({}, null, 2),
      }
      vol.fromJSON(dir, '/')

      const receivedMetaData = await getCurrentPackageJsonMetaData('/target')

      expect(receivedMetaData).toEqual(null)
    })
  })

  describe('extractConfigs', () => {
    it('should return all configs from package.json except dependencies, sharec meta-data and other standard package fields', () => {
      const extractedConfigs = extractConfigs(packageJsonConfigsExtractionFxt)

      expect(extractedConfigs).toEqual(
        pick(packageJsonConfigsExtractionFxt, [
          'scripts',
          'lint-staged',
          'husky',
          'config',
          'prettier',
          'eslintConfig',
          'eslintIgnore',
          'devDependencies',
        ]),
      )
    })
  })

  describe('extractMetaData', () => {
    it('should return sharec meta-data', () => {
      const extractedMetaData = extractMetaData(packageJsonConfigsExtractionFxt)

      expect(extractedMetaData).toEqual(packageJsonConfigsExtractionFxt.sharec)
    })

    it('should return null if sharec meta-data is not exists', () => {
      const extractedMetaData = extractMetaData({})

      expect(extractedMetaData).toBeNull()
    })
  })
})
