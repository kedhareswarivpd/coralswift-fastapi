// Material Symbols icons render via ligature text (the span's own text
// content is the literal icon name, e.g. "dashboard", "folder") — without
// aria-hidden, that text is exposed to assistive tech and gets concatenated
// into the accessible name of any parent button/link ("dashboard Overview"
// instead of "Overview"). These icons are always decorative pairings with
// visible adjacent text in this app, so they're hidden from the
// accessibility tree by default; a caller can still override via props.

// CMS-seeded records carry icon names that don't exist in the Material
// Symbols registry (verified against its codepoints file) — without these
// aliases they render their raw ligature text instead of a glyph.
const ALIASES = {
  sparkles: 'auto_awesome',
  'cpu-chip': 'memory',
  cube: 'inventory_2',
  'building-office': 'apartment',
};

const DEFAULT_ICON = 'star';

export default function Icon({ name, className = '', ...rest }) {
  const resolved = ALIASES[name] || name || DEFAULT_ICON;
  return (
   <span aria-hidden="true" className={`material-symbols-outlined ${className}`} {...rest}>
    {resolved}
   </span>
  );
}
