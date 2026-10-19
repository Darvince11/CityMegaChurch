'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Brand } from './brand';
import { Icon } from './icon';
import { api } from '@/lib/api';
import type { AuthUser } from '@cdp/shared';
const navigation = [{ href: '/', label: 'Home' }, { href: '/about', label: 'About' }, { href: '/services', label: 'Services' }, { href: '/announcements', label: 'Announcements' }, { href: '/sermons', label: 'Sermons' }, { href: '/gallery', label: 'Gallery' }, { href: '/contact', label: 'Contact' }];
export function SiteHeader(): React.JSX.Element {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => { let active = true; const check = () => { void api.me().then(result => { if (active) setUser(result.user); }).catch(() => { if (active) setUser(null); }); }; check(); window.addEventListener('auth-changed', check); return () => { active = false; window.removeEventListener('auth-changed', check); }; }, [pathname]);
  async function signOut() { await api.logout(); setUser(null); setOpen(false); window.dispatchEvent(new Event('auth-changed')); window.location.assign('/'); }
  const isAdmin = user?.permissions.includes('*') || user?.permissions.includes('reports.read_all');
  if (pathname.startsWith('/admin') || pathname.startsWith('/account')) return <></>;
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    {!user && <div className="welcome-bar"><div className="container"><span><span className="small-cross">✦</span> A place for faith. A people to call family.</span><Link href="/services#visit">Your first visit starts here <Icon name="arrow-up" size={13} /></Link></div></div>}
    <header className={`site-header${user ? ' site-header--signed-in' : ''}`}><div className="container header-inner"><Brand />{!user && <><nav aria-label="Main navigation" className="desktop-nav">{navigation.map(({ href, label }) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined}>{label}</Link>)}</nav><div className="header-actions"><Link href="/login" className="member-link"><Icon name="user" size={16} />Member login</Link><Link href="/services#visit" className="btn btn--primary btn--small">Plan your visit <Icon name="arrow-up" size={15} /></Link></div></>} {user && <div className="signed-in-identity"><span className="signed-in-avatar">{user.fullName.split(/\s+/).map(part=>part[0]).slice(0,2).join('')}</span><span><small>Signed in as</small><strong>{user.fullName}</strong></span></div>}<button ref={toggle} className={`menu-toggle${user ? ' menu-toggle--account' : ''}`} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} /></button></div>
    {open && <nav id="mobile-navigation" aria-label={user ? 'Account navigation' : 'Mobile navigation'} className={`mobile-nav container${user ? ' logged-nav' : ''}`}>{user ? <><Link href={isAdmin ? '/admin' : '/account'} onClick={() => setOpen(false)}>{isAdmin ? 'Admin dashboard' : 'My dashboard'} <Icon name="arrow" size={17}/></Link><Link href="/account" onClick={() => setOpen(false)}>Profile & security <Icon name="user" size={17}/></Link><button className="mobile-logout" onClick={() => void signOut()}>Sign out <Icon name="logout" size={17}/></button></> : <>{navigation.map(({ href, label }) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={pathname === href ? 'page' : undefined}>{label}<Icon name="arrow" size={17} /></Link>)}<Link href="/login" onClick={() => setOpen(false)}>Member login <Icon name="user" size={17} /></Link><Link href="/services#visit" className="btn btn--primary" onClick={() => setOpen(false)}>Plan your visit <Icon name="arrow-up" /></Link></>}</nav>}</header>
  </>;
}

