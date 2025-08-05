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
  }
}

export default npmUtils
