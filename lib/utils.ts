import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from 'uuid';
import jsPDF from "jspdf";
import React from 'react';
import ReactDOMServer from 'react-dom/server';

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

const getSize = (size: any) => {
  switch (size) {
    case 'nano': return '120px';
    case 'micro': return '160px';
    case 'deca': return '220px';
    case 'hecto': return '241px';
    case 'kilo': return '260px';
    case 'mega': return '300px';
    case 'giga': return '386px';
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
  marginTop: element.margin,
  top: element.offsetTop,
  left: element.offsetStart,
  right: element.offsetEnd,
  bottom: element.offsetBottom,
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

const ImageStyle = (element: any) => ({
  display: 'inline-block',
  width: element.size === 'xs' ? '60px' : element.size === 'sm' ? '80px' : element.size === 'md' ? '100px' : element.size === 'lg' ? '120px' : element.size === 'xl' ? '140px' : element.size === 'xxl' ? '160px' : element.size === 'full' ? '100%' : element.size || '100px',
  height: element.size === 'xs' ? '60px' : element.size === 'sm' ? '80px' : element.size === 'md' ? '100px' : element.size === 'lg' ? '120px' : element.size === 'xl' ? '140px' : element.size === 'xxl' ? '160px' : element.size === 'full' ? '100%' : element.size || '100px',
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
  fontSize: element.size === 'xs' ? '13px' : element.size === 'sm' ? '14px' : element.size === 'md' ? '16px' : element.size === 'lg' ? '19px' : element.size === 'xl' ? '22px' : element.size === 'xxl' ? '29px' : element.size,
  fontStyle: element.style,
  textDecoration: element.decoration,
  marginTop: element.margin,
  top: element.offsetTop,
  left: element.offsetStart,
  right: element.offsetEnd,
  bottom: element.offsetBottom,
});

const BoxStyles = (element: any) => {
  return {
    display: 'flex',
    overflow: 'hidden',
    flexDirection: element.layout === 'vertical' ? 'column' : 'row',
    backgroundColor: element.backgroundColor,
    justifyContent: element.justifyContent || 'flex-start',
    alignItems: element.alignItems,
    padding: element.paddingAll === 'xs' ? '2px' : element.paddingAll === 'sm' ? '4px' : element.paddingAll === 'md' ? '8px' : element.paddingAll === 'lg' ? '12px' : element.paddingAll === 'xl' ? '16px' : element.paddingAll === 'xxl' ? '20px' : element.paddingAll,
    paddingTop: element.paddingTop === 'xs' ? '2px' : element.paddingTop === 'sm' ? '4px' : element.paddingTop === 'md' ? '8px' : element.paddingTop === 'lg' ? '12px' : element.paddingTop === 'xl' ? '16px' : element.paddingTop === 'xxl' ? '20px' : element.paddingTop,
    paddingBottom: element.paddingBottom === 'xs' ? '2px' : element.paddingBottom === 'sm' ? '4px' : element.paddingBottom === 'md' ? '8px' : element.paddingBottom === 'lg' ? '12px' : element.paddingBottom === 'xl' ? '16px' : element.paddingBottom === 'xxl' ? '20px' : element.paddingBottom,
    paddingLeft: element.paddingLeft === 'xs' ? '2px' : element.paddingLeft === 'sm' ? '4px' : element.paddingLeft === 'md' ? '8px' : element.paddingLeft === 'lg' ? '12px' : element.paddingLeft === 'xl' ? '16px' : element.paddingLeft === 'xxl' ? '20px' : element.paddingLeft,
    paddingRight: element.paddingRight === 'xs' ? '2px' : element.paddingRight === 'sm' ? '4px' : element.paddingRight === 'md' ? '8px' : element.paddingRight === 'lg' ? '12px' : element.paddingRight === 'xl' ? '16px' : element.paddingRight === 'xxl' ? '20px' : element.paddingRight,
    gap: element.spacing,
    marginTop: element.margin,
    width: element.width,
    height: element.height,
    maxWidth: element.maxWidth || '100%',
    maxHeight: element.maxHeight,
    borderRadius: element.cornerRadius,
    borderWidth: element.borderWidth === 'light' ? '0.5px' : element.borderWidth === 'normal' ? '1px' : element.borderWidth === 'medium' ? '2px' : element.borderWidth === 'semi-bold' ? '3px' : element.borderWidth === 'bold' ? '4px' : element.borderWidth,
    borderColor: element.borderColor,
    top: element.offsetTop === 'xs' ? '2px' : element.offsetTop === 'sm' ? '4px' : element.offsetTop === 'md' ? '8px' : element.offsetTop === 'lg' ? '12px' : element.offsetTop === 'xl' ? '16px' : element.offsetTop === 'xxl' ? '20px' : element.offsetTop,
    left: element.offsetStart === 'xs' ? '2px' : element.offsetStart === 'sm' ? '4px' : element.offsetStart === 'md' ? '8px' : element.offsetStart === 'lg' ? '12px' : element.offsetStart === 'xl' ? '16px' : element.offsetStart === 'xxl' ? '20px' : element.offsetStart,
    right: element.offsetEnd === 'xs' ? '2px' : element.offsetEnd === 'sm' ? '4px' : element.offsetEnd === 'md' ? '8px' : element.offsetEnd === 'lg' ? '12px' : element.offsetEnd === 'xl' ? '16px' : element.offsetEnd === 'xxl' ? '20px' : element.offsetEnd,
    bottom: element.offsetBottom === 'xs' ? '2px' : element.offsetBottom === 'sm' ? '4px' : element.offsetBottom === 'md' ? '8px' : element.offsetBottom === 'lg' ? '12px' : element.offsetBottom === 'xl' ? '16px' : element.offsetBottom === 'xxl' ? '20px' : element.offsetBottom,
  };
};


const VideoStyles = {
  padding: '5px',
};

const renderContents = (contents: any) => {
  return contents.map((content: any) => {
    switch (content.type) {
      case 'image':
        return `<div style="${convertToKebabCase(ImageContainerStyles(content))}"><div style="${convertToKebabCase(ImageStyle(content))}"></div></div>`;
      case 'text':
        return `<p style="${convertToKebabCase(TextStyles(content))}">${content.text}</p>`;
      case 'button':
        return `
          <div style="${convertToKebabCase(ButtonStyles(content))}">
            <a href="${content.action.uri}" style="color: inherit; text-decoration: none;">${content.action.label}</a>
          </div>`;
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
        width: '236px', //for grid view looks in application homepage
        // maxWidth: json.size === 'nano' ? '120px'
        //   : json.size === 'micro' ? '160px'
        //     : json.size === 'deca' ? '220px'
        //       : json.size === 'hecto' ? '241px'
        //         : json.size === 'kilo' ? '260px'
        //           : json.size === 'mega' ? '300px'
        //             : json.size === 'giga' ? '386px' : '300px',
        marginLeft: '8px',
        marginRight: '8px',
        direction: currentContent?.direction,
      };
    } 
  };

  const styles = dynamicStyles(0);
  const dynamicStyleString = convertToKebabCase(styles);

  const headerHtml = json.header && json.header.contents && json.header.contents.length > 0 ?
    `<div class="component-container relative mt-2 p-4 border-x border-t rounded-t-lg bg-white overflow-hidden">${renderContents(json.header.contents)}</div>` : '';

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
      heroClasses.push("mt-2", "border-x", "border-t", "rounded-t-lg");
    }
  } else {
    if (json.header?.contents && json.header.contents.length <= 1) {
      heroClasses.push("mt-2", "border-x", "border-t", "rounded-t-lg");
    }
  }

  const heroHtml = (json.hero && json.hero.contents && json.hero.contents.length > 0) ?
    `<div class="${heroClasses.join(' ')}">${renderContents(json.hero.contents)}</div>` : '';

  const bodyClasses = [
    "component-container",
    "relative",
    "mb-2",
    "p-4",
    "border-b",
    "border-x",
    "rounded-b-lg",
    "shadow-lg",
    "bg-white",
    "overflow-hidden"
  ];

  if ((!json.hero || !json.hero.contents || json.hero.contents.length === 0) && (!json.header || !json.header.contents || json.header.contents.length === 0)) {
    bodyClasses.push("mt-2", "border-t", "rounded-t-lg");
  }

  const bodyHtml = json.body && json.body.contents && json.body.contents.length > 0 ?
    `<div class="${bodyClasses.join(' ')}">${renderContents(json.body.contents)}${json.footer ? renderContents(json.footer.contents) : ''}</div>` : '';

  return `
    <div class="max-w-full overflow-hidden" style="${dynamicStyleString}">
        ${headerHtml}${heroHtml}${bodyHtml}
    </div>
`;
};

export function transformJson(inputJson: any) {
  return {
    id: 'initial',
    type: inputJson.type,
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
          contents: inputJson.body.contents.map((content: any) => ({
            ...content,
            id: generateCustomID(),
            description:
              content.type === 'image'
                ? 'Image is the best way to render information!'
                : 'Render your mind using me.',
          })),
        },
      ],
    },
    footer: {
      id: 'initial_footer',
      contents: [],
    },
  };
};

export function generateCustomID() {
  return uuidv4();
}
