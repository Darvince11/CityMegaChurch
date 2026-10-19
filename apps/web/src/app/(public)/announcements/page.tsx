'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, type Announcement } from '@/lib/api';
import { PageIntro } from '@/components/page-intro';
import { Icon } from '@/components/icon';
import { Pagination } from '@/components/pagination';

const PAGE_SIZE = 5;
export default function AnnouncementsPage(): React.JSX.Element {
  const [items, setItems] = useState<Announcement[]>([]); const [page, setPage] = useState(1);
  useEffect(() => { api.announcements().then(setItems).catch(() => setItems([])); }, []);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE)); const visible = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const changePage = (value: number) => { setPage(value); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return <><PageIntro label="NEWS & UPDATES" title="What’s happening" accent="at City Mega Church.">Stories, invitations, and important updates from our church family.</PageIntro><section className="section"><div className="container content-list">{visible.length ? visible.map(item => <article className="content-card" key={item.id}><p className="eyebrow">{item.kind} · {new Date(item.publishedAt).toLocaleDateString()}</p><h2>{item.title}</h2><p className="content-preview">{item.body}</p><Link className="text-link" href={`/announcements/${item.id}`}>Read more <Icon name="arrow-up" /></Link></article>) : <p>There are no announcements to share yet. Please check back soon.</p>}<Pagination page={page} totalPages={totalPages} onChange={changePage}/></div></section></>;
}
