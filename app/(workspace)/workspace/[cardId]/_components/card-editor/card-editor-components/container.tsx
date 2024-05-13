'use client'

import { Badge } from '@/components/ui/badge'
import { EditorElementsBtns, defaultStyles } from '@/lib/constants'
import { EditorComponent, EditorElement, useEditor } from '@/lib/editor/editor-provider'
import clsx from 'clsx'
import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
import Recursive from './recursive'
import { Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type Props = { element: EditorElement, sectionId: string, bubble: EditorComponent }

const Container = ({ element, sectionId, bubble }: Props) => {

  const { dispatch, state } = useEditor()

  const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);

  const strElementType = element.type?.toString() || 'initial';

  const handleOnDrop = (e: React.DragEvent) => {
    e.stopPropagation()
    const elementType = e.dataTransfer.getData('elementType') as EditorElementsBtns

    console.log('elementType', elementType);
    console.log('element', element);
    console.log('sectionId', sectionId);

    switch (elementType) {
      case 'text':
        if (element.type === 'box') {
          dispatch({
            type: 'ADD_ELEMENT',
            payload: {
              bubbleId: bubble.id,
              sectionId: sectionId,
              targetId: element.id,
              elementDetails: {
                id: uuidv4(),
                type: elementType,
                text: 'New Text',
                description: 'Render your mind using me.',
              },
            },
          });
        }
        break
      case 'button':
        if (element.type === 'box' && element.layout !== 'baseline') {
          dispatch({
            type: 'ADD_ELEMENT',
            payload: {
              bubbleId: bubble.id,
              sectionId: sectionId,
              targetId: element.id,
              elementDetails: {
                id: uuidv4(),
                type: elementType,
                action: {
                  id: uuidv4(),
                  type: 'uri',
                  label: 'New Button',
                  uri: 'https://www.google.com',
                },
                description: 'A button explore your route magic!',
              },
            },
          });
        }
        else {
          toast.error('Button can only be added to a vertical or horizontal layout box.')
        }
        break
      case 'separator':
        if (element.type === 'box' && element.layout !== 'baseline') {
          dispatch({
            type: 'ADD_ELEMENT',
            payload: {
              bubbleId: bubble.id,
              sectionId: sectionId,
              targetId: element.id,
              elementDetails: {
                id: uuidv4(),
                type: elementType,
                description: 'Separate your element using me.',
              },
            },
          });
        }
        else {
          toast.error('Separator can only be added to a vertical or horizontal layout box.')
        }
        break
      case 'video':
        if (sectionId === bubble.hero?.id && element.type === 'box') {
          dispatch({
            type: 'ADD_ELEMENT',
            payload: {
              bubbleId: bubble.id,
              sectionId: sectionId,
              targetId: element.id,
              elementDetails: {
                id: uuidv4(),
                type: elementType,
                url: 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2FEducationLittleBee%2Fvideos%2F2330858577109358%2F&show_text=false&t=0',
                description: 'A video to show your magic!',
              },
            },
          });
        }
        else {
          toast.error('Video can only be added to Hero Section.')
        }
        break
      case 'image':
        if (element.type === 'box' && element.layout !== 'baseline') {
          dispatch({
            type: 'ADD_ELEMENT',
            payload: {
              bubbleId: bubble.id,
              sectionId: sectionId,
              targetId: element.id,
              elementDetails: {
                id: uuidv4(),
                type: elementType,
                url: 'https://t4.ftcdn.net/jpg/02/74/09/93/240_F_274099332_K8UURabl8CcuKtJlqj0wtLo5g2KONmXY.jpg',
                description: 'Image is the best way to render information!',
              },
            },
          });
        }
        else {
          toast.error('Image can only be added to a vertical or horizontal layout box.')
        }
        break
      case 'icon':
        if (element.type === 'box' && element.layout === 'baseline') {
          dispatch({
            type: 'ADD_ELEMENT',
            payload: {
              bubbleId: bubble.id,
              sectionId: sectionId,
              targetId: element.id,
              elementDetails: {
                id: uuidv4(),
                type: elementType,
                url: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png',
                description: 'Icon is the soul of the contents!',
              },
            },
          });
        }
        else {
          toast.error('Icon can only be added to a baseline layout box.')
        }
        break
      case 'box':
        dispatch({
          type: 'ADD_ELEMENT',
          payload: {
            bubbleId: bubble.id,
            sectionId: sectionId,
            targetId: element.id,
            elementDetails: {
              id: uuidv4(),
              type: elementType,
              layout: 'vertical',
              contents: [],
              description: 'Expand your creativity by using me!',
            },
          },
        })
        break
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (strElementType === 'initial') return
    e.dataTransfer.setData('elementType', strElementType)
  }

  const handleOnClickBody = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch({
      type: 'CHANGE_CLICKED_ELEMENT',
      payload: {
        elementDetails: element,
        bubbleId: bubble.id,
        sectionId: sectionId
      },
    })
  }

  const handleDeleteElement = () => {
    console.log('handleDeleteElement', element.id);
    dispatch({
      type: 'DELETE_ELEMENT',
      payload: {
        bubbleId: bubble.id,
        sectionId: sectionId,
        elementId: element.id,
      },
    })
  }

  const styles = {
    ...defaultStyles,
    backgroundColor: element.backgroundColor,
    justifyContent: element.justifyContent,
    alignItems: element.alignItems,
    padding: element.paddingAll,
    paddingTop: element.paddingTop,
    paddingBottom: element.paddingBottom,
    paddingLeft: element.paddingStart,
    paddingRight: element.paddingEnd,
    gap: element.spacing,
    marginTop: element.margin,
    width: element.width,
    height: element.height,
    maxWidth: element.maxWidth,
    maxHeight: element.maxHeight,
    borderRadius: element.cornerRadius,
    borderWidth: element.borderWidth,
    borderColor: element.borderColor,
    top: element.offsetTop,
    left: element.offsetStart,
    right: element.offsetEnd,
    bottom: element.offsetBottom,
  };

  return (
    <div
      style={styles}
      className={clsx('relative transition-all group', {
        // 'p-2 border-dashed border-[1px] border-slate-300': bubble.hero?.id === sectionId && bubble.hero?.contents[0].contents,
        'px-2 py-2 border-dashed border-[1px] border-slate-300': bubble.hero?.id === sectionId && (bubble.hero?.contents[0].contents && bubble.hero?.contents[0].contents?.length < 1 || bubble.hero?.contents[0].contents[0]?.type === 'box'),
        'p-0 border-0': bubble.hero?.id === sectionId && bubble.hero?.contents && bubble.hero?.contents.length > 1,
        'border-0': bubble.hero?.id === sectionId,
        'max-w-full w-full': strElementType === 'box',
        'h-fit': strElementType === 'box',
        'h-full': strElementType === 'initial',
        'overflow-scroll ': strElementType === 'initial',
        '!border-blue-500':
          state.editor.selectedElement.id === element.id &&
          !state.editor.liveMode &&
          strElementType !== 'initial',
        '!border-yellow-400 !border-4':
          state.editor.selectedElement.id === element.id &&
          !state.editor.liveMode &&
          strElementType === 'initial',
        '!border-solid':
          state.editor.selectedElement.id === element.id && !state.editor.liveMode,
        'p-2 border-dashed border-[1px] border-slate-300': !state.editor.liveMode && bubble.hero?.id !== sectionId && element.aspectMode !== 'cover',
        'flex flex-row': element.layout === 'horizontal' || element.layout === 'baseline',
        'items-baseline': element.layout === 'baseline',
      })}
      onDrop={handleOnDrop}
      onDragOver={handleDragOver}
      draggable={strElementType !== 'initial'}
      onClick={handleOnClickBody}
      onDragStart={handleDragStart}
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
          <p>{strElementType.toUpperCase()} Element</p>
        </div>
      </Badge>

      {element.contents && element.contents.map((childElement) => (
        <Recursive key={childElement.id} element={childElement} sectionId={sectionId} bubble={bubble} />
      ))}

      {/* {state.editor.selectedElement.id === element.id && !state.editor.liveMode && (
        <div className="absolute -top-[23px] -right-[5px] bg-primary px-2.5 py-1 text-xs font-bold rounded-none rounded-t-lg">
          <Trash size={16} onClick={handleDeleteElement} className="text-white cursor-pointer" />
        </div>
      )} */}

      {mouseIsOver && state.editor.selectedElement.id === element.id && !state.editor.liveMode && (
        <>
          <div className="absolute -top-[25px] -right-[5px]">
            <Button
              className="flex justify-center h-full border rounded-md bg-red-500"
              variant={"outline"}
              onClick={handleDeleteElement}
            >
              <Trash className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-center animate-pulse">
            <p className="text-slate-700 text-xs">Click for properties</p>
          </div>
        </>
      )}
    </div>
  )
}

export default Container
