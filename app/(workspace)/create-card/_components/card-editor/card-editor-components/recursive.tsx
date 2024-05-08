import { EditorElement } from '@/lib/editor/editor-provider'
import React from 'react'
import TextElement from './text'
import Container from './container'
import VideoElement from './video'
import BubbleComponent from './bubble'
import ButtonElement from './button'
import Separator from './separator'

type Props = {
  element: EditorElement
  sectionId: string
  bubbleId: string
}

const Recursive = ({ element, sectionId, bubbleId }: Props) => {
  switch (element.type) {
    case 'text':
      return <TextElement element={element} sectionId={sectionId} bubbleId={bubbleId}/>
    case 'box':
      return <Container element={element} sectionId={sectionId} bubbleId={bubbleId}/>
    case 'separator':
      return <Separator element={element} sectionId={sectionId} bubbleId={bubbleId}/>
    case 'button':
      return <ButtonElement element={element} sectionId={sectionId} bubbleId={bubbleId}/>
    case 'video':
      return <VideoElement element={element} sectionId={sectionId} bubbleId={bubbleId}/>
    // case 'bubble':
    //   return <BubbleComponent element={element} sectionId={sectionId} />
    default:
      return null
  }
}

export default Recursive
