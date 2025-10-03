import { Link, useLocation } from 'react-router-dom';

export default function Breadcrumb({ customItems = null }) {
  const location = useLocation();

  // Generate breadcrumb items from URL path
  const generateBreadcrumbs = () => {
    if (customItems) {
      return customItems;
    }

    const pathnames = location.pathname.split('/').filter(x => x);
    const items = [{ label: 'Home', path: '/' }];

    let currentPath = '';
    pathnames.forEach((name, index) => {
      currentPath += `/${name}`;

      // Format the label (capitalize and remove dashes/underscores)
      const label = name
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      items.push({
        label,
        path: currentPath,
        isLast: index === pathnames.length - 1
      });
    });

    return items;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb" data-testid="breadcrumb">
      <ol className="breadcrumb-list">
        {breadcrumbs.map((item, index) => (
          <li
            key={item.path}
            className={`breadcrumb-item ${item.isLast ? 'active' : ''}`}
          >
            {item.isLast || index === breadcrumbs.length - 1 ? (
              <span aria-current="page">{item.label}</span>
            ) : (
              <>
                <Link to={item.path}>{item.label}</Link>
                <span className="breadcrumb-separator" aria-hidden="true">/</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
