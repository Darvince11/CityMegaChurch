'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { Icon } from '@/components/icon';

export default function RegisterPage(): React.JSX.Element {
  const router = useRouter();
  const [fullName, setFullName] = useState(''); const [email, setEmail] = useState(''); const [phone, setPhone] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); const [submitting, setSubmitting] = useState(false);
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (submitting) return; setError(null); setSubmitting(true);
    try { await api.register({ fullName, email, phone, password }); router.replace('/account'); router.refresh(); }
    catch (err) { setError(err instanceof ApiClientError ? err.message : 'Something went wrong.'); setSubmitting(false); }
  }
  return <><p className="eyebrow">JOIN THE COMMUNITY</p><h1>Start your<br/>next chapter.</h1><p>Create your City Mega Church account in a moment.</p>{error&&<div className="alert" role="alert">{error}</div>}<form onSubmit={onSubmit} aria-busy={submitting}><fieldset disabled={submitting}><div className="field"><label htmlFor="fullName">Full name</label><input id="fullName" autoComplete="name" minLength={2} maxLength={120} required value={fullName} onChange={event=>setFullName(event.target.value)} placeholder="Your name"/></div><div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={event=>setEmail(event.target.value)} placeholder="you@example.com"/></div><div className="field"><label htmlFor="phone">Phone <span>(optional)</span></label><input id="phone" type="tel" autoComplete="tel" pattern="\+?[0-9]{9,15}" maxLength={16} value={phone} onChange={event=>setPhone(event.target.value)} placeholder="+233…"/></div><div className="field"><label htmlFor="password">Create a password</label><input id="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={event=>setPassword(event.target.value)} placeholder="At least 8 characters"/></div><button type="submit" className="btn btn--primary">{submitting?'Creating account…':'Create account'} <Icon name="arrow-up"/></button></fieldset></form><p className="auth-switch">Already part of the community? <Link href="/login">Sign in</Link></p></>;
}
