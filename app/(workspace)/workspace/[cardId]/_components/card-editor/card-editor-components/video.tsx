'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EditorElementsBtns } from '@/lib/constants'
import { EditorElement, EditorSection, useEditor } from '@/lib/editor/editor-provider'
import clsx from 'clsx'
import { Trash } from 'lucide-react'
import React, { useState } from 'react'

type Props = {
  element: EditorElement,
  sectionId: string,
  bubbleId: string
}

const VideoElement = (props: Props) => {
  const { dispatch, state } = useEditor();

  const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);

  const formatYouTubeUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }

    return url;
  }

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
    padding: '5px',
  };

  return (
    <div
      // draggable
      // onDragStart={(e) => handleDragStart(e, 'video')}
      style={styles}
      onClick={handleOnClick}
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}
      className={clsx(
        'p-[2px] w-full relative text-[16px] transition-all flex items-center justify-center',
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
          <Badge className="absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg ">
            <div className='text-[16px]'>
              <p className='text-xs'>{state.editor.selectedElement.type?.toUpperCase()}</p>
            </div>
          </Badge>
        )} */}

      {/* {!Array.isArray(props.element.url) && (
        <iframe
          // width={props.element.width || '200'}
          // height={props.element.height || '115'}
          width='100%'
          height='100%'
          src={formatYouTubeUrl(props.element.url || '')}
          title="YouTube video player"
          allow="accelerometer;"
        />
      )} */}

      {!Array.isArray(props.element.url) && (
        <iframe
          width='100%'
          height='100%'
          src={formatYouTubeUrl(props.element.url || '')}
          title="YouTube video player"
          allow="accelerometer;"
        />
      )}



      {mouseIsOver && state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
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
  )
}

VideoElement.displayName = 'VideoElement';

export default VideoElement
