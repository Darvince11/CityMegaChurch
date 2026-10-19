'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from './icon';

export function PortalMobileControl(): React.JSX.Element | null {
  const pathname = usePathname();
  const isPortal = pathname.startsWith('/account') || pathname.startsWith('/admin');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isPortal) return;
    document.body.classList.toggle('portal-drawer-open', open);
    const sidebar = document.querySelector('.portal-sidebar');
    const closeAfterSelection = (event: Event) => {
      if ((event.target as HTMLElement).closest('button, a')) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    sidebar?.addEventListener('click', closeAfterSelection);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.classList.remove('portal-drawer-open');
      sidebar?.removeEventListener('click', closeAfterSelection);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isPortal, open]);

  if (!isPortal) return null;
  return <>
    <button className="portal-mobile-toggle" aria-label={open ? 'Close portal menu' : 'Open portal menu'} aria-expanded={open} onClick={() => setOpen(value => !value)}><Icon name={open ? 'close' : 'menu'} /></button>
    <button className="portal-drawer-backdrop" aria-label="Close portal menu" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} />
  </>;
}
