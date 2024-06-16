'use client';
import React, { useState } from 'react';
import { EditorElement, EditorSection, useEditor } from '@/lib/editor/editor-provider';
import { Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';

type SeparatorProps = {
  element: EditorElement;
  sectionId: string;
  bubbleId: string;
}

const Separator: React.FC<SeparatorProps> = ({ element, sectionId, bubbleId }) => {
  const { dispatch, state } = useEditor();

  const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);

  const handleOnClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: 'CHANGE_CLICKED_ELEMENT',
      payload: {
        elementDetails: element,
        bubbleId: bubbleId,
        sectionId: sectionId
      },
    });
  };

  const handleDeleteElement = () => {
    dispatch({
      type: 'DELETE_ELEMENT',
      payload: {
        sectionId: sectionId,
        elementId: element.id,
        bubbleId: bubbleId,
      },
    });
  };

  const styles = {
    border: '1 solid',
    borderColor: element.color || '#ccc',
    marginTop: element.margin,
  };

  return (
    <div
      className={clsx('relative', { 'cursor-pointer': !state.editor.liveMode, }, 'pt-[10px]', 'pb-[10px]')}
      onClick={handleOnClick}
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}
    >
      {/* {state.editor.selectedElement.id === element.id && !state.editor.liveMode && (
        <Badge className="absolute -top-[15px] -left-[10px] rounded-none rounded-t-lg">
          <div className='text-[16px]'>
            <p className='text-xs'>{state.editor.selectedElement.type?.toUpperCase()}</p>
          </div>
        </Badge>
      )} */}

      <hr style={styles} />

      {mouseIsOver && state.editor.selectedElement.id === element.id && !state.editor.liveMode && (
        <div className="absolute -top-[5px] -right-[3px]">
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

Separator.displayName = 'Separator';

export default Separator;
