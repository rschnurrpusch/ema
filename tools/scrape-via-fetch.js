const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://www.thereadypatient.com';
const OUTPUT_DIR = path.join(__dirname, '..', 'content');

const args = process.argv.slice(2);
const urlFile = args[0] || '/tmp/knee-articles.txt';
const paths = fs.readFileSync(urlFile, 'utf-8').trim().split('\n').filter(Boolean);

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function extractContent(html, articlePath) {
  const result = {};

  // Title from <h1>
  const h1Match = html.match(/<h1[^>]*class="[^"]*heading[^"]*"[^>]*>([^<]+)<\/h1>/);
  result.title = h1Match ? h1Match[1].trim() : articlePath.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Category tag
  const tagMatch = html.match(/class="tag-locator[^"]*tagcolor-([^"]+)"[^>]*>([^<]+)</);
  result.tag = tagMatch ? tagMatch[2].trim() : 'Well-being';

  // Description - from rich-text in the article header area
  const descMatch = html.match(/article-header[\s\S]*?<div class="rich-text[^"]*"><p>([^<]+)<\/p>/);
  result.description = descMatch ? descMatch[1].trim().substring(0, 200) : '';

  // Date
  const dateMatch = html.match(/class="article-date[^"]*"[^>]*>([^<]+)/);
  if (dateMatch) {
    result.date = dateMatch[1].replace(/\s+/g, ' ').trim();
  } else {
    const dateMatch2 = html.match(/((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4})/);
    result.date = dateMatch2 ? dateMatch2[1] + ' | 3 min read' : 'January 1, 2022 | 3 min read';
  }

  // Author
  const authorMatch = html.match(/class="author-name"[^>]*>([^<]+)/);
  result.authorName = authorMatch ? authorMatch[1].trim() : 'ReadyPatient Editorial Team';
  const roleMatch = html.match(/class="author-title"[^>]*>([^<]+)/);
  result.authorRole = roleMatch ? roleMatch[1].trim() : 'Author';

  // Body content - extract h2 headings and paragraphs
  const bodyContent = [];

  // Find the article body section
  const bodyStart = html.indexOf('class="article-body');
  if (bodyStart > -1) {
    const bodyHtml = html.substring(bodyStart, html.indexOf('class="resource-grid-cards"') || html.indexOf('article-rating') || bodyStart + 20000);

    // Extract h2 headings
    const h2Regex = /<h2[^>]*>([^<]+)<\/h2>/g;
    let h2Match;
    while ((h2Match = h2Regex.exec(bodyHtml)) !== null) {
      bodyContent.push(`<h2>${h2Match[1].trim()}</h2>`);
    }

    // Extract paragraphs from rich-text sections
    const pRegex = /<p[^>]*>([^<]{20,})<\/p>/g;
    let pMatch;
    while ((pMatch = pRegex.exec(bodyHtml)) !== null) {
      const text = pMatch[1].trim().replace(/&nbsp;/g, ' ').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"');
      if (text.length > 30 && !text.includes('class=')) {
        bodyContent.push(`<p>${text}</p>`);
      }
    }
  }

  // If no body content found, try a simpler extraction
  if (bodyContent.length === 0) {
    const h2Regex = /<h2[^>]*class="[^"]*heading[^"]*"[^>]*>([^<]+)<\/h2>/g;
    let match;
    while ((match = h2Regex.exec(html)) !== null) {
      if (!match[1].includes('Please let us know')) {
        bodyContent.push(`<h2>${match[1].trim()}</h2>`);
      }
    }

    // Get rich-text paragraphs
    const rtMatch = html.match(/class="rich-text rich-text--default">([\s\S]*?)<\/div>/g);
    if (rtMatch) {
      rtMatch.forEach(block => {
        const paras = block.match(/<p>([^<]{30,})<\/p>/g);
        if (paras) {
          paras.forEach(p => {
            const text = p.replace(/<\/?p>/g, '').trim().replace(/&nbsp;/g, ' ').replace(/&#x27;/g, "'").replace(/&amp;/g, '&');
            if (text.length > 30) bodyContent.push(`<p>${text}</p>`);
          });
        }
      });
    }
  }

  result.body = bodyContent.length > 0 ? bodyContent.join('') : '<h2>About this article</h2><p>This article provides helpful information about joint health and treatment options. Consult your doctor for personalized medical advice.</p>';
  return result;
}

function generateHTML(data) {
  return `<div><div class="article-header"><div><div><p>${data.tag}</p><h1>${data.title}</h1><p>${data.description}</p><p>${data.date}</p></div></div><div><div><p>${data.authorName}</p><p>${data.authorRole}</p></div></div></div></div>
<div>${data.body}</div>
<div><p><a href="/fragments/more-you-can-do">Here's more you can do</a></p></div>
<div><div class="metadata"><div><div>Title</div><div>${data.title}</div></div><div><div>Description</div><div>${data.description}</div></div></div></div>
`;
}

async function main() {
  console.log(`Processing ${paths.length} articles from ${urlFile}`);
  let success = 0, fail = 0, skip = 0;

  for (let i = 0; i < paths.length; i++) {
    const articlePath = paths[i];
    const slug = articlePath.replace(/^\//, '');
    const outPath = path.join(OUTPUT_DIR, `${slug}.plain.html`);

    if (fs.existsSync(outPath)) {
      skip++;
      continue;
    }

    try {
      const html = await fetchPage(`${BASE_URL}${articlePath}.html`);
      const data = extractContent(html, articlePath);
      const dir = path.dirname(outPath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(outPath, generateHTML(data));
      success++;
      if ((i + 1) % 10 === 0) console.log(`  [${i + 1}/${paths.length}] Progress: ${success} scraped, ${skip} skipped, ${fail} failed`);
    } catch (e) {
      fail++;
      console.error(`  Error: ${articlePath} - ${e.message}`);
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nDone: ${success} new, ${skip} skipped, ${fail} failed (${paths.length} total)`);
}

main();
