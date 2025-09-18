import { Constructor } from '@/mixins';

export const Actionable = <TBase extends Constructor>(Base: TBase) => {
  return class Actionable extends Base {
    get tapAction() {
      return;
    }

    get holdAction() {
      return;
    }

    get doubleTapAction() {
      return;
    }

    public execute = (target: HTMLElement, action: Action) => {
      const { type, action, mode, code } = action;
    };

    private _shouldTriggerHaptic(
      actionType: 'tap' | 'hold' | 'double_tap',
      isNavigation = false,
    ): boolean {
      const hapticConfig = this._navbarCard.config?.haptic;

      // If haptic is a boolean, use it as a global setting
      if (typeof hapticConfig === 'boolean') {
        return hapticConfig;
      }

      // If no haptic config is provided, return default values
      if (!hapticConfig) {
        return !isNavigation;
      }

      // Check navigation first
      if (isNavigation) {
        return hapticConfig.url ?? false;
      }

      // Check specific action types
      switch (actionType) {
        case 'tap':
          return hapticConfig.tap_action ?? false;
        case 'hold':
          return hapticConfig.hold_action ?? false;
        case 'double_tap':
          return hapticConfig.double_tap_action ?? false;
        default:
          return false;
      }
    }

    private _chooseKeyForQuickbar = (action: QuickbarActionConfig) => {
      switch (action.mode) {
        case 'devices':
          return 'd';
        case 'entities':
          return 'e';
        case 'commands':
        default:
          return 'c';
      }
    };
  };
};

export type IsActionable = InstanceType<ReturnType<typeof Actionable>>;
