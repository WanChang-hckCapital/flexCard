"use client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import ComponentsTab from "./tabs/components-tab";
import { EditorElement, useEditor } from "@/lib/editor/editor-provider";

function CardEditorRightSidebar() {
  const { state, dispatch } = useEditor();

  return (
    <Sheet open={true} modal={false}>
      <Tabs className="w-full" defaultValue="Components">
        <SheetContent
          showX={false}
          side="right"
          className={clsx(
            "mt-[97px] z-[40] shadow-none p-0 dark:bg-black bg-stone-400 h-full transition-all overflow-hidden ",
            { hidden: state.editor.previewMode }
          )}
        >
          <div className="grid gap-4 h-full pb-36 overflow-scroll">
            <TabsContent value="Components">
              <React.Fragment>
                <SheetHeader className="text-left p-4">
                  <SheetTitle className="dark:text-white text-grey-600">
                    <b>TEMPLATES</b>
                  </SheetTitle>
                  <SheetDescription className="dark:text-white text-grey-600">
                    You may use templates created from other author.
                  </SheetDescription>
                </SheetHeader>
                <ComponentsTab />
              </React.Fragment>
            </TabsContent>
          </div>
        </SheetContent>
      </Tabs>
    </Sheet>
  );
}

export default CardEditorRightSidebar;
