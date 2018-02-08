var S3 = require('aws-sdk/clients/s3')
var randomAccess = require('random-access-storage')
var logger = require('./lib/logger')

function sanitizeKeyForS3 (key) {
  if (typeof key === 'string' && key.length && key[0] === '/') return key.slice(1)
  return key
}

function s3 (filename, options) {
  if (!filename) throw new Error('Random Access S3 requires a filename!')
  if (!options) throw new Error('Random Access S3 requires configuration options to be set!')
  if (!options.bucket) throw new Error('Random Access S3 requires options.bucket!')
  const s3 = (options && options.s3) || new S3()
  const key = sanitizeKeyForS3(filename)
  const bucket = options && options.bucket
  const verbose = !!(options && options.verbose)
  return randomAccess({
    read: function (req) {
      var params = {
        Bucket: bucket,
        Key: key,
        Range: `bytes=${req.offset}-${req.offset + req.size - 1}`
      }
      if (verbose) logger.log('Trying to read', key, params.Range)
      s3.getObject(params, (err, data) => {
        if (err) {
          if (verbose) {
            logger.log('error', key, params.Range)
            logger.log(err, err.stack)
          }
          return req.callback(err)
        }
        if (verbose) logger.log('read', data.Body)
        req.callback(null, data.Body)
      })
    },
    write: function (req) {
      if (verbose) logger.log('trying to write', key, req.offset, req.data)
      req.callback()
    },
    del: function (req) {
      if (verbose) logger.log('trying to del', key, req.offset, req.size)
      req.callback()
    }
  })
}

module.exports = s3
