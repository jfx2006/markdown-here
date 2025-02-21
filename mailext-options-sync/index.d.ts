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
export interface Setup<UserOptions extends Options> {
    storageName?: string;
    logging?: boolean;
    defaults?: UserOptions;
    /**
     * A list of functions to call when the extension is updated.
     */
    migrations?: Array<Migration<UserOptions>>;
    storageType?: StorageType;
}
/**
A map of options as strings or booleans. The keys will have to match the form fields' `name` attributes.
*/
export interface Options {
    [key: string]: string | number | boolean;
}
export type Migration<UserOptions extends Options> = (savedOptions: UserOptions, defaults: UserOptions) => Promise<void> | void;
declare class OptionsSync<UserOptions extends Options> {
    static migrations: {
        /**
        Helper method that removes any option that isn't defined in the defaults. It's useful to avoid leaving old options taking up space.
        */
        removeUnused(options: Options, defaults: Options): void;
    };
    storageName: string;
    storageType: StorageType;
    defaults: UserOptions;
    _form: HTMLFormElement | undefined;
    private readonly _migrations;
    /**
    @constructor Returns an instance linked to the chosen storage.
    @param setup - Configuration for `webext-options-sync`
    */
    constructor({ defaults, storageName, migrations, logging, storageType, }?: Setup<UserOptions>);
    private get storage();
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
    getAll(): Promise<UserOptions>;
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
    get(_keys: string | string[]): Promise<UserOptions>;
    /**
    Overrides **all** the options stored with your `options`.

    @param newOptions - A map of default options as strings or booleans. The keys will have to match the form fields' `name` attributes.
    */
    setAll(newOptions: UserOptions): Promise<void>;
    /**
    Merges new options with the existing stored options.

    @param newOptions - A map of default options as strings or booleans. The keys will have to match the form fields' `name` attributes.
    */
    set(newOptions: Partial<UserOptions>): Promise<void>;
    /**
     Reset a field or fields to the default value(s).
     @param _key - A single string key or an array of strings of keys to reset
     @returns Promise that will resolve with the default values of the given options

     @example
     optionsStorage.reset("color");
     */
    reset(_key: string): Promise<UserOptions | void>;
    /**
    Any defaults or saved options will be loaded into the `<form>` and any change will automatically be saved to storage

    The form fields' `name` attributes will have to match the option names.
     * @param form
     */
    syncForm(form: string | HTMLFormElement): Promise<void>;
    /**
    Removes any listeners added by `syncForm`
    */
    stopSyncForm(): void;
    private _log;
    private _getAll;
    private _get;
    private _setAll;
    private _encode;
    private _decode;
    private _remove;
    private _runMigrations;
    private readonly _handleFormInput;
    private _handleFormSubmit;
    private _updateForm;
    private _parseForm;
    private readonly _handleStorageChangeOnForm;
}
export default OptionsSync;
