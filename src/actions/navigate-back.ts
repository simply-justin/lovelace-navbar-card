import { NavbarContextDef } from '@/navbar-card';
import { GestureAction, ActionHandler, ActionNavigateBack } from '@/actions';

export class NavigateBack implements ActionHandler<ActionNavigateBack> {
  run(
    context: NavbarContextDef,
    target: HTMLElement,
    gesture: GestureAction,
  ): void {
    window.history.back();
  }
}
