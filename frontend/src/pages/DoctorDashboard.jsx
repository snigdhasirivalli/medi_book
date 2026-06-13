import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiCheckCircle } from 'react-icons/fi';

export default function DoctorDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const navigate = useNavigate();

    const getFilterFromPath = () => {
        if (location.state?.filter) return location.state.filter;
        if (location.pathname.endsWith('/doctor-appointments')) return 'all';
        return 'upcoming';
    };

    const [filter, setFilter] = useState(getFilterFromPath());

    useEffect(() => {
        if (location.state?.filter) {
            setFilter(location.state.filter);
        } else if (location.pathname.endsWith('/doctor-appointments')) {
            setFilter('all');
        } else if (location.pathname.endsWith('/doctor-dashboard')) {
            setFilter('upcoming');
        }
    }, [location.pathname, location.state]);

    useEffect(() => {
        API.get('/appointments/doctor')
            .then(({ data }) => setAppointments(data))
            .catch(() => toast.error('Failed to load appointments'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = appointments.filter((a) =>
        filter === 'all' ? true : a.status === filter
    );

    const upcoming = appointments.filter((a) => a.status === 'upcoming');
    const completed = appointments.filter((a) => a.status === 'completed');

    const handleComplete = async (id) => {
        try {
            await API.put(`/appointments/${id}/complete`);
            setAppointments((prev) =>
                prev.map((a) => (a._id === id ? { ...a, status: 'completed' } : a))
            );
            toast.success('Marked as completed');
        } catch {
            toast.error('Failed to update');
        }
    };

    return (
        <div className="page-content">
            <div className="page-header">
                <h1>Doctor <span className="text-gradient">Dashboard</span></h1>
                <p>Manage your appointments and patient consultations</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue"><FiCalendar /></div>
                    <div>
                        <div className="stat-value">{upcoming.length}</div>
                        <div className="stat-label">Upcoming</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><FiCheckCircle /></div>
                    <div>
                        <div className="stat-value">{completed.length}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple"><FiUser /></div>
                    <div>
                        <div className="stat-value">{appointments.length}</div>
                        <div className="stat-label">Total Patients</div>
                    </div>
                </div>
            </div>

            <div className="tabs" style={{ maxWidth: '400px' }}>
                {['upcoming', 'completed', 'all'].map((f) => (
                    <button
                        key={f}
                        className={`tab ${filter === f ? 'active' : ''}`}
                        onClick={() => {
                            if (f === 'upcoming') {
                                navigate('/doctor-dashboard');
                            } else if (f === 'all') {
                                navigate('/doctor-appointments');
                            } else if (f === 'completed') {
                                navigate('/doctor-appointments', { state: { filter: 'completed' } });
                            }
                        }}
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
                    <h3>No {filter} appointments</h3>
                    <p>Patient bookings will appear here</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {filtered.map((apt) => {
                        const patientName = apt.patient?.name || 'Patient';
                        const initials = patientName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                        const dateObj = new Date(apt.date);
                        const formattedDate = dateObj.toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                        });
                        const statusColors = { upcoming: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' };

                        return (
                            <div key={apt._id} className="appointment-card">
                                <div className="flex" style={{ padding: '16px', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="doctor-avatar" style={{ width: 44, height: 44, fontSize: '1rem', background: 'linear-gradient(135deg, var(--teal), var(--purple))' }}>
                                            {initials}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{patientName}</div>
                                            <div className="text-secondary text-sm">{apt.patient?.email}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 flex-wrap">
                                        <span className="doctor-meta-item"><FiCalendar /> {formattedDate}</span>
                                        <span className="doctor-meta-item"><FiClock /> {apt.startTime} – {apt.endTime}</span>
                                        <span className={`badge ${statusColors[apt.status]}`}>{apt.status}</span>
                                    </div>

                                    {apt.symptoms?.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            <span className="text-secondary text-xs" style={{ alignSelf: 'center' }}>Symptoms:</span>
                                            {apt.symptoms.map((s) => (
                                                <span key={s} className="symptom-tag" style={{ cursor: 'default', fontSize: '0.72rem' }}>{s}</span>
                                            ))}
                                        </div>
                                    )}

                                    {apt.notes && (
                                        <div className="text-secondary text-sm" style={{ fontStyle: 'italic', flex: '0 0 100%' }}>
                                            📝 {apt.notes}
                                        </div>
                                    )}

                                    {apt.status === 'upcoming' && (
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleComplete(apt._id)}
                                        >
                                            <FiCheckCircle /> Mark Complete
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
