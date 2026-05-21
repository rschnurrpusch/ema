/* eslint-disable */
/* global WebImporter */

/**
 * Parser for article-header block
 * Extracts: category tag, title (h1), description, date/read-time, author info
 *
 * Live DOM structure (.article-header):
 *   - .theme-tag (category)
 *   - h1.heading (title)
 *   - .rich-text p (description)
 *   - .article-date (date + read time)
 *   - .author-link (author name + role)
 *
 * Target table:
 *   Row 1: [category, title, description, date]
 *   Row 2: [author name, author role]
 */
export default function parse(element, { document }) {
  // Category tag
  const themeTag = element.querySelector('.theme-tag, [class*="theme-tag"]');
  const category = themeTag ? themeTag.textContent.trim() : '';

  // Title
  const h1 = element.querySelector('h1');

  // Description - typically in a rich-text or paragraph after the title
  const richText = element.querySelector('.rich-text p, .article-description p');
  const description = richText || '';

  // Date and read time
  const dateEl = element.querySelector('.article-date, [class*="date"]');
  let dateText = '';
  if (dateEl) {
    dateText = dateEl.textContent.replace(/\s+/g, ' ').trim();
  }

  // Author info
  const authorLink = element.querySelector('.author-link, [class*="author"] a, a[href*="contributors"]');
  let authorName = '';
  let authorRole = '';
  if (authorLink) {
    const nameEl = authorLink.querySelector('[class*="name"], span:first-child');
    const roleEl = authorLink.querySelector('[class*="role"], span:nth-child(2)');
    authorName = nameEl ? nameEl.textContent.trim() : authorLink.textContent.trim().split('\n')[0].trim();
    authorRole = roleEl ? roleEl.textContent.trim() : 'Author';
  }

  // Build cells for the article-header block
  const cells = [];

  // Row 1: Category + Title + Description + Date
  const mainContent = document.createElement('div');
  if (category) {
    const p = document.createElement('p');
    p.textContent = category;
    mainContent.appendChild(p);
  }
  if (h1) {
    mainContent.appendChild(h1.cloneNode(true));
  }
  if (description) {
    const descP = document.createElement('p');
    descP.textContent = typeof description === 'string' ? description : description.textContent.trim();
    mainContent.appendChild(descP);
  }
  if (dateText) {
    const dateP = document.createElement('p');
    dateP.textContent = dateText;
    mainContent.appendChild(dateP);
  }
  cells.push([mainContent]);

  // Row 2: Author info
  if (authorName) {
    const authorContent = document.createElement('div');
    const nameP = document.createElement('p');
    nameP.textContent = authorName;
    authorContent.appendChild(nameP);
    const roleP = document.createElement('p');
    roleP.textContent = authorRole;
    authorContent.appendChild(roleP);
    cells.push([authorContent]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'article-header', cells });
  element.replaceWith(block);
}
