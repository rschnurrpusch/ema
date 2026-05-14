/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroPatientParser from './parsers/hero-patient.js';
import cardsResourceParser from './parsers/cards-resource.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/thereadypatient-cleanup.js';
import sectionsTransformer from './transformers/thereadypatient-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-patient': heroPatientParser,
  'cards-resource': cardsResourceParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  sectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Homepage template for The Ready Patient website',
  urls: [
    'https://www.thereadypatient.com/',
  ],
  blocks: [
    {
      name: 'hero-patient',
      instances: ['.hero-headline:first-of-type .hero-headlines', '.hero-headline:nth-of-type(2) .hero-headlines'],
    },
    {
      name: 'cards-resource',
      instances: ['.article-categories', '.resource-grid-cards'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero Banner',
      selector: '.hero-headline:first-of-type',
      style: null,
      blocks: ['hero-patient'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Article Categories',
      selector: ['.title:has(#title-83bd028105)', '.article-categories'],
      style: null,
      blocks: ['cards-resource'],
      defaultContent: ['#title-83bd028105'],
    },
    {
      id: 'section-3',
      name: 'Patient Testimonial',
      selector: ['.title:has(#title-b71b7dca44)', '.hero-headline:nth-of-type(2)'],
      style: null,
      blocks: ['hero-patient'],
      defaultContent: ['#title-b71b7dca44'],
    },
    {
      id: 'section-4',
      name: 'Resource Cards',
      selector: ['.title:has(#title-27543d93ee)', '.resource-grid-cards'],
      style: null,
      blocks: ['cards-resource'],
      defaultContent: ['#title-27543d93ee'],
    },
    {
      id: 'section-5',
      name: 'Disclaimer',
      selector: '.cmp-text:has(h6)',
      style: null,
      blocks: [],
      defaultContent: ['#text-e30175cbcb h6'],
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

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index'
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
