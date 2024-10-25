import { HomeAssistant } from 'custom-card-helpers';
import { css, CSSResultGroup, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

// TODO add proper typing to window
// @ts-ignore
window.customCards = window.customCards || [];
// @ts-ignore
window.customCards.push({
  type: 'navbar-card',
  name: 'Navbar card',
  preview: true,
  description:
    'Card that displays a bottom nav in mobile devices, and a side nav in desktop devices',
});

type NavbarCardConfig = {
  routes: {
    url: string;
    icon: string;
    icon_selected?: string;
  }[];
};

@customElement('navbar-card')
export class NavbarCard extends LitElement {
  @state()
  private _config?: NavbarCardConfig;

  @state()
  private hass?: HomeAssistant;

  setConfig(config) {
    this._config = config;
  }

  protected render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    const { routes } = this._config;

    // TODO this check does not update instantly when changing to edit mode in HA
    const inEditMode =
      this.parentElement?.closest('hui-card-edit-mode') !== null;

    // TODO use HA ripple effect for icon button
    return html`
      <ha-card class="container ${inEditMode ? 'relative' : 'absolute'}">
        <div class="flex-container">
          ${routes?.map((route, index) => {
            const isActive = window.location.pathname == route.url;

            return html`
              <a
                key="navbar_item_${index}"
                class="icon-button ${isActive ? 'active' : ''}"
                href="${route.url}">
                <ha-icon icon="${isActive && route.icon_selected ? route.icon_selected : route.icon}"></ha-icon>
              </div>
            `;
          })}
        </div>
      </ha-card>
    `;
  }

  static get styles(): CSSResultGroup {
    // Mobile-first css styling
    return css`
      .container {
        background: var(--card-background-color);
        border-radius: 0px;
        box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.14) !important;
      }
      .container.absolute {
        width: 100vw;
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        top: unset;
        z-index: 2;
      }
      .container.relative {
        position: relative;
      }
      .flex-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
        gap: 10px;
      }
      .icon-button {
        text-decoration: none;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        height: 50px;
        border-radius: 16px;
        --icon-primary-color: var(--state-inactive-color);
      }
      .icon-button.active {
        background: color-mix(in srgb, var(--primary-color) 30%, transparent);
        --icon-primary-color: var(--primary-color);
      }

      @media (min-width: 768px) {
        .container {
          border-radius: var(--ha-card-border-radius, 12px);
          box-shadow: var(--material-shadow-elevation-2dp) !important;
        }
        .container.absolute {
          width: auto;
          left: calc(var(--mdc-drawer-width, 0px) + 16px);
          right: unset;
          bottom: unset;
          top: 50%;
          transform: translate(0, -50%);
        }
        .flex-container {
          justify-content: space-evenly;
          flex-direction: column;
        }
        .icon-button {
          flex: unset;
          width: 60px;
          height: 60px;
        }
      }
    `;
  }
}
