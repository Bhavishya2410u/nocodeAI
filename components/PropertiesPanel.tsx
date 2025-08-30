import React, { useState, Fragment } from 'react';
import type { CanvasComponent, HeaderProps, TextProps, ImageProps, ButtonProps, InputProps, FlexContainerProps, SpacingProps, LayoutProps, DividerProps, Viewport, Responsive } from '../types';
import { ComponentType } from '../types';
import { AiIcon, ChevronDownIcon, DesktopIcon, MobileIcon, TabletIcon } from './icons/EditorIcons';

interface PropertiesPanelProps {
  selectedComponent: CanvasComponent | undefined;
  onUpdateProps: (id: string, newProps: any) => void;
  onGenerateFE: () => void;
  onGenerateBE: () => void;
  backendPrompt: string;
  onBackendPromptChange: (value: string) => void;
  generatedFECode: string;
  generatedBECode: string;
  isLoading: { fe: boolean, be: boolean };
  error: string | null;
  viewport: Viewport;
  onViewportChange: (viewport: Viewport) => void;
}

enum Tab {
  Properties = 'Properties',
  Code = 'Code',
  Preview = 'Preview',
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedComponent,
  onUpdateProps,
  onGenerateFE,
  onGenerateBE,
  backendPrompt,
  onBackendPromptChange,
  generatedFECode,
  generatedBECode,
  isLoading,
  error,
  viewport,
  onViewportChange,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Properties);

  const renderProperties = () => {
    if (!selectedComponent) {
      return <p className="text-text-secondary text-sm p-4">Select a component to edit its properties.</p>;
    }

    const { id, type, props } = selectedComponent;
    const update = (newProps: any) => onUpdateProps(id, newProps);

    const has = (propList: string[]) => propList.some(p => p in props);

    return (
      <div className="space-y-1 p-2">
        <div className="px-2 py-3 flex justify-between items-center">
            <h3 className="font-bold text-lg text-text-primary">{type} Properties</h3>
            <ViewportSwitcher currentViewport={viewport} onViewportChange={onViewportChange} isSmall/>
        </div>
        
        {/* --- Component Specific Editor --- */}
        <div className="px-2 pb-2">
          {type === ComponentType.Header && <HeaderEditor props={props as HeaderProps} onChange={update} viewport={viewport} />}
          {type === ComponentType.Text && <TextEditor props={props as TextProps} onChange={update} viewport={viewport} />}
          {type === ComponentType.Image && <ImageEditor props={props as ImageProps} onChange={update} viewport={viewport} />}
          {type === ComponentType.Button && <ButtonEditor props={props as ButtonProps} onChange={update} viewport={viewport} />}
          {type === ComponentType.Input && <InputEditor props={props as InputProps} onChange={update} viewport={viewport} />}
          {type === ComponentType.Divider && <DividerEditor props={props as DividerProps} onChange={update} viewport={viewport} />}
        </div>
        
        {/* --- Collapsible Style Editors --- */}
        <Accordion title="Layout Child">
            <LayoutChildEditor props={props} onChange={update} viewport={viewport}/>
        </Accordion>

        {(type === ComponentType.FlexContainer || type === ComponentType.Card) && (
           <Accordion title="Layout">
              <FlexContainerEditor props={props as FlexContainerProps} onChange={update} viewport={viewport}/>
           </Accordion>
        )}
        {has(['width', 'height']) && type !== ComponentType.Divider && (
          <Accordion title="Dimensions">
            <DimensionEditor props={props} onChange={update} viewport={viewport}/>
          </Accordion>
        )}
        {has(['marginTop', 'paddingTop']) && (
           <Accordion title="Spacing">
              <SpacingEditor props={props} onChange={update} viewport={viewport}/>
           </Accordion>
        )}
        {has(['fontSize', 'fontWeight', 'color']) && (
           <Accordion title="Typography">
              <TypographyEditor props={props} onChange={update} viewport={viewport}/>
           </Accordion>
        )}
        {has(['backgroundColor', 'borderRadius']) && (
           <Accordion title="Appearance">
              <AppearanceEditor props={props} onChange={update} viewport={viewport}/>
           </Accordion>
        )}
      </div>
    );
  };
  
  const renderCode = () => (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="font-bold text-lg mb-2">Frontend</h3>
        <button onClick={onGenerateFE} disabled={isLoading.fe} className="w-full bg-primary text-background font-semibold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors disabled:bg-cyan-400/50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading.fe ? 'Generating...' : <> <AiIcon/> Generate UI Code </>}
        </button>
        {generatedFECode && <CodeDisplay code={generatedFECode} language="html" />}
      </div>

      <div>
        <h3 className="font-bold text-lg mb-2">Backend</h3>
        <p className="text-sm text-text-secondary mb-2">Describe your backend requirements:</p>
        <textarea 
            value={backendPrompt}
            onChange={(e) => onBackendPromptChange(e.target.value)}
            className="w-full h-24 p-2 bg-surface-accent border border-border rounded-lg text-text-primary text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="e.g., A blog with users and posts..."
        />
        <button onClick={onGenerateBE} disabled={isLoading.be} className="w-full mt-2 bg-primary text-background font-semibold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors disabled:bg-cyan-400/50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading.be ? 'Generating...' : <> <AiIcon/> Generate API & DB </>}
        </button>
        {generatedBECode && <CodeDisplay code={generatedBECode} language="javascript" />}
      </div>
      {error && <div className="text-red-400 text-sm p-3 bg-red-900/50 rounded-md">{error}</div>}
    </div>
  );

  const renderPreview = () => (
    <div className="p-4 h-full">
        {generatedFECode ? (
            <iframe
                srcDoc={generatedFECode}
                title="Frontend Preview"
                className="w-full h-full border border-border rounded-lg bg-white"
                sandbox="allow-scripts"
            />
        ) : (
            <div className="flex items-center justify-center h-full text-center text-text-secondary">
                <p>Generate frontend code to see a preview.</p>
            </div>
        )}
    </div>
  );

  return (
    <aside className="w-[450px] bg-surface h-full border-l border-border flex flex-col">
      <div className="flex border-b border-border">
        <TabButton name={Tab.Properties} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton name={Tab.Code} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton name={Tab.Preview} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-surface">
        {activeTab === Tab.Properties && renderProperties()}
        {activeTab === Tab.Code && renderCode()}
        {activeTab === Tab.Preview && renderPreview()}
      </div>
    </aside>
  );
};

// --- Accordion Component ---
const Accordion: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="border-b border-border">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-2 hover:bg-surface-accent rounded-t-md">
                <span className="font-semibold text-sm text-text-primary">{title}</span>
                <ChevronDownIcon className={`w-5 h-5 text-text-secondary transition-transform ${isOpen ? '' : '-rotate-90'}`} />
            </button>
            {isOpen && <div className="p-2 space-y-3">{children}</div>}
        </div>
    );
};

const ViewportSwitcher: React.FC<{ currentViewport: Viewport; onViewportChange: (v: Viewport) => void; isSmall?: boolean; }> = ({ currentViewport, onViewportChange, isSmall }) => {
    const viewports: { name: Viewport; icon: JSX.Element }[] = [
        { name: 'desktop', icon: <DesktopIcon /> },
        { name: 'tablet', icon: <TabletIcon /> },
        { name: 'mobile', icon: <MobileIcon /> },
    ];
    return (
        <div className={`flex items-center bg-surface-accent p-1 rounded-md border border-border`}>
            {viewports.map(({ name, icon }) => (
                <button
                    key={name}
                    onClick={() => onViewportChange(name)}
                    className={`p-1.5 rounded-sm transition-colors duration-200 focus:outline-none ${currentViewport === name ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'}`}
                    aria-label={`Switch to ${name} view`}
                >
                    {React.cloneElement(icon, { className: isSmall ? 'w-4 h-4' : 'w-5 h-5'})}
                </button>
            ))}
        </div>
    );
};


// --- Property Editors ---

interface FieldProps<T> {
  label: string;
  value: Responsive<T>;
  onChange: (val: Responsive<T>) => void;
  viewport: Viewport;
  type?: string;
  placeholder?: string;
}

const ResponsiveInputField = <T extends string | number>({ label, value, onChange, viewport, type = "text", placeholder }: FieldProps<T>) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = type === 'number' ? Number(e.target.value) : e.target.value;
    onChange({ ...value, [viewport]: rawValue as T });
  };
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
      <input type={type} value={value[viewport]} onChange={handleChange} placeholder={placeholder} className="w-full p-2 bg-surface-accent border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:outline-none" />
    </div>
  );
};

const NonResponsiveInputField: React.FC<{ label: string; value: any; onChange: (val: any) => void; type?: string, placeholder?: string }> = ({ label, value, onChange, type = "text", placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={placeholder} className="w-full p-2 bg-surface-accent border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:outline-none" />
    </div>
  );

const ResponsiveSelectField = <T extends string>({ label, value, onChange, viewport, options }: FieldProps<T> & { options: {value: T, label: string}[] }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({ ...value, [viewport]: e.target.value as T });
    };
    return (
        <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
            <select value={value[viewport]} onChange={handleChange} className="w-full p-2 bg-surface-accent border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:outline-none appearance-none bg-no-repeat bg-right pr-8" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394A3B8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`}}>
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );
};

const NonResponsiveSelectField: React.FC<{ label: string; value: string; onChange: (val: string) => void; options: {value: string, label: string}[] }> = ({ label, value, onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full p-2 bg-surface-accent border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:outline-none appearance-none bg-no-repeat bg-right pr-8" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394A3B8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`}}>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const SpacingEditor: React.FC<{ props: Partial<SpacingProps>; onChange: (p: any) => void; viewport: Viewport }> = ({ props, onChange, viewport }) => {
    const sides = ['Top', 'Right', 'Bottom', 'Left'];
    return (
        <>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Margin (px)</label>
                <div className="grid grid-cols-4 gap-2">
                    {sides.map(side => {
                        const key = `margin${side}` as keyof SpacingProps;
                        return <ResponsiveInputField key={key} label={side.charAt(0)} value={props[key]!} onChange={val => onChange({ [key]: val })} viewport={viewport} type="number"/>
                    })}
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Padding (px)</label>
                <div className="grid grid-cols-4 gap-2">
                     {sides.map(side => {
                        const key = `padding${side}` as keyof SpacingProps;
                        return <ResponsiveInputField key={key} label={side.charAt(0)} value={props[key]!} onChange={val => onChange({ [key]: val })} viewport={viewport} type="number"/>
                    })}
                </div>
            </div>
        </>
    )
}

const DimensionEditor: React.FC<{ props: any; onChange: (p: any) => void; viewport: Viewport }> = ({ props, onChange, viewport }) => (
    <div className="grid grid-cols-2 gap-3">
        <ResponsiveInputField label="Width" value={props.width} onChange={width => onChange({ width })} viewport={viewport} placeholder="auto, 100%, 300px"/>
        <ResponsiveInputField label="Height" value={props.height} onChange={height => onChange({ height })} viewport={viewport} placeholder="auto, 100%, 50px"/>
    </div>
);

const TypographyEditor: React.FC<{ props: any; onChange: (p: any) => void; viewport: Viewport }> = ({ props, onChange, viewport }) => (
  <>
    <ResponsiveInputField label="Font Size (px)" value={props.fontSize} onChange={fontSize => onChange({ fontSize })} type="number" viewport={viewport} />
    <ResponsiveSelectField label="Font Weight" value={props.fontWeight} onChange={fontWeight => onChange({ fontWeight })} options={[{value: 'normal', label: 'Normal'}, {value: 'bold', label: 'Bold'}]} viewport={viewport} />
    <ResponsiveInputField label="Color" value={props.color} onChange={color => onChange({ color })} type="color" viewport={viewport} />
    <ResponsiveSelectField label="Text Align" value={props.textAlign} onChange={textAlign => onChange({ textAlign })} options={[{value: 'left', label: 'Left'}, {value: 'center', label: 'Center'}, {value: 'right', label: 'Right'}]} viewport={viewport} />
  </>
);

const AppearanceEditor: React.FC<{ props: any; onChange: (p: any) => void; viewport: Viewport }> = ({ props, onChange, viewport }) => (
  <>
    <ResponsiveInputField label="Background Color" value={props.backgroundColor} onChange={backgroundColor => onChange({ backgroundColor })} type="color" viewport={viewport} />
    <ResponsiveInputField label="Border Radius (px)" value={props.borderRadius} onChange={borderRadius => onChange({ borderRadius })} type="number" viewport={viewport} />
  </>
);

const HeaderEditor: React.FC<{ props: HeaderProps; onChange: (p: Partial<HeaderProps>) => void; viewport: Viewport }> = ({ props, onChange, viewport }) => (
  <div className="space-y-3">
    <NonResponsiveInputField label="Text" value={props.text} onChange={text => onChange({ text })} />
    <NonResponsiveSelectField label="Level" value={props.level} onChange={level => onChange({ level: level as HeaderProps['level'] })} options={[{value: 'h1', label: 'H1'}, {value: 'h2', label: 'H2'}, {value: 'h3', label: 'H3'}]} />
  </div>
);

const TextEditor: React.FC<{ props: TextProps; onChange: (p: Partial<TextProps>) => void; viewport: Viewport }> = ({ props, onChange, viewport }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Text</label>
        <textarea value={props.text} onChange={e => onChange({ text: e.target.value })} className="w-full h-32 p-2 bg-surface-accent border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:outline-none" />
    </div>
);

const ImageEditor: React.FC<{ props: ImageProps; onChange: (p: Partial<ImageProps>) => void; viewport: Viewport }> = ({ props, onChange, viewport }) => {
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange({ src: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-3">
            <NonResponsiveInputField label="Source URL" value={props.src} onChange={src => onChange({ src })} />
            
            <div>
                 <label className="block text-sm font-medium text-text-secondary mb-1">Or Upload Image</label>
                 <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-background hover:file:bg-primary-hover file:cursor-pointer"
                />
            </div>

            <NonResponsiveInputField label="Alt Text" value={props.alt} onChange={alt => onChange({ alt })} />
        </div>
    );
};


const ButtonEditor: React.FC<{ props: ButtonProps; onChange: (p: Partial<ButtonProps>) => void; viewport: Viewport }> = ({ props, onChange, viewport }) => (
    <div className="space-y-3">
        <NonResponsiveInputField label="Text" value={props.text} onChange={text => onChange({ text })} />
    </div>
);

const InputEditor: React.FC<{ props: InputProps; onChange: (p: Partial<InputProps>) => void; viewport: Viewport }> = ({ props, onChange, viewport }) => (
    <div className="space-y-3">
        <NonResponsiveInputField label="Label" value={props.label} onChange={label => onChange({ label })} />
        <NonResponsiveInputField label="Placeholder" value={props.placeholder} onChange={placeholder => onChange({ placeholder })} />
        <NonResponsiveSelectField label="Type" value={props.type} onChange={type => onChange({ type: type as InputProps['type'] })} options={[{value: 'text', label: 'Text'}, {value: 'email', label: 'Email'}, {value: 'password', label: 'Password'}]} />
    </div>
);

const DividerEditor: React.FC<{ props: DividerProps; onChange: (p: Partial<DividerProps>) => void; viewport: Viewport }> = ({ props, onChange, viewport }) => (
    <div className="space-y-3">
        <ResponsiveInputField label="Color" value={props.color} onChange={color => onChange({ color })} type="color" viewport={viewport} />
        <ResponsiveInputField label="Thickness (px)" value={props.height} onChange={height => onChange({ height })} type="number" viewport={viewport}/>
    </div>
);


const LayoutChildEditor: React.FC<{ props: Partial<LayoutProps>; onChange: (p: any) => void; viewport: Viewport }> = ({ props, onChange, viewport }) => (
    <ResponsiveInputField label="Flex Grow" value={props.flexGrow!} onChange={flexGrow => onChange({ flexGrow })} type="number" viewport={viewport} />
);

const FlexContainerEditor: React.FC<{ props: FlexContainerProps; onChange: (p: Partial<FlexContainerProps>) => void; viewport: Viewport }> = ({ props, onChange, viewport }) => (
    <div className="space-y-3">
        <NonResponsiveSelectField label="Display" value={props.display} onChange={display => onChange({ display: display as FlexContainerProps['display'] })} options={[{value: 'flex', label: 'Flex'}, {value: 'grid', label: 'Grid'}]} />
        
        {props.display === 'grid' && (
            <ResponsiveInputField label="Grid Columns" value={props.gridColumns} onChange={gridColumns => onChange({ gridColumns })} type="number" viewport={viewport} />
        )}

        {props.display === 'flex' && (
            <>
                <ResponsiveSelectField label="Direction" value={props.flexDirection} onChange={flexDirection => onChange({ flexDirection })} options={[{value: 'row', label: 'Row'}, {value: 'column', label: 'Column'}]} viewport={viewport}/>
                <ResponsiveSelectField label="Justify Content" value={props.justifyContent} onChange={justifyContent => onChange({ justifyContent })} options={[{value: 'flex-start', label: 'Start'}, {value: 'center', label: 'Center'}, {value: 'flex-end', label: 'End'}, {value: 'space-between', label: 'Space Between'}]} viewport={viewport}/>
                <ResponsiveSelectField label="Align Items" value={props.alignItems} onChange={alignItems => onChange({ alignItems })} options={[{value: 'flex-start', label: 'Start'}, {value: 'center', label: 'Center'}, {value: 'flex-end', label: 'End'}, {value: 'stretch', label: 'Stretch'}]} viewport={viewport}/>
            </>
        )}
        <ResponsiveInputField label="Gap (px)" value={props.gap} onChange={gap => onChange({ gap })} type="number" viewport={viewport}/>
    </div>
);


const CodeDisplay: React.FC<{ code: string; language: string }> = ({ code, language }) => {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="mt-4 bg-background rounded-lg relative border border-border">
            <button onClick={copyToClipboard} className="absolute top-2 right-2 text-xs bg-surface-accent hover:bg-border text-text-secondary px-2 py-1 rounded-md transition-colors">
                {copied ? 'Copied!' : 'Copy'}
            </button>
            <pre className="p-4 rounded-lg overflow-x-auto text-sm scrollbar-thin scrollbar-thumb-border scrollbar-track-surface">
                <code className={`language-${language}`}>{code}</code>
            </pre>
        </div>
    );
};

const TabButton: React.FC<{name: Tab, activeTab: Tab, setActiveTab: (tab: Tab) => void}> = ({ name, activeTab, setActiveTab}) => (
    <button
      onClick={() => setActiveTab(name)}
      className={`flex-1 py-2.5 text-sm font-semibold transition-colors duration-200 focus:outline-none ${
        activeTab === name
          ? 'text-primary border-b-2 border-primary'
          : 'text-text-secondary hover:text-text-primary border-b-2 border-transparent'
      }`}
    >
      {name}
    </button>
);
