export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder,
  disabled = false,
  options = [], // For select fields
  rows = 4, // For textarea
  helpText,
  ...rest
}) {
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const helpTextId = `${fieldId}-help`;

  const renderField = () => {
    const commonProps = {
      id: fieldId,
      name,
      value,
      onChange,
      onBlur,
      disabled,
      required,
      placeholder,
      'aria-invalid': error ? 'true' : 'false',
      'aria-describedby': [
        error ? errorId : null,
        helpText ? helpTextId : null
      ].filter(Boolean).join(' '),
      'data-testid': `input-${name}`,
      ...rest
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
            className={`form-textarea ${error ? 'error' : ''}`}
          />
        );

      case 'select':
        return (
          <select
            {...commonProps}
            className={`form-select ${error ? 'error' : ''}`}
          >
            <option value="">Select...</option>
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
      case 'email':
      case 'number':
      case 'password':
      case 'text':
      default:
        return (
          <input
            {...commonProps}
            type={type}
            className={`form-input ${error ? 'error' : ''}`}
          />
        );
    }
  };

  return (
    <div className="form-field">
      <label htmlFor={fieldId} className="form-label">
        {label}
        {required && <span className="required-indicator" aria-label="required">*</span>}
      </label>

      {renderField()}

      {helpText && (
        <p id={helpTextId} className="form-help-text">
          {helpText}
        </p>
      )}

      {error && (
        <p id={errorId} className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
