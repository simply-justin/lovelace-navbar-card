import { GestureAction, ActionHandler, ActionShowNotifications } from '@/actions';
import { fireDOMEvent } from '@/utils';
import { NavbarContextDef } from '@/navbar-card.types';

export class ShowNotifications implements ActionHandler<ActionShowNotifications> {
  run(
    context: NavbarContextDef,
    target: HTMLElement,
    gesture: GestureAction,
  ): void {
    fireDOMEvent(context.card, 'hass-show-notifications', {
      bubbles: true,
      composed: true,
    });
  }
}
