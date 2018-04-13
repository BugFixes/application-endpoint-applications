const bugfixes = require('bugfixes')
const ApplicationModel = require('bugfixes-application-models')
const AccountModel = require('bugfixes-account-models')
const Logs = require('bugfixes-account-logging')

const bugfunctions = bugfixes.functions

module.exports = (event, context, callback) => {
  let log = new Logs()
  log.action = 'List Applications'
  log.content = {
    apiKey: event.requestContext.identity.apiKey
  }
  log.authyId = event.headers.authyId
  log.requestId = event.headers.requestId

  let account = new AccountModel()
  account.authyId = event.headers.authyId
  account.getAccount((error, result) => {
    if (error) {
      log.content.error = error
      log.send()

      bugfixes.error('List Applications', 'Account Check', error)

      return callback(error)
    }

    if (result.accountId) {
      let accountId = result.accountId

      log.accountId = accountId

      let application = new ApplicationModel()
      application.accountId = accountId
      application.list((error, result) => {
        if (error) {
          log.content.error = error
          log.send()

          bugfixes.error('List Applications', 'List', error)

          return callback(error)
        }

        log.send()

        return callback(null, bugfunctions.lambdaResult(2000, result))
      })
    } else {
      return callback(null, bugfunctions.lambdaError(2001, 'Invalid Account'))
    }
  })
}
