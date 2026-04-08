This extension allows composing emails in Markdown and renders them to HTML
automatically. It only works when composing in HTML mode.

## Reproducing the build

### Requirements

(Python should not be needed for reproducing build with "make all")

- Node 24.14
- npm 11.12
- GNU Make
- Bash

or build in Docker using CI/Dockerfile

The extension code is not minified or bundled, however vendored libraries
are mostly from NPM packages. Part of the build process described below
is to copy and possibly esmify them. Libraries included in this manner
are listed in tools/vendored.yml. This file is used to generate vendored.mk,
which is all handled from Makefile.

### Building

The build is managed by GNU Make. 

- Extract the source code from the uploaded tarball

Install NPM dependencies, this runs `npm clean-install`
- make npm

Copy vendored dependencies into the extension directory
- make vendored

Build the extension XPI file.
- make build

The XPI file will be in the `web-ext-artifacts/` directory.

The above steps can be run with a single command if desired:
- make all

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

