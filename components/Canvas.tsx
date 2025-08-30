import React, { useState } from 'react';
import type { CanvasComponent, ComponentType, Viewport } from '../types';
import { RenderComponent } from './RenderComponent';
import { AddIcon, DesktopIcon, TabletIcon, MobileIcon } from './icons/EditorIcons';

interface CanvasProps {
  components: CanvasComponent[];
  onAddComponent: (type: ComponentType, parentId: string | null, index: number) => void;
  onSelectComponent: (id: string | null) => void;
  onDeleteComponent: (id: string) => void;
  onMoveComponent: (dragId: string, dropTarget: { parentId: string | null; index: number }) => void;
  selectedComponentId: string | null;
  viewport: Viewport;
  onViewportChange: (viewport: Viewport) => void;
}

interface DropTarget {
  parentId: string | null;
  index: number;
}

const ViewportToolbar: React.FC<{ currentViewport: Viewport; onViewportChange: (viewport: Viewport) => void; }> = ({ currentViewport, onViewportChange }) => {
    const viewports: { name: Viewport; icon: JSX.Element }[] = [
        { name: 'desktop', icon: <DesktopIcon /> },
        { name: 'tablet', icon: <TabletIcon /> },
        { name: 'mobile', icon: <MobileIcon /> },
    ];
    return (
        <div className="flex justify-center mb-4">
            <div className="flex items-center bg-surface p-1 rounded-lg border border-border">
                {viewports.map(({ name, icon }) => (
                    <button
                        key={name}
                        onClick={() => onViewportChange(name)}
                        className={`p-2 rounded-md transition-colors duration-200 focus:outline-none ${currentViewport === name ? 'bg-primary text-background' : 'text-text-secondary hover:bg-surface-accent hover:text-text-primary'}`}
                        aria-label={`Switch to ${name} view`}
                    >
                        {icon}
                    </button>
                ))}
            </div>
        </div>
    );
};

export const Canvas: React.FC<CanvasProps> = ({ 
    components, 
    onAddComponent, 
    onSelectComponent,
    onDeleteComponent,
    onMoveComponent,
    selectedComponentId,
    viewport,
    onViewportChange,
}) => {
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, parentId: string | null, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget({ parentId, index });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dropTarget) return;

    const componentType = e.dataTransfer.getData('componentType') as ComponentType;
    const draggedComponentId = e.dataTransfer.getData('draggedComponentId');
    
    if (componentType) {
      onAddComponent(componentType, dropTarget.parentId, dropTarget.index);
    } else if (draggedComponentId) {
      if (draggedComponentId === dropTarget.parentId) return; // Prevent dropping inside itself
      onMoveComponent(draggedComponentId, dropTarget);
    }
    setDropTarget(null);
  };
  
  const renderComponentTree = (componentList: CanvasComponent[], parentId: string | null) => {
    return (
      <>
        {componentList.map((component, index) => (
          <React.Fragment key={component.id}>
            <DropZone 
              parentId={parentId} 
              index={index} 
              onDragOver={handleDragOver} 
              isOver={dropTarget?.parentId === parentId && dropTarget?.index === index} 
            />
            <RenderComponent
              component={component}
              selectedComponentId={selectedComponentId}
              onSelectComponent={onSelectComponent}
              onDeleteComponent={onDeleteComponent}
              onDragOver={handleDragOver}
              isDropTarget={dropTarget?.parentId === component.id}
              viewport={viewport}
            >
                {component.children && renderComponentTree(component.children, component.id)}
                {(component.type === 'FlexContainer' || component.type === 'Card') && (
                    <DropZone 
                        parentId={component.id} 
                        index={component.children?.length || 0} 
                        onDragOver={handleDragOver}
                        isOver={dropTarget?.parentId === component.id && dropTarget?.index === (component.children?.length || 0)} 
                        isLastInContainer
                    />
                )}
            </RenderComponent>
          </React.Fragment>
        ))}
        {parentId === null && (
             <DropZone 
                parentId={parentId} 
                index={componentList.length} 
                onDragOver={handleDragOver} 
                isOver={dropTarget?.parentId === parentId && dropTarget?.index === componentList.length} 
            />
        )}
      </>
    );
  };

  const canvasWidthClass = {
    desktop: 'max-w-full',
    tablet: 'max-w-3xl', // 768px
    mobile: 'max-w-sm', // 384px
  }[viewport];

  return (
    <div 
      className="flex-1 flex flex-col p-4 lg:p-8 overflow-hidden bg-background"
      onClick={() => onSelectComponent(null)}
    >
      <ViewportToolbar currentViewport={viewport} onViewportChange={onViewportChange} />
      <div 
        className="flex-1 overflow-y-auto"
        onDragOver={(e) => {
          e.preventDefault();
          if (components.length === 0) {
            setDropTarget({ parentId: null, index: 0 });
          }
        }}
        onDragLeave={() => setDropTarget(null)}
        onDrop={handleDrop}
      >
        <div className={`w-full ${canvasWidthClass} mx-auto transition-all duration-300`}>
            <div className="bg-surface rounded-lg p-4 lg:p-8 border border-border min-h-full transition-shadow shadow-md hover:shadow-xl">
                {components.length === 0 ? (
                    <Placeholder isOver={!!dropTarget} />
                ) : (
                    renderComponentTree(components, null)
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const DropZone: React.FC<{parentId: string | null, index: number, onDragOver: any, isOver: boolean, isLastInContainer?: boolean}> = ({ parentId, index, onDragOver, isOver, isLastInContainer }) => (
    <div
        onDragOver={(e) => onDragOver(e, parentId, index)}
        className={`w-full ${isLastInContainer ? 'py-0' : 'py-1'}`}
    >
      <div className={`h-0.5 w-full rounded-full transition-all duration-200 ${isOver ? 'bg-primary h-2' : 'bg-transparent group-hover:bg-border/30'}`} />
    </div>
);


const Placeholder: React.FC<{isOver: boolean}> = ({ isOver }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-lg p-12 transition-colors duration-200 ${isOver ? 'bg-primary/10 border-primary' : ''}`}>
        <AddIcon />
        <p className="mt-4 font-semibold text-text-primary">Drag & Drop Components</p>
        <p className="text-sm text-text-secondary">Start building your UI by dragging components from the left sidebar.</p>
    </div>
  );
};
