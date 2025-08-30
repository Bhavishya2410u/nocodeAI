
import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import type { CanvasComponent, ComponentType, Viewport } from './types';
import { generateFrontendCode, generateBackendCode } from './services/geminiService';
import { getDefaultProps } from './utils/defaultProps';

// Helper function to recursively find and update a component
const findAndUpdateComponent = (components: CanvasComponent[], id: string, newProps: any): CanvasComponent[] => {
  return components.map(c => {
    if (c.id === id) {
      return { ...c, props: { ...c.props, ...newProps } };
    }
    if (c.children) {
      return { ...c, children: findAndUpdateComponent(c.children, id, newProps) };
    }
    return c;
  });
};

// Helper function to recursively find and delete a component
const findAndDeleteComponent = (components: CanvasComponent[], id: string): CanvasComponent[] => {
  return components.filter(c => c.id !== id).map(c => {
    if (c.children) {
      return { ...c, children: findAndDeleteComponent(c.children, id) };
    }
    return c;
  });
};

const App: React.FC = () => {
  const [components, setComponents] = useState<CanvasComponent[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<Viewport>('desktop');
  
  const [generatedFECode, setGeneratedFECode] = useState<string>('');
  const [generatedBECode, setGeneratedBECode] = useState<string>('');
  const [backendPrompt, setBackendPrompt] = useState<string>('A user authentication system with email/password and a posts table with title and content.');
  const [isLoading, setIsLoading] = useState<{fe: boolean, be: boolean}>({ fe: false, be: false });
  const [error, setError] = useState<string | null>(null);

  const handleAddComponent = useCallback((type: ComponentType, parentId: string | null = null, index?: number) => {
    // FIX: Removed checks for 'Navbar' and 'Footer' as they are not defined component types.
    const isContainer = type === 'FlexContainer' || type === 'Card';
    const newComponent: CanvasComponent = {
      id: `${type}-${Date.now()}`,
      type,
      props: getDefaultProps(type),
      children: isContainer ? [] : undefined,
    };
    
    setComponents(prev => {
        if (parentId) {
             const addRecursive = (items: CanvasComponent[]): CanvasComponent[] => {
                return items.map(item => {
                    if (item.id === parentId) {
                        const newChildren = [...(item.children || [])];
                        if (index !== undefined) {
                            newChildren.splice(index, 0, newComponent);
                        } else {
                            newChildren.push(newComponent);
                        }
                        return { ...item, children: newChildren };
                    }
                    if (item.children) {
                        return { ...item, children: addRecursive(item.children) };
                    }
                    return item;
                });
            };
            return addRecursive(prev);
        } else {
            const newComponents = [...prev];
            if (index !== undefined) {
                newComponents.splice(index, 0, newComponent);
            } else {
                newComponents.push(newComponent);
            }
            return newComponents;
        }
    });

    setSelectedComponentId(newComponent.id);
  }, []);

  const handleSelectComponent = useCallback((id: string | null) => {
    setSelectedComponentId(id);
  }, []);

  const handleUpdateComponentProps = useCallback((id: string, newProps: any) => {
    setComponents(prev => findAndUpdateComponent(prev, id, newProps));
  }, []);
  
  const handleDeleteComponent = useCallback((id: string) => {
    setComponents(prev => findAndDeleteComponent(prev, id));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  }, [selectedComponentId]);

  const handleMoveComponent = useCallback((dragId: string, dropTarget: { parentId: string | null; index: number }) => {
    let componentToMove: CanvasComponent | null = null;
    let cleanedTree = [...components];

    const findAndRemoveRobust = (comps: CanvasComponent[], id: string): { newComps: CanvasComponent[], foundComp: CanvasComponent | null } => {
        for (let i = 0; i < comps.length; i++) {
            const comp = comps[i];
            if (comp.id === id) {
                const found = comp;
                const newComps = [...comps];
                newComps.splice(i, 1);
                return { newComps, foundComp: found };
            }
            if (comp.children) {
                const result = findAndRemoveRobust(comp.children, id);
                if (result.foundComp) {
                    const newComps = [...comps];
                    newComps[i] = { ...comp, children: result.newComps };
                    return { newComps, foundComp: result.foundComp };
                }
            }
        }
        return { newComps: comps, foundComp: null };
    };

    const removalResult = findAndRemoveRobust(components, dragId);
    if (!removalResult.foundComp) return;

    cleanedTree = removalResult.newComps;
    componentToMove = removalResult.foundComp;


    const add = (comps: CanvasComponent[], parentId: string | null, index: number): CanvasComponent[] => {
        if (parentId === null) {
            const newComps = [...comps];
            newComps.splice(index, 0, componentToMove!);
            return newComps;
        }
        return comps.map(c => {
            if (c.id === parentId) {
                const newChildren = [...(c.children || [])];
                newChildren.splice(index, 0, componentToMove!);
                return { ...c, children: newChildren };
            }
            if (c.children) {
                return { ...c, children: add(c.children, parentId, index) };
            }
            return c;
        });
    };

    setComponents(add(cleanedTree, dropTarget.parentId, dropTarget.index));
  }, [components]);

  const findComponent = (id: string | null, componentList: CanvasComponent[]): CanvasComponent | undefined => {
      if (!id) return undefined;
      for (const component of componentList) {
          if (component.id === id) return component;
          if (component.children) {
              const found = findComponent(id, component.children);
              if (found) return found;
          }
      }
      return undefined;
  };
  
  const selectedComponent = findComponent(selectedComponentId, components);

  const handleGenerateFE = async () => {
    setIsLoading(prev => ({ ...prev, fe: true }));
    setError(null);
    setGeneratedFECode('');
    try {
      const code = await generateFrontendCode(components);
      setGeneratedFECode(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(prev => ({ ...prev, fe: false }));
    }
  };
  
  const handleGenerateBE = async () => {
    if (!backendPrompt.trim()) return;
    setIsLoading(prev => ({ ...prev, be: true }));
    setError(null);
    setGeneratedBECode('');
    try {
      const code = await generateBackendCode(backendPrompt);
      setGeneratedBECode(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(prev => ({ ...prev, be: false }));
    }
  };

  return (
    <div className="flex h-screen w-screen bg-background font-sans text-text-primary">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Canvas 
          components={components} 
          onAddComponent={handleAddComponent}
          onSelectComponent={handleSelectComponent}
          onDeleteComponent={handleDeleteComponent}
          onMoveComponent={handleMoveComponent}
          selectedComponentId={selectedComponentId}
          viewport={viewport}
          onViewportChange={setViewport}
        />
      </main>
      <PropertiesPanel
        selectedComponent={selectedComponent}
        onUpdateProps={handleUpdateComponentProps}
        onGenerateFE={handleGenerateFE}
        onGenerateBE={handleGenerateBE}
        backendPrompt={backendPrompt}
        onBackendPromptChange={setBackendPrompt}
        generatedFECode={generatedFECode}
        generatedBECode={generatedBECode}
        isLoading={isLoading}
        error={error}
        viewport={viewport}
        onViewportChange={setViewport}
      />
    </div>
  );
};

export default App;
