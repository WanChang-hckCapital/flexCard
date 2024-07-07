'use client';
import React, { useState } from 'react';
import { EditorElement, useEditor } from '@/lib/editor/editor-provider';
import { Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { convertSizeToPixels } from '@/lib/utils';

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
    } else if (element.action?.type === 'uri' && element.action.uri) {
      window.location.href = element.action.uri;
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

  const styles: React.CSSProperties = {
    backgroundColor: element.style === 'primary' ? (element.color || '#17c950') : element.style === 'secondary' ? (element.color || '#dcdfe5') : 'transparent',
    color: element.style === 'primary' ? 'white' : element.style === 'secondary' ? 'black' : (element.color || '#42659a'),
    height: element.height === 'sm' ? '40px' : element.height === 'md' ? '52px' : '52px',
    padding: '10px 20px',
    borderRadius: '5px',
    width: '100%',
    textAlign: 'center',
    alignContent: 'center',
    marginTop: convertSizeToPixels(element.margin),
    top: convertSizeToPixels(element.offsetTop),
    left: convertSizeToPixels(element.offsetStart),
    right: convertSizeToPixels(element.offsetEnd),
    bottom: convertSizeToPixels(element.offsetBottom),
  };

  return (
    <div 
      style={styles}
      className={clsx('relative', { 'cursor-pointer': !state.editor.liveMode })}
      onClick={handleOnClick}
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}
    >
      {/* <Badge
        className={clsx(
          'absolute -top-[25px] -left-[10px] rounded-none rounded-t-lg hidden',
          {
            block:
              state.editor.selectedElement.id === element.id &&
              !state.editor.liveMode,
          }
        )}
      >
        <div className='text-[16px]'>
          <p className='text-xs text-black'>{state.editor.selectedElement.type?.toUpperCase()}</p>
        </div>
      </Badge> */}

      <button
        disabled={state.editor.liveMode}
      >
        {element.action?.label || 'Click me'}
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

ButtonElement.displayName = 'ButtonElement';

export default ButtonElement;
