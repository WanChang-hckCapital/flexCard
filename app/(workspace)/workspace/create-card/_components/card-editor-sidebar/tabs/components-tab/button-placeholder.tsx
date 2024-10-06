import { EditorElementsBtns } from '@/lib/constants'
import { CircleDashed } from 'lucide-react'
import React from 'react'

type Props = {}

function ButtonPlaceholder(props: Props) {
  const handleDragState = (e: React.DragEvent, type: EditorElementsBtns) => {
    if (type === null) return
    e.dataTransfer.setData('elementType', type)
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        handleDragState(e, 'button')
      }}
      className=" h-14 w-14 bg-muted rounded-lg flex items-center justify-center"
    >
      <CircleDashed
        size={40}
        className="dark:text-black text-stone-800"
      />
    </div>
  )
}

export default ButtonPlaceholder
