import { theme as themeValue } from './defaults';

const lightThemeColors = {
  '--foreground-color': ' #24292E',
  '--background-color': '#FFFFFF',
  '--gray-color': '#C0C1C1',
  '--primary-color': '#3778C2',
  '--primary-darker-color': '#28559A',
  '--secondary-color': '#FF6801',
  '--danger-color': '#CC0000',
};

const darkThemeColors = {
  '--foreground-color': '#C9D1D9',
  '--background-color': '#0D1117',
  '--gray-color': '#454444',
  '--primary-color': '#4B9FE1',
  '--primary-darker-color': '#63BCE5',
  '--secondary-color': '#FF6801',
  '--danger-color': '#CC0000',
};

function updateColors(colors) {
  return Object.keys(colors).reduce((acc, cur) => {
    document.documentElement.style.setProperty(cur, colors[cur]);
    acc[cur] = colors[cur];
    return acc;
  }, colors);
}

function Theme() {
  this.colors = updateColors(
    themeValue === 'light' ? lightThemeColors : darkThemeColors
  );
}

const theme = new Theme();

export default theme;
