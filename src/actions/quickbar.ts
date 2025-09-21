import { NavbarContextDef } from '@/navbar-card';
import { GestureAction, ActionHandler, ActionQuickbar } from '@/actions';
import { fireDOMEvent } from '@/utils';

export class Quickbar implements ActionHandler<ActionQuickbar> {
  run(
    context: NavbarContextDef,
    target: HTMLElement,
    gesture: GestureAction,
  ): void {
    fireDOMEvent<'KeyboardEvent'>(
      context.card,
      'keydown',
      {
        bubbles: true,
        composed: true,
        key: this._getQuickbarKey(gesture as ActionQuickbar),
      },
      undefined,
      KeyboardEvent,
    );
  }

  /** Map quickbar mode → shortcut key */
  private _getQuickbarKey(action: ActionQuickbar): string {
    switch (action.mode) {
      case 'devices':
        return 'd';
      case 'entities':
        return 'e';
      case 'commands':
      default:
        return 'c';
    }
  }
}
