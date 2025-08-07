import fs from 'fs'
import logUtils from './log.js'

const npmUtils = {
  checkVersionsOfProject(packageJson) {
    logUtils.seperator()
    let projectPassed = !packageJson.version.includes('dev')
    let dependenciesPassed = true
    console.log('Versions:\n')
    console.log(`${packageJson.name}=${packageJson.version}`)
    logUtils.seperator()
    if(projectPassed) {
      console.log('Dependencies:\n')
      function checkDependencies(dependencies) {
        if(!dependencies || !dependenciesPassed) return
        for(let key in dependencies) {
          console.log(`${key}=${dependencies[key]}`)
          if(dependencies[key].includes('dev')) {
            dependenciesPassed = false
            return
          }
        }
      }
      checkDependencies(packageJson.dependencies)
      //noinspection JSUnresolvedReference
      checkDependencies(packageJson.devDependencies)
      logUtils.seperator()
    }
    console.log('Results:\n')
    console.log(`results.projectPassed=${projectPassed}`)
    console.log(`results.dependenciesPassed=${dependenciesPassed}`)
    logUtils.seperator()
  },
  removeExistingPackage(packageJson, registryPath) {
    if(!registryPath) return
    let packageName = packageJson.name
    if(packageName.includes('/')) {
      packageName = packageName.substring(packageName.indexOf('/') + 1)
    }
    let path = `${registryPath}/${packageJson.name}`
    if(!fs.existsSync(path)) {
      console.log(`No such directory: ${path}`)
      return
    }
    let fileName = `${packageName}-${packageJson.version}.tgz`
    fs.rmSync(`${path}/${fileName}`, {
      force: true
    })
    //noinspection JSCheckFunctionSignatures
    let info = JSON.parse(fs.readFileSync(`${path}/package.json`))
    delete info.versions[packageJson.version]
    delete info.time[packageJson.version]
    delete info['dist-tags']['latest']
    delete info['_attachments'][fileName]
    fs.writeFileSync(`${path}/package.json`, JSON.stringify(info, null, 4))
  }
}

export default npmUtils
