import { version } from '../package.json';
import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators';
import { provide } from '@lit/context';
import { HomeAssistant } from 'custom-card-helpers';
import { MediaPlayer } from '@/components/media-player';
import { IsRoutable } from '@/mixins';
import { getNavbarTemplates } from '@/utils';
import { NavbarCardConfig } from '@/types';
import { navbarContext, NavbarContextDef } from './navbar-card.types';

// Register in HA card list
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'navbar-card',
  name: 'Navbar card',
  preview: true,
  description:
    'Full-width bottom nav on mobile and flexible desktop nav that can be placed on any side.',
});

console.info(
  `%c navbar-card%cv${version} `,
  // Card name styles
  `background-color: #555;
      padding: 6px 8px;
      padding-right: 6px;
      color: #fff;
      font-weight: 800;
      font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
      text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3);
      border-radius: 16px 0 0 16px;`,

  // Card version styles
  `background-color:rgb(0, 135, 197);
      padding: 6px 8px;
      padding-left: 6px;
      color: #fff;
      font-weight: 800;
      font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
      text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3);
      border-radius: 0 16px 16px 0;`,
);

@customElement('navbar-element')
export class NavbarCard extends LitElement {
  private _routes: IsRoutable[] = [];
  private readonly _mediaPlayer = new MediaPlayer();

  /**
   * Provides the navigation bar context to child components.
   */
  @provide({ context: navbarContext })
  @property({ attribute: false })
  context!: NavbarContextDef;

  /**
   * Updates the Home Assistant instance in the context.
   *
   * This setter is called automatically by the HA runtime
   * whenever the `hass` object changes, ensuring all
   * consumers of the context receive the updated instance.
   *
   * @param hass - The current Home Assistant instance
   */
  set hass(hass: HomeAssistant) {
    this.context.hass = hass;
  }

  /** Returns true if card is in *any* edit or preview mode */
  get isInEditMode(): boolean {
    const { isEditingDashboard, isEditingCard, isPreviewing } =
      this.context.modes;
    return !!isEditingDashboard || !!isEditingCard || !!isPreviewing;
  }

  /** Stub config shown in HA card picker */
  // static getStubConfig(): NavbarCardConfig {
  //     return STUB_CONFIG;
  // }

  /** Loads config editor when card is edited */
  // static async getConfigElement() {
  //     await import('./navbar-card-editor');
  //     return document.createElement('navbar-card-editor');
  // }

  /** Called when element is added to DOM */
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this._updateDesktopFlag);

    this.context.card = this;

    this._updateEditModes();
    this._updateDesktopFlag();
  }

  /** Called when element is removed from DOM */
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._updateDesktopFlag);
  }

  /**
   * Apply new card configuration
   * @param config Card configuration
   */
  setConfig(config: NavbarCardConfig): void {
    // Check if the configuration has an template defined.
    // If so, merge the template configuration with the card configuration,
    // giving priority to the card configuration.
    if (config?.template) {
      const templates = getNavbarTemplates();

      if (templates) {
        // If we have templates, check if the defined template exists
        const templateConfig = templates[config.template];

        if (templateConfig) {
          config = {
            ...templateConfig,
            ...config,
          };
        }
      } else {
        console.warn(
          '[navbar-card] No templates configured in this dashboard. Please refer to "templates" documentation for more information.' +
            '\n\n' +
            'https://github.com/joseluis9595/lovelace-navbar-card?tab=readme-ov-file#templates\n',
        );
      }
    }
    if (!config.routes) {
      throw new Error('"routes" param is required for navbar card');
    }

    // Skip if unchanged (avoid rerenders)
    if (JSON.stringify(config) === JSON.stringify(this.config)) return;

    this._routes = config.routes.map(route => new Route(this, route));
    this.config = config;
  }

  render(): TemplateResult<1> {
    const desktopPosition =
      mapStringToEnum(
        DesktopPosition,
        this.context.config.desktop?.position as string,
      ) ?? DesktopPosition.bottom;

    const deviceClass = this.context.isDesktopView ? 'desktop' : 'mobile';
    const editClass = this.isInEditMode ? 'edit-mode' : '';
    const mobileModeClass =
      this.context.config.mobile?.mode === 'floating' ? 'floating' : '';

    return html`
      <div
        class="navbar ${editClass} ${deviceClass} ${desktopPosition} ${mobileModeClass}">
        ${this._mediaPlayer.render()}
        <ha-card
          class="navbar-card ${deviceClass} ${desktopPosition} ${mobileModeClass}">
          ${this._routes.map(route => route.render()).filter(Boolean)}
        </ha-card>
      </div>
      ${this.focusedPopup ?? html``}
    `;
  }

  /** Updates `isDesktopView` based on current window width */
  private _updateDesktopFlag = (): void => {
    const minWidth = this.context.config?.desktop?.min_width ?? 768;
    this.context.isDesktopView = window.innerWidth >= minWidth;
  };

  /** Detects edit/preview modes and updates the context */
  private _updateEditModes(): void {
    const homeAssistantRoot = document.querySelector('body > home-assistant');

    this.context.modes.isEditingDashboard =
      !!this.parentElement?.closest('hui-card-edit-mode');

    this.context.modes.isEditingCard = !!homeAssistantRoot?.shadowRoot
      ?.querySelector('hui-dialog-edit-card')
      ?.shadowRoot?.querySelector('ha-dialog');

    this.context.modes.isPreviewing =
      !!this.parentElement?.closest('.card > .preview');
  }
}
