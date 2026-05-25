import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DEMO_CREDENTIALS = [
  { role: 'Patient',  email: 'arjun@example.com',        password: 'Patient@123' },
  { role: 'Doctor',   email: 'dr.priya@mediconnect.com',  password: 'Doctor@123' },
  { role: 'Admin',    email: 'admin@mediconnect.com',     password: 'Admin@123' },
];

export default function LoginPage() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const routes = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' };
      navigate(routes[user.role] || '/patient/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const fillDemo = (creds) => setForm({ email: creds.email, password: creds.password });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--navy)', alignItems: 'stretch' }}>
      {/* Left panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'var(--teal)', opacity: .05 }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </div>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 300, color: '#fff' }}>Medi<span style={{ color: '#4BBFAA' }}>Connect</span></span>
        </div>

        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 46, fontWeight: 300, color: '#fff', lineHeight: 1.15, marginBottom: 20 }}>
          Healthcare at<br/>your <em style={{ color: '#4BBFAA', fontStyle: 'italic' }}>fingertips</em>
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,.5)', maxWidth: 340, lineHeight: 1.7, marginBottom: 40 }}>
          Connect with certified doctors, book video consultations, and manage your complete health journey.
        </p>

        {['Video consultations with verified doctors', 'Secure medical records & prescriptions', 'Real-time appointment scheduling', '24/7 health support dashboard'].map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,.65)', fontSize: 14, marginBottom: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4BBFAA', flexShrink: 0 }}/>
            {f}
          </div>
        ))}

        {/* Demo credentials */}
        <div style={{ marginTop: 40, background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: '16px 20px', border: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 10 }}>Demo credentials</div>
          {DEMO_CREDENTIALS.map(c => (
            <button key={c.role} onClick={() => fillDemo(c)} style={{
              display: 'flex', justifyContent: 'space-between', width: '100%', background: 'none',
              border: 'none', color: 'rgba(255,255,255,.6)', cursor: 'pointer', padding: '6px 0',
              fontSize: 13, textAlign: 'left', transition: 'color .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#4BBFAA'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.6)'}
            >
              <span style={{ fontWeight: 500, color: 'rgba(255,255,255,.8)' }}>{c.role}</span>
              <span>{c.email}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div style={{ width: 440, background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 300, color: 'var(--navy)', marginBottom: 6 }}>Welcome back</h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-mid)', marginBottom: 32 }}>Sign in to your MediConnect account</p>

        {error && (
          <div style={{ background: 'var(--red-light)', border: '1px solid #f5c4c4', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--slate)', marginBottom: 6 }}>Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handle} required placeholder="you@example.com"
              style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text)', background: 'var(--cream)', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--teal)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--slate)', marginBottom: 6 }}>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} required placeholder="••••••••"
              style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text)', background: 'var(--cream)', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--teal)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '11px', borderRadius: 8, border: 'none',
            background: loading ? 'var(--teal-mid)' : 'var(--teal)', color: '#fff',
            fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .15s',
          }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-mid)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--teal)', fontWeight: 500, textDecoration: 'none' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
