'use client'
import React, { ChangeEventHandler } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlignCenter,
  AlignHorizontalJustifyCenterIcon,
  AlignHorizontalJustifyEndIcon,
  AlignHorizontalJustifyStart,
  AlignHorizontalSpaceAround,
  AlignHorizontalSpaceBetween,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  BetweenVerticalEnd,
  Italic,
  TextCursor,
  Underline,
} from 'lucide-react'
import { MdOutlineStrikethroughS } from "react-icons/md";
import { Tabs, TabsTrigger, TabsList } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { EditorElement, useEditor } from '@/lib/editor/editor-provider'
import { toast } from 'sonner'

type Props = { selectedBubbleId: string, selectedSectionId: string, selectedElement: EditorElement }

const SettingsTab = (props: Props) => {
  const { state, dispatch } = useEditor()

  const handleOnChanges = (e: any) => {
    // const styleSettings = e.target.id
    // let value = e.target.value
    // const styleObject = {
    //   [styleSettings]: value,
    // }

    const { id, value } = e.target;
    let processedValue = value;

    console.log("bubbleId: ", props.selectedBubbleId);
    console.log("sectionId: ", props.selectedSectionId);
    console.log("elementDetails: ", state.editor.selectedElement);

    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        bubbleId: props.selectedBubbleId,
        sectionId: props.selectedSectionId,
        elementDetails: {
          ...state.editor.selectedElement,
          [id]: processedValue,
        },
      },
    })
    
    toast.success(id.toUpperCase() + ' has been updated successfully.')
  }

  const handleChangeActionValues = (e: any) => {

    const id = e.target.id;
    const value = e.target.value;

    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        bubbleId: props.selectedBubbleId,
        sectionId: props.selectedSectionId,
        elementDetails: {
          ...state.editor.selectedElement,
          action: {
            ...state.editor.selectedElement.action,
            [id]: value,
          }
        },
      },
    })

    toast.success(id.toUpperCase() + ' has been updated successfully.')
  }

  return (
    <Accordion
      type="multiple"
      className="w-full px-4"
      defaultValue={['Properties', 'Flexbox', 'Path', 'Typography', 'Dimensions', 'Action']}
    >

      {(state.editor.selectedElement.type === 'bubble') && (
        <AccordionItem
          value="Properties"
          className="py-0"
        >
          <AccordionTrigger className="!no-underline">Properties</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground">Direction</Label>
              <div className="flex gap-4 flex-col">
                <Select
                  onValueChange={(e) =>
                    handleOnChanges({
                      target: {
                        id: 'direction',
                        value: e,
                      },
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={state.editor.selectedElement.direction || "Select bubble direction"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className='bg-black'>
                      <SelectItem value="ltr">ltr</SelectItem>
                      <SelectItem value="rtl">rtl</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <Label className="text-muted-foreground">Size</Label>
              <div className="flex gap-4 flex-col">
                <Select
                  onValueChange={(e) =>
                    handleOnChanges({
                      target: {
                        id: 'size',
                        value: e,
                      },
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={state.editor.selectedElement.size || "Select bubble size"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className='bg-black'>
                      <SelectItem value="giga">giga</SelectItem>
                      <SelectItem value="mega">mega</SelectItem>
                      <SelectItem value="kilo">kilo</SelectItem>
                      <SelectItem value="hecto">hecto</SelectItem>
                      <SelectItem value="deca">deca</SelectItem>
                      <SelectItem value="micro">micro</SelectItem>
                      <SelectItem value="nano">nano</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {(state.editor.selectedElement.type === 'box' ||
        state.editor.selectedElement.type === 'image') && (
          <AccordionItem
            value="Flexbox"
            className="py-0"
          >
            <AccordionTrigger className="!no-underline">Flex Box</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2">
                {state.editor.selectedElement.type === 'box' && (
                  <div>
                    <Label className="text-muted-foreground">Layout</Label>
                    <div className="flex gap-4 flex-col">
                      <Select
                        onValueChange={(e) =>
                          handleOnChanges({
                            target: {
                              id: 'layout',
                              value: e,
                            },
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={state.editor.selectedElement.layout || "Select a layout"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup className='bg-black'>
                            <SelectItem value="vertical">vertical</SelectItem>
                            <SelectItem value="horizontal">horizontal</SelectItem>
                            <SelectItem value="baseline">baseline</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground">Justify Content</Label>
                        <div className="flex gap-4 flex-col">
                          <Tabs
                            onValueChange={(e) =>
                              handleOnChanges({
                                target: {
                                  id: 'justifyContent',
                                  value: e,
                                },
                              })
                            }
                            value={state.editor.selectedElement.justifyContent}
                          >
                            <TabsList className="flex items-center flex-row justify-between border-[1px] rounded-md bg-transparent h-fit gap-4">
                              <TabsTrigger
                                value="center"
                                className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                              >
                                <AlignHorizontalJustifyCenterIcon size={18} />
                              </TabsTrigger>
                              <TabsTrigger
                                value="flex-start"
                                className="w-10 h-10 p-0 data-[state=active]:bg-muted "
                              >
                                <AlignHorizontalJustifyStart size={18} />
                              </TabsTrigger>
                              <TabsTrigger
                                value="flex-end"
                                className="w-10 h-10 p-0 data-[state=active]:bg-muted "
                              >
                                <AlignHorizontalJustifyEndIcon size={18} />
                              </TabsTrigger>
                              <TabsTrigger
                                value="space-between"
                                className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                              >
                                <AlignHorizontalSpaceBetween size={18} />
                              </TabsTrigger>
                              <TabsTrigger
                                value="space-around"
                                className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                              >
                                <AlignHorizontalSpaceAround size={18} />
                              </TabsTrigger>
                              <TabsTrigger
                                value="space-evenly"
                                className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                              >
                                <BetweenVerticalEnd size={18} />
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>
                          <div className="flex flex-col gap-2">
                            <Label className="text-muted-foreground pt-2">Align Items</Label>
                            <Tabs
                              onValueChange={(e) =>
                                handleOnChanges({
                                  target: {
                                    id: 'alignItems',
                                    value: e,
                                  },
                                })
                              }
                              value={state.editor.selectedElement.alignItems}
                            >
                              <TabsList className="flex items-center flex-row justify-between border-[1px] rounded-md bg-transparent h-fit gap-4">
                                <TabsTrigger
                                  value="flex-start"
                                  className="w-10 h-10 p-0 data-[state=active]:bg-muted "
                                >
                                  <AlignVerticalJustifyStart size={18} />
                                </TabsTrigger>
                                <TabsTrigger
                                  value="center"
                                  className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                                >
                                  <AlignVerticalJustifyCenter size={18} />
                                </TabsTrigger>
                                <TabsTrigger
                                  value="flex-end"
                                  className="w-10 h-10 p-0 data-[state=active]:bg-muted "
                                >
                                  <AlignVerticalJustifyEnd size={18} />
                                </TabsTrigger>
                              </TabsList>
                            </Tabs>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!(state.editor.selectedElement.type === 'box') && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground pt-2">Align</Label>
                    <Tabs
                      onValueChange={(e) =>
                        handleOnChanges({
                          target: {
                            id: 'align',
                            value: e,
                          },
                        })
                      }
                      value={state.editor.selectedElement.alignItems}
                    >
                      <TabsList className="flex items-center flex-row justify-between border-[1px] rounded-md bg-transparent h-fit gap-4">
                        <TabsTrigger
                          value="start"
                          className="w-10 h-10 p-0 data-[state=active]:bg-muted "
                        >
                          <AlignVerticalJustifyStart size={18} />
                        </TabsTrigger>
                        <TabsTrigger
                          value="center"
                          className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                        >
                          <AlignVerticalJustifyCenter size={18} />
                        </TabsTrigger>
                        <TabsTrigger
                          value="end"
                          className="w-10 h-10 p-0 data-[state=active]:bg-muted "
                        >
                          <AlignVerticalJustifyEnd size={18} />
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

      {(state.editor.selectedElement.type === 'video' ||
        state.editor.selectedElement.type === 'image') && (
          <AccordionItem
            value="Path"
            className="py-0"
          >
            <AccordionTrigger className="!no-underline">Path</AccordionTrigger>
            <AccordionContent>
              {(state.editor.selectedElement.type === 'video' &&
                state.editor.selectedElement.url) && (
                  <div className="flex flex-col gap-2">
                    <p className="text-muted-foreground">Video Path</p>
                    <Input
                      className='text-black'
                      id="url"
                      placeholder="https://youtu.be/7uUKgu6PwC0?si=yO1QhhV3QCy9_LGG"
                      onChange={handleOnChanges}
                      value={state.editor.selectedElement.url}
                    />
                  </div>
                )}

              {(state.editor.selectedElement.type === 'image' &&
                state.editor.selectedElement.url) && (
                  <div className="flex flex-col gap-2">
                    <p className="text-muted-foreground">Image Path</p>
                    <Input
                      className='text-black'
                      id="url"
                      placeholder="Image URL"
                      onChange={handleOnChanges}
                      value={state.editor.selectedElement.url}
                    />
                  </div>
                )}
            </AccordionContent>
          </AccordionItem>
        )}

      {(state.editor.selectedElement.type === 'text' ||
        state.editor.selectedElement.type === 'button' ||
        state.editor.selectedElement.type === 'separator') &&
        (
          <AccordionItem
            value="Typography"
            className="py-0  border-y-[1px]"
          >
            <AccordionTrigger className="!no-underline">
              Typography
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 ">
              <div className="flex flex-col gap-4">
                {state.editor.selectedElement.type === 'text' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <p className="text-muted-foreground">Text Align</p>
                      <Tabs
                        onValueChange={(e) =>
                          handleOnChanges({
                            target: {
                              id: 'align',
                              value: e,
                            },
                          })
                        }
                        value={state.editor.selectedElement.align}
                      >
                        <TabsList className="flex items-center flex-row justify-between border-[1px] rounded-md bg-transparent h-fit gap-4">
                          <TabsTrigger
                            value="start"
                            className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                          >
                            <AlignLeft size={18} />
                          </TabsTrigger>
                          <TabsTrigger
                            value="center"
                            className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                          >
                            <AlignCenter size={18} />
                          </TabsTrigger>
                          <TabsTrigger
                            value="end"
                            className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                          >
                            <AlignRight size={18} />
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-2 flex-1">
                        <Label className="text-muted-foreground">Wrap</Label>
                        <Select
                          onValueChange={(e) =>
                            handleOnChanges({
                              target: {
                                id: 'wrap',
                                value: e,
                              },
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup className='bg-black'>
                              <SelectItem value="true">true</SelectItem>
                              <SelectItem value="false">false</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-2 flex-1">
                        <Label className="text-muted-foreground">Line Spacing(px)</Label>
                        <Input
                          className='text-black'
                          placeholder="px"
                          id="lineSpacing"
                          onChange={handleOnChanges}
                          value={state.editor.selectedElement.lineSpacing}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(state.editor.selectedElement.type === 'text' ||
                  state.editor.selectedElement.type === 'button' ||
                  state.editor.selectedElement.type === 'separator') &&
                  (
                    <div className="flex flex-col gap-2">
                      <p className="text-muted-foreground">Color</p>
                      <Input
                        className='text-black'
                        id="color"
                        onChange={handleOnChanges}
                        value={state.editor.selectedElement.color}
                      />
                    </div>
                  )}

                {state.editor.selectedElement.type === 'button' && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground">Style</Label>
                    <Select
                      onValueChange={(e) =>
                        handleOnChanges({
                          target: {
                            id: 'style',
                            value: e,
                          },
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup className='bg-black'>
                          <SelectItem value="link">Link</SelectItem>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="secondary">Secondary</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {state.editor.selectedElement.type === 'text' && (
                  <div className='flex flex-col gap-4'>
                    <div className="flex gap-4">
                      <div className="flex flex-col flex-1 gap-2">
                        <Label className="text-muted-foreground">Weight</Label>
                        <Select
                          onValueChange={(e) =>
                            handleOnChanges({
                              target: {
                                id: 'weight',
                                value: e,
                              },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a weight" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup className='bg-black'>
                              <SelectItem value="regular">Regular</SelectItem>
                              <SelectItem value="bold">Bold</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col flex-1 gap-2">
                        <Label className="text-muted-foreground">Size</Label>
                        <Input
                          className='text-black'
                          placeholder="px"
                          id="size"
                          onChange={handleOnChanges}
                          value={state.editor.selectedElement.size}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col gap-2 flex-1">
                        <Label className="text-muted-foreground">Style</Label>
                        <Tabs
                          onValueChange={(e) =>
                            handleOnChanges({
                              target: {
                                id: 'style',
                                value: e,
                              },
                            })
                          }
                          value={state.editor.selectedElement.style}
                        >
                          <TabsList className="flex items-center flex-row justify-evenly border-[1px] rounded-md bg-transparent h-fit gap-4">
                            <TabsTrigger
                              value="normal"
                              className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                            >
                              <TextCursor size={18} />
                            </TabsTrigger>
                            <TabsTrigger
                              value="italic"
                              className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                            >
                              <Italic size={18} />
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      <div className="flex flex-col gap-2 flex-1">
                        <Label className="text-muted-foreground">Text Decoration</Label>
                        <Tabs
                          onValueChange={(e) =>
                            handleOnChanges({
                              target: {
                                id: 'decoration',
                                value: e,
                              },
                            })
                          }
                          value={state.editor.selectedElement.decoration}
                        >
                          <TabsList className="flex items-center flex-row justify-evenly border-[1px] rounded-md bg-transparent h-fit gap-4">
                            <TabsTrigger
                              value="underline"
                              className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                            >
                              <Underline size={18} />
                            </TabsTrigger>
                            <TabsTrigger
                              value="line-through "
                              className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                            >
                              <MdOutlineStrikethroughS size={18} />
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </AccordionContent>
          </AccordionItem>
        )}

      {!(state.editor.selectedElement.type === 'bubble') && (
        <AccordionItem
          value="Dimensions"
          className="py-0 "
        >
          <AccordionTrigger className="!no-underline">
            Dimensions
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4">
              <div className='flex gap-4'>
                <div className='flex flex-col gap-2'>
                  <p>Margin(px)</p>
                  <Input
                    className='text-black'
                    id="margin"
                    placeholder="px"
                    onChange={handleOnChanges}
                    value={state.editor.selectedElement.margin}
                  />
                </div>

                {state.editor.selectedElement.type === 'image' && (
                  <div className='flex flex-col gap-2'>
                    <p>Size(px)</p>
                    <Input
                      className='text-black'
                      id="size"
                      placeholder="px"
                      onChange={handleOnChanges}
                      value={state.editor.selectedElement.size}
                    />
                  </div>
                )}

                {state.editor.selectedElement.type === 'box' && (
                  <div className='flex flex-col gap-2'>
                    <p>Spacing(px)</p>
                    <Input
                      className='text-black'
                      id="spacing"
                      placeholder="px"
                      onChange={handleOnChanges}
                      value={state.editor.selectedElement.spacing}
                    />
                  </div>
                )}

                {state.editor.selectedElement.type === 'button' && (
                  <div className='flex flex-col gap-2'>
                    <p>Height</p>
                    <Select
                      onValueChange={(e) =>
                        handleOnChanges({
                          target: {
                            id: 'height',
                            value: e,
                          },
                        })
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a height" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup className='bg-black'>
                          <SelectItem value="sm">sm</SelectItem>
                          <SelectItem value="md">md</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {state.editor.selectedElement.type === 'image' && (
                <div className="flex flex-col gap-2">
                  <p>Aspect Mode</p>
                  <Select
                    onValueChange={(e) =>
                      handleOnChanges({
                        target: {
                          id: 'aspectMode',
                          value: e,
                        },
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={state.editor.selectedElement.aspectMode || "Select a mode"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup className='bg-black'>
                        <SelectItem value="cover">cover</SelectItem>
                        <SelectItem value="fit">fit</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {state.editor.selectedElement.type === 'box' && (
                <div className="flex flex-col gap-4">
                  <p><b>Padding(px)</b></p>
                  <div className="flex gap-4 flex-col">
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground">All</Label>
                        <Input
                          className='text-black'
                          placeholder="px"
                          id="paddingAll"
                          onChange={handleOnChanges}
                          value={state.editor.selectedElement.paddingAll}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground">Top</Label>
                        <Input
                          className='text-black'
                          placeholder="px"
                          id="paddingTop"
                          onChange={handleOnChanges}
                          value={state.editor.selectedElement.paddingTop}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground">Bottom</Label>
                        <Input
                          className='text-black'
                          placeholder="px"
                          id="paddingBottom"
                          onChange={handleOnChanges}
                          value={state.editor.selectedElement.paddingBottom}
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground">Start</Label>
                        <Input
                          className='text-black'
                          placeholder="px"
                          id="paddingStart"
                          onChange={handleOnChanges}
                          value={state.editor.selectedElement.paddingStart}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground">End</Label>
                        <Input
                          className='text-black'
                          placeholder="px"
                          id="paddingEnd"
                          onChange={handleOnChanges}
                          value={state.editor.selectedElement.paddingEnd}
                        />
                      </div>
                    </div>
                  </div>

                  <p><b>Measurement(px)</b></p>
                  <div className="flex gap-4 flex-col">
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground">Width</Label>
                        <Input
                          className='text-black'
                          placeholder="px"
                          id="width"
                          onChange={handleOnChanges}
                          value={state.editor.selectedElement.width}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground">Height</Label>
                        <Input
                          className='text-black'
                          placeholder="px"
                          id="height"
                          onChange={handleOnChanges}
                          value={state.editor.selectedElement.height}
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground">MaxWidth</Label>
                        <Input
                          className='text-black'
                          placeholder="px"
                          id="maxWidth"
                          onChange={handleOnChanges}
                          value={state.editor.selectedElement.maxWidth}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground">MaxHeight</Label>
                        <Input
                          className='text-black'
                          placeholder="px"
                          id="maxHeight"
                          onChange={handleOnChanges}
                          value={state.editor.selectedElement.maxHeight}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {(state.editor.selectedElement.type === 'box' ||
        state.editor.selectedElement.type === 'image') && (
          <AccordionItem
            value="Decorations"
            className="py-0 "
          >
            <AccordionTrigger className="!no-underline">
              Decorations
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4">
              {state.editor.selectedElement.type === 'box' && (
                <div>
                  <Label className="text-muted-foreground">Corner Radius</Label>
                  <div className="flex items-center justify-end">
                    <small>
                      {typeof state.editor.selectedElement?.cornerRadius ===
                        'number'
                        ? state.editor.selectedElement?.cornerRadius
                        : parseFloat(
                          (
                            state.editor.selectedElement?.cornerRadius || '0'
                          ).replace('px', '')
                        ) || 0}
                      px
                    </small>
                  </div>
                  <Slider
                    onValueChange={(e: any) => {
                      handleOnChanges({
                        target: {
                          id: 'cornerRadius',
                          value: `${e[0]}px`,
                        },
                      })
                    }}
                    defaultValue={[
                      typeof state.editor.selectedElement?.cornerRadius ===
                        'number'
                        ? state.editor.selectedElement?.cornerRadius
                        : parseFloat(
                          (
                            state.editor.selectedElement?.cornerRadius || '0'
                          ).replace('%', '')
                        ) || 0,
                    ]}
                    max={100}
                    step={1}
                  />
                </div>
              )}

              {(state.editor.selectedElement.type === 'box' ||
                state.editor.selectedElement.type === 'image') && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground">Background Color</Label>
                    <div className="flex border-[1px] rounded-md overflow-clip">
                      <div
                        className="w-12"
                        style={{
                          backgroundColor:
                            state.editor.selectedElement.backgroundColor,
                        }}
                      />
                      <Input
                        placeholder="#HFI245"
                        className="!border-y-0 rounded-none !border-r-0 mr-2 text-black"
                        id="backgroundColor"
                        onChange={handleOnChanges}
                        value={state.editor.selectedElement.backgroundColor}
                      />
                    </div>
                  </div>
                )}

              {state.editor.selectedElement.type === 'box' && (
                <div className='flex flex-col gap-4'>
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground">Border Width</Label>
                    <div className="flex  border-[1px] rounded-md overflow-clip">
                      <Input
                        className='text-black'
                        placeholder="px"
                        id="borderWidth"
                        onChange={handleOnChanges}
                        value={state.editor.selectedElement.borderWidth}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground">Border Color</Label>
                    <div className="flex  border-[1px] rounded-md overflow-clip">
                      <div
                        className="w-12"
                        style={{
                          borderColor:
                            state.editor.selectedElement.borderColor,
                        }}
                      />
                      <Input
                        placeholder="#HFI245"
                        className="!border-y-0 rounded-none !border-r-0 mr-2 text-black"
                        id="borderColor"
                        onChange={handleOnChanges}
                        value={state.editor.selectedElement.borderColor}
                      />
                    </div>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )}

      {!(state.editor.selectedElement.type === 'video' ||
        state.editor.selectedElement.type === 'separator' ||
        state.editor.selectedElement.type === 'bubble') && (
          <AccordionItem
            value="offset"
            className="py-0 "
          >
            <AccordionTrigger className="!no-underline">
              Offset
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 flex-col">
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-muted-foreground">Top</Label>
                      <Input
                        className='text-black'
                        placeholder="px"
                        id="offsetTop"
                        onChange={handleOnChanges}
                        value={state.editor.selectedElement.offsetTop}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-muted-foreground">Bottom</Label>
                      <Input
                        className='text-black'
                        placeholder="px"
                        id="offsetBottom"
                        onChange={handleOnChanges}
                        value={state.editor.selectedElement.offsetBottom}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-muted-foreground">Start</Label>
                      <Input
                        className='text-black'
                        placeholder="px"
                        id="offsetStart"
                        onChange={handleOnChanges}
                        value={state.editor.selectedElement.offsetStart}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-muted-foreground">End</Label>
                      <Input
                        className='text-black'
                        placeholder="px"
                        id="offsetEnd"
                        onChange={handleOnChanges}
                        value={state.editor.selectedElement.offsetEnd}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

      {state.editor.selectedElement.type === 'button' && (
        <AccordionItem
          value="Action"
          className="py-0 "
        >
          <AccordionTrigger className="!no-underline">
            Action
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 flex-col">
                <div className="flex gap-4">
                  <div className="flex flex-1 flex-col gap-2">
                    <Label className="text-muted-foreground">Type</Label>
                    <Select
                      onValueChange={(e) =>
                        handleChangeActionValues({
                          target: {
                            id: 'type',
                            value: e,
                          },
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={state.editor.selectedElement.action?.type || "Select a type"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup className='bg-black'>
                          <SelectItem value="uri">uri</SelectItem>
                          <SelectItem value="message">message</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <Label className="text-muted-foreground">Label</Label>
                    <Input
                      className='text-black'
                      placeholder="Name"
                      id="label"
                      onChange={handleChangeActionValues}
                      value={state.editor.selectedElement.action?.label}
                    />
                  </div>
                </div>
                <div className="flex gap-4 w-full">
                  {state.editor.selectedElement.action?.type === 'uri' && (
                    <div className="flex flex-col gap-2 w-full">
                      <Label className="text-muted-foreground">Uri</Label>
                      <Input
                        className='text-black'
                        placeholder="https://www.google.com"
                        id="uri"
                        onChange={handleChangeActionValues}
                        value={state.editor.selectedElement.action?.uri}
                      />
                    </div>
                  )}

                  {state.editor.selectedElement.action?.type === 'message' && (
                    <div className="flex flex-col gap-2 w-full">
                      <Label className="text-muted-foreground">Text</Label>
                      <Input
                        className='text-black'
                        placeholder="Toast a new message"
                        id="text"
                        onChange={handleChangeActionValues}
                        value={state.editor.selectedElement.action?.text}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  )
}

export default SettingsTab
