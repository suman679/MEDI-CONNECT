// pages/admin/Dashboard.js
import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(r => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign:'center', padding:60, color:'var(--text-mid)' }}>Loading…</div>;

  const STAT_CARDS = [
    { label:'Total Patients',     value: stats?.totalPatients?.toLocaleString()||0,    sub:'Registered users', color:'teal' },
    { label:'Active Doctors',     value: stats?.totalDoctors||0,    sub:`${stats?.pendingDoctors||0} pending approval`, color:'green' },
    { label:"Today's Appts",      value: stats?.todayAppts||0,       sub:`${stats?.completedToday||0} completed`, color:'amber' },
    { label:'Total Appointments', value: stats?.totalAppointments?.toLocaleString()||0, sub:'All time', color:'red' },
  ];

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'Fraunces,serif', fontSize:28, fontWeight:300, color:'var(--navy)', marginBottom:4 }}>Admin Dashboard</h1>
        <p style={{ fontSize:14, color:'var(--text-mid)' }}>Platform overview</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px' }}>
            <div style={{ fontFamily:'Fraunces,serif', fontSize:28, fontWeight:300, color:'var(--navy)', lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-mid)', marginTop:4 }}>{s.label}</div>
            <div style={{ fontSize:11, color:`var(--${s.color})`, marginTop:6, fontWeight:500 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {stats?.pendingDoctors > 0 && (
        <div style={{ background:'var(--amber-light)', border:'1px solid #f0d48a', borderRadius:16, padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:20 }}>⚠️</span>
          <div>
            <div style={{ fontSize:14, fontWeight:500, color:'#7A5200' }}>{stats.pendingDoctors} doctor application{stats.pendingDoctors!==1?'s':''} awaiting review</div>
            <div style={{ fontSize:12, color:'#9B6800', marginTop:2 }}>Review and approve doctor registrations to expand your platform.</div>
          </div>
          <a href="/admin/doctors" style={{ marginLeft:'auto', padding:'7px 16px', background:'#E8A020', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', textDecoration:'none', fontFamily:'DM Sans,sans-serif' }}>
            Review Now
          </a>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:20, padding:24 }}>
          <h2 style={{ fontFamily:'Fraunces,serif', fontSize:18, fontWeight:300, color:'var(--navy)', marginBottom:16 }}>Platform Health</h2>
          {[
            { label:'Appointment completion rate', value:'94%', color:'green' },
            { label:'Doctor approval rate',        value:'87%', color:'teal' },
            { label:'Patient satisfaction score',  value:'4.8/5', color:'amber' },
            { label:'Average response time',       value:'2.3 min', color:'teal' },
          ].map(m => (
            <div key={m.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:13, color:'var(--text-mid)' }}>{m.label}</span>
              <span style={{ fontSize:14, fontWeight:600, color:`var(--${m.color})` }}>{m.value}</span>
            </div>
          ))}
        </div>

        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:20, padding:24 }}>
          <h2 style={{ fontFamily:'Fraunces,serif', fontSize:18, fontWeight:300, color:'var(--navy)', marginBottom:16 }}>Quick Links</h2>
          {[
            { label:'Manage Doctors', href:'/admin/doctors', desc:'Approve or reject applications' },
            { label:'Manage Users',   href:'/admin/users',   desc:'View and moderate all users' },
            { label:'All Appointments', href:'#',           desc:'Monitor platform appointments' },
          ].map(l => (
            <a key={l.label} href={l.href} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--border)', textDecoration:'none' }}>
              <div>
                <div style={{ fontSize:13.5, fontWeight:500, color:'var(--navy)' }}>{l.label}</div>
                <div style={{ fontSize:12, color:'var(--text-mid)' }}>{l.desc}</div>
              </div>
              <svg width="14" height="14" fill="none" stroke="var(--text-light)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
