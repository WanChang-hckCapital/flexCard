import { EditorElementsBtns } from '@/lib/constants'
import { Image } from 'lucide-react'
import React from 'react'

type Props = {}

function ImagePlaceholder(props: Props) {
  const handleDragStart = (e: React.DragEvent, type: EditorElementsBtns) => {
    if (type === null) return
    e.dataTransfer.setData('elementType', type)
  }
  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, 'image')}
      className="h-14 w-14 bg-muted rounded-lg flex items-center justify-center"
    >
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image
        size={40}
        className="dark:text-white text-stone-800"
      />

    </div>
  )
}

export default ImagePlaceholder
