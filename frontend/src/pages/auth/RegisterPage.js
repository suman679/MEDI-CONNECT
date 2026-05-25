import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [role, setRole]       = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '', gender: '', specialization: '', licenseNumber: '', experience: '' });

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setError(''); setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role, phone: form.phone, gender: form.gender };
      const user = await register(payload);
      const routes = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' };
      navigate(routes[user.role]);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', border: '1.5px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text)', background: 'var(--cream)', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 520, background: '#fff', borderRadius: 20, border: '1px solid var(--border)', padding: '40px 48px', boxShadow: '0 8px 32px rgba(14,35,64,.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 300, color: 'var(--navy)', marginBottom: 4 }}>Create Account</div>
          <div style={{ fontSize: 13.5, color: 'var(--text-mid)' }}>Join MediConnect today</div>
        </div>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 8, padding: 4, marginBottom: 24 }}>
          {['patient', 'doctor'].map(r => (
            <button key={r} type="button" onClick={() => setRole(r)} style={{
              padding: '8px', textAlign: 'center', borderRadius: 6, border: 'none',
              background: role === r ? '#fff' : 'none', fontSize: 13, fontWeight: role === r ? 500 : 400,
              color: role === r ? 'var(--navy)' : 'var(--text-mid)', cursor: 'pointer',
              boxShadow: role === r ? '0 1px 4px rgba(0,0,0,.08)' : 'none', transition: 'all .15s', textTransform: 'capitalize',
            }}>{r}</button>
          ))}
        </div>

        {error && <div style={{ background: 'var(--red-light)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 16 }}>{error}</div>}

        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--slate)', marginBottom: 5 }}>Full Name</label>
              <input style={inputStyle} name="name" value={form.name} onChange={handle} required placeholder="Arjun Kapoor"
                onFocus={e => e.target.style.borderColor = 'var(--teal)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}/>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--slate)', marginBottom: 5 }}>Phone</label>
              <input style={inputStyle} name="phone" value={form.phone} onChange={handle} placeholder="+91-9876543210"
                onFocus={e => e.target.style.borderColor = 'var(--teal)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}/>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--slate)', marginBottom: 5 }}>Email Address</label>
            <input style={inputStyle} name="email" type="email" value={form.email} onChange={handle} required placeholder="you@example.com"
              onFocus={e => e.target.style.borderColor = 'var(--teal)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--slate)', marginBottom: 5 }}>Password</label>
              <input style={inputStyle} name="password" type="password" value={form.password} onChange={handle} required placeholder="Min 6 characters"
                onFocus={e => e.target.style.borderColor = 'var(--teal)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}/>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--slate)', marginBottom: 5 }}>Confirm Password</label>
              <input style={inputStyle} name="confirm" type="password" value={form.confirm} onChange={handle} required placeholder="Repeat password"
                onFocus={e => e.target.style.borderColor = 'var(--teal)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}/>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--slate)', marginBottom: 5 }}>Gender</label>
            <select style={{ ...inputStyle, appearance: 'none' }} name="gender" value={form.gender} onChange={handle}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          {role === 'doctor' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--slate)', marginBottom: 5 }}>Specialization</label>
              <select style={{ ...inputStyle, appearance: 'none' }} name="specialization" value={form.specialization} onChange={handle}>
                <option value="">Select specialization</option>
                {['General Physician','Cardiologist','Dermatologist','Neurologist','Orthopedic','Pediatrician','Psychiatrist','Gynecologist'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '11px', borderRadius: 8, border: 'none',
            background: 'var(--teal)', color: '#fff', fontFamily: 'DM Sans, sans-serif',
            fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8,
          }}>
            {loading ? 'Creating account…' : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text-mid)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--teal)', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
