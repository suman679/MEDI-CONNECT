import React, { useEffect, useState } from 'react';
import { doctorAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SPECS = ['General Physician','Cardiologist','Dermatologist','Neurologist','Orthopedic','Pediatrician','Psychiatrist','Gynecologist','ENT Specialist','Urologist','Endocrinologist','Gastroenterologist'];
const DAYS  = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

export default function DoctorProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [tab, setTab]           = useState('info');
  const [form, setForm]         = useState({
    specialization:'', experience:'', consultationFee:'', bio:'', languages:'', hospital:'', licenseNumber:'', slotDuration:30,
    availability: DAYS.reduce((acc, d) => ({ ...acc, [d]:{ available:d!=='sunday', slots:[{ start:'09:00', end:'17:00' }] } }), {}),
  });

  useEffect(() => {
    doctorAPI.getOne(user?._id)
      .then(r => {
        const d = r.data.data;
        setProfile(d);
        setForm({
          specialization:  d.specialization||'',
          experience:      d.experience||'',
          consultationFee: d.consultationFee||'',
          bio:             d.bio||'',
          languages:       (d.languages||[]).join(', '),
          hospital:        d.hospital||'',
          licenseNumber:   d.licenseNumber||'',
          slotDuration:    d.slotDuration||30,
          availability:    d.availability || form.availability,
        });
      })
      .catch(() => {}) // profile might not exist yet
      .finally(() => setLoading(false));
  }, []);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, languages: form.languages.split(',').map(l=>l.trim()).filter(Boolean) };
      if (!profile) {
        await doctorAPI.createProfile(payload);
        toast.success('Profile created!');
      } else {
        await doctorAPI.updateProfile(payload);
        toast.success('Profile updated!');
      }
    } catch(e) {
      toast.error(e.message || 'Could not save profile');
    } finally { setSaving(false); }
  };

  const toggleDay = (day) => {
    setForm(f => ({ ...f, availability:{ ...f.availability, [day]:{ ...f.availability[day], available:!f.availability[day]?.available } } }));
  };

  const inputStyle = { width:'100%', border:'1.5px solid var(--border)', borderRadius:8, padding:'10px 14px', fontFamily:'DM Sans,sans-serif', fontSize:14, color:'var(--text)', background:'var(--cream)', outline:'none', boxSizing:'border-box' };

  if (loading) return <div style={{ textAlign:'center', padding:60, color:'var(--text-mid)' }}>Loading profile…</div>;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:'Fraunces,serif', fontSize:28, fontWeight:300, color:'var(--navy)', marginBottom:4 }}>My Profile</h1>
          <p style={{ fontSize:14, color:'var(--text-mid)' }}>Manage your professional information</p>
        </div>
        <button onClick={save} disabled={saving} style={{ padding:'9px 20px', background:'var(--teal)', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:500, cursor:saving?'not-allowed':'pointer', fontFamily:'DM Sans,sans-serif' }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Profile card */}
      <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:20, padding:24, marginBottom:20, display:'flex', gap:20, alignItems:'center' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--teal-light)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Fraunces,serif', fontSize:28, color:'var(--teal-dark)', flexShrink:0 }}>
          {user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)||'DR'}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:20, fontFamily:'Fraunces,serif', fontWeight:300, color:'var(--navy)' }}>{user?.name}</div>
          <div style={{ fontSize:13, color:'var(--text-mid)', marginTop:3 }}>{form.specialization||'Specialization not set'} · {user?.email}</div>
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:500, background:profile?.isApproved?'var(--green-light)':'var(--amber-light)', color:profile?.isApproved?'var(--green)':'#9B6800' }}>
              {profile?.isApproved ? 'Verified' : 'Pending Verification'}
            </span>
            <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:500, background:'var(--teal-light)', color:'var(--teal-dark)' }}>
              {profile?.totalConsultations||0} consultations
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, background:'#fff', border:'1px solid var(--border)', borderRadius:8, padding:4, marginBottom:20, width:'fit-content' }}>
        {['info','availability'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:'7px 18px', borderRadius:6, border:'none', background:tab===t?'var(--teal)':'none', color:tab===t?'#fff':'var(--text-mid)', fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:tab===t?500:400, cursor:'pointer', textTransform:'capitalize', transition:'all .15s' }}>
            {t === 'info' ? 'Professional Info' : 'Availability'}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:20, padding:28 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18 }}>
            <div>
              <label style={{ display:'block', fontSize:12.5, fontWeight:500, color:'var(--slate)', marginBottom:5 }}>Specialization</label>
              <select name="specialization" value={form.specialization} onChange={handle} style={{ ...inputStyle, appearance:'none' }}>
                <option value="">Select…</option>
                {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12.5, fontWeight:500, color:'var(--slate)', marginBottom:5 }}>Years of Experience</label>
              <input name="experience" type="number" value={form.experience} onChange={handle} style={inputStyle}
                onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12.5, fontWeight:500, color:'var(--slate)', marginBottom:5 }}>Consultation Fee (₹)</label>
              <input name="consultationFee" type="number" value={form.consultationFee} onChange={handle} style={inputStyle}
                onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12.5, fontWeight:500, color:'var(--slate)', marginBottom:5 }}>Hospital / Clinic</label>
              <input name="hospital" value={form.hospital} onChange={handle} style={inputStyle}
                onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12.5, fontWeight:500, color:'var(--slate)', marginBottom:5 }}>License Number</label>
              <input name="licenseNumber" value={form.licenseNumber} onChange={handle} style={inputStyle}
                onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12.5, fontWeight:500, color:'var(--slate)', marginBottom:5 }}>Languages (comma-separated)</label>
              <input name="languages" value={form.languages} onChange={handle} placeholder="English, Hindi" style={inputStyle}
                onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
            </div>
          </div>
          <div>
            <label style={{ display:'block', fontSize:12.5, fontWeight:500, color:'var(--slate)', marginBottom:5 }}>Professional Bio</label>
            <textarea name="bio" value={form.bio} onChange={handle} rows={4} placeholder="Describe your expertise, approach, and experience…"
              style={{ ...inputStyle, resize:'vertical' }}
              onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
          </div>
        </div>
      )}

      {tab === 'availability' && (
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:20, padding:28 }}>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontSize:12.5, fontWeight:500, color:'var(--slate)', marginBottom:5 }}>Slot Duration (minutes)</label>
            <select name="slotDuration" value={form.slotDuration} onChange={handle} style={{ border:'1.5px solid var(--border)', borderRadius:8, padding:'10px 14px', fontFamily:'DM Sans,sans-serif', fontSize:14, outline:'none', background:'var(--cream)', appearance:'none', color:'var(--text)' }}>
              {[15,20,30,45,60].map(v => <option key={v} value={v}>{v} min</option>)}
            </select>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {DAYS.map(day => (
              <div key={day} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:form.availability[day]?.available?'var(--teal-light)':'var(--cream)', borderRadius:10, border:`1px solid ${form.availability[day]?.available?'var(--teal-mid)':'var(--border)'}`, transition:'all .15s' }}>
                <div style={{ minWidth:100, fontSize:13.5, fontWeight:500, color:'var(--navy)', textTransform:'capitalize' }}>{day}</div>
                <button type="button" onClick={() => toggleDay(day)} style={{
                  position:'relative', width:44, height:24, borderRadius:12, border:'none', cursor:'pointer',
                  background: form.availability[day]?.available ? 'var(--teal)' : 'var(--border-dark)',
                  transition:'background .15s', flexShrink:0,
                }}>
                  <div style={{ position:'absolute', top:3, left:form.availability[day]?.available?22:3, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left .15s', boxShadow:'0 1px 3px rgba(0,0,0,.2)' }}/>
                </button>
                {form.availability[day]?.available ? (
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--teal-dark)' }}>
                    <input type="time" defaultValue="09:00" style={{ border:'1px solid var(--teal-mid)', borderRadius:6, padding:'4px 8px', fontFamily:'DM Sans,sans-serif', fontSize:12, background:'#fff', outline:'none' }}/>
                    <span style={{ color:'var(--text-mid)' }}>to</span>
                    <input type="time" defaultValue="17:00" style={{ border:'1px solid var(--teal-mid)', borderRadius:6, padding:'4px 8px', fontFamily:'DM Sans,sans-serif', fontSize:12, background:'#fff', outline:'none' }}/>
                  </div>
                ) : (
                  <span style={{ fontSize:12, color:'var(--text-light)' }}>Not available</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
