import { createContext } from "@lit/context";
import { HomeAssistant } from "custom-card-helpers";
import { NavbarCard } from "./navbar-card";
import { NavbarCardConfig } from "old/types";

export interface NavbarContextDef {
  hass: HomeAssistant;
  card: NavbarCard;
  config?: NavbarCardConfig;

  isDesktopView: boolean;
  modes: {
    isEditingDashboard?: boolean;
    isEditingCard?: boolean;
    isPreviewing?: boolean;
  };
}

export const navbarContext = createContext<NavbarContextDef>('ha-navbar');

export interface HasContext {
    context: NavbarContextDef
}