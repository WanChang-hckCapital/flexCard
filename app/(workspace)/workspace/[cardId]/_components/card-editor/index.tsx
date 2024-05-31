
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
import { fetchComponent } from '@/lib/actions/workspace.actions';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';

type Props = {
  liveMode?: boolean;
  componentId: object;
};

const CardEditor: React.FC<Props> = ({ liveMode, componentId }) => {
  const { dispatch, state } = useEditor();

  useEffect(() => {
    if (liveMode) {
      dispatch({
        type: 'TOGGLE_LIVE_MODE',
        payload: { value: true },
      });
    }
  }, [liveMode, dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      let component = await fetchComponent(componentId.toString());

      if (component && typeof component.toObject === 'function') {
        component = component.toObject();
      }
      
      if(!component){
        toast.error('Component not found');
        redirect(`/`);
      }

      dispatch({
        type: 'LOAD_DATA',
        payload: {
          component: component.content ? JSON.parse(component?.content) : '',
          withLive: !!liveMode,
        },
      })

      console.log("current state: ", state.editor.component);
      toast.success('Component load successfully, Enjoy!');
    }
    fetchData()
  }, [componentId])

  const initialBoxElement: EditorElement = {
    id: 'initial_box',
    type: 'box',
    layout: 'vertical',
    description: 'Expand your creativity by using me!',
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

  const handleOnClickBody = (e: React.MouseEvent, element: EditorElement, bubbleId: string) => {
    console.log('state.editor.component', state.editor.component);
    e.stopPropagation();
    dispatch({
      type: 'CHANGE_CLICKED_ELEMENT',
      payload: {
        bubbleId: bubbleId,
        elementDetails: element,
      },
    });
  };

  const handleUnpreview = () => {
    dispatch({ type: 'TOGGLE_PREVIEW_MODE' });
    dispatch({ type: 'TOGGLE_LIVE_MODE' });
  };

  console.log('state.editor.selectedElement', state.editor.selectedElement);
  console.log('state.editor.component in Workspacessssss: ', state.editor.component);


  const styles = (currentIndex: number) => {

    if (currentIndex === 0) {
      return {
        width: '400px',
        maxWidth: state.editor.component.size === 'nano' ? '120px'
                : state.editor.component.size === 'micro' ? '160px'
                : state.editor.component.size === 'deca' ? '220px'
                : state.editor.component.size === 'hecto' ? '241px'
                : state.editor.component.size === 'kilo' ? '260px'
                : state.editor.component.size === 'mega' ? '300px'
                : state.editor.component.size === 'giga' ? '386px' : '300px',
        marginLeft: '8px',
        marginRight: '8px',
        direction: state.editor.component.contents?.[currentIndex]?.direction,
      };
    } else {
      return {
        width: '400px',
        maxWidth: state.editor.component.contents?.[currentIndex]?.size === 'nano' ? '120px'
                : state.editor.component.contents?.[currentIndex]?.size === 'micro' ? '160px'
                : state.editor.component.contents?.[currentIndex]?.size === 'deca' ? '220px'
                : state.editor.component.contents?.[currentIndex]?.size === 'hecto' ? '241px'
                : state.editor.component.contents?.[currentIndex]?.size === 'kilo' ? '260px'
                : state.editor.component.contents?.[currentIndex]?.size === 'mega' ? '300px'
                : state.editor.component.contents?.[currentIndex]?.size === 'giga' ? '386px' : '300px',
        marginLeft: '8px',
        marginRight: '8px',
        direction: state.editor.component.contents?.[currentIndex]?.direction,
      };
    }
  };

  const renderSection = (section: EditorSection, component: EditorComponent) => {
    return section.contents.map(element => (
      <Recursive key={element.id} element={element} sectionId={section.id} bubble={component} />
    ));
  };

  const renderComponent = (component: EditorComponent, index?: number) => {
    if (component.type === 'carousel') {
      return (

        <div className="flex space-x-1 overflow-x-scroll snap-x">
          {component.contents?.map((subComponent, idx) => (
            <div key={idx} className="flex-none snap-start" style={{ minWidth: '120px' }}>
              {renderComponent(subComponent, idx)}
            </div>
          ))}
        </div>
      );
    } else {

      const dynamicStyles = component.type === 'bubble' ? styles(index ?? 0) : styles;

      return (
        <div
          style={dynamicStyles}
          onClick={(e) => handleOnClickBody(e, component as EditorElement, component.id || "")}>
          {component.hero && (
            <div>
              <AddBoxDropdown heroSectionId={component.hero.id} bubbleId={component.id || ""} />
            </div>
          )}
          {(component.header?.contents &&
            component.header?.contents.length > 0) && (
              <div className="component-container relative mt-2 p-4 border-x border-t rounded-t-lg bg-white overflow-hidden">
                {component.header && renderSection(component.header, component)}
              </div>
            )}
          {(component.hero?.contents &&
            component.hero?.contents.length > 0) && (
              <div
                className={clsx('component-container relative bg-white overflow-hidden', {
                  'p-4': (component.hero?.contents && component.hero?.contents[0]?.contents && component.hero?.contents[0].contents.length < 1),
                  'px-4 py-4': (component.hero?.contents && component.hero?.contents[0]?.contents && component.hero?.contents[0].contents[0]?.type === 'box'),
                  'p-0': (component.hero?.contents && component.hero?.contents[0].contents && component.hero?.contents[0].contents.length > 0 && component.hero?.contents[0].type !== 'box'),
                  'mt-2': (component.header?.contents && component.header?.contents.length < 1),
                  'border-x border-t': (component.header?.contents && component.header?.contents.length < 1 && !component.hero?.contents),
                  'rounded-t-lg': (component.header?.contents && component.header?.contents.length < 1),
                })}
              >
                {component.hero && renderSection(component.hero, component)}
              </div>
            )}
          <div
            className={clsx('component-container relative mb-2 p-4 border-b border-x rounded-b-lg shadow-lg bg-white overflow-hidden', {
              'mt-2': (component.hero?.contents && component.hero?.contents.length < 1 && component.header?.contents && component.header?.contents.length < 1),
              'border-t': (component.hero?.contents && component.hero?.contents.length < 1 && component.header?.contents && component.header?.contents.length < 1),
              'rounded-t-lg': (component.hero?.contents && component.hero?.contents.length < 1 && component.header?.contents && component.header?.contents.length < 1),
            })}
          >
            {component.body && renderSection(component.body, component)}
            {component.footer && renderSection(component.footer, component)}
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
          '!p-0 !mr-0 justify-center items-center': state.editor.previewMode || state.editor.liveMode,
          '!w-full': state.editor.device === 'Desktop',
        }
      )}
      onClick={handleClick}
      onDrop={handleOnDrop}
      onDragOver={handleDragOver}
    >
      {state.editor.previewMode && state.editor.liveMode && (
        <Button variant="ghost" size="icon" className="w-32 h-8 bg-slate-600 p-[2px] fixed top-5 right-5 z-[100]" onClick={handleUnpreview}>
          <EyeOff className='mr-2' size={24} />
          Unpreview
        </Button>
      )}
      <div className="components-flex-container w-[78%] max-w-fit">
        {state.editor.component ? renderComponent(state.editor.component) : <p>No components to display</p>}
      </div>
    </div>
  );
};

export default CardEditor;
