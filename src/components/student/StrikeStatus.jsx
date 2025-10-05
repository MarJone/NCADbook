import React, { useState, useEffect } from 'react';
import { getStrikeStatus } from '../../services/strike.service';
import '../../styles/strike-status.css';

export default function StrikeStatus({ studentId }) {
  const [strikeData, setStrikeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (studentId) {
      loadStrikeStatus();
    }
  }, [studentId]);

  const loadStrikeStatus = async () => {
    try {
      setLoading(true);
      const status = await getStrikeStatus(studentId);

      setStrikeData({
        strikeCount: status.strikeCount,
        blacklistUntil: status.blacklistUntil,
        history: status.history || []
      });
    } catch (err) {
      console.error('Error loading strike status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (!strikeData) return null;

  const { strikeCount, blacklistUntil, history } = strikeData;
  const isRestricted = blacklistUntil && new Date(blacklistUntil) > new Date();

  // Don't show anything if no strikes
  if (strikeCount === 0 && !isRestricted) return null;

  const getStrikeMessage = () => {
    if (strikeCount === 1) {
      return {
        title: "First Strike Warning",
        message: "You have received 1 strike for late equipment return. Please return equipment on time to avoid further restrictions.",
        severity: "warning"
      };
    } else if (strikeCount === 2) {
      return {
        title: "Second Strike - Account Restricted",
        message: isRestricted
          ? `Your booking privileges are restricted until ${new Date(blacklistUntil).toLocaleDateString()}. One more late return will result in a longer restriction.`
          : "You have 2 strikes. Please return equipment on time to avoid a third strike.",
        severity: "error"
      };
    } else if (strikeCount >= 3) {
      return {
        title: "Third Strike - Extended Restriction",
        message: isRestricted
          ? `Your account is restricted until ${new Date(blacklistUntil).toLocaleDateString()}. Please contact the equipment office for assistance.`
          : "You have reached 3 strikes. Please contact the equipment office.",
        severity: "error"
      };
    }
  };

  const strikeMessage = getStrikeMessage();

  return (
    <div className={`strike-status-banner ${strikeMessage.severity}`}>
      <div className="strike-status-content">
        <div className="strike-icon">
          {strikeCount === 1 ? '⚠️' : '🚫'}
        </div>
        <div className="strike-info">
          <h4>{strikeMessage.title}</h4>
          <p>{strikeMessage.message}</p>
          <button
            className="view-history-btn"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide Details' : 'View Strike Details'}
          </button>
        </div>
        <div className="strike-counter">
          <div className="strike-circles">
            <div className={`strike-circle ${strikeCount >= 1 ? 'active' : ''}`}>1</div>
            <div className={`strike-circle ${strikeCount >= 2 ? 'active' : ''}`}>2</div>
            <div className={`strike-circle ${strikeCount >= 3 ? 'active' : ''}`}>3</div>
          </div>
        </div>
      </div>

      {showHistory && history.length > 0 && (
        <div className="strike-history-details">
          <h5>Strike History</h5>
          {history.map((strike, index) => (
            <div key={strike.id} className="strike-detail-item">
              <div className="strike-detail-header">
                <span className="strike-number">Strike #{strike.strike_number}</span>
                <span className="strike-date">
                  {new Date(strike.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="strike-reason">{strike.reason}</p>
              <p className="strike-meta">
                Equipment was {strike.days_overdue} day(s) overdue
                {strike.restriction_days > 0 && ` • ${strike.restriction_days} day restriction applied`}
              </p>
            </div>
          ))}
          <div className="strike-help-text">
            <strong>How to avoid future strikes:</strong>
            <ul>
              <li>Return equipment by the agreed date and time</li>
              <li>Contact staff in advance if you need an extension</li>
              <li>Check your booking calendar regularly for upcoming returns</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
