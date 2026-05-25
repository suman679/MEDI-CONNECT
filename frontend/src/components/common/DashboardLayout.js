import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const NAV = {
  patient: [
    { to:'/patient/dashboard',    label:'Dashboard',       icon:'M3 12L12 3l9 9M5 10v10h4v-6h6v6h4V10' },
    { to:'/patient/find-doctors', label:'Find Doctors',    icon:'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z' },
    { to:'/patient/appointments', label:'Appointments',    icon:'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z', badge:true },
    { to:'/patient/records',      label:'Medical Records', icon:'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' },
    { to:'/patient/prescriptions',label:'Prescriptions',   icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { to:'/patient/notifications', label:'Notifications',  icon:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', badge:true },
  ],
  doctor: [
    { to:'/doctor/dashboard',    label:'Dashboard',    icon:'M3 12L12 3l9 9M5 10v10h4v-6h6v6h4V10' },
    { to:'/doctor/appointments', label:'Appointments', icon:'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z', badge:true },
    { to:'/doctor/patients',     label:'My Patients',  icon:'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
    { to:'/doctor/profile',      label:'My Profile',   icon:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z' },
    { to:'/doctor/notifications',label:'Notifications',icon:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', badge:true },
  ],
  admin: [
    { to:'/admin/dashboard',    label:'Dashboard',      icon:'M3 12L12 3l9 9M5 10v10h4v-6h6v6h4V10' },
    { to:'/admin/doctors',      label:'Manage Doctors', icon:'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
    { to:'/admin/users',        label:'Manage Users',   icon:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z' },
    { to:'/admin/notifications',label:'Notifications',  icon:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  ],
};

const PAGE_TITLES = {
  '/patient/dashboard':'Dashboard', '/patient/find-doctors':'Find Doctors', '/patient/appointments':'Appointments',
  '/patient/records':'Medical Records', '/patient/prescriptions':'Prescriptions', '/patient/notifications':'Notifications',
  '/doctor/dashboard':'Dashboard', '/doctor/appointments':'Appointments', '/doctor/patients':'My Patients',
  '/doctor/profile':'My Profile', '/doctor/notifications':'Notifications',
  '/admin/dashboard':'Dashboard', '/admin/doctors':'Manage Doctors', '/admin/users':'Manage Users', '/admin/notifications':'Notifications',
};

export default function DashboardLayout() {
  const { user, logout }      = useAuth();
  const { notifications }     = useSocket() || {};
  const navigate              = useNavigate();
  const location              = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems   = NAV[user?.role] || NAV.patient;
  const unread     = (notifications || []).filter(n => !n.isRead).length;
  const initials   = user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || 'U';
  const pageTitle  = PAGE_TITLES[location.pathname] || 'MediConnect';

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const sidebarW = collapsed ? 72 : 240;

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--cream)' }}>
      {/* Sidebar */}
      <aside style={{ width:sidebarW, minHeight:'100vh', background:'var(--navy)', display:'flex', flexDirection:'column', position:'sticky', top:0, transition:'width .22s ease', flexShrink:0, overflow:'hidden', zIndex:20 }}>
        {/* Logo */}
        <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,.08)', display:'flex', alignItems:'center', gap:10, minHeight:64 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'var(--teal)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer' }} onClick={() => setCollapsed(c=>!c)}>
            <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </div>
          {!collapsed && <span style={{ fontFamily:'Fraunces,serif', fontSize:18, fontWeight:300, color:'#fff', whiteSpace:'nowrap', lineHeight:1 }}>Medi<span style={{ color:'#4BBFAA' }}>Connect</span></span>}
        </div>

        {/* Nav items */}
        <nav style={{ flex:1, padding:'14px 10px', overflowY:'auto', overflowX:'hidden' }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} title={collapsed ? item.label : undefined}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:10, padding:'10px 10px', borderRadius:8, marginBottom:2,
                textDecoration:'none', fontSize:13.5, fontWeight:isActive?500:400, whiteSpace:'nowrap',
                color: isActive ? '#fff' : 'rgba(255,255,255,.6)',
                background: isActive ? 'var(--teal)' : 'transparent',
                transition:'all .15s', overflow:'hidden', position:'relative',
              })}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                <path d={item.icon}/>
              </svg>
              {!collapsed && <>
                <span style={{ flex:1 }}>{item.label}</span>
                {item.badge && unread > 0 && <span style={{ background:'#E8A020', color:'#0E2340', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:20, lineHeight:1.5 }}>{unread > 9 ? '9+' : unread}</span>}
              </>}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 6px', borderRadius:8, marginBottom:4, overflow:'hidden' }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--teal)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:'#fff', flexShrink:0 }}>{initials}</div>
            {!collapsed && <div style={{ overflow:'hidden' }}>
              <div style={{ fontSize:13, fontWeight:500, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', textTransform:'capitalize' }}>{user?.role}</div>
            </div>}
          </div>
          <button onClick={handleLogout} title={collapsed?'Logout':undefined}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:8, background:'none', border:'none', color:'rgba(255,255,255,.45)', cursor:'pointer', fontSize:13, width:'100%', whiteSpace:'nowrap', transition:'color .15s' }}
            onMouseEnter={e=>e.currentTarget.style.color='#fff'}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.45)'}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink:0 }} viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
        {/* Topbar */}
        <header style={{ background:'#fff', borderBottom:'1px solid var(--border)', height:64, display:'flex', alignItems:'center', gap:16, padding:'0 28px', position:'sticky', top:0, zIndex:10, flexShrink:0 }}>
          <h1 style={{ fontFamily:'Fraunces,serif', fontSize:22, fontWeight:300, color:'var(--navy)', flex:1 }}>{pageTitle}</h1>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:500, background:'var(--teal-light)', color:'var(--teal-dark)', textTransform:'capitalize' }}>{user?.role}</span>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--teal)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:'#fff', cursor:'default' }}>{initials}</div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, padding:28, overflowY:'auto', maxHeight:'calc(100vh - 64px)' }}>
          <Outlet/>
        </main>
      </div>
    </div>
  );
}
