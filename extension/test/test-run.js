/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

$(function () {
  mocha
    // I'm not sure what introduces the global "schemaTypes", but it's not
    // Markdown Here and it causes an error on one of my Chrome instances.
    .globals(["schemaTypes"]) // acceptable globals
    .run()
})
