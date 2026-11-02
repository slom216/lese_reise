/* global console */
// Post-build: writes a static HTML page per level and per text into dist/, plus
// sitemap.xml. Crawlers that do not run JavaScript (ChatGPT search among them)
// otherwise see an empty <div id="root">. The React app mounts over this markup
// as before; Cloudflare serves dist/text/a1-01.html at /text/a1-01.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const ORIGIN = 'https://lese.deulern.com';
const LEVELS = ['a1', 'a2', 'b1'];
const shell = readFileSync('dist/index.html', 'utf8');
const texts = Object.fromEntries(
  LEVELS.map((l) => [l, JSON.parse(readFileSync(`src/content/texts/${l}.json`, 'utf8'))]),
);

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const paras = (body) =>
  body.split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join('\n');

function page(path, title, description, main) {
  return shell
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${esc(description)}" />\n    <link rel="canonical" href="${ORIGIN}${path}" />`,
    )
    .replace('<div id="root"></div>', `<div id="root"><main>\n${main}\n</main></div>`);
}

function write(path, title, description, main) {
  const file = `dist${path}.html`;
  mkdirSync(file.slice(0, file.lastIndexOf('/')), { recursive: true });
  writeFileSync(file, page(path, title, description, main));
}

const levelLinks = LEVELS.map(
  (l) => `<li><a href="/level/${l}">Level ${l.toUpperCase()} German reading texts</a></li>`,
).join('\n');

for (const level of LEVELS) {
  const list = texts[level];
  const L = level.toUpperCase();
  write(
    `/level/${level}`,
    `Level ${L} German reading texts · DeuLern Lese Reise`,
    `${list.length} free ${L} German reading texts with a glossary and comprehension questions. No account needed.`,
    `<h1>Level ${L} German reading texts</h1>
<p>${list.length} short texts at CEFR level ${L}. Each has a glossary of difficult words and comprehension questions you can answer in the browser.</p>
<ul>
${list.map((t) => `<li><a href="/text/${t.id}">${esc(t.title)}</a> (${esc(t.topic)})</li>`).join('\n')}
</ul>
<h2>Other levels</h2>
<ul>
${levelLinks}
</ul>`,
  );

  list.forEach((t, i) => {
    const related = [list[i - 1], list[i + 1], list[i + 2]].filter(Boolean);
    write(
      `/text/${t.id}`,
      `${t.title} · ${t.level} German reading text · DeuLern Lese Reise`,
      `Read "${t.title}", ${t.level === 'B1' ? 'a' : 'an'} ${t.level} German text about ${t.topic.toLowerCase()}, with a glossary and ${t.questions.length} comprehension questions.`,
      `<p><a href="/level/${level}">Level ${t.level} texts</a></p>
<h1>${esc(t.title)}</h1>
<p>CEFR level ${t.level} · Topic: ${esc(t.topic)}</p>
<article lang="de">
${paras(t.body)}
</article>
<h2>Glossary</h2>
<dl>
${t.glossary.map((g) => `<dt lang="de">${esc(g.german)}</dt><dd>${esc(g.english)}</dd>`).join('\n')}
</dl>
<h2>Comprehension questions</h2>
<p>Open this page in a browser with JavaScript to answer the questions and check your answers.</p>
<ol lang="de">
${t.questions
  .map((q) =>
    q.type === 'mc'
      ? `<li>${esc(q.prompt)}<ul>${q.options.map((o) => `<li>${esc(o)}</li>`).join('')}</ul></li>`
      : `<li>Richtig oder falsch? ${esc(q.prompt)}</li>`,
  )
  .join('\n')}
</ol>
<h2>More ${t.level} texts</h2>
<ul>
${related.map((r) => `<li><a href="/text/${r.id}">${esc(r.title)}</a></li>`).join('\n')}
</ul>`,
    );
  });
}

// The home page doubles as the SPA fallback, so it gets only the level links.
writeFileSync(
  'dist/index.html',
  page(
    '/',
    'DeuLern Lese Reise',
    'Free graded German reading texts for A1, A2 and B1 with glossary and comprehension questions. No account needed.',
    `<h1>Lese Reise: graded German reading texts</h1>\n<ul>\n${levelLinks}\n</ul>`,
  ).replace(/\n\s*<link rel="canonical"[^>]*>/, ''),
);

const urls = ['/', ...LEVELS.map((l) => `/level/${l}`), ...LEVELS.flatMap((l) => texts[l].map((t) => `/text/${t.id}`))];
writeFileSync(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${ORIGIN}${u}</loc></url>`).join('\n')}
</urlset>
`,
);
console.log(`prerender: ${urls.length - 1} pages + sitemap.xml`);
