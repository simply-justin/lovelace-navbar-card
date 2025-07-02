/* eslint-disable @typescript-eslint/no-explicit-any */
// Reason: Dynamic dot-notation keys for deeply nested config editing in a generic editor.
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  DesktopPosition,
  LabelVisibilityConfig,
  NavbarCardConfig,
} from './config';
import {
  DeepPartial,
  DotNotationKeys,
  genericGetProperty,
  genericSetProperty,
  NestedType,
} from './types';
import { cleanTemplate, deepMergeKeepArrays, wrapTemplate } from './utils';
import { getEditorStyles } from './styles';

enum HAActions {
  tap_action,
  hold_action,
  double_tap_action,
}

@customElement('navbar-card-editor')
export class NavbarCardEditor extends LitElement {
  @property({ attribute: false }) public hass: any;
  @state() private _config: NavbarCardConfig = { routes: [] };
  @state() _visibleSections: Record<string, boolean> = {};

  /**********************************************************************/
  /* Config mutation functions */
  /**********************************************************************/

  setConfig(config: NavbarCardConfig) {
    this._config = config;
  }

  updateConfig(newConfig: DeepPartial<NavbarCardConfig>) {
    this._config = deepMergeKeepArrays(this._config, newConfig);
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this._config },
      }),
    );
  }

  // TODO JLAQ change the type of "value"
  updateConfigByKey(
    key: DotNotationKeys<NavbarCardConfig>,
    value: NestedType<NavbarCardConfig, DotNotationKeys<NavbarCardConfig>>,
  ) {
    this._config = genericSetProperty(this._config, key, value);
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this._config },
      }),
    );
  }

  /**********************************************************************/
  /* Edition components */
  /**********************************************************************/

  makeComboBox<T>(options: {
    label: string;
    // TODO JLAQ this type T should be replaced with the value of the key in the config
    items: { label: string; value: T }[];
    configKey: DotNotationKeys<NavbarCardConfig>;
    disabled?: boolean;
  }) {
    return html`
      <ha-combo-box
        label=${options.label}
        .items=${options.items}
        .value=${genericGetProperty(this._config, options.configKey)}
        .disabled=${options.disabled}
        @value-changed="${e => {
          this.updateConfigByKey(options.configKey, e.detail.value);
        }}" />
    `;
  }

  makeTextInput(options: {
    label: string;
    configKey: DotNotationKeys<NavbarCardConfig>;
    type?: 'text' | 'number' | 'textarea' | 'url';
    disabled?: boolean;
    autocomplete?: string;
  }) {
    return html`
      <ha-textfield
        label=${options.label}
        type=${options.type}
        .value=${genericGetProperty(this._config, options.configKey) ?? ''}
        .disabled=${options.disabled}
        .autocomplete=${options.autocomplete}
        @input="${e => {
          console.log(e);
          this.updateConfigByKey(
            options.configKey,
            options.type == 'number'
              ? e.target.value == ''
                ? undefined
                : parseInt(e.target.value)
              : e.target.value,
          );
        }}" />
    `;
  }

  makeIconPicker(options: {
    label: string;
    configKey: DotNotationKeys<NavbarCardConfig>;
    disabled?: boolean;
  }) {
    return html`
      <ha-icon-picker
        label=${options.label}
        .value=${genericGetProperty(this._config, options.configKey) ?? ''}
        .disabled=${options.disabled}
        @value-changed="${e => {
          this.updateConfigByKey(options.configKey, e.detail.value);
        }}" />
    `;
  }

  makeTemplateEditor(options: {
    label: string;
    configKey: DotNotationKeys<NavbarCardConfig>;
  }) {
    return html`
      <ha-code-editor
        mode="yaml"
        autofocus
        autocomplete-entities
        autocomplete-icons
        .hass=${this.hass}
        .value=${cleanTemplate(
          (genericGetProperty(this._config, options.configKey) as string) ?? '',
        )}
        @value-changed=${e => {
          const templateValue =
            e.target.value?.trim() == '' ? null : wrapTemplate(e.target.value);
          // TODO JLAQ this throws a typescript error
          this.updateConfigByKey(options.configKey, templateValue);
        }}></ha-code-editor>
    `;
  }

  /**********************************************************************/
  /* Editor sections */
  /**********************************************************************/

  renderStylesEditor() {
    return html`
      <ha-expansion-panel outlined>
        <h4 slot="header">
          <ha-icon icon="mdi:code-braces"></ha-icon>
          CSS Styles
        </h4>
        <div class="editor-section">
          <ha-code-editor
            mode="yaml"
            autofocus
            autocomplete-entities
            autocomplete-icons
            .hass=${this.hass}
            .value=${this._config.styles}
            @value-changed=${e => {
              const trimmedStyles =
                e.target.value?.trim() == '' ? null : e.target.value;
              this.updateConfig({ styles: trimmedStyles });
            }}></ha-code-editor>
        </div>
      </ha-expansion-panel>
    `;
  }

  renderDesktopEditor() {
    return html`
      <ha-expansion-panel outlined>
        <h4 slot="header">
          <ha-icon icon="mdi:laptop"></ha-icon>
          Desktop options
        </h4>
        <div class="editor-section">
          ${this.makeComboBox<DesktopPosition>({
            label: 'Position',
            items: [
              { label: 'Top', value: DesktopPosition.top },
              { label: 'Bottom', value: DesktopPosition.bottom },
              { label: 'Left', value: DesktopPosition.left },
              { label: 'Right', value: DesktopPosition.right },
            ],
            configKey: 'desktop.position',
          })}
          ${this.makeComboBox<LabelVisibilityConfig>({
            label: 'Show labels',
            items: [
              { label: 'Always', value: true },
              { label: 'Never', value: false },
              { label: 'Popup only', value: 'popup_only' },
              { label: 'Routes only', value: 'routes_only' },
            ],
            configKey: 'desktop.show_labels',
          })}
          ${this.makeTextInput({
            label: 'Min width',
            configKey: 'desktop.min_width',
            type: 'number',
          })}
          ${this.makeTemplateEditor({
            label: 'Hidden',
            configKey: 'desktop.hidden',
          })}
        </div>
      </ha-expansion-panel>
    `;
  }

  renderMobileEditor() {
    return html`
      <ha-expansion-panel outlined>
        <h4 slot="header">
          <ha-icon icon="mdi:cellphone"></ha-icon>
          Mobile options
        </h4>
        <div class="editor-section">
          ${this.makeComboBox<LabelVisibilityConfig>({
            label: 'Show labels',
            items: [
              { label: 'Always', value: true },
              { label: 'Never', value: false },
              { label: 'Popup only', value: 'popup_only' },
              { label: 'Routes only', value: 'routes_only' },
            ],
            configKey: 'mobile.show_labels',
          })}
        </div>
      </ha-expansion-panel>
    `;
  }

  renderRoutesEditor() {
    // Helper to handle drag events
    const onDragStart = (e: DragEvent, index: number) => {
      e.dataTransfer?.setData('text/plain', index.toString());
      e.dataTransfer!.effectAllowed = 'move';
      // Add dragging class for visual feedback
      (e.currentTarget as HTMLElement).classList.add('dragging');
    };
    const onDragEnd = (e: DragEvent) => {
      (e.currentTarget as HTMLElement).classList.remove('dragging');
    };
    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'move';
      (e.currentTarget as HTMLElement).classList.add('drag-over');
    };
    const onDragLeave = (e: DragEvent) => {
      (e.currentTarget as HTMLElement).classList.remove('drag-over');
    };
    const onDrop = (e: DragEvent, dropIndex: number) => {
      e.preventDefault();
      const dragIndex = Number(e.dataTransfer?.getData('text/plain'));
      if (dragIndex === dropIndex || isNaN(dragIndex)) return;
      const routes = [...this._config.routes];
      const [moved] = routes.splice(dragIndex, 1);
      routes.splice(dropIndex, 0, moved);
      this.updateConfig({ routes });
      (e.currentTarget as HTMLElement).classList.remove('drag-over');
    };
    return html`
      <ha-expansion-panel outlined>
        <h4 slot="header">
          <ha-icon icon="mdi:routes"></ha-icon>
          Routes
        </h4>
        <div class="editor-section">
          ${this._config.routes.map((route, i) => {
            const iconOrImage = route.image ? 'image' : 'icon';
            const setIconOrImage = (type: 'icon' | 'image') => {
              if (type === 'icon') {
                this.updateConfigByKey(`routes.${i}.image` as any, undefined);
              } else {
                this.updateConfigByKey(`routes.${i}.icon` as any, undefined);
              }
            };
            const iconInput = this.makeTextInput({
              label: 'Icon',
              configKey: `routes.${i}.icon` as any,
              disabled: iconOrImage !== 'icon',
              autocomplete: 'on',
            });
            const imageInput = this.makeTextInput({
              label: 'Image',
              configKey: `routes.${i}.image` as any,
              disabled: iconOrImage !== 'image',
            });
            const iconSelectedInput = this.makeTextInput({
              label: 'Icon Selected',
              configKey: `routes.${i}.icon_selected` as any,
              autocomplete: 'on',
            });
            const imageSelectedInput = this.makeTextInput({
              label: 'Image Selected',
              configKey: `routes.${i}.image_selected` as any,
            });
            const labelInput = this.makeTextInput({
              label: 'Label',
              configKey: `routes.${i}.label` as any,
            });
            const urlInput = this.makeTextInput({
              label: 'URL',
              configKey: `routes.${i}.url` as any,
              type: 'url',
            });
            const hiddenInput = this.makeTextInput({
              label: 'Hidden',
              configKey: `routes.${i}.hidden` as any,
            });
            const selectedInput = this.makeTextInput({
              label: 'Selected',
              configKey: `routes.${i}.selected` as any,
            });
            const summaryLabel = route.label || '';
            return html`
              <div
                class="draggable-route"
                draggable="true"
                @dragstart=${(e: DragEvent) => onDragStart(e, i)}
                @dragend=${onDragEnd}
                @dragover=${onDragOver}
                @dragleave=${onDragLeave}
                @drop=${(e: DragEvent) => onDrop(e, i)}>
                <ha-expansion-panel outlined>
                  <div slot="header" class="route-header">
                    <span class="drag-handle" title="Drag to reorder">
                      <ha-icon icon="mdi:drag"></ha-icon>
                    </span>
                    <div class="route-header-title">Route</div>
                    <span class="route-header-summary">
                      ${iconOrImage === 'icon' && route.icon
                        ? html`<ha-icon icon="${route.icon}"></ha-icon>`
                        : ''}
                      ${iconOrImage === 'image' && route.image
                        ? html`<img
                            src="${route.image}"
                            class="route-header-image" />`
                        : ''}
                      ${summaryLabel}
                    </span>
                    <ha-button
                      @click=${() => this.removeRoute(i)}
                      class="delete-route-btn"
                      title="Delete route">
                      <ha-icon icon="mdi:delete"></ha-icon>
                    </ha-button>
                  </div>
                  <div class="route-editor route-editor-bg">
                    <ha-segmented-button
                      .value=${iconOrImage}
                      @change=${(e: CustomEvent) =>
                        setIconOrImage(e.detail.value)}>
                      <ha-segmented-button-option value="icon"
                        >Icon</ha-segmented-button-option
                      >
                      <ha-segmented-button-option value="image"
                        >Image</ha-segmented-button-option
                      >
                    </ha-segmented-button>
                    <div class="route-grid">
                      <div>${iconInput}</div>
                      <div>${imageInput}</div>
                    </div>
                    <div class="route-grid">
                      <div>${iconSelectedInput}</div>
                      <div>${imageSelectedInput}</div>
                    </div>
                    <div class="route-grid">
                      <div>${labelInput}</div>
                      <div>${urlInput}</div>
                    </div>
                    <div class="route-grid">
                      <div>${hiddenInput}</div>
                      <div>${selectedInput}</div>
                    </div>
                    <div class="route-divider"></div>
                    <ha-expansion-panel outlined>
                      <h5 slot="header">
                        <ha-icon icon="mdi:star-circle-outline"></ha-icon>
                        Badge
                      </h5>
                      <div class="editor-section">
                        ${this.makeTextInput({
                          label: 'Show',
                          configKey: `routes.${i}.badge.show` as any,
                        })}
                        ${this.makeTextInput({
                          label: 'Template',
                          configKey: `routes.${i}.badge.template` as any,
                        })}
                        ${this.makeTextInput({
                          label: 'Color',
                          configKey: `routes.${i}.badge.color` as any,
                        })}
                      </div>
                    </ha-expansion-panel>
                    <ha-expansion-panel outlined>
                      <h5 slot="header">
                        <ha-icon icon="mdi:menu"></ha-icon>
                        Popup/Submenu
                      </h5>
                      <div class="editor-section">
                        ${(route.popup || []).map((popup, j) => {
                          const popupIconOrImage = popup.image
                            ? 'image'
                            : 'icon';
                          const setPopupIconOrImage = (
                            type: 'icon' | 'image',
                          ) => {
                            if (type === 'icon') {
                              this.updateConfigByKey(
                                `routes.${i}.popup.${j}.image` as any,
                                undefined,
                              );
                            } else {
                              this.updateConfigByKey(
                                `routes.${i}.popup.${j}.icon` as any,
                                undefined,
                              );
                            }
                          };
                          const popupIconInput = this.makeTextInput({
                            label: 'Icon',
                            configKey: `routes.${i}.popup.${j}.icon` as any,
                            disabled: popupIconOrImage !== 'icon',
                            autocomplete: 'on',
                          });
                          const popupImageInput = this.makeTextInput({
                            label: 'Image',
                            configKey: `routes.${i}.popup.${j}.image` as any,
                            disabled: popupIconOrImage !== 'image',
                          });
                          const popupLabelInput = this.makeTextInput({
                            label: 'Label',
                            configKey: `routes.${i}.popup.${j}.label` as any,
                          });
                          const popupUrlInput = this.makeTextInput({
                            label: 'URL',
                            configKey: `routes.${i}.popup.${j}.url` as any,
                            type: 'url',
                          });
                          const popupHiddenInput = this.makeTextInput({
                            label: 'Hidden',
                            configKey: `routes.${i}.popup.${j}.hidden` as any,
                          });
                          return html`
                            <ha-expansion-panel outlined>
                              <h6 slot="header">
                                <ha-icon
                                  icon="mdi:subdirectory-arrow-right"></ha-icon>
                                Popup Item ${j + 1}
                              </h6>
                              <div class="popup-editor">
                                <div class="popup-controls">
                                  <ha-button
                                    @click=${() => this.movePopup(i, j, -1)}
                                    outlined
                                    ?disabled=${j === 0}>
                                    <ha-icon icon="mdi:arrow-up"></ha-icon>
                                  </ha-button>
                                  <ha-button
                                    @click=${() => this.movePopup(i, j, 1)}
                                    outlined
                                    ?disabled=${j ===
                                    (route.popup?.length || 1) - 1}>
                                    <ha-icon icon="mdi:arrow-down"></ha-icon>
                                  </ha-button>
                                  <ha-button
                                    @click=${() => this.removePopup(i, j)}
                                    outlined>
                                    <ha-icon icon="mdi:delete"></ha-icon>
                                  </ha-button>
                                </div>
                                <ha-segmented-button
                                  .value=${popupIconOrImage}
                                  @change=${(e: CustomEvent) =>
                                    setPopupIconOrImage(e.detail.value)}>
                                  <ha-segmented-button-option value="icon"
                                    >Icon</ha-segmented-button-option
                                  >
                                  <ha-segmented-button-option value="image"
                                    >Image</ha-segmented-button-option
                                  >
                                </ha-segmented-button>
                                <div class="route-grid">
                                  <div>${popupIconInput}</div>
                                  <div>${popupImageInput}</div>
                                </div>
                                <div class="route-grid">
                                  <div>${popupLabelInput}</div>
                                  <div>${popupUrlInput}</div>
                                </div>
                                <div class="route-grid">
                                  <div>${popupHiddenInput}</div>
                                </div>
                                <div class="route-divider"></div>
                                <ha-expansion-panel outlined>
                                  <h6 slot="header">
                                    <ha-icon
                                      icon="mdi:star-circle-outline"></ha-icon>
                                    Badge
                                  </h6>
                                  <div class="editor-section">
                                    ${this.makeTextInput({
                                      label: 'Show',
                                      configKey:
                                        `routes.${i}.popup.${j}.badge.show` as any,
                                    })}
                                    ${this.makeTextInput({
                                      label: 'Template',
                                      configKey:
                                        `routes.${i}.popup.${j}.badge.template` as any,
                                    })}
                                    ${this.makeTextInput({
                                      label: 'Color',
                                      configKey:
                                        `routes.${i}.popup.${j}.badge.color` as any,
                                    })}
                                  </div>
                                </ha-expansion-panel>
                              </div>
                            </ha-expansion-panel>
                          `;
                        })}
                        <ha-button
                          @click=${() => this.addPopup(i)}
                          outlined
                          class="add-popup-btn">
                          <ha-icon icon="mdi:plus"></ha-icon>&nbsp;Add Popup
                          Item
                        </ha-button>
                      </div>
                    </ha-expansion-panel>
                  </div>
                </ha-expansion-panel>
              </div>
            `;
          })}
          <ha-button @click=${this.addRoute} outlined class="add-route-btn">
            <ha-icon icon="mdi:plus"></ha-icon>&nbsp;Add Route
          </ha-button>
        </div>
      </ha-expansion-panel>
    `;
  }

  _chooseIconForAction(actionType: HAActions) {
    switch (actionType) {
      case HAActions.hold_action:
        return 'mdi:gesture-tap-hold';
      case HAActions.double_tap_action:
        return 'mdi:gesture-double-tap';
      case HAActions.tap_action:
      default:
        return 'mdi:gesture-tap';
    }
  }

  _chooseLabelForAction(actionType: HAActions) {
    switch (actionType) {
      case HAActions.tap_action:
        return 'Tap action';
      case HAActions.hold_action:
        return 'Hold action';
      case HAActions.double_tap_action:
        return 'Double tap action';
      default:
        return '';
    }
  }
  isCustomAction(value: string) {
    return ['open-popup', 'navigate-back'].includes(value);
  }

  makeActionSelector(options: {
    configKey: DotNotationKeys<NavbarCardConfig>;
    disabled?: boolean;
    actionType: HAActions;
  }) {
    const ACTIONS = [
      { label: 'Home Assistant action', value: 'hass_action' },
      { label: 'Open Popup', value: 'open-popup' },
      { label: 'Navigate Back', value: 'navigate-back' },
    ];

    const value =
      genericGetProperty(this._config, options.configKey)?.action ||
      'hass_action';
    const isCustom = this.isCustomAction(value);

    return html``;

    return html`
      <div>
        <ha-combo-box
          label=${this._chooseLabelForAction(options.actionType)}
          .items=${ACTIONS}
          .value=${value}
          .disabled=${options.disabled}
          @value-changed=${(e: CustomEvent) => {
            const newValue = e.detail.value;
            if (this.isCustomAction(newValue)) {
              // Set the action to the custom action
              this.updateConfigByKey(options.configKey, { action: newValue });
            } else {
              // Reset to empty Home Assistant action config
              this.updateConfigByKey(options.configKey, { action: undefined });
            }
          }}></ha-combo-box>
        ${!isCustom
          ? html`
              <ha-form
                .hass=${this.hass}
                .data=${genericGetProperty(this._config, options.configKey) ||
                {}}
                .schema=${[
                  {
                    name: 'action',
                    label: this._chooseLabelForAction(options.actionType),
                    selector: {
                      ui_action: {
                        default_action: 'none',
                      },
                    },
                  },
                ]}
                @value-changed=${(ev: CustomEvent) => {
                  // Update the config with the new action object
                  console.log(ev.detail.value);
                  console.log(options.configKey);
                  this.updateConfigByKey(
                    options.configKey,
                    ev.detail.value?.action,
                  );
                }}></ha-form>
            `
          : ''}
      </div>
    `;
  }

  /**********************************************************************/
  /* Native methods */
  /**********************************************************************/
  protected render() {
    // TODO will display an alert when the navbar is using "template" field
    if (false) {
      return html`<ha-alert alert-type="warning">Cuidado!</ha-alert>`;
    }

    return html`
      <div class="navbar-editor">
        ${this.makeActionSelector({
          configKey: 'routes.0.tap_action' as any,
          actionType: HAActions.tap_action,
        })}
        ${this.renderRoutesEditor()} ${this.renderDesktopEditor()}
        ${this.renderMobileEditor()} ${this.renderStylesEditor()}
      </div>
    `;
  }

  static styles = getEditorStyles();

  // Helper methods for route/popup manipulation
  private addRoute = () => {
    const routes = [...this._config.routes, { icon: '', label: '', url: '' }];
    this.updateConfig({ routes });
  };

  private removeRoute = (index: number) => {
    const routes = [...this._config.routes];
    routes.splice(index, 1);
    this.updateConfig({ routes });
  };

  private moveRoute = (index: number, direction: -1 | 1) => {
    const routes = [...this._config.routes];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= routes.length) return;
    [routes[index], routes[newIndex]] = [routes[newIndex], routes[index]];
    this.updateConfig({ routes });
  };

  private addPopup = (routeIndex: number) => {
    const routes = [...this._config.routes];
    const popup = [
      ...(routes[routeIndex].popup || []),
      { icon: '', label: '', url: '' },
    ];
    routes[routeIndex] = { ...routes[routeIndex], popup };
    this.updateConfig({ routes });
  };

  private removePopup = (routeIndex: number, popupIndex: number) => {
    const routes = [...this._config.routes];
    const popup = [...(routes[routeIndex].popup || [])];
    popup.splice(popupIndex, 1);
    routes[routeIndex] = { ...routes[routeIndex], popup };
    this.updateConfig({ routes });
  };

  private movePopup = (
    routeIndex: number,
    popupIndex: number,
    direction: -1 | 1,
  ) => {
    const routes = [...this._config.routes];
    const popup = [...(routes[routeIndex].popup || [])];
    const newIndex = popupIndex + direction;
    if (newIndex < 0 || newIndex >= popup.length) return;
    [popup[popupIndex], popup[newIndex]] = [popup[newIndex], popup[popupIndex]];
    routes[routeIndex] = { ...routes[routeIndex], popup };
    this.updateConfig({ routes });
  };
}

// private _updateConfig(newConfig: Partial<NavbarCardConfig>) {
//   this._config = { ...this._config, ...newConfig };
//   this.dispatchEvent(
//     new CustomEvent('config-changed', {
//       detail: { config: this._config },
//     }),
//   );
// }

// private _updateRoute(index: number, value: Partial<RouteItem>) {
//   const routes = [...this._config.routes];
//   routes[index] = { ...routes[index], ...value };
//   this._updateConfig({ routes });
// }

// private _addRoute() {
//   const routes = [...this._config.routes, { icon: '', label: '', url: '' }];
//   this._updateConfig({ routes });
// }

// private _removeRoute(index: number) {
//   const routes = [...this._config.routes];
//   routes.splice(index, 1);
//   this._updateConfig({ routes });
// }

// private _moveRoute(index: number, direction: -1 | 1) {
//   const routes = [...this._config.routes];
//   const newIndex = index + direction;
//   if (newIndex < 0 || newIndex >= routes.length) return;
//   [routes[index], routes[newIndex]] = [routes[newIndex], routes[index]];
//   this._updateConfig({ routes });
// }

// private _updatePopup(
//   routeIndex: number,
//   popupIndex: number,
//   value: Partial<PopupItem>,
// ) {
//   const routes = [...this._config.routes];
//   const popup = [...(routes[routeIndex].popup || [])];
//   popup[popupIndex] = { ...popup[popupIndex], ...value };
//   routes[routeIndex] = { ...routes[routeIndex], popup };
//   this._updateConfig({ routes });
// }

// private _addPopup(routeIndex: number) {
//   const routes = [...this._config.routes];
//   const popup = [
//     ...(routes[routeIndex].popup || []),
//     { icon: '', label: '', url: '' },
//   ];
//   routes[routeIndex] = { ...routes[routeIndex], popup };
//   this._updateConfig({ routes });
// }

// private _removePopup(routeIndex: number, popupIndex: number) {
//   const routes = [...this._config.routes];
//   const popup = [...(routes[routeIndex].popup || [])];
//   popup.splice(popupIndex, 1);
//   routes[routeIndex] = { ...routes[routeIndex], popup };
//   this._updateConfig({ routes });
// }

// private _movePopup(
//   routeIndex: number,
//   popupIndex: number,
//   direction: -1 | 1,
// ) {
//   const routes = [...this._config.routes];
//   const popup = [...(routes[routeIndex].popup || [])];
//   const newIndex = popupIndex + direction;
//   if (newIndex < 0 || newIndex >= popup.length) return;
//   [popup[popupIndex], popup[newIndex]] = [popup[newIndex], popup[popupIndex]];
//   routes[routeIndex] = { ...routes[routeIndex], popup };
//   this._updateConfig({ routes });
// }

// private _updateDesktopOption(key: string, value: any) {
//   const desktop = { ...(this._config.desktop || {}) };
//   desktop[key] = value;
//   this._updateConfig({ desktop });
// }

// private _updateMobileOption(key: string, value: any) {
//   const mobile = { ...(this._config.mobile || {}) };
//   mobile[key] = value;
//   this._updateConfig({ mobile });
// }

// private _updateHapticOption(key: string, value: any) {
//   let haptic: boolean | HapticConfig = this._config.haptic;
//   if (typeof haptic !== 'object' || haptic === null) haptic = {};
//   haptic = { ...haptic, [key]: value };
//   this._updateConfig({ haptic });
// }

// render() {
//   const config = this._config;
//   const templateActive = !!config.template;
//   const haptic: boolean | HapticConfig = config.haptic ?? false;
//   return html`
//     <ha-card header="Navbar Card Editor">
//       ${templateActive
//         ? html`
//             <div class="template-warning">
//               <ha-alert alert-type="warning">
//                 <b>Template in use:</b> Visual editing is <b>disabled</b> when
//                 a template is set.<br />
//                 <span style="font-size: 0.95em;">
//                   To use the visual editor, please remove the template.<br />
//                 </span>
//                 <mwc-button
//                   outlined
//                   @click=${() => this._updateConfig({ template: undefined })}>
//                   Remove Template
//                 </mwc-button>
//               </ha-alert>
//             </div>
//           `
//         : html`
//             <label>
//               Template:
//               <ha-textfield
//                 label="Template name (optional)"
//                 .value=${config.template || ''}
//                 @input=${(e: InputEvent) =>
//                   this._updateConfig({
//                     template: (e.target as HTMLInputElement).value,
//                   })}></ha-textfield>
//             </label>
//             <label>
//               Custom Styles (CSS):
//               <textarea
//                 .value=${config.styles || ''}
//                 @input=${(e: InputEvent) =>
//                   this._updateConfig({
//                     styles: (e.target as HTMLTextAreaElement).value,
//                   })}></textarea>
//             </label>
//             <fieldset>
//               <legend>Desktop Options</legend>
//               <label
//                 >Show Labels:
//                 <select
//                   .value=${config.desktop?.show_labels ?? ''}
//                   @change=${(e: Event) =>
//                     this._updateDesktopOption(
//                       'show_labels',
//                       (e.target as HTMLSelectElement).value === 'true'
//                         ? true
//                         : (e.target as HTMLSelectElement).value === 'false'
//                           ? false
//                           : (e.target as HTMLSelectElement).value,
//                     )}>
//                   <option value="">Default</option>
//                   <option value="true">True</option>
//                   <option value="false">False</option>
//                   <option value="popup_only">Popup Only</option>
//                   <option value="routes_only">Routes Only</option>
//                 </select>
//               </label>
//               <label
//                 >Min Width:
//                 <input
//                   type="number"
//                   .value=${config.desktop?.min_width ?? ''}
//                   @input=${(e: InputEvent) =>
//                     this._updateDesktopOption(
//                       'min_width',
//                       Number((e.target as HTMLInputElement).value),
//                     )} />
//               </label>
//               <label
//                 >Position:
//                 <select
//                   .value=${config.desktop?.position ?? ''}
//                   @change=${(e: Event) =>
//                     this._updateDesktopOption(
//                       'position',
//                       (e.target as HTMLSelectElement).value,
//                     )}>
//                   <option value="">Default</option>
//                   <option value="top">Top</option>
//                   <option value="bottom">Bottom</option>
//                   <option value="left">Left</option>
//                   <option value="right">Right</option>
//                 </select>
//               </label>
//               <label
//                 >Hidden:
//                 <input
//                   type="text"
//                   .value=${config.desktop?.hidden ?? ''}
//                   @input=${(e: InputEvent) =>
//                     this._updateDesktopOption(
//                       'hidden',
//                       (e.target as HTMLInputElement).value,
//                     )} />
//               </label>
//             </fieldset>
//             <fieldset>
//               <legend>Mobile Options</legend>
//               <label
//                 >Show Labels:
//                 <select
//                   .value=${config.mobile?.show_labels ?? ''}
//                   @change=${(e: Event) =>
//                     this._updateMobileOption(
//                       'show_labels',
//                       (e.target as HTMLSelectElement).value === 'true'
//                         ? true
//                         : (e.target as HTMLSelectElement).value === 'false'
//                           ? false
//                           : (e.target as HTMLSelectElement).value,
//                     )}>
//                   <option value="">Default</option>
//                   <option value="true">True</option>
//                   <option value="false">False</option>
//                   <option value="popup_only">Popup Only</option>
//                   <option value="routes_only">Routes Only</option>
//                 </select>
//               </label>
//               <label
//                 >Hidden:
//                 <input
//                   type="text"
//                   .value=${config.mobile?.hidden ?? ''}
//                   @input=${(e: InputEvent) =>
//                     this._updateMobileOption(
//                       'hidden',
//                       (e.target as HTMLInputElement).value,
//                     )} />
//               </label>
//             </fieldset>
//             <fieldset>
//               <legend>Haptic Feedback</legend>
//               <label
//                 >Global:
//                 <select
//                   .value=${typeof haptic === 'boolean' ? String(haptic) : ''}
//                   @change=${(e: Event) =>
//                     this._updateConfig({
//                       haptic:
//                         (e.target as HTMLSelectElement).value === 'true'
//                           ? true
//                           : (e.target as HTMLSelectElement).value === 'false'
//                             ? false
//                             : undefined,
//                     })}>
//                   <option value="">Custom</option>
//                   <option value="true">Enabled</option>
//                   <option value="false">Disabled</option>
//                 </select>
//               </label>
//               ${typeof haptic === 'object' && haptic !== null
//                 ? html`
//                     <label
//                       >URL:
//                       <input
//                         type="checkbox"
//                         .checked=${!!haptic.url}
//                         @change=${(e: Event) =>
//                           this._updateHapticOption(
//                             'url',
//                             (e.target as HTMLInputElement).checked,
//                           )} />
//                     </label>
//                     <label
//                       >Tap Action:
//                       <input
//                         type="checkbox"
//                         .checked=${!!haptic.tap_action}
//                         @change=${(e: Event) =>
//                           this._updateHapticOption(
//                             'tap_action',
//                             (e.target as HTMLInputElement).checked,
//                           )} />
//                     </label>
//                     <label
//                       >Hold Action:
//                       <input
//                         type="checkbox"
//                         .checked=${!!haptic.hold_action}
//                         @change=${(e: Event) =>
//                           this._updateHapticOption(
//                             'hold_action',
//                             (e.target as HTMLInputElement).checked,
//                           )} />
//                     </label>
//                     <label
//                       >Double Tap Action:
//                       <input
//                         type="checkbox"
//                         .checked=${!!haptic.double_tap_action}
//                         @change=${(e: Event) =>
//                           this._updateHapticOption(
//                             'double_tap_action',
//                             (e.target as HTMLInputElement).checked,
//                           )} />
//                     </label>
//                   `
//                 : ''}
//             </fieldset>
//             <fieldset>
//               <legend>Routes</legend>
//               ${config.routes.map(
//                 (route, i) => html`
//                   <div class="route-editor">
//                     <h4>Route ${i + 1}</h4>
//                     <button
//                       @click=${() => this._moveRoute(i, -1)}
//                       ?disabled=${i === 0}>
//                       ↑
//                     </button>
//                     <button
//                       @click=${() => this._moveRoute(i, 1)}
//                       ?disabled=${i === config.routes.length - 1}>
//                       ↓
//                     </button>
//                     <button @click=${() => this._removeRoute(i)}>
//                       Remove
//                     </button>
//                     <label
//                       >Icon:
//                       <input
//                         type="text"
//                         .value=${route.icon || ''}
//                         @input=${(e: InputEvent) =>
//                           this._updateRoute(i, {
//                             icon: (e.target as HTMLInputElement).value,
//                           })} />
//                     </label>
//                     <label
//                       >Image:
//                       <input
//                         type="text"
//                         .value=${route.image || ''}
//                         @input=${(e: InputEvent) =>
//                           this._updateRoute(i, {
//                             image: (e.target as HTMLInputElement).value,
//                           })} />
//                     </label>
//                     <label
//                       >Icon Selected:
//                       <input
//                         type="text"
//                         .value=${route.icon_selected || ''}
//                         @input=${(e: InputEvent) =>
//                           this._updateRoute(i, {
//                             icon_selected: (e.target as HTMLInputElement)
//                               .value,
//                           })} />
//                     </label>
//                     <label
//                       >Image Selected:
//                       <input
//                         type="text"
//                         .value=${route.image_selected || ''}
//                         @input=${(e: InputEvent) =>
//                           this._updateRoute(i, {
//                             image_selected: (e.target as HTMLInputElement)
//                               .value,
//                           })} />
//                     </label>
//                     <label
//                       >Label:
//                       <input
//                         type="text"
//                         .value=${route.label || ''}
//                         @input=${(e: InputEvent) =>
//                           this._updateRoute(i, {
//                             label: (e.target as HTMLInputElement).value,
//                           })} />
//                     </label>
//                     <label
//                       >URL:
//                       <input
//                         type="text"
//                         .value=${route.url || ''}
//                         @input=${(e: InputEvent) =>
//                           this._updateRoute(i, {
//                             url: (e.target as HTMLInputElement).value,
//                           })} />
//                     </label>
//                     <label
//                       >Hidden:
//                       <input
//                         type="text"
//                         .value=${route.hidden || ''}
//                         @input=${(e: InputEvent) =>
//                           this._updateRoute(i, {
//                             hidden: (e.target as HTMLInputElement).value,
//                           })} />
//                     </label>
//                     <label
//                       >Selected:
//                       <input
//                         type="text"
//                         .value=${route.selected || ''}
//                         @input=${(e: InputEvent) =>
//                           this._updateRoute(i, {
//                             selected: (e.target as HTMLInputElement).value,
//                           })} />
//                     </label>
//                     <fieldset>
//                       <legend>Badge</legend>
//                       <label
//                         >Show:
//                         <input
//                           type="text"
//                           .value=${route.badge?.show || ''}
//                           @input=${(e: InputEvent) =>
//                             this._updateRoute(i, {
//                               badge: {
//                                 ...route.badge,
//                                 show: (e.target as HTMLInputElement).value,
//                               },
//                             })} />
//                       </label>
//                       <label
//                         >Template:
//                         <input
//                           type="text"
//                           .value=${route.badge?.template || ''}
//                           @input=${(e: InputEvent) =>
//                             this._updateRoute(i, {
//                               badge: {
//                                 ...route.badge,
//                                 template: (e.target as HTMLInputElement)
//                                   .value,
//                               },
//                             })} />
//                       </label>
//                       <label
//                         >Color:
//                         <input
//                           type="text"
//                           .value=${route.badge?.color || ''}
//                           @input=${(e: InputEvent) =>
//                             this._updateRoute(i, {
//                               badge: {
//                                 ...route.badge,
//                                 color: (e.target as HTMLInputElement).value,
//                               },
//                             })} />
//                       </label>
//                     </fieldset>
//                     <fieldset>
//                       <legend>Popup/Submenu</legend>
//                       ${(route.popup || []).map(
//                         (popup, j) => html`
//                           <div class="popup-editor">
//                             <h5>Popup Item ${j + 1}</h5>
//                             <button
//                               @click=${() => this._movePopup(i, j, -1)}
//                               ?disabled=${j === 0}>
//                               ↑
//                             </button>
//                             <button
//                               @click=${() => this._movePopup(i, j, 1)}
//                               ?disabled=${j ===
//                               (route.popup?.length || 1) - 1}>
//                               ↓
//                             </button>
//                             <button @click=${() => this._removePopup(i, j)}>
//                               Remove
//                             </button>
//                             <label
//                               >Icon:
//                               <input
//                                 type="text"
//                                 .value=${popup.icon || ''}
//                                 @input=${(e: InputEvent) =>
//                                   this._updatePopup(i, j, {
//                                     icon: (e.target as HTMLInputElement)
//                                       .value,
//                                   })} />
//                             </label>
//                             <label
//                               >Image:
//                               <input
//                                 type="text"
//                                 .value=${popup.image || ''}
//                                 @input=${(e: InputEvent) =>
//                                   this._updatePopup(i, j, {
//                                     image: (e.target as HTMLInputElement)
//                                       .value,
//                                   })} />
//                             </label>
//                             <label
//                               >Label:
//                               <input
//                                 type="text"
//                                 .value=${popup.label || ''}
//                                 @input=${(e: InputEvent) =>
//                                   this._updatePopup(i, j, {
//                                     label: (e.target as HTMLInputElement)
//                                       .value,
//                                   })} />
//                             </label>
//                             <label
//                               >URL:
//                               <input
//                                 type="text"
//                                 .value=${popup.url || ''}
//                                 @input=${(e: InputEvent) =>
//                                   this._updatePopup(i, j, {
//                                     url: (e.target as HTMLInputElement).value,
//                                   })} />
//                             </label>
//                             <label
//                               >Hidden:
//                               <input
//                                 type="text"
//                                 .value=${popup.hidden || ''}
//                                 @input=${(e: InputEvent) =>
//                                   this._updatePopup(i, j, {
//                                     hidden: (e.target as HTMLInputElement)
//                                       .value,
//                                   })} />
//                             </label>
//                             <fieldset>
//                               <legend>Badge</legend>
//                               <label
//                                 >Show:
//                                 <input
//                                   type="text"
//                                   .value=${popup.badge?.show || ''}
//                                   @input=${(e: InputEvent) =>
//                                     this._updatePopup(i, j, {
//                                       badge: {
//                                         ...popup.badge,
//                                         show: (e.target as HTMLInputElement)
//                                           .value,
//                                       },
//                                     })} />
//                               </label>
//                               <label
//                                 >Template:
//                                 <input
//                                   type="text"
//                                   .value=${popup.badge?.template || ''}
//                                   @input=${(e: InputEvent) =>
//                                     this._updatePopup(i, j, {
//                                       badge: {
//                                         ...popup.badge,
//                                         template: (
//                                           e.target as HTMLInputElement
//                                         ).value,
//                                       },
//                                     })} />
//                               </label>
//                               <label
//                                 >Color:
//                                 <input
//                                   type="text"
//                                   .value=${popup.badge?.color || ''}
//                                   @input=${(e: InputEvent) =>
//                                     this._updatePopup(i, j, {
//                                       badge: {
//                                         ...popup.badge,
//                                         color: (e.target as HTMLInputElement)
//                                           .value,
//                                       },
//                                     })} />
//                               </label>
//                             </fieldset>
//                           </div>
//                         `,
//                       )}
//                       <button @click=${() => this._addPopup(i)}>
//                         Add Popup Item
//                       </button>
//                     </fieldset>
//                   </div>
//                 `,
//               )}
//               <button @click=${this._addRoute}>Add Route</button>
//             </fieldset>
//           `}
//     </ha-card>
//   `;
// }

// static styles = [
//   css`
//     .template-warning {
//       margin-bottom: 16px;
//       padding: 8px;
//     }
//     ha-alert {
//       display: block;
//       margin-bottom: 16px;
//     }
//     ha-card {
//       padding: 16px;
//     }
//     .navbar-card-editor {
//       display: flex;
//       flex-direction: column;
//       gap: 1.5em;
//       max-width: 800px;
//     }
//     fieldset {
//       border: 1px solid #ccc;
//       border-radius: 6px;
//       padding: 1em;
//       margin-bottom: 1em;
//     }
//     legend {
//       font-weight: bold;
//     }
//     .route-editor,
//     .popup-editor {
//       border: 1px solid #eee;
//       border-radius: 4px;
//       padding: 0.5em;
//       margin-bottom: 1em;
//       background: #fafbfc;
//     }
//     label {
//       display: flex;
//       flex-direction: column;
//       margin-bottom: 0.5em;
//       font-size: 0.95em;
//     }
//     input[type='text'],
//     input[type='number'],
//     textarea,
//     select {
//       margin-top: 0.2em;
//       padding: 0.8em;
//       font-size: 1em;
//       border-radius: 3px;
//       border: 1px solid #bbb;
//     }
//     button {
//       margin-right: 0.5em;
//       margin-bottom: 0.5em;
//       padding: 0.3em 0.7em;
//       font-size: 0.95em;
//       border-radius: 3px;
//       border: 1px solid #bbb;
//       background: #f0f0f0;
//       cursor: pointer;
//     }
//     button:disabled {
//       opacity: 0.5;
//       cursor: not-allowed;
//     }
//     h2,
//     h4,
//     h5 {
//       margin: 0.2em 0 0.5em 0;
//     }
//   `,
//   (LitElement as any).styles || [],
// ];
// }
