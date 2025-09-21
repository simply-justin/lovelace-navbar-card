import { GestureAction, ActionHandler, ActionEnterEditMode } from '@/actions';
import { forceOpenEditMode } from '@/utils';
import { NavbarContextDef } from '@/navbar-card.types';

export class EnterEditMode implements ActionHandler<ActionEnterEditMode> {
  run(
    context: NavbarContextDef,
    target: HTMLElement,
    gesture: GestureAction,
  ): void {
    forceOpenEditMode();
  }
}
