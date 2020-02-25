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

export const steelGrey = {
  "name": "Steel Grey",
  "text" : "#928DAB",
  "background": "#1F1C2C",
  "primary": "#928DAB",
}

export const juicyOrange = {
  "name": "Juicy Orange",
  "text": "#FFC837",
  "background": "#FF8008",
  "primary": "#FFC837"
}

export const mojito = {
  "name": "Mojito",
  "text": "#93F9B9",
  "background": "#1D976C",
  "primary": "#93F9B9"
}

export const royal = {
  "name": "Royal",
  "text": "#a8CDDA",
  "background": "#1D2B64",
  "primary": "#a8CDDA"
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
  defaultTheme, darkTheme, pinkTheme, blueTheme, darkBlueTheme, darkPinkTheme, steelGrey, juicyOrange, mojito, royal
]

function mix(c1:string, c2:string, ratio:number) {
//  let color = TinyColor(c1);
  return TinyColor.mix(c1, c2, ratio).toString("hex");
}

function contrast(color:any, ratio?: number) {
  ratio = ratio ? ratio : 80;
  color = TinyColor(color);
  return color.isDark() ? color.lighten(ratio).toString("hex") : color.darken(ratio).toString("hex");
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

  const shadeRatio = 10;
  const tintRatio = 10;

  let template:StringIter = {
      "--ion-background-color": background,
      "--ion-background-color-rgb": hexToRgb(background),

      "--ion-text-color": text,
      "--ion-text-color-rgb": hexToRgb(text),

      "--ion-backdrop-color": "",
      "--ion-overlay-background-color": "",
      "--ion-border-color": "",
      "--ion-box-shadow-color": "",

      "--ion-tab-bar-background": "var(--ion-color-step-50)",
      "--ion-tab-bar-background-focused": "",
      "--ion-tab-bar-border-color": primary,
      "--ion-tab-bar-color": TinyColor(primary).darken(30).toString("hex"),
      "--ion-tab-bar-color-activated": TinyColor(primary).lighten(10).toString("hex"),

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
      "--ion-color-primary-shade":  TinyColor(primary).darken(shadeRatio).toString("hex"),
      "--ion-color-primary-tint":  TinyColor(primary).lighten(tintRatio).toString("hex"),

      "--ion-color-secondary": secondary,
      "--ion-color-secondary-rgb": hexToRgb(secondary),
      "--ion-color-secondary-contrast": contrast(secondary),
      "--ion-color-secondary-contrast-rgb": hexToRgb(contrast(secondary)),
      "--ion-color-secondary-shade":  TinyColor(secondary).darken(shadeRatio).toString("hex"),
      "--ion-color-secondary-tint": TinyColor(secondary).lighten(tintRatio).toString("hex"),

      "--ion-color-tertiary":  tertiary,
      "--ion-color-tertiary-rgb": hexToRgb(tertiary),
      "--ion-color-tertiary-contrast": contrast(tertiary),
      "--ion-color-tertiary-contrast-rgb": hexToRgb(contrast(tertiary)),
      "--ion-color-tertiary-shade": TinyColor(tertiary).darken(shadeRatio).toString("hex"),
      "--ion-color-tertiary-tint":  TinyColor(tertiary).lighten(tintRatio).toString("hex"),

      "--ion-color-success": success,
      "--ion-color-success-rgb": hexToRgb(success),
      "--ion-color-success-contrast": contrast(success),
      "--ion-color-success-contrast-rgb": hexToRgb(contrast(success)),
      "--ion-color-success-shade": TinyColor(success).darken(shadeRatio).toString("hex"),
      "--ion-color-success-tint": TinyColor(success).lighten(tintRatio).toString("hex"),

      "--ion-color-warning": warning,
      "--ion-color-warning-rgb": hexToRgb(warning),
      "--ion-color-warning-contrast": contrast(warning),
      "--ion-color-warning-contrast-rgb": hexToRgb(contrast(warning)),
      "--ion-color-warning-shade": TinyColor(warning).darken(shadeRatio).toString("hex"),
      "--ion-color-warning-tint": TinyColor(warning).lighten(tintRatio).toString("hex"),

      "--ion-color-danger": danger,
      "--ion-color-danger-rgb": hexToRgb(danger),
      "--ion-color-danger-contrast": contrast(danger),
      "--ion-color-danger-contrast-rgb": hexToRgb(contrast(danger)),
      "--ion-color-danger-shade": TinyColor(danger).darken(shadeRatio).toString("hex"),
      "--ion-color-danger-tint": TinyColor(danger).lighten(tintRatio).toString("hex"),

      "--ion-color-dark": dark,
      "--ion-color-dark-rgb": hexToRgb(dark),
      "--ion-color-dark-contrast": contrast(dark),
      "--ion-color-dark-contrast-rgb": hexToRgb(contrast(dark)),
      "--ion-color-dark-shade": TinyColor(dark).darken(shadeRatio).toString("hex"),
      "--ion-color-dark-tint": TinyColor(dark).lighten(tintRatio).toString("hex"),

      "--ion-color-medium": medium,
      "--ion-color-medium-rgb": hexToRgb(medium),
      "--ion-color-medium-contrast": contrast(medium),
      "--ion-color-medium-contrast-rgb": hexToRgb(contrast(medium)),
      "--ion-color-medium-shade": TinyColor(medium).darken(shadeRatio).toString("hex"),
      "--ion-color-medium-tint": TinyColor(medium).lighten(tintRatio).toString("hex"),

      "--ion-color-light": light,
      "--ion-color-light-rgb": hexToRgb(light),
      "--ion-color-light-contrast": contrast(light),
      "--ion-color-light-contrast-rgb": hexToRgb(contrast(light)),
      "--ion-color-light-shade": TinyColor(light).darken(shadeRatio).toString("hex"),
      "--ion-color-light-tint": TinyColor(light).lighten(tintRatio).toString("hex"),
  };

  for (let prop in template) {
    if (template[prop] !== "") {
//      CSSString = CSSString + prop + ": " + template[prop] + ";\n";
      document.documentElement.style.setProperty(prop, template[prop]);
    }
  }
  for (let step = 50; step < 1000; step += 50) {
//    CSSString = CSSString + `--ion-color-step-${step}: ${mix(background, text, step * .001)};\n`
    template[`--ion-color-step-${step}`] = mix(background, text, step * .1);
    document.documentElement.style.setProperty(`--ion-color-step-${step}`, mix(background, text, step * .1));
  }
//  console.log(getComputedStyle(document.documentElement).getPropertyValue("--ion-color-primary"));
//  document.body.style.cssText = CSSString;
  return template;
}
