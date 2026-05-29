const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.thereadypatient.com';
const OUTPUT_DIR = path.join(__dirname, '..', 'content');

// Read article paths from stdin or a file
const args = process.argv.slice(2);
const urlFile = args[0] || '/tmp/knee-articles.txt';
const paths = fs.readFileSync(urlFile, 'utf-8').trim().split('\n').filter(Boolean);

async function scrapeArticle(page, articlePath) {
  const url = `${BASE_URL}${articlePath}.html`;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const data = await page.evaluate(() => {
      const result = {};

      // Title
      const h1 = document.querySelector('h1');
      result.title = h1?.textContent?.trim() || '';

      // Category tag
      const tag = document.querySelector('.theme-tag, .tag-locator, [class*="theme-tag"], [class*="article-tag"]');
      result.tag = tag?.textContent?.trim() || 'Well-being';

      // Description
      const desc = document.querySelector('.article-header .rich-text p, .article-header p');
      result.description = desc?.textContent?.trim() || '';

      // Date + read time
      const dateEl = document.querySelector('.article-date, [class*="article-date"]');
      result.date = '';
      if (dateEl) {
        result.date = dateEl.textContent.replace(/\s+/g, ' ').trim();
      }

      // Author
      const authorLink = document.querySelector('a[href*="contributors"]');
      result.authorName = '';
      result.authorRole = 'Author';
      if (authorLink) {
        const nameEl = authorLink.querySelector('[class*="name"], div:first-child');
        result.authorName = nameEl?.textContent?.trim() || authorLink.textContent.trim().split('\n')[0].trim();
        const roleEl = authorLink.querySelector('[class*="title"], div:nth-child(2)');
        result.authorRole = roleEl?.textContent?.trim() || 'Author';
      }

      // Body content - extract h2 headings and paragraphs from the article body
      const bodySection = document.querySelector('.article-body, [class*="article-body"], .content-area-body');
      const bodyContent = [];

      if (bodySection) {
        const walk = (el) => {
          for (const child of el.children) {
            if (child.tagName === 'H2') {
              bodyContent.push(`<h2>${child.textContent.trim()}</h2>`);
            } else if (child.tagName === 'P' || (child.classList && child.classList.contains('rich-text'))) {
              const text = child.textContent.trim();
              if (text && text.length > 10) {
                bodyContent.push(`<p>${text}</p>`);
              }
            } else if (child.tagName === 'A' && child.classList.contains('button')) {
              const href = child.getAttribute('href') || '';
              const linkPath = href.replace('https://www.thereadypatient.com', '').replace('.html', '');
              bodyContent.push(`<p><a href="${linkPath}">${child.textContent.trim()}</a></p>`);
            } else if (child.children && child.children.length > 0) {
              walk(child);
            }
          }
        };
        walk(bodySection);
      }

      result.body = bodyContent.join('');
      return result;
    });

    return data;
  } catch (e) {
    console.error(`  Error scraping ${articlePath}: ${e.message}`);
    return null;
  }
}

function generateHTML(data, articlePath) {
  const tag = data.tag || 'Well-being';
  const title = data.title || articlePath.split('/').pop().replace(/-/g, ' ');
  const desc = data.description || '';
  const date = data.date || 'January 1, 2022 | 3 min read';
  const author = data.authorName || 'ReadyPatient Editorial Team';
  const role = data.authorRole || 'Author';
  const body = data.body || `<h2>About this article</h2><p>Content for this article is being migrated.</p>`;

  return `<div><div class="article-header"><div><div><p>${tag}</p><h1>${title}</h1><p>${desc}</p><p>${date}</p></div></div><div><div><p>${author}</p><p>${role}</p></div></div></div></div>
<div>${body}</div>
<div><p><a href="/fragments/more-you-can-do">Here's more you can do</a></p></div>
<div><div class="metadata"><div><div>Title</div><div>${title}</div></div><div><div>Description</div><div>${desc}</div></div></div></div>
`;
}

async function main() {
  console.log(`Scraping ${paths.length} articles from ${urlFile}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // Block unnecessary resources for speed
  await page.route('**/*.{png,jpg,jpeg,gif,svg,woff,woff2,mp4}', route => route.abort());
  await page.route('**/analytics/**', route => route.abort());
  await page.route('**/gtm.js', route => route.abort());

  let success = 0;
  let fail = 0;

  for (let i = 0; i < paths.length; i++) {
    const articlePath = paths[i];
    const slug = articlePath.replace(/^\//, '');
    const outPath = path.join(OUTPUT_DIR, `${slug}.plain.html`);

    // Skip if already exists
    if (fs.existsSync(outPath)) {
      console.log(`  [${i + 1}/${paths.length}] Skip (exists): ${articlePath}`);
      success++;
      continue;
    }

    console.log(`  [${i + 1}/${paths.length}] Scraping: ${articlePath}`);
    const data = await scrapeArticle(page, articlePath);

    if (data && data.title) {
      const dir = path.dirname(outPath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(outPath, generateHTML(data, articlePath));
      success++;
    } else {
      fail++;
    }

    // Small delay to avoid hammering the server
    await page.waitForTimeout(500);
  }

  await browser.close();
  console.log(`\nDone: ${success} succeeded, ${fail} failed out of ${paths.length} total`);
}

main().catch(console.error);
