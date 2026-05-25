import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../utils/api';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const TYPE_META = {
  appointment_booked:     { icon:'📅', bg:'var(--teal-light)',   fg:'var(--teal)' },
  appointment_confirmed:  { icon:'✅', bg:'var(--green-light)',  fg:'var(--green)' },
  appointment_cancelled:  { icon:'❌', bg:'var(--red-light)',    fg:'var(--red)' },
  appointment_reminder:   { icon:'⏰', bg:'var(--amber-light)',  fg:'var(--amber)' },
  prescription_ready:     { icon:'💊', bg:'var(--green-light)',  fg:'var(--green)' },
  new_message:            { icon:'💬', bg:'var(--teal-light)',   fg:'var(--teal)' },
  payment_success:        { icon:'💳', bg:'var(--green-light)',  fg:'var(--green)' },
  doctor_approved:        { icon:'🎉', bg:'var(--teal-light)',   fg:'var(--teal)' },
  review_request:         { icon:'⭐', bg:'var(--amber-light)',  fg:'var(--amber)' },
  system:                 { icon:'🔔', bg:'var(--cream)',        fg:'var(--slate)' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);

  const fetchNotifications = () => {
    notificationAPI.getAll()
      .then(r => {
        setNotifications(r.data.data);
        setUnreadCount(r.data.unreadCount || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    await notificationAPI.markRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const markAll = async () => {
    await notificationAPI.markAll();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  const deleteNotif = async (id) => {
    await notificationAPI.delete(id);
    setNotifications(prev => prev.filter(n => n._id !== id));
    toast.success('Notification deleted');
  };

  if (loading) return <div style={{ textAlign:'center', padding:60, color:'var(--text-mid)' }}>Loading notifications…</div>;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'Fraunces,serif', fontSize:28, fontWeight:300, color:'var(--navy)', marginBottom:4 }}>Notifications</h1>
          <p style={{ fontSize:14, color:'var(--text-mid)' }}>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAll} style={{ padding:'8px 16px', background:'none', border:'1.5px solid var(--border)', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'DM Sans,sans-serif', color:'var(--navy)' }}>
            Mark all as read
          </button>
        )}
      </div>

      <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:20, overflow:'hidden' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign:'center', padding:60, color:'var(--text-mid)' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔔</div>
            <div>No notifications yet</div>
          </div>
        ) : notifications.map((n, i) => {
          const meta = TYPE_META[n.type] || TYPE_META.system;
          return (
            <div key={n._id}
              onClick={() => !n.isRead && markRead(n._id)}
              style={{
                display:'flex', alignItems:'flex-start', gap:14, padding:'16px 20px',
                borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                background: n.isRead ? '#fff' : 'var(--teal-light)',
                borderLeft: n.isRead ? '3px solid transparent' : '3px solid var(--teal)',
                cursor: n.isRead ? 'default' : 'pointer',
                transition: 'background .15s',
              }}
            >
              <div style={{ width:40, height:40, borderRadius:'50%', background:meta.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                {meta.icon}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:2 }}>
                  <div style={{ fontSize:13.5, fontWeight:n.isRead?400:600, color:'var(--navy)' }}>{n.title}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:11, color:'var(--text-light)', whiteSpace:'nowrap' }}>
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix:true })}
                    </span>
                    <button onClick={e => { e.stopPropagation(); deleteNotif(n._id); }}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-light)', fontSize:16, lineHeight:1, padding:'0 2px' }}>
                      ×
                    </button>
                  </div>
                </div>
                <div style={{ fontSize:13, color:'var(--text-mid)', lineHeight:1.5 }}>{n.message}</div>
                {!n.isRead && (
                  <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--teal)', marginTop:6 }}/>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
