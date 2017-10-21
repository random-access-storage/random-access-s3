var ras3 = require('./')

var file = ras3('AVHRR/GIMMS/3G/00READMEgeo.txt', { bucket: 'nasanex' })

file.read(100, 200, (err, data) => {
  if (err) {
    console.log('Something went wrong!')
    console.log(err)
    return
  }
  console.log(data.toString())
})
