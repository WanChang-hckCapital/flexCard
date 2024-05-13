import React, { useState, useEffect } from 'react';
import { useEditor } from '@/lib/editor/editor-provider';
import { v4 as uuidv4 } from 'uuid';
import { EditorElement, EditorComponent, EditorSection } from '@/lib/editor/editor-provider';
import { Settings } from 'lucide-react'
import { toast } from 'sonner';

type AddBoxDropdownProps = {
  heroSectionId: string;
  bubbleId: string;
};

const AddBoxDropdown: React.FC<AddBoxDropdownProps> = ({ heroSectionId, bubbleId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { dispatch, state } = useEditor();
  const [canAddBox, setCanAddBox] = useState(true);

  useEffect(() => {
    const component = state.editor.component;
    if (component.type === 'carousel' && Array.isArray(component.contents)) {
      const bubble = component.contents.find((item: EditorComponent) => item.id === bubbleId);
      if (bubble) {
        const heroSection = bubble.hero;
        const hasBox = heroSection?.contents.some(el => el.type === 'box');
        setCanAddBox(!hasBox);
      } else {
        setCanAddBox(true);
      }
    } else {
      const heroSection = state.editor.component.hero;
      const hasBox = heroSection?.contents.some(el => el.type === 'box');
      setCanAddBox(!hasBox);
    }
  }, [state.editor.component, bubbleId, heroSectionId]); 

  const addBoxToHero = () => {
    if (!canAddBox) return;

    const newBox: EditorElement = {
      id: uuidv4(),
      type: 'box',
      layout: 'vertical',
      description: 'Expand your creativity by using me!',
      contents: []
    };

    dispatch({
      type: 'ADD_ELEMENT',
      payload: {
        bubbleId: bubbleId,
        sectionId: heroSectionId,
        elementDetails: newBox
      }
    });

    toast.success('Box added to hero section');

    setIsOpen(false);
  };

  return (
    <div className="dropdown relative text-end mr-[2px] -mb-[10px]">
      <button onClick={() => setIsOpen(!isOpen)} className="dropdown-button">
        <Settings size={20} className="text-muted-foreground" />
      </button>
      {isOpen && (
        <ul className="dropdown-menu text-black text-center absolute right-0 top-full mt-1 w-full bg-gray-100 rounded shadow-lg z-50">
          <li className={`p-2 ${canAddBox ? 'hover:bg-gray-400 cursor-pointer' : 'cursor-not-allowed bg-gray-200'}`} onClick={addBoxToHero}>
            Add Box to Hero
          </li>
        </ul>
      )}
    </div>
  );
};

export default AddBoxDropdown;
