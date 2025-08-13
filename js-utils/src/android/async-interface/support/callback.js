//noinspection JSUnusedGlobalSymbols

class AndroidInterfaceCallbackUtils {

  #callTimeout = 10 * 1000

  #callbacks = {}

  #rejectTasks = {}

  //仅在main.js中调用一次
  exposeToGlobal() {
    if(!window.android) {
      window.android = {}
    }
    window.android.interfaceCallbackUtils = this
  }

  invokeCallback(id, resultObj) {
    let callback = this.#callbacks[id]
    if(callback == null) return
    callback(resultObj)
  }

  addCallback(params) {
    this.#callbacks[params.id] = resultObj => {
      this.removeCallback(params.id)
      this.removeRejectTask(params.id)
      resultObj = resultObj ?? {
        resolved: false,
        message: null,
        result: null
      }
      if(resultObj.resolved) {
        console.log(
          `${params.interfaceName}.${params.methodName}()\nparams:`,
          params.args, '\nresult:', resultObj.result
        )
        params.resolve(resultObj.result)
      } else {
        console.error(
          `${params.interfaceName}.${params.methodName}()\nparams:`,
          params.args, '\nerror:', resultObj.message
        )
        params.reject()
      }
    }
    this.#rejectTasks[params.id] = setTimeout(() => {
      if(this.#callbacks[params.id] == null) return
      this.removeCallback(params.id)
      delete this.#rejectTasks[params.id]
      console.error(
        `${params.interfaceName}.${params.methodName}()\nparams:`,
        params.args, `\nerror: ${this.#callTimeout}ms timeout`
      )
      params.reject()
    }, this.#callTimeout)
  }

  removeCallback(id) {
    delete this.#callbacks[id]
  }

  removeRejectTask(id) {
    if(!this.#rejectTasks[id]) return
    clearTimeout(this.#rejectTasks[id])
    delete this.#rejectTasks[id]
  }
}

const androidInterfaceCallbackUtils = new AndroidInterfaceCallbackUtils()

export default androidInterfaceCallbackUtils
