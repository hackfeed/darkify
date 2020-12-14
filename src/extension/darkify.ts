interface RGB {
  red: number;
  green: number;
  blue: number;
}

interface HSL {
  hue: number;
  saturation: number;
  lightness: number;
}

const printRGB = (color: RGB) => {
  return `rgb(${color.red}, ${color.green}, ${color.blue})`;
};

const convertRGBToHSL = (baseColor: RGB): HSL => {
  const red = baseColor.red / 255;
  const green = baseColor.green / 255;
  const blue = baseColor.blue / 255;
  const min = Math.min(red, green, blue);
  const max = Math.max(red, green, blue);
  const delta = max - min;
  let hue, saturation;

  if (max === min) {
    hue = 0;
  } else if (red === max) {
    hue = (green - blue) / delta;
  } else if (green === max) {
    hue = 2 + (blue - red) / delta;
  } else {
    hue = 4 + (red - green) / delta;
  }
  hue = Math.min(hue * 60, 360);
  if (hue < 0) {
    hue += 360;
  }

  const lightness = (min + max) / 2;

  if (max === min) {
    saturation = 0;
  } else if (lightness <= 0.5) {
    saturation = delta / (max + min);
  } else {
    saturation = delta / (2 - max - min);
  }

  const convColor: HSL = {
    hue: Math.round(hue),
    saturation: Math.round(saturation * 100),
    lightness: Math.round(lightness * 100),
  };

  return convColor;
};

const convertHSLToRGB = (baseColor: HSL): RGB => {
  const hue = baseColor.hue / 360;
  const saturation = baseColor.saturation / 100;
  const lightness = baseColor.lightness / 100;
  let t2, t3, value;

  const convColor: RGB = {
    red: lightness * 255,
    green: lightness * 255,
    blue: lightness * 255,
  };

  if (saturation === 0) {
    return convColor;
  }

  if (lightness < 0.5) {
    t2 = lightness * (1 + saturation);
  } else {
    t2 = lightness + saturation - lightness * saturation;
  }

  const t1 = 2 * lightness - t2;

  const rgb = [0, 0, 0];
  for (let i = 0; i < 3; ++i) {
    t3 = hue + (1 / 3) * -(i - 1);
    if (t3 < 0) {
      t3++;
    } else if (t3 > 1) {
      t3--;
    }
    if (6 * t3 < 1) {
      value = t1 + (t2 - t1) * 6 * t3;
    } else if (2 * t3 < 1) {
      value = t2;
    } else if (3 * t3 < 2) {
      value = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
    } else {
      value = t1;
    }

    rgb[i] = value * 255;
  }

  convColor.red = Math.round(rgb[0]);
  convColor.green = Math.round(rgb[1]);
  convColor.blue = Math.round(rgb[2]);

  return convColor;
};

const getRelativeLuminance = (color: RGB): number => {
  const rgb = [color.red / 255, color.green / 255, color.blue / 255];

  for (let i = 0; i < 3; ++i) {
    rgb[i] = rgb[i] <= 0.03928 ? rgb[i] / 12.92 : Math.pow((rgb[i] + 0.055) / 1.055, 2.4);
  }

  const relLum = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];

  return relLum;
};

const getStyle = (el: HTMLElement, prop: string) => {
  const style = (window.getComputedStyle
    ? window.getComputedStyle(el).getPropertyValue(prop)
    : el.style[prop.replace(/-([a-z])/g, (g: string) => g[1].toUpperCase())]) as string;

  return style;
};

const isSameDomain = (styleSheet: CSSStyleSheet) => {
  if (!styleSheet.href) {
    return true;
  }

  return styleSheet.href.indexOf(window.location.origin) === 0;
};

const isStyleRule = (rule: CSSRule): rule is CSSStyleRule => rule.type === 1;

const getColorCSSRules = () =>
  [...document.styleSheets].filter(isSameDomain).reduce<CSSRule[]>(
    (finalArr, sheet) =>
      finalArr.concat(
        [...sheet.cssRules]
          .filter(isStyleRule)
          .reduce<any>((propValArr: string[], rule: CSSStyleRule) => {
            const props = [...rule.style]
              .map((propName: string) => [
                propName.trim(),
                rule.style.getPropertyValue(propName).trim(),
              ])
              .filter(([propName]) => propName.includes("color"));

            return [...propValArr, ...props];
          }, [])
      ),
    []
  );

const BASE_BACKGROUND_RGB: RGB = {
  red: 18,
  green: 18,
  blue: 18,
};

const BASE_FOREGROUND_RGB: RGB = {
  red: 255,
  green: 255,
  blue: 255,
};

const BASE_BACKGROUND_HSL = convertRGBToHSL(BASE_BACKGROUND_RGB);

const allNodes = document.body.querySelectorAll("*");
document.body.style.backgroundColor = printRGB(BASE_BACKGROUND_RGB);
for (const node of allNodes) {
  const textColor = getStyle(node as HTMLElement, "color");
  if (textColor.startsWith("rgba(0, 0, 0") || textColor === "rgb(0, 0, 0)") {
    (node as HTMLElement).style.color = printRGB(BASE_FOREGROUND_RGB);
  }
  if ((node as HTMLElement).style.borderBottomColor) {
    (node as HTMLElement).style.borderBottomColor = printRGB(BASE_FOREGROUND_RGB);
  }
}
