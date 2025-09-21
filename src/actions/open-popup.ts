import { NavbarContextDef } from '@/navbar-card';
import { GestureAction, ActionHandler, ActionPopup } from '@/actions';
import { IsRoutable } from '@/mixins';

export class OpenPopup implements ActionHandler<ActionPopup, [IsRoutable]> {
  run(
    context: NavbarContextDef,
    target: HTMLElement,
    gesture: GestureAction,
    route: IsRoutable
  ): void {
    if ('popup' in route) {
        route.popup.open(target);
    }
  }
}
