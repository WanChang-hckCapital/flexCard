"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  checkDuplicateCard,
  upsertCardContent,
} from "@/lib/actions/workspace.actions";
import {
  DeviceTypes,
  EditorElement,
  useEditor,
} from "@/lib/editor/editor-provider";
import { createHtmlFromJson, generateCustomID } from "@/lib/utils";
import { Card } from "@/types";
import clsx from "clsx";
import {
  ArrowLeftCircle,
  EyeIcon,
  Laptop,
  Redo2,
  Smartphone,
  Tablet,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { FocusEventHandler, useEffect, useState } from "react";
import { toast } from "sonner";
// import { stringify as safeStringify } from "flatted";

type Props = {
  cardDetails: Card;
  authActiveProfileId: string;
};

function CardEditorNavigation({ cardDetails, authActiveProfileId }: Props) {
  const router = useRouter();
  const { state, dispatch } = useEditor();

  const [showTitleModal, setShowTitleModal] = useState(
    cardDetails.title === "Temp Card"
  );

  const [cardTitle, setCardTitle] = useState(cardDetails.title);

  const [titleEntered, setTitleEntered] = useState(false);

  useEffect(() => {
    cardDetails.title = cardTitle;
  }, [cardTitle, cardDetails]);

  const handleOnBlurTitleChange: FocusEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.target.value === cardDetails.title) return;
    if (event.target.value) {
      const value = event.target.value;
      (cardDetails.title = value),
        toast.success("Card title updated successfully.");
      // router.refresh()
    } else {
      toast.error("Oppse! You need to have a title, Please try again later.");
      event.target.value = cardDetails.title;
    }
  };

  // const handleOnBlurTitleChange: FocusEventHandler<HTMLInputElement> = (
  //   event
  // ) => {
  //   const value = event.target.value.trim();
  //   if (value && value !== cardTitle) {
  //     setCardTitle(value);
  //     setTitleEntered(true);
  //     toast.success("Card title updated successfully.");
  //   } else if (!value) {
  //     toast.error("Please enter a valid title.");
  //     event.target.value = cardTitle;
  //   }
  // };

  const handlePreviewClick = () => {
    dispatch({ type: "TOGGLE_PREVIEW_MODE" });
    dispatch({ type: "TOGGLE_LIVE_MODE" });
  };

  const handleUndo = () => {
    dispatch({ type: "UNDO" });
  };

  const handleRedo = () => {
    dispatch({ type: "REDO" });
  };

  const initialFooterComponent: EditorElement = {
    id: "initial_footer_box",
    type: "box",
    layout: "horizontal",
    description: "Expand your creativity by using me!",
    contents: [
      {
        id: generateCustomID(),
        type: "image",
        description: "Image is the best way to render information!",
        url: "https://cdn-icons-png.flaticon.com/128/16188/16188216.png",
        size: "25px",
        action: {
          type: "uri",
          label: "action",
          uri: "http://linecorp.com/",
        },
      },
      {
        id: generateCustomID(),
        type: "image",
        description: "Image is the best way to render information!",
        url: "https://cdn-icons-png.flaticon.com/128/10747/10747272.png",
        size: "25px",
        action: {
          type: "uri",
          label: "action",
          uri: "http://linecorp.com/",
        },
      },
    ],
    backgroundColor: "#DCDCDC",
  };

  const saveContent = async (redirect = false) => {
    const workspaceFormat = state.editor.component;
    const initialWorkspaceFormat = JSON.parse(JSON.stringify(workspaceFormat));

    const updatedComponent = { ...workspaceFormat };

    if (!updatedComponent.footer) {
      updatedComponent.footer = {
        id: generateCustomID(),
        contents: [],
      };
    }

    const strFlexFormatHtml = JSON.stringify(initialWorkspaceFormat);
    updatedComponent.footer.contents = [initialFooterComponent];

    console.log("new workspaceFormat with footer", workspaceFormat);

    removeIdsAndDescriptions(workspaceFormat);
    removeEmptySections(workspaceFormat);

    const strLineFlexMessage = JSON.stringify(workspaceFormat);
    cardDetails.status = "Public";

    const htmlFormat = createHtmlFromJson(initialWorkspaceFormat);

    if (cardDetails.title === "" || cardDetails.title === "Temp Card") {
      toast.error("Oppse! You need to have a title, Please try again later.");
      return;
    }

    try {
      const isExistingCard = await checkDuplicateCard(
        authActiveProfileId,
        cardDetails.cardID
      );
      if (isExistingCard.success === false) {
        toast.error(isExistingCard.message);
        return;
      } else {
        await upsertCardContent(
          authActiveProfileId,
          {
            ...cardDetails,
            description: state.editor.description || "",
          },
          strFlexFormatHtml,
          strLineFlexMessage,
          htmlFormat
        );

        if (redirect) toast.success("Card saved successfully.");
        // else toast.success("Card updated successfully.");
      }

      if (redirect) {
        router.push(`/profile/${authActiveProfileId}`);
      }
    } catch (error) {
      toast.error("Oppse! Something went wrong, Please try again later.");
    }
  };

  const handleOnSave = () => saveContent(true);
  // const autoSave = () => saveContent(false);

  const removeIdsAndDescriptions = (element: any) => {
    if (element) {
      delete element.id;
      delete element.description;

      if (element.type === "carousel") {
        element.contents.forEach((subElement: any) => {
          removeIdsAndDescriptions(subElement);
        });
      } else {
        if (element.header) {
          delete element.header.id;
          delete element.header.description;
          removePropsRecursive(element.header.contents);
        }
        if (element.hero) {
          delete element.hero.id;
          delete element.hero.description;
          removePropsRecursive(element.hero.contents);
        }
        if (element.body) {
          delete element.body.id;
          delete element.body.description;
          removePropsRecursive(element.body.contents);
        }
        if (element.footer) {
          delete element.footer.id;
          delete element.footer.description;
          removePropsRecursive(element.footer.contents);
        }

        if (element.action) {
          delete element.action.id;
          delete element.action.description;
        }
      }
    }
  };

  const removePropsRecursive = (contents: any) => {
    if (Array.isArray(contents)) {
      contents.forEach((subElement: any) => {
        removeIdsAndDescriptions(subElement);
        if (subElement.contents) {
          removePropsRecursive(subElement.contents);
        }
      });
    }
  };

  const removeEmptySections = (component: any) => {
    if (component) {
      if (component.type === "carousel") {
        component.contents.forEach((subComponent: any) => {
          removeEmptySections(subComponent);
        });
      } else {
        if (component.header && component.header.contents) {
          if (component.header.contents.length === 1) {
            component.header = component.header.contents[0];
          } else if (component.header.contents.length === 0) {
            delete component.header;
          }
        }

        if (component.hero && component.hero.contents) {
          if (component.hero.contents.length === 1) {
            component.hero = component.hero.contents[0];
          } else if (component.hero.contents.length === 0) {
            delete component.hero;
          }
        }

        if (component.body && component.body.contents) {
          if (component.body.contents.length === 1) {
            component.body = component.body.contents[0];
          } else if (component.body.contents.length === 0) {
            delete component.body;
          }
        }

        if (component.footer && component.footer.contents) {
          if (component.footer.contents.length === 1) {
            component.footer = component.footer.contents[0];
          } else if (component.footer.contents.length === 0) {
            delete component.footer;
          }
        }
      }
    }
  };

  return (
    <TooltipProvider>
      {showTitleModal && (
        <TitleModal
          initialTitle={cardDetails.title}
          onClose={(newTitle) => {
            setCardTitle(newTitle);
            setShowTitleModal(false);
            setTitleEntered(true);
          }}
        />
      )}
      <nav
        className={clsx(
          "border-b-[1px] flex items-center justify-between p-6 gap-2 transition-all bg-stone-400 dark:bg-black",
          { "!h-0 !p-0 !overflow-hidden": state.editor.previewMode }
        )}
      >
        <aside className="flex items-center gap-4 max-w-[260px] w-[300px]">
          <Link href={`/`}>
            <ArrowLeftCircle />
          </Link>
          <div className="flex flex-col w-full ">
            <Input
              value={cardTitle}
              className="border-none h-5 m-0 p-[5px] text-lg text-black"
              onBlur={handleOnBlurTitleChange}
              onChange={(e) => setCardTitle(e.target.value)}
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
                type: "CHANGE_DEVICE",
                payload: { device: value as DeviceTypes },
              });
            }}
          >
            <TabsList className="grid w-full grid-cols-3 bg-transparent h-fit">
              <Tooltip>
                <TooltipTrigger>
                  <TabsTrigger
                    value="Desktop"
                    className="dark:data-[state=active]:bg-black data-[state=active]:bg-stone-700 w-10 h-10 p-0"
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
                    className="w-10 h-10 p-0 dark:data-[state=active]:bg-black data-[state=active]:bg-stone-700"
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
                    className="w-10 h-10 p-0 dark:data-[state=active]:bg-black data-[state=active]:bg-stone-700"
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
            variant={"ghost"}
            size={"icon"}
            className="dark:hover:bg-slate-800 hover:bg-stone-700 hover:text-white"
            onClick={handlePreviewClick}
          >
            <EyeIcon />
          </Button>
          <Button
            disabled={!(state.history.currentIndex > 0)}
            onClick={handleUndo}
            variant={"ghost"}
            size={"icon"}
            className="dark:hover:bg-slate-800 hover:bg-stone-700 hover:text-white"
          >
            <Undo2 />
          </Button>
          <Button
            disabled={
              !(state.history.currentIndex < state.history.history.length - 1)
            }
            onClick={handleRedo}
            variant={"ghost"}
            size={"icon"}
            className="dark:hover:bg-slate-800 hover:bg-stone-700 hover:text-white mr-4"
          >
            <Redo2 />
          </Button>
          <div className="flex flex-col item-center mr-4">
            <span className="text-muted-foreground text-sm">
              Last updated: {cardDetails.updatedAt.toLocaleDateString()}
            </span>
          </div>
          <Button variant="purple" onClick={handleOnSave}>
            Save
          </Button>
        </aside>
      </nav>
    </TooltipProvider>
  );
}

export default CardEditorNavigation;

type TitleModalProps = {
  initialTitle: string;
  onClose: (title: string) => void;
};

const TitleModal = ({ initialTitle, onClose }: TitleModalProps) => {
  const [title, setTitle] = useState(initialTitle);

  const handleSubmit = () => {
    if (title.trim()) {
      onClose(title);
    } else {
      toast.error("Please enter a valid title.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-lg font-semibold text-center mb-4">
          Enter Card Title
        </h2>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your card title"
          className="mb-4 text-black"
        />
        <Button variant="purple" onClick={handleSubmit} className="w-full">
          Save Title
        </Button>
      </div>
    </div>
  );
};
