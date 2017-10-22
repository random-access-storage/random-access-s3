var S3 = require('aws-sdk/clients/s3')

var Abstract = require('abstract-random-access')
var inherits = require('inherits')

function sanitizeKeyForS3 (key) {
  if (typeof key === 'string' && key.length && key[0] === '/') return key.slice(1)
  return key
}

var Store = function (filename, options) {
  if (!(this instanceof Store)) return new Store(filename, options)
  Abstract.call(this)
  this.s3 = options.s3 || new S3()
  this.key = sanitizeKeyForS3(filename)
  this.bucket = options.bucket
  this.verbose = !!options.verbose
  inherits(Store, Abstract)
}

Store.prototype._read = function (offset, length, callback) {
  var params = {
    Bucket: this.bucket,
    Key: this.key,
    Range: `bytes=${offset}-${offset + length - 1}`
  }
  if (this.verbose) console.log('Trying to read', this.key, params.Range)
  this.s3.getObject(params, (err, data) => {
    if (err) {
      if (this.verbose) {
        console.log('error', this.key, params.Range)
        console.log(err, err.stack)
      }
      return callback(err)
    }
    if (this.verbose) console.log('read', data.Body)
    callback(null, data.Body)
  })
}

// This is a dummy write function - does not write, but fails silently
Store.prototype._write = function (offset, buffer, callback) {
  if (this.verbose) console.log('trying to write', this.key, offset, buffer)
  callback()
}

module.exports = Store
