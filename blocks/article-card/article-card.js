export default function decorate(block) {
  const rows = [...block.children];
  const cards = [];

  rows.forEach((row) => {
    const cols = [...row.children];
    if (cols.length < 2) return;

    const textCol = cols[1];
    const link = textCol.querySelector('a');
    const tag = textCol.querySelector('p:first-child')?.textContent?.trim();
    const title = textCol.querySelector('h3, h2, h1, h4')?.textContent?.trim()
      || textCol.querySelector('p:last-child')?.textContent?.trim();
    const href = link?.href || '#';

    const card = document.createElement('a');
    card.className = 'article-card-item';
    card.href = href;

    const imageDiv = document.createElement('div');
    imageDiv.className = 'article-card-image';
    const img = cols[0].querySelector('img');
    if (img && img.src && !img.src.includes('about:error')) {
      imageDiv.style.backgroundImage = `url('${img.currentSrc || img.src}')`;
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'article-card-content';

    if (tag) {
      const tagSpan = document.createElement('span');
      tagSpan.className = `article-card-tag tagcolor-${tag.toLowerCase().replace(/\s+/g, '-')}`;
      tagSpan.textContent = tag;
      contentDiv.append(tagSpan);
    }

    if (title) {
      const titleEl = document.createElement('h3');
      titleEl.className = 'article-card-title';
      titleEl.textContent = title;
      contentDiv.append(titleEl);
    }

    card.append(imageDiv, contentDiv);
    cards.push(card);
  });

  block.textContent = '';
  const grid = document.createElement('div');
  grid.className = 'article-card-grid';
  cards.forEach((card) => grid.append(card));
  block.append(grid);
}
