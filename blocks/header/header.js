import { getMetadata, loadCSS } from '../../scripts/aem.js';
import { loadFragment, resolveFragmentPath } from '../fragment/fragment.js';

/**
 * Extract legacy nav part nodes from a loaded fragment.
 * Unwraps authored section wrappers when present.
 * @param {Element} fragment Loaded navigation fragment root
 * @returns {Element[]} Nav part elements (brand, sections, tools)
 */
function getLegacyNavParts(fragment) {
  const parts = [];

  [...fragment.children].forEach((child) => {
    if (child.classList.contains('section')) {
      const inner = child.querySelector(':scope > .default-content-wrapper')
        || child.querySelector(':scope > div');
      if (inner) {
        parts.push(inner);
        return;
      }
    }
    parts.push(child);
  });

  return parts;
}

/**
 * Mount decorated navigation markup inside the header block.
 * @param {Element} block Header block element
 * @param {Element} fragment Loaded navigation fragment
 */
async function mountNavigation(block, fragment) {
  const decoratedNav = fragment.querySelector('nav#nav, .navigation.block nav, .navigation nav');

  await loadCSS(`${window.hlx.codeBasePath}/blocks/navigation/navigation.css`);

  block.textContent = '';
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';

  if (decoratedNav) {
    navWrapper.append(decoratedNav);
    block.append(navWrapper);
    return;
  }

  // Legacy fragment format: three divs (brand, sections, tools)
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.className = 'navigation';

  const bar = document.createElement('div');
  bar.className = 'nav-bar';

  const classes = ['brand', 'sections', 'tools'];
  getLegacyNavParts(fragment).forEach((part, i) => {
    part.classList.add(`nav-${classes[i] || 'section'}`);
    bar.append(part);
  });

  nav.append(bar);
  navWrapper.append(nav);
  block.append(navWrapper);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = await resolveFragmentPath(navMeta, 'nav');
  const fragment = await loadFragment(navPath, { blocksOnly: true });

  if (!fragment) {
    block.textContent = '';
    return;
  }

  await mountNavigation(block, fragment);
}
