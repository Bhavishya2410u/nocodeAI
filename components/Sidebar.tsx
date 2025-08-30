import React from 'react';
import { ComponentType } from '../types';
import { HeadingIcon, TextIcon, ImageIcon, ButtonIcon, BrandIcon, InputIcon, ContainerIcon, CardIcon, DividerIcon } from './icons/EditorIcons';

const componentList = [
  { type: ComponentType.Header, label: 'Header', icon: <HeadingIcon /> },
  { type: ComponentType.Text, label: 'Text', icon: <TextIcon /> },
  { type: ComponentType.Image, label: 'Image', icon: <ImageIcon /> },
  { type: ComponentType.Button, label: 'Button', icon: <ButtonIcon /> },
  { type: ComponentType.Input, label: 'Input', icon: <InputIcon /> },
  { type: ComponentType.FlexContainer, label: 'Flex Container', icon: <ContainerIcon /> },
  { type: ComponentType.Card, label: 'Card', icon: <CardIcon /> },
  { type: ComponentType.Divider, label: 'Divider', icon: <DividerIcon /> },
];

const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, type: ComponentType) => {
    e.dataTransfer.setData('componentType', type);
};

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-surface h-full p-4 border-r border-border flex flex-col shadow-lg">
      <div className="flex items-center gap-3 mb-8">
        <BrandIcon />
        <h1 className="text-xl font-bold text-text-primary">AI Builder</h1>
      </div>
      <h2 className="text-sm font-semibold text-text-secondary tracking-wider uppercase mb-4">Components</h2>
      <div className="grid grid-cols-2 gap-3">
        {componentList.map(({ type, label, icon }) => (
          <button
            key={type}
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
            className="flex flex-col items-center justify-center p-3 bg-surface-accent rounded-lg border border-border hover:border-primary hover:bg-primary/10 transition-all duration-200 cursor-grab focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={`Add ${label} component`}
          >
            {icon}
            <span className="text-xs mt-2 font-medium text-text-secondary">{label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};