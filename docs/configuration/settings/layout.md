# Layout

| Name                  |                  Type                  | Default | Description                                                                                           |
| --------------------- | :------------------------------------: | :-----: | ----------------------------------------------------------------------------------------------------- |
| auto\_padding         | [Auto Padding](layout.md#auto-padding) |    -    | Add padding to your Home Asistant dashboard to prevent overlaps                                       |
| reflect\_child\_state |                `boolean`               |    -    | Determines if each route item should be displayed as selected when any of its popup items is selected |
|                       |                                        |         |                                                                                                       |

#### Auto padding

Automatically adds padding to your Home Assistnat dashboard to prevent cards from overlapping with `navbar-card`. This eliminates the need for manual CSS padding adjustments in your Home Assistant theme.

| Name        |    Type   | Default | Description                                                                  |
| ----------- | :-------: | :-----: | ---------------------------------------------------------------------------- |
| enabled     | `boolean` |  `true` | Whether to automatically add padding to prevent overlaps                     |
| desktop\_px |  `number` |  `100`  | Padding in pixels for desktop mode (applied to left/right based on position) |
| mobile\_px  |  `number` |   `80`  | Padding in pixels for mobile mode (applied to bottom)                        |
|             |           |         |                                                                              |

{% hint style="info" %}
**Note**: The `desktop_px` padding is automatically applied to the appropriate side based on your navbar's `desktop.position` setting.
{% endhint %}
