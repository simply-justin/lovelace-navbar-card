import { NavbarContextDef } from '@/navbar-card';
import { GestureAction, ActionHandler, ActionShowNotifications } from '@/actions';
import { fireDOMEvent } from '@/utils';

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
