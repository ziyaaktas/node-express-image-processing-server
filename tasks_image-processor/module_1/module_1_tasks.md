# Creating the image upload page

## Add a form to the body
TASK 1:
In the `index.html` file inside the `client` directory, we are going to add a `form` tag. Let's put it inside the `body`.

## Set the form's encoding and action
TASK 2:
Let's add some attributes to our `form` tag. Add a `method` of `'post'` to the 
`form`. Add an `enctype` attribute with the string `'multipart/form-data'` to 
the `form` tag. Add an `action` attribute with the string `'/upload'`. 

## Add an input
TASK 3:
Inside our `form`, add an `input` with a `class` name of `'file-input'`. Give it a `type` attribute with the string value `'file'`.
Then, give it a `name` attribute with the string value of `'photo'`.

## Add a submit button
TASK 4:
Next we will add a submit button. Under our file `input`, let's create another `input` tag.
It should have a `class` of `'submit-button'`, a `type` attribute of `'submit'`, and a `value` attribute of `'Submit'`.

## Export the app
TASK 5:
For our next task, we will need to create our server. Let's open up `app.js`, which is inside the `api` directory. Let's start out by requiring `'express'` 
and `'path'`. Next, create a `const` called `app`, and let's assign a call to 
the `express()` function. Next, let's `export` our `app` on the `module.exports` 
object.

## Respond with the form
Task 6:
Right above our `module.exports` line, let's define a constant `pathToIndex` to represent the path to our `index.html` file. Call `path.join()`, and assign to it the constant we just created. Let's pass `__dirname` as the first argument, and a string value of `'../client/index.html'` as the second argument. As its first argument, use the path to the index file `pathToIndex` we previously defined, and as its second argument use `'index.html'`.

Module Outro:
At this point we have a working server that will serve our upload page.
Let's run `npm run start` to start up our server. Let's open up our browser and go to localhost port 3000.
