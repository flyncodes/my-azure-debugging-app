const app = require('express')()

const ipAddr = process.env.IP_ADDR || '0.0.0.0'
const port = process.env.PORT || 8080

app.get('/status', (req, res) => res.status(200).send('OK'))

app.use((req, res, next) => {
  req.url = req.protocol + '://' + req.hostname + req.originalUrl
  logRequest(req)
  res.setHeader('Accept', 'text/plain')
  res.setHeader('Cache-Control', 'private, max-age=3600')
  res.setHeader('Content-Type', 'text/plain')
  if (req.method === 'OPTIONS') return res.status(200).send()
  return next()
})

app.get('/', (req, res) => {
  res.send({
      'ip': req.ip,
      'url': req.url,
      'requestheaders': req.headers
  })
})

app.get('/test_haproxy_config', (req, res) => {
  const child = require('child_process').spawn('haproxy', [ '-f', '/usr/local/etc/haproxy/haproxy.cfg', '-c' ])
  const output = []

  child.stdout.on('data', data => { output.push(data.toString()); console.log(data.toString()) })
  child.stderr.on('data', data => { output.push(data.toString()); console.log(data.toString()) })
  child.on('error', error => { res.status(500).send({ error }); console.error(error) })
  child.on('close', code => { if (res._headerSent) return; res.send({ code, output }); console.log('HAProxy config test exited with code', code) })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send({ success: false, error: 'Unknown error' })
})

app.use((req, res, next) => res.status(404).send({ success: false, error: 'Endpoint not found' }))

app.listen(port, ipAddr, () => console.info(`Webserver started on ${ipAddr}:${port}`))

function logRequest(req) {
  console.log('Request:', 'IP: ', req.ip, 'URL: ', req.url, 'Headers: ', req.headers)
}

module.exports = app
