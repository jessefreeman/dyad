#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const DOCS_DIR = path.join(ROOT, 'docs');

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

function parseLinks(md) {
  // basic markdown link regex: [text](href)
  const regex = /\[[^\]]*\]\(([^)]+)\)/g;
  const links = [];
  let match;
  while ((match = regex.exec(md))) {
    links.push(match[1]);
  }
  return links;
}

function extractHeadings(md) {
  // lines starting with # produce anchors (GitHub-style slug)
  const lines = md.split(/\r?\n/);
  const headings = [];
  for (const line of lines) {
    const m = /^(#{1,6})\s+(.*)$/.exec(line.trim());
    if (m) headings.push(m[2].trim());
  }
  return headings;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function collectAnchors(md) {
  const hs = extractHeadings(md);
  const set = new Set(hs.map(slugify));
  return set;
}

function isHttp(url) {
  return /^https?:\/\//i.test(url);
}

function isAnchorOnly(url) {
  return url.startsWith('#');
}

function isMailto(url) {
  return /^mailto:/i.test(url);
}

function isMdLink(url) {
  return url.endsWith('.md') || url.includes('.md#');
}

const mdFiles = Array.from(walk(DOCS_DIR)).filter(f => f.endsWith('.md'));

let failures = [];

for (const file of mdFiles) {
  const relFile = path.relative(ROOT, file);
  const md = fs.readFileSync(file, 'utf8');
  const links = parseLinks(md);
  for (const href of links) {
    // skip external and non-md links; focus on internal .md cross-refs
    if (isHttp(href) || isMailto(href) || isAnchorOnly(href)) continue;
    if (!isMdLink(href)) continue;

    const [hrefPath, anchor] = href.split('#');
    const resolved = path.resolve(path.dirname(file), hrefPath);
    // Ensure inside repo
    if (!resolved.startsWith(ROOT)) {
      failures.push({ file: relFile, href, reason: 'RESOLVES_OUTSIDE_REPO' });
      continue;
    }
    if (!fs.existsSync(resolved)) {
      failures.push({ file: relFile, href, reason: 'MISSING_FILE', resolved: path.relative(ROOT, resolved) });
      continue;
    }
    // Optional: check anchor exists
    if (anchor) {
      try {
        const targetMd = fs.readFileSync(resolved, 'utf8');
        const anchors = collectAnchors(targetMd);
        if (!anchors.has(anchor.toLowerCase())) {
          if (!anchors.has(anchor)) {
            failures.push({ file: relFile, href, reason: 'MISSING_ANCHOR', resolved: path.relative(ROOT, resolved) });
          }
        }
      } catch (e) {
        failures.push({ file: relFile, href, reason: 'ANCHOR_CHECK_FAILED', error: String(e) });
      }
    }
  }
}

if (failures.length) {
  console.error('Broken doc links found:');
  for (const f of failures) {
    console.error(`- ${f.file}: ${f.href} => ${f.reason}${f.resolved ? ` (${f.resolved})` : ''}`);
  }
  process.exit(1);
} else {
  console.log('All internal markdown cross-references resolve.');
}
