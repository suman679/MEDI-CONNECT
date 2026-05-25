import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentAPI, prescriptionAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const emptyMed = { name:'', dosage:'', frequency:'', duration:'', instructions:'' };

export default function WritePrescription() {
  const { apptId } = useParams();
  const navigate   = useNavigate();
  const [appt,    setAppt]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [form, setForm] = useState({
    diagnosis: '', medicines: [{ ...emptyMed }], labTests: '', notes: '', followUpDate: '',
  });

  useEffect(() => {
    appointmentAPI.getOne(apptId)
      .then(r => setAppt(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [apptId]);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleMed = (i, field, val) => {
    setForm(f => {
      const meds = [...f.medicines];
      meds[i] = { ...meds[i], [field]: val };
      return { ...f, medicines: meds };
    });
  };

  const addMed    = () => setForm(f => ({ ...f, medicines: [...f.medicines, { ...emptyMed }] }));
  const removeMed = i  => setForm(f => ({ ...f, medicines: f.medicines.filter((_,idx)=>idx!==i) }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.diagnosis.trim()) return toast.error('Please add a diagnosis');
    if (!form.medicines[0]?.name) return toast.error('Please add at least one medicine');
    setSaving(true);
    try {
      await prescriptionAPI.create({
        appointmentId: apptId,
        diagnosis:     form.diagnosis,
        medicines:     form.medicines.filter(m => m.name),
        labTests:      form.labTests.split(',').map(t=>t.trim()).filter(Boolean),
        notes:         form.notes,
        followUpDate:  form.followUpDate || undefined,
      });
      // Mark appointment as completed
      await appointmentAPI.updateStatus(apptId, { status:'completed' });
      toast.success('Prescription created successfully!');
      navigate('/doctor/appointments');
    } catch(e) {
      toast.error(e.message || 'Could not create prescription');
    } finally { setSaving(false); }
  };

  const inputStyle = { width:'100%', border:'1.5px solid var(--border)', borderRadius:8, padding:'9px 12px', fontFamily:'DM Sans,sans-serif', fontSize:13, color:'var(--text)', background:'var(--cream)', outline:'none', boxSizing:'border-box' };

  if (loading) return <div style={{ textAlign:'center', padding:60, color:'var(--text-mid)' }}>Loading…</div>;

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Fraunces,serif', fontSize:28, fontWeight:300, color:'var(--navy)', marginBottom:4 }}>Write Prescription</h1>
        <p style={{ fontSize:14, color:'var(--text-mid)' }}>Appointment: {appt?.appointmentId}</p>
      </div>

      {/* Patient info */}
      {appt && (
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, padding:20, marginBottom:20 }}>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:600, color:'var(--navy)', flexShrink:0 }}>
              {appt.patient?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)||'PT'}
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:500, color:'var(--navy)' }}>{appt.patient?.name}</div>
              <div style={{ fontSize:12, color:'var(--text-mid)', marginTop:2 }}>
                {appt.patient?.email} · {appt.patient?.gender} · Appointment: {new Date(appt.date).toDateString()}
              </div>
              {appt.symptoms && <div style={{ fontSize:12, color:'var(--text-mid)', marginTop:4, fontStyle:'italic' }}>"{appt.symptoms}"</div>}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={submit}>
        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:20 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Diagnosis */}
            <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, padding:20 }}>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--navy)', marginBottom:12 }}>Diagnosis</div>
              <textarea name="diagnosis" value={form.diagnosis} onChange={handle} rows={3} required
                placeholder="e.g. Atopic Dermatitis (L20.9) — Mild to moderate"
                style={{ ...inputStyle, resize:'vertical' }}
                onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
            </div>

            {/* Medicines */}
            <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--navy)' }}>Medicines</div>
                <button type="button" onClick={addMed} style={{ padding:'5px 12px', background:'var(--teal-light)', color:'var(--teal-dark)', border:'none', borderRadius:6, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
                  + Add Medicine
                </button>
              </div>
              {form.medicines.map((m, i) => (
                <div key={i} style={{ background:'var(--cream)', borderRadius:10, padding:14, marginBottom:10, position:'relative' }}>
                  {form.medicines.length > 1 && (
                    <button type="button" onClick={() => removeMed(i)} style={{ position:'absolute', top:8, right:8, background:'none', border:'none', cursor:'pointer', color:'var(--red)', fontSize:16, lineHeight:1 }}>×</button>
                  )}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:500, color:'var(--slate)', marginBottom:4 }}>Medicine Name *</label>
                      <input value={m.name} onChange={e=>handleMed(i,'name',e.target.value)} placeholder="e.g. Paracetamol 500mg" required style={inputStyle}
                        onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:500, color:'var(--slate)', marginBottom:4 }}>Dosage *</label>
                      <input value={m.dosage} onChange={e=>handleMed(i,'dosage',e.target.value)} placeholder="e.g. 500mg" required style={inputStyle}
                        onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:500, color:'var(--slate)', marginBottom:4 }}>Frequency *</label>
                      <input value={m.frequency} onChange={e=>handleMed(i,'frequency',e.target.value)} placeholder="e.g. Twice daily" required style={inputStyle}
                        onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:500, color:'var(--slate)', marginBottom:4 }}>Duration *</label>
                      <input value={m.duration} onChange={e=>handleMed(i,'duration',e.target.value)} placeholder="e.g. 5 days" required style={inputStyle}
                        onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                    </div>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:500, color:'var(--slate)', marginBottom:4 }}>Special Instructions</label>
                    <input value={m.instructions} onChange={e=>handleMed(i,'instructions',e.target.value)} placeholder="e.g. Take with food" style={inputStyle}
                      onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Lab tests */}
            <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, padding:20 }}>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--navy)', marginBottom:12 }}>Lab Tests (optional)</div>
              <textarea name="labTests" value={form.labTests} onChange={handle} rows={3}
                placeholder="Comma-separated: CBC, LFT, Blood Sugar"
                style={{ ...inputStyle, resize:'vertical' }}
                onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
            </div>

            {/* Notes */}
            <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, padding:20 }}>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--navy)', marginBottom:12 }}>Doctor's Notes</div>
              <textarea name="notes" value={form.notes} onChange={handle} rows={4}
                placeholder="Advice, dietary restrictions, precautions…"
                style={{ ...inputStyle, resize:'vertical' }}
                onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
            </div>

            {/* Follow-up */}
            <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, padding:20 }}>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--navy)', marginBottom:12 }}>Follow-up Date (optional)</div>
              <input type="date" name="followUpDate" value={form.followUpDate} onChange={handle}
                min={new Date().toISOString().split('T')[0]}
                style={inputStyle}
                onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
            </div>

            <button type="submit" disabled={saving} style={{ padding:'12px', background:'var(--teal)', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:500, cursor:saving?'not-allowed':'pointer', fontFamily:'DM Sans,sans-serif' }}>
              {saving ? 'Saving Prescription…' : '💊 Issue Prescription'}
            </button>
            <button type="button" onClick={() => navigate(-1)} style={{ padding:'12px', background:'none', color:'var(--text-mid)', border:'1.5px solid var(--border)', borderRadius:10, fontSize:14, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
