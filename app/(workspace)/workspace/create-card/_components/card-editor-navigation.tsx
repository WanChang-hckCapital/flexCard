'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { updateCardTitle, upsertCardContent } from '@/lib/actions/workspace.actions'
import { DeviceTypes, useEditor } from '@/lib/editor/editor-provider'
import { Card } from '@/types'
import clsx from 'clsx'
import {
  ArrowLeftCircle,
  EyeIcon,
  Laptop,
  Redo2,
  Smartphone,
  Tablet,
  Undo2,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { FocusEventHandler, useEffect } from 'react'
import { toast } from 'sonner'

type Props = {
  cardDetails: Card
  authaccountId: string
}

const CardEditorNavigation = ({
  cardDetails,
  authaccountId,
}: Props) => {
  const router = useRouter()
  const { state, dispatch } = useEditor()

  // useEffect(() => {
  //   dispatch({
  //     type: 'SET_FUNNELPAGE_ID',
  //     payload: { funnelPageId: cardDetails.id },
  //   })
  // }, [cardDetails])

  const handleOnBlurTitleChange: FocusEventHandler<HTMLInputElement> = async (
    event
  ) => {
    if (event.target.value === cardDetails.title) return
    if (event.target.value) {
      
      // await updateCardTitle(
      //   authaccountId,
      //   cardDetails.cardID,
      //   event.target.value,
      // )

      cardDetails.title = event.target.value,

      toast.success('Card title updated successfully.')
      router.refresh()
    } else {
      toast.error('Oppse! You need to have a title, Please try again later.')
      event.target.value = cardDetails.title
    }
  }

  const handlePreviewClick = () => {
    dispatch({ type: 'TOGGLE_PREVIEW_MODE' })
    dispatch({ type: 'TOGGLE_LIVE_MODE' })
  }

  const handleUndo = () => {
    dispatch({ type: 'UNDO' })
  }

  const handleRedo = () => {
    dispatch({ type: 'REDO' })
  }

  const handleOnSave = async () => {
    const workspaceFormat = JSON.parse(JSON.stringify(state.editor.component));
    const strWorkspaceFormat = JSON.stringify(workspaceFormat);

    removeIdsAndDescriptions(workspaceFormat);
    removeEmptySections(workspaceFormat);

    const strLineFlexMessage = JSON.stringify(workspaceFormat);
    console.log('strLineFlexMessage', strLineFlexMessage);
    cardDetails.status = 'Public';

    try {
      const response = await upsertCardContent(
        authaccountId,
        {
          ...cardDetails,
        },
        strWorkspaceFormat,
        strLineFlexMessage,
        cardDetails.cardID
      )

      toast.success('Card saved successfully.')
    } catch (error) {
      toast.error('Oppse! Something went wrong, Please try again later.')
    }
  }

  const removeIdsAndDescriptions = (element: any) => {
    if (element) {
      delete element.id;
      delete element.description;
  
      if (element.type === 'carousel') {
        element.contents.forEach((subElement: any) => {
          removeIdsAndDescriptions(subElement);
        });
      } else {
        if (element.header) {
          delete element.header.id;
          delete element.header.description;
        }
        if (element.hero) {
          delete element.hero.id;
          delete element.hero.description;
        }
        if (element.body) {
          delete element.body.id;
          delete element.body.description;
        }
        if (element.footer) {
          delete element.footer.id;
          delete element.footer.description;
        }
  
        const removePropsRecursive = (contents: any) => {
          if (Array.isArray(contents)) {
            contents.forEach((subElement: any) => {
              removeIdsAndDescriptions(subElement);
              removePropsRecursive(subElement.contents);
            });
          }
        };
  
        removePropsRecursive(element.header?.contents);
        removePropsRecursive(element.hero?.contents);
        removePropsRecursive(element.body?.contents);
        removePropsRecursive(element.footer?.contents);
  
        if (element.action) {
          delete element.action.id;
          delete element.action.description;
        }
      }
    }
  };
  
  const removeEmptySections = (component: any) => {
    if (component) {
      if (component.type === 'carousel') {
        component.contents.forEach((subComponent: any) => {
          removeEmptySections(subComponent);
        });
      } else {
        if (component.header && component.header.contents && component.header.contents.length === 1) {
          component.header = component.header.contents[0];
        } else if (!component.header.contents.length) {
          delete component.header;
        }
  
        if (component.hero && component.hero.contents && component.hero.contents.length === 1) {
          component.hero = component.hero.contents[0];
        } else if (!component.hero.contents.length) {
          delete component.hero;
        }
  
        if (component.body && component.body.contents && component.body.contents.length === 1) {
          component.body = component.body.contents[0];
        } else if (!component.body.contents.length) {
          delete component.body;
        }
  
        if (component.footer && component.footer.contents && component.footer.contents.length === 1) {
          component.footer = component.footer.contents[0];
        } else if (!component.footer.contents.length) {
          delete component.footer;
        }
      }
    }
  };  

  return (
    <TooltipProvider>
      <nav
        className={clsx(
          'border-b-[1px] flex items-center justify-between p-6 gap-2 transition-all',
          { '!h-0 !p-0 !overflow-hidden': state.editor.previewMode }
        )}
      >
        <aside className="flex items-center gap-4 max-w-[260px] w-[300px]">
          <Link href={`/`}>
            <ArrowLeftCircle />
          </Link>
          <div className="flex flex-col w-full ">
            <Input
              defaultValue={cardDetails.title}
              className="border-none h-5 m-0 p-[5px] text-lg text-black"
              onBlur={handleOnBlurTitleChange}
            />
            <span className="text-sm text-muted-foreground">
              Status: {cardDetails.status}
            </span>
          </div>
        </aside>
        <aside>
          <Tabs
            defaultValue="Desktop"
            className="w-fit "
            value={state.editor.device}
            onValueChange={(value) => {
              dispatch({
                type: 'CHANGE_DEVICE',
                payload: { device: value as DeviceTypes },
              })
            }}
          >
            <TabsList className="grid w-full grid-cols-3 bg-transparent h-fit">
              <Tooltip>
                <TooltipTrigger>
                  <TabsTrigger
                    value="Desktop"
                    className="data-[state=active]:bg-muted w-10 h-10 p-0"
                  >
                    <Laptop />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Desktop</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <TabsTrigger
                    value="Tablet"
                    className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                  >
                    <Tablet />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tablet</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <TabsTrigger
                    value="Mobile"
                    className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                  >
                    <Smartphone />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mobile</p>
                </TooltipContent>
              </Tooltip>
            </TabsList>
          </Tabs>
        </aside>
        <aside className="flex items-center gap-2">
          <Button
            variant={'ghost'}
            size={'icon'}
            className="hover:bg-slate-800"
            onClick={handlePreviewClick}
          >
            <EyeIcon />
          </Button>
          <Button
            disabled={!(state.history.currentIndex > 0)}
            onClick={handleUndo}
            variant={'ghost'}
            size={'icon'}
            className="hover:bg-slate-800"
          >
            <Undo2 />
          </Button>
          <Button
            disabled={
              !(state.history.currentIndex < state.history.history.length - 1)
            }
            onClick={handleRedo}
            variant={'ghost'}
            size={'icon'}
            className="hover:bg-slate-800 mr-4"
          >
            <Redo2 />
          </Button>
          <div className="flex flex-col item-center mr-4">
            <span className="text-muted-foreground text-sm">
              Last updated: {cardDetails.updatedAt.toLocaleDateString()}
            </span>
          </div>
          <Button onClick={handleOnSave}>Save</Button>
        </aside>
      </nav>
    </TooltipProvider>
  )
}

export default CardEditorNavigation
