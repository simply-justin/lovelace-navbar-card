import { HomeAssistant } from 'custom-card-helpers';
import { DeepPartial } from './types';

/**
 * Map string to enum value
 *
 * @param enumType Enum type to map to
 * @param value Value to map
 * @returns Enum value or undefined if not found
 */
export const mapStringToEnum = <T extends Record<string, unknown>>(
  enumType: T,
  value: string,
): T[keyof T] | undefined => {
  if (Object.values(enumType).includes(value)) {
    return value as T[keyof T];
  }
  return undefined;
};

/**
 *  Badge visibility evaluator
 */
export const processBadgeTemplate = (
  hass: HomeAssistant,
  template?: string,
): boolean => {
  if (!template || !hass) return false;
  try {
    // Dynamically evaluate template with current Home Assistant context
    const func = new Function('states', `return ${template}`);
    return func(hass.states) as boolean;
  } catch (e) {
    console.error(`NavbarCard: Error evaluating badge template: ${e}`);
    return false;
  }
};

/**
 *  Process template with Home Assistant states
 *
 *  @param hass Home Assistant instance
 *  @param template Template string to be processed
 */
export const processTemplate = (hass: HomeAssistant, template?: unknown) => {
  if (!template || !hass) return template;

  // Check if template is of type string
  if (typeof template !== 'string') return template;

  // Valid template starts with [[ and ends with ]]]
  if (!(template.trim().startsWith('[[[') && template.trim().endsWith(']]]'))) {
    return template;
  }

  // Run template against home assistant states
  try {
    const cleanedTemplate = cleanTemplate(template);
    const func = new Function('states', 'user', 'hass', cleanedTemplate);
    return func(hass.states, hass.user, hass);
  } catch (e) {
    console.error(`NavbarCard: Error evaluating template: ${e}`);
    return template;
  }
};

/**
 * Removes navbar-card template delimiters ([[[ and ]]]) from a template string.
 *
 * @param template - The template string to clean (e.g., '[[[ some code ]]]').
 * @returns The template string without the wrapping delimiters.
 */
export const cleanTemplate = (template: string) => {
  return template.replace(/\[\[\[|\]\]\]/g, '');
};

/**
 * Adds navbar-card template delimiters ([[[ and ]]]), if not already present, to a template string.
 *
 * @param template - The template string to wrap (e.g., 'some code').
 * @returns The template string wrapped with triple brackets if not already wrapped.
 */
export const wrapTemplate = (template: string) => {
  const trimmed = template.trim();
  if (trimmed.startsWith('[[[') && trimmed.endsWith(']]]')) {
    return template;
  }
  return `[[[${template}]]]`;
};

export const fireDOMEvent = (
  node: HTMLElement | Window,
  type: Event['type'],
  options?: { bubbles?: boolean; composed?: boolean },
  detail?: unknown,
) => {
  const event = new Event(type, options ?? {});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (event as any).detail = detail;
  node.dispatchEvent(event);
  return event;
};

export const hapticFeedback = (hapticType: string = 'selection') => {
  return fireDOMEvent(window, 'haptic', undefined, hapticType);
};

/**
 * Deep merges data from "newData" into "item", completely replacing arrays
 * instead of merging them
 *
 * @param item Original item
 * @param newData New data to deepmerge and override
 */
export function deepMergeKeepArrays<T>(item: T, newData: DeepPartial<T>): T {
  if (Array.isArray(newData)) {
    // Replace arrays entirely
    return newData as T;
  } else if (
    newData !== null &&
    typeof newData === 'object' &&
    item !== null &&
    typeof item === 'object'
  ) {
    // Merge objects
    const result = { ...item } as Record<string, unknown>;
    for (const key in newData) {
      if (newData[key] === null) {
        // Remove key if newData[key] is null
        delete result[key];
      } else if (newData[key] !== undefined) {
        result[key] = deepMergeKeepArrays(
          (item as Record<string, unknown>)[key],
          newData[key],
        );
      }
      // If newData[key] is undefined, keep the original
    }
    return result as T;
  } else if (newData !== undefined) {
    // For primitives or if newData is defined, use newData
    return newData as T;
  }
  // If newData is undefined, keep the original item
  return item;
}
