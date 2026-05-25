// pages/admin/ManageDoctors.js
import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  const fetch = () => {
    adminAPI.getUsers({ role:'doctor' })
      .then(r => setDoctors(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const approve = async (id) => {
    try {
      // Find the doctor profile id from users — in practice you'd call doctor endpoint
      await adminAPI.approveDoctor(id);
      toast.success('Doctor approved');
      fetch();
    } catch(e) { toast.error(e.message || 'Failed'); }
  };

  const reject = async (id) => {
    try {
      await adminAPI.rejectDoctor(id);
      toast.success('Application rejected');
      fetch();
    } catch(e) { toast.error(e.message || 'Failed'); }
  };

  const toggle = async (id) => {
    try {
      await adminAPI.toggleUser(id);
      toast.success('User status updated');
      fetch();
    } catch(e) { toast.error(e.message || 'Failed'); }
  };

  const filtered = filter === 'all' ? doctors : doctors.filter(d => filter === 'active' ? d.isActive : !d.isActive);

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Fraunces,serif', fontSize:28, fontWeight:300, color:'var(--navy)', marginBottom:4 }}>Manage Doctors</h1>
        <p style={{ fontSize:14, color:'var(--text-mid)' }}>{doctors.length} registered doctors</p>
      </div>

      <div style={{ display:'flex', gap:4, background:'#fff', border:'1px solid var(--border)', borderRadius:8, padding:4, marginBottom:20, width:'fit-content' }}>
        {['all','active','inactive'].map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ padding:'7px 18px', borderRadius:6, border:'none', background:filter===t?'var(--teal)':'none', color:filter===t?'#fff':'var(--text-mid)', fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:filter===t?500:400, cursor:'pointer', textTransform:'capitalize', transition:'all .15s' }}>{t}</button>
        ))}
      </div>

      {loading ? <div style={{ textAlign:'center', padding:60, color:'var(--text-mid)' }}>Loading…</div> : (
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:20, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--cream)' }}>
                {['Doctor','Email','Phone','Status','Joined','Actions'].map(h => (
                  <th key={h} style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.6px', color:'var(--text-light)', textAlign:'left', padding:'12px 20px', borderBottom:'1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign:'center', padding:48, color:'var(--text-mid)' }}>No doctors found</td></tr>
              ) : filtered.map(d => (
                <tr key={d._id} onMouseEnter={e=>e.currentTarget.style.background='var(--cream)'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                  <td style={{ padding:'14px 20px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--teal-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:'var(--teal-dark)', flexShrink:0 }}>
                        {d.name?.split(' ').map(w=>w[0]).join('').slice(0,2)||'DR'}
                      </div>
                      <span style={{ fontSize:13.5, fontWeight:500, color:'var(--navy)' }}>{d.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:'14px 20px', fontSize:13, color:'var(--text-mid)' }}>{d.email}</td>
                  <td style={{ padding:'14px 20px', fontSize:13, color:'var(--text-mid)' }}>{d.phone||'—'}</td>
                  <td style={{ padding:'14px 20px' }}>
                    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:500, background:d.isActive?'var(--green-light)':'var(--red-light)', color:d.isActive?'var(--green)':'var(--red)' }}>
                      {d.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding:'14px 20px', fontSize:13, color:'var(--text-mid)' }}>
                    {new Date(d.createdAt).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}
                  </td>
                  <td style={{ padding:'14px 20px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => toggle(d._id)} style={{ padding:'5px 12px', background:'var(--cream)', border:'1px solid var(--border)', borderRadius:6, fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif', color:'var(--navy)' }}>
                        {d.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageDoctors;
