import Color from 'color';
import TinyColor from 'tinycolor2';

interface StringIter {
  [index: string]: any,
}



export const defaultTheme = {
  "name": "Default",
}
export const darkTheme = {
  "name": "Dark",
  "text": "#ffffff",
  "background": "#000000",
  "primary": "#ffffff"
}


export const blueTheme = {
  "name": "Blue",
  "text": "#268bd2",
}
export const darkBlueTheme = {
  "name": "Dark Blue",
  "text": "#59bef5",
  "background": "#000000",
  "primary": "#59bef5"
}

export const pinkTheme = {
  "name": "Pink",
  "text": "#d8268b",
  "primary": "#d8268b"
}
export const darkPinkTheme = {
  "name": "Dark Pink",
  "text": "#d8268b",
  "background" : "#000000",
  "primary": "#d8268b"
}

export const themePack = [
  defaultTheme, darkTheme, pinkTheme, blueTheme, darkBlueTheme, darkPinkTheme
]

function mix(c1:string, c2:string, ratio:number) {
  let color = Color(c1);
  return color.mix(Color(c2), ratio).hex();
}

function contrast(color:any, ratio?: number) {
  ratio = ratio ? ratio : 80;
  color = TinyColor(color);
  return color.isDark() ? color.lighten(ratio) : color.darken(ratio);
}

function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? parseInt(result[1], 16).toString() + "," +
                  parseInt(result[2], 16).toString() + "," +
                  parseInt(result[3], 16) : "";
}

export default function setTheme(colors: any) {
  let defaults = {
    primary: '#268bd2',
    secondary: '#0cd1e8',
    tertiary: '#7044ff',
    success: '#10dc60',
    warning: '#ffce00',
    danger: '#f04141',
    dark: '#222428',
    medium: '#989aa2',
    light: '#f4f4f4',
    background: '#ffffff',
    text: '#121212',
  };

  colors = { ...defaults, ...colors };

  const {
    primary,
    secondary,
    tertiary,
    success,
    warning,
    danger,
    dark,
    medium,
    light,
    background,
    text
  } = colors;

  const shadeRatio = 0.1;
  const tintRatio = 0.1;

  let template:StringIter = {
      "--ion-background-color": background,
      "--ion-background-color-rgb": hexToRgb(background),

      "--ion-text-color": text,
      "--ion-text-color-rgb": hexToRgb(text),

      "--ion-backdrop-color": "",
      "--ion-overlay-background-color": "",
      "--ion-border-color": "",
      "--ion-box-shadow-color": "",

      "--ion-tab-bar-background": "",
      "--ion-tab-bar-background-focused": "",
      "--ion-tab-bar-border-color": primary,
      "--ion-tab-bar-color": contrast(background, 40),
      "--ion-tab-bar-color-activated": primary,

//      "--ion-toolbar-background": primary,
      "--ion-toolbar-border-color": "",
//      "--ion-toolbar-color": contrast(primary),
      "--ion-toolbar-color-activated": "",
      "--ion-toolbar-color-unchecked": "",
      "--ion-toolbar-color-checked": "",

      "--ion-item-background": "",
      "--ion-item-background-activated": "",
      "--ion-item-border-color": "",
      "--ion-item-color": "",
      "--ion-placeholder-color": "",

      "--ion-color-primary": primary,
      "--ion-color-primary-rgb": hexToRgb(primary),
      "--ion-color-primary-contrast": contrast(primary),
      "--ion-color-primary-contrast-rgb": hexToRgb(contrast(primary)),
      "--ion-color-primary-shade":  Color(primary).darken(shadeRatio).hex(),
      "--ion-color-primary-tint":  Color(primary).lighten(tintRatio).hex(),

      "--ion-color-secondary": secondary,
      "--ion-color-secondary-rgb": hexToRgb(secondary),
      "--ion-color-secondary-contrast": contrast(secondary),
      "--ion-color-secondary-contrast-rgb": hexToRgb(contrast(secondary)),
      "--ion-color-secondary-shade":  Color(secondary).darken(shadeRatio).hex(),
      "--ion-color-secondary-tint": Color(secondary).lighten(tintRatio).hex(),

      "--ion-color-tertiary":  tertiary,
      "--ion-color-tertiary-rgb": hexToRgb(tertiary),
      "--ion-color-tertiary-contrast": contrast(tertiary),
      "--ion-color-tertiary-contrast-rgb": hexToRgb(contrast(tertiary)),
      "--ion-color-tertiary-shade": Color(tertiary).darken(shadeRatio).hex(),
      "--ion-color-tertiary-tint":  Color(tertiary).lighten(tintRatio).hex(),

      "--ion-color-success": success,
      "--ion-color-success-rgb": hexToRgb(success),
      "--ion-color-success-contrast": contrast(success),
      "--ion-color-success-contrast-rgb": hexToRgb(contrast(success)),
      "--ion-color-success-shade": Color(success).darken(shadeRatio).hex(),
      "--ion-color-success-tint": Color(success).lighten(tintRatio).hex(),

      "--ion-color-warning": warning,
      "--ion-color-warning-rgb": hexToRgb(warning),
      "--ion-color-warning-contrast": contrast(warning),
      "--ion-color-warning-contrast-rgb": hexToRgb(contrast(warning)),
      "--ion-color-warning-shade": Color(warning).darken(shadeRatio).hex(),
      "--ion-color-warning-tint": Color(warning).lighten(tintRatio).hex(),

      "--ion-color-danger": danger,
      "--ion-color-danger-rgb": hexToRgb(danger),
      "--ion-color-danger-contrast": contrast(danger),
      "--ion-color-danger-contrast-rgb": hexToRgb(contrast(danger)),
      "--ion-color-danger-shade": Color(danger).darken(shadeRatio).hex(),
      "--ion-color-danger-tint": Color(danger).lighten(tintRatio).hex(),

      "--ion-color-dark": dark,
      "--ion-color-dark-rgb": hexToRgb(dark),
      "--ion-color-dark-contrast": contrast(dark),
      "--ion-color-dark-contrast-rgb": hexToRgb(contrast(dark)),
      "--ion-color-dark-shade": Color(dark).darken(shadeRatio).hex(),
      "--ion-color-dark-tint": Color(dark).lighten(tintRatio).hex(),

      "--ion-color-medium": medium,
      "--ion-color-medium-rgb": hexToRgb(medium),
      "--ion-color-medium-contrast": contrast(medium),
      "--ion-color-medium-contrast-rgb": hexToRgb(contrast(medium)),
      "--ion-color-medium-shade": Color(medium).darken(shadeRatio).hex(),
      "--ion-color-medium-tint": Color(medium).lighten(tintRatio).hex(),

      "--ion-color-light": light,
      "--ion-color-light-rgb": hexToRgb(light),
      "--ion-color-light-contrast": contrast(light),
      "--ion-color-light-contrast-rgb": hexToRgb(contrast(light)),
      "--ion-color-light-shade": Color(light).darken(shadeRatio).hex(),
      "--ion-color-light-tint": Color(light).lighten(tintRatio).hex(),
  };

  for (let prop in template) {
    if (template[prop] !== "") {
//      CSSString = CSSString + prop + ": " + template[prop] + ";\n";
      document.documentElement.style.setProperty(prop, template[prop]);
    }
  }
  for (let step = 50; step < 1000; step += 50) {
//    CSSString = CSSString + `--ion-color-step-${step}: ${mix(background, text, step * .001)};\n`
    document.documentElement.style.setProperty(`--ion-color-step-${step}`, mix(background, text, step * .001));
  }
//  console.log(getComputedStyle(document.documentElement).getPropertyValue("--ion-color-primary"));
//  document.body.style.cssText = CSSString;
  return template;
}
