import { ActionConfig } from 'custom-card-helpers';
import { GestureAction, ActionHandler } from '@/actions';
import { fireDOMEvent } from '@/utils';
import { NavbarContextDef } from '@/navbar-card.types';

export class HaAction implements ActionHandler<ActionConfig> {
  run(
    context: NavbarContextDef,
    target: HTMLElement,
    gesture: GestureAction,
  ): void {
    // Slight delay before dispatching to prevent event conflicts
    setTimeout(() => {
      fireDOMEvent(
        context.card,
        'hass-action',
        { bubbles: true, composed: true },
        {
          action: gesture.type,
          config: { [`${gesture.type}_action`]: gesture.action },
        },
      );
    }, 10);
  }
}
