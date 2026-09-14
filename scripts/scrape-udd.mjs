/**
 * scrape-udd.mjs
 *
 * OWL AI Knowledge Base Scraper
 * ─────────────────────────────
 * Scrapes authorized Universidad de Dagupan websites and generates
 * src/lib/uddWebsiteContext.ts with fresh content for the OWL AI assistant.
 *
 * Usage:
 *   npm run scrape
 *   node scripts/scrape-udd.mjs
 *
 * Authorized Sources (per OWL system prompt):
 *   • https://udd.edu.ph/ and all subpages
 *   • https://site.udd.edu.ph/ and all subpages
 *
 * No external dependencies — uses built-in Node.js fetch().
 */

import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const OUTPUT_FILE = join(PROJECT_ROOT, 'src', 'lib', 'uddWebsiteContext.ts');

// ── Configuration ─────────────────────────────────────────────────────────────

const CONFIG = {
  /** Milliseconds to wait between HTTP requests (be polite to the server) */
  RATE_LIMIT_MS: 1500,
  /** Max retry attempts for failed requests */
  MAX_RETRIES: 2,
  /** Request timeout in milliseconds */
  TIMEOUT_MS: 15000,
  /** Max individual news/event articles to deep-scrape */
  MAX_ARTICLES: 40,
  /** Max news listing pages to paginate through */
  MAX_NEWS_PAGES: 5,
  /** Approx character limit for the entire output (to stay within LLM context) */
  MAX_OUTPUT_CHARS: 80000,
  /** Minimum characters for a page's text to be considered useful */
  MIN_CONTENT_CHARS: 100,
  /** User-Agent header */
  USER_AGENT:
    'OWL-Kiosk-Scraper/1.0 (Universidad de Dagupan AI Knowledge Base; contact: info@udd.edu.ph)',
};

// ── File extension blocklist (never scrape these) ─────────────────────────────
const BLOCKED_EXTENSIONS = new Set([
  '.css', '.js', '.mjs', '.ts',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.avif',
  '.woff', '.woff2', '.ttf', '.eot',
  '.mp4', '.webm', '.mp3', '.ogg',
  '.pdf', '.zip', '.json', '.xml', '.txt',
  '.map', '.gz', '.br',
]);

/** Returns true if the URL points to a static asset that should be skipped */
function isAssetUrl(url) {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return BLOCKED_EXTENSIONS.has(pathname.substring(pathname.lastIndexOf('.')));
  } catch {
    return true; // Skip malformed URLs
  }
}

// ── Authorized Static Pages ───────────────────────────────────────────────────

/** Pages to always scrape, regardless of deduplication */
const STATIC_PAGES = [
  { url: 'https://udd.edu.ph/', label: 'UdD Homepage' },
  { url: 'https://udd.edu.ph/programs', label: 'Academic Programs' },
  { url: 'https://udd.edu.ph/enrollment', label: 'Enrollment Information' },
  { url: 'https://udd.edu.ph/contact-us', label: 'Contact Information' },
  { url: 'https://udd.edu.ph/allnews', label: 'News Listing' },
  { url: 'https://udd.edu.ph/feature', label: 'Featured Stories' },
  { url: 'https://udd.edu.ph/topnotchers', label: 'Board Exam Topnotchers' },
  { url: 'https://udd.edu.ph/allevents', label: 'Events Listing' },
  { url: 'https://site.udd.edu.ph/', label: 'School of IT Microsite' },
];

// ── HTML Utilities ────────────────────────────────────────────────────────────

/** Remove entire HTML tag blocks (including inner content) */
function stripTagBlock(html, tag) {
  // Non-greedy match with DOTALL
  const re = new RegExp(`<${tag}[\\s>][\\s\\S]*?<\\/${tag}>`, 'gi');
  return html.replace(re, ' ');
}

/** Extract the <title> from raw HTML */
function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].trim().replace(/\s+/g, ' ') : 'Untitled';
}

/**
 * Convert raw HTML to clean readable text.
 * Strips scripts, styles, navigation, footers. Pure regex — no deps needed.
 */
function htmlToText(html) {
  let text = html;

  // 1. Remove noisy blocks entirely (including their content)
  for (const tag of ['script', 'style', 'noscript', 'nav', 'footer', 'head', 'iframe', 'svg', 'template']) {
    text = stripTagBlock(text, tag);
  }

  // 2. Replace block elements with newlines for readability
  text = text.replace(/<\/?(p|div|section|article|header|aside|h[1-6]|li|tr|td|th|br|hr|blockquote)[^>]*>/gi, '\n');

  // 3. Replace inline elements that carry semantic meaning
  text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>/gi, ' ');
  text = text.replace(/<\/a>/gi, ' ');

  // 4. Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // 5. Decode HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&[a-z]+;/gi, ' ');

  // 6. Normalize whitespace
  text = text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 1) // Remove single-char lines
    .join('\n');

  // 7. Collapse 3+ consecutive blank lines into 2
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Discover /news/NNN and /events/NNN article links from listing page HTML.
 * Handles both relative (/news/123) and absolute (https://udd.edu.ph/news/123) hrefs.
 */
function discoverArticleLinks(html) {
  const links = new Set();
  // Match relative paths like href="/news/128" or href="/events/12"
  const relRegex = /href="(\/(?:news|events)\/(\d+))"/gi;
  let m;
  while ((m = relRegex.exec(html)) !== null) {
    links.add(`https://udd.edu.ph${m[1]}`);
  }
  // Match absolute paths
  const absRegex = /href="(https?:\/\/udd\.edu\.ph\/(?:news|events)\/\d+)"/gi;
  while ((m = absRegex.exec(html)) !== null) {
    links.add(m[1]);
  }
  return [...links];
}

/**
 * Discover safe subpages on site.udd.edu.ph (exclude assets).
 */
function discoverMicrositeLinks(html) {
  const links = new Set();
  const re = /href="(https?:\/\/site\.udd\.edu\.ph\/[^"#?]*)"/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const url = m[1].replace(/\/$/, '');
    // Skip asset files and the root (already in static list)
    if (!isAssetUrl(url) && url !== 'https://site.udd.edu.ph') {
      links.add(m[1]);
    }
  }
  return [...links].slice(0, 8);
}

// ── HTTP Fetcher ──────────────────────────────────────────────────────────────

async function fetchPage(url, attempt = 0) {
  if (isAssetUrl(url)) {
    throw new Error(`Blocked asset URL: ${url}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': CONFIG.USER_AGENT,
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
    });

    // Check content-type — reject non-HTML responses
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      throw new Error(`Non-HTML response: ${contentType}`);
    }

    const html = await response.text();
    return { html, status: response.status, ok: response.ok };
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${CONFIG.TIMEOUT_MS}ms`);
    }
    if (attempt < CONFIG.MAX_RETRIES) {
      const backoff = (attempt + 1) * 2500;
      log(`  ↻ Retry ${attempt + 1}/${CONFIG.MAX_RETRIES} (${backoff}ms wait)...`, 'warn');
      await sleep(backoff);
      return fetchPage(url, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ── Content Deduplication (for articles only) ─────────────────────────────────

/**
 * Article-level deduplication using full content hash.
 * Static pages are NEVER deduplicated — each is intentionally unique.
 */
class ArticleDedup {
  constructor() {
    this.seen = new Set();
  }

  /** MD5-style fingerprint of the full text content */
  hash(text) {
    return createHash('sha1').update(text).digest('hex');
  }

  isNew(text) {
    const h = this.hash(text);
    if (this.seen.has(h)) return false;
    this.seen.add(h);
    return true;
  }
}

// ── Output Formatting ─────────────────────────────────────────────────────────

function formatBlock(index, title, url, text) {
  return `\n--- Source ${index} ---\nTitle: ${title}\n\nSource: ${url}\n\n---\n\n${text}\n`;
}

function generateTypeScriptFile(blocks, stats) {
  const timestamp = new Date().toISOString();
  return [
    `// Auto-generated by scripts/scrape-udd.mjs`,
    `// Last updated: ${timestamp}`,
    `// Pages scraped: ${stats.pagesScraped} | Articles: ${stats.articlesScraped} | Failed: ${stats.pagesFailed}`,
    `// Run 'npm run scrape' to refresh this file`,
    `export const UDD_WEBSITE_CONTEXT = \``,
    ...blocks,
    `\`;\n`,
  ].join('\n');
}

// ── Logger ────────────────────────────────────────────────────────────────────

const C = {
  reset: '\x1b[0m', green: '\x1b[32m', yellow: '\x1b[33m',
  red: '\x1b[31m', cyan: '\x1b[36m', dim: '\x1b[2m', bold: '\x1b[1m',
};

function log(msg, level = 'info') {
  const icons = { info: `${C.cyan}ℹ${C.reset}`, success: `${C.green}✓${C.reset}`,
    warn: `${C.yellow}⚠${C.reset}`, error: `${C.red}✗${C.reset}`, section: `${C.bold}${C.cyan}▶${C.reset}` };
  console.log(`${icons[level] ?? '•'} ${msg}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`
${C.bold}${C.cyan}╔══════════════════════════════════════════════╗
║   OWL AI Knowledge Base Scraper v2           ║
║   Universidad de Dagupan — udd.edu.ph        ║
╚══════════════════════════════════════════════╝${C.reset}
`);

  const stats = { pagesScraped: 0, pagesFailed: 0, articlesScraped: 0, totalChars: 0 };
  const dedup = new ArticleDedup();
  const contentBlocks = [];
  let sourceIndex = 1;
  const discoveredArticleUrls = new Set();

  // ── Phase 1: Static Pages (no deduplication) ───────────────────────────────

  log('Phase 1: Scraping static authorized pages...', 'section');

  // Build full static queue including paginated news pages
  const staticQueue = [
    ...STATIC_PAGES,
    ...Array.from({ length: CONFIG.MAX_NEWS_PAGES - 1 }, (_, i) => ({
      url: `https://udd.edu.ph/allnews?page=${i + 2}`,
      label: `News Listing (Page ${i + 2})`,
    })),
  ];

  for (const { url, label } of staticQueue) {
    log(`Fetching: ${C.dim}${url}${C.reset} ${C.dim}(${label})${C.reset}`);

    try {
      const { html, ok, status } = await fetchPage(url);

      if (!ok) {
        log(`  Skipped — HTTP ${status}`, 'warn');
        stats.pagesFailed++;
        await sleep(CONFIG.RATE_LIMIT_MS);
        continue;
      }

      const title = extractTitle(html);
      const text = htmlToText(html);

      if (text.length < CONFIG.MIN_CONTENT_CHARS) {
        log(`  Skipped — too little text content (${text.length} chars, site may require JS rendering)`, 'warn');
        await sleep(CONFIG.RATE_LIMIT_MS);
        continue;
      }

      // Discover article links from this page
      const newArticles = discoverArticleLinks(html);
      for (const articleUrl of newArticles) discoveredArticleUrls.add(articleUrl);

      // Discover microsite subpages from site.udd.edu.ph
      if (url.includes('site.udd.edu.ph')) {
        for (const msUrl of discoverMicrositeLinks(html)) discoveredArticleUrls.add(msUrl);
      }

      // NOTE: Static pages are ALWAYS included — no dedup check here
      const block = formatBlock(sourceIndex++, title, url, text);
      contentBlocks.push(block);
      stats.pagesScraped++;
      stats.totalChars += block.length;

      log(`  Scraped: "${C.green}${title}${C.reset}" — ${text.length.toLocaleString()} chars, ${newArticles.length} article links found`, 'success');
    } catch (err) {
      log(`  Failed — ${err.message}`, 'error');
      stats.pagesFailed++;
    }

    if (stats.totalChars >= CONFIG.MAX_OUTPUT_CHARS) {
      log(`Output limit reached (${CONFIG.MAX_OUTPUT_CHARS.toLocaleString()} chars). Skipping remaining static pages.`, 'warn');
      break;
    }

    await sleep(CONFIG.RATE_LIMIT_MS);
  }

  log(`\nDiscovered ${discoveredArticleUrls.size} article/event/microsite URLs to deep-scrape.`);

  // ── Phase 2: Deep-scrape Discovered Articles ───────────────────────────────

  log('\nPhase 2: Deep-scraping individual articles and event pages...', 'section');

  // Sort: prefer /news/ and /events/ over microsite pages, cap total
  const articleQueue = [...discoveredArticleUrls]
    .filter((u) => !isAssetUrl(u))
    .sort((a, b) => {
      const aIsNews = /\/(news|events)\/\d+/.test(a) ? 0 : 1;
      const bIsNews = /\/(news|events)\/\d+/.test(b) ? 0 : 1;
      return aIsNews - bIsNews;
    })
    .slice(0, CONFIG.MAX_ARTICLES);

  log(`Queued ${articleQueue.length} URLs (capped at ${CONFIG.MAX_ARTICLES}).`);

  for (const url of articleQueue) {
    if (stats.totalChars >= CONFIG.MAX_OUTPUT_CHARS) {
      log(`Output size limit reached (${CONFIG.MAX_OUTPUT_CHARS.toLocaleString()} chars). Stopping article scraping.`, 'warn');
      break;
    }

    log(`Fetching: ${C.dim}${url}${C.reset}`);

    try {
      const { html, ok, status } = await fetchPage(url);

      if (!ok) {
        log(`  Skipped — HTTP ${status}`, 'warn');
        stats.pagesFailed++;
        await sleep(CONFIG.RATE_LIMIT_MS);
        continue;
      }

      const title = extractTitle(html);
      const text = htmlToText(html);

      if (text.length < CONFIG.MIN_CONTENT_CHARS) {
        log(`  Skipped — too little text (${text.length} chars)`, 'warn');
        await sleep(CONFIG.RATE_LIMIT_MS);
        continue;
      }

      // Deduplicate articles (unlike static pages)
      if (!dedup.isNew(text)) {
        log(`  Skipped — duplicate content`, 'warn');
        await sleep(CONFIG.RATE_LIMIT_MS);
        continue;
      }

      const block = formatBlock(sourceIndex++, title, url, text);
      contentBlocks.push(block);
      stats.articlesScraped++;
      stats.totalChars += block.length;

      log(`  Scraped: "${C.green}${title}${C.reset}" — ${text.length.toLocaleString()} chars`, 'success');
    } catch (err) {
      log(`  Failed — ${err.message}`, 'error');
      stats.pagesFailed++;
    }

    await sleep(CONFIG.RATE_LIMIT_MS);
  }

  // ── Phase 3: Write Output File ─────────────────────────────────────────────

  log('\nPhase 3: Writing uddWebsiteContext.ts...', 'section');

  if (contentBlocks.length === 0) {
    log(
      'No content was scraped! The UdD website may require JavaScript rendering (client-side SPA).\n' +
      'The existing uddWebsiteContext.ts was NOT overwritten.\n' +
      'Consider using Puppeteer for JS-rendered pages: npm install --save-dev puppeteer',
      'error'
    );
    process.exit(1);
  }

  const tsContent = generateTypeScriptFile(contentBlocks, stats);
  writeFileSync(OUTPUT_FILE, tsContent, 'utf-8');

  const fileSizeKB = (Buffer.byteLength(tsContent, 'utf-8') / 1024).toFixed(1);

  console.log(`
${C.bold}${C.green}╔══════════════════════════════════════════════╗
║   ✅ Scraping Complete!                       ║
╚══════════════════════════════════════════════╝${C.reset}

  Static pages scraped: ${C.green}${stats.pagesScraped}${C.reset}
  Articles scraped:     ${C.green}${stats.articlesScraped}${C.reset}
  Pages failed:         ${stats.pagesFailed > 0 ? C.yellow : C.green}${stats.pagesFailed}${C.reset}
  Output file:          ${C.cyan}src/lib/uddWebsiteContext.ts${C.reset}
  File size:            ${C.cyan}${fileSizeKB} KB${C.reset}

  ${C.dim}OWL AI is now up-to-date with the latest UdD information!${C.reset}
  ${C.dim}Run 'npm run build' to deploy the updated knowledge base.${C.reset}
`);
}

main().catch((err) => {
  console.error(`\n${C.red}Fatal error:${C.reset}`, err.message);
  process.exit(1);
});
