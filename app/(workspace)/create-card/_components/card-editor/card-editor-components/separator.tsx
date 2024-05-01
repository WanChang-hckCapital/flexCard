import React from 'react';
import { EditorElement, useEditor } from '@/lib/editor/editor-provider';

type SeparatorProps = {
  element: EditorElement;
  sectionId: string;
}

const Separator: React.FC<SeparatorProps> = ({ element, sectionId }) => {
  const { state } = useEditor();

  return (
    <hr style={{
      border: 'none',
      borderBottom: '1px solid #ccc',
      margin: '10px 0'
    }} />
  );
};

export default Separator;
