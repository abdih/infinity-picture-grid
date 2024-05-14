/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

// Composables
import { createVuetify } from 'vuetify';

export const thresholds = {
  sm: 0,
  md: 391,
  lg: 1921,
  xl: Infinity,
};

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'dark',
  },
  display: {
    // Our intention is to have the following breakpoints:
    //   - small: 0 <= 390 (mobile breakpoint)
    //   - medium: > 390 and <= 1920
    //   - large: > 1920
    //
    // Given the implementation of Vuetify's classification of a width to
    // a breakpoint (inside vuetify/lib/composables/display.mjs), the fact
    // that <number> < undefined is false, and that default thresholds get
    // applied unless we specify values, the following configuration seems
    // correct:
    mobileBreakpoint: 'md',
    thresholds,
  },
});
