function formatSegment(segment) {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function decorate(block) {
  const path = window.location.pathname.replace(/\/$/, '');
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) return;

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');

  const ol = document.createElement('ol');
  ol.setAttribute('itemscope', '');
  ol.setAttribute('itemtype', 'http://schema.org/BreadcrumbList');

  const homeLi = document.createElement('li');
  homeLi.setAttribute('itemprop', 'itemListElement');
  homeLi.setAttribute('itemscope', '');
  homeLi.setAttribute('itemtype', 'http://schema.org/ListItem');
  homeLi.innerHTML = '<a href="/" itemprop="item"><span itemprop="name">Home</span></a><meta itemprop="position" content="1">';
  ol.append(homeLi);

  const currentLi = document.createElement('li');
  currentLi.setAttribute('itemprop', 'itemListElement');
  currentLi.setAttribute('itemscope', '');
  currentLi.setAttribute('itemtype', 'http://schema.org/ListItem');

  const titleSpan = document.createElement('span');
  titleSpan.setAttribute('itemprop', 'name');
  titleSpan.textContent = document.title || formatSegment(segments[segments.length - 1]);

  const posMeta = document.createElement('meta');
  posMeta.setAttribute('itemprop', 'position');
  posMeta.setAttribute('content', '2');
  currentLi.append(titleSpan, posMeta);
  ol.append(currentLi);

  nav.append(ol);
  block.textContent = '';
  block.append(nav);
}
