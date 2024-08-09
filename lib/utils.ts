import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from 'uuid';
import jsPDF from "jspdf";
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { EditorComponent, EditorElement } from "./editor/editor-provider";
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAmountForDisplay(
  amount: number,
  currency: string
): string {

  let numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol'
  })

  const formatedAmount = numberFormat.format(amount)

  return formatedAmount === '$NaN' ? '' : formatedAmount
}

export function formatAmountForStripe(
  amount: number,
  currency: string
): number {

  let numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol'
  })

  const parts = numberFormat.formatToParts(amount)
  let zeroDecimalCurrency: boolean = true

  for (let part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false
    }
  }

  return zeroDecimalCurrency ? amount : Math.round(amount * 100)
}

export function isBase64Image(imageData: string) {
  const base64Regex = /^data:image\/(png|jpe?g|gif|webp);base64,/;
  return base64Regex.test(imageData);
}

export function formatDateString(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString(undefined, options);

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${time} - ${formattedDate}`;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
})

export function formatDate(date: Date) {
  return DATE_FORMATTER.format(date)
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  minimumFractionDigits: 0,
})

export function formatCurrency(amount: number) {
  return CURRENCY_FORMATTER.format(amount)
}

// this is for full size image that will be displayed in our application
export function getSize(size: any) {
  switch (size) {
    case 'nano': return '99px';
    case 'micro': return '139px';
    case 'deca': return '191px';
    case 'hecto': return '212px';
    case 'kilo': return '233px';
    case 'mega': return '249px';
    case 'giga': return '345px';
    default: return '300px';
  }
};

// this returns truely line bubble component size
export function getBubbleSize(size: any) {
  switch (size) {
    case 'nano': return '120px';
    case 'micro': return '160px';
    case 'deca': return '220px';
    case 'hecto': return '241px';
    case 'kilo': return '260px';
    case 'mega': return '300px';
    case 'giga': return '345px';
    default: return '300px';
  }
};

const convertToKebabCase = (styleObject: any) => {
  return Object.entries(styleObject).map(([key, value]) => {
    const kebabKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    return `${kebabKey}: ${value}`;
  }).join('; ');
};

const BubbleStyle = {
  backgroundColor: 'white',
  border: '1px solid #ccc',
  borderRadius: '10px',
  padding: '20px',
  margin: '10px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  color: '#333'
};

const ButtonStyles = (element: any) => ({
  backgroundColor: element.style === 'primary' ? (element.color || '#17c950') : element.style === 'secondary' ? (element.color || '#dcdfe5') : 'transparent',
  color: element.style === 'primary' ? 'white' : element.style === 'secondary' ? 'black' : (element.color || '#42659a'),
  height: element.height === 'sm' ? '40px' : element.height === 'md' ? '52px' : '52px',
  padding: '10px 20px',
  borderRadius: '5px',
  width: '100%',
  textAlign: 'center',
  marginTop: convertSizeToPixels(element.margin),
  top: convertSizeToPixels(element.offsetTop),
  left: convertSizeToPixels(element.offsetStart),
  right: convertSizeToPixels(element.offsetEnd),
  bottom: convertSizeToPixels(element.offsetEnd),
});

const IconStyle = (element: any) => ({
  backgroundImage: `url(${element.url || 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png'})`,
  backgroundSize: 'contain',
  fontSize: `${parseInt(element.size || '16')}px`,
  display: 'inline-block',
  width: '1em',
  height: '1em',
});

const ImageContainerStyles = (element: any) => ({
  backgroundColor: element.backgroundColor,
  textAlign: element.align || 'center',
  marginTop: element.margin,
  top: element.offsetTop || 0,
  left: element.offsetStart || 0,
  right: element.offsetEnd || 0,
  bottom: element.offsetBottom || 0,
});

const ImageStyle = (element: any, size: any) => ({
  display: 'inline-block',
  width: element.size === 'xs' ? '60px' : element.size === 'sm' ? '80px' : element.size === 'md' ? '100px' : element.size === 'lg' ? '120px' : element.size === 'xl' ? '140px' : element.size === 'xxl' ? '160px' : element.size === '3xl' ? '180px' : element.size === '4xl' ? '200px' : element.size === '5xl' ? '220px' : element.size === 'full' ? getSize(size) : element.size || '100px',
  height: element.size === 'xs' ? '60px' : element.size === 'sm' ? '80px' : element.size === 'md' ? '100px' : element.size === 'lg' ? '120px' : element.size === 'xl' ? '140px' : element.size === 'xxl' ? '160px' : element.size === '3xl' ? '180px' : element.size === '4xl' ? '200px' : element.size === '5xl' ? '220px' : element.size === 'full' ? getSize(size) : element.size || '100px',
  backgroundImage: `url(${element.url || ''})`,
  backgroundSize: element.aspectMode === 'cover' ? 'cover' : 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  overflow: 'hidden',
  maxWidth: '100%',
});

const SeparatorStyles = (element: any) => ({
  border: '1 solid',
  borderColor: element.color || '#ccc',
  marginTop: element.margin,
});

const TextStyles = (element: any) => ({
  color: element.color || '#333',
  textAlign: element.align || 'left',
  letterSpacing: element.lineSpacing,
  fontWeight: element.weight,
  fontSize: element.size === 'xxs' ? '11px' : element.size === 'xs' ? '13px' : element.size === 'sm' ? '14px' : element.size === 'md' ? '16px' : element.size === 'lg' ? '19px' : element.size === 'xl' ? '22px' : element.size === 'xxl' ? '29px' : element.size,
  fontStyle: element.style,
  textDecoration: element.decoration,
  marginTop: convertSizeToPixels(element.margin),
  top: convertSizeToPixels(element.offsetTop),
  left: convertSizeToPixels(element.offsetStart),
  right: convertSizeToPixels(element.offsetEnd),
  bottom: convertSizeToPixels(element.offsetEnd),
  position: 'relative',
});

const BoxStyles = (element: any) => {
  return {
    display: 'flex',
    overflow: 'hidden',
    flexDirection: element.layout === 'vertical' ? 'column' : 'row',
    backgroundColor: element.backgroundColor,
    justifyContent: element.justifyContent || 'flex-start',
    alignItems: element.alignItems,
    padding: element.paddingAll ? convertSizeToPixels(element.paddingAll) : '',
    paddingTop: convertSizeToPixels(element.paddingTop),
    paddingBottom: convertSizeToPixels(element.paddingBottom),
    paddingLeft: convertSizeToPixels(element.paddingStart),
    paddingRight: convertSizeToPixels(element.paddingEnd),
    gap: convertSizeToPixels(element.spacing),
    marginTop: convertSizeToPixels(element.margin),
    width: element.width,
    height: element.height,
    maxWidth: element.maxWidth || '100%',
    maxHeight: element.maxHeight,
    borderRadius: convertSizeToPixels(element.cornerRadius),
    borderWidth: element.borderWidth ? convertSizeToPixels(element.borderWidth) : '1px',
    borderColor: element.borderColor,
    top: convertSizeToPixels(element.offsetTop),
    left: convertSizeToPixels(element.offsetStart),
    right: convertSizeToPixels(element.offsetEnd),
    bottom: convertSizeToPixels(element.offsetEnd),
  };
};


const VideoStyles = {
  padding: '5px',
};

const renderContents = (contents: any, size?: any) => {
  return contents.map((content: any) => {
    switch (content.type) {
      case 'image':
        if (content.action && content.action.uri) {
          return `<div style="flex: 1 1 0%;${convertToKebabCase(ImageContainerStyles(content))}">
                    <a href="${content.action.uri}" style="color: inherit; text-decoration: none;">
                      <div style="${convertToKebabCase(ImageStyle(content, size))}"></div>
                    </a>
                  </div>`;
        } else {
          return `<div style="${convertToKebabCase(ImageContainerStyles(content))}"><div style="${convertToKebabCase(ImageStyle(content, size))}"></div></div>`;
        }
      case 'text':
        return `<p style="${convertToKebabCase(TextStyles(content))}">${content.text}</p>`;
      // case 'button':
      //   return `
      //     <div style="${convertToKebabCase(ButtonStyles(content))}">
      //       <a href="${content.action.uri}" style="color: inherit; text-decoration: none;">${content.action.label}</a>
      //     </div>`;
      case 'button':
        const buttonId = `button-${generateCustomID()}`;
        if (content.action.uri.startsWith(`${process.env.NEXT_PUBLIC_BASE_URL}`)) {
          return `
            <div style="${convertToKebabCase(ButtonStyles(content))}">
              <div id="${buttonId}" style="color: inherit; text-decoration: none; cursor: pointer;">${content.action.label}</div>
            </div>
            <script>
              document.getElementById('${buttonId}').addEventListener('click', function(event) {
                const url = '${content.action.uri}';
                if (url.startsWith('${process.env.NEXT_PUBLIC_BASE_URL}')) {
                  event.preventDefault();
                  fetch(url, { method: 'POST' })
                    .then(response => {
                      if (!response.ok) {
                        throw new Error('Network response was not ok');
                      }
                      return response.json();
                    })
                    .then(data => {
                      console.log('Success:', data);
                      alert('Action completed successfully');
                    })
                    .catch(error => {
                      console.error('Error:', error);
                      alert('Failed to complete action');
                    });
                }
              });
            </script>`;
        } else {
          return `
            <div style="${convertToKebabCase(ButtonStyles(content))}">
              <a href="${content.action.uri}" style="color: inherit; text-decoration: none;">${content.action.label}</a>
            </div>`;
        }
      case 'icon':
        return `
          <div class="p-2">
            <div style="${convertToKebabCase(IconStyle(content))}"></div>
          </div>`;
      case 'separator':
        return `
          <div class="relative pt-[10px] pb-[10px]">
            <hr style="${convertToKebabCase(SeparatorStyles(content))}" />
          </div>`;
      case 'box':
        return `<div style="${convertToKebabCase(BoxStyles(content))}">${renderContents(content.contents)}</div>`;
      default:
        return '';
    }
  }).join('');
};

export function createHtmlFromJson(json: any) {
  if (json.type === "carousel" && json.contents && json.contents.length > 0) {
    json = json.contents[0];
  }

  const dynamicStyles = (currentIndex: any) => {
    const contents = json.contents;
    const currentContent = contents && contents[currentIndex];

    if (currentIndex === 0) {
      return {
        // width: '236px', //for grid view looks in application homepage
        width: '400px',
        MaxWidth: '300px',
        // maxWidth: json.size === 'nano' ? '120px'
        //         : json.size === 'micro' ? '160px'
        //         : json.size === 'deca' ? '220px'
        //         : json.size === 'hecto' ? '241px'
        //         : json.size === 'kilo' ? '260px'
        //         : json.size === 'mega' ? '300px'
        //         : json.size === 'giga' ? '386px' : '300px',
        // marginLeft: '8px',
        // marginRight: '8px',
        direction: currentContent?.direction,
      };
    }
  };

  const styles = dynamicStyles(0);
  const dynamicStyleString = convertToKebabCase(styles);

  const headerHtml = json.header && json.header.contents && json.header.contents.length > 0 ?
    // `<div class="component-container relative mt-2 p-4 border-x border-t rounded-t-lg bg-white overflow-hidden">${renderContents(json.header.contents)}</div>` : '';
    `<div class="component-container relative p-4 border-x border-t rounded-t-lg bg-white overflow-hidden">${renderContents(json.header.contents)}</div>` : '';


  const heroClasses = [
    "component-container",
    "relative",
    "bg-white",
    "overflow-hidden"
  ];

  if (json.hero && json.hero.contents) {
    if (json.hero.contents.length === 0) {
      heroClasses.push("p-4");
    } else {
      if (json.hero.contents[0].contents && json.hero.contents[0].contents.length < 1) {
        heroClasses.push("p-4");
      }
      if (json.hero.contents[0].contents && json.hero.contents[0].contents[0]?.type === 'box') {
        heroClasses.push("px-4", "py-4");
      }
      if (json.hero.contents[0].contents && json.hero.contents[0].contents.length > 0 && json.hero.contents[0].type !== 'box') {
        heroClasses.push("p-0");
      }
    }
    if (json.hero?.contents && json.hero.contents.length <= 1) {
      // heroClasses.push("mt-2", "border-x", "border-t", "rounded-t-lg");
      heroClasses.push("border-x", "border-t", "rounded-t-lg");

    }
  } else {
    if (json.header?.contents && json.header.contents.length <= 1) {
      // heroClasses.push("mt-2", "border-x", "border-t", "rounded-t-lg");
      heroClasses.push("border-x", "border-t", "rounded-t-lg");

    }
  }

  const heroHtml = (json.hero && json.hero.contents && json.hero.contents.length > 0) ?
    `<div class="${heroClasses.join(' ')}">${renderContents(json.hero.contents, json.size)}</div>` : '';

  const bodyClasses = [
    "component-container",
    "relative",
    "p-4",
    "border-x",
    "bg-white",
    "overflow-hidden",
    "rounded-b-lg",
    "shadow-lg",
  ];

  if ((!json.hero || !json.hero.contents || json.hero.contents.length === 0) && (!json.header || !json.header.contents || json.header.contents.length === 0)) {
    // bodyClasses.push("mt-2", "border-t", "rounded-t-lg");
    bodyClasses.push("border-t", "rounded-t-lg");
  }

  const bodyHtml = json.body && json.body.contents && json.body.contents.length > 0 ?
    `<div class="${bodyClasses.join(' ')}">${renderContents(json.body.contents, json.size)}</div>` : '';

  // const footerClasses = [
  //   "component-container",
  //   "relative",
  //   "mb-2",
  //   "px-[10px]",
  //   "pt-[10px]",
  //   "pb-[5px]",
  //   "border-b",
  //   "border-x",
  //   "rounded-b-lg",
  //   "shadow-lg",
  //   "bg-white",
  //   "overflow-hidden",
  //   "flex"
  // ];

  // const footerHtml = (json.footer && json.footer.contents && json.footer.contents.length > 0) ?
  //   `<div style="background-color: #DCDCDC;" class="${footerClasses.join(' ')}">${renderContents(json.footer.contents, json.size)}</div>` : '';

  return `
    <div class="max-w-full overflow-hidden" style="${dynamicStyleString}">
        ${headerHtml}${heroHtml}${bodyHtml}
    </div>
`;
};

export function convertSizeToPixels(value: any, defaultValue = '') {
  if (!value) return defaultValue;
  switch (value) {
    case 'none':
      return '0px';
    case 'xs':
      return '2px';
    case 'sm':
      return '4px';
    case 'md':
      return '8px';
    case 'lg':
      return '12px';
    case 'xl':
      return '16px';
    case 'xxl':
      return '20px';
    case 'light':
      return '0.5px';
    case 'normal':
      return '1px';
    case 'medium':
      return '2px';
    case 'semi-bold':
      return '3px';
    case 'bold':
      return '4px';
    default:
      return value;
  }
}

export function rewriteFlexHtml(flexHtml: string, size: string): string {
  let maxWidth: string;

  switch (size) {
    case 'nano':
      maxWidth = '120px';
      break;
    case 'micro':
      maxWidth = '160px';
      break;
    case 'deca':
      maxWidth = '220px';
      break;
    case 'hecto':
      maxWidth = '241px';
      break;
    case 'kilo':
      maxWidth = '260px';
      break;
    case 'mega':
      maxWidth = '300px';
      break;
    case 'giga':
      maxWidth = '386px';
      break;
    default:
      maxWidth = '300px';
  }

  const updatedFlexHtml = flexHtml.replace(/max-width:\s*\d+px;/, `max-width: ${maxWidth};`);

  return updatedFlexHtml;
}


function addIdAndDescription(content: any): any {
  const newContent = {
    ...content,
    id: generateCustomID(),
    description: getDescription(content.type),
  };

  if (content.contents) {
    newContent.contents = content.contents.map(addIdAndDescription);
  }

  return newContent;
}

function getDescription(type: string): string {
  switch (type) {
    case 'text':
      return 'Render your mind using me.';
    case 'button':
      return 'A button to explore your route magic!';
    case 'separator':
      return 'Separate your element using me.';
    case 'video':
      return 'A video to show your magic!';
    case 'image':
      return 'Image is the best way to render information!';
    case 'icon':
      return 'Icon is the soul of the contents!';
    case 'box':
      return 'Expand your creativity by using me!';
    default:
      return '';
  }
}

// transform json from line to our app json
export function transformJson(inputJson: any) {
  return {
    id: 'initial',
    type: inputJson.type,
    size: inputJson.size,
    header: {
      id: 'initial_header',
      contents: [],
    },
    hero: {
      id: 'initial_hero',
      contents: [],
    },
    body: {
      id: 'initial_body',
      contents: [
        {
          id: 'initial_box',
          type: inputJson.body.type,
          layout: inputJson.body.layout,
          description: 'Expand your creativity by using me!',
          contents: inputJson.body.contents.map(addIdAndDescription),
        },
      ],
    },
    footer: {
      id: 'initial_footer',
      contents: [],
    },
  };
}

const MAX_WIDTH = 384;

const scalePosition = (position: any, originalWidth: number) => {
  const scaleRatio = MAX_WIDTH / originalWidth;
  return {
    x0: position.x0 * scaleRatio,
    y0: position.y0 * scaleRatio,
    x1: position.x1 * scaleRatio,
    y1: position.y1 * scaleRatio,
  };
};

export const convertExtractedInfoToEditorElements = (extractedInfo: any, originalWidth: number): EditorElement[] => {
  console.log("Ori image Width:", originalWidth);

  const calculateTextAlign = (x0: number, x1: number, originalWidth: number) => {
    const relativeX0Position = x0 / originalWidth;
    const relativeX1Position = x1 / originalWidth;

    console.log("Relative X0 Position:", relativeX0Position);
    console.log("Relative X1 Position:", relativeX1Position);

    if (relativeX1Position > 0.7 || relativeX0Position > 0.6) {
      return 'end';
    } else if (relativeX0Position > 0.33) {
      return 'center';
    } else {
      return 'start';
    }
  };

  const createTextElement = (text: string, position: any): EditorElement => {
    const scaledPosition = scalePosition(position, originalWidth);
    const { x0, x1 } = scaledPosition;
    const textAlign = calculateTextAlign(x0, x1, originalWidth);

    return {
      id: generateCustomID(),
      type: 'text',
      text: text,
      size: 'sm',
      align: textAlign,
      description: getDescription('text'),
    };
  };

  const createBoxElement = (field: any): EditorElement => {
    const { text, position } = field;

    console.log("Creating box element for:", text);
    console.log("Position:", position);

    return {
      id: generateCustomID(),
      type: 'box',
      layout: 'vertical',
      contents: [createTextElement(text, position)],
      position: 'absolute',
      description: getDescription('box'),
    };
  };

  const elements: EditorElement[] = [];

  console.log("Extracted Info above:", extractedInfo);

  Object.keys(extractedInfo).forEach(key => {
    const field = extractedInfo[key];
    if (field.position) {
      console.log("Field with position:", field);
      elements.push(createBoxElement(field));
    } else {
      console.log("Field without position:", field);
    }
  });

  console.log("Elements array:", elements);

  return elements;
};


// export const convertExtractedInfoToEditorElements = (extractedInfo: any, originalWidth: number): EditorComponent => {
//   const createTextElement = (text: string): EditorElement => ({
//     id: generateCustomID(),
//     type: 'text',
//     text: text,
//     size: 'sm',
//   });

//   const createBoxElement = (field: any): EditorElement => {
//     const { text, position } = field;
//     const scaledPosition = scalePosition(position, originalWidth);
//     const { x0, y0, x1, y1 } = scaledPosition;

//     console.log("Creating box element for:", text);
//     console.log("Scaled position:", scaledPosition);

//     return {
//       id: generateCustomID(),
//       type: 'box',
//       layout: 'vertical',
//       contents: [createTextElement(text)],
//       position: 'absolute',
//       offsetStart: `${x0}px`,
//       // offsetTop: `${y0}px`,
//       // width: `${x1 - x0}px`,
//       // height: `${y1 - y0}px`,
//     };
//   };

//   const elements: EditorElement[] = [];

//   console.log("Extracted Info above:", extractedInfo);

//   Object.keys(extractedInfo).forEach(key => {
//     const field = extractedInfo[key];
//     if (field.position) {
//       console.log("Field with position:", field);
//       elements.push(addIdAndDescription(createBoxElement(field)));
//     } else {
//       console.log("Field without position:", field);
//     }
//   });

//   console.log("Elements array:", elements);

//   const initialBox: EditorElement = {
//     id: 'initial_box',
//     type: 'box',
//     layout: 'vertical',
//     contents: elements,
//   };

//   console.log("Initial box:", initialBox);

//   return {
//     id: 'initial',
//     type: 'bubble',
//     size: 'giga',
//     header: { id: 'initial_header', contents: [] },
//     hero: { id: 'initial_hero', contents: [] },
//     body: { id: 'initial_body', contents: [initialBox] },
//     footer: { id: 'initial_footer', contents: [] },
//   };
// };

// not working

export const loadOpenCV = () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined') {
      console.log("Starting to load OpenCV script...");

      const script = document.createElement('script');
      script.src = 'https://docs.opencv.org/4.x/opencv.js';
      script.type = 'text/javascript';
      script.async = true;

      script.onload = () => {
        console.log("OpenCV script loaded. Checking for OpenCV initialization...");

        const checkOpenCVInitialization = () => {
          if (window.cv && window.cv.imread) {
            console.log("OpenCV is available.");
            resolve(window.cv);
          } else {
            console.log("Waiting for OpenCV to initialize...");
            setTimeout(checkOpenCVInitialization, 100);
          }
        };

        checkOpenCVInitialization();
      };

      script.onerror = (error) => {
        console.error("Error loading OpenCV script:", error);
        reject(error);
      };

      document.head.appendChild(script);
      console.log("OpenCV script appended to head.");
    } else {
      console.error("Window object is not available.");
      reject(new Error('Window object is not available.'));
    }
  });
};


export function generateCustomID() {
  return uuidv4();
}

export function timeSince(date: Date) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " year" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " month" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " day" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hour" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minute" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  }
  return Math.floor(seconds) + " second" + (Math.floor(seconds) > 1 ? "s" : "") + " ago";
}

//line pay

export function generateHmacSignature(channelSecret: string, requestUri: string, requestBody: string, nonce: string): string {
  const rawSignature = `${channelSecret}${requestUri}${requestBody}${nonce}`;
  const hmac = crypto.createHmac('sha256', channelSecret);
  hmac.update(rawSignature);
  return hmac.digest('base64');
}

