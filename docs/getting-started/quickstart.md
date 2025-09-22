---
icon: bolt
layout:
  width: default
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
  metadata:
    visible: true
---

# Quickstart

1. **Edit your home assistant dashboard:** Go to your dashboard in home assistant and enter edit mode
2. **Add the Navbar Card:** Click to add a new card, search for "navbar-card", and add it anywhere in your dashboard layout (doesn't matter where, navbar-card will automatically float to the bottom on mobile devices, and to the position you have configured for desktop devices).
3. **Configure your routes:** In the card configuration, define a few routes to the views you want quick access to. For example:

```yaml
type: custom:navbar-card
routes:
  - url: /lovelace/home
    icon: mdi:home
    label: Home
  - url: /lovelace/lights
    icon: mdi:lightbulb-outline
    label: Lights
  - url: /lovelace/devices
    icon: mdi:devices
    label: Devices
```

Save your dashboard. The navbar will now appear and let you quickly switch between your configured views!
