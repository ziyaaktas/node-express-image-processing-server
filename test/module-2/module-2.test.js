const path = require('path');
const proxyquire = require('proxyquire');
const multer = require('multer');
const request = require('supertest');
const rewire = require('rewire');
const app = require('../../api/app');

describe('module 2', () => {
  context('router', () => {
    let useSpy;

    beforeEach(() => {
      useSpy = sinon.spy();
      proxyquire('../../api/app', {
        express: sinon.stub().returns({
          get: sinon.spy(),
          post: sinon.spy(),
          set: sinon.spy(),
          use: useSpy,
          listen: sinon.spy(),
        }),
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should export the router object', () => {
      const router = rewire('../../api/src/router');
      expect(router).to.exist;
    });

    it('filename should call the callback with the correct arguments', () => {
      const router = rewire('../../api/src/router');
      const routerFilename = router.__get__('filename');
      const callbackSpy = sinon.spy();
      routerFilename({}, {originalname: 'photo.png'}, callbackSpy);

      const filenameArgs = callbackSpy.firstCall.args;

      expect(filenameArgs[0]).to.be.null;
      expect(filenameArgs[1]).to.equal('photo.png');
    });

    it('should configure a storage object with multer', () => {
      const stub = sinon.stub(multer, 'diskStorage');
      const router = rewire('../../api/src/router');
      const multerStorage = stub.firstCall.args[0];

      expect(multerStorage.destination).to.eql('api/uploads/');
      expect(typeof multerStorage.filename).to.equal('function');
    });

    it('fileFilter should call the callback with the correct arguments if the photo passes validation', () => {
      const spy = sinon.spy();
      const router = rewire('../../api/src/router');
      const fileFilter = router.__get__('fileFilter');
      const request = {};
      const file = {mimetype: 'image/png'};

      fileFilter(request, file, spy);

      const calledWith = spy.firstCall.args;

      expect(calledWith[0]).to.be.null;
      expect(calledWith[1]).to.be.true;
    });

    it('fileFilter should call the callback with the correct arguments if the photo fails validation', () => {
      const spy = sinon.spy();
      const router = rewire('../../api/src/router');
      const fileFilter = router.__get__('fileFilter');
      const request = {};
      const file = {mimetype: 'image/jpg'};

      fileFilter(request, file, spy);

      const calledWith = spy.firstCall.args;

      expect(calledWith[0]).to.be.null;
      expect(calledWith[1]).to.be.false;
      expect(calledWith[2]).to.be.an('error');
      expect(calledWith[2].message).to.equal('Wrong file type');
    });

    it('should call multer passing in a config object that contains the correct values', () => {
      const router = rewire('../../api/src/router');
      const upload = router.__get__('upload');

      expect(upload.storage).to.exist;
      expect(upload.fileFilter).to.exist;
      expect(upload.limits.filesize).to.equal(10000);
    });

    it('should pass bodyParser to app.use', () => {
      expect(useSpy.firstCall.args[0].name).to.equal('urlencodedParser');
    });

    it('should pass the router to app.use', () => {
      expect(useSpy.secondCall.args[0]).to.equal('/');
      expect(useSpy.secondCall.args[1].name).to.equal('router');
    });

    it('should make a post request that fails validation and receives a 400', async () => {
      const response = await request(app)
          .post('/upload')
          .attach('photo', path.resolve(__dirname, './ullr.jpg'))
          .expect(400);

      expect(JSON.parse(response.error.text).error).to.equal('Wrong file type');
    });

    it('should make a successful post request that returns a 201', async () => {
      await request(app)
          .post('/upload')
          .attach('photo', path.resolve(__dirname, '../../client/photos/ullr.png'))
          .expect(201);
    });
  });
});
