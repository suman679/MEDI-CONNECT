// pages/patient/MedicalRecords.js
import React, { useEffect, useState } from 'react';
import { recordAPI } from '../../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const TYPE_COLORS = { 'lab-report':['#FEF3DC','#9B6800'], imaging:['#E6F5F2','#0D7F6E'], prescription:['#E8F7EE','#1A7A45'], vaccination:['#EDE9FE','#5B21B6'], 'chronic-condition':['#FDEAEA','#D94040'], other:['#F1EFE8','#5F5E5A'] };

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [filter, setFilter]   = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recordAPI.getAll(filter !== 'all' ? { type: filter } : {})
      .then(r => setRecords(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await recordAPI.delete(id);
      setRecords(r => r.filter(x => x._id !== id));
      toast.success('Record deleted');
    } catch { toast.error('Could not delete record'); }
  };

  return (
    <div>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'Fraunces,serif',fontSize:28,fontWeight:300,color:'var(--navy)',marginBottom:4 }}>Medical Records</h1>
          <p style={{ fontSize:14,color:'var(--text-mid)' }}>Your complete health history</p>
        </div>
        <button style={{ padding:'9px 18px',background:'var(--teal)',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:'DM Sans,sans-serif' }}>
          + Upload Record
        </button>
      </div>

      <div style={{ display:'flex',gap:8,marginBottom:20,flexWrap:'wrap' }}>
        {['all','lab-report','imaging','prescription','vaccination'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding:'6px 14px',border:`1.5px solid ${filter===f?'var(--teal)':'var(--border)'}`,borderRadius:20,fontSize:12.5,fontFamily:'DM Sans,sans-serif',cursor:'pointer',background:filter===f?'var(--teal-light)':'#fff',color:filter===f?'var(--teal)':'var(--text-mid)',transition:'all .15s' }}>
            {f==='all'?'All Records':f.replace('-',' ').replace(/\b\w/g,l=>l.toUpperCase())}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign:'center',padding:60,color:'var(--text-mid)' }}>Loading…</div> : (
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          {records.length === 0 ? <div style={{ textAlign:'center',padding:48,color:'var(--text-mid)',background:'#fff',border:'1px solid var(--border)',borderRadius:16 }}>No records found</div>
          : records.map(r => {
            const [bg,fg] = TYPE_COLORS[r.type] || TYPE_COLORS.other;
            return (
              <div key={r._id} style={{ display:'flex',alignItems:'center',gap:14,padding:16,border:'1px solid var(--border)',borderRadius:12,background:'#fff',transition:'all .15s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--teal-mid)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
              >
                <div style={{ width:44,height:44,borderRadius:10,background:bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <svg width="20" height="20" fill="none" stroke={fg} strokeWidth="1.8"><path d="M10 2H6a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><polyline points="10 2 10 8 16 8"/></svg>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13.5,fontWeight:500,color:'var(--navy)' }}>{r.title}</div>
                  <div style={{ fontSize:12,color:'var(--text-mid)',marginTop:2 }}>
                    {r.doctor?.user?.name && `${r.doctor.user.name} · `}{format(new Date(r.date),'MMM d, yyyy')}
                  </div>
                </div>
                <span style={{ padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:500,background:bg,color:fg }}>
                  {r.type.replace('-',' ')}
                </span>
                <div style={{ display:'flex',gap:6 }}>
                  <button style={{ width:34,height:34,border:'1px solid var(--border)',borderRadius:8,background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--slate)' }}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                  <button onClick={() => handleDelete(r._id)} style={{ width:34,height:34,border:'1px solid var(--border)',borderRadius:8,background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--red)' }}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
