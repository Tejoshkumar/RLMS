import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthStore.jsx'

export default function Profile() {
  const { currentUser, updateProfile, changePassword, logout } = useAuth()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  if (!currentUser) {
    navigate('/login', { replace: true })
    return null
  }

  function handleProfileChange(e) {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    })
  }

  function handlePasswordChange(e) {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSavingProfile(true)

    try {
      const updatedUser = await updateProfile({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
      })

      setProfileData({
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone || '',
      })
      setEditing(false)
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err.message || 'Could not update your profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setError('Please fill all password fields.')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    setSavingPassword(true)
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      setChangingPassword(false)
      setSuccess('Password changed successfully.')
    } catch (err) {
      setError(err.message || 'Could not change your password.')
    } finally {
      setSavingPassword(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function formatDate(date) {
    if (!date) return 'Not available'

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="profile-page">

      {/* Profile Header */}
      <div className="profile-header">
        <div>
          <p className="profile-kicker">ACCOUNT</p>
          <h2>My Profile</h2>
          <p className="profile-description">
            Manage your personal information and account security.
          </p>
        </div>

        <div className="profile-avatar">
          {currentUser.name?.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="profile-message profile-error">
          {error}
        </div>
      )}

      {success && (
        <div className="profile-message profile-success">
          {success}
        </div>
      )}

      {/* Personal Information */}
      <section className="profile-card">

        <div className="profile-card-header">
          <div>
            <h3>Personal Information</h3>
            <p>Your registered account details</p>
          </div>

          {!editing && (
            <button
              className="btn btn-amber"
              onClick={() => {
                setEditing(true)
                setError('')
                setSuccess('')
              }}
            >
              Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSaveProfile}>

            <div className="profile-form-grid">

              <div className="field">
                <label htmlFor="profile-name">Name</label>
                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="profile-email">Email</label>
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="profile-phone">Phone</label>
                <input
                  id="profile-phone"
                  name="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="Enter phone number"
                />
              </div>

            </div>

            <div className="profile-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setProfileData({
                    name: currentUser.name || '',
                    email: currentUser.email || '',
                    phone: currentUser.phone || '',
                  })
                  setEditing(false)
                }}
                disabled={savingProfile}
              >
                Cancel
              </button>

              <button type="submit" className="btn btn-amber" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </form>
        ) : (
          <div className="profile-details">

            <div className="profile-detail">
              <span className="profile-detail-label">Name</span>
              <strong>{currentUser.name}</strong>
            </div>

            <div className="profile-detail">
              <span className="profile-detail-label">Email</span>
              <strong>{currentUser.email}</strong>
            </div>

            <div className="profile-detail">
              <span className="profile-detail-label">Phone</span>
              <strong>
                {currentUser.phone || 'Not provided'}
              </strong>
            </div>

            <div className="profile-detail">
              <span className="profile-detail-label">Role</span>
              <strong className="profile-role">
                {currentUser.role}
              </strong>
            </div>

            <div className="profile-detail">
              <span className="profile-detail-label">
                Account Created
              </span>
              <strong>
                {formatDate(currentUser.createdAt)}
              </strong>
            </div>

          </div>
        )}

      </section>

      {/* Security */}
      <section className="profile-card">

        <div className="profile-card-header">
          <div>
            <h3>Account Security</h3>
            <p>Manage your account password</p>
          </div>

          {!changingPassword && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setChangingPassword(true)
                setError('')
                setSuccess('')
              }}
            >
              Change Password
            </button>
          )}
        </div>

        {changingPassword && (
          <form onSubmit={handleChangePassword}>

            <div className="profile-password-form">

              <div className="field">
                <label htmlFor="currentPassword">
                  Current Password
                </label>

                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="newPassword">
                  New Password
                </label>

                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="field">
                <label htmlFor="confirmPassword">
                  Confirm New Password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                />
              </div>

            </div>

            <div className="profile-actions">

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setChangingPassword(false)}
                disabled={savingPassword}
              >
                Cancel
              </button>

              <button type="submit" className="btn btn-amber" disabled={savingPassword}>
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>

            </div>

          </form>
        )}

      </section>

      {/* Logout */}
      <section className="profile-logout-section">

        <div>
          <h3>Logout</h3>
          <p>Sign out from your railway locker account.</p>
        </div>

        <button
          className="profile-logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </section>

    </div>
  )
}