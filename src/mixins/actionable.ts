import {
  ActionHandler,
  CustomAction,
  CustomJS,
  GestureAction,
  GestureDoubleTapAction,
  GestureHoldAction,
  GestureTapAction,
  GestureType,
  HaAction,
  Logout,
  NavigateBack,
  EnterEditMode,
  OpenPopup,
  Quickbar,
  ShowNotifications,
  ToggleMenu,
} from '@/actions';
import { Constructor, IsRoutable } from '@/mixins';
import { forceResetRipple, hapticFeedback } from '@/utils';
import { HasContext, NavbarContextDef } from '@/navbar-card.types';

export const Actionable = <TBase extends Constructor>(Base: TBase) => {
  return class Actionable extends Base implements HasContext {
    context!: NavbarContextDef;
    readonly actionRegistry: Map<CustomAction, ActionHandler> = new Map(
      [
        [CustomAction.ExecuteCustomJS, new CustomJS()],
        [CustomAction.LogoutUser, new Logout()],
        [CustomAction.NavigateBack, new NavigateBack()],
        [CustomAction.EnterEditMode, new EnterEditMode()],
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
      route: IsRoutable
    ) {
      const { type, action } = gestureAction;

      // Force reset ripple status to prevent UI bugs
      forceResetRipple(target);

      const triggerHaptic = (strong?: boolean) => {
        if (this.#_isHapticEnabled(type, strong)) {
          hapticFeedback();
        }
      };

      // Close popup if another action is triggered
      if (action !== CustomAction.OpenPopup && 'popup' in route) {
        route.popup.close();
      }

      // Resolve handler dynamically
      if (
        action &&
        this.actionRegistry.has(action)
      ) {
        triggerHaptic();

        const handler = this.actionRegistry.get(action)!;
        handler.run(this.context, target, gestureAction);
        return;
      }

      triggerHaptic();
      new HaAction(this.context, target, gestureAction);
    }

    /** Determines if haptics should be triggered */
    #_isHapticEnabled(gestureType: GestureType, isNavigation = false): boolean {
      const hapticConfig = this.context.config?.haptic;

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
  };
};

export type IsActionable = InstanceType<ReturnType<typeof Actionable>>;
