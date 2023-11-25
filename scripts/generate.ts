import { readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import esMain from 'es-main';
import { languages, techStacks, tools } from './data';
import { transformPlaceholder } from './utils/markdown';
import { buildMarkdownBadge } from './utils/shields';

async function transformBadges(markdown: string) {
  const groups = {
    tools,
    languages,
    'tech-stacks': techStacks,
  };
  const data = {};
  for (const [group, badges] of Object.entries(groups)) {
    const links = [];
    for (const badge of badges) {
      links.push(await buildMarkdownBadge(badge));
    }
    data[group] = links.join(' ');
  }
  return transformPlaceholder(markdown, data);
}

async function main() {
  const filePath = path.resolve(process.cwd(), 'README.md');
  const markdown = readFileSync(filePath, 'utf8');
  // console.log(resolveMarkdownBadges(markdown));
  const result = await transformBadges(markdown);
  writeFileSync(filePath, result);
}

if (esMain(import.meta)) {
  main().then();
}
