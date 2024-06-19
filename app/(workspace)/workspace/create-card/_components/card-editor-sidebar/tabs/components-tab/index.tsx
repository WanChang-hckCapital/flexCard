import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { EditorElementsBtns } from '@/lib/constants'
import React, { useState } from 'react'
import TextPlaceholder from './text-placeholder'
import ContainerPlaceholder from './container-placeholder'
import VideoPlaceholder from './video-placeholder'
import BubblePlaceholder from './bubble-placeholder'
import ButtonPlaceholder from './button-placeholder'
import SeparatorPlaceholder from './separator-placeholder'
import ImagePlaceholder from './image-placeholder'
import IconPlaceholder from './icon-placeholder'
import JSONImportForm from '@/components/forms/json-import'
import { toast } from 'sonner'
import { useEditor } from '@/lib/editor/editor-provider'

type Props = {}

function ComponentsTab(props: Props) {
  const { state, dispatch } = useEditor();

  const elements: {
    Component: React.ReactNode
    label: string
    id: EditorElementsBtns
    group: 'layout' | 'elements' | 'import'
  }[] = [
      {
        Component: <ContainerPlaceholder />,
        label: 'Box',
        id: 'box',
        group: 'elements',
      },
      {
        Component: <TextPlaceholder />,
        label: 'Text',
        id: 'text',
        group: 'elements',
      },
      {
        Component: <BubblePlaceholder />,
        label: 'Bubble',
        id: 'bubble',
        group: 'layout',
      },
      {
        Component: <VideoPlaceholder />,
        label: 'Video',
        id: 'video',
        group: 'elements',
      },
      {
        Component: <ButtonPlaceholder />,
        label: 'Button',
        id: 'button',
        group: 'elements',
      },
      {
        Component: <SeparatorPlaceholder />,
        label: 'Separator',
        id: 'separator',
        group: 'elements',
      },
      {
        Component: <ImagePlaceholder />,
        label: 'Image',
        id: 'image',
        group: 'elements',
      },
      {
        Component: <IconPlaceholder />,
        label: 'Icon',
        id: 'icon',
        group: 'elements',
      },
      {
        Component: <IconPlaceholder />,
        label: 'Import',
        id: 'icon',
        group: 'import',
      },
  ]

  const handleImport = (importedJson: any) => {
    // dispatch({ type: 'SET_COMPONENT', payload: importedJson });
  };

  return (
    <Accordion
      type="multiple"
      className="w-full px-4"
      defaultValue={['Layout', 'Elements', 'Media']}
    >
      <AccordionItem
        value="Layout"
        className="py-0 border-y-[1px]"
      >
        <AccordionTrigger className="!no-underline">Layout</AccordionTrigger>
        <AccordionContent className="flex flex-wrap gap-2 ">
          {elements
            .filter((element) => element.group === 'layout')
            .map((element) => (
              <div
                key={element.id}
                className="flex-col items-center justify-center flex"
              >
                {element.Component}
                <span className="text-muted-foreground">{element.label}</span>
              </div>
            ))}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem
        value="Elements"
        className="py-0 "
      >
        <AccordionTrigger className="!no-underline">Elements</AccordionTrigger>
        <AccordionContent className="flex flex-wrap gap-2 ">
          {elements
            .filter((element) => element.group === 'elements')
            .map((element) => (
              <div
                key={element.id}
                className="flex-col items-center justify-center flex"
              >
                {element.Component}
                <span className="text-muted-foreground">{element.label}</span>
              </div>
            ))}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="import" className="py-0 ">
        <AccordionTrigger className="!no-underline">Import</AccordionTrigger>
        <AccordionContent className="flex flex-wrap gap-2 ">
          {/* {elements.filter((element) => element.group === 'import').map((element) => (
            <div key={element.id} className="flex-col items-center justify-center flex">
              {element.Component}
              <span className="text-muted-foreground">{element.label}</span>
            </div>
          ))} */}
          {/* <JSONImportForm onImport={handleImport}/> */}
        </AccordionContent>
      </AccordionItem>

    </Accordion>
  )
}

export default ComponentsTab
