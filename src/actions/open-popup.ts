import { Route } from '@/components/navbar';
import { GestureAction, ActionHandler, ActionPopup } from '@/actions';
import { IsRoutable } from '@/mixins';
import { NavbarContextDef } from '@/navbar-card.types';

export class OpenPopup implements ActionHandler<ActionPopup, [IsRoutable]> {
  run(
    context: NavbarContextDef,
    target: HTMLElement,
    gesture: GestureAction<ActionPopup>,
    route: IsRoutable
  ): void {
    if ('popup' in route) {
        (route as Route).popup.open(target);
    }
  }
}
