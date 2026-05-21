/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-patient
 * Base block: hero
 * Source: https://www.thereadypatient.com/
 * Instances:
 *   1. Main hero: heading + description paragraphs + CTA
 *   2. Patient testimonial: name heading + quote (h5) + CTA
 *
 * Live DOM structure (.hero-headlines):
 *   - style="background-image:url(...)" on .hero-headlines element (NOT an <img>)
 *   - .hero-headlines__text-overlay
 *     - .hero-headlines__supertitle > h1 (heading)
 *     - .hero-headlines__title > .rich-text (description: <p> or <h5>)
 *     - a.button (CTA link)
 *
 * Target table (from library example):
 *   Row 1: background image
 *   Row 2: heading
 *   Row 3: description text
 *   Row 4: CTA button
 *
 * Generated: 2026-05-11
 */
export default function parse(element, { document }) {
  // Extract background image from inline style or fallback to <img> element
  // Live DOM uses background-image CSS property on the .hero-headlines element
  let bgImageEl = element.querySelector(':scope > img, :scope > picture');
  if (!bgImageEl) {
    const bgStyle = element.getAttribute('style') || '';
    const bgMatch = bgStyle.match(/background-image\s*:\s*url\(["']?([^"')]+)["']?\)/);
    if (bgMatch) {
      const bgUrl = bgMatch[1];
      // Use createRange to avoid document.createElement issues with third-party scripts
      const range = document.createRange();
      const frag = range.createContextualFragment('<img src="' + bgUrl + '" alt="">');
      bgImageEl = frag.querySelector('img');
    }
  }

  // Extract heading from supertitle area
  const heading = element.querySelector('.hero-headlines__supertitle h1, .hero-headlines__supertitle h2, [class*="supertitle"] h1');

  // Extract description content from the rich-text area
  // Instance 1 has <p> elements, instance 2 has an <h5> quote
  const richText = element.querySelector('.hero-headlines__title .rich-text, .hero-headlines__title [class*="rich-text"]');

  // Extract CTA button link
  const ctaLink = element.querySelector('.hero-headlines__text-overlay > a.button, a.button, a[class*="button"]');

  // Build cells matching the library example structure:
  // Row 1: background image
  // Row 2: heading
  // Row 3: description
  // Row 4: CTA
  const cells = [];

  // Row 1: Background image (optional - add only if present)
  if (bgImageEl) {
    cells.push([bgImageEl]);
  }

  // Row 2: Heading
  if (heading) {
    cells.push([heading]);
  }

  // Row 3: Description text (use the rich-text container directly)
  if (richText) {
    cells.push([richText]);
  }

  // Row 4: CTA button
  if (ctaLink) {
    cells.push([ctaLink]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-patient', cells });
  element.replaceWith(block);
}
