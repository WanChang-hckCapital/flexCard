export type EditorBtns =
  | 'text'
  | 'container'
  | 'section'
  | 'contactForm'
  | 'paymentForm'
  | 'link'
  | '2Col'
  | 'video'
  | '__body'
  | 'image'
  | null
  | '3Col'

export const defaultStyles: React.CSSProperties = {
  backgroundPosition: 'center',
  objectFit: 'cover',
  backgroundRepeat: 'no-repeat',
  textAlign: 'left',
  opacity: '100%',
}

export type EditorElementsBtns =
  | 'box'
  | 'image'
  | 'text'
  | 'button'
  | 'separator'
  | 'video'
  | 'bubble'
  | 'carousel'
  | null

export type EditorComponentsBtns =
  | 'bubble'
  | 'carousel'
  | null