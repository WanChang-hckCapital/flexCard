'use client'
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { defaultStyles } from '@/lib/constants';
import { EditorElement, EditorSection, useEditor } from '@/lib/editor/editor-provider';
import { convertSizeToPixels } from '@/lib/utils';
import clsx from 'clsx';
import { Trash } from 'lucide-react';
import React, { useState } from 'react';

type Props = {
  element: EditorElement;
  sectionId: string;
  bubbleId: string;
}

const TextElement = (props: Props) => {
  const { dispatch, state } = useEditor();

  const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);

  const handleDeleteElement = () => {
    dispatch({
      type: 'DELETE_ELEMENT',
      payload: { elementId: props.element.id, sectionId: props.sectionId, bubbleId: props.bubbleId },
    });
  };

  const handleOnClickBody = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: 'CHANGE_CLICKED_ELEMENT',
      payload: {
        elementDetails: props.element,
        bubbleId: props.bubbleId,
        sectionId: props.sectionId
      },
    });
  };

  const handleTextUpdate = (e: React.FocusEvent<HTMLSpanElement>) => {
    const newText = e.target.innerText;
    if (newText !== props.element.text) {
      dispatch({
        type: 'UPDATE_ELEMENT',
        payload: {
          bubbleId: props.bubbleId,
          sectionId: props.sectionId,
          elementDetails: {
            ...props.element,
            text: newText,
          },
        },
      });
    }
  };

  const styles: React.CSSProperties = {
    ...defaultStyles,
    color: props.element.color || defaultStyles.color,
    textAlign: props.element.align as 'left' | 'right' | 'center' | 'justify' | 'start' | 'end' | undefined || defaultStyles.textAlign,
    letterSpacing: props.element.lineSpacing,
    fontWeight: props.element.weight,
    fontSize: props.element.size === 'xxs' ? '11px' : props.element.size === 'xs' ? '13px' : props.element.size === 'sm' ? '14px' : props.element.size === 'md' ? '16px' : props.element.size === 'lg' ? '19px' : props.element.size === 'xl' ? '22px' : props.element.size === 'xxl' ? '29px' : props.element.size === '3xl' ? '35px' : props.element.size === '4xl' ? '48px' : props.element.size === '5xl' ? '74px' : props.element.size,
    fontStyle: props.element.style,
    textDecorationLine: props.element.decoration,
    marginTop: props.element.margin,
    top: convertSizeToPixels(props.element.offsetTop),
    left: convertSizeToPixels(props.element.offsetStart),
    right: convertSizeToPixels(props.element.offsetEnd),
    bottom: convertSizeToPixels(props.element.offsetBottom),
  };

  return (
    <div
      style={styles}
      className={clsx('relative text-[16px] transition-all', {
        '!border-blue-500': state.editor.selectedElement.id === props.element.id,
        '!border-solid': state.editor.selectedElement.id === props.element.id,
        'border-[1px] border-dashed border-gray-300 rounded-md': mouseIsOver,
        'text-wrap': props.element.wrap === 'true',
        'text-nowrap': props.element.wrap === 'false',
      })}
      onClick={handleOnClickBody}
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}
    >
      {/* {state.editor.selectedElement.id === props.element.id && !state.editor.liveMode && (
        <Badge className="absolute -top-[25px] -left-[10px] rounded-none rounded-t-lg">
          <div className='text-[16px]'>
            <p>{state.editor.selectedElement.type?.toUpperCase()}</p>
          </div>

        </Badge>
      )} */}
     <span
        contentEditable={!state.editor.liveMode}
        onBlur={handleTextUpdate}
        suppressContentEditableWarning={true}
        style={{
          display: 'inline-block',
          width: '100%',
          height: '100%',
        }}
      >
        {props.element.text}
      </span>

      {state.editor.selectedElement.id === props.element.id && !state.editor.liveMode && (
        <div className="absolute -top-[5px] -right-[70px]">
          <Button
            className="flex justify-center h-full border rounded-md bg-red-500"
            variant={"ghost"}
            onClick={handleDeleteElement}
          >
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

TextElement.displayName = 'TextElement';

export default TextElement;
