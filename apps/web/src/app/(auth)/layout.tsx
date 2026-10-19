import { Brand } from '@/components/brand';
import { SiteHeader } from '@/components/site-header';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return <div className="auth-site-shell"><SiteHeader /><div className="auth-shell"><aside className="auth-aside"><div><Brand light /><h1>Faith begins<br />with a <em>welcome.</em></h1><p>Join a community where you can grow, belong, and discover purpose one step at a time.</p></div><div className="auth-aside-foot">CITY MEGA CHURCH · FAITH. FAMILY. PURPOSE.</div></aside><main className="auth-panel" id="main-content"><div className="auth-card">{children}</div></main></div></div>;
}
