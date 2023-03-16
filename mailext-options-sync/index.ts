/* @license
   Modified version of webext-options-sync from
   https://github.com/fregante/webext-options-sync

   Renamed chrome.* to messenger.*
   Use mail-ext-types.d.ts
   Remove lz4 compression
   Async migration functions
 */

import {debounce} from 'throttle-debounce';
import {isBackground} from 'webext-detect-page';
import {serialize, deserialize} from 'dom-form-serializer/dist/dom-form-serializer.mjs';

async function shouldRunMigrations(): Promise<boolean> {
	const self = await messenger.management?.getSelf();

	// Always run migrations during development #25
	if (self?.installType === 'development') {
		return true;
	}

	return new Promise(resolve => {
		// Run migrations when the extension is installed or updated
		messenger.runtime.onInstalled.addListener(() => {
			resolve(true);
		});

		// If `onInstalled` isn't fired, then migrations should not be run
		setTimeout(resolve, 500, false);
	});
}

export type StorageType = 'sync' | 'local';

/**
@example
{
	// Recommended
	defaults: {
		color: 'blue'
	},
	// Optional
	migrations: [
		savedOptions => {
			if (savedOptions.oldStuff) {
				delete savedOptions.oldStuff;
			}
		}
	],
}
*/
export type Setup<UserOptions extends Options> = {
	logging?: boolean;
	defaults?: UserOptions;
	/**
	 * A list of functions to call when the extension is updated.
	 */
	migrations?: Array<Migration<UserOptions>>;
	storageType?: StorageType;
};

/**
A map of options as strings or booleans. The keys will have to match the form fields' `name` attributes.
*/
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style -- Interfaces are extendable
export type Options = {
	[key: string]: string | number | boolean;
};

/*
Handler signature for when an extension updates.
*/
export type Migration<UserOptions extends Options> = (savedOptions: UserOptions, defaults: UserOptions) => Promise<UserOptions>;

class OptionsSync<UserOptions extends Options> {
	public static migrations = {
		/**
		Helper method that removes any option that isn't defined in the defaults. It's useful to avoid leaving old options taking up space.
		*/
		removeUnused(options: Options, defaults: Options) {
			for (const key of Object.keys(options)) {
				if (!(key in defaults)) {
					delete options[key];
				}
			}
		},
	};

	storageType: StorageType;

	defaults: UserOptions;

	_form: HTMLFormElement | undefined;

	private readonly _migrations: Promise<void>;

	/**
	@constructor Returns an instance linked to the chosen storage.
	@param setup - Configuration for `webext-options-sync`
	*/
	constructor({
		// `as` reason: https://github.com/fregante/webext-options-sync/pull/21#issuecomment-500314074
		defaults = {} as UserOptions,
		migrations = [],
		logging = true,
		storageType = 'sync',
	}: Setup<UserOptions> = {}) {
		this.defaults = defaults;
		this.storageType = storageType;

		if (!logging) {
			this._log = () => {};
		}

		this._migrations = this._runMigrations(migrations);
	}

	private get storage(): messenger.storage.StorageArea {
		return messenger.storage[this.storageType];
	}

	/**
	Retrieves all the options stored.

	@returns Promise that will resolve with **all** the options stored, as an object.

	@example
	const optionsStorage = new OptionsSync();
	const options = await optionsStorage.getAll();
	console.log('The user’s options are', options);
	if (options.color) {
		document.body.style.color = color;
	}
	*/
	async getAll(): Promise<UserOptions> {
		await this._migrations;
		return this._getAll();
	}

	/**
	Retrieves stored options for given keys.

	@param _keys - A single string key or an array of strings of keys to retrieve
	@returns Promise that will resolve with the options stored for the keys.

	@example
	const optionsStorage = new OptionsSync();
	const options = await optionsStorage.get("color");
	console.log('The user’s options are', options);
	if (options.color) {
		document.body.style.color = color;
	}
	 */
	async get(_keys: string | string[]): Promise<UserOptions> {
		await this._migrations;
		return this._get(_keys);
	}

	/**
	Overrides **all** the options stored with your `options`.

	@param newOptions - A map of default options as strings or booleans. The keys will have to match the form fields' `name` attributes.
	*/
	async setAll(newOptions: UserOptions): Promise<void> {
		await this._migrations;
		return this._setAll(newOptions);
	}

	/**
	Merges new options with the existing stored options.

	@param newOptions - A map of default options as strings or booleans. The keys will have to match the form fields' `name` attributes.
	*/
	async set(newOptions: Partial<UserOptions>): Promise<void> {
		return this.setAll({...await this.getAll(), ...newOptions});
	}

	/**
	 Reset a field or fields to the default value(s).
	 @param _key - A single string key or an array of strings of keys to reset
	 @returns Promise that will resolve with the default values of the given options

	 @example
	 optionsStorage.reset("color");
	 */
	async reset(_key: string): Promise<UserOptions | void> {
		await this._migrations;
		try {
			await this._remove(_key);
			if (this._form) {
				this._updateForm(this._form, await this.get(_key));
			}
		} catch {}
	}

	/**
	Any defaults or saved options will be loaded into the `<form>` and any change will automatically be saved to storage

	@param selector - The `<form>` that needs to be synchronized or a CSS selector (one element).
	The form fields' `name` attributes will have to match the option names.
	*/
	async syncForm(form: string | HTMLFormElement): Promise<void> {
		this._form = form instanceof HTMLFormElement
			? form
			: document.querySelector<HTMLFormElement>(form)!;

		this._form.addEventListener('input', this._handleFormInput);
		this._form.addEventListener('submit', this._handleFormSubmit);
		messenger.storage.onChanged.addListener(this._handleStorageChangeOnForm);
		this._updateForm(this._form, await this.getAll());
	}

	/**
	Removes any listeners added by `syncForm`
	*/
	async stopSyncForm(): Promise<void> {
		if (this._form) {
			this._form.removeEventListener('input', this._handleFormInput);
			this._form.removeEventListener('submit', this._handleFormSubmit);
			messenger.storage.onChanged.removeListener(this._handleStorageChangeOnForm);
			delete this._form;
		}
	}

	private _log(method: 'log' | 'info', ...args: any[]): void {
		console[method](...args);
	}

	private async _getAll(): Promise<UserOptions> {
		const _keys = Object.keys(this.defaults);
		const storageResults = await this.storage.get(_keys);
		for (const key of Object.keys(this.defaults)) {
			if (!storageResults[key]) {
				storageResults[key] = this.defaults[key];
			}
		}

		return storageResults as UserOptions;
	}

	private async _get(_keys: string | string[]): Promise<UserOptions> {
		if (typeof _keys === 'string') {
			_keys = [_keys];
		}

		const storageResults = await this.storage.get(_keys);
		for (const key of _keys) {
			// eslint-disable-next-line no-prototype-builtins
			if (!storageResults.hasOwnProperty(key) // eslint-disable-next-line no-prototype-builtins
				&& this.defaults.hasOwnProperty(key)) {
				storageResults[key] = this.defaults[key];
			}
		}

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		return storageResults;
	}

	private async _setAll(newOptions: UserOptions): Promise<void> {
		await this.storage.set(newOptions);
	}

	private async _remove(_key: string): Promise<void> {
		await this.storage.remove(_key);
	}

	private async _runMigrations(migrations: Array<Migration<UserOptions>>): Promise<void> {
		if (migrations.length === 0 || !isBackground() || !await shouldRunMigrations()) {
			return;
		}

		const options = await this._getAll();

		this._log('info', 'Will run', migrations.length, migrations.length === 1 ? 'migration' : ' migrations');
		let _migrateFunc: (Migration<UserOptions>);
		for (_migrateFunc of migrations) {
			const changes: UserOptions = await _migrateFunc(options, this.defaults);
			if (changes !== null) {
				await this._setAll(changes);
			}
		}
	}

	// eslint-disable-next-line @typescript-eslint/member-ordering -- Needs to be near _handleFormSubmit
	private readonly _handleFormInput = debounce(300, async ({target}: Event): Promise<void> => {
		const field = target as HTMLInputElement;
		if (!field.name) {
			return;
		}

		await this.set(this._parseForm(field.form!));
		field.form!.dispatchEvent(new CustomEvent('options-sync:form-synced', {
			bubbles: true,
		}));
	});

	private _handleFormSubmit(event: Event): void {
		event.preventDefault();
	}

	private _updateForm(form: HTMLFormElement, options: UserOptions): void {
		// Reduce changes to only values that have changed
		const currentFormState = this._parseForm(form);
		for (const [key, value] of Object.entries(options)) {
			if (currentFormState[key] === value) {
				delete options[key];
			}
		}

		const include = Object.keys(options);
		if (include.length > 0) {
			// Limits `deserialize` to only the specified fields. Without it, it will try to set the every field, even if they're missing from the supplied `options`
			deserialize(form, options, {include});
		}
	}

	// Parse form into object, except invalid fields
	private _parseForm(form: HTMLFormElement): Partial<UserOptions> {
		const include: string[] = [];

		// Don't serialize disabled and invalid fields
		for (const field of form.querySelectorAll<HTMLInputElement>('[name]')) {
			if (field.validity.valid && !field.disabled) {
				include.push(field.name.replace(/\[.*]/, ''));
			}
		}

		return serialize(form, {include});
	}

	private readonly _handleStorageChangeOnForm = (changes: Record<string, any>, areaName: string): void => {
		if (
			areaName === this.storageType
			&& changes
			&& changes['newValue']
			&& (!document.hasFocus() || !this._form!.contains(document.activeElement)) // Avoid applying changes while the user is editing a field
		) {
			this._updateForm(this._form!, changes['newValue']);
		}
	};
}

export default OptionsSync;
