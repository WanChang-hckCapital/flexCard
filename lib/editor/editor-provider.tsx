'use client'
import { EditorElementsBtns, EditorComponentsBtns } from '@/lib/constants'
import { EditorAction } from './editor-actions'
import { Dispatch, createContext, useContext, useReducer } from 'react'
import { Card } from '@/types'
import { toast } from 'sonner'

export type DeviceTypes = 'Desktop' | 'Mobile' | 'Tablet'

export type Workspace = {
  components: EditorComponent[];
};

export type EditorElement = {
  id: string
  direction?: string
  type: EditorElementsBtns
  description?: string
  layout?: string
  contents?: EditorElement[]
  position?: string // for box
  flex?: number
  spacing?: string
  margin?: string
  width?: string
  height?: string
  maxWidth?: string
  maxHeight?: string
  backgroundColor?: string
  borderWidth?: string
  borderColor?: string
  cornerRadius?: string
  justifyContent?: string
  alignItems?: string // box
  offsetTop?: string
  offsetBottom?: string
  offsetStart?: string
  offsetEnd?: string
  paddingAll?: string
  paddingTop?: string
  paddingBottom?: string
  paddingStart?: string
  paddingEnd?: string
  text?: string // for text
  align?: string
  gravity?: string
  size?: string
  lineSpacing?: string
  color?: string
  weight?: string
  style?: string //(Normal/Italic)
  decoration?: string //(line-through/Underline)
  wrap?: string
  url?: string
  imageAlt?: string // need to exclude while export to line flex message json
  aspectMode?: string
  action?: ElementAction
}

export type ElementAction = {
  id?: string
  type?: string
  label?: string
  uri?: string
  text?: string
}

export type EditorComponent = {
  id?: string
  type?: EditorComponentsBtns
  direction?: string
  size?: string
  contents?: EditorComponent[]
  header?: EditorSection
  hero?: EditorSection
  body?: EditorSection
  footer?: EditorSection
}

export type EditorSection = {
  id: string
  contents: EditorElement[]
}

export type Editor = {
  liveMode: boolean
  component: EditorComponent
  elements: EditorElement[]
  selectedElementBubbleId: string
  selectedElementSectionId?: string
  selectedElement: EditorElement
  device: DeviceTypes
  previewMode: boolean
}

export type HistoryState = {
  history: Editor[]
  currentIndex: number
}

export type EditorState = {
  editor: Editor
  history: HistoryState
}

const initialBoxElement: EditorElement = {
  id: 'initial_box',
  type: 'box',
  layout: 'vertical',
  description: 'Expand your creativity by using me!',
  contents: []
}

const initialEditorState: EditorState['editor'] = {
  component: {
    id: 'initial',
    type: 'bubble',
    header: {
      id: 'inital_header',
      contents: []
    },
    hero: {
      id: 'inital_hero',
      contents: []
    },
    body: {
      id: 'inital_body',
      contents: [initialBoxElement]
    },
    footer: {
      id: 'inital_footer',
      contents: []
    }
  },
  elements: [
    initialBoxElement
  ],
  selectedElementBubbleId: '',
  selectedElementSectionId: '',
  selectedElement: {
    id: '',
    type: null,
    layout: '',
    contents: []
  },
  device: 'Desktop',
  previewMode: false,
  liveMode: false
}

const initialHistoryState: HistoryState = {
  history: [initialEditorState],
  currentIndex: 0,
}

const initialState: EditorState = {
  editor: initialEditorState,
  history: initialHistoryState,
}

const addElementToNestedElement = (
  component: EditorComponent,
  action: EditorAction
): EditorComponent => {
  if (action.type !== 'ADD_ELEMENT') {
    throw new Error('Invalid action type');
  }

  const { bubbleId, sectionId, targetId, elementDetails } = action.payload;

  const updateComponent = (currentComponent: EditorComponent): EditorComponent => {

    if (currentComponent.id === bubbleId) {
      return {
        ...currentComponent,
        header: currentComponent.header && currentComponent.header.id === sectionId ? updateSection(currentComponent.header, targetId) : currentComponent.header,
        hero: currentComponent.hero && currentComponent.hero.id === sectionId ? updateSection(currentComponent.hero, targetId) : currentComponent.hero,
        body: currentComponent.body && currentComponent.body.id === sectionId ? updateSection(currentComponent.body, targetId) : currentComponent.body,
        footer: currentComponent.footer && currentComponent.footer.id === sectionId ? updateSection(currentComponent.footer, targetId) : currentComponent.footer,
      };
    }

    if (currentComponent.type === 'carousel') {
      const updatedContents = currentComponent.contents?.map(subComponent => {
        if (subComponent.id === bubbleId) {
          return {
            ...subComponent,
            header: subComponent.header && subComponent.header.id === sectionId ? updateSection(subComponent.header, targetId) : subComponent.header,
            hero: subComponent.hero && subComponent.hero.id === sectionId ? updateSection(subComponent.hero, targetId) : subComponent.hero,
            body: subComponent.body && subComponent.body.id === sectionId ? updateSection(subComponent.body, targetId) : subComponent.body,
            footer: subComponent.footer && subComponent.footer.id === sectionId ? updateSection(subComponent.footer, targetId) : subComponent.footer,
          };
        }
        return subComponent;
      });
      return {
        ...currentComponent,
        contents: updatedContents,
      };
    }

    return {
      ...currentComponent,
    };
  };

  const updateSection = (section: EditorSection, targetId?: string): EditorSection => {
    if (section.id === sectionId) {
      if (targetId) {
        return {
          ...section,
          contents: addElementRecursively(section.contents, targetId)
        };
      } else {
        return {
          ...section,
          contents: [...section.contents, elementDetails]
        };
      }
    }
    return section;
  };

  const addElementRecursively = (elements: EditorElement[], targetId?: string): EditorElement[] => {
    return elements.map(element => {
      if (element.id === targetId && element.contents) {
        return {
          ...element,
          contents: [...element.contents, elementDetails]
        };
      } else if (element.contents) {
        return {
          ...element,
          contents: addElementRecursively(element.contents, targetId)
        };
      }
      return element;
    });
  };

  return updateComponent(component);
};

function handleSectionOperation(
  component: EditorComponent,
  sectionId: string,
  operation: (section: EditorSection) => EditorSection
): EditorComponent {
  let newComponent = { ...component };

  if (newComponent.header && newComponent.header.id === sectionId) {
    newComponent.header = operation(newComponent.header);
  }
  if (newComponent.hero && newComponent.hero.id === sectionId) {
    newComponent.hero = operation(newComponent.hero);
  }
  if (newComponent.body && newComponent.body.id === sectionId) {
    newComponent.body = operation(newComponent.body);
  }
  if (newComponent.footer && newComponent.footer.id === sectionId) {
    newComponent.footer = operation(newComponent.footer);
  }

  return newComponent;
}

function updateElementRecursively(contents: EditorElement[], elementDetails: EditorElement): EditorElement[] {
  return contents.map(element => {
    if (element.id === elementDetails.id) {
      return { ...element, ...elementDetails };
    }
    if (element.contents) {
      return {
        ...element,
        contents: updateElementRecursively(element.contents, elementDetails)
      };
    }
    return element;
  });
}

function updateElementInSection(currentComponent: EditorComponent, elementDetails: EditorElement, sectionId: string, bubbleId: string) {
  let updatedComponent = { ...currentComponent };

  if (!sectionId) {
    updatedComponent = updateBubbleComponent(updatedComponent, elementDetails, bubbleId);
  } else if (updatedComponent.id === bubbleId) {

    const updateElement = (section: EditorSection) => {
      const updatedContents = updateElementRecursively(section.contents, elementDetails);

      return {
        ...section,
        contents: updatedContents
      };
    };

    updatedComponent = handleSectionOperation(updatedComponent, sectionId, updateElement);
  }

  if (updatedComponent.type === 'carousel') {
    const updatedContents = (updatedComponent.contents || []).map(subComponent => {
      if (subComponent.type === 'bubble' && !sectionId) {
        if (subComponent.id === bubbleId) {
          return updateBubbleComponent(subComponent, elementDetails, bubbleId);
        }
      } else if (subComponent.id === bubbleId) {
        const updateElement = (section: EditorSection) => {
          const updatedContents = updateElementRecursively(section.contents, elementDetails);

          return {
            ...section,
            contents: updatedContents
          };
        };

        return handleSectionOperation(subComponent, sectionId, updateElement);
      }

      return subComponent;
    });

    updatedComponent = {
      ...updatedComponent,
      contents: updatedContents
    };
  }

  return updatedComponent;
}

function updateBubbleComponent(currentComponent: EditorComponent, elementDetails: EditorElement, bubbleId: string): EditorComponent {
  let updatedComponent = { ...currentComponent };

  if (updatedComponent.id === bubbleId) {
    updatedComponent = {
      ...updatedComponent,
      size: elementDetails.size,
      direction: elementDetails.direction,
    };
  }

  return updatedComponent;
}

function deleteElementRecursively(contents: EditorElement[], elementId: string): EditorElement[] {
  return contents.reduce((updatedContents: EditorElement[], element) => {
    if (element.id === elementId) {
      if (element.id !== 'initial_box') {
        toast('Deleted Successfully!');
      } else {
        toast('You need at least one element in the Body!');
        updatedContents.push(element);
      }
    } else {
      if (element.contents) {
        const updatedNestedContents = deleteElementRecursively(element.contents, elementId);
        updatedContents.push({
          ...element,
          contents: updatedNestedContents
        });
      } else {
        updatedContents.push(element);
      }
    }
    return updatedContents;
  }, []);
}

function deleteElementInSection(component: EditorComponent, elementId: string, sectionId: string, bubbleId: string): EditorComponent {
  const deleteElement = (section: EditorSection): EditorSection => ({
    ...section,
    contents: deleteElementRecursively(section.contents, elementId)
  });

  const deleteElementInCarousel = (carousel: EditorComponent): EditorComponent => {
    const updatedContents = carousel.contents?.map(subComponent => {
      if (subComponent.id === bubbleId) {
        if (
          subComponent.header?.id === sectionId ||
          subComponent.hero?.id === sectionId ||
          subComponent.body?.id === sectionId ||
          subComponent.footer?.id === sectionId
        ) {
          return {
            ...subComponent,
            header: subComponent.header && subComponent.header.id === sectionId ? deleteElement(subComponent.header) : subComponent.header,
            hero: subComponent.hero && subComponent.hero.id === sectionId ? deleteElement(subComponent.hero) : subComponent.hero,
            body: subComponent.body && subComponent.body.id === sectionId ? deleteElement(subComponent.body) : subComponent.body,
            footer: subComponent.footer && subComponent.footer.id === sectionId ? deleteElement(subComponent.footer) : subComponent.footer,
          };
        } else {
          toast('Section ID doesn\'t match any component in carousel.');
        }
      }
      return subComponent;
    });

    return {
      ...carousel,
      contents: updatedContents,
    };
  };

  if (component.type === 'carousel') {
    return deleteElementInCarousel(component);
  }

  return handleSectionOperation(component, sectionId, deleteElement);
}

const editorReducer = (
  state: EditorState = initialState,
  action: EditorAction
): EditorState => {
  switch (action.type) {
    case 'ADD_ELEMENT':
      const updatedComponent = addElementToNestedElement(state.editor.component, action);
      const updatedEditorState = {
        ...state.editor,
        component: updatedComponent
      }
      const updatedHistory = [
        ...state.history.history.slice(0, state.history.currentIndex + 1),
        { ...updatedEditorState }, // Save a copy of the updated state
      ]

      const newEditorState = {
        ...state,
        editor: updatedEditorState,
        history: {
          ...state.history,
          history: updatedHistory,
          currentIndex: updatedHistory.length - 1,
        },
      }

      return newEditorState

    case 'UPDATE_ELEMENT':
      const updatedComponentAfterUpdate = updateElementInSection(
        state.editor.component,
        action.payload.elementDetails,
        action.payload.sectionId,
        action.payload.bubbleId
      );

      const UpdatedElementIsSelected =
        action.payload.elementDetails.id === state.editor.selectedElement.id ? action.payload.elementDetails : state.editor.selectedElement

      const updatedEditorStateWithUpdate = {
        ...state.editor,
        component: updatedComponentAfterUpdate,
        selectedElement: UpdatedElementIsSelected
      }

      const updatedHistoryWithUpdate = [
        ...state.history.history.slice(0, state.history.currentIndex + 1),
        { ...updatedEditorStateWithUpdate },
      ]
      const updatedEditor = {
        ...state,
        editor: updatedEditorStateWithUpdate,
        history: {
          ...state.history,
          history: updatedHistoryWithUpdate,
          currentIndex: updatedHistoryWithUpdate.length - 1,
        },
      }
      return updatedEditor

    case 'DELETE_ELEMENT':
      const updatedComponentAfterDelete = deleteElementInSection(
        state.editor.component,
        action.payload.elementId,
        action.payload.sectionId,
        action.payload.bubbleId
      );

      const updatedEditorStateAfterDelete = {
        ...state.editor,
        component: updatedComponentAfterDelete,
      }
      const updatedHistoryAfterDelete = [
        ...state.history.history.slice(0, state.history.currentIndex + 1),
        { ...updatedEditorStateAfterDelete },
      ]

      const deletedState = {
        ...state,
        editor: updatedEditorStateAfterDelete,
        history: {
          ...state.history,
          history: updatedHistoryAfterDelete,
          currentIndex: updatedHistoryAfterDelete.length - 1,
        },
      }
      return deletedState

    case 'CHANGE_CLICKED_ELEMENT':
      const clickedState = {
        ...state,
        editor: {
          ...state.editor,
          selectedElementBubbleId: action.payload.bubbleId,
          selectedElementSectionId: action.payload.sectionId,
          selectedElement: action.payload.elementDetails || {
            id: '',
            contents: [],
            type: null,
            layout: '',
          },
        },
        history: {
          ...state.history,
          history: [
            ...state.history.history.slice(0, state.history.currentIndex + 1),
            { ...state.editor },
          ],
          currentIndex: state.history.currentIndex + 1,
        },
      }
      return clickedState

    case 'CHANGE_DEVICE':
      const changedDeviceState = {
        ...state,
        editor: {
          ...state.editor,
          device: action.payload.device,
        },
      }
      return changedDeviceState

    case 'TOGGLE_PREVIEW_MODE':
      const toggleState = {
        ...state,
        editor: {
          ...state.editor,
          previewMode: !state.editor.previewMode,
        },
      }
      return toggleState

    case 'TOGGLE_LIVE_MODE':
      const toggleLiveMode: EditorState = {
        ...state,
        editor: {
          ...state.editor,
          liveMode: action.payload
            ? action.payload.value
            : !state.editor.liveMode,
        },
      }
      return toggleLiveMode

    case 'REDO':
      if (state.history.currentIndex < state.history.history.length - 1) {
        const nextIndex = state.history.currentIndex + 1
        const nextEditorState = { ...state.history.history[nextIndex] }
        const redoState = {
          ...state,
          editor: nextEditorState,
          history: {
            ...state.history,
            currentIndex: nextIndex,
          },
        }
        return redoState
      }
      return state

    case 'UNDO':
      if (state.history.currentIndex > 0) {
        const prevIndex = state.history.currentIndex - 1
        const prevEditorState = { ...state.history.history[prevIndex] }
        const undoState = {
          ...state,
          editor: prevEditorState,
          history: {
            ...state.history,
            currentIndex: prevIndex,
          },
        }
        return undoState
      }
      return state

    case 'LOAD_DATA':
      return {
        ...initialState,
        editor: {
          ...initialState.editor,
          component: action.payload.component || initialEditorState.component,
          liveMode: !!action.payload.withLive,
        },
      }

    case 'ADD_COMPONENT': {
      const { componentDetails } = action.payload;

      if (state.editor.component.type === 'carousel' && state.editor.component.contents) {
        const updatedContents = [...state.editor.component.contents, componentDetails];
        const updatedComponent = {
          ...state.editor.component,
          contents: updatedContents
        };

        const updatedEditorState = {
          ...state.editor,
          component: updatedComponent
        };

        const updatedHistory = [
          ...state.history.history.slice(0, state.history.currentIndex + 1),
          { ...updatedEditorState },
        ];

        return {
          ...state,
          editor: updatedEditorState,
          history: {
            ...state.history,
            history: updatedHistory,
            currentIndex: updatedHistory.length - 1,
          },
        };
      } else {
        const newCarousel = {
          id: 'initial_carousel',
          type: 'carousel' as EditorComponentsBtns,
          contents: [state.editor.component, componentDetails]
        };

        const updatedEditorState = {
          ...state.editor,
          component: newCarousel
        };

        const updatedHistory = [
          ...state.history.history.slice(0, state.history.currentIndex + 1),
          { ...updatedEditorState },
        ];

        return {
          ...state,
          editor: updatedEditorState,
          history: {
            ...state.history,
            history: updatedHistory,
            currentIndex: updatedHistory.length - 1,
          },
        };
      }
    }

    default:
      return state
  }
}

export type EditorContextData = {
  device: DeviceTypes
  previewMode: boolean
  setPreviewMode: (previewMode: boolean) => void
  setDevice: (device: DeviceTypes) => void
}

export const EditorContext = createContext<{
  state: EditorState
  dispatch: Dispatch<EditorAction>
  authaccountId: string
  cardId: string
  cardDetails: Card | null
}>({
  state: initialState,
  dispatch: () => undefined,
  authaccountId: '',
  cardId: '',
  cardDetails: null,
})

type EditorProps = {
  children: React.ReactNode
  authaccountId: string
  cardId: string
  cardDetails: Card
}

const EditorProvider = (props: EditorProps) => {
  const [state, dispatch] = useReducer(editorReducer, initialState)

  return (
    <EditorContext.Provider
      value={{
        state,
        dispatch,
        authaccountId: props.authaccountId,
        cardId: props.cardId,
        cardDetails: props.cardDetails,
      }}
    >
      {props.children}
    </EditorContext.Provider>
  )
}

export const useEditor = () => {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditor Hook must be used within the editor Provider')
  }
  return context
}

export default EditorProvider
