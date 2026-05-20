/* Shared 4-stage stepper used across the registration funnel:
     1. Register   → /register
     2. Review     → /payment-gateway
     3. Pay        → /payment-gateway (during PayPal/Stripe checkout)
     4. Done       → /payment-success

   Vertical layout: numbered circle on top, label below. Pass `current`
   to mark the active stage; earlier stages get the "done" treatment
   (accent fill + checkmark) and later stages stay muted.
*/

type StageId = 'register' | 'review' | 'pay' | 'confirm';

const STAGES: ReadonlyArray<{ id: StageId; label: string }> = [
  { id: 'register', label: 'Register' },
  { id: 'review',   label: 'Review' },
  { id: 'pay',      label: 'Pay' },
  { id: 'confirm',  label: 'Done' },
];

export default function RegistrationStepper({ current }: { current: StageId }) {
  const currentIndex = STAGES.findIndex(s => s.id === current);
  return (
    <ol className="rx-stepper" aria-label="Registration progress">
      {STAGES.map((stage, i) => {
        const state =
          i < currentIndex ? 'done'
          : i === currentIndex ? 'current'
          : 'upcoming';
        return (
          <li
            key={stage.id}
            className={`rx-stepper-item rx-stepper-${state}`}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span className="rx-stepper-marker" aria-hidden>
              {state === 'done'
                ? <i className="fas fa-check" />
                : <span className="rx-stepper-num">{i + 1}</span>}
            </span>
            <span className="rx-stepper-label">{stage.label}</span>
            {i < STAGES.length - 1 && (
              <span className="rx-stepper-line" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
