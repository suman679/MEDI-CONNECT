import React, { useEffect, useState } from 'react';
import { appointmentAPI } from '../../utils/api';
import { format } from 'date-fns';

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    appointmentAPI.getAll({ status:'completed', limit:50 })
      .then(r => {
        // Deduplicate by patient ID
        const seen = new Set();
        const unique = r.data.data.filter(a => {
          const pid = a.patient?._id;
          if (!pid || seen.has(pid)) return false;
          seen.add(pid);
          return true;
        });
        setPatients(unique);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(a =>
    !search || a.patient?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ textAlign:'center', padding:60, color:'var(--text-mid)' }}>Loading…</div>;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'Fraunces,serif', fontSize:28, fontWeight:300, color:'var(--navy)', marginBottom:4 }}>My Patients</h1>
          <p style={{ fontSize:14, color:'var(--text-mid)' }}>{patients.length} unique patients</p>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1.5px solid var(--border)', borderRadius:8, padding:'8px 14px', marginBottom:20 }}>
        <svg width="16" height="16" fill="none" stroke="var(--text-light)" strokeWidth="2"><circle cx="7" cy="7" r="6"/><path d="m13 13-3-3"/></svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients…"
          style={{ border:'none', outline:'none', fontFamily:'DM Sans,sans-serif', fontSize:14, flex:1, background:'none', color:'var(--text)' }}/>
      </div>

      <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:20, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'var(--cream)' }}>
              {['Patient','Last Consultation','Condition','Actions'].map(h => (
                <th key={h} style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.6px', color:'var(--text-light)', textAlign:'left', padding:'10px 20px', borderBottom:'1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign:'center', padding:48, color:'var(--text-mid)' }}>No patients found</td></tr>
            ) : filtered.map(a => (
              <tr key={a._id} style={{ borderBottom:'1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background='var(--cream)'}
                onMouseLeave={e => e.currentTarget.style.background='#fff'}
              >
                <td style={{ padding:'14px 20px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--teal-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:'var(--teal-dark)', flexShrink:0 }}>
                      {a.patient?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)||'PT'}
                    </div>
                    <div>
                      <div style={{ fontSize:13.5, fontWeight:500, color:'var(--navy)' }}>{a.patient?.name}</div>
                      <div style={{ fontSize:11, color:'var(--text-light)' }}>{a.patient?.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding:'14px 20px', fontSize:13, color:'var(--text-mid)' }}>
                  {format(new Date(a.date), 'MMM d, yyyy')}
                </td>
                <td style={{ padding:'14px 20px' }}>
                  <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:500, background:'var(--teal-light)', color:'var(--teal-dark)' }}>
                    {a.symptoms?.slice(0,30)||'General consultation'}{a.symptoms?.length>30?'…':''}
                  </span>
                </td>
                <td style={{ padding:'14px 20px' }}>
                  <div style={{ display:'flex', gap:6 }}>
                    <button style={{ padding:'5px 12px', background:'var(--cream)', border:'1px solid var(--border)', borderRadius:6, fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif', color:'var(--navy)' }}>View</button>
                    <button style={{ padding:'5px 12px', background:'var(--teal-light)', border:'none', borderRadius:6, fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif', color:'var(--teal-dark)' }}>Prescribe</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
