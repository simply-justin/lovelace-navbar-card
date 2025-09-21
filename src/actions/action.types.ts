import { IsRoutable } from "@/mixins";
import { NavbarContextDef } from "@/navbar-card.types";
import { ActionConfig as HassActionConfig } from "custom-card-helpers";

/* ------------------ Navbar Action Configs ------------------ */
export enum CustomAction {
  OpenPopup = "open-popup",
  NavigateBack = "navigate-back",
  ShowNotifications = "show-notifications",
  OpenQuickbar = "quickbar",
  EnterEditMode = "open-edit-mode",
  ToggleMenu = "toggle-menu",
  LogoutUser = "logout",
  ExecuteCustomJS = "custom-js-action",
}

/** Action configs for custom navbar-card actions */
export type ActionPopup = { action: CustomAction.OpenPopup };
export type ActionToggleMenu = { action: CustomAction.ToggleMenu };
export type ActionNavigateBack = { action: CustomAction.NavigateBack };
export type ActionShowNotifications = { action: CustomAction.ShowNotifications };
export type ActionQuickbar = {
  action: CustomAction.OpenQuickbar;
  mode?: "commands" | "devices" | "entities";
};
export type ActionEnterEditMode = { action: CustomAction.EnterEditMode };
export type ActionLogout = { action: CustomAction.LogoutUser };
export type ActionExecuteJS = {
  action: CustomAction.ExecuteCustomJS;
  code: JSTemplate;
};

/** Union of all navbar custom actions */
export type NavbarActionConfig =
  | ActionPopup
  | ActionToggleMenu
  | ActionNavigateBack
  | ActionShowNotifications
  | ActionQuickbar
  | ActionEnterEditMode
  | ActionLogout
  | ActionExecuteJS;

/** Extended action config = Hass actions + navbar-card custom actions */
export type ExtendedActionConfig = HassActionConfig | NavbarActionConfig;

/* ------------------ Gestures ------------------ */
export enum GestureType {
  Tap = "tap",
  Hold = "hold",
  DoubleTap = "double-tap",
}

export type GestureTapAction = { type: GestureType.Tap };
export type GestureHoldAction = { type: GestureType.Hold };
export type GestureDoubleTapAction = { type: GestureType.DoubleTap };

export type GestureAction<TConfig extends ExtendedActionConfig = ExtendedActionConfig> =
  | (GestureTapAction & { action: TConfig })
  | (GestureHoldAction & { action: TConfig })
  | (GestureDoubleTapAction & { action: TConfig });

/* ------------------ Registry Map ------------------ */
export type ActionRegistryMap = {
  [CustomAction.ExecuteCustomJS]: ActionHandler<ActionExecuteJS>;
  [CustomAction.LogoutUser]: ActionHandler<ActionLogout>;
  [CustomAction.NavigateBack]: ActionHandler<ActionNavigateBack>;
  [CustomAction.EnterEditMode]: ActionHandler<ActionEnterEditMode>;
  [CustomAction.OpenPopup]: ActionHandler<ActionPopup, [IsRoutable]>;
  [CustomAction.OpenQuickbar]: ActionHandler<ActionQuickbar>;
  [CustomAction.ShowNotifications]: ActionHandler<ActionShowNotifications>;
  [CustomAction.ToggleMenu]: ActionHandler<ActionToggleMenu>;
};

/* ------------------ Action Handler ------------------ */
export interface ActionHandler<TConfig extends ExtendedActionConfig = ExtendedActionConfig, TArgs extends unknown[] = []> {
  run(context: NavbarContextDef, target: HTMLElement, gesture: GestureAction<TConfig>, ...args: TArgs): void;
}
