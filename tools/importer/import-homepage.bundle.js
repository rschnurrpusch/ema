/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-patient.js
  function parse(element, { document: document2 }) {
    let bgImageEl = element.querySelector(":scope > img, :scope > picture");
    if (!bgImageEl) {
      const bgStyle = element.getAttribute("style") || "";
      const bgMatch = bgStyle.match(/background-image\s*:\s*url\(["']?([^"')]+)["']?\)/);
      if (bgMatch) {
        const bgUrl = bgMatch[1];
        const range = document2.createRange();
        const frag = range.createContextualFragment('<img src="' + bgUrl + '" alt="">');
        bgImageEl = frag.querySelector("img");
      }
    }
    const heading = element.querySelector('.hero-headlines__supertitle h1, .hero-headlines__supertitle h2, [class*="supertitle"] h1');
    const richText = element.querySelector('.hero-headlines__title .rich-text, .hero-headlines__title [class*="rich-text"]');
    const ctaLink = element.querySelector('.hero-headlines__text-overlay > a.button, a.button, a[class*="button"]');
    const cells = [];
    if (bgImageEl) {
      cells.push([bgImageEl]);
    }
    if (heading) {
      cells.push([heading]);
    }
    if (richText) {
      cells.push([richText]);
    }
    if (ctaLink) {
      cells.push([ctaLink]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-patient", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-resource.js
  function parse2(element, { document: document2 }) {
    function getBgImageUrl(el) {
      if (!el) return null;
      const bg = el.style && el.style.backgroundImage;
      if (!bg) return null;
      const match = bg.match(/url\(["']?([^"')]+)["']?\)/);
      return match ? match[1] : null;
    }
    function createImg(src, alt) {
      const wrapper = document2.createElement("div");
      const escapedSrc = src.replace(/"/g, "&quot;");
      const escapedAlt = (alt || "").replace(/"/g, "&quot;");
      wrapper.innerHTML = '<img src="' + escapedSrc + '" alt="' + escapedAlt + '">';
      return wrapper.querySelector("img");
    }
    const cells = [];
    const isArticleCategories = element.classList.contains("article-categories") || !!element.querySelector(".article-categories");
    if (isArticleCategories) {
      const container = element.querySelector(".article-categories.component") || element;
      const cardLinks = container.querySelectorAll("a.card");
      cardLinks.forEach((cardLink) => {
        const bodyEl = cardLink.querySelector(".card__body");
        const labelText = bodyEl ? bodyEl.textContent.trim() : cardLink.textContent.trim();
        const bgUrl = getBgImageUrl(cardLink);
        const imgCell = bgUrl ? createImg(bgUrl, labelText) : "";
        cardLink.textContent = labelText;
        cells.push([imgCell, cardLink]);
      });
    } else {
      const container = element.querySelector(".resource-grid-cards.component") || element;
      const cards = container.querySelectorAll("div.card");
      cards.forEach((card) => {
        const existingImg = card.querySelector(":scope > img");
        const bgUrl = getBgImageUrl(card);
        const imgCell = existingImg || (bgUrl ? createImg(bgUrl, "") : "");
        const body = card.querySelector(".card__body");
        const heading = body ? body.querySelector("h4, h3, h5") : null;
        const richText = body ? body.querySelector(".rich-text") : null;
        const description = richText || (body ? body.querySelector("p") : null);
        const ctaLink = body ? body.querySelector('a.button, a[class*="button"]') : null;
        const contentCell = [];
        if (heading) contentCell.push(heading);
        if (description) contentCell.push(description);
        if (ctaLink) contentCell.push(ctaLink);
        cells.push([imgCell, contentCell]);
      });
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-resource", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/thereadypatient-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [".cmp-experiencefragment--zb-header-ef"]);
      WebImporter.DOMUtils.remove(element, [".cmp-experiencefragment--zb-footer-ef"]);
    }
  }

  // tools/importer/transformers/thereadypatient-sections.js
  var H2 = { before: "beforeTransform", after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const sections = payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      for (let i = sections.length - 1; i >= 1; i--) {
        const section = sections[i];
        const selectorList = Array.isArray(section.selector) ? section.selector : [section.selector];
        let firstElement = null;
        for (const sel of selectorList) {
          const match = element.querySelector(sel);
          if (match) {
            if (!firstElement || match.compareDocumentPosition(firstElement) & Node.DOCUMENT_POSITION_FOLLOWING) {
              firstElement = match;
            }
          }
        }
        if (firstElement) {
          if (section.style) {
            const sectionMetadata = WebImporter.Blocks.createBlock(document, {
              name: "Section Metadata",
              cells: { style: section.style }
            });
            firstElement.before(sectionMetadata);
          }
          const hr = document.createElement("hr");
          firstElement.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-patient": parse,
    "cards-resource": parse2
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Homepage template for The Ready Patient website",
    urls: [
      "https://www.thereadypatient.com/"
    ],
    blocks: [
      {
        name: "hero-patient",
        instances: [".hero-headline:first-of-type .hero-headlines", ".hero-headline:nth-of-type(2) .hero-headlines"]
      },
      {
        name: "cards-resource",
        instances: [".article-categories", ".resource-grid-cards"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero Banner",
        selector: ".hero-headline:first-of-type",
        style: null,
        blocks: ["hero-patient"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Article Categories",
        selector: [".title:has(#title-83bd028105)", ".article-categories"],
        style: null,
        blocks: ["cards-resource"],
        defaultContent: ["#title-83bd028105"]
      },
      {
        id: "section-3",
        name: "Patient Testimonial",
        selector: [".title:has(#title-b71b7dca44)", ".hero-headline:nth-of-type(2)"],
        style: null,
        blocks: ["hero-patient"],
        defaultContent: ["#title-b71b7dca44"]
      },
      {
        id: "section-4",
        name: "Resource Cards",
        selector: [".title:has(#title-27543d93ee)", ".resource-grid-cards"],
        style: null,
        blocks: ["cards-resource"],
        defaultContent: ["#title-27543d93ee"]
      },
      {
        id: "section-5",
        name: "Disclaimer",
        selector: ".cmp-text:has(h6)",
        style: null,
        blocks: [],
        defaultContent: ["#text-e30175cbcb h6"]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
