'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EditorElement, EditorSection, useEditor } from '@/lib/editor/editor-provider'
import clsx from 'clsx'
import { Trash } from 'lucide-react'
import React, { use, useEffect, useRef, useState } from 'react'
import { defaultStyles } from '@/lib/constants'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '@/components/ui/context-menu'
import { toast } from 'sonner'
import { convertSizeToPixels, getSize } from '@/lib/utils'

type Props = {
  element: EditorElement,
  sectionId: string,
  bubbleId: string
}

const ImageElement = (props: Props) => {
  const { dispatch, state } = useEditor();

  const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);
  const [backgroundImage, setBackgroundImage] = useState(props.element.url || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.editor.selectedElement?.id === props.element.id && state.editor.selectedElement.url) {
      setBackgroundImage(state.editor.selectedElement.url);
    }
  }, [state.editor.selectedElement, props.element.id]);

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

  const handleDeleteElement = async () => {
    const currentImageUrl = state.editor.selectedElement.url;

    const url = new URL(currentImageUrl || '');
    const currentDomain = url.origin;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (currentDomain === baseUrl) {
      const currentImageId = currentImageUrl ? currentImageUrl.split('/').pop() : null;

      if (currentImageId) {
        const deleteResponse = await fetch(`/api/uploadImage/${currentImageId}`, {
          method: 'DELETE',
        });

        if (!deleteResponse.ok) {
          toast.error('Failed to delete the existing image');
        }

        const deleteData = await deleteResponse.json();
        if (deleteData.status !== 'success') {
          toast.error(deleteData.message);
        }
      }
    }

    dispatch({
      type: 'DELETE_ELEMENT',
      payload: { elementId: props.element.id, sectionId: props.sectionId, bubbleId: props.bubbleId },
    })
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      const formData = new FormData();
      formData.append('file', file);

      try {
        const currentImageUrl = state.editor.selectedElement.url;

        const url = new URL(currentImageUrl || '');
        const currentDomain = url.origin;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        if (currentDomain === baseUrl) {
          const currentImageId = currentImageUrl ? currentImageUrl.split('/').pop() : null;

          if (currentImageId) {
            const deleteResponse = await fetch(`/api/uploadImage/${currentImageId}`, {
              method: 'DELETE',
            });

            if (!deleteResponse.ok) {
              toast.error('Failed to delete the existing image');
            }

            const deleteData = await deleteResponse.json();
            if (deleteData.status !== 'success') {
              toast.error(deleteData.message);
            }
          }
        }

        const response = await fetch('/api/uploadImage', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          toast.error('File upload failed');
        }

        const data = await response.json();
        const uploadedImageUrl = `/api/uploadImage/${data.fileId}`;
        const uploadImageUrlWithHttp = `${process.env.NEXT_PUBLIC_BASE_URL}${uploadedImageUrl}`;

        setBackgroundImage(uploadedImageUrl);

        const updatedElementDetails = {
          ...state.editor.selectedElement,
          url: uploadImageUrlWithHttp,
        };

        dispatch({
          type: 'UPDATE_ELEMENT',
          payload: {
            bubbleId: props.bubbleId,
            sectionId: props.sectionId,
            elementDetails: updatedElementDetails,
          },
        })

        toast.success('Image has been uploaded and updated successfully.');

      } catch (error: any) {
        toast.error('Failed to upload the image, Please try again.');
        console.error(`Upload error: ${error.message}`);
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const styles = {
    backgroundColor: props.element.backgroundColor,
    justifyContent: props.element.align || defaultStyles.textAlign,
    marginTop: convertSizeToPixels(props.element.margin),
    top: convertSizeToPixels(props.element.offsetTop) || 0,
    left: convertSizeToPixels(props.element.offsetStart) || 0,
    right: convertSizeToPixels(props.element.offsetEnd) || 0,
    bottom: convertSizeToPixels(props.element.offsetBottom) || 0,
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
        'w-full relative text-[16px] overflow-hidden transition-all flex items-center justify-center',
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
          <Badge className="absolute -top-[5px] -left-[5px] rounded-none rounded-t-lg ">
            <div className='text-slate-700'>
              <p className='text-xs'>{state.editor.selectedElement.type?.toUpperCase()}</p>
            </div>
          </Badge>
        )} */}

      {!Array.isArray(props.element.url) && (
        <ContextMenu>
          <ContextMenuTrigger>
            <span
              style={{
                display: 'inline-block',
                width: props.element.size === 'xs' ? '60px' : props.element.size === 'sm' ? '80px' : props.element.size === 'md' ? '100px' : props.element.size === 'lg' ? '120px' : props.element.size === 'xl' ? '140px' : props.element.size === 'xxl' ? '160px' : props.element.size === '3xl' ? '180px' : props.element.size === '4xl' ? '200px' : props.element.size === '5xl' ? '220px' : props.element.size === 'full' ? getSize(state.editor.component.size) : props.element.size || '100px',
                height: props.element.size === 'xs' ? '60px' : props.element.size === 'sm' ? '80px' : props.element.size === 'md' ? '100px' : props.element.size === 'lg' ? '120px' : props.element.size === 'xl' ? '140px' : props.element.size === 'xxl' ? '160px' : props.element.size === '3xl' ? '180px' : props.element.size === '4xl' ? '200px' : props.element.size === '5xl' ? '220px' : props.element.size === 'full' ? getSize(state.editor.component.size) : props.element.size || '100px',
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: props.element.aspectMode === 'cover' ? 'cover' : 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                overflow: 'hidden',
              }}
            />
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem inset onClick={triggerFileInput}>
              Upload Image
              <ContextMenuShortcut>⌘[</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </ContextMenu>
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

ImageElement.displayName = 'ImageElement';

export default ImageElement
