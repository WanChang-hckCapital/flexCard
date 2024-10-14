import React from 'react';
import { EditorComponent, EditorElement } from '@/lib/editor/editor-provider'; 
import Recursive from './recursive';

type BubbleComponentProps = {
    element: EditorElement;  
    sectionId: string;
    bubble: EditorComponent     
};

const BubbleStyle = {
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '10px',
    padding: '20px',
    margin: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    color: '#333'  
};

const BubbleComponent: React.FC<BubbleComponentProps> = React.memo(({ element, sectionId, bubble }) => {
    return (
        <div style={BubbleStyle}>
            {element.contents?.map((subElement: EditorElement) => (
                <Recursive key={subElement.id} element={subElement} sectionId={sectionId} bubble={bubble} />
            ))}
        </div>
    );
});

BubbleComponent.displayName = 'BubbleComponent';

export default BubbleComponent;
