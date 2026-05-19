export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 1) return;

  const mainCol = rows[0].querySelector(':scope > div');
  if (!mainCol) return;

  const elements = [...mainCol.children];
  const textWrapper = document.createElement('div');
  textWrapper.className = 'article-header-text';

  elements.forEach((el) => {
    if (el.tagName === 'P' && !el.querySelector('a') && !textWrapper.querySelector('.article-header-tag')) {
      const tag = document.createElement('span');
      tag.className = `article-header-tag tagcolor-${el.textContent.trim().toLowerCase().replace(/\s+/g, '-')}`;
      tag.textContent = el.textContent.trim();
      textWrapper.append(tag);
    } else if (el.tagName === 'H1') {
      textWrapper.append(el);
    } else if (el.tagName === 'P' && textWrapper.querySelector('h1') && !textWrapper.querySelector('.article-header-meta')) {
      const text = el.textContent.trim();
      if (text.includes('|') || text.match(/\d{4}/)) {
        const meta = document.createElement('p');
        meta.className = 'article-header-meta';
        meta.textContent = text;
        textWrapper.append(meta);
      } else {
        el.className = 'article-header-description';
        textWrapper.append(el);
      }
    }
  });

  // Author info from second row
  if (rows.length > 1) {
    const authorCol = rows[1].querySelector(':scope > div');
    if (authorCol) {
      const authorDiv = document.createElement('div');
      authorDiv.className = 'article-header-author';

      const authorImg = document.createElement('div');
      authorImg.className = 'article-header-author-img';
      authorDiv.append(authorImg);

      const authorText = document.createElement('div');
      authorText.className = 'article-header-author-text';
      const paras = authorCol.querySelectorAll('p');
      if (paras.length >= 1) {
        const name = document.createElement('span');
        name.className = 'article-header-author-name';
        name.textContent = paras[0].textContent.trim();
        authorText.append(name);
      }
      if (paras.length >= 2) {
        const role = document.createElement('span');
        role.className = 'article-header-author-role';
        role.textContent = paras[1].textContent.trim();
        authorText.append(role);
      }
      authorDiv.append(authorText);
      textWrapper.append(authorDiv);
    }
  }

  // Image from third row (if present)
  let imageWrapper = null;
  if (rows.length > 2) {
    const imgCol = rows[2].querySelector(':scope > div');
    if (imgCol) {
      const picture = imgCol.querySelector('picture');
      if (picture) {
        imageWrapper = document.createElement('div');
        imageWrapper.className = 'article-header-image';
        imageWrapper.append(picture);
      }
    }
  }

  block.textContent = '';
  const content = document.createElement('div');
  content.className = 'article-header-content';

  // Pull breadcrumb into the article header text
  const breadcrumbSection = document.querySelector('.breadcrumb-container');
  if (breadcrumbSection) {
    const breadcrumbBlock = breadcrumbSection.querySelector('.breadcrumb');
    if (breadcrumbBlock) {
      textWrapper.prepend(breadcrumbBlock);
    }
    breadcrumbSection.remove();
  }

  content.append(textWrapper);
  if (imageWrapper) content.append(imageWrapper);
  block.append(content);
}
