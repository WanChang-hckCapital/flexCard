import { EditorElement } from '@/lib/editor/editor-provider'
import React from 'react'
import TextElement from './text'
import Container from './container'
import VideoElement from './video'
import LinkComponent from './link-component'
import BubbleComponent from './bubble'
import ButtonElement from './button'
import Separator from './separator'

type Props = {
  element: EditorElement
  sectionId: string
}

const Recursive = ({ element, sectionId }: Props) => {
  switch (element.type) {
    case 'text':
      return <TextElement element={element} sectionId={sectionId}/>
    case 'box':
      return <Container element={element} sectionId={sectionId}/>
    case 'separator':
      return <Separator element={element} sectionId={sectionId} />
    case 'button':
      return <ButtonElement element={element} />
    case 'video':
      return <VideoElement element={element} />
    case 'bubble':
      return <BubbleComponent element={element} sectionId={sectionId} />
    default:
      return null
  }
}

export default Recursive
