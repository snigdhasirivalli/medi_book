import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiLock, FiSave } from 'react-icons/fi';

export default function Profile() {
    const { user, updateProfile } = useAuth();
    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
    const [saving, setSaving] = useState(false);
    const [changingPw, setChangingPw] = useState(false);

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return toast.error('Name cannot be empty');
        setSaving(true);
        try {
            await updateProfile({ name: form.name, phone: form.phone });
            toast.success('Profile updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!pwForm.newPassword) return toast.error('Please enter a new password');
        if (pwForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
        
        setChangingPw(true);
        try {
            await updateProfile({ password: pwForm.newPassword });
            toast.success('Password changed successfully! 🎉');
            setPwForm({ currentPassword: '', newPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setChangingPw(false);
        }
    };

    const roleColors = {
        patient: 'badge-blue',
        doctor: 'badge-teal',
        admin: 'badge-purple',
    };

    return (
        <div className="page-content">
            <div className="page-header">
                <h1>My <span className="text-gradient">Profile</span></h1>
                <p>Manage your account information</p>
            </div>

            <div className="grid-2 gap-6">
                {/* Profile Card */}
                <div>
                    <div className="card mb-4">
                        <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                            <div
                                className="doctor-avatar"
                                style={{
                                    width: 80, height: 80, fontSize: '1.8rem',
                                    margin: '0 auto 16px',
                                    background: 'linear-gradient(135deg, var(--accent), var(--teal))',
                                }}
                            >
                                {initials}
                            </div>
                            <h2 style={{ fontWeight: 800, marginBottom: '4px' }}>{user?.name}</h2>
                            <div className="text-secondary text-sm mb-3">{user?.email}</div>
                            <span className={`badge ${roleColors[user?.role] || 'badge-blue'}`} style={{ fontSize: '0.85rem', padding: '6px 16px' }}>
                                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                            </span>
                        </div>

                        <div className="divider" />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="flex items-center gap-3">
                                <FiUser style={{ color: 'var(--text-muted)' }} />
                                <div>
                                    <div className="text-secondary text-xs">Full Name</div>
                                    <div style={{ fontWeight: 600 }}>{user?.name}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FiMail style={{ color: 'var(--text-muted)' }} />
                                <div>
                                    <div className="text-secondary text-xs">Email</div>
                                    <div style={{ fontWeight: 600 }}>{user?.email}</div>
                                </div>
                            </div>
                            {user?.phone && (
                                <div className="flex items-center gap-3">
                                    <FiPhone style={{ color: 'var(--text-muted)' }} />
                                    <div>
                                        <div className="text-secondary text-xs">Phone</div>
                                        <div style={{ fontWeight: 600 }}>{user?.phone}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div>
                    <div className="card mb-4">
                        <h3 className="section-title">Edit Profile</h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <div className="form-input-icon">
                                    <FiUser className="icon" />
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <div className="form-input-icon">
                                    <FiPhone className="icon" />
                                    <input
                                        type="tel"
                                        className="form-input"
                                        placeholder="+91 9876543210"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="form-input-icon">
                                    <FiMail className="icon" />
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={user?.email}
                                        disabled
                                        style={{ opacity: 0.6 }}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>

                    <div className="card">
                        <h3 className="section-title">Account Security</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <div className="form-input-icon">
                                    <FiLock className="icon" />
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="••••••••"
                                        value={pwForm.currentPassword}
                                        onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <div className="form-input-icon">
                                    <FiLock className="icon" />
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="Min 6 characters"
                                        value={pwForm.newPassword}
                                        onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button
                                className="btn btn-secondary"
                                onClick={handleChangePassword}
                                disabled={changingPw}
                            >
                                <FiLock /> {changingPw ? 'Updating...' : 'Change Password'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
