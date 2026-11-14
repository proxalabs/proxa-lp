import { SECTION_KIT } from '../lib/pageSections';

// Render one page section ({ type, data }) via the kit.
export default function SectionRenderer({ section }) {
  const def = SECTION_KIT[section.type];
  if (!def) return null;
  return def.render(section.data || {});
}
