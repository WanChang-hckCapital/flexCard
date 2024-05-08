'use client';
import React, { useState } from 'react';
import { EditorElement, useEditor } from '@/lib/editor/editor-provider';
import { Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';

type ButtonElementProps = {
  element: EditorElement;
  sectionId: string;
  bubbleId: string;
}

const ButtonElement: React.FC<ButtonElementProps> = ({ element, sectionId, bubbleId }) => {
  const { dispatch, state } = useEditor();

  const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);

  const handleOnClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!state.editor.previewMode) {
      dispatch({
        type: 'CHANGE_CLICKED_ELEMENT',
        payload: {
          elementDetails: element,
          bubbleId: bubbleId,
          sectionId: sectionId
        },
      });
    } else if (element.uri) {
      window.location.href = element.uri;
    }
  };

  const handleDeleteElement = () => {
    dispatch({
      type: 'DELETE_ELEMENT',
      payload: {
        bubbleId: bubbleId,
        sectionId: sectionId,
        elementId: element.id,
      },
    });
  };

  return (
    <div className={clsx('relative', { 'cursor-pointer': !state.editor.liveMode })} 
      onClick={handleOnClick}
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}
      >
      <Badge
        className={clsx(
          'absolute -top-[25px] -left-[10px] rounded-none rounded-t-lg hidden',
          {
            block:
              state.editor.selectedElement.id === element.id &&
              !state.editor.liveMode,
          }
        )}
      >
        <div className='text-slate-700'>
          <p className='text-xs'>{state.editor.selectedElement.type?.toUpperCase()}</p>
        </div>
      </Badge>

      <button
        style={{
          backgroundColor: element.backgroundColor || 'blue',
          padding: '10px 20px',
          borderRadius: '5px',
          color: 'white'
        }}
        disabled={state.editor.liveMode}
      >
        {element.label || 'Click me'}
      </button>

      {mouseIsOver && state.editor.selectedElement.id === element.id && !state.editor.liveMode && (
        <div className="absolute -top-[28px] -right-[3px]">
          <Button
            className="flex justify-center h-full border rounded-md bg-red-500"
            variant={"outline"}
            onClick={handleDeleteElement}
          >
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ButtonElement;
