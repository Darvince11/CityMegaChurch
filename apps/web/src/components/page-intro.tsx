export function PageIntro({ label, title, accent, children }: { label: string; title: string; accent: string; children: React.ReactNode }): React.JSX.Element {
  return <section className="page-intro"><div className="container"><p className="eyebrow"><span className="eyebrow-line" />{label}</p><h1>{title}<br /><em>{accent}</em></h1><p className="page-intro-copy">{children}</p><span className="intro-symbol" aria-hidden="true">✦</span></div></section>;
}

