
# Navbar Card
![navbar-card](https://github.com/user-attachments/assets/df2a9a5d-51ec-4786-8f54-36ece2aa6f9a)

Navbar Card is a custom Lovelace card that simplifies navigation within your Home Assistant dashboard. This card provides a sleek, responsive navigation bar that appears at the bottom of the screen on mobile devices and on the side for desktop users.

[![Version](https://img.shields.io/github/v/release/joseluis9595/lovelace-navbar-card)](#)
[![Last commit](https://img.shields.io/github/last-commit/joseluis9595/lovelace-navbar-card)](#)
![Downloads](https://img.shields.io/github/downloads/joseluis9595/lovelace-navbar-card/total)

## 🚀 Installation
### Via HACS (recommended)
1. Go to HACS in Home Assistant.
2. Search for "Navbar Card".
3. Click Install!


### Adding the Card to Your Dashboard
To get started, edit your dashboard, click on "New card", and add the following configuration:

```yaml
type: custom:navbar-card
routes:
  - url: /lovelace/home
    icon: mdi:home-outline
    icon_selected: mdi:home-assistant
  - url: /lovelace/devices
    icon: mdi:devices
  - url: /lovelace/temperature
    icon: mdi:thermometer
  - url: /lovelace/control
    icon: mdi:creation-outline
    icon_selected: mdi:creation
  - url: /lovelace/system
    icon: mdi:cog-outline
    icon_selected: mdi:cog
```

## ⚙️ Configuration
- routes: Define your navigation items.
  - url: The path to a Lovelace view.
  - icon: The default icon.
  - icon_selected: (Optional) The icon displayed when the view is active.
 
![navbar-card-badge](https://github.com/user-attachments/assets/5f548ce3-82b5-422f-a084-715bc73846b0)


#### Example Configuration
```yaml
type: custom:navbar-card
routes:
  - url: /lovelace/home
    icon: mdi:home-outline
    icon_selected: mdi:home-assistant
  - url: /lovelace/devices
    icon: mdi:devices
  - url: /lovelace/system
    icon: mdi:cog-outline
    icon_selected: mdi:cog
```
