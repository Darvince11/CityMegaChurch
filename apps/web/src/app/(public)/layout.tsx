import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { PortalMobileControl } from '@/components/portal-mobile-control';
export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return <div id="top" className="site-shell"><SiteHeader /><PortalMobileControl /><main id="main-content">{children}</main><SiteFooter /></div>;
}

