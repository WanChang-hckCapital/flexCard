'use client'

import { EditorElementsBtns, defaultStyles } from '@/lib/constants'
import { EditorComponent, EditorElement, useEditor } from '@/lib/editor/editor-provider'
import clsx from 'clsx'
import React, { useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
import Recursive from './recursive'
import { Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { convertSizeToPixels } from '@/lib/utils'

type Props = { element: EditorElement, sectionId: string, bubble: EditorComponent }

const Container = ({ element, sectionId, bubble }: Props) => {

  const { dispatch, state } = useEditor()
  const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);
  const [dragging, setDragging] = useState<boolean>(false);
  const dragItem = useRef<{ itemI: number } | null>(null);
  const dragNode = useRef<HTMLDivElement | null>(null);

  const strElementType = element.type?.toString() || 'initial';
  const handleOnDrop = (e: React.DragEvent) => {
    e.stopPropagation()
    const elementType = e.dataTransfer.getData('elementType') as EditorElementsBtns

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

  const handleDragStart = (e: React.DragEvent, params: { itemI: number }) => {
    dragNode.current = e.target as HTMLDivElement;
    dragNode.current.addEventListener('dragend', handleDragEnd);
    dragItem.current = params;
    setTimeout(() => {
      setDragging(true);
    }, 0);
  };

  const handleDragEnter = (e: React.DragEvent, targetItem: { itemI: number }) => {
    if (dragNode.current !== e.target) {
      if (element.contents && element.contents.length > 0) {
        const newContents = [...element.contents];
        const draggedItem = newContents.splice(dragItem.current!.itemI, 1)[0];
        newContents.splice(targetItem.itemI, 0, draggedItem);

        dragItem.current = targetItem;

        const targetRect = (e.target as HTMLDivElement).getBoundingClientRect();
        const dragPositionX = e.clientX - targetRect.left;
        const dragPositionY = e.clientY - targetRect.top;
        const targetWidth = targetRect.width;
        const targetHeight = targetRect.height;

        const verticalThreshold = targetWidth * 0.35;
        const horizontalThreshold = targetHeight * 0.35; 

        const isVertical = dragPositionX > targetWidth - verticalThreshold || dragPositionX < verticalThreshold;
        const isHorizontal = dragPositionY > targetHeight - horizontalThreshold || dragPositionY < horizontalThreshold;

        let newLayout = element.layout;
        if (isVertical) {
          newLayout = 'vertical';
        } else if (isHorizontal) {
          newLayout = 'horizontal';
        }

        const updatedElement = {
          ...element,
          contents: newContents,
          layout: newLayout,
        };

        dispatch({
          type: 'UPDATE_ELEMENT',
          payload: {
            bubbleId: bubble.id,
            sectionId: sectionId,
            elementDetails: updatedElement,
          },
        });
      }
    }
  };

  const handleDragEnd = () => {
    setDragging(false);
    dragItem.current = null;
    if (dragNode.current) {
      dragNode.current.removeEventListener('dragend', handleDragEnd);
      dragNode.current = null;
    }
  };

  const getStyles = (item: { itemI: number }) => {
    if (dragItem.current?.itemI === item.itemI) {
      return 'dnd-item current flex-1';
    }
    return 'dnd-item flex-1';
  };

  const handleAddElement = (elementType: string) => {
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
    padding: element.paddingAll ? convertSizeToPixels(element.paddingAll) : '',
    paddingTop: convertSizeToPixels(element.paddingTop),
    paddingBottom: convertSizeToPixels(element.paddingBottom),
    paddingLeft: convertSizeToPixels(element.paddingStart),
    paddingRight: convertSizeToPixels(element.paddingEnd),
    gap: convertSizeToPixels(element.spacing),
    marginTop: convertSizeToPixels(element.margin),
    width: element.width,
    height: element.height,
    maxWidth: element.maxWidth,
    maxHeight: element.maxHeight,
    borderRadius: convertSizeToPixels(element.cornerRadius),
    borderWidth: element.borderWidth ? convertSizeToPixels(element.borderWidth) : '0px',
    borderColor: element.borderColor,
    top: convertSizeToPixels(element.offsetTop),
    left: convertSizeToPixels(element.offsetStart),
    right: convertSizeToPixels(element.offsetEnd),
    bottom: convertSizeToPixels(element.offsetEnd),
  };

  const isInitialBox = element.id === bubble.body?.contents[0]?.id;

  // need to fix how to control new added box
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          style={styles}
          className={clsx('relative transition-all group overflow-hidden border-0', {
            'px-2 py-2': bubble.hero?.id === sectionId && (bubble.hero?.contents[0].contents && bubble.hero?.contents[0].contents?.length < 1 ||
              (bubble.hero?.contents[0]?.contents && bubble.hero.contents[0].contents[0]?.type === 'box')),
            'p-0 border-0': bubble.hero?.id === sectionId && bubble.hero?.contents && bubble.hero?.contents.length > 1,
            'border-0': bubble.hero?.id === sectionId,
            'max-w-full w-full': strElementType === 'box',
            'h-fit': strElementType === 'box',
            'h-full': strElementType === 'initial',
            'overflow-scroll ': strElementType === 'initial',
            'flex flex-row': element.layout === 'horizontal' || element.layout === 'baseline',
            'items-baseline': element.layout === 'baseline',
            'p-[20px]': element.id === 'initial_box',
            'p-[10px]': element.id === 'initial_footer_box',
          })}
          onDrop={handleOnDrop}
          onClick={handleOnClickBody}
          onDragOver={(e) => e.preventDefault()}
          onMouseEnter={() => {
            setMouseIsOver(true);
          }}
          onMouseLeave={() => {
            setMouseIsOver(false);
          }}
        >
          {element.contents &&
            element.contents.map((childElement, itemI) => {

              return (
                <div
                  key={childElement.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, { itemI })}
                  onDragEnter={dragging ? (e) => handleDragEnter(e, { itemI }) : undefined}
                  className={dragging ? getStyles({ itemI }) : 'dnd-item flex-1'}
                >
                  <Recursive element={childElement} sectionId={sectionId} bubble={bubble} />
                </div>
              );
            })}

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
            </>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem inset onClick={() => handleAddElement('box')}>New Box</ContextMenuItem>
        <ContextMenuItem inset onClick={() => handleAddElement('text')}>New Text</ContextMenuItem>
        <ContextMenuItem inset onClick={() => handleAddElement('video')}>New Video</ContextMenuItem>
        <ContextMenuItem inset onClick={() => handleAddElement('button')}>New Button</ContextMenuItem>
        <ContextMenuItem inset onClick={() => handleAddElement('separator')}>New Separator</ContextMenuItem>
        <ContextMenuItem inset onClick={() => handleAddElement('image')}>New Image</ContextMenuItem>
        <ContextMenuItem inset onClick={() => handleAddElement('icon')}>New Icon</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

Container.displayName = 'Container';

export default Container
