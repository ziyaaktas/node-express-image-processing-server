const path = require('path')
const request = require('supertest')
const express = require('express')
const jsdom = require('jsdom')
const app = require('../../api/app')
const { JSDOM } = jsdom

describe('module 1', () => {

  context('index.html', () => {
    let form
    let fileInput
    let submitButton

    beforeEach((done) => {
    JSDOM.fromFile(path.resolve(__dirname, '../../client', 'index.html'))
        .then((dom) => {
          form = dom.window.document.getElementsByTagName("form")[0]
          fileInput = form.children[0]
          submitButton = form.children[1]
          done()
        })
    })

    context('Form', () => {

      it('has a form tag @has-form-tag', () => {
        expect(form).to.exist
      })

      it('has a post method', () => {
        expect(form.attributes['method'].value).to.equal('post') 
      })

      it('has an enctype attribute with a value of multipart/form-data', () => {
        expect(form.attributes['enctype'].value).to.equal('multipart/form-data')
      })

      it('has an action attribute with a value of /upload', () => {
        expect(form.attributes['action'].value).to.equal('/upload')
      })

    })

    context('File Input', () => {

      it('has an input tag with a class of file-input', () => {
        expect(fileInput.className).to.equal('file-input')
      })

      it('has a type attribute with a value of file', () => {
        expect(fileInput.attributes['type'].value).to.equal('file')
      })

      it('has a name attribute with a value of photo', () => {
        expect(fileInput.attributes['name'].value).to.equal('photo')
      })
    })
    
    context('Submit Button', () => {

      it('has an input tag with a class of submit-button', () => {
        expect(submitButton.className).to.equal('submit-button')
      })

      it('has a type attribute with a value of submit', () => {
        expect(submitButton.attributes['type'].value).to.equal('submit')
      })

      it('has a value attribute with a value of Submit', () => {
        expect(submitButton.attributes['value'].value).to.equal('Submit')
      })
    })

  })

  context('app.js', () => {
    it('instantiates an express app', () => {
      expect(typeof app).to.be.equal('function')
    })

    it('should serve our html file', async () => {
      await request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/)
    })

  })


})
