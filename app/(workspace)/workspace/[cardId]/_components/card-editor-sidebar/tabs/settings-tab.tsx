'use client'
import React, { useEffect, useRef, useState } from 'react'
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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { EditorElement, useEditor } from '@/lib/editor/editor-provider'
import { toast } from 'sonner'
import { RgbaColor, RgbaColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type Props = { selectedBubbleId: string, selectedSectionId?: string, selectedElement: EditorElement };
type PaddingKeys = 'paddingAll' | 'paddingTop' | 'paddingBottom' | 'paddingStart' | 'paddingEnd' | 'size' | 'spacing' | 'margin' | 'borderWidth' | 'offsetTop' | 'offsetBottom' | 'offsetStart' | 'offsetEnd';
type ColorProperty = 'color' | 'backgroundColor' | 'borderColor';

function SettingsTab(props: Props) {
  const { state, dispatch } = useEditor();
  const [units, setUnits] = useState<{ [key in PaddingKeys]: string }>({
    paddingAll: state.editor.selectedElement.paddingAll || 'px',
    paddingTop: state.editor.selectedElement.paddingTop || 'px',
    paddingBottom: state.editor.selectedElement.paddingBottom || 'px',
    paddingStart: state.editor.selectedElement.paddingStart || 'px',
    paddingEnd: state.editor.selectedElement.paddingEnd || 'px',
    size: state.editor.selectedElement.size || 'px',
    spacing: state.editor.selectedElement.spacing || 'px',
    margin: state.editor.selectedElement.margin || 'px',
    borderWidth: state.editor.selectedElement.borderWidth || 'px',
    offsetTop: state.editor.selectedElement.offsetTop || 'px',
    offsetBottom: state.editor.selectedElement.offsetBottom || 'px',
    offsetStart: state.editor.selectedElement.offsetStart || 'px',
    offsetEnd: state.editor.selectedElement.offsetEnd || 'px',
  });
  const [isAdvancedColorPickerOpen, setAdvancedColorPickerOpen] = useState(false);
  const [isColorPickerOpen, setColorPickerOpen] = useState(false);
  const [activeColorProperty, setActiveColorProperty] = useState('');
  const [decoration, setDecoration] = useState(state.editor.selectedElement.decoration || '');
  const [style, setStyle] = useState(state.editor.selectedElement.style || '');
  const [cornerRadiusUnit, setCornerRadiusUnit] = useState('px');

  const parseRgba = (rgba: string) => {
    const match = rgba.match(/rgba?\((\d+), (\d+), (\d+), (\d+(\.\d+)?)\)/);
    if (match) {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
        a: parseFloat(match[4]),
      };
    }
    return { r: 0, g: 0, b: 0, a: 1 };
  };

  const [color, setColor] = useState<RgbaColor>(
    parseRgba(state.editor.selectedElement.color || 'rgba(0, 0, 0, 1)')
  );
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const rgbaToHex = ({ r, g, b, a }: RgbaColor): string => {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    const alpha = Math.round(a * 255);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha)}`;
  };

  const handleOnChanges = (e: any) => {

    const { id, value } = e.target;
    let processedValue = value;

    let elementDetails: EditorElement = {
      ...state.editor.selectedElement,
    };

    if (processedValue !== "" && processedValue !== null && processedValue !== undefined) {
      elementDetails = {
        ...state.editor.selectedElement,
        [id]: processedValue,
      };
    } else {
      const keyToRemove: keyof EditorElement = id;
      const { [keyToRemove]: _, ...newElementDetails } = elementDetails;

      elementDetails = newElementDetails as EditorElement;
    }

    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        bubbleId: props.selectedBubbleId,
        sectionId: props.selectedSectionId || "",
        elementDetails: elementDetails,
      },
    })

    toast.success(id.toUpperCase() + ' has been updated successfully.')
  }

  const handleValueWithoutPxOnChanges = (e: any) => {

    const { id, value } = e.target;
    const processedValue = value ? `${value.replace(/px/, '')}px` : '';

    let elementDetails: EditorElement = {
      ...state.editor.selectedElement,
    };

    if (processedValue !== "" && processedValue !== null && processedValue !== undefined) {
      elementDetails = {
        ...state.editor.selectedElement,
        [id]: processedValue,
      };
    } else {
      const keyToRemove: keyof EditorElement = id;
      const { [keyToRemove]: _, ...newElementDetails } = elementDetails;

      elementDetails = newElementDetails as EditorElement;
    }

    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        bubbleId: props.selectedBubbleId,
        sectionId: props.selectedSectionId || "",
        elementDetails: elementDetails,
      },
    })

    toast.success(id.toUpperCase() + ' has been updated successfully.')
  }

  const handleUnitOnChanges = (e: any) => {

    const { id, value } = e.target;
    const unit = units[id as PaddingKeys];

    let processedValue;
    if (unit === 'px' || unit === '%') {
      processedValue = value ? `${value.replace(/px|%/, '')}${unit}` : '';
    } else {
      processedValue = value ? `${value.replace(/px|%/, '')}px` : '';
    }

    let elementDetails: EditorElement = {
      ...state.editor.selectedElement,
    };

    if (processedValue !== "" && processedValue !== null && processedValue !== undefined) {
      elementDetails = {
        ...state.editor.selectedElement,
        [id]: processedValue,
      };
    } else {
      const keyToRemove: keyof EditorElement = id;
      const { [keyToRemove]: _, ...newElementDetails } = elementDetails;

      elementDetails = newElementDetails as EditorElement;
    }

    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        bubbleId: props.selectedBubbleId,
        sectionId: props.selectedSectionId || "",
        elementDetails: elementDetails,
      },
    })

    toast.success(id.toUpperCase() + ' has been updated successfully.')
  }

  const handleInputColorOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    const updatedElement: EditorElement = {
      ...state.editor.selectedElement,
      [id]: value || '',
    };

    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        bubbleId: props.selectedBubbleId,
        sectionId: props.selectedSectionId || "",
        elementDetails: updatedElement,
      },
    });

    if (activeColorProperty === id) {
      setColor(parseRgba(value));
    }
  };

  const handleUnitChange = (value: 'px' | '%' | 'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '3xl' | '4xl' | '5xl' | 'full' | 'light' | 'normal' | 'medium' | 'semi-bold' | 'bold', id: string) => {

    setUnits(prevUnits => ({
      ...prevUnits,
      [id]: value
    }));

    if (['none', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', '3xl', '4xl', '5xl', 'full', 'light', 'normal', 'medium', 'semi-bold', 'bold'].includes(value)) {
      const updatedElement: EditorElement = {
        ...state.editor.selectedElement,
        [id]: value,
      };
      dispatch({
        type: 'UPDATE_ELEMENT',
        payload: {
          bubbleId: props.selectedBubbleId,
          sectionId: props.selectedSectionId || "",
          elementDetails: updatedElement,
        },
      });
    } else if (value === 'px' || value === '%') {
      const updatedElement: EditorElement = {
        ...state.editor.selectedElement,
        [id]: "",
      };
      dispatch({
        type: 'UPDATE_ELEMENT',
        payload: {
          bubbleId: props.selectedBubbleId,
          sectionId: props.selectedSectionId || "",
          elementDetails: updatedElement,
        },
      });
    }
  };

  const handleChangeActionValues = (e: any) => {

    const id = e.target.id;
    const value = e.target.value;

    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        bubbleId: props.selectedBubbleId,
        sectionId: props.selectedSectionId || "",
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

  const handleColorChange = (newColor: RgbaColor) => {
    const hexColor = rgbaToHex(newColor);
    const updatedElement: EditorElement = {
      ...state.editor.selectedElement,
      [activeColorProperty]: hexColor,
    };

    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        bubbleId: props.selectedBubbleId,
        sectionId: props.selectedSectionId || "",
        elementDetails: updatedElement,
      },
    });

    setColor(newColor);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
      setColorPickerOpen(false);
    }
  };

  const handleColorPickerOpen = (property: string) => {
    setActiveColorProperty(property);
    setColorPickerOpen(!isColorPickerOpen);
  };

  const hexToRgba = (hex: string | any[]) => {
    let r = 0, g = 0, b = 0, a = 1;

    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }

    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  const exampleColors = [
    { name: 'Crimson', color: hexToRgba('#FFEBD2') },
    { name: 'Firebrick', color: hexToRgba('#FFFACD') },
    { name: 'Coral', color: hexToRgba('#F1FDD5') },
    { name: 'LightSalmon', color: hexToRgba('#D6E4FF') },
    { name: 'Brown', color: hexToRgba('#D5FEF9') },
    { name: 'Red', color: hexToRgba('#F9D6FB') },

    { name: 'Golden Rod', color: hexToRgba('#FFB179') },
    { name: 'Dark Golden Rod', color: hexToRgba('#FFEC69') },
    { name: 'Orange', color: hexToRgba('#C6F481') },
    { name: 'Dark Orange', color: hexToRgba('#84A9FF') },
    { name: 'Gold', color: hexToRgba('#83FAFE') },
    { name: 'Pale Golden Rod', color: hexToRgba('#D581EA') },

    { name: 'Green', color: hexToRgba('#FF6021') },
    { name: 'Lawn Green', color: hexToRgba('#FFD905') },
    { name: 'Dark Olive Green', color: hexToRgba('#85DB30') },
    { name: 'Yellow Green', color: hexToRgba('#3366FF') },
    { name: 'Olive Drab', color: hexToRgba('#32D7FC') },
    { name: 'Forest Green', color: hexToRgba('#8d30ba') },

    { name: 'Sky Blue', color: hexToRgba('#DB4218') },
    { name: 'Deep Sky Blue', color: hexToRgba('#DBB703') },
    { name: 'Aqua', color: hexToRgba('#67BC23') },
    { name: 'Dark Cyan', color: hexToRgba('#254EDB') },
    { name: 'Dark Turquoise', color: hexToRgba('#24AAD8') },
    { name: 'Midnight Blue', color: hexToRgba('#6F239F') },

    { name: 'Golden Rod', color: hexToRgba('#B72910') },
    { name: 'Dark Golden Rod', color: hexToRgba('#B79602') },
    { name: 'Orange', color: hexToRgba('#4D9D18') },
    { name: 'Dark Orange', color: hexToRgba('#102693') },
    { name: 'Gold', color: hexToRgba('#1981B5') },
    { name: 'Pale Golden Rod', color: hexToRgba('#531885') },

    { name: 'Green', color: hexToRgba('#93150A') },
    { name: 'Lawn Green', color: hexToRgba('#937601') },
    { name: 'Dark Olive Green', color: hexToRgba('#357F0F') },
    { name: 'Yellow Green', color: hexToRgba('#102693') },
    { name: 'Olive Drab', color: hexToRgba('#0F5C92') },
    { name: 'Forest Green', color: hexToRgba('#3B0F6B') },

    { name: 'Sky Blue', color: hexToRgba('#7A0706') },
    { name: 'Deep Sky Blue', color: hexToRgba('#7A6000') },
    { name: 'Aqua', color: hexToRgba('#256909') },
    { name: 'Dark Cyan', color: hexToRgba('#091A7A') },
    { name: 'Dark Turquoise', color: hexToRgba('#094278') },
    { name: 'Midnight Blue', color: hexToRgba('#2A0959') },
  ];

  const handleStyleChange = (value: string) => {
    const newValue = value === style ? '' : value;
    setStyle(newValue);

    handleOnChanges({
      target: {
        id: 'style',
        value: newValue,
      },
    });
  };

  const handleToggleChange = (value: string) => {
    const newValue = value === decoration ? '' : value;
    setDecoration(newValue);

    handleOnChanges({
      target: {
        id: 'decoration',
        value: newValue,
      },
    });
  };

  const handleCornerRadiusUnitChange = (value: 'px') => {
    setCornerRadiusUnit(value);
    handleOnChanges({
      target: {
        id: 'cornerRadius',
        value: `${parseFloat(state.editor.selectedElement?.cornerRadius || '0')}${value}`,
      },
    });
  };

  useEffect(() => {
    if (isColorPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isColorPickerOpen]);

  useEffect(() => {
    setDecoration(state.editor.selectedElement.decoration || '');
  }, [state.editor.selectedElement.decoration]);

  useEffect(() => {
    setStyle(state.editor.selectedElement.style || '');
  }, [state.editor.selectedElement.style]);

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
                          onChange={handleValueWithoutPxOnChanges}
                          value={state.editor.selectedElement.lineSpacing?.replace(/px/, "") || ""}
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
                      <Label className="text-muted-foreground">Color</Label>
                      <div className="flex border-[1px] rounded-md overflow-clip">
                        <Popover>
                          <PopoverTrigger asChild>
                            <div
                              className="w-12 cursor-pointer"
                              style={{
                                backgroundColor: state.editor.selectedElement.color,
                              }}
                              onClick={() => handleColorPickerOpen('color')}
                            />
                          </PopoverTrigger>
                          <PopoverContent>
                            <div className="grid grid-cols-6 gap-2 justify-items-center mb-6">
                              {!isAdvancedColorPickerOpen && exampleColors.map((example) => (
                                <button
                                  key={example.name}
                                  style={{ backgroundColor: example.color }}
                                  onClick={() => handleColorChange(parseRgba(example.color))}
                                  className="w-6 h-6 rounded-full"
                                ></button>
                              ))}
                            </div>
                            <div className='-mt-[10px] mb-4'>
                              {isAdvancedColorPickerOpen && (
                                <div className='flex justify-center'>
                                  <RgbaColorPicker className='!w-[250px]' color={color} onChange={handleColorChange} />
                                </div>
                              )}
                            </div>
                            <div>
                              <Button
                                className="w-full"
                                variant={'secondary'}
                                onClick={() => setAdvancedColorPickerOpen(!isAdvancedColorPickerOpen)}
                              >
                                {isAdvancedColorPickerOpen ? 'Back' : 'More'}
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Input
                          className="text-black flex-grow rounded-l-none rounded-r-md"
                          id="color"
                          onChange={handleInputColorOnChange}
                          value={state.editor.selectedElement.color || ""}
                        />
                      </div>
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
                        <div className="flex items-center">
                          <Input
                            className="text-black flex-grow rounded-l-md rounded-r-none"
                            id="size"
                            placeholder={units.size}
                            onChange={handleUnitOnChanges}
                            value={state.editor.selectedElement.size?.replace(/px/, "") || ""}
                            disabled={['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', '3xl', '4xl', '5xl'].includes(units.size)}
                          />
                          <Select onValueChange={(value) => handleUnitChange(value as 'px', "size")}>
                            <SelectTrigger className="w-[40px] rounded-l-none">
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="px">px</SelectItem>
                              </SelectGroup>
                              <SelectSeparator />
                              <SelectGroup>
                                <SelectItem value="xxs">xxs</SelectItem>
                                <SelectItem value="xs">xs</SelectItem>
                                <SelectItem value="sm">sm</SelectItem>
                                <SelectItem value="md">md</SelectItem>
                                <SelectItem value="lg">lg</SelectItem>
                                <SelectItem value="xl">xl</SelectItem>
                                <SelectItem value="xxl">xxl</SelectItem>
                                <SelectItem value="3xl">3xl</SelectItem>
                                <SelectItem value="4xl">4xl</SelectItem>
                                <SelectItem value="5xl">5xl</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col gap-2 flex-1">
                        <Label className="text-muted-foreground">Style</Label>
                        <div className="flex items-center flex-row justify-evenly border-[1px] rounded-md bg-transparent h-fit p-1">
                          <ToggleGroup
                            className='gap-4'
                            type="single"
                            onValueChange={handleStyleChange}
                            value={style}
                          >
                            <ToggleGroupItem value="normal">
                              <TextCursor size={18} />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="italic">
                              <Italic size={18} />
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 flex-1">
                        <Label className="text-muted-foreground">Text Decoration</Label>
                        <div className="flex items-center flex-row justify-evenly border-[1px] rounded-md bg-transparent h-fit p-1">
                          <ToggleGroup
                            className='gap-4'
                            type="single"
                            onValueChange={handleToggleChange}
                            value={decoration}
                          >
                            <ToggleGroupItem value="underline">
                              <Underline size={18} />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="line-through">
                              <MdOutlineStrikethroughS size={20} />
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>
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
                  <div className="flex items-center">
                    <Input
                      className="text-black flex-grow rounded-l-md rounded-r-none"
                      placeholder={units.margin}
                      id="margin"
                      onChange={handleUnitOnChanges}
                      value={state.editor.selectedElement.margin?.replace(/px|%/, "") || ""}
                      disabled={['none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'].includes(units.margin)}
                    />
                    <Select onValueChange={(value) => handleUnitChange(value as 'px' | '%', "margin")}>
                      <SelectTrigger className="w-[40px] rounded-l-none">
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="px">px</SelectItem>
                          <SelectItem value="%">%</SelectItem>
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectGroup>
                          <SelectItem value="none">none</SelectItem>
                          <SelectItem value="xs">xs</SelectItem>
                          <SelectItem value="sm">sm</SelectItem>
                          <SelectItem value="md">md</SelectItem>
                          <SelectItem value="lg">lg</SelectItem>
                          <SelectItem value="xl">xl</SelectItem>
                          <SelectItem value="xxl">xxl</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {state.editor.selectedElement.type === 'image' && (
                  <div className='flex flex-col gap-2'>
                    <p>Size(px)</p>
                    <div className="flex items-center">
                      <Input
                        className="text-black flex-grow rounded-l-md rounded-r-none"
                        id="size"
                        placeholder={units.size}
                        onChange={handleUnitOnChanges}
                        value={state.editor.selectedElement.size?.replace(/px/, "") || ""}
                        disabled={['xs', 'sm', 'md', 'lg', 'xl', 'xxl', '3xl', '4xl', '5xl', 'full'].includes(units.size)}
                      />
                      <Select onValueChange={(value) => handleUnitChange(value as 'px', "size")}>
                        <SelectTrigger className="w-[40px] rounded-l-none">
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="px">px</SelectItem>
                          </SelectGroup>
                          <SelectSeparator />
                          <SelectGroup>
                            <SelectItem value="xs">xs</SelectItem>
                            <SelectItem value="sm">sm</SelectItem>
                            <SelectItem value="md">md</SelectItem>
                            <SelectItem value="lg">lg</SelectItem>
                            <SelectItem value="xl">xl</SelectItem>
                            <SelectItem value="xxl">xxl</SelectItem>
                            <SelectItem value="3xl">3xl</SelectItem>
                            <SelectItem value="4xl">4xl</SelectItem>
                            <SelectItem value="5xl">5xl</SelectItem>
                            <SelectItem value="full">full</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {state.editor.selectedElement.type === 'box' && (
                  <div className='flex flex-col gap-2'>
                    <p>Spacing(px)</p>
                    <div className="flex items-center">
                      <Input
                        className="text-black flex-grow rounded-l-md rounded-r-none"
                        placeholder={units.spacing}
                        id="spacing"
                        onChange={handleUnitOnChanges}
                        value={state.editor.selectedElement.spacing?.replace(/px|%/, "") || ""}
                        disabled={['none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'].includes(units.spacing)}
                      />
                      <Select onValueChange={(value) => handleUnitChange(value as 'px' | '%', "spacing")}>
                        <SelectTrigger className="w-[40px] rounded-l-none">
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="px">px</SelectItem>
                            <SelectItem value="%">%</SelectItem>
                          </SelectGroup>
                          <SelectSeparator />
                          <SelectGroup>
                            <SelectItem value="none">none</SelectItem>
                            <SelectItem value="xs">xs</SelectItem>
                            <SelectItem value="sm">sm</SelectItem>
                            <SelectItem value="md">md</SelectItem>
                            <SelectItem value="lg">lg</SelectItem>
                            <SelectItem value="xl">xl</SelectItem>
                            <SelectItem value="xxl">xxl</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
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
                        <div className="flex items-center">
                          <Input
                            className="text-black flex-grow rounded-l-md rounded-r-none"
                            placeholder={units.paddingAll}
                            id="paddingAll"
                            onChange={handleUnitOnChanges}
                            value={state.editor.selectedElement.paddingAll?.replace(/px|%/, "") || ""}
                            disabled={['none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'].includes(units.paddingAll)}
                          />
                          <Select onValueChange={(value) => handleUnitChange(value as 'px' | '%', "paddingAll")}>
                            <SelectTrigger className="w-[40px] rounded-l-none">
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="px">px</SelectItem>
                                <SelectItem value="%">%</SelectItem>
                              </SelectGroup>
                              <SelectSeparator />
                              <SelectGroup>
                                <SelectItem value="none">none</SelectItem>
                                <SelectItem value="xs">xs</SelectItem>
                                <SelectItem value="sm">sm</SelectItem>
                                <SelectItem value="md">md</SelectItem>
                                <SelectItem value="lg">lg</SelectItem>
                                <SelectItem value="xl">xl</SelectItem>
                                <SelectItem value="xxl">xxl</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground">Top</Label>
                        <div className="flex items-center">
                          <Input
                            className="text-black flex-grow rounded-l-md rounded-r-none"
                            placeholder={units.paddingTop}
                            id="paddingTop"
                            onChange={handleOnChanges}
                            value={state.editor.selectedElement.paddingTop?.replace(/px|%/, '') || ''}
                            disabled={['none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'].includes(units.paddingTop)}
                          />
                          <Select onValueChange={(value) => handleUnitChange(value as 'px' | '%', "paddingTop")}>
                            <SelectTrigger className="w-[40px] rounded-l-none">
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="px">px</SelectItem>
                                <SelectItem value="%">%</SelectItem>
                              </SelectGroup>
                              <SelectSeparator />
                              <SelectGroup>
                                <SelectItem value="none">none</SelectItem>
                                <SelectItem value="xs">xs</SelectItem>
                                <SelectItem value="sm">sm</SelectItem>
                                <SelectItem value="md">md</SelectItem>
                                <SelectItem value="lg">lg</SelectItem>
                                <SelectItem value="xl">xl</SelectItem>
                                <SelectItem value="xxl">xxl</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground">Bottom</Label>
                        <div className="flex items-center">
                          <Input
                            className="text-black flex-grow rounded-l-md rounded-r-none"
                            placeholder={units.paddingBottom}
                            id="paddingBottom"
                            onChange={handleOnChanges}
                            value={state.editor.selectedElement.paddingBottom?.replace(/px|%/, '') || ''}
                            disabled={['none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'].includes(units.paddingBottom)}
                          />
                          <Select onValueChange={(value) => handleUnitChange(value as 'px' | '%', "paddingBottom")}>
                            <SelectTrigger className="w-[40px] rounded-l-none">
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="px">px</SelectItem>
                                <SelectItem value="%">%</SelectItem>
                              </SelectGroup>
                              <SelectSeparator />
                              <SelectGroup>
                                <SelectItem value="none">none</SelectItem>
                                <SelectItem value="xs">xs</SelectItem>
                                <SelectItem value="sm">sm</SelectItem>
                                <SelectItem value="md">md</SelectItem>
                                <SelectItem value="lg">lg</SelectItem>
                                <SelectItem value="xl">xl</SelectItem>
                                <SelectItem value="xxl">xxl</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground">Start</Label>
                        <div className="flex items-center">
                          <Input
                            className="text-black flex-grow rounded-l-md rounded-r-none"
                            placeholder={units.paddingStart}
                            id="paddingStart"
                            onChange={handleOnChanges}
                            value={state.editor.selectedElement.paddingStart?.replace(/px|%/, '') || ''}
                            disabled={['none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'].includes(units.paddingStart)}
                          />
                          <Select onValueChange={(value) => handleUnitChange(value as 'px' | '%', "paddingStart")}>
                            <SelectTrigger className="w-[40px] rounded-l-none">
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="px">px</SelectItem>
                                <SelectItem value="%">%</SelectItem>
                              </SelectGroup>
                              <SelectSeparator />
                              <SelectGroup>
                                <SelectItem value="none">none</SelectItem>
                                <SelectItem value="xs">xs</SelectItem>
                                <SelectItem value="sm">sm</SelectItem>
                                <SelectItem value="md">md</SelectItem>
                                <SelectItem value="lg">lg</SelectItem>
                                <SelectItem value="xl">xl</SelectItem>
                                <SelectItem value="xxl">xxl</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground">End</Label>
                        <div className="flex items-center">
                          <Input
                            className="text-black flex-grow rounded-l-md rounded-r-none"
                            placeholder={units.paddingEnd}
                            id="paddingEnd"
                            onChange={handleOnChanges}
                            value={state.editor.selectedElement.paddingEnd?.replace(/px|%/, '') || ''}
                            disabled={['none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'].includes(units.paddingEnd)}
                          />
                          <Select onValueChange={(value) => handleUnitChange(value as 'px' | '%', "paddingEnd")}>
                            <SelectTrigger className="w-[40px] rounded-l-none">
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="px">px</SelectItem>
                                <SelectItem value="%">%</SelectItem>
                              </SelectGroup>
                              <SelectSeparator />
                              <SelectGroup>
                                <SelectItem value="none">none</SelectItem>
                                <SelectItem value="xs">xs</SelectItem>
                                <SelectItem value="sm">sm</SelectItem>
                                <SelectItem value="md">md</SelectItem>
                                <SelectItem value="lg">lg</SelectItem>
                                <SelectItem value="xl">xl</SelectItem>
                                <SelectItem value="xxl">xxl</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p><b>Measurement(px)</b></p>
                  <div className="flex gap-4 flex-col">
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground">Width</Label>
                        <Input
                          className="text-black flex-grow"
                          placeholder="px"
                          id="width"
                          onChange={handleValueWithoutPxOnChanges}
                          value={state.editor.selectedElement.width?.replace(/px/, "") || ""}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground">Height</Label>
                        <Input
                          className='text-black'
                          placeholder="px"
                          id="height"
                          onChange={handleValueWithoutPxOnChanges}
                          value={state.editor.selectedElement.height?.replace(/px/, "") || ""}
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground">MaxWidth</Label>
                        <Input
                          className="text-black flex-grow"
                          placeholder="px"
                          id="maxWidth"
                          onChange={handleValueWithoutPxOnChanges}
                          value={state.editor.selectedElement.maxWidth?.replace(/px/, "") || ""}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground">MaxHeight</Label>
                        <Input
                          className="text-black flex-grow"
                          placeholder="px"
                          id="maxHeight"
                          onChange={handleValueWithoutPxOnChanges}
                          value={state.editor.selectedElement.maxHeight?.replace(/px/, "") || ""}
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
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-muted-foreground">Corner Radius</Label>
                    <Label>
                      {typeof state.editor.selectedElement?.cornerRadius === 'number'
                        ? state.editor.selectedElement?.cornerRadius
                        : state.editor.selectedElement?.cornerRadius}
                      {typeof state.editor.selectedElement?.cornerRadius === 'number' ? cornerRadiusUnit : ''}
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Slider
                      id="cornerRadius"
                      onValueChange={(e: any) => {
                        handleOnChanges({
                          target: {
                            id: 'cornerRadius',
                            value: `${e[0]}${cornerRadiusUnit}`,
                          },
                        });
                      }}
                      defaultValue={[
                        typeof state.editor.selectedElement?.cornerRadius === 'number'
                          ? state.editor.selectedElement?.cornerRadius
                          : parseFloat(state.editor.selectedElement?.cornerRadius || '0'),
                      ]}
                      max={cornerRadiusUnit === 'px' ? 100 : 100}
                      step={1}
                    />
                    <Select onValueChange={(value) => handleUnitChange(value as 'px', "cornerRadius")}>
                      <SelectTrigger className="w-[40px] rounded-l-none">
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="px">px</SelectItem>
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectGroup>
                          <SelectItem value="none">none</SelectItem>
                          <SelectItem value="xs">xs</SelectItem>
                          <SelectItem value="sm">sm</SelectItem>
                          <SelectItem value="md">md</SelectItem>
                          <SelectItem value="lg">lg</SelectItem>
                          <SelectItem value="xl">xl</SelectItem>
                          <SelectItem value="xxl">xxl</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {(state.editor.selectedElement.type === 'box' ||
                state.editor.selectedElement.type === 'image') && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground">Background Color</Label>
                    <div className="flex border-[1px] rounded-md overflow-clip">
                      <Popover>
                        <PopoverTrigger asChild>
                          <div
                            className="w-12 cursor-pointer"
                            style={{
                              backgroundColor: state.editor.selectedElement.backgroundColor,
                            }}
                            onClick={() => handleColorPickerOpen('backgroundColor')}
                          />
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="grid grid-cols-6 gap-2 justify-items-center mb-6">
                            {!isAdvancedColorPickerOpen && exampleColors.map((example) => (
                              <button
                                key={example.name}
                                style={{ backgroundColor: example.color }}
                                onClick={() => handleColorChange(parseRgba(example.color))}
                                className="w-6 h-6 rounded-full"
                              ></button>
                            ))}
                          </div>
                          <div className='-mt-[10px] mb-4'>
                            {isAdvancedColorPickerOpen && (
                              <div className='flex justify-center'>
                                <RgbaColorPicker className='!w-[250px]' color={color} onChange={handleColorChange} />
                              </div>
                            )}
                          </div>
                          <div>
                            <Button
                              className="w-full"
                              variant={'secondary'}
                              onClick={() => setAdvancedColorPickerOpen(!isAdvancedColorPickerOpen)}
                            >
                              {isAdvancedColorPickerOpen ? 'Back' : 'More'}
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Input
                        className="text-black flex-grow rounded-l-none rounded-r-md"
                        id="backgroundColor"
                        onChange={handleInputColorOnChange}
                        value={state.editor.selectedElement.backgroundColor || ""}
                      />
                    </div>
                  </div>
                )}

              {state.editor.selectedElement.type === 'box' && (
                <div className='flex flex-col gap-4'>
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground">Border Width</Label>
                    <div className="flex items-center">
                      <Input
                        className="text-black flex-grow rounded-l-md rounded-r-none"
                        id="borderWidth"
                        placeholder={units.borderWidth}
                        onChange={handleUnitOnChanges}
                        value={state.editor.selectedElement.borderWidth?.replace(/px/, "") || ""}
                        disabled={['none', 'light', 'normal', 'medium', 'semi-bold', 'bold'].includes(units.borderWidth)}
                      />
                      <Select onValueChange={(value) => handleUnitChange(value as 'px', "borderWidth")}>
                        <SelectTrigger className="w-[40px] rounded-l-none">
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="px">px</SelectItem>
                          </SelectGroup>
                          <SelectSeparator />
                          <SelectGroup>
                            <SelectItem value="none">none</SelectItem>
                            <SelectItem value="light">light</SelectItem>
                            <SelectItem value="normal">normal</SelectItem>
                            <SelectItem value="medium">medium</SelectItem>
                            <SelectItem value="semi-bold">semi-bold</SelectItem>
                            <SelectItem value="bold">bold</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground">Border Color</Label>
                    <div className="flex border-[1px] rounded-md overflow-clip">
                      <Popover>
                        <PopoverTrigger asChild>
                          <div
                            className="w-12 cursor-pointer"
                            style={{
                              backgroundColor: state.editor.selectedElement.borderColor,
                            }}
                            onClick={() => handleColorPickerOpen('borderColor')}
                          />
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="grid grid-cols-6 gap-2 justify-items-center mb-6">
                            {!isAdvancedColorPickerOpen && exampleColors.map((example) => (
                              <button
                                key={example.name}
                                style={{ backgroundColor: example.color }}
                                onClick={() => handleColorChange(parseRgba(example.color))}
                                className="w-6 h-6 rounded-full"
                              ></button>
                            ))}
                          </div>
                          <div className='-mt-[10px] mb-4'>
                            {isAdvancedColorPickerOpen && (
                              <div className='flex justify-center'>
                                <RgbaColorPicker className='!w-[250px]' color={color} onChange={handleColorChange} />
                              </div>
                            )}
                          </div>
                          <div>
                            <Button
                              className="w-full"
                              variant={'secondary'}
                              onClick={() => setAdvancedColorPickerOpen(!isAdvancedColorPickerOpen)}
                            >
                              {isAdvancedColorPickerOpen ? 'Back' : 'More'}
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Input
                        className="text-black flex-grow rounded-l-none rounded-r-md"
                        id="borderColor"
                        onChange={handleInputColorOnChange}
                        value={state.editor.selectedElement.borderColor || ""}
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
                      <div className="flex items-center">
                        <Input
                          className="text-black flex-grow rounded-l-md rounded-r-none"
                          placeholder={units.offsetTop}
                          id="offsetTop"
                          onChange={handleUnitOnChanges}
                          value={state.editor.selectedElement.offsetTop?.replace(/px|%/, "") || ""}
                          disabled={['none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'].includes(units.offsetTop)}
                        />
                        <Select onValueChange={(value) => handleUnitChange(value as 'px' | '%', "offsetTop")}>
                          <SelectTrigger className="w-[40px] rounded-l-none">
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="px">px</SelectItem>
                              <SelectItem value="%">%</SelectItem>
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                              <SelectItem value="none">none</SelectItem>
                              <SelectItem value="xs">xs</SelectItem>
                              <SelectItem value="sm">sm</SelectItem>
                              <SelectItem value="md">md</SelectItem>
                              <SelectItem value="lg">lg</SelectItem>
                              <SelectItem value="xl">xl</SelectItem>
                              <SelectItem value="xxl">xxl</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-muted-foreground">Bottom</Label>
                      <div className="flex items-center">
                        <Input
                          className="text-black flex-grow rounded-l-md rounded-r-none"
                          placeholder={units.offsetBottom}
                          id="offsetBottom"
                          onChange={handleUnitOnChanges}
                          value={state.editor.selectedElement.offsetBottom?.replace(/px|%/, "") || ""}
                          disabled={['none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'].includes(units.offsetBottom)}

                        />
                        <Select onValueChange={(value) => handleUnitChange(value as 'px' | '%', "offsetBottom")}>
                          <SelectTrigger className="w-[40px] rounded-l-none">
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="px">px</SelectItem>
                              <SelectItem value="%">%</SelectItem>
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                              <SelectItem value="none">none</SelectItem>
                              <SelectItem value="xs">xs</SelectItem>
                              <SelectItem value="sm">sm</SelectItem>
                              <SelectItem value="md">md</SelectItem>
                              <SelectItem value="lg">lg</SelectItem>
                              <SelectItem value="xl">xl</SelectItem>
                              <SelectItem value="xxl">xxl</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-muted-foreground">Start</Label>
                      <div className="flex items-center">
                        <Input
                          className="text-black flex-grow rounded-l-md rounded-r-none"
                          placeholder={units.offsetStart}
                          id="offsetStart"
                          onChange={handleUnitOnChanges}
                          value={state.editor.selectedElement.offsetStart?.replace(/px|%/, "") || ""}
                          disabled={['none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'].includes(units.offsetStart)}

                        />
                        <Select onValueChange={(value) => handleUnitChange(value as 'px' | '%', "offsetStart")}>
                          <SelectTrigger className="w-[40px] rounded-l-none">
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="px">px</SelectItem>
                              <SelectItem value="%">%</SelectItem>
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                              <SelectItem value="none">none</SelectItem>
                              <SelectItem value="xs">xs</SelectItem>
                              <SelectItem value="sm">sm</SelectItem>
                              <SelectItem value="md">md</SelectItem>
                              <SelectItem value="lg">lg</SelectItem>
                              <SelectItem value="xl">xl</SelectItem>
                              <SelectItem value="xxl">xxl</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-muted-foreground">End</Label>
                      <div className="flex items-center">
                        <Input
                          className="text-black flex-grow rounded-l-md rounded-r-none"
                          placeholder={units.offsetEnd}
                          id="offsetEnd"
                          onChange={handleUnitOnChanges}
                          value={state.editor.selectedElement.offsetEnd?.replace(/px|%/, "") || ""}
                          disabled={['none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'].includes(units.offsetEnd)}

                        />
                        <Select onValueChange={(value) => handleUnitChange(value as 'px' | '%', "offsetEnd")}>
                          <SelectTrigger className="w-[40px] rounded-l-none">
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="px">px</SelectItem>
                              <SelectItem value="%">%</SelectItem>
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                              <SelectItem value="none">none</SelectItem>
                              <SelectItem value="xs">xs</SelectItem>
                              <SelectItem value="sm">sm</SelectItem>
                              <SelectItem value="md">md</SelectItem>
                              <SelectItem value="lg">lg</SelectItem>
                              <SelectItem value="xl">xl</SelectItem>
                              <SelectItem value="xxl">xxl</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
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
