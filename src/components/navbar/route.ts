import { html, LitElement, TemplateResult } from 'lit';
import { Routable, Actionable } from '@/mixins';
import { processTemplate } from '@/utils';

export class Route extends Actionable(Routable(LitElement)) {
  private _popupInstance?: Popup;

  constructor() {
    super();
    this._validateConfig();
  }

  get popup(): Popup {
    return (this._popupInstance ??= new Popup(
      this._navbarCard,
      processTemplate<PopupItem[]>(
        this._navbarCard._hass,
        this._navbarCard,
        this._routeData.popup,
      ) ??
        this._routeData.popup ??
        this._routeData.submenu,
    ));
  }

  /**
   * Determines if this route or any of its children is active.
   * Used to apply "active" styling in the UI.
   */
  get isActive(): boolean {
    const reflectChild = this._navbarCard.config?.layout?.reflect_child_state;
    return reflectChild && !this.selected
      ? this.popup.items.some(item => item.selected)
      : this.selected;
  }

  public render(): TemplateResult | null {
    if (this.hidden) return null;

    const isActive = this.isActive;

    return html`
      <div
        class="route ${isActive ? 'active' : ''}"
        @mouseenter=${(e: PointerEvent) =>
          this._events.handleMouseEnter(e as unknown as MouseEvent, this)}
        @mousemove=${(e: PointerEvent) =>
          this._events.handleMouseMove(e as unknown as MouseEvent, this)}
        @mouseleave=${(e: PointerEvent) =>
          this._events.handleMouseLeave(e as unknown as MouseEvent, this)}
        @pointerdown=${(e: PointerEvent) =>
          this._events.handlePointerDown(e, this)}
        @pointermove=${(e: PointerEvent) =>
          this._events.handlePointerMove(e, this)}
        @pointerup=${(e: PointerEvent) => this._events.handlePointerUp(e, this)}
        @pointercancel=${(e: PointerEvent) =>
          this._events.handlePointerMove(e, this)}>
        <div class="button ${isActive ? 'active' : ''}">
          ${this.icon.render()}
          <ha-ripple></ha-ripple>
        </div>
        ${this.label
          ? html`<div class="label ${isActive ? 'active' : ''}">
              ${this.label}
            </div>`
          : html``}
        ${this.badge.render()}
      </div>
    `;
  }

  /**
   * Validates the route configuration on creation.
   * Ensures required properties and actionable options exist.
   *
   * @throws Will throw an error if required fields or actions are missing.
   */
  private _validateConfig(): void {
    if (!this.data.icon && !this.data.image)
      throw new Error('Route requires "icon" or "image"');

    if (
      !this.url &&
      !this._routeData.popup &&
      !this.tap_action &&
      !this.hold_action &&
      !this.double_tap_action
    )
      throw new Error(
        'Route requires at least one action (url, popup, tap_action, hold_action, double_tap_action)',
      );

    ['tap_action', 'hold_action', 'double_tap_action'].forEach(actionKey => {
      const action = (this as any)[actionKey];
      if (action && !action.action)
        throw new Error(`${actionKey} must have an "action" property`);
    });
  }
}
