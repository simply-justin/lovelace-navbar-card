import { css, CSSResult } from 'lit';

const HOST_STYLES = css`
  :host {
    --navbar-background-color: var(--card-background-color);
    --navbar-route-icon-size: 24px;
    --navbar-route-image-size: 32px;
    --navbar-primary-color: var(--primary-color);
    --navbar-box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.14);
    --navbar-box-shadow-desktop: var(--material-shadow-elevation-2dp);

    --navbar-z-index: 3;
    --navbar-popup-backdrop-index: 900;
    --navbar-popup-index: 901;
  }
`;

const NAVBAR_STYLES = css`
  .navbar {
    background: var(--navbar-background-color);
    border-radius: 0px;
    box-shadow: var(--navbar-box-shadow);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    gap: 10px;
    width: 100vw;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: unset;
    z-index: var(--navbar-z-index);
  }

  /* Edit mode styles */
  .navbar.edit-mode {
    position: relative !important;
    flex-direction: row !important;
    left: unset !important;
    right: unset !important;
    bottom: unset !important;
    top: unset !important;
    width: auto !important;
    transform: none !important;
  }

  /* Desktop mode styles */
  .navbar.desktop {
    border-radius: var(--ha-card-border-radius, 12px);
    box-shadow: var(--navbar-box-shadow-desktop);
    width: auto;
    justify-content: space-evenly;

    --navbar-route-icon-size: 28px;
  }
  .navbar.desktop.bottom {
    flex-direction: row;
    top: unset;
    right: unset;
    bottom: 16px;
    left: calc(50% + var(--mdc-drawer-width, 0px) / 2);
    transform: translate(-50%, 0);
  }
  .navbar.desktop.top {
    flex-direction: row;
    bottom: unset;
    right: unset;
    top: 16px;
    left: calc(50% + var(--mdc-drawer-width, 0px) / 2);
    transform: translate(-50%, 0);
  }
  .navbar.desktop.left {
    flex-direction: column;
    left: calc(var(--mdc-drawer-width, 0px) + 16px);
    right: unset;
    bottom: unset;
    top: 50%;
    transform: translate(0, -50%);
  }
  .navbar.desktop.right {
    flex-direction: column;
    right: 16px;
    left: unset;
    bottom: unset;
    top: 50%;
    transform: translate(0, -50%);
  }
`;

const ROUTE_STYLES = css`
  .route {
    cursor: pointer;
    max-width: 60px;
    width: 100%;
    position: relative;
    text-decoration: none;
    color: var(--primary-text-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    --icon-primary-color: var(--state-inactive-color);
  }

  /* Button styling */
  .button {
    position: relative;
    height: 36px;
    width: 100%;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .button.active {
    background: color-mix(
      in srgb,
      var(--navbar-primary-color) 30%,
      transparent
    );
    --icon-primary-color: var(--navbar-primary-color);
  }

  /* Icon and Image styling */
  .icon {
    --mdc-icon-size: var(--navbar-route-icon-size);
  }

  .image {
    width: var(--navbar-route-image-size);
    height: var(--navbar-route-image-size);
    object-fit: contain;
  }

  .image.active {
  }

  /* Label styling */
  .label {
    flex: 1;
    width: 100%;
    /* TODO fix ellipsis*/
    text-align: center;
    font-size: var(--paper-font-caption_-_font-size, 12px);
    font-weight: 500;
  }

  /* Badge styling */
  .badge {
    position: absolute;
    top: 0;
    right: 0;
    border-radius: 999px;
    width: 12px;
    height: 12px;
  }
  .badge.with-counter {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 16px;
    width: auto !important;
    min-width: 16px;
    padding: 0px 2px;
    font-weight: bold;
    font-size: 11px;
    line-height: 11px;
  }

  /* Desktop mode styles */
  .navbar.desktop .route {
    height: 60px;
    width: 60px;
  }
  .navbar.desktop .button {
    flex: unset;
    height: 100%;
  }
`;

const POPUP_STYLES = css`
  /****************************************/
  /* Backdrop */
  /****************************************/
  .navbar-popup-backdrop {
    position: fixed;
    background: rgba(0, 0, 0, 0.3);
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    z-index: var(--navbar-popup-backdrop-index);
    transition: opacity 0.2s ease;
  }

  .navbar-popup-backdrop.visible {
    opacity: 1;
  }

  /****************************************/
  /* Main popup container */
  /****************************************/
  .navbar-popup {
    pointer-events: none;
    position: fixed;
    opacity: 0;
    padding: 6px;
    gap: 10px;
    z-index: var(--navbar-popup-index);

    display: flex;
    justify-content: center;

    transition: all 0.2s ease;
    transform-origin: bottom left;
  }

  .navbar-popup.open-up {
    flex-direction: column-reverse;
    margin-bottom: 32px;
    transform: translate(0, -100%);
  }

  .navbar-popup.open-bottom {
    flex-direction: column;
    margin-top: 32px;
  }

  .navbar-popup.open-right {
    flex-direction: row;
    margin-left: 32px;
  }

  .navbar-popup.open-left {
    flex-direction: row-reverse;
    margin-right: 32px;
  }

  .navbar-popup.label-right {
    align-items: flex-start;
  }

  .navbar-popup.label-left {
    align-items: flex-end;
  }

  .navbar-popup.visible {
    opacity: 1;
  }

  /****************************************/
  /* Popup item styles */
  /****************************************/

  .popup-item {
    pointer-events: auto;
    cursor: pointer;
    color: var(--primary-text-color);
    display: flex;
    flex-direction: column;
    --icon-primary-color: var(--primary-text-color);
    display: flex;
    flex-direction: row-reverse;
    width: fit-content;
    height: fit-content;
    gap: 6px;
    align-items: center;

    opacity: 0;
    transform: translateY(10px);
    transition: filter 0.2s ease;
    transition: all 0.2s ease;
  }

  .navbar-popup.visible .popup-item {
    opacity: 1;
    transform: translateY(0);
    transition-delay: calc(var(--index) * 0.05s);
  }

  .navbar-popup.visible .popup-item {
    opacity: 1;
    transform: translateY(0);
    transition-delay: calc(var(--index) * 0.05s);
  }

  .popup-item.label-bottom {
    flex-direction: column;
    max-width: 80px;
  }

  .popup-item.label-left {
    flex-direction: row-reverse;
  }

  .popup-item.label-right {
    flex-direction: row;
  }

  .popup-item.label-left .label {
    text-align: end;
  }

  .popup-item.label-right .label {
    text-align: start;
  }

  .popup-item .button {
    width: 50px;
    height: 50px;
    background: var(--navbar-background-color);
    box-shadow: var(--navbar-box-shadow-desktop);
  }
`;

const EDITOR_STYLES = css`
  .navbar-editor {
    display: flex;
    flex-direction: column;
    gap: 6px;

    ha-textfield {
      width: 100%;
    }
  }
  .editor-section {
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 12px;
  }
  .editor-row {
    gap: 6px;
    display: flex;
    flex-direction: row;
  }
  .editor-row-item {
    flex: 1;

    ha-textfield {
      width: 100%;
    }
  }
  @media (max-width: 600px) {
    .editor-row {
      flex-direction: column !important;
      gap: 0.5em;
    }
    .route-grid {
      grid-template-columns: 1fr !important;
    }
    .editor-row-item {
      width: 100%;
    }
  }
  .editor-label {
    font-weight: 500;
  }
  .routes-container {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
  }
  ha-expansion-panel {
    h4[slot='header'],
    h5[slot='header'],
    h6[slot='header'] {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.7em;
      padding: 0.2em 0.5em 0.2em 0;
      height: 40px;
      margin: 0px !important;
      margin-left: 1em;

      .expansion-panel-title {
        flex: 1;
      }
    }
  }
  .route-header {
    display: flex;
    align-items: center;
    gap: 0.7em;
    padding: 0.2em 0.5em 0.2em 0;
  }
  .route-header-title {
    font-weight: bold;
    color: var(--primary-color);
  }
  .route-header-summary {
    flex: 1;
    opacity: 0.7;
    font-size: 0.95em;
    display: flex;
    align-items: center;
    gap: 0.3em;
  }
  .route-header-image {
    height: 1.2em;
    vertical-align: middle;
  }
  .route-editor {
    display: flex;
    flex-direction: column;
    gap: 1em;
    background: var(--primary-background-color);
    border-radius: 8px;
    padding: 1em 1.2em 1.2em 1.2em;
    margin: 1em 0em;
  }
  .popup-controls {
    display: flex;
    gap: 0.5em;
    margin-bottom: 1em;
  }
  .route-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1em;
  }
  .route-divider {
    margin: 1.5em 0 1em 0;
    border: none;
    border-top: 1px solid #e0e0e0;
    height: 1px;
    background: none;
  }
  .add-popup-btn {
    margin-top: 1em;
  }
  .template-editor-container {
    display: flex;
    flex-direction: column;
    gap: 0.3em;
    margin-bottom: 0.7em;
  }
  .template-editor-helper {
    font-size: 0.93em;
    color: var(--secondary-text-color, #888);
  }
`;

// Drag-and-drop styles for routes editor
export const ROUTES_EDITOR_DND_STYLES = css`
  .draggable-route {
    border: 1.5px dashed transparent;
    border-radius: 8px;
    transition:
      border-color 0.2s,
      background 0.2s;
    background: none;
    position: relative;
  }
  .draggable-route.drag-over {
    border-color: var(--primary-color, #03a9f4);
    background: rgba(3, 169, 244, 0.08);
  }
  .draggable-route.dragging {
    opacity: 0.6;
    background: #eee;
    z-index: 2;
  }
  .drag-handle {
    cursor: grab;
    margin-right: 8px;
    color: var(--primary-color, #03a9f4);
    vertical-align: middle;
    display: inline-flex;
    align-items: center;
  }
  .delete-btn ha-icon {
    color: var(--error-color, #db4437) !important;
  }
`;

/**
 * Custom function to apply default styles instead of using lit's static
 * styles(), so that we can prioritize user custom styles over the default
 * ones defined in this card
 */
export const getDefaultStyles = (): CSSResult => {
  // Mobile-first css styling
  return css`
    ${HOST_STYLES}
    ${NAVBAR_STYLES}
    ${ROUTE_STYLES}
    ${POPUP_STYLES}
  `;
};

export const getEditorStyles = (): CSSResult => {
  return css`
    ${EDITOR_STYLES}
    ${ROUTES_EDITOR_DND_STYLES}
  `;
};
