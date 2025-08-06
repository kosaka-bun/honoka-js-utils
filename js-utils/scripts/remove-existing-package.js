import packageJson from '../package.json' with { type: 'json' }
import npmUtils from '../src/basic/npm.js'

npmUtils.removeExistingPackage(packageJson, process.argv[2])
