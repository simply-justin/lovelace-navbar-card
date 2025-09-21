import { NavbarContextDef } from '@/navbar-card';
import { GestureAction, ActionHandler, ActionEnterEditMode } from '@/actions';
import { forceOpenEditMode } from '@/utils';

export class EnterEditMode implements ActionHandler<ActionEnterEditMode> {
  run(
    context: NavbarContextDef,
    target: HTMLElement,
    gesture: GestureAction,
  ): void {
    forceOpenEditMode();
  }
}
