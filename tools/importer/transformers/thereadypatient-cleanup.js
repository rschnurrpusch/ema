/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: thereadypatient cleanup.
 * Removes non-authorable site chrome (header, footer).
 * All selectors validated against migration-work/cleaned.html.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // beforeTransform: no blocking overlays, modals, or cookie banners to remove before parsing
  }

  if (hookName === H.after) {
    // Remove header experience fragment (line 10 in cleaned.html)
    // <div id="experiencefragment-af17365e4f" class="cmp-experiencefragment cmp-experiencefragment--zb-header-ef">
    WebImporter.DOMUtils.remove(element, ['.cmp-experiencefragment--zb-header-ef']);

    // Remove footer experience fragment (line 304 in cleaned.html)
    // <div id="experiencefragment-395b48d9d3" class="cmp-experiencefragment cmp-experiencefragment--zb-footer-ef">
    WebImporter.DOMUtils.remove(element, ['.cmp-experiencefragment--zb-footer-ef']);
  }
}
