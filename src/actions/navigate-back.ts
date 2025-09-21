import { GestureAction, ActionHandler, ActionNavigateBack } from '@/actions';
import { NavbarContextDef } from '@/navbar-card.types';

export class NavigateBack implements ActionHandler<ActionNavigateBack> {
  run(
    context: NavbarContextDef,
    target: HTMLElement,
    gesture: GestureAction,
  ): void {
    window.history.back();
  }
}
