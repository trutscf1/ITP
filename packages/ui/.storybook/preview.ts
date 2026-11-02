import type { Decorator, Preview } from "@storybook/react-vite";
import { applyTheme, defaultTheme, isTheme, themes } from "../src/theme";
import "./storybook.css";

/** Shows every story in the theme chosen in the toolbar, light by default. */
const withTheme: Decorator = (Story, context) => {
  const theme = isTheme(context.globals.theme)
    ? context.globals.theme
    : defaultTheme;
  applyTheme(document.documentElement, theme);
  return Story();
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Theme of the design system",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: themes.map((theme) => ({ value: theme, title: theme })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: defaultTheme },
};

export default preview;
