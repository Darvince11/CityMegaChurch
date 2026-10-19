'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { Icon } from '@/components/icon';

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); const [submitting, setSubmitting] = useState(false);
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (submitting) return; setError(null); setSubmitting(true);
    try {
      const result = await api.login({ email, password });
      const isAdmin = result.user.permissions.includes('*') || result.user.permissions.includes('reports.read_all');
      router.replace(isAdmin ? '/admin' : '/account'); router.refresh();
    } catch (err) { setError(err instanceof ApiClientError ? err.message : 'Something went wrong.'); setSubmitting(false); }
  }
  return <><p className="eyebrow">MEMBER LOGIN</p><h1>Welcome<br/>back.</h1><p>Sign in to continue your journey with City Mega Church.</p>{error&&<div className="alert" role="alert">{error}</div>}<form onSubmit={onSubmit} aria-busy={submitting}><fieldset disabled={submitting}><div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={event=>setEmail(event.target.value)} placeholder="you@example.com"/></div><div className="field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" maxLength={128} required value={password} onChange={event=>setPassword(event.target.value)} placeholder="Your password"/></div><button type="submit" className="btn btn--primary">{submitting?'Signing in…':'Sign in'} <Icon name="arrow-up"/></button></fieldset></form><p className="auth-switch">New to City Mega Church? <Link href="/register">Create your account</Link></p></>;
}
