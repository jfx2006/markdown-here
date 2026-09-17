# Customui experiment notes

This is a slightly modified version of the customui mailextension experiment
from https://github.com/rsjtdrjgfuzkfg/thunderbird-experiments.

A new sidebar location was added: "LOCATION_COMPOSE_EDITOR". The 
"LOCATION_COMPOSE" fills the entire height of the compose window, while
"LOCATION_COMPOSE_EDITOR" is the height of the editor portion of the
window.

A "width_ratio" location option was added: for "LOCATION_COMPOSE_EDITOR" it
sets the preview column width as a fraction (0..1) of its container, applied
as a CSS percentage so the preview follows window resizing. It replaces the
pixel-based "width" option for that location.

