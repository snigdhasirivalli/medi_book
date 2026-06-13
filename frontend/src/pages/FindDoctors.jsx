import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { FiSearch, FiStar, FiMapPin, FiClock, FiFilter, FiX } from 'react-icons/fi';

const COMMON_SYMPTOMS = [
  'fever', 'cough', 'headache', 'chest pain', 'stomach pain',
  'skin rash', 'joint pain', 'back pain', 'migraine', 'cold',
  'anxiety', 'acidity', 'dizziness', 'fatigue', 'eye pain',
];

export default function FindDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [suggestedSpecialties, setSuggestedSpecialties] = useState([]);
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const navigate = useNavigate();

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSymptoms.length) params.symptoms = selectedSymptoms.join(',');
      if (specialtyFilter) params.specialty = specialtyFilter;
      if (searchText) params.search = searchText;

      const { data } = await API.get('/doctors', { params });
      setDoctors(data.doctors || []);
      setSuggestedSpecialties(data.suggestedSpecialties || []);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, [selectedSymptoms, specialtyFilter, searchText]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const toggleSymptom = (sym) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Find the Right <span className="text-gradient">Doctor</span></h1>
        <p>Describe your symptoms and we'll match you with the best specialists</p>
      </div>

      {/* Search Box */}
      <div className="search-box" style={{ maxWidth: '100%', marginBottom: '24px' }}>
        <div className="search-input-wrap">
          <FiSearch style={{ color: 'var(--text-muted)', fontSize: '1.1rem', flexShrink: 0 }} />
          <input
            className="search-input"
            placeholder="Search doctor name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSearchText(searchQuery)}
          />
          <button className="btn btn-primary" onClick={() => setSearchText(searchQuery)}>Search</button>
        </div>

        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select your symptoms:
          </div>
          <div className="symptom-chips">
            {COMMON_SYMPTOMS.map((sym) => (
              <button
                key={sym}
                className={`symptom-tag ${selectedSymptoms.includes(sym) ? 'active' : ''}`}
                onClick={() => toggleSymptom(sym)}
              >
                {sym}
                {selectedSymptoms.includes(sym) && <FiX style={{ marginLeft: '4px' }} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Suggested Specialties */}
      {suggestedSpecialties.length > 0 && (
        <div className="card" style={{ marginBottom: '20px', background: 'var(--accent-light)', border: '1px solid rgba(59,130,246,0.3)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px' }}>
            💡 Recommended Specialties for your symptoms:
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedSpecialties.map((sp) => (
              <button
                key={sp}
                className={`badge badge-blue`}
                style={{ cursor: 'pointer', padding: '6px 14px' }}
                onClick={() => setSpecialtyFilter(sp === specialtyFilter ? '' : sp)}
              >
                {sp}
                {specialtyFilter === sp && <FiX style={{ marginLeft: '4px' }} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="section-title" style={{ marginBottom: 0 }}>
          {loading ? 'Searching...' : `${doctors.length} Doctor${doctors.length !== 1 ? 's' : ''} Found`}
          {selectedSymptoms.length > 0 && (
            <span className="badge badge-purple" style={{ marginLeft: '10px' }}>
              Symptom match
            </span>
          )}
        </div>
        {(selectedSymptoms.length > 0 || specialtyFilter || searchText) && (
          <button
            className="btn btn-secondary btn-sm gap-2"
            onClick={() => { setSelectedSymptoms([]); setSpecialtyFilter(''); setSearchText(''); setSearchQuery(''); }}
          >
            <FiFilter /> Clear Filters
          </button>
        )}
      </div>

      {/* Doctor Grid */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : doctors.length === 0 ? (
        <div className="empty-state card">
          <div className="icon">🔍</div>
          <h3>No doctors found</h3>
          <p>Try different symptoms or clear your filters</p>
        </div>
      ) : (
        <div className="grid-auto">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor._id}
              doctor={doctor}
              hasSymptoms={selectedSymptoms.length > 0}
              onClick={() => navigate(`/doctors/${doctor._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DoctorCard({ doctor, hasSymptoms, onClick }) {
  const name = doctor.user?.name || 'Doctor';
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="doctor-card" onClick={onClick}>
      <div className="flex gap-3 mb-3">
        <div className="doctor-avatar">{initials}</div>
        <div className="doctor-info">
          <div className="doctor-name">{name}</div>
          <div className="doctor-specialty">{doctor.specialty}</div>
          <div className="rating mt-1">
            <FiStar className="star" style={{ color: 'var(--orange)', fill: 'var(--orange)' }} />
            <span className="score">{doctor.rating?.toFixed(1)}</span>
            <span className="count">({doctor.reviewCount} reviews)</span>
          </div>
        </div>
      </div>

      <div className="doctor-meta">
        {doctor.experience > 0 && (
          <span className="doctor-meta-item">
            🏆 {doctor.experience} yrs exp
          </span>
        )}
        {doctor.location && (
          <span className="doctor-meta-item">
            <FiMapPin /> {doctor.location}
          </span>
        )}
        {doctor.hospital && (
          <span className="doctor-meta-item">
            🏥 {doctor.hospital}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="badge badge-green">₹{doctor.consultationFee} / visit</span>
        {hasSymptoms && doctor.matchScore !== undefined && (
          <span className={`badge ${doctor.matchScore > 50 ? 'badge-blue' : 'badge-orange'}`}>
            {doctor.matchScore}% match
          </span>
        )}
      </div>

      {hasSymptoms && doctor.matchScore !== undefined && (
        <div className="match-bar mt-3">
          <div className="match-bar-fill" style={{ width: `${doctor.matchScore}%` }} />
        </div>
      )}

      {doctor.symptomsHandled?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {doctor.symptomsHandled.slice(0, 3).map((s) => (
            <span key={s} className="symptom-tag" style={{ fontSize: '0.7rem', padding: '2px 8px', cursor: 'default' }}>
              {s}
            </span>
          ))}
          {doctor.symptomsHandled.length > 3 && (
            <span className="symptom-tag" style={{ fontSize: '0.7rem', padding: '2px 8px', cursor: 'default' }}>
              +{doctor.symptomsHandled.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
