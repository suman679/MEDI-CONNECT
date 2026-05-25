// pages/doctor/Appointments.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const statusColors = { confirmed:'#1A7A45', pending:'#9B6800', completed:'#0D7F6E', cancelled:'#D94040', 'in-progress':'#0D7F6E' };
const statusBg     = { confirmed:'#E8F7EE', pending:'#FEF3DC',  completed:'#E6F5F2',  cancelled:'#FDEAEA', 'in-progress':'#E6F5F2' };

export function DoctorAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  const fetch = () => {
    setLoading(true);
    const params = tab==='upcoming' ? { upcoming:true } : tab==='completed' ? { status:'completed' } : {};
    appointmentAPI.getAll(params)
      .then(r => setAppointments(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [tab]);

  const updateStatus = async (id, status) => {
    try {
      await appointmentAPI.updateStatus(id, { status });
      toast.success(`Appointment ${status}`);
      fetch();
    } catch { toast.error('Action failed'); }
  };

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Fraunces,serif', fontSize:28, fontWeight:300, color:'var(--navy)', marginBottom:4 }}>Appointments</h1>
        <p style={{ fontSize:14, color:'var(--text-mid)' }}>Manage your patient consultations</p>
      </div>
      <div style={{ display:'flex', gap:4, background:'#fff', border:'1px solid var(--border)', borderRadius:8, padding:4, marginBottom:20, width:'fit-content' }}>
        {['upcoming','completed','all'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:'7px 18px', borderRadius:6, border:'none', background:tab===t?'var(--teal)':'none', color:tab===t?'#fff':'var(--text-mid)', fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:tab===t?500:400, cursor:'pointer', textTransform:'capitalize', transition:'all .15s' }}>{t}</button>
        ))}
      </div>
      {loading ? <div style={{ textAlign:'center', padding:60, color:'var(--text-mid)' }}>Loading…</div> : (
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:20 }}>
          {appointments.length === 0 ? (
            <div style={{ textAlign:'center', padding:48, color:'var(--text-mid)' }}>No appointments found</div>
          ) : appointments.map((a, i) => (
            <div key={a._id} style={{ display:'flex', alignItems:'center', gap:16, padding:'18px 24px', borderBottom:i<appointments.length-1?'1px solid var(--border)':'none' }}>
              <div style={{ textAlign:'center', minWidth:60, background:'var(--cream)', borderRadius:8, padding:'10px 8px' }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--navy)' }}>{a.timeSlot?.start}</div>
                <div style={{ fontSize:11, color:'var(--text-light)' }}>{format(new Date(a.date),'MMM d')}</div>
              </div>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:'var(--navy)', flexShrink:0 }}>
                {a.patient?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)||'PT'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:500, color:'var(--navy)' }}>{a.patient?.name}</div>
                <div style={{ fontSize:12, color:'var(--text-mid)', marginTop:2 }}>{a.symptoms?.slice(0,60)||'No symptoms noted'} · {a.appointmentId}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:500, background:statusBg[a.status], color:statusColors[a.status] }}>{a.status}</span>
                {a.status==='pending' && (
                  <button onClick={() => updateStatus(a._id,'confirmed')} style={{ padding:'6px 12px', background:'var(--teal)', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Confirm</button>
                )}
                {a.status==='confirmed' && (
                  <button onClick={() => navigate(`/doctor/video/${a.roomId||'room-demo'}`)} style={{ padding:'6px 12px', background:'var(--green)', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Start Call</button>
                )}
                {a.status==='in-progress' && (
                  <button onClick={() => navigate(`/doctor/prescribe/${a._id}`)} style={{ padding:'6px 12px', background:'var(--amber)', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>Prescribe</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorAppointments;
