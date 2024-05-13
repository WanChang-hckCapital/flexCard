import { EditorElementsBtns } from '@/lib/constants'
import { BoxSelect } from 'lucide-react'
import React from 'react'

type Props = {}

const ContainerPlaceholder = (props: Props) => {
  const handleDragStart = (e: React.DragEvent, type: EditorElementsBtns) => {
    if (type === null) return
    e.dataTransfer.setData('elementType', type)
  }
  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, 'box')}
      className=" h-14 w-14 bg-muted/70 rounded-lg p-2 flex flex-row gap-[4px]"
    >
      <BoxSelect size={40}
        className="text-muted-foreground"
      />
      {/* <div className="border-dashed border-[1px] h-full rounded-sm bg-muted border-muted-foreground/50 w-full" /> */}
    </div>
  )
}

export default ContainerPlaceholder
