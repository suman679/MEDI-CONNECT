import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, notificationAPI, doctorAPI } from '../../utils/api';
import { format } from 'date-fns';

const StatCard = ({ icon, label, value, sub, color }) => (
  <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ width: 40, height: 40, borderRadius: 8, background: `var(--${color}-light)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
      {icon}
    </div>
    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 300, color: 'var(--navy)', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 4 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: `var(--${color})`, marginTop: 6, fontWeight: 500 }}>{sub}</div>}
  </div>
);

const statusColors = { confirmed: '#1A7A45', pending: '#9B6800', completed: '#0D7F6E', cancelled: '#D94040' };
const statusBg     = { confirmed: '#E8F7EE', pending: '#FEF3DC',  completed: '#E6F5F2',  cancelled: '#FDEAEA' };

export default function PatientDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors]           = useState([]);
  const [unread, setUnread]             = useState(0);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([
      appointmentAPI.getAll({ upcoming: true, limit: 4 }),
      doctorAPI.getAll({ limit: 3 }),
      notificationAPI.getAll({ unread: true }),
    ]).then(([apptRes, docRes, notifRes]) => {
      setAppointments(apptRes.data.data);
      setDoctors(docRes.data.data);
      setUnread(notifRes.data.unreadCount || 0);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-mid)' }}>Loading dashboard…</div>;

  return (
    <div style={{ animation: 'fadeIn .25s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 300, color: 'var(--navy)', marginBottom: 4 }}>{greeting}, {firstName} 👋</h1>
        <p style={{ fontSize: 14, color: 'var(--text-mid)' }}>Here's your health overview for {format(new Date(), 'EEEE, MMMM d')}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Upcoming Appts" value={appointments.length} sub="Active bookings" color="teal"
          icon={<svg width="20" height="20" fill="none" stroke="var(--teal)" strokeWidth="1.8"><rect x="3" y="4" width="14" height="14" rx="2"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="6" y1="2" x2="6" y2="6"/><line x1="3" y1="9" x2="17" y2="9"/></svg>}
        />
        <StatCard label="Notifications" value={unread} sub={`${unread} unread`} color="amber"
          icon={<svg width="20" height="20" fill="none" stroke="var(--amber)" strokeWidth="1.8"><path d="M15 7A6 6 0 005 7c0 5-2.5 7-2.5 7h15S15 12 15 7"/><path d="M11.3 16a2 2 0 01-3.46 0"/></svg>}
        />
        <StatCard label="Medical Records" value="5" sub="Total files" color="green"
          icon={<svg width="20" height="20" fill="none" stroke="var(--green)" strokeWidth="1.8"><path d="M10 2H6a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><polyline points="10 2 10 8 16 8"/></svg>}
        />
        <StatCard label="Health Score" value="87" sub="↑ 4 pts this month" color="red"
          icon={<svg width="20" height="20" fill="none" stroke="var(--red)" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Upcoming Appointments */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 300, color: 'var(--navy)' }}>Upcoming Appointments</h2>
            <button onClick={() => navigate('/patient/appointments')} style={{ fontSize: 13, color: 'var(--teal)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 500 }}>View all</button>
          </div>
          {appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-light)', fontSize: 14 }}>
              No upcoming appointments<br/>
              <button onClick={() => navigate('/patient/find-doctors')} style={{ marginTop: 12, padding: '8px 16px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Book Now</button>
            </div>
          ) : appointments.map(a => (
            <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ textAlign: 'center', minWidth: 52, background: 'var(--cream)', borderRadius: 8, padding: '8px 6px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{a.timeSlot?.start}</div>
                <div style={{ fontSize: 10, color: 'var(--text-mid)' }}>{format(new Date(a.date), 'MMM d')}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--teal-dark)', flexShrink: 0 }}>
                {a.doctor?.user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2) || 'DR'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--navy)' }}>{a.doctor?.user?.name || 'Doctor'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 1 }}>{a.doctor?.specialization} · {a.type}</div>
              </div>
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: statusBg[a.status], color: statusColors[a.status] }}>{a.status}</span>
            </div>
          ))}
          <button onClick={() => navigate('/patient/find-doctors')} style={{ marginTop: 14, width: '100%', padding: '9px', border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--cream)', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--navy)' }}>
            + Book New Appointment
          </button>
        </div>

        {/* Quick actions */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 300, color: 'var(--navy)', marginBottom: 16 }}>Quick Actions</h2>
          {[
            { label: 'Find Doctors', desc: 'Browse & book consultations', path: '/patient/find-doctors', color: 'teal' },
            { label: 'Medical Records', desc: 'View & upload health files', path: '/patient/records', color: 'amber' },
            { label: 'Prescriptions', desc: 'View active medications', path: '/patient/prescriptions', color: 'green' },
            { label: 'Notifications', desc: `${unread} unread messages`, path: '/patient/notifications', color: 'red' },
          ].map(a => (
            <button key={a.label} onClick={() => navigate(a.path)} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '11px 14px',
              background: `var(--${a.color}-light)`, border: 'none', borderRadius: 10, cursor: 'pointer',
              marginBottom: 10, textAlign: 'left', transition: 'opacity .15s',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--navy)' }}>{a.label}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-mid)', marginTop: 1 }}>{a.desc}</div>
              </div>
              <svg width="16" height="16" fill="none" stroke="var(--text-light)" strokeWidth="2"><path d="M5 12l6-6 6 6" style={{transform:'rotate(90deg)',transformOrigin:'center'}}/></svg>
            </button>
          ))}
        </div>
      </div>

      {/* Top Doctors */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 300, color: 'var(--navy)' }}>Recommended Doctors</h2>
        <button onClick={() => navigate('/patient/find-doctors')} style={{ fontSize: 13, color: 'var(--teal)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 500 }}>See all</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {doctors.map(d => (
          <div key={d._id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 18, cursor: 'pointer', transition: 'all .2s', position: 'relative' }}
            onClick={() => navigate('/patient/find-doctors')}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal-mid)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(14,35,64,.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: '50%', background: d.isAvailableNow ? 'var(--green)' : 'var(--border-dark)' }}/>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 16, color: 'var(--teal-dark)', flexShrink: 0 }}>
                {d.user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2) || 'DR'}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>{d.user?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 2 }}>{d.specialization}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-mid)' }}>⭐ {d.rating} · {d.experience}y exp</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--teal-dark)' }}>₹{d.consultationFee?.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
