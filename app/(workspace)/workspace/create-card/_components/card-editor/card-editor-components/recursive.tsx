import { EditorComponent, EditorElement } from '@/lib/editor/editor-provider'
import React from 'react'
import TextElement from './text'
import Container from './container'
import VideoElement from './video'
import ButtonElement from './button'
import Separator from './separator'
import ImageElement from './image'
import IconElement from './icon'

type Props = {
  element: EditorElement
  sectionId: string
  bubble: EditorComponent
}

const Recursive = ({ element, sectionId, bubble }: Props) => {
  switch (element.type) {
    case 'text':
      return <TextElement element={element} sectionId={sectionId} bubbleId={bubble.id} />
    case 'box':
      return <Container element={element} sectionId={sectionId} bubble={bubble} />
    case 'separator':
      return <Separator element={element} sectionId={sectionId} bubbleId={bubble.id} />
    case 'button':
      return <ButtonElement element={element} sectionId={sectionId} bubbleId={bubble.id} />
    case 'video':
      return <VideoElement element={element} sectionId={sectionId} bubbleId={bubble.id} />
    case 'image':
      return <ImageElement element={element} sectionId={sectionId} bubbleId={bubble.id} />
    case 'icon':
      return <IconElement element={element} sectionId={sectionId} bubbleId={bubble.id} />
    default:
      return null
  }
}

export default Recursive
