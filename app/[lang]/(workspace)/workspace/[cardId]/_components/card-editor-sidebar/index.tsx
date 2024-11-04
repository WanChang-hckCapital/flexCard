'use client'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import SettingsTab from './tabs/settings-tab'
import ComponentsTab from './tabs/components-tab'
import { EditorElement, useEditor } from '@/lib/editor/editor-provider'

function CardEditorSidebar() {
  const { state, dispatch } = useEditor();
  // const [selectedElement, setSelectedElement] = useState<EditorElement | null>(state.editor.selectedElement);
  // const [selectedElementBubbleId, setSelectedElementBubbleId] = useState<string>(state.editor.selectedElementBubbleId);
  // const [selectedElementSectionId, setSelectedElementSectionId] = useState<string>(state.editor.selectedElementSectionId || '');

  // useEffect(() => {
  //   setSelectedElement(state.editor.selectedElement);
  //   setSelectedElementBubbleId(state.editor.selectedElementBubbleId);
  //   setSelectedElementSectionId(state.editor.selectedElementSectionId || '');
  // }, [state.editor.selectedElement, state.editor.selectedElementBubbleId, state.editor.selectedElementSectionId]);

  return (
    <Sheet open={true} modal={false}>
      <Tabs className="w-full" defaultValue="Components">
        <SheetContent
          showX={false}
          side="left"
          style={{ backgroundColor: 'black' }}
          className={clsx(
            'mt-[97px] z-[40] shadow-none p-0 bg-background h-full transition-all overflow-hidden ',
            { hidden: state.editor.previewMode }
          )}
        >
          <div className="grid gap-4 h-full pb-36 overflow-scroll">
            <TabsContent value="Components">
              {state.editor.selectedElement && state.editor.selectedElement.type !== null ? (
                console.log('selectedElement', state.editor.selectedElement),
                console.log('selectedElementBubbleId', state.editor.selectedElementBubbleId),
                console.log('selectedElementSectionId', state.editor.selectedElementSectionId),
                <React.Fragment>
                  <SheetHeader className="text-left p-4">
                    <SheetTitle><b>{state.editor.selectedElement.type.toUpperCase()}</b></SheetTitle>
                    <SheetDescription>
                      {state.editor.selectedElement.description || 'Explore your imagination by just few step!'}
                    </SheetDescription>
                  </SheetHeader>
                  <SettingsTab 
                    selectedBubbleId={state.editor.selectedElementBubbleId} 
                    selectedSectionId={state.editor.selectedElementSectionId} 
                    selectedElement={state.editor.selectedElement} />
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <SheetHeader className="text-left p-4">
                    <SheetTitle><b>COMPONENTS</b></SheetTitle>
                    <SheetDescription>
                      You can drag and drop components on the canvas.
                    </SheetDescription>
                  </SheetHeader>
                  <ComponentsTab />
                </React.Fragment>
              )}
            </TabsContent>
          </div>
        </SheetContent>
      </Tabs>
    </Sheet>
  );
};

export default CardEditorSidebar;