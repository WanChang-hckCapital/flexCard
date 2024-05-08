import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { EditorElementsBtns } from '@/lib/constants'
import React from 'react'
import TextPlaceholder from './text-placeholder'
import ContainerPlaceholder from './container-placeholder'
import VideoPlaceholder from './video-placeholder'
import LinkPlaceholder from './link-placeholder'
import BubblePlaceholder from './bubble-placeholder'
import ButtonPlaceholder from './button-placeholder'
import SeparatorPlaceholder from './separator-placeholder'

type Props = {}

const ComponentsTab = (props: Props) => {
  const elements: {
    Component: React.ReactNode
    label: string
    id: EditorElementsBtns
    group: 'layout' | 'elements'
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
    // {
    //   Component: <LinkPlaceholder />,
    //   label: 'Link',
    //   id: 'link',
    //   group: 'elements',
    // },
  ]

  return (
    <Accordion
      type="multiple"
      className="w-full px-4"
      defaultValue={['Layout', 'Elements']}
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
    </Accordion>
  )
}

export default ComponentsTab
