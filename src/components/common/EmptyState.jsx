import '../../styles/empty-state.css';

export default function EmptyState({
  icon = '📦',
  title = 'No items found',
  message = 'Try adjusting your filters or search criteria.',
  action = null,
  size = 'medium' // 'small', 'medium', 'large'
}) {
  return (
    <div className={`empty-state empty-state-${size}`} role="status" aria-live="polite">
      <div className="empty-state-icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && (
        <div className="empty-state-action">
          {action}
        </div>
      )}
    </div>
  );
}
