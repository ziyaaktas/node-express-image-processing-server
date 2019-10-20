const bodyParser = require('body-parser') //module 1
const express = require('express')//module 1
const path = require('path')//module 1

const router = require('./src/router') // module 2

const app = express() //module 1
const root = path.resolve(__dirname, '..', 'client') //module 1

app.use(bodyParser.urlencoded({extended: true})) // module 2

app.use('/', router) //module 2

app.use(express.static(path.resolve(__dirname, 'uploads'))) // module 2

app.use('/*', (req, res) => {
  res.sendFile(path.resolve(root, 'index.html'))
})  // module 1


module.exports = app //module 1
