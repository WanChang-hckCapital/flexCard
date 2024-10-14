'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EditorElement, EditorSection, useEditor } from '@/lib/editor/editor-provider'
import clsx from 'clsx'
import { Trash } from 'lucide-react'
import React, { useState } from 'react'

type Props = {
  element: EditorElement,
  sectionId: string,
  bubbleId: string
}

const IconElement = (props: Props) => {
  const { dispatch, state } = useEditor();

  const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);

  // const handleDragStart = (e: React.DragEvent, type: EditorElementsBtns) => {
  //   if (type === null) return
  //   e.dataTransfer.setData('componentType', type)
  // }

  const handleOnClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch({
      type: 'CHANGE_CLICKED_ELEMENT',
      payload: {
        elementDetails: props.element,
        bubbleId: props.bubbleId,
        sectionId: props.sectionId
      },
    })
  }

  const handleDeleteElement = () => {
    dispatch({
      type: 'DELETE_ELEMENT',
      payload: { elementId: props.element.id, sectionId: props.sectionId, bubbleId: props.bubbleId },
    })
  }

  return (
    <div
      // draggable
      // onDragStart={(e) => handleDragStart(e, 'icon')}
      onClick={handleOnClick}
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}
      className={clsx(
        'relative text-[16px] transition-all flex items-center justify-center',
        {
          '!border-blue-500':
            state.editor.selectedElement.id === props.element.id,
          '!border-solid': state.editor.selectedElement.id === props.element.id,
          'border-dashed border-[1px] border-slate-300': !state.editor.liveMode,
        }
      )}
    >
      {/* {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <Badge className="absolute -top-[23px] -left-[35px] rounded-none rounded-t-lg ">
            <div className='text-[16px]'>
              <p className='text-xs'>{state.editor.selectedElement.type?.toUpperCase()}</p>
            </div>
          </Badge>
        )} */}

      {!Array.isArray(props.element.url) && (
        <span
          style={{
            backgroundImage: `url(${props.element.url || 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png'})`,
            backgroundSize: 'contain',
            fontSize: `${parseInt(props.element.size || '16')}px`,
            display: 'inline-block',
            width: '1em',
            height: '1em',
          }}
        />
      )}

      {mouseIsOver && state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <div className="absolute -top-[28px] -right-[45px]">
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
  )
}

IconElement.displayName = 'IconElement';

export default IconElement
