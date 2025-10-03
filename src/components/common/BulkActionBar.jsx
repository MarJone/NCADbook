export default function BulkActionBar({
  selectedCount,
  onApproveAll,
  onDenyAll,
  onClearSelection,
  loading = false,
  actions = []
}) {
  if (selectedCount === 0) return null;

  const defaultActions = [
    {
      label: 'Approve Selected',
      onClick: onApproveAll,
      className: 'btn-success',
      testId: 'bulk-approve-btn'
    },
    {
      label: 'Deny Selected',
      onClick: onDenyAll,
      className: 'btn-error',
      testId: 'bulk-deny-btn'
    }
  ];

  const displayActions = actions.length > 0 ? actions : defaultActions;

  return (
    <div className="bulk-action-bar" role="toolbar" aria-label="Bulk actions">
      <div className="bulk-action-info">
        <span className="selected-count" data-testid="selected-count">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </span>
        <button
          onClick={onClearSelection}
          className="btn-text"
          disabled={loading}
          data-testid="clear-selection-btn"
        >
          Clear selection
        </button>
      </div>

      <div className="bulk-action-buttons">
        {displayActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            disabled={loading}
            className={`btn btn-sm ${action.className || 'btn-primary'}`}
            data-testid={action.testId}
          >
            {loading ? 'Processing...' : action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
