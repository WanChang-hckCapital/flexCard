import { EditorElementsBtns } from '@/lib/constants'
import { Youtube } from 'lucide-react'
import React from 'react'

type Props = {}

function VideoPlaceholder(props: Props) {
  const handleDragStart = (e: React.DragEvent, type: EditorElementsBtns) => {
    if (type === null) return
    e.dataTransfer.setData('elementType', type)
  }
  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, 'video')}
      className="h-14 w-14 bg-muted rounded-lg flex items-center justify-center"
    >
      <Youtube
        size={40}
        className="dark:text-white text-stone-800"
      />
    </div>
  )
}

export default VideoPlaceholder
