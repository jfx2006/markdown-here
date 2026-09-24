Changes in 4.0.17 addressing the review of 4.0.16:

- Findings 1, 2, 6, 7 (extension/test/: chai, mocha, underscore): the test
  framework is now excluded from the source archive (export-ignore in
  .gitattributes, the archive is generated with git archive). It was never
  part of the XPI. underscore.js was unused and has been deleted from the
  repository.
- Finding 3 (remote resources in tools/compose*.html): these were manual test
  fixtures, not used by the build. They are excluded from the source archive
  as well.
- Finding 4: removed the unused `tabs` and `accountsRead` permissions.
- Finding 5: innerHTML and srcdoc are no longer used for markup insertion.
  - options.js inserts the DOMPurify output as a DOM fragment
    (RETURN_DOM_FRAGMENT + replaceChildren()).
  - compose_preview.js loads the preview iframe through `src` and fills its
    <style> elements with textContent.

  Element.setHTML() is not used yet: the 4.0.x branch still supports
  Thunderbird 128 (strict_min_version 128.0), and setHTML() is only available
  from Thunderbird 148. The next minor version, 4.1.0, will require
  Thunderbird 153esr and switch to setHTML().

Build instructions are unchanged (see notes/atn-review-notes.md).
