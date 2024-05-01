import React from 'react';
import { EditorElement, useEditor } from '@/lib/editor/editor-provider';

type ButtonElementProps = {
  element: EditorElement;
}

const ButtonElement: React.FC<ButtonElementProps> = ({ element }) => {
  const { state } = useEditor();

  const handleClick = () => {
    if (element.uri) {
      window.location.href = element.uri;
    }
  };

  return (
    <button
      style={{
        backgroundColor: element.backgroundColor || 'blue',
        padding: '10px 20px',
        borderRadius: element.borderRadius || '5px',
      }}
      onClick={handleClick}
      disabled={state.editor.liveMode}
    >
      {element.label || 'Click me'}
    </button>
  );
};

export default ButtonElement;
