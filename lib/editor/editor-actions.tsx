import { DeviceTypes, EditorComponent, EditorElement } from './editor-provider'

export type EditorAction =
  | {
      type: 'ADD_ELEMENT'
      payload: {
        bubbleId: string
        sectionId: string
        targetId?: string
        elementDetails: EditorElement
      }
    }
  | {
      type: 'UPDATE_ELEMENT'
      payload: {
        bubbleId: string
        sectionId: string
        elementDetails: EditorElement
      }
    }
  | {
      type: 'DELETE_ELEMENT'
      payload: {
        bubbleId: string
        sectionId: string
        elementId: string
      }
    }
  | {
      type: 'CHANGE_CLICKED_ELEMENT'
      payload: {
        bubbleId: string
        sectionId?: string
        elementDetails?:
          | EditorElement
          | {
              id: ''
              contents: []
              type: null
              layout: ''
            }
      }
    }
  | {
      type: 'CHANGE_DEVICE'
      payload: {
        device: DeviceTypes
      }
    }
  | {
      type: 'TOGGLE_PREVIEW_MODE'
    }
  | {
      type: 'TOGGLE_LIVE_MODE'
      payload?: {
        value: boolean
      }
    }
  | { type: 'REDO' }
  | { type: 'UNDO' }
  | {
      type: 'LOAD_DATA'
      payload: {
        component: EditorComponent
        withLive: boolean
      }
    }
  | {
      type: 'ADD_COMPONENT'
      payload: {
        componentDetails: EditorComponent;
      };
    }
  | {
    type: 'IMPORT_COMPONENT'
    payload: {
      componentDetails: EditorComponent;
    };
  }
  | {
    type: 'UPDATE_DESCRIPTION'
    payload: {
      description: string;
    };
  }
