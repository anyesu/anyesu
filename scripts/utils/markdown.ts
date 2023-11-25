import { encodeRegExp } from '.';

export interface MarkdownImage {
  alt: string;
  url: string;
  title?: string;
  href?: string;
}

export const MARKDOWN_IMAGE = `!\\[([^\\]]*)]\\(\\s*(.*?)\\s*(["'].*["'])?\\s*\\)`;

export const MARKDOWN_ALL_IMAGE_REGEX = new RegExp(
  // eslint-disable-next-line regexp/strict
  `(?:\\[\\s*${MARKDOWN_IMAGE}\\s*]\\(\\s*([^)]*?)\\s*\\))|(?:${MARKDOWN_IMAGE})`,
  'g',
);

/**
 * Comment in Markdown
 *
 * @see https://stackoverflow.com/a/20885980
 */
export const comment = (content: string) => `[comment]: <> (${content})`;

export const placeholder = (group: string, end: boolean = false) =>
  comment(`placeholder-${group}-${end ? 'end' : 'start'}`);

function resolveMarkdown(markdown: string = '', regExp: RegExp) {
  let matcher: RegExpMatchArray | null;
  const matchers: RegExpMatchArray[] = [];
  while ((matcher = regExp.exec(markdown)) !== null) {
    matchers.push(matcher);
  }
  return matchers;
}

const start = encodeRegExp(placeholder('')).replace('--', '-(.+)-');
const end = encodeRegExp(placeholder('', true)).replace('--', '-\\1-');
const placeholderRegExp = new RegExp(start + '([\\s\\S]*)' + end, 'g');

export function transformPlaceholder(markdown: string, data: Record<string, string>) {
  return markdown.replace(placeholderRegExp, (raw, group) => {
    if (!(group in data)) {
      return raw;
    }
    return `${placeholder(group)}\n\n${data[group] || ''}\n\n${placeholder(group, true)}`;
  });
}

export function resolveMarkdownAllImages(markdown: string = '') {
  const matchers = resolveMarkdown(markdown, MARKDOWN_ALL_IMAGE_REGEX);
  return matchers.map<MarkdownImage>((matcher) => ({
    alt: matcher[1] || matcher[5],
    url: matcher[2] || matcher[6],
    title: matcher[3] || matcher[7],
    href: matcher[4],
  }));
}
