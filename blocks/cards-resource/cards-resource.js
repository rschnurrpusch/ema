import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-resource-card-image';
      else div.className = 'cards-resource-card-body';
    });

    const imageDiv = li.querySelector('.cards-resource-card-image');
    const bodyDiv = li.querySelector('.cards-resource-card-body');
    const img = imageDiv ? imageDiv.querySelector('img') : null;

    if (img) {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
      const optimizedImg = optimizedPic.querySelector('img');
      if (optimizedImg) {
        li.style.backgroundImage = `url(${optimizedImg.currentSrc || optimizedImg.src})`;
        optimizedImg.addEventListener('load', () => {
          li.style.backgroundImage = `url(${optimizedImg.currentSrc || optimizedImg.src})`;
        });
      }
      imageDiv.remove();
    }

    if (bodyDiv && bodyDiv.querySelector('h4')) {
      li.classList.add('cards-resource-rich');
      const link = bodyDiv.querySelector('a[href]');
      if (link && link.hostname && link.hostname !== window.location.hostname) {
        li.classList.add('cards-resource-dark');
      }
    }

    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
