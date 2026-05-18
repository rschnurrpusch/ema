export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 1) return;

  const mainCol = rows[0].querySelector(':scope > div');
  if (!mainCol) return;

  const elements = [...mainCol.children];
  const wrapper = document.createElement('div');
  wrapper.className = 'article-header-content';

  elements.forEach((el) => {
    if (el.tagName === 'P' && !el.querySelector('a') && !wrapper.querySelector('.article-header-tag')) {
      const tag = document.createElement('span');
      tag.className = `article-header-tag tagcolor-${el.textContent.trim().toLowerCase().replace(/\s+/g, '-')}`;
      tag.textContent = el.textContent.trim();
      wrapper.append(tag);
    } else if (el.tagName === 'H1') {
      wrapper.append(el);
    } else if (el.tagName === 'P' && wrapper.querySelector('h1') && !wrapper.querySelector('.article-header-meta')) {
      const text = el.textContent.trim();
      if (text.includes('|') || text.match(/\d{4}/)) {
        const meta = document.createElement('p');
        meta.className = 'article-header-meta';
        meta.textContent = text;
        wrapper.append(meta);
      } else {
        el.className = 'article-header-description';
        wrapper.append(el);
      }
    }
  });

  // Author info from second row
  if (rows.length > 1) {
    const authorCol = rows[1].querySelector(':scope > div');
    if (authorCol) {
      const authorDiv = document.createElement('div');
      authorDiv.className = 'article-header-author';
      const paras = authorCol.querySelectorAll('p');
      if (paras.length >= 1) {
        const name = document.createElement('span');
        name.className = 'article-header-author-name';
        name.textContent = paras[0].textContent.trim();
        authorDiv.append(name);
      }
      if (paras.length >= 2) {
        const role = document.createElement('span');
        role.className = 'article-header-author-role';
        role.textContent = paras[1].textContent.trim();
        authorDiv.append(role);
      }
      wrapper.append(authorDiv);
    }
  }

  block.textContent = '';
  block.append(wrapper);
}
