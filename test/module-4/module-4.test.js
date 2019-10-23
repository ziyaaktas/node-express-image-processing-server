const assert = require('assert')
const fs = require('fs')
const path = require('path')
const proxyquire = require('proxyquire').noCallThru()
const request = require('supertest')
const rewire = require('rewire')
const { JSDOM } = require('jsdom')
const imageProcessor = require('../../api/src/imageProcessor')
const app = require('../../api/app')

describe('module 4', () => {


  context('imageProcessor.js', () => {

    it('You should export the image processor function', () => {
      expect(typeof imageProcessor).to.equal('function')
    })

    it('the image processor function should return a promise', async () => {
      const x = proxyquire('../../api/src/imageProcessor', {
        worker_threads: {
          isMainThread: false
        }
      })

      await assert.rejects(x('fsaf'),{ message: 'not on main thread' })
    })

    it('should assign a call to path.resolve to the constant pathToResizeWorker', () => {
      const pathStub = sinon.stub()
      const pathProxy = proxyquire('../../api/src/imageProcessor', {
        path: {
          resolve: pathStub
          }
      })

      expect(pathStub.firstCall.args[0]).to.equal(path.resolve(__dirname + '../../../api/src'))
      expect(pathStub.firstCall.args[1]).to.equal('resizeWorker.js')
    })

    it('should assign a call to path.resolve to the constant pathToMonochromeWorker', () => {
      const pathStub = sinon.stub()
      const pathProxy = proxyquire('../../api/src/imageProcessor', {
        path: {
          resolve: pathStub
          }
      })

      expect(pathStub.secondCall.args[0]).to.equal(path.resolve(__dirname + '../../../api/src'))
      expect(pathStub.secondCall.args[1]).to.equal('monochromeWorker.js')
    })

    it('should define a function uploadPathResolver that takes a filename as it\s argument', () => {
      const uploadPathResolver = rewire('../../api/src/imageProcessor').__get__('uploadPathResolver')
      const expected = uploadPathResolver('kittens.png')

      expect(path.resolve(__dirname + '../../../api/uploads/kittens.png')).to.equal(expected)
      
    })

    it('should assign a call to uploadPathResolver to a constant', async () => {
      const pathStub = sinon.stub()
      const imageProcessorProxy = proxyquire('../../api/src/imageProcessor', {
        path: {
          resolve: pathStub
        },
        worker_threads: {
          Worker: sinon.stub(),
          isMainThread: false
        },
        '@noCallThru': true
      })

      try {
        await imageProcessorProxy('moarKittens.png')
      } catch (err) {
        //do nothing
      }

      expect(pathStub.thirdCall.args[2]).to.equal('moarKittens.png')
    })

    it('should assign a call to uploadPathResolver to a constant passing in resized- concatenated with the filename', async () => {
      const pathStub = sinon.stub()
      const imageProcessorProxy = proxyquire('../../api/src/imageProcessor', {
        path: {
          resolve: pathStub
        },
        worker_threads: {
          Worker: sinon.stub(),
          isMainThread: false
        },
        '@noCallThru': true
      })

      try {
        await imageProcessorProxy('moarKittens.png')
      } catch (err) {
        //do nothing
      }

      expect(pathStub.getCall(3).args[2]).to.equal('resized-moarKittens.png')
    })

    it('should assign a call to uploadPathResolver to a constant passing in monochrome- concatenated to the filename', async () => {
      const pathStub = sinon.stub()
      const imageProcessorProxy = proxyquire('../../api/src/imageProcessor', {
        path: {
          resolve: pathStub
        },
        worker_threads: {
          Worker: sinon.stub(),
          isMainThread: false
        },
        '@noCallThru': true
      })

      try {
        await imageProcessorProxy('moarKittens.png')
      } catch (err) {
        //do nothing
      }

      expect(pathStub.getCall(4).args[2]).to.equal('monochrome-moarKittens.png')
    })

    it('should assign an instantiation of the Worker class to a constant representing the resizeWorker.', () => {
      const imageProcessor = rewire('../../api/src/imageProcessor')
      imageProcessor.__set__('pathToResizeWorker', path.resolve('./test/module-4/resizeStub.js'))
      imageProcessor.__set__('pathToMonochromeWorker', path.resolve('./test/module-4/resizeStub.js'))

      const workerStub = sinon.stub()
      const imageProcessorProxy = proxyquire('../../api/src/imageProcessor', {
        worker_threads: {
          Worker: workerStub,
          isMainThread: true,
          '@noCallThru': true
        }
      })

      try {
        imageProcessorProxy('hereIsTheFile.png')
      } catch (err) {
      }
      
      expected = [
        path.resolve(__dirname, '../../api/src/resizeWorker.js'),
        {
          workerData: {
            source: path.resolve(__dirname, '../../api/uploads/hereIsTheFile.png'),
            destination: path.resolve(__dirname, '../../api/uploads/resized-hereIsTheFile.png')
          }
        }]
      expect(workerStub.getCall(0).args).to.eql(expected)
    })

    it('should assign an instantiation of the Worker class to a constant representing the monochromeWorker.', () => {
      const workerStub = sinon.stub()
      const imageProcessorProxy = proxyquire('../../api/src/imageProcessor', {
        worker_threads: {
          Worker: workerStub,
          isMainThread: true,
        }
      })

      try {
        imageProcessorProxy('hereIsTheFile.png')
      } catch (errr) {

      }
      
      expected = [
        path.resolve(__dirname, '../../api/src/monochromeWorker.js'),
        {
          workerData: {
            source: path.resolve(__dirname, '../../api/uploads/hereIsTheFile.png'),
            destination: path.resolve(__dirname, '../../api/uploads/monochrome-hereIsTheFile.png')
          }
        }]
      expect(workerStub.getCall(1).args).to.eql(expected)
    })

    it('should resolve the promise on resizeWorker\'s \'message\' event', async () => {
      let result

      const imageProcessor = rewire('../../api/src/imageProcessor')
      imageProcessor.__set__('pathToResizeWorker', path.resolve('./test/module-4/resizeWorkerProxy.js'))
      imageProcessor.__set__('pathToMonochromeWorker', path.resolve('./test/module-4/monochromeFast.js'))

      try {
       result = await imageProcessor('ullr.png')
      } catch(err) {
        //do nothing
      }


      expect(result).to.equal('resizeWorker finished processing') 
    })

    it('should reject the promise on resizeWorker\'s \'error\' event', async () => {
      let error
      let result

      const imageProcessor = rewire('../../api/src/imageProcessor')
      imageProcessor.__set__('pathToResizeWorker', path.resolve('./test/module-4/resizeWorkerProxyError.js'))
      imageProcessor.__set__('pathToMonochromeWorker', path.resolve('./test/module-4/monochromeStub.js'))

      try {
       result = await imageProcessor('ullr.png')
      } catch(err) {
        error = err
      }
      
     expect(error).to.eql({ resizeError: "stubby mc stubface was here"}) 
    })
    
    it('should resolve the promise on resizeWorker\'s \'exit\' event when process exit\'s > 0', async () => {
      let error
      let result

      const imageProcessor = rewire('../../api/src/imageProcessor')
      imageProcessor.__set__('pathToResizeWorker', path.resolve('./test/module-4/resizeWorkerProxyExitCode1.js'))
      imageProcessor.__set__('pathToMonochromeWorker', path.resolve('./test/module-4/monochromeStub.js'))

      try {
       result = await imageProcessor('ullr.png')

      } catch(err) {
        error = err
      }
      
      return expect(error).to.eql({ ExitError: 1 })

    })
    
    it('should resolve the promise on monochromeWorker\'s \'message\' event', async () => {
      let result

      const imageProcessor = rewire('../../api/src/imageProcessor')
      imageProcessor.__set__('pathToMonochromeWorker', path.resolve('./test/module-4/resizeWorkerProxy.js'))
      imageProcessor.__set__('pathToResizeWorker', path.resolve('./test/module-4/monochromeFast.js'))

      try {
       result = await imageProcessor('ullr.png')
      } catch(err) {
        //do nothing
      }

      expect(result).to.equal('monochromeWorker finished processing') 
    })

    it('should reject the promise on monochromeWorker\'s \'error\' event', async () => {
      let error
      let result

      const imageProcessor = rewire('../../api/src/imageProcessor')
      imageProcessor.__set__('pathToMonochromeWorker', path.resolve('./test/module-4/resizeWorkerProxyError.js'))
      imageProcessor.__set__('pathToResizeWorker', path.resolve('./test/module-4/monochromeStub.js'))

      try {
       result = await imageProcessor('ullr.png')
      } catch(err) {
        error = err 
      }
      
      return expect(error).to.eql({ monochromeError: "stubby mc stubface was here"}) 
    })
    
    it('should resolve the promise on monochromeWorker\'s \'exit\' event when process exit\'s > 0', async () => {
      let error
      let result

      const imageProcessor = rewire('../../api/src/imageProcessor')
      imageProcessor.__set__('pathToMonochromeWorker', path.resolve('./test/module-4/resizeWorkerProxyExitCode1.js'))
      imageProcessor.__set__('pathToResizeWorker', path.resolve('./test/module-4/monochromeStub.js'))
      try {
       result = await imageProcessor('ullr.png')
      } catch(err) {
        error = err
      }
      
      return expect(error).to.eql({ ExitError: 1 })

    })
  })

  context('router.js', async () => {

    const directory = path.resolve(__dirname + '../../../api/uploads')

    it('should add a call to imageProcessor passing in the image in our post request', async () => {
    let files = fs.readdirSync(directory)

    for (const file of files) {
      fs.unlinkSync(directory +'/' + file)
    }

   
      await request(app)
        .post('/upload')
        .attach('photo', path.resolve(__dirname, '../../client/photos/ullr.png'))
        .expect(201)

    files = fs.readdirSync(directory)

    expect(files.includes('ullr.png')).to.be.true 
    expect(files.includes('resized-ullr.png')).to.be.true 
    expect(files.includes('monochrome-ullr.png')).to.be.true 

    }) 

  })

  context('photo-viewer.html', () => {
    let images
    beforeEach((done) => {

    JSDOM.fromFile(path.resolve(__dirname, '../../client', 'photo-viewer.html'))
        .then((dom) => {
          images = dom.window.document.getElementsByTagName("img")
          done()
        })
    })

    afterEach(() => {
      sinon.restore()
    })

    it('should add an img tag with an src of monochrome-ullr.png', () => {
      expect(images[1].attributes.src.value).to.equal('monochrome-ullr.png')
    })

    it('should add an img tag with an src of resized-ullr.png', () => {
      expect(images[2].attributes.src.value).to.equal('resized-ullr.png')
    })



  })
})

