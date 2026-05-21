/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: thereadypatient sections.
 * Inserts <hr> section breaks between the 5 homepage sections.
 * All sections have style: null, so no Section Metadata blocks are needed.
 * All selectors validated against migration-work/cleaned.html.
 *
 * Sections (from page-templates.json):
 *   1. Hero Banner - selector: .hero-headline:first-of-type (line 169)
 *   2. Article Categories - selectors: .title:has(#title-83bd028105), .article-categories (lines 191, 198)
 *   3. Patient Testimonial - selectors: .title:has(#title-b71b7dca44), .hero-headline:nth-of-type(2) (lines 220, 225)
 *   4. Resource Cards - selectors: .title:has(#title-27543d93ee), .resource-grid-cards (lines 244, 251)
 *   5. Disclaimer - selector: .cmp-text:has(h6) (line 294)
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.after) {
    const sections = payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    // Process sections in reverse order to avoid shifting indices
    for (let i = sections.length - 1; i >= 1; i--) {
      const section = sections[i];
      const selectorList = Array.isArray(section.selector) ? section.selector : [section.selector];

      // Find the first matching element for this section
      let firstElement = null;
      for (const sel of selectorList) {
        const match = element.querySelector(sel);
        if (match) {
          if (!firstElement || match.compareDocumentPosition(firstElement) & Node.DOCUMENT_POSITION_FOLLOWING) {
            firstElement = match;
          }
        }
      }

      if (firstElement) {
        // Insert section-metadata block if section has a style
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: 'Section Metadata',
            cells: { style: section.style },
          });
          firstElement.before(sectionMetadata);
        }

        // Insert <hr> before the section (not the first section)
        const hr = document.createElement('hr');
        firstElement.before(hr);
      }
    }
  }
}
