type IconName = 'arrow' | 'arrow-up' | 'heart' | 'book' | 'people' | 'clock' | 'pin' | 'mail' | 'phone' | 'user' | 'close' | 'menu' | 'check' | 'sun' | 'cross' | 'logout';
const paths: Record<IconName, React.ReactNode> = {
  arrow: <path d="M4 12h15M13 5l7 7-7 7" />,
  'arrow-up': <path d="M5 19 19 5M5 5h14v14" />,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  book: <path d="M12 5v16M12 5C8 2 4 3 2 4v15c3-1 6-1 10 2 4-3 7-3 10-2V4c-2-1-6-2-10 1Z" />,
  people: <><circle cx="9" cy="7" r="4" /><path d="M2 21v-2a7 7 0 0 1 14 0v2M17 3a4 4 0 0 1 0 8M22 21v-2a7 7 0 0 0-4-6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 6 10 7L22 6" /></>,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7l.4 2.7a2 2 0 0 1-.6 1.8L8.6 10.5a16 16 0 0 0 4.9 4.9l1.3-1.3a2 2 0 0 1 1.8-.6l2.7.4a2 2 0 0 1 1.7 2Z" />,
  user: <><circle cx="12" cy="7" r="4" /><path d="M4 22v-2a8 8 0 0 1 16 0v2" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  check: <path d="m5 12 4 4L19 6" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" /></>,
  cross: <path d="M10 2h4v6h6v4h-6v10h-4V12H4V8h6Z" />,
  logout: <path d="M9 3H4v18h5M10 12h12M17 7l5 5-5 5" />,
};
export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }): React.JSX.Element {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>{paths[name]}</svg>;
}

