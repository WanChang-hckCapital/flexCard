'use client'
import { Badge } from '@/components/ui/badge';
import { EditorElement, useEditor } from '@/lib/editor/editor-provider';
import clsx from 'clsx';
import { Trash } from 'lucide-react';
import React from 'react';

type Props = {
  element: EditorElement;
  sectionId: string;
}

const TextElement = (props: Props) => {
  const { dispatch, state } = useEditor();

  const handleDeleteElement = () => {
    dispatch({
      type: 'DELETE_ELEMENT',
      payload: { elementId: props.element.id, sectionId: props.sectionId },
    });
  };

  const handleOnClickBody = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: 'CHANGE_CLICKED_ELEMENT',
      payload: {
        elementDetails: props.element,
      },
    });
  };

  const handleTextUpdate = (e: React.FocusEvent<HTMLSpanElement>) => {
    const newText = e.target.innerText;
    if (newText !== props.element.text) {
      dispatch({
        type: 'UPDATE_ELEMENT',
        payload: {
          sectionId: props.sectionId,
          elementDetails: {
            ...props.element,
            text: newText,
          },
        },
      });
    }
  };

  return (
    <div
      className={clsx('p-[2px] w-full m-[5px] relative text-[16px] transition-all', {
        '!border-blue-500': state.editor.selectedElement.id === props.element.id,
        '!border-solid': state.editor.selectedElement.id === props.element.id,
        'border-dashed border-[1px] border-slate-300': !state.editor.liveMode,
      })}
      onClick={handleOnClickBody}
    >
      {state.editor.selectedElement.id === props.element.id && !state.editor.liveMode && (
        <Badge className="absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg">
          {state.editor.selectedElement.type}
        </Badge>
      )}
      <span
        contentEditable={!state.editor.liveMode}
        onBlur={handleTextUpdate}
        suppressContentEditableWarning={true}
      >
        {props.element.text}
      </span>
      {state.editor.selectedElement.id === props.element.id && !state.editor.liveMode && (
        <div className="absolute bg-primary px-2.5 py-1 text-xs font-bold -top-[25px] -right-[1px] rounded-none rounded-t-lg !text-white">
          <Trash
            className="cursor-pointer"
            size={16}
            onClick={handleDeleteElement}
          />
        </div>
      )}
    </div>
  );
};

export default TextElement;
