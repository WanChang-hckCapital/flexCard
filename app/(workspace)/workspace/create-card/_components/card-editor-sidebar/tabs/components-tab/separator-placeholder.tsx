import { EditorElementsBtns } from '@/lib/constants'
import { Minus } from 'lucide-react'
import React from 'react'

type Props = {}

function SeparatorPlaceholder(props: Props) {
  const handleDragState = (e: React.DragEvent, type: EditorElementsBtns) => {
    if (type === null) return
    e.dataTransfer.setData('elementType', type)
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        handleDragState(e, 'separator')
      }}
      className=" h-14 w-14 bg-muted rounded-lg flex items-center justify-center"
    >
      <Minus
        size={40}
        className="text-muted-foreground"
      />
    </div>
  )
}

export default SeparatorPlaceholder
