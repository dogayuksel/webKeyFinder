import { theme as themeValue } from './defaults';

const themeColorKeys = [
  '--foreground-color',
  '--background-color',
  '--gray-color',
  '--primary-color',
  '--primary-darker-color',
  '--secondary-color',
  '--danger-color',
] as const;

type TThemeColors = {
  [K in (typeof themeColorKeys)[number]]: string;
};

const lightThemeColors: TThemeColors = {
  '--foreground-color': ' #24292e',
  '--background-color': '#ffffff',
  '--gray-color': '#c0c1c1',
  '--primary-color': '#3778c2',
  '--primary-darker-color': '#28559a',
  '--secondary-color': '#ff6801',
  '--danger-color': '#cc0000',
};

const darkThemeColors: TThemeColors = {
  '--foreground-color': '#C9D1D9',
  '--background-color': '#0D1117',
  '--gray-color': '#454444',
  '--primary-color': '#4B9FE1',
  '--primary-darker-color': '#63BCE5',
  '--secondary-color': '#FF6801',
  '--danger-color': '#CC0000',
};

function updateColors(colors: TThemeColors) {
  themeColorKeys.forEach((colorKey) => {
    document.documentElement.style.setProperty(colorKey, colors[colorKey]);
  });
  return colors;
}

class Theme {
  colors: TThemeColors;

  constructor() {
    this.colors = updateColors(
      themeValue === 'light' ? lightThemeColors : darkThemeColors
    );
    document.documentElement.style.setProperty('color-scheme', themeValue);
    document.documentElement.style.setProperty(
      'accent-color',
      this.colors['--primary-color']
    );
  }
}

const theme = new Theme();

export default theme;
