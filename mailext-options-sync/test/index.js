import test from 'ava';
import OptionsSync from '../index.js';

OptionsSync.prototype._log = () => {};

function flattenInstance(setup) {
	return JSON.parse(JSON.stringify(setup));
}

const defaultSetup = {
	_migrations: {},
	defaults: {},
	storageType: 'sync',
};

const simpleSetup = {
	_migrations: {},
	defaults: {
		color: 'red',
		sound: true,
	},
	storageType: 'sync',
};

test.beforeEach(() => {
	chrome.flush();
	chrome.runtime.getManifest.returns({
		version: 2,
		background: {scripts: 'background.js'},
	});
	chrome.storage.sync.set.resolves(undefined);
	chrome.management.getSelf.resolves({
		installType: 'development',
	});
});

test.serial('basic usage', t => {
	t.deepEqual(flattenInstance(new OptionsSync()), defaultSetup);
	t.deepEqual(flattenInstance(new OptionsSync(simpleSetup)), simpleSetup);
});

test.serial('getAll returns empty object when storage is empty', async t => {
	chrome.storage.sync.get.resolves({});

	const storage = new OptionsSync();
	t.deepEqual(await storage.getAll(), {});
});

test.serial('getAll returns defaults when storage is empty', async t => {
	chrome.storage.sync.get.resolves({});

	const storage = new OptionsSync(simpleSetup);
	t.deepEqual(await storage.getAll(), simpleSetup.defaults);
});

test.serial('getAll returns saved options', async t => {
	const previouslySavedOptions = {
		color: 'fucsia',
		people: 3,
	};

	chrome.storage.sync.get.resolves(previouslySavedOptions);

	const storage = new OptionsSync();
	t.deepEqual(await storage.getAll(), previouslySavedOptions);
});

test.serial('getAll returns saved legacy options', async t => {
	const previouslySavedOptions = {
		color: 'fucsia',
		people: 3,
	};

	chrome.storage.sync.get.resolves(previouslySavedOptions);

	const storage = new OptionsSync();
	t.deepEqual(await storage.getAll(), previouslySavedOptions);
});

test.serial('getAll merges saved options with defaults', async t => {
	const previouslySavedOptions = {
		color: 'fucsia',
		people: 3,
	};

	chrome.storage.sync.get.resolves(previouslySavedOptions);

	const storage = new OptionsSync(simpleSetup);
	t.deepEqual(await storage.getAll(), {
		color: 'fucsia',
		people: 3,
		sound: true,
	});
});

test.serial('setAll', async t => {
	const newOptions = {
		name: 'Rico',
		people: 3,
	};

	const storage = new OptionsSync();
	await storage.setAll(newOptions);
	t.true(chrome.storage.sync.set.calledOnce);
	t.deepEqual(chrome.storage.sync.set.firstCall.args[0], newOptions);
});

test.serial('setAll skips defaults', async t => {
	const newOptions = {
		name: 'Rico',
		people: 3,
	};

	const storage = new OptionsSync(simpleSetup);
	await storage.setAll({...newOptions, sound: true});
	t.true(chrome.storage.sync.set.calledOnce);
	chrome.storage.sync.get.resolves(newOptions);
});

test.serial('set merges with existing data', async t => {
	chrome.storage.sync.get.resolves({size: 30});

	const storage = new OptionsSync();
	await storage.set({sound: false});
	t.is(chrome.storage.sync.set.callCount, 1);
	t.deepEqual(chrome.storage.sync.set.firstCall.args[0], {
		size: 30,
		sound: false,
	});
});

test.serial('migrations alter the stored options', async t => {
	chrome.storage.sync.get.resolves({size: 30});

	const storage = new OptionsSync({
		migrations: [
			savedOptions => {
				if (typeof savedOptions.size !== 'undefined') {
					savedOptions.minSize = savedOptions.size;
					delete savedOptions.size;
				}
			},
		],
	});

	await storage._migrations;

	t.is(chrome.storage.sync.set.callCount, 1);
	chrome.storage.sync.get.resolves({
		minSize: 30,
	});
});

test.serial('migrations shouldn’t trigger updates if they don’t change anything', async t => {
	chrome.storage.sync.get.resolves({});

	const storage = new OptionsSync({
		migrations: [
			() => null,
		],
	});

	await storage._migrations;

	t.true(chrome.storage.sync.set.notCalled);
});

test.serial('migrations are completed before future get/set operations', async t => {
	chrome.storage.sync.get.resolves({});

	const storage = new OptionsSync({
		migrations: [
			savedOptions => {
				savedOptions.foo = 'bar';
				chrome.storage.sync.get.resolves({
					foo: 'bar',
				});
			},
		],
	});

	t.deepEqual(await storage.getAll(), {
		foo: 'bar',
	});
});

test.serial('removeUnused migration works', async t => {
	chrome.storage.sync.get
		.resolves({
			settings: {
				size: 30, // Unused
				sound: false, // Non-default
			},
		});

	const storage = new OptionsSync(simpleSetup);
	await storage._runMigrations([
		OptionsSync.migrations.removeUnused,
	]);

	t.is(chrome.storage.sync.set.callCount, 1);
	chrome.storage.sync.get.resolves({
		sound: false,
	});
});

test.todo('form syncing');
