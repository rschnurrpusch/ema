/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import articleHeaderParser from './parsers/article-header.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/thereadypatient-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'article-header': articleHeaderParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'article',
  description: 'Article page template for patient stories and informational articles',
  urls: [
    'https://www.thereadypatient.com/knee/roberts-patient-story-knee-replacement.html',
  ],
  blocks: [
    {
      name: 'article-header',
      instances: ['.article-header'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Article Header',
      selector: '.article-header',
      style: null,
      blocks: ['article-header'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Article Body',
      selector: '.article-body, [class*="article-body"]',
      style: null,
      blocks: [],
      defaultContent: [],
    },
    {
      id: 'section-3',
      name: 'More You Can Do',
      selector: '.resource-grid-cards',
      style: null,
      blocks: [],
      defaultContent: [],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers
    executeTransformers('beforeTransform', main, payload);

    // 2. Parse article header block
    const articleHeader = document.querySelector('.article-header');
    if (articleHeader) {
      const parser = parsers['article-header'];
      if (parser) {
        try {
          parser(articleHeader, { document, url, params });
        } catch (e) {
          console.error('Failed to parse article-header:', e);
        }
      }
    }

    // 3. Extract article body content
    const articleBody = document.querySelector('.article-body, [class*="article-body"], .content-area-body');

    // 4. Remove the "Here's more you can do" section and replace with fragment link
    const moreSection = document.querySelector('.resource-grid-cards');
    if (moreSection) {
      const moreContainer = moreSection.closest('[class*="aem-Grid"], [class*="responsivegrid"]') || moreSection.parentElement;
      // Find the heading for this section too
      const allH3s = document.querySelectorAll('h3');
      allH3s.forEach(h3 => {
        if (h3.textContent.includes("Here's more you can do")) {
          const h3Container = h3.closest('[class*="title"]') || h3.parentElement;
          if (h3Container) h3Container.remove();
        }
      });

      // Replace with fragment reference
      const fragmentLink = document.createElement('a');
      fragmentLink.href = '/content/fragments/more-you-can-do';
      fragmentLink.textContent = "Here's more you can do";
      const fragmentP = document.createElement('p');
      fragmentP.appendChild(fragmentLink);

      moreContainer.replaceWith(fragmentP);
    }

    // 5. Remove footer, navigation, and other non-content elements
    const removeSelectors = [
      'footer', '.footer', '[class*="footer"]',
      'nav:not([aria-label="Breadcrumb"])',
      '.navigation', '[class*="navigation"]',
      '.breadcrumb-zb',
      '.cookie-consent', '[class*="cookie"]',
      '.share-social', '[class*="share-social"]',
      '.article-rating', '[class*="rating"]',
      'script', 'style', 'noscript',
      '[class*="modal"]',
    ];
    removeSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.remove());
    });

    // 6. Execute afterTransform transformers
    executeTransformers('afterTransform', main, payload);

    // 7. Add section break before fragment reference
    const fragmentLinks = main.querySelectorAll('a[href*="/fragments/"]');
    fragmentLinks.forEach(link => {
      const p = link.closest('p') || link.parentElement;
      const hr = document.createElement('hr');
      p.parentElement.insertBefore(hr, p);
    });

    // 8. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 9. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index'
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: ['article-header'],
      },
    }];
  },
};
