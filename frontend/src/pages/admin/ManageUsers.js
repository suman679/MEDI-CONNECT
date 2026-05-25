import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function ManageUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [search,  setSearch]  = useState('');

  const fetch = () => {
    setLoading(true);
    const params = filter !== 'all' ? { role: filter } : {};
    adminAPI.getUsers(params)
      .then(r => setUsers(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [filter]);

  const toggle = async (id) => {
    try {
      await adminAPI.toggleUser(id);
      toast.success('User status updated');
      fetch();
    } catch(e) { toast.error(e.message || 'Failed'); }
  };

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors = { patient:['var(--teal-light)','var(--teal-dark)'], doctor:['var(--green-light)','var(--green)'], admin:['var(--amber-light)','#9B6800'] };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'Fraunces,serif', fontSize:28, fontWeight:300, color:'var(--navy)', marginBottom:4 }}>Manage Users</h1>
          <p style={{ fontSize:14, color:'var(--text-mid)' }}>{users.length} total users</p>
        </div>
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1.5px solid var(--border)', borderRadius:8, padding:'8px 14px' }}>
          <svg width="16" height="16" fill="none" stroke="var(--text-light)" strokeWidth="2"><circle cx="7" cy="7" r="6"/><path d="m13 13-3-3"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            style={{ border:'none', outline:'none', fontFamily:'DM Sans,sans-serif', fontSize:14, flex:1, background:'none', color:'var(--text)' }}/>
        </div>
        <div style={{ display:'flex', gap:4, background:'#fff', border:'1px solid var(--border)', borderRadius:8, padding:4 }}>
          {['all','patient','doctor','admin'].map(r => (
            <button key={r} onClick={() => setFilter(r)} style={{ padding:'7px 14px', borderRadius:6, border:'none', background:filter===r?'var(--teal)':'none', color:filter===r?'#fff':'var(--text-mid)', fontFamily:'DM Sans,sans-serif', fontSize:13, cursor:'pointer', textTransform:'capitalize', transition:'all .15s' }}>{r}</button>
          ))}
        </div>
      </div>

      {loading ? <div style={{ textAlign:'center', padding:60, color:'var(--text-mid)' }}>Loading…</div> : (
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:20, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--cream)' }}>
                {['User','Email','Role','Phone','Status','Joined','Actions'].map(h => (
                  <th key={h} style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.6px', color:'var(--text-light)', textAlign:'left', padding:'12px 18px', borderBottom:'1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:48, color:'var(--text-mid)' }}>No users found</td></tr>
              ) : filtered.map(u => {
                const [bg, fg] = roleColors[u.role] || roleColors.patient;
                return (
                  <tr key={u._id} onMouseEnter={e=>e.currentTarget.style.background='var(--cream)'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                    <td style={{ padding:'12px 18px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:fg, flexShrink:0 }}>
                          {u.name?.split(' ').map(w=>w[0]).join('').slice(0,2)||'U'}
                        </div>
                        <span style={{ fontSize:13.5, fontWeight:500, color:'var(--navy)' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'12px 18px', fontSize:13, color:'var(--text-mid)' }}>{u.email}</td>
                    <td style={{ padding:'12px 18px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:500, background:bg, color:fg, textTransform:'capitalize' }}>{u.role}</span>
                    </td>
                    <td style={{ padding:'12px 18px', fontSize:13, color:'var(--text-mid)' }}>{u.phone||'—'}</td>
                    <td style={{ padding:'12px 18px' }}>
                      <span style={{ padding:'3px 8px', borderRadius:20, fontSize:11, fontWeight:500, background:u.isActive?'var(--green-light)':'var(--red-light)', color:u.isActive?'var(--green)':'var(--red)' }}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding:'12px 18px', fontSize:12, color:'var(--text-light)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </td>
                    <td style={{ padding:'12px 18px' }}>
                      <button onClick={() => toggle(u._id)} style={{ padding:'5px 12px', background:'var(--cream)', border:'1px solid var(--border)', borderRadius:6, fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif', color:'var(--navy)' }}>
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
