import { Constructor } from '@/mixins';
import { processTemplate } from '@/utils';

export function Routable<TBase extends Constructor>(Base: TBase) {
  return class Routable extends Base {
    get url() {}

    get icon() {
      return (this._iconInstance ??= new Icon(this._navbarCard, this));
    }

    get badge() {
      return (this._badgeInstance ??= new Badge(this._navbarCard, this));
    }

    get label(): string | null {
      if (!this._shouldShowLabels()) return null;
      return (
        processTemplate<string>(
          this._navbarCard._hass,
          this._navbarCard,
          this.data.label,
        ) ?? ' '
      );
    }

    get hidden() {
      return processTemplate<boolean>(
        this._navbarCard._hass,
        this._navbarCard,
        this.data.hidden,
      );
    }

    get selected() {
      return this.data.selected != null
        ? processTemplate<boolean>(
            this._navbarCard._hass,
            this._navbarCard,
            this.data.selected,
          )
        : window.location.pathname === this.url;
    }

    protected _shouldShowLabels = (): boolean => {
      const config = this._navbarCard.isDesktop
        ? this._navbarCard.config?.desktop?.show_labels
        : this._navbarCard.config?.mobile?.show_labels;

      if (typeof config === 'boolean') return config;

      return (
        (config === 'popup_only' && this instanceof PopupItem) ||
        (config === 'routes_only' && !(this instanceof PopupItem))
      );
    };
  };
}

export type IsRoutable = InstanceType<ReturnType<typeof Routable>>;
