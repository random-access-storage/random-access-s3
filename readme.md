# random-access-s3

An implementation of [abstract-random-access](https://www.npmjs.com/package/abstract-random-access) on top of an AWS S3 bucket.
Providing the same interface as [random-access-file](https://www.npmjs.com/package/random-access-file) and [random-access-memory](https://www.npmjs.com/package/random-access-memory).

## Why?
This is an experiment to see if we can serve [dat](http://datproject.org) data over aws s3. It is possible.

**TLDR;**  Latency is a killer.

## Installation

```
npm install random-access-s3 --save
```

## Basic Example

```js
var ras3 = require('random-access-s3')

var file = ras3('AVHRR/GIMMS/3G/00READMEgeo.txt', { bucket: 'nasanex' })

file.read(100, 200, (err, data) => {
  if (err) {
    console.log('Something went wrong!')
    console.log(err)
    return
  }
  console.log(data.toString())
})
```

## API

#### var file = ras3(file, options)

Open a new random access s3 file.

Options include:
```js
{
  s3: pass in a configured instance of s3. // Optional. Default: 'new AWS.S3()'
  bucket: string, // name of the target bucket
  verbose: boolean, // Optional. Default: false.
}
```

#### file.read(offset, length, callback)

Read a buffer at a specific offset of specified length. Callback is called with the read buffer or error if there was an error.

Expects callback of the form `function (err, result) {}`.

#### file.write(offset, buffer, callback)

**Write is not implemented.** This will silently fail with no data being writen.
