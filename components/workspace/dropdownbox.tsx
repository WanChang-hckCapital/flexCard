import React, { useState, useEffect } from 'react';
import { useEditor } from '@/lib/editor/editor-provider';
import { v4 as uuidv4 } from 'uuid';
import { EditorElement } from '@/lib/editor/editor-provider';
import { Settings } from 'lucide-react'

type AddBoxDropdownProps = {
  heroSectionId: string; 
};

const AddBoxDropdown: React.FC<AddBoxDropdownProps> = ({ heroSectionId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { dispatch, state } = useEditor();
  const [canAddBox, setCanAddBox] = useState(true);

  useEffect(() => {
    const heroSection = state.editor.component.hero;
    const hasBox = heroSection?.contents.some(el => el.type === 'box');
    setCanAddBox(!hasBox);
  }, [state.editor.component, heroSectionId]); 

  const addBoxToHero = () => {
    if (!canAddBox) return;

    const newBox: EditorElement = {
      id: uuidv4(),
      type: 'box',
      layout: 'vertical',
      contents: []
    };

    dispatch({
      type: 'ADD_ELEMENT',
      payload: {
        sectionId: heroSectionId,
        elementDetails: newBox
      }
    });

    setIsOpen(false);
  };

  return (
    <div className="dropdown relative text-end">
      <button onClick={() => setIsOpen(!isOpen)} className="dropdown-button">
        {/* ⚙️ */}
        <Settings size={20}
            className="text-muted-foreground" />
      </button>
      {isOpen && (
        <ul className="dropdown-menu text-black text-center absolute right-0 top-full mt-1 w-48 bg-white rounded shadow-lg z-50">
          <li className={`p-2 ${canAddBox ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-not-allowed bg-gray-200'}`} onClick={addBoxToHero}>
            Add Box to Hero
          </li>
        </ul>
      )}
    </div>
  );
};

export default AddBoxDropdown;
