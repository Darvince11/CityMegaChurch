'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { church } from '@/lib/church';
import { Brand } from './brand';
import { Icon } from './icon';

export function SiteFooter(): React.JSX.Element {
  const pathname = usePathname();
  if (pathname.startsWith('/admin') || pathname.startsWith('/account')) return <></>;
  return <footer className="site-footer">
    <div className="container footer-top"><div><p className="eyebrow eyebrow--light">THERE IS A PLACE FOR YOU HERE</p><h2>Let’s take the next step.<br/><em>Together.</em></h2></div><Link href="/services#visit" className="btn btn--cream">Plan your visit <Icon name="arrow-up"/></Link></div>
    <div className="container footer-grid">
      <div className="footer-brand"><Brand light/><p>A community rooted in faith, growing in love, and finding purpose together. Welcome to {church.name}.</p><span className="footer-note"><span className="status-dot"/> Come as you are. You belong here.</span></div>
      <div><h3>Church</h3><Link href="/about">About us</Link><Link href="/services">Services</Link><Link href="/announcements">Announcements</Link><Link href="/sermons">Sermons</Link><Link href="/gallery">Gallery</Link></div>
      <div><h3>Connect</h3><Link href="/contact">Contact us</Link><Link href="/services#visit">Plan a visit</Link><Link href="/register">Become a member</Link><Link href="/login">Member sign in</Link></div>
      <div><h3>Information</h3><Link href="/privacy">Privacy policy</Link><Link href="/cookies">Cookie policy</Link><Link href="/terms">Terms & conditions</Link><Link href="/accessibility">Accessibility</Link></div>
      <div className="footer-contact-column"><h3>Get in touch</h3>{church.email&&<a href={'mailto:'+church.email}>{church.email}</a>}{church.phone&&<a href={'tel:'+church.phone}>{church.phone}</a>}<p>{church.location||'Visit our services page for the latest gathering details.'}</p><Link href="/contact" className="footer-contact">Send us a message <Icon name="arrow-up" size={16}/></Link></div>
    </div>
    <div className="container footer-bottom"><p>© {new Date().getFullYear()} {church.name}. All rights reserved.</p><nav aria-label="Legal information"><Link href="/privacy">Privacy</Link><Link href="/cookies">Cookies</Link><Link href="/terms">Terms</Link><Link href="/accessibility">Accessibility</Link></nav><a href="#top" className="back-top" aria-label="Back to top"><Icon name="arrow-up" size={18}/></a></div>
  </footer>;
}
