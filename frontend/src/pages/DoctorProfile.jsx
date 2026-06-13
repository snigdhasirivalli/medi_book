import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
  FiStar, FiMapPin, FiClock, FiUser, FiCalendar,
  FiArrowLeft, FiCheckCircle, FiInfo
} from 'react-icons/fi';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDay, setSelectedDay] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    API.get(`/doctors/${id}`)
      .then(({ data }) => setDoctor(data))
      .catch(() => toast.error('Doctor not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const addSymptom = () => {
    const s = symptomInput.trim().toLowerCase();
    if (s && !symptoms.includes(s)) setSymptoms([...symptoms, s]);
    setSymptomInput('');
  };

  const handleBook = async () => {
    if (!selectedSlot) return toast.error('Please select a time slot');
    if (!user) return navigate('/login');

    // Calculate date for next occurrence of the selected day
    const today = new Date();
    const dayIndex = DAYS.indexOf(selectedDay);
    const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
    let diff = dayIndex - todayIndex;
    if (diff <= 0) diff += 7;
    const date = new Date(today);
    date.setDate(today.getDate() + diff);
    const dateStr = date.toISOString().split('T')[0];

    // Auto-add typed symptom if the user forgot to click "Add"
    let finalSymptoms = [...symptoms];
    if (symptomInput.trim()) {
      const s = symptomInput.trim().toLowerCase();
      if (!finalSymptoms.includes(s)) {
        finalSymptoms.push(s);
      }
    }

    setBooking(true);
    try {
      await API.post('/appointments', {
        doctorId: doctor._id,
        date: dateStr,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        symptoms: finalSymptoms,
        notes,
      });
      toast.success('Appointment booked successfully! 🎉');
      setShowModal(false);
      navigate('/my-appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!doctor) return <div className="page-content"><p>Doctor not found</p></div>;

  const name = doctor.user?.name || 'Doctor';
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const slotsByDay = DAYS.map((day) => ({
    day,
    slots: (doctor.availableSlots || []).filter((s) => s.day === day && s.isAvailable !== false),
  })).filter((d) => d.slots.length > 0);

  return (
    <div className="page-content">
      <button className="btn btn-secondary btn-sm mb-4" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back
      </button>

      {/* Doctor Header Card */}
      <div className="card mb-4">
        <div className="flex gap-4 flex-wrap">
          <div className="doctor-avatar" style={{ width: 80, height: 80, fontSize: '1.8rem', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>{name}</h1>
            <div style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '8px' }}>{doctor.specialty}</div>
            <div className="flex flex-wrap gap-3 mb-3">
              <span className="doctor-meta-item">🎓 {doctor.qualification}</span>
              <span className="doctor-meta-item">🏆 {doctor.experience} yrs experience</span>
              {doctor.location && <span className="doctor-meta-item"><FiMapPin /> {doctor.location}</span>}
              {doctor.hospital && <span className="doctor-meta-item">🏥 {doctor.hospital}</span>}
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="rating">
                <FiStar className="star" style={{ color: 'var(--orange)', fill: 'var(--orange)' }} />
                <span className="score">{doctor.rating?.toFixed(1)}</span>
                <span className="count">({doctor.reviewCount} reviews)</span>
              </div>
              <span className="badge badge-green">₹{doctor.consultationFee} / visit</span>
              {doctor.languages?.map((l) => (
                <span key={l} className="badge badge-teal">{l}</span>
              ))}
            </div>
          </div>
          <div>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setShowModal(true)}
            >
              <FiCalendar /> Book Appointment
            </button>
          </div>
        </div>

        {doctor.bio && (
          <>
            <div className="divider" />
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{doctor.bio}</p>
          </>
        )}
      </div>

      <div className="grid-2 gap-6">
        {/* Symptoms Handled */}
        <div className="card">
          <h3 className="section-title">Conditions Treated</h3>
          <div className="flex flex-wrap gap-2">
            {(doctor.symptomsHandled || []).map((s) => (
              <span key={s} className="symptom-tag" style={{ cursor: 'default' }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Available Slots */}
        <div className="card">
          <h3 className="section-title">Available Slots</h3>
          {slotsByDay.length === 0 ? (
            <p className="text-secondary text-sm">No slots available currently</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {slotsByDay.map(({ day, slots }) => (
                <div key={day}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {day}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot, i) => (
                      <span key={i} className="badge badge-blue">
                        <FiClock /> {slot.startTime}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Explainability */}
      <div className="explain-card mt-4">
        <div className="flex items-center gap-2 mb-3" style={{ fontWeight: 700 }}>
          <FiInfo style={{ color: 'var(--purple)' }} />
          <span>Why this doctor?</span>
        </div>
        <div className="explain-reason">
          {name} specializes in <strong>{doctor.specialty}</strong> with{' '}
          <strong>{doctor.experience} years</strong> of experience. They treat conditions including:{' '}
          <strong>{(doctor.symptomsHandled || []).join(', ')}</strong>.
          {doctor.location && ` Based in ${doctor.location}`} at {doctor.hospital}.
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Book Appointment</div>
                <div className="text-secondary text-sm mt-1">with {name}</div>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {/* Select Day + Slot */}
            <div className="form-group mb-4">
              <label className="form-label">Select Day & Time</label>
              {slotsByDay.length === 0 ? (
                <p className="text-secondary text-sm">No available slots</p>
              ) : (
                slotsByDay.map(({ day, slots }) => (
                  <div key={day} style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {day}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {slots.map((slot, i) => (
                        <button
                          key={i}
                          className={`badge ${selectedSlot === slot && selectedDay === day ? 'badge-green' : 'badge-blue'}`}
                          style={{ cursor: 'pointer', padding: '8px 14px', fontSize: '0.85rem' }}
                          onClick={() => { setSelectedSlot(slot); setSelectedDay(day); }}
                        >
                          {selectedSlot === slot && selectedDay === day && <FiCheckCircle />}
                          {slot.startTime} – {slot.endTime}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Symptoms */}
            <div className="form-group mb-4">
              <label className="form-label">Your Symptoms (optional)</label>
              <div className="flex gap-2">
                <input
                  className="form-input"
                  placeholder="e.g. fever, headache"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSymptom()}
                />
                <button className="btn btn-secondary" onClick={addSymptom}>Add</button>
              </div>
              {symptoms.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {symptoms.map((s) => (
                    <span key={s} className="symptom-tag removable" onClick={() => setSymptoms(symptoms.filter((x) => x !== s))}>
                      {s} ✕
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="form-group mb-6">
              <label className="form-label">Additional Notes</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Any specific concerns..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="flex gap-3">
              <button className="btn btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary flex-1" onClick={handleBook} disabled={booking || !selectedSlot}>
                {booking ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
