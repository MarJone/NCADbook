export default function LoadingSkeleton({ type = 'card', count = 3 }) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="skeleton-card">
            <div className="skeleton-image" />
            <div className="skeleton-content">
              <div className="skeleton-title" />
              <div className="skeleton-text" />
              <div className="skeleton-text" style={{ width: '70%' }} />
              <div className="skeleton-button" />
            </div>
          </div>
        );

      case 'table-row':
        return (
          <tr className="skeleton-row">
            <td><div className="skeleton-text" /></td>
            <td><div className="skeleton-text" style={{ width: '60%' }} /></td>
            <td><div className="skeleton-text" style={{ width: '80%' }} /></td>
            <td><div className="skeleton-text" style={{ width: '50%' }} /></td>
            <td><div className="skeleton-button" /></td>
          </tr>
        );

      case 'list-item':
        return (
          <div className="skeleton-list-item">
            <div className="skeleton-text" />
            <div className="skeleton-text" style={{ width: '80%' }} />
          </div>
        );

      default:
        return (
          <div className="skeleton-block">
            <div className="skeleton-text" />
            <div className="skeleton-text" style={{ width: '90%' }} />
            <div className="skeleton-text" style={{ width: '75%' }} />
          </div>
        );
    }
  };

  return (
    <div className="loading-skeleton" aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}
