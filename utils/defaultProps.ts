import { ComponentType, Responsive } from '../types';

const R = <T,>(desktop: T, tablet: T, mobile: T): Responsive<T> => ({ desktop, tablet, mobile });

const defaultSpacing = {
    marginTop: R(0, 0, 0),
    marginRight: R(0, 0, 0),
    marginBottom: R(16, 12, 12),
    marginLeft: R(0, 0, 0),
    paddingTop: R(0, 0, 0),
    paddingRight: R(0, 0, 0),
    paddingBottom: R(0, 0, 0),
    paddingLeft: R(0, 0, 0),
};

const defaultTypography = {
    color: R('#F1F5F9', '#F1F5F9', '#F1F5F9'),
    fontWeight: R<'normal' | 'bold'>('normal', 'normal', 'normal'),
    textAlign: R<'left' | 'center' | 'right'>('left', 'left', 'left'),
};

const defaultLayout = {
    flexGrow: R(0, 0, 0),
};

const flexContainerDefaults = {
    ...defaultSpacing,
    ...defaultLayout,
    paddingTop: R(24, 20, 16),
    paddingBottom: R(24, 20, 16),
    paddingLeft: R(24, 20, 16),
    paddingRight: R(24, 20, 16),
    display: 'flex' as 'flex' | 'grid',
    gridColumns: R(2, 2, 1),
    flexDirection: R<'row' | 'column'>('column', 'column', 'column'),
    justifyContent: R<'flex-start' | 'center' | 'flex-end' | 'space-between'>('flex-start', 'flex-start', 'flex-start'),
    alignItems: R<'flex-start' | 'center' | 'flex-end' | 'stretch'>('stretch', 'stretch', 'stretch'),
    gap: R(16, 12, 12),
    backgroundColor: R('#33415520', '#33415520', '#33415520'),
    borderRadius: R(8, 8, 8),
    width: R('100%', '100%', '100%'),
    height: R('auto', 'auto', 'auto'),
};


export const getDefaultProps = (type: ComponentType) => {
    switch (type) {
        case ComponentType.Header:
            return { 
                ...defaultSpacing,
                ...defaultTypography,
                ...defaultLayout,
                text: 'Main Heading', 
                level: 'h1' as 'h1' | 'h2' | 'h3',
                fontSize: R(36, 30, 24),
                fontWeight: R<'normal' | 'bold'>('bold', 'bold', 'bold'),
            };
        case ComponentType.Text:
            return { 
                ...defaultSpacing,
                ...defaultTypography,
                ...defaultLayout,
                text: 'This is a paragraph of text. You can edit it in the properties panel on the right.',
                fontSize: R(16, 15, 14),
            };
        case ComponentType.Image:
            return { 
                ...defaultSpacing,
                ...defaultLayout,
                src: '', 
                alt: 'Mountain landscape',
                width: R('100%', '100%', '100%'),
                height: R('auto', 'auto', 'auto'),
                borderRadius: R(8, 8, 8),
                backgroundColor: R('transparent', 'transparent', 'transparent'), // Added for consistency
            };
        case ComponentType.Button:
            return { 
                ...defaultSpacing,
                ...defaultTypography,
                ...defaultLayout,
                paddingTop: R(10, 10, 12),
                paddingBottom: R(10, 10, 12),
                paddingLeft: R(20, 20, 20),
                paddingRight: R(20, 20, 20),
                text: 'Click Here', 
                fontSize: R(14, 14, 14),
                fontWeight: R<'normal' | 'bold'>('bold', 'bold', 'bold'),
                backgroundColor: R('#22D3EE', '#22D3EE', '#22D3EE'),
                color: R('#0F172A', '#0F172A', '#0F172A'),
                borderRadius: R(6, 6, 6),
                width: R('auto', 'auto', 'auto'),
                height: R('auto', 'auto', 'auto'),
            };
        case ComponentType.Input:
            return { 
                ...defaultSpacing,
                ...defaultLayout,
                type: 'text', 
                placeholder: 'Enter your name', 
                label: 'Name',
                width: R('100%', '100%', '100%'),
                height: R('auto', 'auto', 'auto'),
            };
        case ComponentType.FlexContainer:
            return { 
                ...flexContainerDefaults,
                 backgroundColor: R('#33415520', '#33415520', '#33415520'),
            };
        case ComponentType.Card:
            return {
                ...flexContainerDefaults,
                paddingTop: R(32, 24, 20),
                paddingBottom: R(32, 24, 20),
                paddingLeft: R(32, 24, 20),
                paddingRight: R(32, 24, 20),
                backgroundColor: R('#1E293B', '#1E293B', '#1E293B'), // Surface color
            }
        case ComponentType.Divider:
            return {
                ...defaultSpacing,
                ...defaultLayout,
                marginTop: R(24, 20, 20),
                marginBottom: R(24, 20, 20),
                height: R(1, 1, 1), // thickness
                color: R('#334155', '#334155', '#334155') // border color
            }
        default:
            return {};
    }
};
