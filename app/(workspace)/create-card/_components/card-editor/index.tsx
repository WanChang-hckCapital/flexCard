'use client'
import { Button } from '@/components/ui/button'
// import { getFunnelPageDetails } from '@/lib/queries'
import clsx from 'clsx'
import { EyeOff } from 'lucide-react'
import React, { useEffect } from 'react'
import { EditorComponent, EditorSection, useEditor } from '@/lib/editor/editor-provider'
import Recursive from './card-editor-components/recursive'
import AddBoxDropdown from '@/components/workspace/dropdownbox'

type Props = {
  // funnelPageId: string; CardEditor
  liveMode?: boolean 
}

const CardEditor = ({ 
  // funnelPageId, 
  liveMode 
}: Props) => {
  const { dispatch, state } = useEditor()

  useEffect(() => {
    if (liveMode) {
      dispatch({
        type: 'TOGGLE_LIVE_MODE',
        payload: { value: true },
      })
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

  const handleClick = () => {
    dispatch({
      type: 'CHANGE_CLICKED_ELEMENT',
      payload: {},
    })
  }

  const handleUnpreview = () => {
    dispatch({ type: 'TOGGLE_PREVIEW_MODE' })
    dispatch({ type: 'TOGGLE_LIVE_MODE' })
  }

  const renderSection = (section: EditorSection) => {
    return section.contents.map(element => (
      <Recursive key={element.id} element={element} sectionId={section.id}/>
    ));
  };

  // const renderComponent = (component: EditorComponent) => {
  //   console.log('Rendering component...: ' + JSON.stringify(component));
  //   const sections = [];
  //   if (component.header) sections.push(renderSection(component.header));
  //   if (component.hero) sections.push(renderSection(component.hero));
  //   sections.push(renderSection(component.body));
  //   if (component.footer) sections.push(renderSection(component.footer));

  //   return sections;
  // };

  const renderComponent = (component: EditorComponent) => {
    console.log('Rendering component...: ' + JSON.stringify(component));
    return (
      <div className="component-container relative">
        {component.hero && <AddBoxDropdown heroSectionId={component.hero.id} />}
        {component.header && renderSection(component.header)}
        {component.hero && renderSection(component.hero)}
        {renderSection(component.body)}
        {component.footer && renderSection(component.footer)}
      </div>
    );
  };

  return (
    <div
      className={clsx(
        'use-automation-zoom-in h-full overflow-scroll mr-[385px] bg-background transition-all rounded-md p-5',
        {
          '!p-0 !mr-0':
            state.editor.previewMode === true || state.editor.liveMode === true,
          '!w-[850px]': state.editor.device === 'Tablet',
          '!w-[420px]': state.editor.device === 'Mobile',
          'w-full': state.editor.device === 'Desktop',
        }
      )}
      onClick={handleClick}
    >
      {state.editor.previewMode && state.editor.liveMode && (
        <Button
          variant={'ghost'}
          size={'icon'}
          className="w-6 h-6 bg-slate-600 p-[2px] fixed top-0 left-0 z-[100]"
          onClick={handleUnpreview}
        >
          <EyeOff />
        </Button>
      )}
      {state.editor.component ? renderComponent(state.editor.component) : <p>No components to display</p>}
    </div>
  )
}

export default CardEditor
