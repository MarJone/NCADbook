import '../../styles/booking-progress.css';

export default function BookingProgress({ currentStep, steps, onStepClick }) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="booking-progress" role="navigation" aria-label="Booking progress">
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          role="progressbar"
          aria-valuenow={currentStepIndex + 1}
          aria-valuemin={1}
          aria-valuemax={steps.length}
        />
      </div>

      <div className="progress-steps">
        {steps.map((step, index) => {
          const isComplete = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isClickable = isComplete && onStepClick;

          return (
            <div
              key={step.id}
              className={`progress-step ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''} ${isClickable ? 'clickable' : ''}`}
              onClick={() => isClickable && onStepClick(step.id)}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={(e) => {
                if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onStepClick(step.id);
                }
              }}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div className="step-indicator">
                {isComplete ? (
                  <span className="step-check">✓</span>
                ) : (
                  <span className="step-number">{index + 1}</span>
                )}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
