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

  // tools/importer/import-article.js
  var import_article_exports = {};
  __export(import_article_exports, {
    default: () => import_article_default
  });

  // tools/importer/parsers/article-header.js
  function parse(element, { document }) {
    const themeTag = element.querySelector('.theme-tag, [class*="theme-tag"]');
    const category = themeTag ? themeTag.textContent.trim() : "";
    const h1 = element.querySelector("h1");
    const richText = element.querySelector(".rich-text p, .article-description p");
    const description = richText || "";
    const dateEl = element.querySelector('.article-date, [class*="date"]');
    let dateText = "";
    if (dateEl) {
      dateText = dateEl.textContent.replace(/\s+/g, " ").trim();
    }
    const authorLink = element.querySelector('.author-link, [class*="author"] a, a[href*="contributors"]');
    let authorName = "";
    let authorRole = "";
    if (authorLink) {
      const nameEl = authorLink.querySelector('[class*="name"], span:first-child');
      const roleEl = authorLink.querySelector('[class*="role"], span:nth-child(2)');
      authorName = nameEl ? nameEl.textContent.trim() : authorLink.textContent.trim().split("\n")[0].trim();
      authorRole = roleEl ? roleEl.textContent.trim() : "Author";
    }
    const cells = [];
    const mainContent = document.createElement("div");
    if (category) {
      const p = document.createElement("p");
      p.textContent = category;
      mainContent.appendChild(p);
    }
    if (h1) {
      mainContent.appendChild(h1.cloneNode(true));
    }
    if (description) {
      const descP = document.createElement("p");
      descP.textContent = typeof description === "string" ? description : description.textContent.trim();
      mainContent.appendChild(descP);
    }
    if (dateText) {
      const dateP = document.createElement("p");
      dateP.textContent = dateText;
      mainContent.appendChild(dateP);
    }
    cells.push([mainContent]);
    if (authorName) {
      const authorContent = document.createElement("div");
      const nameP = document.createElement("p");
      nameP.textContent = authorName;
      authorContent.appendChild(nameP);
      const roleP = document.createElement("p");
      roleP.textContent = authorRole;
      authorContent.appendChild(roleP);
      cells.push([authorContent]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "article-header", cells });
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

  // tools/importer/import-article.js
  var parsers = {
    "article-header": parse
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "article",
    description: "Article page template for patient stories and informational articles",
    urls: [
      "https://www.thereadypatient.com/knee/roberts-patient-story-knee-replacement.html"
    ],
    blocks: [
      {
        name: "article-header",
        instances: [".article-header"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Article Header",
        selector: ".article-header",
        style: null,
        blocks: ["article-header"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Article Body",
        selector: '.article-body, [class*="article-body"]',
        style: null,
        blocks: [],
        defaultContent: []
      },
      {
        id: "section-3",
        name: "More You Can Do",
        selector: ".resource-grid-cards",
        style: null,
        blocks: [],
        defaultContent: []
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
  var import_article_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const articleHeader = document.querySelector(".article-header");
      if (articleHeader) {
        const parser = parsers["article-header"];
        if (parser) {
          try {
            parser(articleHeader, { document, url, params });
          } catch (e) {
            console.error("Failed to parse article-header:", e);
          }
        }
      }
      const articleBody = document.querySelector('.article-body, [class*="article-body"], .content-area-body');
      const moreSection = document.querySelector(".resource-grid-cards");
      if (moreSection) {
        const moreContainer = moreSection.closest('[class*="aem-Grid"], [class*="responsivegrid"]') || moreSection.parentElement;
        const allH3s = document.querySelectorAll("h3");
        allH3s.forEach((h3) => {
          if (h3.textContent.includes("Here's more you can do")) {
            const h3Container = h3.closest('[class*="title"]') || h3.parentElement;
            if (h3Container) h3Container.remove();
          }
        });
        const fragmentLink = document.createElement("a");
        fragmentLink.href = "/content/fragments/more-you-can-do";
        fragmentLink.textContent = "Here's more you can do";
        const fragmentP = document.createElement("p");
        fragmentP.appendChild(fragmentLink);
        moreContainer.replaceWith(fragmentP);
      }
      const removeSelectors = [
        "footer",
        ".footer",
        '[class*="footer"]',
        'nav:not([aria-label="Breadcrumb"])',
        ".navigation",
        '[class*="navigation"]',
        ".breadcrumb-zb",
        ".cookie-consent",
        '[class*="cookie"]',
        ".share-social",
        '[class*="share-social"]',
        ".article-rating",
        '[class*="rating"]',
        "script",
        "style",
        "noscript",
        '[class*="modal"]'
      ];
      removeSelectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => el.remove());
      });
      executeTransformers("afterTransform", main, payload);
      const fragmentLinks = main.querySelectorAll('a[href*="/fragments/"]');
      fragmentLinks.forEach((link) => {
        const p = link.closest("p") || link.parentElement;
        const hr2 = document.createElement("hr");
        p.parentElement.insertBefore(hr2, p);
      });
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: ["article-header"]
        }
      }];
    }
  };
  return __toCommonJS(import_article_exports);
})();
