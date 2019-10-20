const path = require('path')
const proxyquire = require('proxyquire').noCallThru()
const multer = require('multer')
const request = require('supertest')
const rewire = require('rewire')
const express = require('express')
const app = require('../../api/app')
const { JSDOM } = require('jsdom')

describe('module 3', () => {

  

  let appSpy
  let ullrImg
  let writeStub
  let resizeStub
  let postMessageStub
  let gmStub

  beforeEach((done) => {

  JSDOM.fromFile(path.resolve(__dirname, '../../client', 'photo-viewer.html'))
      .then((dom) => {
        ullrImg = dom.window.document.getElementsByTagName("img")[0]
        done()
      })
  })

  afterEach(() => {
    sinon.restore()
  })

  it('router should resolve the correct path and save it to the photoPath', () => {
    const router = rewire('../../api/src/router')
    const photoPath = router.__get__('photoPath')
    
    expect(photoPath).to.equal(path.resolve(__dirname, '../../client/photo-viewer.html'))
  })

  it('router should make a successful get request that returns a 200 and the photo-viewer.html page', async () => {
    await request(app)
      .get('/photo-viewer')
      .expect(200)
      .expect('Content-Type', /html/)
  })

  it('photo-viewer.html should add an img tag with an src of ullr.png to photo-viewer.html', () => {
    expect(ullrImg.attributes.src.value).to.equal('ullr.png')
  })

  context('resizeWorker', () => {
    beforeEach(() => {
      appSpy = sinon.spy()
      writeStub = sinon.stub()
      resizeStub = sinon.stub().returns({
        write: writeStub
      })
      postMessageStub = sinon.stub()
      gmStub = sinon.stub().returns({
          resize: resizeStub,
          '@noCallThru': true
        })

      proxyquire('../../api/src/resizeWorker', {
        worker_threads: {
          workerData: {
            source: 'path-to-image',
            destination: 'destination-of-image'
          },
          parentPort: {
            postMessage: postMessageStub
          }
        },
        gm: gmStub 
      })
    })

    it('should pass workerData.source to gm', () => {
      expect(gmStub.firstCall.args[0]).to.equal('path-to-image')
    })

    it('should chain a call to resize off gm passing in 100 as the first and second arg', () => {
      expect(resizeStub.firstCall.args[0]).to.equal(100)
      expect(resizeStub.firstCall.args[1]).to.equal(100)
    })

    it('should chain a call to write off of resize passing in the workerData.destination and a callback', () => {
      expect(typeof writeStub.firstCall.args[1]).to.equal('function')
      expect(writeStub.firstCall.args[0]).to.equal('destination-of-image')
    })

    it('should throw errors passed to the callback passed into write', () => {
      expect(
        () => writeStub.firstCall.args[1](new Error('Error in resize'))
      ).to.throw(Error, 'Error in resize')
    })
  })

  context('monochromeWorker', () => {
    beforeEach(() => {
      appSpy = sinon.spy()
      writeStub = sinon.stub()
      monochromeStub = sinon.stub().returns({
        write: writeStub
      })
      postMessageStub = sinon.stub()
      gmStub = sinon.stub().returns({
          monochrome: monochromeStub,
          '@noCallThru': true
        })

      proxyquire('../../api/src/monochromeWorker', {
        worker_threads: {
          workerData: {
            source: 'path-to-image',
            destination: 'destination-of-image'
          },
          parentPort: {
            postMessage: postMessageStub
          }
        },
        gm: gmStub 
      })
    })
    it('should pass workerData.source to gm', () => {
      expect(gmStub.firstCall.args[0]).to.equal('path-to-image')
    })

    it('should chain a call to monochrome', () => {
      expect(monochromeStub.calledOnce).to.be.true
    })

    it('should chain a call to write off of resize passing in the workerData.destination and a callback', () => {
      expect(typeof writeStub.firstCall.args[1]).to.equal('function')
      expect(writeStub.firstCall.args[0]).to.equal('destination-of-image')
    })

    it('should throw errors passed to the callback passed into write', () => {
      expect(
        () => writeStub.firstCall.args[1](new Error('Error in resize'))
      ).to.throw(Error, 'Error in resize')
    })

    it('should post a message on the parent port if no errors are thrown', () => {
      writeStub.firstCall.args[1]()
      expect(postMessageStub.firstCall.args[0]).to.eql({ monochrome: true })
    })
  })
})
