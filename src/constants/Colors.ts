type ColorValue = `#${string}`;

type ColorTheme = {
  text: ColorValue;
  secondary?: ColorValue;
  background: ColorValue;
  tint: ColorValue;
  icon: ColorValue;
  tabIconDefault: ColorValue;
  tabIconSelected: ColorValue;
}

type ColorScheme = {
  light: ColorTheme;
  dark: ColorTheme;
}

const tintColorLight: ColorValue = '#334FBA';
const tintColorDark: ColorValue = '#fff';

export const Colors: ColorScheme = {
  light: {
    text: '#101142',
    secondary: '#151718',
    background: '#fff',
    tint: tintColorLight,
    icon: '#334FBA',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#101142',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
