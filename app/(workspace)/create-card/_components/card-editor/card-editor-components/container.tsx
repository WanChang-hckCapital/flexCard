'use client'
import { Badge } from '@/components/ui/badge'
import { EditorElementsBtns, defaultStyles } from '@/lib/constants'
import { EditorElement, useEditor } from '@/lib/editor/editor-provider'
import clsx from 'clsx'
import React from 'react'
import { v4 as uuidv4 } from 'uuid';
import Recursive from './recursive'
import { Trash } from 'lucide-react'

type Props = { element: EditorElement, sectionId: string}

const Container = ({ element, sectionId }: Props) => {
  // const { id, type, layout, contents, position, flex, spacing, margin, width, height, maxWidth,
  //   maxHeight, backgroundColor, borderRadius, cornerRadius, justifyContent, alignItems,
  //   offsetTop, offsetBottom, offsetStart, offsetEnd, paddingAll, paddingTop, paddingBottom,
  //   paddingStart, paddingEnd } = element
  const { dispatch, state } = useEditor()

  const strElementType = element.type?.toString() || 'initial';

  const handleOnDrop = (e: React.DragEvent) => {
    e.stopPropagation()
    const elementType = e.dataTransfer.getData('elementType') as EditorElementsBtns

    console.log('elementType', elementType);
    console.log('element', element);
    console.log('sectionId', sectionId);

    switch (elementType) {
      case 'text':
        if (element.type === 'box'){
          dispatch({
            type: 'ADD_ELEMENT',
            payload: {
              sectionId: sectionId,
              targetId: element.id,
              elementDetails: {
                id: uuidv4(),
                type: elementType,
                text: 'New Text'
              },
            },
          });
        }
        break
      case 'button':
        if (element.type === 'box'){
          dispatch({
            type: 'ADD_ELEMENT',
            payload: {
              sectionId: sectionId,
              targetId: element.id,
              elementDetails: {
                id: uuidv4(),
                type: elementType,
                label: 'New Button',
                uri: 'https://www.google.com',
              },
            },
          });
        }
        break
      case 'separator':
        if (element.type === 'box'){
          dispatch({
            type: 'ADD_ELEMENT',
            payload: {
              sectionId: sectionId,
              targetId: element.id,
              elementDetails: {
                id: uuidv4(),
                type: elementType,
              },
            },
          });
        }
        break
      // case 'video':
      //   dispatch({
      //     type: 'ADD_ELEMENT',
      //     payload: {
      //       containerId: id,
      //       elementDetails: {
      //         content: {
      //           src: 'https://www.youtube.com/embed/A3l6YYkXzzg?si=zbcCeWcpq7Cwf8W1',
      //         },
      //         id: v4(),
      //         name: 'Video',
      //         styles: {},
      //         type: 'video',
      //       },
      //     },
      //   })
      //   break
      case 'box':
        dispatch({
          type: 'ADD_ELEMENT',
          payload: {
            sectionId: sectionId,
            targetId: element.id,
            elementDetails: {
              id: uuidv4(),
              type: elementType,
              layout: 'vertical',
              contents: []
            },
          },
        })
        break
      // case 'bubble':
      //   dispatch({
      //     type: 'ADD_COMPONENT',
      //     payload: {
      //       componentDetails: {
      //         id: '',
      //         type: null,
      //         direction: undefined,
      //         size: undefined,
      //         contents: undefined,
      //         header: undefined,
      //         hero: undefined,
      //         body: {
      //           id: '',
      //           contents: []
      //         },
      //         footer: undefined
      //       }
      //     },
      //   })
      //   break
      // case 'carousel':
      //     dispatch({
      //       type: 'ADD_COMPONENT',
      //       payload: {
      //         componentDetails: {
      //           id: '',
      //           type: null,
      //           direction: undefined,
      //           size: undefined,
      //           contents: undefined,
      //           header: undefined,
      //           hero: undefined,
      //           body: {
      //             id: '',
      //             contents: []
      //           },
      //           footer: undefined
      //         }
      //       },
      //     })
      //     break
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
      },
    })
  }

  const handleDeleteElement = () => {
    dispatch({
      type: 'DELETE_ELEMENT',
      payload: {
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
  };

  return (
    <div
      style={styles}
      className={clsx('relative p-4 transition-all group', {
        'max-w-full w-full': strElementType === 'box' || strElementType === '2Col',
        'h-fit': strElementType === 'box',
        'h-full': strElementType === 'initial',
        'overflow-scroll ': strElementType === 'initial',
        'flex flex-col md:!flex-row': strElementType === '2Col',
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
        'border-dashed border-[1px] border-slate-300': !state.editor.liveMode,
      })}
      onDrop={handleOnDrop}
      onDragOver={handleDragOver}
      draggable={strElementType !== 'initial'}
      onClick={handleOnClickBody}
      onDragStart={handleDragStart}
    >
      <Badge
        className={clsx(
          'absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg hidden',
          {
            block:
              state.editor.selectedElement.id === element.id &&
              !state.editor.liveMode,
          }
        )}
      >
        {strElementType}
      </Badge>

      {element.contents && element.contents.map((childElement) => (
        <Recursive key={childElement.id} element={childElement} sectionId={sectionId}/>
      ))}

      {state.editor.selectedElement.id === element.id && !state.editor.liveMode && (
        <div className="absolute top-0 right-0 bg-primary px-2.5 py-1 text-xs font-bold rounded-none rounded-t-lg">
          <Trash size={16} onClick={handleDeleteElement} className="text-white cursor-pointer" />
        </div>
      )}
    </div>
  )
}

export default Container
