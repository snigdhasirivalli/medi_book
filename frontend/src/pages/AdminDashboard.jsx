import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
    FiUsers, FiActivity, FiCalendar, FiGrid,
    FiTrendingUp, FiCheckCircle, FiXCircle, FiClock
} from 'react-icons/fi';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [recentApts, setRecentApts] = useState([]);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const navigate = useNavigate();

    const getTabFromPath = () => {
        if (location.pathname.endsWith('/doctors')) return 'doctors';
        if (location.pathname.endsWith('/users')) return 'users';
        if (location.pathname.endsWith('/appointments')) return 'appointments';
        return 'overview';
    };

    const [tab, setTab] = useState(getTabFromPath());
    const [seeding, setSeeding] = useState(false);

    useEffect(() => {
        setTab(getTabFromPath());
    }, [location.pathname]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [statsRes, usersRes, doctorsRes, aptsRes] = await Promise.all([
                    API.get('/admin/stats'),
                    API.get('/admin/users'),
                    API.get('/admin/doctors'),
                    API.get('/appointments/all'),
                ]);
                setStats(statsRes.data);
                setUsers(usersRes.data);
                setDoctors(doctorsRes.data);
                setRecentApts(aptsRes.data.slice(0, 20));
            } catch {
                toast.error('Failed to load admin data');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const handleSeed = async () => {
        setSeeding(true);
        try {
            const { data } = await API.post('/admin/seed');
            toast.success(data.message);
            window.location.reload();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Seeding failed');
        } finally {
            setSeeding(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            const { data } = await API.put(`/admin/users/${id}/toggle`);
            setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: data.isActive } : u));
            toast.success(data.message);
        } catch {
            toast.error('Failed to update');
        }
    };

    if (loading) return <div className="loading-center"><div className="spinner" /></div>;

    return (
        <div className="page-content">
            <div className="page-header flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1>Admin <span className="text-gradient">Dashboard</span></h1>
                    <p>Manage the MediBook platform</p>
                </div>
                <button className="btn btn-secondary" onClick={handleSeed} disabled={seeding}>
                    {seeding ? 'Seeding...' : '🌱 Seed Sample Doctors'}
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon blue"><FiUsers /></div>
                        <div><div className="stat-value">{stats.totalPatients}</div><div className="stat-label">Patients</div></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon teal"><FiActivity /></div>
                        <div><div className="stat-value">{stats.totalDoctors}</div><div className="stat-label">Doctors</div></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon orange"><FiCalendar /></div>
                        <div><div className="stat-value">{stats.totalAppointments}</div><div className="stat-label">Total Appointments</div></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon blue"><FiClock /></div>
                        <div><div className="stat-value">{stats.upcomingAppointments}</div><div className="stat-label">Upcoming</div></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green"><FiCheckCircle /></div>
                        <div><div className="stat-value">{stats.completedAppointments}</div><div className="stat-label">Completed</div></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon red"><FiXCircle /></div>
                        <div><div className="stat-value">{stats.cancelledAppointments}</div><div className="stat-label">Cancelled</div></div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="tabs" style={{ maxWidth: '500px' }}>
                {['overview', 'doctors', 'users', 'appointments'].map((t) => (
                    <button
                        key={t}
                        className={`tab ${tab === t ? 'active' : ''}`}
                        onClick={() => {
                            if (t === 'overview') navigate('/admin');
                            else navigate(`/admin/${t}`);
                        }}
                        style={{ textTransform: 'capitalize' }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {tab === 'overview' && (
                <div className="grid-2 gap-4">
                    <div className="card">
                        <h3 className="section-title">Recent Doctors</h3>
                        {doctors.slice(0, 5).map((d) => (
                            <div key={d._id} className="flex items-center gap-3 mb-3">
                                <div className="doctor-avatar" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>
                                    {(d.user?.name || 'D').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.user?.name}</div>
                                    <div className="text-secondary text-xs">{d.specialty} · {d.location}</div>
                                </div>
                                <span className="badge badge-green" style={{ marginLeft: 'auto' }}>₹{d.consultationFee}</span>
                            </div>
                        ))}
                    </div>
                    <div className="card">
                        <h3 className="section-title">Recent Appointments</h3>
                        {recentApts.slice(0, 5).map((apt) => {
                            const statusColors = { upcoming: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' };
                            return (
                                <div key={apt._id} className="flex items-center justify-between mb-3">
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{apt.patient?.name}</div>
                                        <div className="text-secondary text-xs">{apt.doctor?.user?.name} · {apt.date}</div>
                                    </div>
                                    <span className={`badge ${statusColors[apt.status]}`}>{apt.status}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Doctors Tab */}
            {tab === 'doctors' && (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Doctor</th>
                                <th>Specialty</th>
                                <th>Location</th>
                                <th>Hospital</th>
                                <th>Fee</th>
                                <th>Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map((d) => (
                                <tr key={d._id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{d.user?.name}</div>
                                        <div className="text-secondary text-xs">{d.user?.email}</div>
                                    </td>
                                    <td><span className="badge badge-blue">{d.specialty}</span></td>
                                    <td>{d.location || '—'}</td>
                                    <td>{d.hospital || '—'}</td>
                                    <td>₹{d.consultationFee}</td>
                                    <td>⭐ {d.rating?.toFixed(1)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {doctors.length === 0 && (
                        <div className="empty-state" style={{ padding: '40px' }}>
                            <p>No doctors found. Click "Seed Sample Doctors" to add demo data.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Users Tab */}
            {tab === 'users' && (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id}>
                                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                                    <td className="text-secondary">{u.email}</td>
                                    <td>
                                        <span className={`badge ${u.role === 'admin' ? 'badge-purple' : u.role === 'doctor' ? 'badge-teal' : 'badge-blue'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                                            {u.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        {u.role !== 'admin' && (
                                            <button
                                                className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                                                onClick={() => handleToggle(u._id)}
                                            >
                                                {u.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Appointments Tab */}
            {tab === 'appointments' && (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Symptoms</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentApts.map((apt) => {
                                const statusColors = { upcoming: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' };
                                return (
                                    <tr key={apt._id}>
                                        <td style={{ fontWeight: 600 }}>{apt.patient?.name}</td>
                                        <td>
                                            <div>{apt.doctor?.user?.name}</div>
                                            <div className="text-secondary text-xs">{apt.doctor?.specialty}</div>
                                        </td>
                                        <td>{apt.date}</td>
                                        <td>{apt.startTime} – {apt.endTime}</td>
                                        <td>
                                            <div className="flex flex-wrap gap-1">
                                                {apt.symptoms?.slice(0, 2).map((s) => (
                                                    <span key={s} className="symptom-tag" style={{ fontSize: '0.68rem', cursor: 'default' }}>{s}</span>
                                                ))}
                                                {apt.symptoms?.length > 2 && <span className="text-muted text-xs">+{apt.symptoms.length - 2}</span>}
                                            </div>
                                        </td>
                                        <td><span className={`badge ${statusColors[apt.status]}`}>{apt.status}</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {recentApts.length === 0 && (
                        <div className="empty-state" style={{ padding: '40px' }}>
                            <p>No appointments yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
