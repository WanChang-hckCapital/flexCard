
'use client';

import { Button } from '@/components/ui/button';
import { EyeOff } from 'lucide-react';
import React, { useEffect } from 'react';
import { EditorComponent, EditorElement, EditorSection, useEditor } from '@/lib/editor/editor-provider';
import Recursive from './card-editor-components/recursive';
import AddBoxDropdown from '@/components/workspace/dropdownbox';
import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';
import { EditorComponentsBtns } from '@/lib/constants';

type Props = {
  liveMode?: boolean;
};

const CardEditor: React.FC<Props> = ({ liveMode }) => {
  const { dispatch, state } = useEditor();

  useEffect(() => {
    if (liveMode) {
      dispatch({
        type: 'TOGGLE_LIVE_MODE',
        payload: { value: true },
      });
    }
  }, [liveMode, dispatch]);

  //CHALLENGE: make this more performant
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const response = await getFunnelPageDetails(funnelPageId)
  //     if (!response) return

  //     dispatch({
  //       type: 'LOAD_DATA',
  //       payload: {
  //         elements: response.content ? JSON.parse(response?.content) : '',
  //         withLive: !!liveMode,
  //       },
  //     })
  //   }
  //   fetchData()
  // }, [funnelPageId])

  const initialBoxElement: EditorElement = {
    id: 'initial_box',
    type: 'box',
    layout: 'vetical',
    contents: []
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleOnDrop = (e: React.DragEvent) => {
    e.stopPropagation()
    const componentType = e.dataTransfer.getData('componentType') as EditorComponentsBtns

    console.log('componentType', componentType);

    switch (componentType) {
      case 'bubble':
        const newBubbleComponent = {
          id: uuidv4(),
          type: 'bubble' as EditorComponentsBtns,
          header: { id: uuidv4(), contents: [] },
          hero: { id: uuidv4(), contents: [] },
          body: { id: uuidv4(), contents: [initialBoxElement] },
          footer: { id: uuidv4(), contents: [] }
        };

        dispatch({
          type: 'ADD_COMPONENT',
          payload: {
            componentDetails: newBubbleComponent
          }
        });
        break
    }
  }

  const handleClick = () => {
    dispatch({
      type: 'CHANGE_CLICKED_ELEMENT',
      payload: {
        bubbleId: '',
        sectionId: ''
      },
    });
  };

  const handleUnpreview = () => {
    dispatch({ type: 'TOGGLE_PREVIEW_MODE' });
    dispatch({ type: 'TOGGLE_LIVE_MODE' });
  };

  const renderSection = (section: EditorSection, componentId: string) => {
    return section.contents.map(element => (
      <Recursive key={element.id} element={element} sectionId={section.id} bubbleId={componentId}/>
    ));
  };

  const renderComponent = (component: EditorComponent) => {
    if (component.type === 'carousel') {
      return (
        <div className="flex space-x-1 overflow-x-scroll snap-x">
          {component.contents?.map((subComponent, index) => (
            console.log('subcomponent in', subComponent),
            <div key={index} className="flex-none snap-start" style={{ minWidth: '300px' }}>
              {renderComponent(subComponent)}
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div>
          {component.hero && (
            <div>
              <AddBoxDropdown heroSectionId={component.hero.id} bubbleId={component.id}/>
            </div>
          )}
          <div className="component-container relative m-2 p-4 border shadow-lg rounded-lg bg-white w-[300px]">
            {component.header && renderSection(component.header, component.id)}
            {component.hero && renderSection(component.hero, component.id)}
            {component.body && renderSection(component.body, component.id)}
            {component.footer && renderSection(component.footer, component.id)}
          </div>
        </div>
      );
    }
  };

  return (
    <div
      className={clsx(
        'use-automation-zoom-in h-full overflow-auto flex space-x-4 p-5 bg-background transition-all',
        {
          '!p-0 !mr-0': state.editor.previewMode || state.editor.liveMode,
          '!w-full': state.editor.device === 'Desktop',
        }
      )}
      onClick={handleClick}
      onDrop={handleOnDrop}
      onDragOver={handleDragOver}
    >
      {state.editor.previewMode && state.editor.liveMode && (
        <Button variant="ghost" size="icon" className="w-6 h-6 bg-slate-600 p-[2px] fixed top-0 left-0 z-[100]" onClick={handleUnpreview}>
          <EyeOff size={24} />
        </Button>
      )}
      <div className="components-flex-container w-[73%] max-w-fit">
        {state.editor.component ? renderComponent(state.editor.component) : <p>No components to display</p>}
      </div>
    </div>
  );
};

export default CardEditor;
