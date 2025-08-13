//noinspection JSUnusedGlobalSymbols

import androidInterfaceStubUtils from '../support/stub.js'

const definition = {
  openNewWebActivity: path => {
    window.location.href = path
  },
  finishCurrentWebActivity: () => {
    history.back()
  }
}

const basicInterfaceStub = androidInterfaceStubUtils.getStub(
  'BasicJsInterface', definition
) ?? definition

export default basicInterfaceStub
