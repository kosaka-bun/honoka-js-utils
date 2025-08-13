//noinspection JSUnusedGlobalSymbols

import { v4 as uuid } from 'uuid'
import androidInterfaceCallbackUtils from './callback.js'

class AndroidInterfaceStubUtils {

  enableWarning = true

  warning(name) {
    if(!this.enableWarning) return
    let msg = `You are calling a Android JavaScript Interface function "${name}" ` +
      'directly in browser!'
    console.warn(msg)
  }

  getStub(interfaceName, definition) {
    let androidInterface = window[`android_${interfaceName}`]
    let stub = {}
    Object.keys(definition).forEach(it => {
      let methodDef = definition[it]
      if(methodDef instanceof Function) {
        stub[it] = androidInterface ? this.getMethodStub(androidInterface, it) : (...args) => {
          this.warning(`${interfaceName}.${it}()`)
          return methodDef(...args)
        }
        return
      }
      if(methodDef instanceof Object) {
        let isAsync = methodDef.isAsync ?? false
        if(isAsync) {
          stub[it] = androidInterface ? this.getAsyncMethodStub(interfaceName, it) : (
            async (...args) => {
              this.warning(`${interfaceName}.${it}()`)
              return await methodDef.fallback(...args)
            }
          )
        } else {
          stub[it] = androidInterface ? this.getMethodStub(androidInterface, it) : (...args) => {
            this.warning(`${interfaceName}.${it}()`)
            return methodDef.fallback(...args)
          }
        }
        return
      }
      throw new Error(`Unknown Android interface method stub definition: ${it} -> ${typeof methodDef}`)
    })
    return stub
  }

  getMethodStub(androidInterface, methodName) {
    return (...args) => androidInterface[methodName](...args)
  }

  getAsyncMethodStub(interfaceName, methodName) {
    return (...args) => new Promise((resolve, reject) => {
      let callbackId = uuid()
      androidInterfaceCallbackUtils.addCallback({
        id: callbackId,
        interfaceName,
        methodName,
        args,
        resolve,
        reject
      })
      //noinspection JSUnresolvedReference
      window['android_AsyncTaskJsInterface'].invokeAsyncMethod(
        interfaceName, methodName, callbackId, JSON.stringify(args)
      )
    })
  }
}

const androidInterfaceStubUtils = new AndroidInterfaceStubUtils()

export default androidInterfaceStubUtils
