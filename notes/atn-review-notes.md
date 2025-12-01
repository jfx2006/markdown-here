This extension allows composing emails in Markdown and renders them to HTML
automatically. It only works when composing in HTML mode.

This is a near total re-write of Markdown Here Revival 3.x. The big new
feature is the split editing pane that's common in Markdown editors.

The split screen editor is handled in two pieces, a modified "customui"
experiment that adds a new "compose_editor" location. This limits the
injected browser to the contentArea rather than using the entire window
height like the "compose" location sidebar.

Within this browser, compose_preview/compose_preview.html is loaded and
its content is kept in sync with the editor via messages.

Other new features are listed in the changelog.

## About vendored code

Per the suggestion from the ATN review team, vendored code is no longer
kept in the repository. Running `make vendored` will download the
required libraries and copy them where they need to go. Note that
vendored code is now ignored by git.

Running `make all` will also run `make vendored`.

Running `make clean` removes the vendored code.


## How release builds are handled

The XPI and source files uploaded to ATN are built in a Docker container
on GitLab's CI.

In addition to the steps run by "make all" described below, prior to creating
the XPI and source tar files, "git status" gets run to verify that files
generated during the build match the ones checked in to the repository. I
acknowledge that there have been unexpected differences in past versions
which led to bugs in the extension.

## Reproducing the build

### Requirements

- Node 22
- pnPm
- GNU Make
- Bash
- Python 3.12 (earlier versions may work)

or build in Docker using CI/Dockerfile

The extension code is not minified or bundled, however vendored libraries
are mostly from NPM packages. Part of the build process described below
is to copy and possibly esmify them. Libraries included in this manner
are listed in tools/vendored.yml. This file is used to generate vendored.mk,
which is all handled from Makefile.

### Building

`make clean` will clear out node_modules and some other files to
force a rebuild.

Running `make all` will do the following:

- Run `pnpm install`
- Copy mailext-options-sync.js from the subrepo to extension/options.
  - If a full rebuild of this is needed, `make clean` will reset the
    subrepo and force a rebuild.
- Regenerate vendored.mk
- Build and copy the vendored NPM packages to the appropriate place under extension/
  - Some packages like highlightjs use a custom script, packages with dependencies
    are built with Rollup. Packages without dependencies are copied when possible.
- Build the XPI file using web-ext
