import { EditorElementsBtns } from '@/lib/constants'
import { Sparkle } from 'lucide-react'
import React from 'react'

type Props = {}

function IconPlaceholder(props: Props) {
  const handleDragStart = (e: React.DragEvent, type: EditorElementsBtns) => {
    if (type === null) return
    e.dataTransfer.setData('elementType', type)
  }
  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, 'icon')}
      className="h-14 w-14 bg-muted rounded-lg flex items-center justify-center"
    >
      <Sparkle 
        size={40}
        className="text-muted-foreground"
      />
    </div>
  )
}

export default IconPlaceholder
