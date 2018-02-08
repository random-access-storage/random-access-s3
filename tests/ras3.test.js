const test = require('tape')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const ras3 = require('../index')

test('it throws error if not provided a filename', (t) => {
  t.throws(ras3.bind({}, undefined, {}), /Random Access S3 requires a filename!/)
  t.end()
})

test('it throws error if not provided options', (t) => {
  t.throws(ras3.bind({}, 'filename', undefined), /Random Access S3 requires configuration options to be set!/)
  t.end()
})

test('it throws error if not provided options', (t) => {
  t.throws(ras3.bind({}, 'filename', {}), /Random Access S3 requires options.bucket/)
  t.end()
})

test('ras3 returns a object with expected interface', (t) => {
  var s3 = ras3('filename', { bucket: 'fake-bucket' })
  t.ok(typeof s3.read === 'function')
  t.ok(typeof s3.write === 'function')
  t.ok(typeof s3.del === 'function')
  t.end()
})

test('uses default s3 client if options.s3 is not set', (t) => {
  var stub = sinon.stub().returns({})
  var proxyRas3 = proxyquire('../index', {
    'aws-sdk/clients/s3': stub
  })
  proxyRas3('filename', { bucket: 'fake-bucket' })
  t.ok(stub.calledWithNew)
  t.end()
})

test('ras3.read calls s3.getObject with offsets', (t) => {
  t.comment('strips preceding forward slashes on filenames')
  var stub = sinon.stub().callsFake((params, cb) => cb(null, { Body: 'somedata' }))
  var proxyRas3 = proxyquire('../index', {
    'aws-sdk/clients/s3': function () {
      this.getObject = stub
    }
  })
  var s3 = proxyRas3('/filename', { bucket: 'fake-bucket' })
  s3.read(10, 20, (err, res) => {
    t.error(err)
    t.ok(stub.calledOnce)
    t.ok(stub.calledWith({
      Bucket: 'fake-bucket',
      Key: 'filename',
      Range: `bytes=10-29`
    }))
    t.end()
  })
})

test('ras3.read returns error in callback if s3.getObject errors', (t) => {
  var stub = sinon.stub().callsFake((params, cb) => cb(new Error('BOOM!')))
  var proxyRas3 = proxyquire('../index', {
    'aws-sdk/clients/s3': function () {
      this.getObject = stub
    }
  })
  var s3 = proxyRas3('/filename', { bucket: 'fake-bucket' })
  s3.read(10, 20, (err, res) => {
    t.ok(err.message === 'BOOM!')
    t.end()
  })
})

test('ras3.write does not throw error', (t) => {
  var s3 = ras3('test-write', { bucket: 'fake-bucket' })
  t.doesNotThrow(s3.write.bind(s3, 10, 'some-data'))
  t.end()
})

test('ras3.write logs with options.verbose === true', (t) => {
  var stub = sinon.stub()
  var proxyRas3 = proxyquire('../index', {
    './lib/logger': {
      log: stub
    }
  })
  var s3 = proxyRas3('test-write', { bucket: 'fake-bucket', verbose: true })
  s3.write(10, 'some-data', (err, res) => {
    t.error(err)
    t.ok(stub.calledOnce)
    t.ok(stub.calledWith('trying to write', 'test-write', 10, 'some-data'))
    t.end()
  })
})

test('ras3.del does not throw error', (t) => {
  var s3 = ras3('test-del', { bucket: 'fake-bucket' })
  t.doesNotThrow(s3.del.bind(s3, 10, 100))
  t.end()
})

test('ras3.del logs with options.verbose === true', (t) => {
  var stub = sinon.stub()
  var proxyRas3 = proxyquire('../index', {
    './lib/logger': {
      log: stub
    }
  })
  var s3 = proxyRas3('test-del', { bucket: 'fake-bucket', verbose: true })
  s3.del(10, 100, (err, res) => {
    t.error(err)
    t.ok(stub.calledOnce)
    t.ok(stub.calledWith('trying to del', 'test-del', 10, 100))
    t.end()
  })
})
