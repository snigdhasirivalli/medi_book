import { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import { FiCalendar, FiClock, FiMapPin, FiFilter, FiInfo } from 'react-icons/fi';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    API.get('/appointments/my')
      .then(({ data }) => setAppointments(data))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = appointments.filter((a) =>
    filter === 'all' ? true : a.status === filter
  );

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await API.put(`/appointments/${id}/cancel`);
      setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status: 'cancelled' } : a)));
      toast.success('Appointment cancelled');
    } catch {
      toast.error('Failed to cancel');
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>My <span className="text-gradient">Appointments</span></h1>
        <p>View and manage all your bookings</p>
      </div>

      {/* Filter Tabs */}
      <div className="tabs" style={{ maxWidth: '400px' }}>
        {['all', 'upcoming', 'completed', 'cancelled'].map((f) => (
          <button
            key={f}
            className={`tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
            style={{ textTransform: 'capitalize' }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="icon">📋</div>
          <h3>No {filter !== 'all' ? filter : ''} appointments</h3>
          <p>Your appointments will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((apt) => (
            <AppointmentCard key={apt._id} apt={apt} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ apt, onCancel }) {
  const [showExplain, setShowExplain] = useState(false);

  const doctorName = apt.doctor?.user?.name || 'Doctor';
  const initials = doctorName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const dateObj = new Date(apt.date);
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const day = dateObj.getDate();

  const statusColors = {
    upcoming: 'badge-blue',
    completed: 'badge-green',
    cancelled: 'badge-red',
  };

  return (
    <div className="appointment-card">
      <div className="flex">
        <div className="apt-date-col">
          <div className="month">{month}</div>
          <div className="day">{day}</div>
          <br />
          <span className={`badge ${statusColors[apt.status]}`} style={{ fontSize: '0.6rem' }}>
            {apt.status}
          </span>
        </div>
        <div style={{ flex: 1, padding: '16px' }}>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="doctor-avatar" style={{ width: 44, height: 44, fontSize: '1rem' }}>{initials}</div>
              <div>
                <div style={{ fontWeight: 700 }}>{doctorName}</div>
                <div className="text-secondary text-sm" style={{ color: 'var(--accent)' }}>
                  {apt.doctor?.specialty}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="doctor-meta-item"><FiClock /> {apt.startTime} – {apt.endTime}</span>
              {apt.doctor?.location && (
                <span className="doctor-meta-item"><FiMapPin /> {apt.doctor.location}</span>
              )}
            </div>
          </div>

          {apt.symptoms?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-secondary text-xs">Symptoms:</span>
              {apt.symptoms.map((s) => (
                <span key={s} className="symptom-tag" style={{ cursor: 'default', fontSize: '0.75rem' }}>{s}</span>
              ))}
            </div>
          )}

          {apt.notes && (
            <div className="text-secondary text-sm mb-3" style={{ fontStyle: 'italic' }}>
              "{apt.notes}"
            </div>
          )}

          {apt.matchReason && (
            <>
              <button
                className="btn btn-secondary btn-sm mb-3"
                onClick={() => setShowExplain(!showExplain)}
              >
                <FiInfo /> {showExplain ? 'Hide' : 'Why this doctor?'}
              </button>
              {showExplain && (
                <div className="explain-reason mb-3">
                  {apt.matchReason}
                  {apt.matchScore > 0 && (
                    <span className="badge badge-purple" style={{ marginLeft: '8px' }}>
                      {apt.matchScore}% symptom match
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          {apt.status === 'upcoming' && (
            <button className="btn btn-danger btn-sm" onClick={() => onCancel(apt._id)}>
              Cancel Appointment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
