export enum ComponentType {
  Header = 'Header',
  Text = 'Text',
  Image = 'Image',
  Button = 'Button',
  Input = 'Input',
  FlexContainer = 'FlexContainer',
  Card = 'Card',
  Divider = 'Divider',
}

export type Viewport = 'desktop' | 'tablet' | 'mobile';

export type Responsive<T> = {
  [key in Viewport]: T;
};

// --- Style Props ---
export interface SpacingProps {
  marginTop: Responsive<number>;
  marginRight: Responsive<number>;
  marginBottom: Responsive<number>;
  marginLeft: Responsive<number>;
  paddingTop: Responsive<number>;
  paddingRight: Responsive<number>;
  paddingBottom: Responsive<number>;
  paddingLeft: Responsive<number>;
}

export interface DimensionProps {
  width: Responsive<string>; // 'auto', '100%', '300px'
  height: Responsive<string>; // 'auto', '100%', '300px'
}

export interface TypographyProps {
  fontSize: Responsive<number>;
  fontWeight: Responsive<'normal' | 'bold'>;
  color: Responsive<string>;
  textAlign: Responsive<'left' | 'center' | 'right'>;
}

export interface AppearanceProps {
  backgroundColor: Responsive<string>;
  borderRadius: Responsive<number>;
}

export interface LayoutProps {
  flexGrow: Responsive<number>;
}

// --- Component-specific Props ---

export interface HeaderProps extends Partial<SpacingProps>, Partial<TypographyProps>, Partial<LayoutProps> {
  text: string;
  level: 'h1' | 'h2' | 'h3';
}

export interface TextProps extends Partial<SpacingProps>, Partial<TypographyProps>, Partial<LayoutProps> {
  text: string;
}

export interface ImageProps extends Partial<SpacingProps>, Partial<DimensionProps>, Partial<AppearanceProps>, Partial<LayoutProps> {
  src: string;
  alt: string;
}

export interface ButtonProps extends Partial<SpacingProps>, Partial<DimensionProps>, Partial<TypographyProps>, Partial<AppearanceProps>, Partial<LayoutProps> {
  text: string;
}

export interface InputProps extends Partial<SpacingProps>, Partial<DimensionProps>, Partial<LayoutProps> {
    type: 'text' | 'email' | 'password';
    placeholder: string;
    label: string;
}

export interface FlexContainerProps extends Partial<SpacingProps>, Partial<DimensionProps>, Partial<AppearanceProps>, Partial<LayoutProps> {
    display: 'flex' | 'grid';
    gridColumns: Responsive<number>;
    flexDirection: Responsive<'row' | 'column'>;
    justifyContent: Responsive<'flex-start' | 'center' | 'flex-end' | 'space-between'>;
    alignItems: Responsive<'flex-start' | 'center' | 'flex-end' | 'stretch'>;
    gap: Responsive<number>;
}

export interface CardProps extends FlexContainerProps {}

export interface DividerProps extends Partial<SpacingProps>, Partial<LayoutProps> {
    color: Responsive<string>;
    height: Responsive<number>; // thickness in px
}


export type ComponentProps = HeaderProps | TextProps | ImageProps | ButtonProps | InputProps | FlexContainerProps | CardProps | DividerProps;

export interface CanvasComponent {
  id: string;
  type: ComponentType;
  props: any;
  children?: CanvasComponent[];
}
