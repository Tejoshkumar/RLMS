import { useEffect, useState } from 'react'

export default function BookingModal({
  locker,
  onClose,
  onConfirm,
}) {
  const [step, setStep] = useState('details')

  const [holderName, setHolderName] = useState('')
  const [phone, setPhone] = useState('')
  const [bookingDate, setBookingDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [durationHours, setDurationHours] = useState(1)

  const [scanning, setScanning] = useState(false)
  const [securityStatus, setSecurityStatus] = useState(null)

  useEffect(() => {
    if (!locker) return

    setStep('details')
    setScanning(false)
    setSecurityStatus(null)
  }, [locker])

  if (!locker) return null

  function handleSecurityScan() {
    setScanning(true)
    setSecurityStatus(null)

    // Simulated security screening
    setTimeout(() => {
      setScanning(false)
      setSecurityStatus('cleared')
      setStep('security')
    }, 2000)
  }

  function handleSubmit() {
    if (!holderName || !phone || !bookingDate || !startTime) {
      alert('Please fill all required fields.')
      return
    }

    if (securityStatus !== 'cleared') {
      alert('Please complete the security check first.')
      return
    }

    onConfirm({
      holderName,
      phone,
      bookingDate,
      startTime,
      durationHours: Number(durationHours),
    })
  }

  function handleClose() {
    setStep('details')
    setScanning(false)
    setSecurityStatus(null)
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="booking-modal">

        {/* HEADER */}
        <div className="modal-header">
          <div>
            <h2>
              {step === 'details'
                ? 'Book Locker'
                : 'Security Check'}
            </h2>

            <p>
              Locker {locker.code} • {locker.size}
            </p>
          </div>

          <button
            className="modal-close"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        {/* STEP 1 — BOOKING DETAILS */}
        {step === 'details' && (
          <div className="modal-body">

            <div className="form-group">
              <label>Holder Name *</label>
              <input
                type="text"
                value={holderName}
                onChange={(e) =>
                  setHolderName(e.target.value)
                }
                placeholder="Enter holder name"
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label>Booking Date *</label>
              <input
                type="date"
                value={bookingDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) =>
                  setBookingDate(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Start Time *</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) =>
                  setStartTime(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Duration</label>

              <select
                value={durationHours}
                onChange={(e) =>
                  setDurationHours(e.target.value)
                }
              >
                <option value={1}>1 Hour</option>
                <option value={2}>2 Hours</option>
                <option value={3}>3 Hours</option>
                <option value={4}>4 Hours</option>
                <option value={6}>6 Hours</option>
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours</option>
              </select>
            </div>

            {/* SECURITY NOTICE */}
            <div
              style={{
                marginTop: 16,
                padding: '12px 14px',
                borderRadius: 8,
                background: 'rgba(52, 152, 219, 0.10)',
                border: '1px solid rgba(52, 152, 219, 0.25)',
              }}
            >
              <strong>🔐 Security Screening</strong>

              <p
                style={{
                  margin: '6px 0 0',
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                Your item must pass the station security
                screening before the locker can be assigned.
              </p>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={handleClose}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                onClick={() => {
                  if (
                    !holderName ||
                    !phone ||
                    !bookingDate ||
                    !startTime
                  ) {
                    alert('Please fill all required fields.')
                    return
                  }

                  setStep('security')
                }}
              >
                Continue to Security
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — SECURITY */}
        {step === 'security' && (
          <div className="modal-body">

            <div
              style={{
                textAlign: 'center',
                padding: '20px 10px',
              }}
            >

              {!scanning && !securityStatus && (
                <>
                  <div
                    style={{
                      fontSize: 48,
                      marginBottom: 12,
                    }}
                  >
                    🔐
                  </div>

                  <h3>Security Screening Required</h3>

                  <p
                    style={{
                      color: '#666',
                      fontSize: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    Place your item for security screening
                    before confirming the locker booking.
                  </p>

                  <button
                    className="btn btn-primary"
                    onClick={handleSecurityScan}
                    style={{ marginTop: 12 }}
                  >
                    Scan Item
                  </button>
                </>
              )}

              {scanning && (
                <>
                  <div
                    style={{
                      fontSize: 48,
                      marginBottom: 12,
                    }}
                  >
                    🔍
                  </div>

                  <h3>Scanning Item...</h3>

                  <p
                    style={{
                      color: '#666',
                      fontSize: 14,
                    }}
                  >
                    Please wait while the security check
                    is being completed.
                  </p>

                  <div
                    style={{
                      marginTop: 20,
                      fontSize: 13,
                    }}
                  >
                    Security screening in progress...
                  </div>
                </>
              )}

              {!scanning &&
                securityStatus === 'cleared' && (
                  <>
                    <div
                      style={{
                        fontSize: 48,
                        marginBottom: 12,
                      }}
                    >
                      ✅
                    </div>

                    <h3>Security Check Passed</h3>

                    <p
                      style={{
                        color: '#555',
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      Item cleared for locker storage.
                    </p>

                    <div
                      style={{
                        marginTop: 16,
                        padding: '10px 14px',
                        borderRadius: 8,
                        background: 'rgba(46, 160, 67, 0.10)',
                        border:
                          '1px solid rgba(46, 160, 67, 0.25)',
                        color: '#267333',
                        fontSize: 13,
                      }}
                    >
                      Security status: <strong>Cleared</strong>
                    </div>
                  </>
                )}
            </div>

            <div className="modal-actions">

              <button
                className="btn btn-ghost"
                onClick={() => {
                  if (!scanning) {
                    setStep('details')
                    setSecurityStatus(null)
                  }
                }}
                disabled={scanning}
              >
                Back
              </button>

              {securityStatus === 'cleared' && (
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                >
                  Confirm Booking
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}