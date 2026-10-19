'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type HomeContent } from '@/lib/api';
import { Icon } from './icon';

export function HomeUpdates(): React.JSX.Element | null {
  const [content, setContent] = useState<HomeContent | null>(null);
  useEffect(() => { api.homeContent().then(setContent).catch(() => setContent(null)); }, []);
  if (!content) return null;
  const announcement = content.announcements[0];
  const update = content.serviceUpdates[0];
  if (!announcement && !update) return null;
  return <section className="home-updates section"><div className="container updates-grid">
    {announcement && <article className="announcement-card"><p className="eyebrow">FROM CITY MEGA CHURCH</p><h2>{announcement.title}</h2><p>{announcement.body}</p><Link href="/account" className="text-link">Visit member space <Icon name="arrow-up" /></Link></article>}
    {update && <article className="service-update-card">{update.imageUrl && <img src={update.imageUrl} alt="Recent City Mega Church service" />}<p className="eyebrow">LAST SUNDAY</p><h2>{update.title}</h2>{update.sermonTitle && <p className="sermon-title">“{update.sermonTitle}”</p>}<p>{update.summary}</p>{update.pastor && <p className="pastor-line">Shared by {update.pastor}</p>}</article>}
  </div></section>;
}
