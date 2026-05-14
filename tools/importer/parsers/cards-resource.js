/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-resource
 * Base block: cards
 * Source: https://www.thereadypatient.com/
 * Generated: 2026-05-11
 *
 * Handles two instance types:
 * 1. Article Categories (.article-categories): Link cards with background images and text labels
 *    - Source: a.card with style="background-image:url(...)" > .card__body with text
 *    - Output: Cards rows with image cell + link cell
 *
 * 2. Resource Grid Cards (.resource-grid-cards): Cards with background images, heading, description, CTA
 *    - Source: section > div.card with style="background-image:url(...)" > .card__body (h4 + .rich-text + a.button)
 *    - Output: Cards rows with image cell + heading+description+CTA cell
 *
 * Note: Images on the source page are CSS background-images, not <img> elements.
 * A helper creates <img> elements via innerHTML to avoid OneTrust's document.createElement override.
 */
export default function parse(element, { document }) {
  /**
   * Helper: Extract background-image URL from an element's inline style.
   * Returns the URL string or null if no background-image is set.
   */
  function getBgImageUrl(el) {
    if (!el) return null;
    const bg = el.style && el.style.backgroundImage;
    if (!bg) return null;
    const match = bg.match(/url\(["']?([^"')]+)["']?\)/);
    return match ? match[1] : null;
  }

  /**
   * Helper: Create an <img> element safely using innerHTML to bypass
   * third-party script overrides of document.createElement.
   */
  function createImg(src, alt) {
    const wrapper = document.createElement('div');
    const escapedSrc = src.replace(/"/g, '&quot;');
    const escapedAlt = (alt || '').replace(/"/g, '&quot;');
    wrapper.innerHTML = '<img src="' + escapedSrc + '" alt="' + escapedAlt + '">';
    return wrapper.querySelector('img');
  }

  const cells = [];

  // Detect instance type by checking for article-categories structure
  const isArticleCategories = element.classList.contains('article-categories')
    || !!element.querySelector('.article-categories');

  if (isArticleCategories) {
    // Instance 1: Article Categories
    // Structure: a.card (with bg-image) > .card__body with text label
    const container = element.querySelector('.article-categories.component') || element;
    const cardLinks = container.querySelectorAll('a.card');

    cardLinks.forEach((cardLink) => {
      const bodyEl = cardLink.querySelector('.card__body');
      const labelText = bodyEl ? bodyEl.textContent.trim() : cardLink.textContent.trim();

      // Extract background image from the card link
      const bgUrl = getBgImageUrl(cardLink);
      const imgCell = bgUrl ? createImg(bgUrl, labelText) : '';

      // Reuse the existing <a> element for the link — strip inner markup
      cardLink.textContent = labelText;

      // Column 1: card image, Column 2: link
      cells.push([imgCell, cardLink]);
    });
  } else {
    // Instance 2: Resource Grid Cards
    // Structure: section > div.card (with bg-image) > .card__body (h4 + .rich-text + a.button)
    const container = element.querySelector('.resource-grid-cards.component') || element;
    const cards = container.querySelectorAll('div.card');

    cards.forEach((card) => {
      // Check for <img> element first, fall back to background-image
      const existingImg = card.querySelector(':scope > img');
      const bgUrl = getBgImageUrl(card);
      const imgCell = existingImg || (bgUrl ? createImg(bgUrl, '') : '');

      const body = card.querySelector('.card__body');

      // Extract heading (h4, with fallback to h3, h5)
      const heading = body ? body.querySelector('h4, h3, h5') : null;

      // Extract description from .rich-text, with fallback to p
      const richText = body ? body.querySelector('.rich-text') : null;
      const description = richText || (body ? body.querySelector('p') : null);

      // Extract CTA link
      const ctaLink = body ? body.querySelector('a.button, a[class*="button"]') : null;

      // Build content cell: heading + description + CTA
      const contentCell = [];
      if (heading) contentCell.push(heading);
      if (description) contentCell.push(description);
      if (ctaLink) contentCell.push(ctaLink);

      // Column 1: image, Column 2: content elements
      cells.push([imgCell, contentCell]);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-resource', cells });
  element.replaceWith(block);
}
