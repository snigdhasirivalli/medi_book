import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
  FiCalendar, FiSearch, FiUser, FiActivity, FiClock, FiMapPin
} from 'react-icons/fi';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await API.get('/appointments/my');
        setAppointments(data);
      } catch (err) {
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const upcoming = appointments.filter((a) => a.status === 'upcoming');
  const completed = appointments.filter((a) => a.status === 'completed');
  const cancelled = appointments.filter((a) => a.status === 'cancelled');

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋</h1>
        <p>Here's your health dashboard overview</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><FiCalendar /></div>
          <div>
            <div className="stat-value">{upcoming.length}</div>
            <div className="stat-label">Upcoming</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FiActivity /></div>
          <div>
            <div className="stat-value">{completed.length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><FiUser /></div>
          <div>
            <div className="stat-value">{cancelled.length}</div>
            <div className="stat-label">Cancelled</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><FiSearch /></div>
          <div>
            <div className="stat-value">{appointments.length}</div>
            <div className="stat-label">Total Visits</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid-2" style={{ marginBottom: '32px' }}>
        <button
          className="card"
          style={{ cursor: 'pointer', textAlign: 'left', border: '1px solid var(--accent)', background: 'var(--accent-light)' }}
          onClick={() => navigate('/find-doctors')}
        >
          <FiSearch style={{ fontSize: '1.5rem', color: 'var(--accent)', marginBottom: '10px' }} />
          <h3 style={{ marginBottom: '4px' }}>Find a Doctor</h3>
          <p className="text-secondary text-sm">Search by symptoms or specialty</p>
        </button>
        <button
          className="card"
          style={{ cursor: 'pointer', textAlign: 'left' }}
          onClick={() => navigate('/my-appointments')}
        >
          <FiCalendar style={{ fontSize: '1.5rem', color: 'var(--teal)', marginBottom: '10px' }} />
          <h3 style={{ marginBottom: '4px' }}>My Appointments</h3>
          <p className="text-secondary text-sm">View and manage bookings</p>
        </button>
      </div>

      {/* Upcoming Appointments */}
      <div>
        <div className="section-title flex items-center gap-2">
          <FiCalendar /> Upcoming Appointments
        </div>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : upcoming.length === 0 ? (
          <div className="empty-state card">
            <div className="icon">📅</div>
            <h3>No upcoming appointments</h3>
            <p>Book a consultation with a doctor</p>
            <button className="btn btn-primary mt-4" onClick={() => navigate('/find-doctors')}>
              Find a Doctor
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcoming.slice(0, 3).map((apt) => (
              <AppointmentRow key={apt._id} apt={apt} onCancel={() => {
                setAppointments((prev) => prev.map((a) => a._id === apt._id ? { ...a, status: 'cancelled' } : a));
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentRow({ apt, onCancel }) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!confirm('Cancel this appointment?')) return;
    setCancelling(true);
    try {
      await API.put(`/appointments/${apt._id}/cancel`);
      toast.success('Appointment cancelled');
      onCancel();
    } catch {
      toast.error('Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  const dateObj = new Date(apt.date);
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const day = dateObj.getDate();

  const doctorName = apt.doctor?.user?.name || 'Doctor';
  const initials = doctorName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="appointment-card" style={{ display: 'flex' }}>
      <div className="apt-date-col">
        <div className="month">{month}</div>
        <div className="day">{day}</div>
        <div className="status">
          <span className="badge badge-blue">Upcoming</span>
        </div>
      </div>
      <div style={{ flex: 1, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div className="flex items-center gap-3">
          <div className="doctor-avatar" style={{ width: 44, height: 44, fontSize: '1rem' }}>{initials}</div>
          <div>
            <div style={{ fontWeight: 700 }}>{doctorName}</div>
            <div className="text-secondary text-sm">{apt.doctor?.specialty}</div>
            <div className="flex gap-3 mt-2">
              <span className="doctor-meta-item"><FiClock /> {apt.startTime} – {apt.endTime}</span>
              {apt.doctor?.location && (
                <span className="doctor-meta-item"><FiMapPin /> {apt.doctor.location}</span>
              )}
            </div>
          </div>
        </div>
        {apt.symptoms?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {apt.symptoms.slice(0, 3).map((s) => (
              <span key={s} className="symptom-tag" style={{ cursor: 'default' }}>{s}</span>
            ))}
          </div>
        )}
        <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={cancelling}>
          {cancelling ? '...' : 'Cancel'}
        </button>
      </div>
    </div>
  );
}
