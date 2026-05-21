export default function decorate(block) {
  const rows = [...block.children];
  let picture = null;
  const contentEls = [];

  rows.forEach((row) => {
    const pic = row.querySelector('picture');
    if (pic && !picture) {
      picture = pic;
      row.remove();
    } else {
      contentEls.push(...row.querySelectorAll(':scope > div > *'));
      row.remove();
    }
  });

  if (picture) {
    block.prepend(picture);
  } else {
    block.classList.add('no-image');
  }

  const content = document.createElement('div');
  content.className = 'hero-patient-content';
  contentEls.forEach((el) => content.append(el));

  // Promote the standalone link to a styled CTA button
  const ctaLink = content.querySelector('a[href]');
  if (ctaLink) {
    const p = ctaLink.closest('p');
    if (p && p.textContent.trim() === ctaLink.textContent.trim()) {
      p.className = 'hero-patient-cta';
      ctaLink.className = 'button';
    }
  }

  block.append(content);
}
