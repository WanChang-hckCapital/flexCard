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
  textAlign: 'start',
  opacity: '100%',
  color: 'black',
}

export type EditorElementsBtns =
  | 'box'
  | 'icon'
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

  export const businessLocations = [
    "USA", "Canada", "UK", "Australia"
];

export const businessTypes = [
    "Retail", "Wholesale", "Services"
];

export const industries = [
    "Technology", "Healthcare", "Finance"
];

export const banks = [
    "Bank of America", "Chase", "Wells Fargo"
];