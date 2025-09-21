import { NavbarContextDef } from '@/navbar-card';
import { GestureAction, ActionHandler, ActionExecuteJS } from '@/actions';
import { processTemplate } from '@/utils';

export class CustomJS implements ActionHandler<ActionExecuteJS> {
  run(
    context: NavbarContextDef,
    target: HTMLElement,
    gesture: GestureAction
  ): void {
    processTemplate<string>(
      context.card.hass,
      context.card,
      (gesture as ActionExecuteJS).code,
    );
  }
}
