# mailext-options-sync

## Based on https://github.com/fregante/webext-options-sync

In particular, the lz4 compression has been removed.

> Helps you manage and autosave your extension's options.

Main features:

- Define your default options
- Add autoload and autosave to your options `<form>`
- Run migrations on update

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Install](#install)
- [Usage](#usage)
  - [Simple usage](#simple-usage)
  - [Advanced usage](#advanced-usage)
  - [Form autosave and autoload](#form-autosave-and-autoload)
    - [Input validation](#input-validation)
- [API](#api)
    - [const optionsStorage = new OptionsSync([setup])](#const-optionsstorage--new-optionssyncsetup)
    - [opts.set(options)](#optssetoptions)
    - [opts.setAll(options)](#optssetalloptions)
    - [opts.getAll()](#optsgetall)
    - [opts.syncForm(form)](#optssyncformform)
    - [opts.stopSyncForm()](#optsstopsyncform)
- [Related](#related)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

Use `npm`:

```sh
yarn run build
```

```js
import OptionsSync from 'webext-options-sync';
```

## Usage

This module requires the `storage` permission in `manifest.json`:

```json
{
	"name": "My Cool Extension",
	"permissions": [
		"storage"
	]
}
```

### Simple usage

You can set and get your options from any context (background, content script, etc):

```js
/* global OptionsSync */
const optionsStorage = new OptionsSync();

await optionsStorage.set({showStars: 10});

const options = await optionsStorage.getAll();
// {showStars: 10}
```

**Note:** `OptionsSync` relies on `chrome.storage.sync`, so its [limitations](https://developer.chrome.com/apps/storage#properties) apply, both the size limit and the type of data stored (which must be compatible with JSON).

### Advanced usage

It's suggested to create an `options-storage.js` file with your defaults and possible migrations, and import it where needed:

```js
/* global OptionsSync */
window.optionsStorage = new OptionsSync({
	defaults: {
		colorString: 'green',
		anyBooleans: true,
		numbersAreFine: 9001
	},

	// List of functions that are called when the extension is updated
	migrations: [
		(savedOptions, currentDefaults) => {
			// Perhaps it was renamed
			if (savedOptions.colour) {
				savedOptions.color = savedOptions.colour;
				delete savedOptions.colour;
			}
		},

		// Integrated utility that drops any properties that don't appear in the defaults
		OptionsSync.migrations.removeUnused
	]
});
```

Include this file as a background script: it's where the `defaults` are set for the first time and where the `migrations` are run. This example also includes it in the content script, if you need it there:

```json
{
	"background": {
		"scripts": [
			"webext-options-sync.js",
			"options-storage.js",
			"background.js"
		]
	},
	"content_scripts": [
		{
			"matches": [
				"https://www.google.com/*",
			],
			"js": [
				"webext-options-sync.js",
				"options-storage.js",
				"content.js"
			]
		}
	]
}
```

Then you can use it this way from the `background` or `content.js`:

```js
/* global optionsStorage */
async function init () {
	const {colorString} = await optionsStorage.getAll();
	document.body.style.background = colorString;
}

init();
```

And also enable autosaving in your options page:

```html
<!-- Your options.html -->
<form>
	<label>Color: <input name="colorString"/></label><br>
	<label>Show: <input type="checkbox" name="anyBooleans"/></label><br>
	<label>Stars: <input name="numbersAreFine"/></label><br>
</form>

<script src="mailext-options-sync.js"></script>
<script src="options-storage.js"></script>
<script src="options.js"></script>
```

```js
// Your options.js file
/* global optionsStorage */

optionsStorage.syncForm(document.querySelector('form'));
```

### Form autosave and autoload

When using the `syncForm` method, `OptionsSync` will serialize the form using [dom-form-serializer](https://github.com/jefersondaniel/dom-form-serializer), which uses the `name` attribute as `key` for your options. Refer to its readme for more info on the structure of the data.

Any user changes to the form are automatically saved into `chrome.storage.sync` after 300ms (debounced). It listens to `input` events.

#### Input validation

If your form fields have any [validation attributes](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation#Validation-related_attributes) they will not be saved until they become valid.

<details>

Since autosave and validation is silent, you should inform the user of invalid fields, possibly via CSS by using the `:invalid` selector:

```css
/* Style the element */
input:invalid {
	color: red;
	border: 1px solid red;
}

/* Or display a custom error message */
input:invalid ~ .error-message {
	display: block;
}
```

</details>

## API

#### const optionsStorage = new OptionsSync(setup?)

Returns an instance linked to the chosen storage. It will also run any migrations if it's called in the background.

##### setup

Type: `object`

Optional. It should follow this format:

```js
{
	defaults: { // recommended
		color: 'blue'
	},
	migrations: [ // optional
		savedOptions => {
			if(savedOptions.oldStuff) {
				delete savedOptions.oldStuff
			}
		}
	],
}
```

###### defaults

Type: `object`

A map of default options as strings or booleans. The keys will have to match the options form fields' `name` attributes.

###### migrations

Type: `array`

A list of functions to run in the `background` when the extension is updated. Example:

```js
{
	migrations: [
		(savedOptions, defaults) => {
			// Change the `savedOptions`
			if(savedOptions.oldStuff) {
				delete savedOptions.oldStuff
			}

			// No return needed
		},

		// Integrated utility that drops any properties that don't appear in the defaults
		OptionsSync.migrations.removeUnused
	],
}
```

###### storageName

Type: `string`
Default: `'options'`

The key used to store data in `chrome.storage.sync`

###### logging

Type: `boolean`
Default: `true`

Whether info and warnings (on sync, updating form, etc.) should be logged to the console or not.

#### optionsStorage.set(options)

This will merge the existing options with the object provided.

**Note:** Any values specified in `default` are not saved into the storage, to save space, but they will still appear when using `getAll`. You just have to make sure to always specify the same `defaults` object in every context (this happens automatically in the [Advanced usage](#advanced-usage) above.)

##### options

Type: `object`
Default: `{}`
Example: `{color: red}`

A map of default options as strings, booleans, numbers and anything accepted by [dom-form-serializer](https://github.com/jefersondaniel/dom-form-serializer)’s `deserialize` function.

#### optionsStorage.setAll(options)

This will override **all** the options stored with your `options`.

#### optionsStorage.getAll()

This returns a Promise that will resolve with all the options.

#### optionsStorage.syncForm(form)

Any defaults or saved options will be loaded into the `<form>` and any change will automatically be saved via `chrome.storage.sync`

##### form

Type: `HTMLFormElement`, `string`

It's the `<form>` that needs to be synchronized or a CSS selector (one element). The form fields' `name` attributes will have to match the option names.

#### optionsStorage.stopSyncForm()

Removes any listeners added by `syncForm`.

## License

MIT © [Federico Brigante](https://bfred.it)
