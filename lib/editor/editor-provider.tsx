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
  type: EditorElementsBtns
  layout?: string
  contents?: EditorElement[]
  position?: string
  flex?: number
  spacing?: string
  margin?: string
  width?: string
  height?: string
  maxWidth?: string
  maxHeight?: string
  backgroundColor?: string
  borderRadius?: string
  cornerRadius?: string
  justifyContent?: string
  alignItems?: string
  offsetTop?: string
  offsetBottom?: string
  offsetStart?: string
  offsetEnd?: string
  paddingAll?: string
  paddingTop?: string
  paddingBottom?: string
  paddingStart?: string
  paddingEnd?: string
  text?: string
  uri?: string
  label?: string
}

export type EditorComponent = {
  id: string
  type: EditorComponentsBtns
  direction?: string
  size?: string
  contents?: EditorComponent[]
  header?: EditorSection
  hero?: EditorSection
  body: EditorSection
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
  layout: 'vetical',
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
  selectedElement: {
    id: '',
    type: null,
    layout: '',
    contents: []
  },
  device: 'Desktop',
  previewMode: false,
  liveMode: false,
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

  const { sectionId, targetId, elementDetails } = action.payload;

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

  // Update the appropriate section if the ID matches
  return {
    ...component,
    header: component.header && updateSection(component.header, targetId),
    hero: component.hero && updateSection(component.hero, targetId),
    body: updateSection(component.body, targetId),
    footer: component.footer && updateSection(component.footer, targetId)
  };
};

// Usage
// const updatedComponent = addElementToNestedElement(editorComponent, {
//   type: 'ADD_ELEMENT',
//   payload: {
//     sectionId: 'section-id', 
//     targetId: null,  
//     elementDetails: {}
//   }
// });

const addComponentToWorkspace = (
  workspace: Workspace,
  action: EditorAction
): Workspace => {
  if (action.type !== 'ADD_COMPONENT') {
    throw new Error('Invalid action type');
  }

  const { componentDetails } = action.payload;

  return {
    ...workspace,
    components: [...workspace.components, componentDetails]
  };
};

// Usage 
// const updatedWorkspace = addComponentToWorkspace(workspace, {
//   type: 'ADD_COMPONENT',
//   payload: {
//     componentDetails: {
//       id: 'new-bubble-id',
//       type: 'bubble', 
//       contents: [] 
//     }
//   }
// });


// const addAnElement = (
//   component: EditorComponent,
//   elementArray: EditorElement[],
//   action: EditorAction
// ): EditorElement[] => {
//   if (action.type !== 'ADD_ELEMENT')
//     throw Error(
//       'You sent the wrong action type to the Add Element editor State'
//     )
//   return elementArray.map((item) => {
//     if (action.payload.sectionId === component.body.id && Array.isArray(item.contents)) {
//       return {
//         ...item,
//         contents: [...item.contents, action.payload.elementDetails],
//       }
//     } else if (item.contents && Array.isArray(item.contents)) {
//       return {
//         ...item,
//         content: addAnElement(component, item.contents, action),
//       }
//     }
//     return item
//   })
// }

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
      console.log('Updating Element:', element);
      console.log('New Details:', elementDetails);
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

function updateElementInSection(component: EditorComponent, elementDetails: EditorElement, sectionId: string) {
  const updateElement = (section: EditorSection) => {
    console.log('Original Section:', section);
    const updatedContents = updateElementRecursively(section.contents, elementDetails);
    console.log('Updated Contents:', updatedContents);
    return { ...section, contents: updatedContents };
  };

  const updatedComponent = handleSectionOperation(component, sectionId, updateElement);
  console.log('Updated Component after section update:', updatedComponent);
  return updatedComponent;
}

// case 'UPDATE_ELEMENT':
//   return {
//     ...state,
//     editor: {
//       ...state.editor,
//       component: updateElementInSection(
//         state.editor.component, 
//         action.payload.elementDetails, 
//         action.payload.sectionId
//       )
//     }
//   };

// function deleteElementInSection(component: EditorComponent, elementId: string, sectionId: string): EditorComponent {
//   const deleteElement = (section: EditorSection): EditorSection => ({
//     ...section,
//     contents: section.contents.filter(element => element.id !== elementId)
//   });

//   return handleSectionOperation(component, sectionId, deleteElement);
// }

// case 'DELETE_ELEMENT':
//   return {
//     ...state,
//     editor: {
//       ...state.editor,
//       component: deleteElementInSection(
//         state.editor.component, 
//         action.payload.elementId, 
//         action.payload.sectionId
//       )
//     }
//   };

// const updateAnElement = (elements: EditorElement[], elementDetails: EditorElement): EditorElement[] => {
//   return elements.map(element => {
//     if (element.id === elementDetails.id) {
//       return { ...element, ...elementDetails };
//     } else if (element.contents) {
//       return {
//         ...element,
//         contents: updateAnElement(element.contents, elementDetails),
//       };
//     }
//     return element;
//   });
// };

// Usage inside the reducer case 'UPDATE_ELEMENT':
// Assuming `action.payload.elementDetails` contains the updated element data.
// case 'UPDATE_ELEMENT':
//   const updatedElements = updateAnElement(state.editor.component.body.contents, action.payload.elementDetails);
//   return {
//     ...state,
//     editor: {
//       ...state.editor,
//       component: {
//         ...state.editor.component,
//         body: {
//           ...state.editor.component.body,
//           contents: updatedElements
//         }
//       }
//     }
//   };

// const updateAnElement = (
//   component: EditorComponent,
//   editorArray: EditorElement[],
//   action: EditorAction
// ): EditorElement[] => {
//   if (action.type !== 'UPDATE_ELEMENT') {
//     throw Error('You sent the wrong action type to the update Element State')
//   }
//   return editorArray.map((item) => {
//     if (component.id === action.payload.elementDetails.id) {
//       return { ...item, ...action.payload.elementDetails }
//     } else if (item.content && Array.isArray(item.content)) {
//       return {
//         ...item,
//         content: updateAnElement(item.content, action),
//       }
//     }
//     return item
//   })
// }

// const deleteAnElement = (elements: EditorElement[], elementId: string): EditorElement[] => {
//   // Using filter to iterate and conditionally keep elements
//   return elements.filter(element => {
//       // Check if this is the element to remove
//       if (element.id === elementId) {
//           return false;  // Return false to remove this element
//       }

//       // If the current element contains nested elements, recursively handle them
//       if (element.contents && element.contents.length > 0) {
//           element.contents = deleteAnElement(element.contents, elementId);  // Recursively update contents
//       }

//       return true;  // Keep the element if it's not the one to be deleted
//   });
// };

// Usage inside the reducer case 'DELETE_ELEMENT':
// case 'DELETE_ELEMENT':
// if (!action.payload.elementDetails) {
//   return state; // No element details provided, just return the current state
// }

// const elementsAfterDeletion = deleteAnElement(state.editor.component.body.contents, action.payload.elementDetails.id);
// return {
//   ...state,
//   editor: {
//     ...state.editor,
//     component: {
//       ...state.editor.component,
//       body: {
//         ...state.editor.component.body,
//         contents: elementsAfterDeletion
//       }
//     }
//   }
// };




// const deleteAnElement = (
//   editorArray: EditorElement[],
//   action: EditorAction
// ): EditorElement[] => {
//   if (action.type !== 'DELETE_ELEMENT')
//     throw Error(
//       'You sent the wrong action type to the Delete Element editor State'
//     )
//   return editorArray.filter((item) => {
//     if (item.id === action.payload.elementDetails.id) {
//       return false
//     } else if (item.content && Array.isArray(item.content)) {
//       item.content = deleteAnElement(item.content, action)
//     }
//     return true
//   })
// }

function deleteElementRecursively(contents: EditorElement[], elementId: string): EditorElement[] {
  return contents.reduce((updatedContents: EditorElement[], element) => {
    if (element.id === elementId && element.id !== 'initial_box') {
      toast('Deleted Successfull!');
    } else {
      toast('You need at least one element in Body!');
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

function deleteElementInSection(component: EditorComponent, elementId: string, sectionId: string): EditorComponent {
  const deleteElement = (section: EditorSection): EditorSection => ({
    ...section,
    contents: deleteElementRecursively(section.contents, elementId)
  });

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
      console.log('Updating element with details:', action.payload.elementDetails);
      const updatedComponentAfterUpdate = updateElementInSection(
        state.editor.component,
        action.payload.elementDetails,
        action.payload.sectionId
      );

      console.log('updatedComponentAfterUpdate', updatedComponentAfterUpdate);

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
        action.payload.sectionId
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
          elements: action.payload.elements || initialEditorState.elements,
          liveMode: !!action.payload.withLive,
        },
      }

    // case 'SET_FUNNELPAGE_ID':
    //   const { funnelPageId } = action.payload
    //   const updatedEditorStateWithFunnelPageId = {
    //     ...state.editor,
    //     funnelPageId,
    //   }

    //   const updatedHistoryWithFunnelPageId = [
    //     ...state.history.history.slice(0, state.history.currentIndex + 1),
    //     { ...updatedEditorStateWithFunnelPageId }, 
    //   ]

    //   const funnelPageIdState = {
    //     ...state,
    //     editor: updatedEditorStateWithFunnelPageId,
    //     history: {
    //       ...state.history,
    //       history: updatedHistoryWithFunnelPageId,
    //       currentIndex: updatedHistoryWithFunnelPageId.length - 1,
    //     },
    //   }
    //   return funnelPageIdState

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
