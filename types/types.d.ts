declare type FillStyle = string | CanvasGradient | CanvasPattern;

declare interface RisoColor {
  name: string;
  hex: string;
  pantone: string;
  zType?: string;
}