import {
  ActionHandler,
  ActionQuickbar,
  CustomAction,
  CustomJS,
  GestureAction,
  GestureDoubleTapAction,
  GestureHoldAction,
  GestureTapAction,
  GestureType,
  Logout,
  NavigateBack,
  OpenEditMode,
  OpenPopup,
  Quickbar,
  ShowNotifications,
  ToggleMenu,
} from '@/actions';
import { Constructor } from '@/mixins';
import { Route } from 'old/components/navbar';

export const Actionable = <TBase extends Constructor>(Base: TBase) => {
  return class Actionable extends Base {
    private readonly actionRegistry: Map<CustomAction, ActionHandler> = new Map(
      [
        [CustomAction.ExecuteCustomJS, new CustomJS()],
        [CustomAction.LogoutUser, new Logout()],
        [CustomAction.NavigateBack, new NavigateBack()],
        [CustomAction.EnterEditMode, new OpenEditMode()],
        [CustomAction.OpenPopup, new OpenPopup()],
        [CustomAction.OpenQuickbar, new Quickbar()],
        [CustomAction.ShowNotifications, new ShowNotifications()],
        [CustomAction.ToggleMenu, new ToggleMenu()],
      ],
    );

    get tapAction(): GestureTapAction {
      return;
    }

    get holdAction(): GestureHoldAction {
      return;
    }

    get doubleTapAction(): GestureDoubleTapAction {
      return;
    }

    public executeGestureAction(
      target: HTMLElement,
      gestureAction: GestureAction,
    ) {
      const { action } = gestureAction;

      // Close popup if another action is triggered
      if (action?.action !== CustomAction.OpenPopup && route instanceof Route) {
        route.popup.close();
      }

      // Resolve handler dynamically
      if (
        action &&
        'action' in action &&
        this.actionRegistry.has(action.action)
      ) {
        const handler = this.actionRegistry.get(action.action)!;
        handler.run(target, gestureAction, this._navbarCard);
        return;
      }

      // fallback behavior if no handler is registered
    }

    /** Determines if haptics should be triggered */
    private _isHapticEnabled(
      gestureType: GestureType,
      isNavigation = false,
    ): boolean {
      const hapticConfig = this._navbarCard.config?.haptic;

      if (typeof hapticConfig === 'boolean') return hapticConfig;
      if (!hapticConfig) return !isNavigation;

      if (isNavigation) return hapticConfig.url ?? false;

      switch (gestureType) {
        case GestureType.Tap:
          return hapticConfig.tap_action ?? false;
        case GestureType.Hold:
          return hapticConfig.hold_action ?? false;
        case GestureType.DoubleTap:
          return hapticConfig.double_tap_action ?? false;
        default:
          return false;
      }
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
  };
};

export type IsActionable = InstanceType<ReturnType<typeof Actionable>>;
