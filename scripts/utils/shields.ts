import qs from 'qs';
import { isRemoteUrl, trimObject } from '.';
import { svgToDataUrl } from './image';
import { resolveMarkdownAllImages } from './markdown';

export type BadgeStyle = 'flat' | 'flat-square' | 'plastic' | 'for-the-badge' | 'social';

/**
 * hex, rgb, rgba, hsl, hsla and css named colors supported
 */
export type BadgeColor = string;

export interface Badge {
  /**
   * [Path Parameter]
   *
   * Used in badgeContent (optional)
   *
   * Label, (optional) message, and color. Separated by dashes
   */
  labelInContent?: string;

  /**
   * [Path Parameter]
   *
   * Used in badgeContent
   *
   * Label, (optional) message, and color. Separated by dashes
   */
  message?: string;

  /**
   * [Query Parameter]
   *
   * One of: flat (default), flat-square, plastic, for-the-badge, social
   *
   * @default: 'flat'
   * @example 'flat'
   */
  style?: BadgeStyle;

  /**
   * [Query Parameter]
   *
   * One of the named logos (bitcoin, dependabot, gitlab, npm, paypal, serverfault, stackexchange, superuser, telegram, travis) or simple-icons. All simple-icons are referenced using icon slugs. You can click the icon title on simple-icons to copy the slug or they can be found in the slugs.md file in the simple-icons repository. Further info.
   *
   * @example 'appveyor'
   */
  logo?: string;

  /**
   * [Query Parameter]
   *
   * The color of the logo (hex, rgb, rgba, hsl, hsla and css named colors supported). Supported for named logos and Shields logos but not for custom logos. For multicolor Shields logos, the corresponding named logo will be used and colored.
   *
   * @example 'violet'
   */
  logoColor?: BadgeColor;

  /**
   * [Query Parameter]
   *
   * Override the default left-hand-side text (URL-Encoding needed for spaces or special characters!)
   *
   * @example 'healthiness'
   */
  label?: string;

  /**
   * [Query Parameter]
   *
   * Background color of the left part (hex, rgb, rgba, hsl, hsla and css named colors supported).
   *
   * @example 'abcdef'
   */
  labelColor?: BadgeColor;

  /**
   * [Query Parameter]
   *
   * Background color of the right part (hex, rgb, rgba, hsl, hsla and css named colors supported).
   *
   * @example 'fedcba'
   */
  color?: BadgeColor;

  /**
   * [Query Parameter]
   *
   * HTTP cache lifetime (rules are applied to infer a default value on a per-badge basis, any values specified below the default will be ignored).
   *
   * @example 3600
   */
  cacheSeconds?: number;

  /**
   * [Query Parameter]
   *
   * Specify what clicking on the left/right of a badge should do. Note that this only works when integrating your badge in an <object> HTML tag, but not an <img> tag or a markup language.
   */
  link?: string[];

  /**
   * External link
   */
  href?: string;
}

const SHIELDS_API_STATIC_BADGE = 'https://img.shields.io/badge';
const MARKDOWN_BADGE_REGEX =
  /img\.shields\.io\/badge\/(?:((?:[^\s?-]|--)*)-)?((?:[^\s?-]|--)*)-((?:[^\s.?-]|--)*)(?:\.svg)?(?=[)?])/;

const encodeBadgeContent = (str?: string) =>
  str?.replace(' ', '%20').replace('_', '__').replace('-', '--');

const decodeBadgeContent = (str?: string) =>
  str?.replace('%20', ' ').replace('__', '_').replace('--', '-');

export function sortParams(params: Badge) {
  // prettier-ignore
  const { labelInContent, message, style, logo, logoColor, labelColor, color, cacheSeconds, link, href } = params;
  // prettier-ignore
  return trimObject({ labelInContent, message, style, logo, logoColor, labelColor, color, cacheSeconds, link, href });
}

/**
 * @see https://shields.io/badges/static-badge
 */
export async function buildMarkdownBadge(params: Badge) {
  const { labelInContent, message, color, href, ...rest } = params;
  let { logo } = params;
  const badgeContent = [labelInContent, message, color]
    .filter(Boolean)
    .map((item) => encodeBadgeContent(item))
    .join('-');
  logo = logo && isRemoteUrl(logo) ? await svgToDataUrl(logo) : logo;
  const query = qs.stringify(sortParams({ ...rest, logo }), { encode: false });
  const img = `![${
    labelInContent || message
  }](${SHIELDS_API_STATIC_BADGE}/${badgeContent}?${query})`;
  return href ? `[${img}](${href})` : img;
}

export function resolveMarkdownBadges(markdown: string) {
  const images = resolveMarkdownAllImages(markdown);
  return images.reduce<Badge[]>((badges, image) => {
    const { alt, url, href } = image;
    const matcher = MARKDOWN_BADGE_REGEX.exec(url);
    if (!matcher) return badges;

    const labelInContent = decodeBadgeContent(matcher[1]) || undefined;
    const message = decodeBadgeContent(matcher[2]) || alt || '';
    const index = url.indexOf('?');
    const search = index >= 0 ? url.slice(index + 1) : '';
    const params = qs.parse(search) as Badge;
    const color = params.color || matcher[3];
    return [...badges, sortParams({ ...params, labelInContent, message, color, href })];
  }, []);
}
