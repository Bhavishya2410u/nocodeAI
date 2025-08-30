import React from 'react';
import type { CanvasComponent, Responsive, Viewport } from '../types';
import { DeleteIcon, ImageIcon } from './icons/EditorIcons';
import { ComponentType } from '../types';

interface RenderComponentProps {
    component: CanvasComponent;
    selectedComponentId: string | null;
    onSelectComponent: (id: string) => void;
    onDeleteComponent: (id: string) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>, parentId: string | null, index: number) => void;
    isDropTarget: boolean;
    viewport: Viewport;
    children?: React.ReactNode;
}

export const RenderComponent: React.FC<RenderComponentProps> = ({ 
    component, 
    selectedComponentId,
    onSelectComponent,
    onDeleteComponent,
    onDragOver,
    isDropTarget,
    viewport,
    children 
}) => {
    const { type, props, id } = component;
    const isSelected = selectedComponentId === id;

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.dataTransfer.setData('draggedComponentId', id);
    };

    const getResponsiveValue = <T,>(prop: Responsive<T> | T | undefined): T | undefined => {
        if (prop && typeof prop === 'object' && 'desktop' in prop && 'tablet' in prop && 'mobile' in prop) {
            return (prop as Responsive<T>)[viewport];
        }
        return prop as T | undefined;
    };

    // --- Combine styles from props ---
    const styles: React.CSSProperties = {};
    if (props.marginTop) styles.marginTop = `${getResponsiveValue(props.marginTop)}px`;
    if (props.marginRight) styles.marginRight = `${getResponsiveValue(props.marginRight)}px`;
    if (props.marginBottom) styles.marginBottom = `${getResponsiveValue(props.marginBottom)}px`;
    if (props.marginLeft) styles.marginLeft = `${getResponsiveValue(props.marginLeft)}px`;
    if (props.paddingTop) styles.paddingTop = `${getResponsiveValue(props.paddingTop)}px`;
    if (props.paddingRight) styles.paddingRight = `${getResponsiveValue(props.paddingRight)}px`;
    if (props.paddingBottom) styles.paddingBottom = `${getResponsiveValue(props.paddingBottom)}px`;
    if (props.paddingLeft) styles.paddingLeft = `${getResponsiveValue(props.paddingLeft)}px`;
    if (props.width) styles.width = getResponsiveValue(props.width);
    if (props.height && type !== ComponentType.Divider) styles.height = getResponsiveValue(props.height);
    if (props.color) styles.color = getResponsiveValue(props.color);
    if (props.backgroundColor) styles.backgroundColor = getResponsiveValue(props.backgroundColor);
    if (props.fontSize) styles.fontSize = `${getResponsiveValue(props.fontSize)}px`;
    if (props.fontWeight) styles.fontWeight = getResponsiveValue(props.fontWeight);
    if (props.textAlign) styles.textAlign = getResponsiveValue(props.textAlign);
    if (props.borderRadius) styles.borderRadius = `${getResponsiveValue(props.borderRadius)}px`;
    if (props.flexGrow) styles.flexGrow = getResponsiveValue(props.flexGrow);
    
    // --- Specific styles for Container-like components ---
    if (type === 'FlexContainer' || type === 'Card') {
        if (props.display === 'grid') {
            styles.display = 'grid';
            styles.gridTemplateColumns = `repeat(${getResponsiveValue(props.gridColumns) || 1}, 1fr)`;
        } else {
            styles.display = 'flex';
            styles.flexDirection = getResponsiveValue(props.flexDirection);
            styles.justifyContent = getResponsiveValue(props.justifyContent);
            styles.alignItems = getResponsiveValue(props.alignItems);
        }
        styles.gap = `${getResponsiveValue(props.gap)}px`;
    }

    const renderInnerComponent = () => {
        switch (type) {
            case 'Header':
                const Tag = props.level;
                return <Tag style={styles}>{props.text}</Tag>;
            case 'Text':
                return <p style={styles} className="whitespace-pre-wrap">{props.text}</p>;
            case 'Image':
                const height = getResponsiveValue(props.height);
                if (!props.src) {
                    return (
                        <div style={{ ...styles, height: height === 'auto' ? '150px' : height }} className="w-full bg-surface-accent border border-dashed border-border rounded-md flex flex-col items-center justify-center text-text-secondary p-4">
                            <ImageIcon />
                            <p className="text-xs mt-2 text-center">Image Placeholder<br/>Upload an image in the properties panel.</p>
                        </div>
                    );
                }
                return <img src={props.src} alt={props.alt} style={styles} className="object-cover" />;
            case 'Button':
                return <button style={styles} className={`font-semibold transition-transform duration-150 active:scale-95 text-sm`}>{props.text}</button>;
            case 'Input':
                return (
                    <div style={{width: getResponsiveValue(props.width)}}>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">{props.label}</label>
                        <input 
                            type={props.type}
                            placeholder={props.placeholder}
                            className="w-full p-2 bg-surface-accent border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                    </div>
                );
            case 'FlexContainer':
            case 'Card':
                return (
                    <div 
                        onDragOver={(e) => {
                          e.stopPropagation();
                          onDragOver(e, id, component.children?.length || 0)
                        }}
                        style={styles}
                        className={`w-full min-h-[80px] transition-colors duration-200 ${isDropTarget ? 'bg-primary/10' : ''}`}
                    >
                       {children}
                       {(!children || (Array.isArray(children) && children.filter(c => c?.key !== null).length === 0)) && (
                            <div className="text-center text-text-secondary text-xs p-4 pointer-events-none">
                                Drop components here
                            </div>
                       )}
                    </div>
                );
            case 'Divider':
                return (
                    <div style={{...styles, height: 'auto'}}>
                        <div style={{ height: `${getResponsiveValue(props.height)}px`, backgroundColor: getResponsiveValue(props.color) }} className="w-full" />
                    </div>
                );
            default:
                return <div className="text-red-500">Unknown Component</div>;
        }
    };
    
    // Wrapper for selection, deletion, and dragging
    return (
         <div
            draggable
            onDragStart={handleDragStart}
            onClick={(e) => {
                e.stopPropagation();
                onSelectComponent(id);
            }}
            className={`group relative transition-all duration-200 cursor-grab ${
                isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface rounded-md' : ''
            }`}
        >
            {renderInnerComponent()}
            {isSelected && (
                 <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteComponent(id); }}
                    className="absolute top-0 right-0 -mt-2 -mr-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center transition-opacity duration-200 hover:bg-red-700 z-10"
                    aria-label="Delete component"
                >
                   <DeleteIcon />
                </button>
            )}
        </div>
    )
};
