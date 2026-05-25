import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI, appointmentAPI } from '../../utils/api';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const statusColors = { confirmed:'#1A7A45', pending:'#9B6800', completed:'#0D7F6E', cancelled:'#D94040', 'in-progress':'#0D7F6E' };
const statusBg     = { confirmed:'#E8F7EE', pending:'#FEF3DC',  completed:'#E6F5F2',  cancelled:'#FDEAEA', 'in-progress':'#E6F5F2' };

export default function DoctorDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [stats, setStats]               = useState(null);
  const [todayAppts, setTodayAppts]     = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([
      doctorAPI.getStats(),
      appointmentAPI.getAll({ upcoming: true, limit: 6 }),
    ]).then(([sRes, aRes]) => {
      setStats(sRes.data.data);
      setTodayAppts(aRes.data.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const confirmAppt = async (id) => {
    await appointmentAPI.updateStatus(id, { status:'confirmed' });
    setTodayAppts(prev => prev.map(a => a._id===id ? {...a, status:'confirmed'} : a));
  };

  if (loading) return <div style={{ textAlign:'center', padding:60, color:'var(--text-mid)' }}>Loading…</div>;

  const firstName = user?.name?.split(' ').slice(0,2).join(' ') || 'Doctor';

  const STATS_CONFIG = [
    { label:"Today's Patients", value: stats?.todayAppointments||0, sub:'Scheduled today', color:'teal' },
    { label:'Total Consultations', value: stats?.totalAppointments||0, sub:'All time', color:'green' },
    { label:'Average Rating', value: stats?.rating ? `${stats.rating}★` : 'N/A', sub:`${stats?.totalReviews||0} reviews`, color:'amber' },
    { label:'Pending Approvals', value: stats?.pendingAppointments||0, sub:'Need confirmation', color:'red' },
  ];

  return (
    <div style={{ animation:'fadeIn .25s ease' }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'Fraunces,serif', fontSize:28, fontWeight:300, color:'var(--navy)', marginBottom:4 }}>Welcome, {firstName} 👩‍⚕️</h1>
        <p style={{ fontSize:14, color:'var(--text-mid)' }}>{format(new Date(), 'EEEE, MMMM d')} — {todayAppts.length} upcoming appointments</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {STATS_CONFIG.map(s => (
          <div key={s.label} style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px' }}>
            <div style={{ fontFamily:'Fraunces,serif', fontSize:28, fontWeight:300, color:'var(--navy)', lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-mid)', marginTop:4 }}>{s.label}</div>
            <div style={{ fontSize:11, color:`var(--${s.color})`, marginTop:6, fontWeight:500 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:20 }}>
        {/* Today's Schedule */}
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:20, padding:'20px 24px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <h2 style={{ fontFamily:'Fraunces,serif', fontSize:18, fontWeight:300, color:'var(--navy)' }}>Upcoming Schedule</h2>
            <button onClick={() => navigate('/doctor/appointments')} style={{ fontSize:13, color:'var(--teal)', border:'none', background:'none', cursor:'pointer', fontWeight:500 }}>View all</button>
          </div>
          {todayAppts.length === 0 ? (
            <div style={{ textAlign:'center', padding:'24px 0', color:'var(--text-light)', fontSize:14 }}>No upcoming appointments</div>
          ) : todayAppts.map((a, i) => (
            <div key={a._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom: i < todayAppts.length-1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ textAlign:'center', minWidth:44 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--navy)' }}>{a.timeSlot?.start}</div>
                <div style={{ fontSize:10, color:'var(--text-light)' }}>{format(new Date(a.date),'MMM d')}</div>
              </div>
              <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:'var(--navy)', flexShrink:0 }}>
                {a.patient?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)||'PT'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--navy)' }}>{a.patient?.name}</div>
                <div style={{ fontSize:11, color:'var(--text-mid)', marginTop:1 }}>{a.symptoms?.slice(0,40)||'No symptoms listed'}{a.symptoms?.length>40?'…':''}</div>
              </div>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <span style={{ padding:'3px 8px', borderRadius:20, fontSize:11, fontWeight:500, background:statusBg[a.status], color:statusColors[a.status] }}>{a.status}</span>
                {a.status==='pending' && (
                  <button onClick={() => confirmAppt(a._id)} style={{ padding:'4px 10px', background:'var(--teal)', color:'#fff', border:'none', borderRadius:6, fontSize:11, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
                    Confirm
                  </button>
                )}
                {a.status==='confirmed' && (
                  <button onClick={() => navigate(`/doctor/video/${a.roomId||'room-demo'}`)} style={{ padding:'4px 10px', background:'var(--green)', color:'#fff', border:'none', borderRadius:6, fontSize:11, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
                    Start
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Quick actions */}
          <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:20, padding:'20px 24px' }}>
            <h2 style={{ fontFamily:'Fraunces,serif', fontSize:16, fontWeight:300, color:'var(--navy)', marginBottom:14 }}>Quick Actions</h2>
            {[
              { label:'Write Prescription', desc:'For a completed consult', path:'/doctor/appointments', color:'teal' },
              { label:'View My Patients', desc:`${stats?.completedConsultations||0} total patients`, path:'/doctor/patients', color:'green' },
              { label:'Update Profile', desc:'Fees, availability, bio', path:'/doctor/profile', color:'amber' },
              { label:'Start Video Call', desc:'Open consultation room', path:'/doctor/video/room-demo', color:'red' },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.path)} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', background:`var(--${a.color}-light)`, border:'none', borderRadius:10, cursor:'pointer', marginBottom:8, textAlign:'left', fontFamily:'DM Sans,sans-serif', transition:'opacity .15s' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--navy)' }}>{a.label}</div>
                  <div style={{ fontSize:11.5, color:'var(--text-mid)', marginTop:1 }}>{a.desc}</div>
                </div>
                <svg width="14" height="14" fill="none" stroke="var(--text-light)" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            ))}
          </div>

          {/* Availability toggle */}
          <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:20, padding:'20px 24px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <h2 style={{ fontFamily:'Fraunces,serif', fontSize:16, fontWeight:300, color:'var(--navy)' }}>Availability</h2>
              <span style={{ fontSize:12, padding:'3px 10px', borderRadius:20, background:'var(--green-light)', color:'var(--green)', fontWeight:500 }}>Online</span>
            </div>
            <div style={{ fontSize:13, color:'var(--text-mid)', marginBottom:14, lineHeight:1.5 }}>
              You are currently visible to patients and can receive new bookings.
            </div>
            <button onClick={() => navigate('/doctor/profile')} style={{ width:'100%', padding:'9px', border:'1.5px solid var(--border)', borderRadius:8, background:'var(--cream)', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'DM Sans,sans-serif', color:'var(--navy)' }}>
              Manage Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
