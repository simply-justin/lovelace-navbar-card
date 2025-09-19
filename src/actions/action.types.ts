import { ActionConfig as HassActionConfig } from "custom-card-helpers";

/** Gesture types (from user input) */
export enum GestureType {
  Tap = "tap",
  Hold = "hold",
  DoubleTap = "double-tap",
}

export type GestureTapAction = { type: GestureType.Tap } & ExtendedActionConfig;
export type GestureHoldAction = { type: GestureType.Hold } & ExtendedActionConfig;
export type GestureDoubleTapAction = { type: GestureType.DoubleTap } & ExtendedActionConfig;

export type GestureAction =
  | GestureTapAction
  | GestureHoldAction
  | GestureDoubleTapAction;

/** Supported custom actions (navbar-card specific) */
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

type JSTemplate = string;
type JSTemplatable<T> = JSTemplate | T;

/** Every action handler must implement this */
export interface ActionHandler {
  run(target: HTMLElement, gesture: GestureAction, card: any): void;
}