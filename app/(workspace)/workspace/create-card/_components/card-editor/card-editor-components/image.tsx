'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EditorElement, EditorSection, useEditor } from '@/lib/editor/editor-provider'
import clsx from 'clsx'
import { Trash } from 'lucide-react'
import React, { useState } from 'react'
import Image from 'next/image'
import { defaultStyles } from '@/lib/constants'

type Props = {
  element: EditorElement,
  sectionId: string,
  bubbleId: string
}

const ImageElement = (props: Props) => {
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

  const styles = {
    backgroundColor: props.element.backgroundColor,
    justifyContent: props.element.align || defaultStyles.textAlign,
    marginTop: props.element.margin,
    top: props.element.offsetTop || 0,
    left: props.element.offsetStart || 0,
    right: props.element.offsetEnd || 0,
    bottom: props.element.offsetBottom || 0,
  };

  return (
    <div
      // draggable
      // onDragStart={(e) => handleDragStart(e, 'image')}
      style={styles}
      onClick={handleOnClick}
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}
      className={clsx(
        'w-full relative text-[16px] transition-all flex items-center justify-center',
        {
          '!border-blue-500':
            state.editor.selectedElement.id === props.element.id,
          '!border-solid': state.editor.selectedElement.id === props.element.id,
          'border-dashed border-[1px] border-slate-300': !state.editor.liveMode,
        }
      )}
    >
      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <Badge className="absolute -top-[5px] -left-[5px] rounded-none rounded-t-lg ">
            <div className='text-slate-700'>
              <p className='text-xs'>{state.editor.selectedElement.type?.toUpperCase()}</p>
            </div>
          </Badge>
        )}

      {!Array.isArray(props.element.url) && (
        console.log('Image AspectMode: ', props.element.aspectMode),
        // <Image
        //   src={props.element.url || ''}
        //   width={parseInt(props.element.size || '200')}
        //   height={parseInt(props.element.size || '200')}
        //   alt={props.element.imageAlt || 'User Image'}
        //   objectFit={props.element.aspectMode === 'fit' ? 'contain' : 'cover'}
        // />
        <span
          style={{
            display: 'inline-block',
            width: props.element.size || '100px',
            height: props.element.size || '100px',
            backgroundImage: `url(${props.element.url || ''})`,
            backgroundSize: props.element.aspectMode === 'cover' ? 'cover' : 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            overflow: 'hidden',
          }}
        />

      )}

      {mouseIsOver && state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <div className="absolute -top-[2px] -right-[3px]">
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

export default ImageElement
