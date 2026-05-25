import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI, appointmentAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const SPECS = ['All','General Physician','Cardiologist','Dermatologist','Neurologist','Orthopedic','Pediatrician','Psychiatrist','Gynecologist','ENT Specialist'];

export default function FindDoctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState('All');
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [showModal, setShowModal]     = useState(null); // doctor object
  const [bookDate, setBookDate]       = useState('');
  const [bookTime, setBookTime]       = useState('10:00');
  const [symptoms, setSymptoms]       = useState('');
  const [booking, setBooking]         = useState(false);

  const fetchDoctors = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 9 };
    if (filter !== 'All') params.specialization = filter;
    if (search) params.search = search;
    doctorAPI.getAll(params)
      .then(r => { setDoctors(r.data.data); setTotalPages(r.data.totalPages); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter, search, page]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);
  useEffect(() => { setPage(1); }, [filter, search]);

  const handleBook = async () => {
    if (!bookDate || !bookTime) return toast.error('Please select date and time');
    setBooking(true);
    try {
      const endTime = `${String(parseInt(bookTime)+1).padStart(2,'0')}:${bookTime.split(':')[1]}`;
      await appointmentAPI.book({
        doctorId: showModal._id,
        date: bookDate,
        timeSlot: { start: bookTime, end: endTime },
        type: 'video',
        symptoms,
        fee: showModal.consultationFee,
      });
      toast.success('Appointment booked successfully!');
      setShowModal(null);
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.message || 'Booking failed');
    } finally { setBooking(false); }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 300, color: 'var(--navy)', marginBottom: 4 }}>Find Doctors</h1>
        <p style={{ fontSize: 14, color: 'var(--text-mid)' }}>{doctors.length} doctors available</p>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 14px' }}>
          <svg width="16" height="16" fill="none" stroke="var(--text-light)" strokeWidth="2"><circle cx="7" cy="7" r="6"/><path d="m13 13-3-3"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or specialization…"
            style={{ border: 'none', outline: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: 14, flex: 1, background: 'none', color: 'var(--text)' }}/>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {SPECS.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '6px 14px', border: `1.5px solid ${filter === s ? 'var(--teal)' : 'var(--border)'}`,
            borderRadius: 20, fontSize: 12.5, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
            background: filter === s ? 'var(--teal-light)' : '#fff',
            color: filter === s ? 'var(--teal)' : 'var(--text-mid)', transition: 'all .15s',
          }}>{s}</button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-mid)' }}>Loading doctors…</div> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
            {doctors.map(d => (
              <div key={d._id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 18, position: 'relative', transition: 'all .2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--teal-mid)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(14,35,64,.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; }}
              >
                <div style={{ position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: '50%', background: d.isAvailableNow ? 'var(--green)' : d.isAvailableNow === false ? 'var(--amber)' : 'var(--border-dark)' }} title={d.isAvailableNow ? 'Available' : 'Unavailable'}/>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 18, color: 'var(--teal-dark)', flexShrink: 0 }}>
                    {d.user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2) || 'DR'}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>{d.user?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 2 }}>{d.specialization}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>{d.hospital}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-mid)', marginBottom: 10 }}>
                  <span>⭐ {d.rating} ({d.totalReviews})</span>
                  <span>🎓 {d.experience}y exp</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                  {(d.languages || []).map(l => <span key={l} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'var(--cream)', color: 'var(--text-mid)' }}>{l}</span>)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--teal-dark)' }}>₹{d.consultationFee?.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-light)' }}>per consult</div>
                  </div>
                  <button onClick={() => setShowModal(d)} style={{
                    padding: '7px 16px', border: '1.5px solid var(--teal)', borderRadius: 8, background: 'none',
                    color: 'var(--teal)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all .15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--teal)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--teal)'; }}
                  >Book Now</button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{
                  width: 36, height: 36, borderRadius: 8, border: '1.5px solid', cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: page===p ? 600 : 400,
                  borderColor: page===p ? 'var(--teal)' : 'var(--border)',
                  background: page===p ? 'var(--teal-light)' : '#fff',
                  color: page===p ? 'var(--teal)' : 'var(--text-mid)',
                }}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Booking modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,35,64,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(14,35,64,.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 300, color: 'var(--navy)' }}>Book Appointment</h3>
              <button onClick={() => setShowModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-mid)', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'flex', gap: 12, padding: '12px', background: 'var(--cream)', borderRadius: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 16, color: 'var(--teal-dark)' }}>
                {showModal.user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--navy)' }}>{showModal.user?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-mid)' }}>{showModal.specialization} · ₹{showModal.consultationFee?.toLocaleString()}</div>
              </div>
            </div>
            {[
              { label: 'Date', type: 'date', value: bookDate, set: setBookDate, min: new Date().toISOString().split('T')[0] },
              { label: 'Preferred Time', type: 'time', value: bookTime, set: setBookTime },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--slate)', marginBottom: 5 }}>{f.label}</label>
                <input type={f.type} value={f.value} min={f.min} onChange={e => f.set(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none', background: 'var(--cream)', color: 'var(--text)' }}/>
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--slate)', marginBottom: 5 }}>Symptoms / Reason</label>
              <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={3} placeholder="Describe your symptoms or reason for consultation…"
                style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none', resize: 'vertical', background: 'var(--cream)', color: 'var(--text)' }}/>
            </div>
            <button onClick={handleBook} disabled={booking} style={{
              width: '100%', padding: '11px', borderRadius: 8, border: 'none',
              background: 'var(--teal)', color: '#fff', fontFamily: 'DM Sans, sans-serif',
              fontSize: 14, fontWeight: 500, cursor: booking ? 'not-allowed' : 'pointer',
            }}>{booking ? 'Booking…' : `Book for ₹${showModal.consultationFee?.toLocaleString()}`}</button>
          </div>
        </div>
      )}
    </div>
  );
}
