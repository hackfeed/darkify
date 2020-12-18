declare let ColorThief: any;
declare let html2canvas: any;

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

const printHSL = (color: HSL) => {
  return `hsl(${color.hue}, ${color.saturation}%, ${color.lightness}%)`;
};

const stringToRgb = (color: string) => {
  const colors = color
    .slice(4, color.length - 1)
    .split(",")
    .map((c) => Number(c.trim()));
  const convColor: RGB = {
    red: colors[0],
    green: colors[1],
    blue: colors[2],
  };

  return convColor;
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

const getDominantColor = async (): Promise<RGB> => {
  const canvas: HTMLCanvasElement = await html2canvas(document.body);
  const dataUrl = canvas.toDataURL();

  const pageImg = document.createElement("img");
  pageImg.src = dataUrl;

  const colorThief = new ColorThief();
  let rgb;
  if (pageImg.complete) {
    rgb = colorThief.getColor(pageImg);
  } else {
    pageImg.addEventListener("load", () => {
      rgb = colorThief.getColor(pageImg);
    });
  }

  await new Promise((r) => setTimeout(r, 100));

  const domColor: RGB = {
    red: rgb[0],
    green: rgb[1],
    blue: rgb[2],
  };

  return domColor;
};

const main = async () => {
  const BASE_BACKGROUND_RGB: RGB = {
    red: 18,
    green: 18,
    blue: 18,
  };
  const BASE_BACKGROUND_HSL = convertRGBToHSL(BASE_BACKGROUND_RGB);
  const BASE_FOREGROUND_COLOR = "rgba(255, 255, 255, 0.87)";
  const BASE_COLOR = await getDominantColor();

  document.body.style.backgroundColor = printRGB(BASE_BACKGROUND_RGB);
  for (const styleSheet of document.styleSheets) {
    for (const rule of styleSheet.cssRules) {
      if (rule.type == rule.STYLE_RULE) {
        const styleRule = (rule as CSSStyleRule).style;
        for (const key in styleRule) {
          if (key === "color") {
            if (styleRule[key]) {
              styleRule[key] = BASE_FOREGROUND_COLOR;
            }
          } else if (key.toLowerCase().includes("color")) {
            if (styleRule[key]) {
              const initColor = stringToRgb(styleRule[key]);

              let initLum = getRelativeLuminance(initColor);
              let backLum = getRelativeLuminance(BASE_COLOR);
              if (initLum > backLum) {
                [backLum, initLum] = [initLum, backLum];
              }

              const multiplier = (backLum + 0.05) / (initLum + 0.05) + 1;
              const colorHsl: HSL = {
                hue: BASE_BACKGROUND_HSL.hue,
                saturation: BASE_BACKGROUND_HSL.saturation,
                lightness: multiplier
                  ? BASE_BACKGROUND_HSL.lightness * multiplier
                  : BASE_BACKGROUND_HSL.lightness,
              };
              styleRule[key] = printHSL(colorHsl);
            }
          }
        }
      }
    }
  }
};

main()
  .then((res) => console.log(res))
  .catch((err) => console.log(err));
