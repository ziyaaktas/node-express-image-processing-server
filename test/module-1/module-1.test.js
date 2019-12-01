const AssertionError = require('assert').AssertionError;
const path = require('path');
const request = require('supertest');
const jsdom = require('jsdom');
const app = require('../../api/app');
const {JSDOM} = jsdom;

describe('module 1', () => {
  context('index.html', () => {
    let form;
    let fileInput;
    let submitButton;

    beforeEach((done) => {
      jsdomError = undefined;
      JSDOM.fromFile(path.resolve(__dirname, '../../client', 'index.html'))
          .then((dom) => {
            form = dom.window.document.getElementsByTagName('form')[0];
            fileInput = form.children[0];
            submitButton = form.children[1];
            done();
          })
          .catch((err) => {
            jsdomError = err;
            done();
          });
    });

    context('Form', () => {
      it('has a form tag @has-form-tag', () => {
        expect(form, '`index.html` does not contain a `form` tag').to.exist;
      });

      it('has a post method @set-the-encoding', () => {
        try {
          expect(form.attributes['method'].value).to.equal('post');
        } catch (err) {
          throw new Error('`index.js` the `form` does not have a `method` of `post`');
        }
      });

      it('has an enctype attribute with a value of multipart/form-data @set-the-encoding', () => {
        try {
          expect(form.attributes['enctype'].value).to.equal('multipart/form-data');
        } catch (err) {
          throw new Error('`index.js` the `form` does not have an `enctype` of `multipart/form-data`');
        }
      });

      it('has an action attribute with a value of /upload @set-the-encoding', () => {
        try {
          expect(form.attributes['action'].value).to.equal('/upload');
        } catch (err) {
          throw new Error('`index.js` the `form` does not have an `action` of `/upload`');
        }
      });
    });

    context('File Input', () => {
      it('has an input tag with a class of file-input @add-an-input', () => {
        try {
          expect(fileInput.className).to.equal('file-input');
        } catch (err) {
          throw new Error('`index.js` the `form` does not contain an `input` with a `class` name  of `file-input`');
        }
      });

      it('has a type attribute with a value of file @add-an-input', () => {
        try {
          expect(fileInput.attributes['type'].value).to.equal('file');
        } catch (err) {
          throw new Error('`index.js` the `input` does not have a `type` with a `value` of `file`');
        }
      });

      it('has a name attribute with a value of photo @add-an-input', () => {
        try {
          expect(fileInput.attributes['name'].value).to.equal('photo');
        } catch (err) {
          throw new Error('`index.js` the `input` does not have a `name` with a `value` of `photo`');
        }
      });
    });

    context('Submit Button', () => {
      it('has an input tag with a class of submit-button @add-a-submit-button', () => {
        try {
          expect(submitButton.className).to.equal('submit-button');
        } catch (err) {
          throw new Error('`index.js` the `form` does not contain an `input` tag with a `class` name of `submit-button`');
        }
      });

      it('has a type attribute with a value of submit @add-a-submit-button', () => {
        try {
          expect(submitButton.attributes['type'].value).to.equal('submit');
        } catch (err) {
          throw new Error('`index.js` the `submit-button` does not have a `type` with a value of `submit`');
        }
      });

      it('has a value attribute with a value of Submit @add-a-submit-button', () => {
        try {
          expect(submitButton.attributes['value'].value).to.equal('Submit');
        } catch (err) {
          throw new Error('`index.js` the `submit-button` does not have a `value` attribute with a value of `Submit`');
        }
      });
    });
  });

  context('app.js', () => {
    it('instantiates an express app @export-the-app', () => {
      try {
        expect(typeof app).to.be.equal('function');
      } catch (err) {
        throw new Error('`app.js` did you remember to export the app?');
      }
    });

    it('should serve our html file @respond-with-the-form', async () => {
      try {
        await request(app)
            .get('/')
            .expect(200)
            .expect('Content-Type', /html/);
      } catch (err) {
        throw new Error('`App.js` did you pass the correct path to a call to `res.sendFile()`?');
      }
    });
  });
});
