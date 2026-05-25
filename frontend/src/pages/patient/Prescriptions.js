import React, { useEffect, useState } from 'react';
import { prescriptionAPI } from '../../utils/api';
import { format } from 'date-fns';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    prescriptionAPI.getAll()
      .then(r => setPrescriptions(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign:'center',padding:60,color:'var(--text-mid)' }}>Loading prescriptions…</div>;

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Fraunces,serif',fontSize:28,fontWeight:300,color:'var(--navy)',marginBottom:4 }}>Prescriptions</h1>
        <p style={{ fontSize:14,color:'var(--text-mid)' }}>Your medication history</p>
      </div>

      {prescriptions.length === 0 ? (
        <div style={{ textAlign:'center',padding:60,background:'#fff',border:'1px solid var(--border)',borderRadius:20,color:'var(--text-mid)' }}>No prescriptions found</div>
      ) : (
        <div style={{ display:'grid',gridTemplateColumns:selected?'1fr 1.4fr':'1fr',gap:20 }}>
          {/* List */}
          <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
            {prescriptions.map(rx => (
              <div key={rx._id}
                onClick={() => setSelected(rx)}
                style={{ background:'#fff',border:`1.5px solid ${selected?._id===rx._id?'var(--teal)':'var(--border)'}`,borderRadius:16,padding:18,cursor:'pointer',transition:'all .15s' }}
                onMouseEnter={e => { if(selected?._id!==rx._id) e.currentTarget.style.borderColor='var(--teal-mid)'; }}
                onMouseLeave={e => { if(selected?._id!==rx._id) e.currentTarget.style.borderColor='var(--border)'; }}
              >
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:14,fontWeight:500,color:'var(--navy)' }}>{rx.prescriptionId}</div>
                    <div style={{ fontSize:12,color:'var(--text-mid)',marginTop:2 }}>{rx.diagnosis}</div>
                  </div>
                  <span style={{ padding:'3px 8px',borderRadius:20,fontSize:11,fontWeight:500,background:rx.isActive?'var(--green-light)':'var(--cream)',color:rx.isActive?'var(--green)':'var(--text-mid)',flexShrink:0 }}>
                    {rx.isActive?'Active':'Expired'}
                  </span>
                </div>
                <div style={{ fontSize:12,color:'var(--text-mid)' }}>
                  {rx.doctor?.user?.name} · {rx.doctor?.specialization}
                </div>
                <div style={{ fontSize:11,color:'var(--text-light)',marginTop:4 }}>
                  {rx.createdAt && format(new Date(rx.createdAt),'MMM d, yyyy')} · {rx.medicines?.length} medicine{rx.medicines?.length!==1?'s':''}
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div style={{ background:'#fff',border:'2px solid var(--teal-mid)',borderRadius:20,padding:28,position:'relative',overflow:'hidden' }}>
              <div style={{ position:'absolute',bottom:-20,right:20,fontSize:120,color:'var(--teal-light)',fontWeight:700,lineHeight:1,pointerEvents:'none',userSelect:'none' }}>℞</div>
              <button onClick={() => setSelected(null)} style={{ position:'absolute',top:16,right:16,background:'none',border:'none',cursor:'pointer',fontSize:20,color:'var(--text-mid)',lineHeight:1 }}>×</button>

              {/* Header */}
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,paddingBottom:16,borderBottom:'1.5px dashed var(--border)' }}>
                <div>
                  <div style={{ fontSize:15,fontWeight:600,color:'var(--navy)' }}>{selected.doctor?.user?.name}</div>
                  <div style={{ fontSize:12,color:'var(--text-mid)',marginTop:2 }}>{selected.doctor?.specialization}</div>
                  <div style={{ fontSize:11,color:'var(--teal)',marginTop:3 }}>License: {selected.doctor?.licenseNumber||'N/A'}</div>
                </div>
                <div style={{ textAlign:'right',fontSize:12,color:'var(--text-mid)' }}>
                  <div style={{ fontWeight:500,color:'var(--navy)' }}>{selected.prescriptionId}</div>
                  <div>{selected.createdAt && format(new Date(selected.createdAt),'MMMM d, yyyy')}</div>
                  {selected.followUpDate && <div style={{ color:'var(--teal)',marginTop:4 }}>Follow-up: {format(new Date(selected.followUpDate),'MMM d, yyyy')}</div>}
                </div>
              </div>

              {/* Patient */}
              <div style={{ background:'var(--cream)',borderRadius:10,padding:'10px 14px',marginBottom:16 }}>
                <div style={{ fontSize:14,fontWeight:500,color:'var(--navy)' }}>{selected.patient?.name}</div>
                <div style={{ fontSize:12,color:'var(--text-mid)',marginTop:2 }}>Diagnosis: <strong>{selected.diagnosis}</strong></div>
              </div>

              {/* Medicines */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12,fontWeight:600,color:'var(--text-mid)',textTransform:'uppercase',letterSpacing:'.6px',marginBottom:8 }}>Medicines</div>
                <table style={{ width:'100%',borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'var(--cream)' }}>
                      {['Medicine','Dosage','Frequency','Duration'].map(h => (
                        <th key={h} style={{ fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px',color:'var(--text-light)',textAlign:'left',padding:'6px 10px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.medicines?.map((m,i) => (
                      <tr key={i}>
                        <td style={{ padding:'10px',borderBottom:'1px solid var(--border)',fontSize:13,fontWeight:500,color:'var(--navy)' }}>{m.name}</td>
                        <td style={{ padding:'10px',borderBottom:'1px solid var(--border)',fontSize:13,color:'var(--text-mid)' }}>{m.dosage}</td>
                        <td style={{ padding:'10px',borderBottom:'1px solid var(--border)',fontSize:13,color:'var(--text-mid)' }}>{m.frequency}</td>
                        <td style={{ padding:'10px',borderBottom:'1px solid var(--border)',fontSize:13,color:'var(--text-mid)' }}>{m.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Lab tests */}
              {selected.labTests?.length > 0 && (
                <div style={{ background:'var(--amber-light)',borderRadius:10,padding:'10px 14px',marginBottom:16,fontSize:12,color:'#7A5200' }}>
                  <strong>Lab Tests:</strong> {selected.labTests.join(', ')}
                </div>
              )}

              {/* Notes */}
              {selected.notes && (
                <div style={{ background:'var(--cream)',borderRadius:10,padding:'10px 14px',fontSize:12,color:'var(--text-mid)',lineHeight:1.6 }}>
                  <strong style={{ color:'var(--navy)' }}>Doctor's Notes:</strong> {selected.notes}
                </div>
              )}

              <button style={{ marginTop:16,width:'100%',padding:'9px',border:'1.5px solid var(--teal)',borderRadius:8,background:'none',color:'var(--teal)',fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download PDF
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
