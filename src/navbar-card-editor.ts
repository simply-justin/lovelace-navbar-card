/* eslint-disable @typescript-eslint/no-explicit-any */
// Reason: Dynamic dot-notation keys for deeply nested config editing in a generic editor.
import { LitElement, TemplateResult, html } from 'lit';
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
import {
  cleanTemplate,
  deepMergeKeepArrays,
  processTemplate,
  wrapTemplate,
} from './utils';
import { getEditorStyles } from './styles';

enum HAActions {
  tap_action,
  hold_action,
  double_tap_action,
}

const GENERIC_JS_TEMPLATE_HELPER = html`Insert valid Javascript code without [[[
  ]]].
  <a
    href="https://github.com/joseluis9595/lovelace-navbar-card?tab=readme-ov-file#jstemplate"
    target="_blank"
    rel="noopener"
    >See documentation</a
  >
  for more info.`;

const BOOLEAN_JS_TEMPLATE_HELPER = html`${GENERIC_JS_TEMPLATE_HELPER}<br />Must
  return a <strong>boolean</strong> value`;

const STRING_JS_TEMPLATE_HELPER = html`${GENERIC_JS_TEMPLATE_HELPER}<br />Must
  return a <strong>string</strong> value`;

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

  makeHelpTooltipIcon(options: { tooltip: string | TemplateResult }) {
    return html`<ha-tooltip .placement="right" .content=${options.tooltip}>
      <ha-icon icon="mdi:help-circle"></ha-icon>
    </ha-tooltip>`;
  }

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
    suffix?: string;
    prefixIcon?: string;
    tooltip?: string;
    helper?: string;
    helperPersistent?: boolean;
    placeholder?: string;
  }) {
    return html`
      <div style="display: flex; align-items: center;">
        ${options.tooltip
          ? this.makeHelpTooltipIcon({ tooltip: options.tooltip })
          : ''}
        <ha-textfield
          helper=${options.helper}
          helperPersistent=${options.helperPersistent}
          suffix=${options.suffix}
          label=${options.label}
          type=${options.type}
          placeholder=${options.placeholder}
          .value=${genericGetProperty(this._config, options.configKey) ?? ''}
          .disabled=${options.disabled}
          .autocomplete=${options.autocomplete}
          @input="${e => {
            this.updateConfigByKey(
              options.configKey,
              options.type == 'number'
                ? e.target.value == ''
                  ? undefined
                  : parseInt(e.target.value)
                : e.target.value,
            );
          }}"></ha-textfield>
      </div>
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
        .value=${genericGetProperty(this._config, options.configKey)}
        .disabled=${options.disabled}
        @value-changed="${e => {
          this.updateConfigByKey(options.configKey, e.detail.value);
        }}" />
    `;
  }

  makeStringOrTemplateEditor(options: {
    label: string;
    configKey: DotNotationKeys<NavbarCardConfig>;
    tooltip?: string | TemplateResult;
    helper?: string | TemplateResult;
  }) {
    const value = genericGetProperty(this._config, options.configKey) as
      | string
      | undefined;
    const isTemplate =
      typeof value === 'string' &&
      value.trim().startsWith('[[[') &&
      value.trim().endsWith(']]]');

    // Handler to toggle between template and text
    const toggleMode = () => {
      let newValue: string = value ?? '';
      if (isTemplate) {
        // Remove template delimiters
        newValue = cleanTemplate(newValue);
      } else {
        // Add template delimiters
        newValue = wrapTemplate(newValue);
      }
      this.updateConfigByKey(options.configKey, newValue);
    };

    // Button label and icon
    const buttonLabel = isTemplate ? 'Switch to text' : 'Switch to template';
    const buttonIcon = isTemplate ? 'mdi:format-text' : 'mdi:code-braces';

    // Compose the toggle button
    const toggleButton = html`
      <ha-button @click=${toggleMode} outlined style="margin-left: 0.5em;">
        <ha-icon icon="${buttonIcon}"></ha-icon>&nbsp;${buttonLabel}
      </ha-button>
    `;

    // Render the appropriate editor with the toggle button
    if (isTemplate) {
      return html`
        <div style="display: flex; align-items: center; gap: 0.5em;">
          <label class="editor-label" style="flex: 1;">${options.label}</label>
          ${toggleButton}
        </div>
        ${this.makeTemplateEditor({
          label: '',
          configKey: options.configKey,
          tooltip: options.tooltip,
          helper: options.helper,
        })}
      `;
    } else {
      return html`
        <div>
          <div style="display: flex; align-items: center; gap: 0.5em;">
            <label class="editor-label" style="flex: 1;"
              >${options.label}</label
            >
            ${toggleButton}
          </div>
          ${this.makeTextInput({
            label: '',
            configKey: options.configKey,
            tooltip: options.tooltip as string | undefined,
          })}
        </div>
      `;
    }
  }

  makeTemplateEditor(options: {
    label: string;
    configKey: DotNotationKeys<NavbarCardConfig>;
    tooltip?: string | TemplateResult;
    helper?: string | TemplateResult;
  }) {
    return html`
      <div class="template-editor-container">
        <label class="editor-label">${options.label} </label>
        <ha-code-editor
          autofocus
          autocomplete-entities
          autocomplete-icons
          .hass=${this.hass}
          .value=${cleanTemplate(
            (genericGetProperty(this._config, options.configKey) as string) ??
              '',
          )}
          @value-changed=${e => {
            const templateValue =
              e.target.value?.trim() == '' ? '' : wrapTemplate(e.target.value);
            this.updateConfigByKey(options.configKey, templateValue);
          }}></ha-code-editor>
        ${options.helper
          ? html`<div class="template-editor-helper">${options.helper}</div>`
          : html``}
      </div>
    `;
  }

  makeSwitch(options: {
    label: string;
    configKey: DotNotationKeys<NavbarCardConfig>;
    disabled?: boolean;
    tooltip?: string;
    defaultValue?: boolean;
  }) {
    return html`
      <div style="display: flex; align-items: center; gap: 1em;">
        <ha-switch
          .checked=${genericGetProperty(this._config, options.configKey) ??
          options.defaultValue}
          .disabled=${options.disabled}
          @change=${(e: Event) => {
            const checked = (e.target as HTMLInputElement).checked;
            this.updateConfigByKey(options.configKey, checked as any);
          }}></ha-switch>
        ${options.tooltip
          ? this.makeHelpTooltipIcon({ tooltip: options.tooltip })
          : ''}
        <label>${options.label}</label>
      </div>
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
          <ha-alert alert-type="info" title="Custom CSS Styles">
            Use this section to change the appearance of
            <code>navbar-card</code>.<br />
            Enter your CSS here (no <code>"styles: |"</code> prefix needed).<br />
            <a
              href="https://github.com/joseluis9595/lovelace-navbar-card?tab=readme-ov-file#styles"
              target="_blank"
              rel="noopener"
              >See documentation</a
            >
            for examples.
          </ha-alert>
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

  renderHapticEditor() {
    const hapticRawValue = genericGetProperty(this._config, 'haptic');
    const hapticValue: boolean | undefined =
      typeof hapticRawValue === 'boolean' ? hapticRawValue : undefined;

    return html`
      <ha-expansion-panel outlined>
        <h4 slot="header">
          <ha-icon icon="mdi:vibrate"></ha-icon>
          Haptic
        </h4>
        <div class="editor-section">
          ${this.makeSwitch({
            label: 'When pressing routes with URL configured',
            configKey: 'haptic.url',
            defaultValue: hapticValue,
          })}
          ${this.makeSwitch({
            label: "When executing the 'tap_action' configured for a route",
            configKey: 'haptic.tap_action',
            defaultValue: hapticValue,
          })}
          ${this.makeSwitch({
            label: "When executing the 'hold_action' configured for a route",
            configKey: 'haptic.hold_action',
            defaultValue: hapticValue,
          })}
          ${this.makeSwitch({
            label:
              "When executing the 'double_tap_action' configured for a route",
            configKey: 'haptic.double_tap_action',
            defaultValue: hapticValue,
          })}
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
          <div class="editor-row">
            <div class="editor-row-item">
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
            </div>
            <div class="editor-row-item">
              ${this.makeTextInput({
                label: 'Min width',
                configKey: 'desktop.min_width',
                type: 'number',
                suffix: 'px',
                helper: 'Min screen width for desktop mode to be active.',
              })}
            </div>
          </div>
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
          ${this.makeTemplateEditor({
            label: 'Hidden',
            configKey: 'desktop.hidden',
            helper: BOOLEAN_JS_TEMPLATE_HELPER,
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
          ${this.makeTemplateEditor({
            label: 'Hidden',
            configKey: 'mobile.hidden',
            helper: BOOLEAN_JS_TEMPLATE_HELPER,
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
      (e.currentTarget as HTMLElement).classList.remove('drag-over');
      if (dragIndex === dropIndex || isNaN(dragIndex)) return;
      const routes = [...this._config.routes];
      const [moved] = routes.splice(dragIndex, 1);
      routes.splice(dropIndex, 0, moved);
      this.updateConfig({ routes });
    };
    return html`
      <ha-expansion-panel outlined>
        <h4 slot="header">
          <ha-icon icon="mdi:routes"></ha-icon>
          Routes
        </h4>
        <div class="editor-section">
          <div class="routes-container">
            ${this._config.routes.map((route, i) => {
              return html`
                <div
                  class="draggable-route"
                  @dragover=${onDragOver}
                  @dragleave=${onDragLeave}
                  @drop=${(e: DragEvent) => onDrop(e, i)}>
                  <ha-expansion-panel outlined>
                    <div
                      slot="header"
                      class="route-header"
                      draggable="true"
                      @dragstart=${(e: DragEvent) => onDragStart(e, i)}
                      @dragend=${onDragEnd}>
                      <span class="drag-handle" title="Drag to reorder">
                        <ha-icon icon="mdi:drag"></ha-icon>
                      </span>
                      <div class="route-header-title">Route</div>
                      <span class="route-header-summary">
                        ${route.image != undefined
                          ? html`<img
                              src="${route.image}"
                              class="route-header-image" />`
                          : html`<ha-icon icon="${route.icon}"></ha-icon>`}
                        ${route.label
                          ? processTemplate(this.hass, route.label)
                          : ''}
                      </span>
                      <ha-icon-button
                        @click=${e => {
                          e.preventDefault();
                          e.stopPropagation();
                          this.removeRoute(i);
                        }}
                        class="delete-route-btn"
                        label="Delete route">
                        <ha-icon icon="mdi:delete"></ha-icon
                      ></ha-icon-button>
                    </div>
                    <div class="route-editor route-editor-bg">
                      <div class="editor-row">
                        <div class="editor-row-item">
                          ${this.makeTextInput({
                            label: 'URL',
                            configKey: `routes.${i}.url` as any,
                            type: 'text',
                            placeholder: '/path/to/your/dashboard',
                          })}
                        </div>
                      </div>
                      ${this.makeStringOrTemplateEditor({
                        label: 'Label',
                        configKey: `routes.${i}.label` as any,
                        helper: STRING_JS_TEMPLATE_HELPER,
                      })}
                      <div>
                        <label class="editor-label">Route icon</label>
                        <div class="route-grid">
                          ${this.makeIconPicker({
                            label: 'Icon',
                            configKey: `routes.${i}.icon` as any,
                            // TODO JLAQ disabled: iconOrImage !== 'icon',
                          })}
                          ${this.makeIconPicker({
                            label: 'Icon selected',
                            configKey: `routes.${i}.icon_selected` as any,
                            // TODO JLAQ disabled: iconOrImage !== 'icon',
                          })}
                        </div>
                      </div>
                      <div>
                        <label class="editor-label">Route image</label>
                        <div class="route-grid">
                          ${this.makeTextInput({
                            label: 'Image',
                            configKey: `routes.${i}.image` as any,
                            placeholder: 'URL of the image',
                          })}
                          ${this.makeTextInput({
                            label: 'Image selected',
                            configKey: `routes.${i}.image_selected` as any,
                            placeholder: 'URL of the image',
                          })}
                        </div>
                      </div>
                      <div class="route-divider"></div>
                      <ha-expansion-panel outlined>
                        <h5 slot="header">
                          <ha-icon icon="mdi:cog"></ha-icon>
                          Advanced features
                        </h5>
                        <div class="editor-section">
                          ${this.makeTemplateEditor({
                            label: 'Hidden',
                            configKey: `routes.${i}.hidden` as any,
                            helper: BOOLEAN_JS_TEMPLATE_HELPER,
                          })}
                          ${this.makeTemplateEditor({
                            label: 'Selected',
                            configKey: `routes.${i}.selected` as any,
                            helper: BOOLEAN_JS_TEMPLATE_HELPER,
                          })}
                        </div>
                      </ha-expansion-panel>
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
          </div>
          <ha-button @click=${this.addRoute} outlined>
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
        ${this.renderMobileEditor()} ${this.renderHapticsEditor()}
        ${this.renderStylesEditor()}
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
