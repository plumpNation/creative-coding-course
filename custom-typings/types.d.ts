declare type FillStyle = string | CanvasGradient | CanvasPattern;

declare module 'riso-colors' {
  interface RisoColor { name: string; hex: string; pantone: string; zType?: string; }

  const value: RisoColor[]

  export default value
}