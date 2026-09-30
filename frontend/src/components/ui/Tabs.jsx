import { useRef } from 'react';

const PILL_TAB_CLASS = (selected) =>
 `flex items-center gap-2 rounded-full px-4 py-2 font-label-caps text-label-caps uppercase transition-all ${
  selected
   ? 'bg-brand text-white'
   : 'bg-surface-container text-ink-muted hover:bg-outline-variant dark:bg-dark-surface-container dark:text-dark-ink-muted'
 }`;

// Matches the mobile portal-nav underline-tab style already used across
// AdminPanel/ClientPortal/PartnerPortal — same visuals, now with real
// tab semantics (role="tab"/aria-selected/roving tabindex + arrow keys)
// instead of the previous plain buttons inside a role="tablist" div.
const UNDERLINE_TAB_CLASS = (selected) =>
 `flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-label-caps text-label-caps uppercase transition-colors ${
  selected
   ? 'border-brand font-bold text-brand'
   : 'border-transparent font-semibold text-ink-muted hover:border-brand/40 hover:text-ink'
 }`;

/**
 * Shared accessible tab list. Full ARIA tabs pattern (roving tabindex,
 * arrow-key navigation). `variant="pill"` (default) is the rounded pill
 * style; `variant="underline"` matches the portal mobile-nav underline style.
 *
 * const [tab, setTab] = useState('overview');
 * <Tabs
 *  tabs={[{ key: 'overview', label: 'Overview', icon: <Icon name="dashboard" /> }, ...]}
 *  active={tab}
 *  onChange={setTab}
 * />
 * {tab === 'overview' && <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview">...</div>}
 */
export default function Tabs({ tabs, active, onChange, variant = 'pill', tabClassName, className, ariaLabel }) {
 const refs = useRef({});
 const tabClass = tabClassName ?? (variant === 'underline' ? UNDERLINE_TAB_CLASS : PILL_TAB_CLASS);

 const onKeyDown = (e, idx) => {
  if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
  e.preventDefault();
  let nextIdx = idx;
  if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length;
  if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabs.length) % tabs.length;
  if (e.key === 'Home') nextIdx = 0;
  if (e.key === 'End') nextIdx = tabs.length - 1;
  const next = tabs[nextIdx];
  onChange(next.key);
  refs.current[next.key]?.focus();
 };

 return (
  <div role="tablist" aria-label={ariaLabel} className={className ?? 'flex flex-wrap gap-2'}>
   {tabs.map((tab, idx) => {
    const selected = tab.key === active;
    return (
     <button
      key={tab.key}
      ref={(el) => { refs.current[tab.key] = el; }}
      id={`tab-${tab.key}`}
      role="tab"
      type="button"
      aria-selected={selected}
      aria-controls={`panel-${tab.key}`}
      tabIndex={selected ? 0 : -1}
      onClick={() => onChange(tab.key)}
      onKeyDown={(e) => onKeyDown(e, idx)}
      className={tabClass(selected)}
     >
      {tab.icon}
      {tab.label}
     </button>
    );
   })}
  </div>
 );
}
