import { GestureAction, ActionHandler, ActionToggleMenu } from '@/actions';
import { fireDOMEvent } from '@/utils';
import { NavbarContextDef } from '@/navbar-card.types';

export class ToggleMenu implements ActionHandler<ActionToggleMenu> {
  run(
    context: NavbarContextDef,
    target: HTMLElement,
    gesture: GestureAction,
  ): void {
    fireDOMEvent(context.card, 'hass-toggle-menu', {
      bubbles: true,
      composed: true,
    });
  }
}
