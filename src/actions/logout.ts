import { ActionHandler, ActionLogout, GestureAction } from '@/actions';
import { NavbarContextDef } from '@/navbar-card.types';

export class Logout implements ActionHandler<ActionLogout> {
  run(
    context: NavbarContextDef,
    target: HTMLElement,
    gesture: GestureAction,
  ): void {
    context.card.hass.auth.revoke();
  }
}
