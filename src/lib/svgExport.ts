export function exportPageAsSVG(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting SVG export...');
      
      generateSVGString().then((svgString) => {
        // Try to copy as text first (this works better with Figma)
        if (navigator.clipboard && navigator.clipboard.writeText) {
          console.log('Using writeText for SVG');
          navigator.clipboard.writeText(svgString).then(() => {
            console.log('SVG copied to clipboard as text successfully');
            resolve();
          }).catch((err) => {
            console.log('SVG text clipboard write failed, trying fallback:', err);
            // Fallback: create a temporary element and copy
            fallbackCopy(svgString, resolve, reject);
          });
        } else {
          // Fallback for older browsers
          console.log('Clipboard API not supported, using fallback');
          fallbackCopy(svgString, resolve, reject);
        }
      }).catch(reject);
    } catch (error) {
      console.error('SVG export error:', error);
      reject(error);
    }
  });
}

export async function generateSVGString(): Promise<string> {
  try {
    console.log('Starting SVG generation...');
    
    // Get the main container
    const container = document.querySelector('.container');
    if (!container) {
      throw new Error('Container not found');
    }
    console.log('Container found:', container);

    // Get the container dimensions
    const containerRect = container.getBoundingClientRect();
    console.log('Container dimensions:', containerRect);
    
    // Add consistent padding around the entire SVG
    const padding = 80; // --spacing-5xl: 5rem = 80px
    const totalWidth = containerRect.width + (padding * 2);
    const totalHeight = containerRect.height + (padding * 2);
    
    // Create SVG element with proper namespace and padding
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', totalWidth.toString());
    svg.setAttribute('height', totalHeight.toString());
    svg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    console.log('SVG element created with padding');
    
    // Add background
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('width', '100%');
    background.setAttribute('height', '100%');
    background.setAttribute('fill', '#ffffff');
    svg.appendChild(background);
    console.log('Background added');

    // Generate SVG content from the page with padding offset
    console.log('Generating SVG content...');
    const svgContent = generateSVGFromContainer(container, containerRect, padding);
    svg.appendChild(svgContent);
    console.log('SVG content generated and added');

    // Convert SVG to string
    const svgString = new XMLSerializer().serializeToString(svg);
    
    // For debugging - log the SVG to console
    console.log('Generated SVG:', svgString);
    console.log('SVG length:', svgString.length);
    
    return svgString;
  } catch (error) {
    console.error('SVG generation error:', error);
    throw error;
  }
}

function generateSVGFromContainer(container: Element, containerRect: DOMRect, padding: number): SVGElement {
  console.log('generateSVGFromContainer called');
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  
  // Get the header
  const header = container.querySelector('.header');
  if (header) {
    console.log('Header found, generating header SVG');
    const headerGroup = generateHeaderSVG(header as HTMLElement, padding);
    group.appendChild(headerGroup);
  }
  
  // Get all color sets
  const colorSets = container.querySelectorAll('.color-set-wrapper');
  console.log('Color sets found:', colorSets.length);
  let currentY = 180 + padding; // Start after header with more top padding (--spacing-5xl: 5rem = 80px + header height + extra padding)
  
  colorSets.forEach((colorSet, index) => {
    console.log(`Processing color set ${index + 1}`);
    const colorSetGroup = generateColorSetSVG(colorSet as HTMLElement, currentY, padding);
    group.appendChild(colorSetGroup);
    
    // Calculate height for next position
    const colorSetRect = colorSet.getBoundingClientRect();
    currentY += colorSetRect.height + 48; // Add spacing between sets (--spacing-3xl: 3rem = 48px)
  });
  
  // Exclude the add color set section
  console.log('Add color section excluded from SVG export');
  
  // Add footer with attribution
  const footerGroup = generateFooterSVG(currentY + padding, padding);
  group.appendChild(footerGroup);
  
  // Add bottom padding to ensure footer doesn't touch the edge
  const bottomPadding = 40; // Additional bottom spacing
  const totalContentHeight = currentY + padding + 60 + bottomPadding; // Footer height + bottom padding
  
  // Update SVG height if content is taller than container
  if (totalContentHeight > containerRect.height + (padding * 2)) {
    const svgElement = document.querySelector('svg');
    if (svgElement) {
      svgElement.setAttribute('height', totalContentHeight.toString());
      svgElement.setAttribute('viewBox', `0 0 ${containerRect.width + (padding * 2)} ${totalContentHeight}`);
    }
  }
  
  console.log('SVG container generation complete');
  return group;
}

function generateHeaderSVG(header: HTMLElement, padding: number): SVGElement {
  console.log('generateHeaderSVG called');
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  
  // Get header title only (exclude buttons)
  const titleElement = header.querySelector('h1');
  if (titleElement) {
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', (padding + 80).toString()); // --spacing-5xl: 5rem = 80px left padding
    title.setAttribute('y', (padding + 100).toString()); // More top padding (--spacing-5xl: 5rem = 80px + extra padding)
    title.setAttribute('font-family', 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace');
    title.setAttribute('font-size', '64'); // Increased from 40px to 64px
    title.setAttribute('font-weight', '600');
    title.setAttribute('fill', '#000000');
    title.setAttribute('text-anchor', 'start'); // Left align
    title.textContent = titleElement.textContent || 'Untitled';
    group.appendChild(title);
  }
  
  return group;
}

function generateColorSetSVG(colorSet: HTMLElement, startY: number, padding: number): SVGElement {
  console.log('generateColorSetSVG called with startY:', startY);
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  
  // Get color set title
  const titleElement = colorSet.querySelector('.section-header h2');
  if (titleElement) {
    console.log('Title element found:', titleElement.textContent);
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', (padding + 80).toString()); // --spacing-5xl: 5rem = 80px left padding
    title.setAttribute('y', (startY + 30).toString());
    title.setAttribute('font-family', 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace');
    title.setAttribute('font-size', '18'); // --font-size-xl: 1.125rem = 18px
    title.setAttribute('font-weight', '600');
    title.setAttribute('fill', '#000000');
    title.setAttribute('text-anchor', 'start'); // Left align
    title.textContent = titleElement.textContent || 'Color Set';
    group.appendChild(title);
  } else {
    console.log('No title element found');
  }
  
  // Check if color set controls are visible and include them
  const controlsElement = colorSet.querySelector('.color-set-controls') as HTMLElement;
  let controlsHeight = 0;
  
  if (controlsElement && controlsElement.style.display !== 'none') {
    console.log('Color set controls found and visible');
    const controlsRect = controlsElement.getBoundingClientRect();
    controlsHeight = controlsRect.height;
    
    // Add controls background
    const controlsBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    controlsBg.setAttribute('x', (padding + 80).toString()); // --spacing-5xl: 5rem = 80px left padding
    controlsBg.setAttribute('y', (startY + 50).toString());
    controlsBg.setAttribute('width', (controlsRect.width - 160).toString()); // Account for left and right padding
    controlsBg.setAttribute('height', controlsHeight.toString());
    controlsBg.setAttribute('fill', '#fafafa'); // --color-surface-light
    controlsBg.setAttribute('rx', '6'); // --border-radius: 6px
    controlsBg.setAttribute('ry', '6');
    controlsBg.setAttribute('stroke', '#e4e4e7'); // --color-border
    controlsBg.setAttribute('stroke-width', '1');
    group.appendChild(controlsBg);
    
    // Add control labels and inputs (simplified representation)
    const controlGroups = controlsElement.querySelectorAll('.control-group');
    let controlY = startY + 70;
    
    controlGroups.forEach((controlGroup, index) => {
      const label = controlGroup.querySelector('label');
      if (label) {
        const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelText.setAttribute('x', (padding + 100).toString()); // --spacing-5xl: 5rem = 80px + --spacing-2xl: 2rem = 32px
        labelText.setAttribute('y', controlY.toString());
        labelText.setAttribute('font-family', 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace');
        labelText.setAttribute('font-size', '14'); // --font-size-base: 0.875rem = 14px
        labelText.setAttribute('font-weight', '500');
        labelText.setAttribute('fill', '#000000');
        labelText.setAttribute('text-anchor', 'start'); // Left align
        labelText.textContent = label.textContent || '';
        group.appendChild(labelText);
      }
      
      // Add input representation
      const input = controlGroup.querySelector('input');
      if (input) {
        const inputRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        inputRect.setAttribute('x', (padding + 260).toString()); // Fixed position for inputs
        inputRect.setAttribute('y', (controlY - 15).toString());
        inputRect.setAttribute('width', '80');
        inputRect.setAttribute('height', '20');
        inputRect.setAttribute('fill', '#ffffff');
        inputRect.setAttribute('rx', '4'); // --border-radius-sm: 4px
        inputRect.setAttribute('ry', '4');
        inputRect.setAttribute('stroke', '#e4e4e7');
        inputRect.setAttribute('stroke-width', '1');
        group.appendChild(inputRect);
        
        // Add input value text
        const inputText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        inputText.setAttribute('x', (padding + 300).toString()); // Center of input
        inputText.setAttribute('y', (controlY - 2).toString());
        inputText.setAttribute('font-family', 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace');
        inputText.setAttribute('font-size', '14'); // --font-size-base: 0.875rem = 14px
        inputText.setAttribute('fill', '#000000');
        inputText.setAttribute('text-anchor', 'middle');
        inputText.textContent = input.value || '';
        group.appendChild(inputText);
      }
      
      controlY += 64; // Space between control groups (--spacing-4xl: 4rem = 64px)
    });
  }
  
  // Get color grid - adjust Y position based on controls and reduce space after title
  const colorGrid = colorSet.querySelector('.color-grid');
  if (colorGrid) {
    console.log('Color grid found');
    const colors = colorGrid.querySelectorAll('.color-swatch');
    console.log('Color swatches found:', colors.length);
    
    // Calculate exact dimensions from CSS variables
    const colorDisplayHeight = 64; // --color-display-height: 64px
    const colorSwatchMinWidth = 40; // --color-swatch-min-width: 40px
    const gap = 0; // gap: 0 from CSS
    
    let currentX = (padding + 80); // --spacing-5xl: 5rem = 80px left padding
    const gridStartY = startY + 30 + controlsHeight + 16; // Reduced space after title (--spacing-lg: 1rem = 16px)
    
    colors.forEach((colorSwatch, index) => {
      console.log(`Processing color swatch ${index + 1}`);
      const colorDisplay = colorSwatch.querySelector('.color-display') as HTMLElement;
      if (colorDisplay) {
        const computedStyle = window.getComputedStyle(colorDisplay);
        const backgroundColor = computedStyle.backgroundColor;
        console.log(`Color ${index + 1} background:`, backgroundColor);
        
        // Get the actual computed dimensions
        const swatchRect = colorSwatch.getBoundingClientRect();
        const displayRect = colorDisplay.getBoundingClientRect();
        
        // Create color rectangle with exact dimensions - no border
        const colorRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        colorRect.setAttribute('x', currentX.toString());
        colorRect.setAttribute('y', gridStartY.toString());
        colorRect.setAttribute('width', displayRect.width.toString());
        colorRect.setAttribute('height', displayRect.height.toString());
        colorRect.setAttribute('fill', backgroundColor);
        
        // No border radius - removed rx and ry attributes
        group.appendChild(colorRect);
        
        // Add color weight and contrast info below hex, left-aligned
        const weightElement = colorSwatch.querySelector('.color-weight');
        const contrastElement = colorSwatch.querySelector('.color-contrast');
        
        if (weightElement) {
          const weightText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          const weightX = currentX; // Left align with swatch
          const weightY = gridStartY + displayRect.height + 24; // Below color swatch (--spacing-xl: 1.5rem = 24px)
          
          weightText.setAttribute('x', weightX.toString());
          weightText.setAttribute('y', weightY.toString());
          weightText.setAttribute('font-family', 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace');
          weightText.setAttribute('font-size', '12'); // --font-size-sm: 0.75rem = 12px
          weightText.setAttribute('fill', '#000000');
          weightText.setAttribute('text-anchor', 'start'); // Left align
          weightText.setAttribute('font-weight', '500');
          weightText.textContent = weightElement.textContent || '';
          group.appendChild(weightText);
        }
        
        if (contrastElement) {
          const contrastText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          const contrastX = currentX; // Left align with swatch
          const contrastY = gridStartY + displayRect.height + 40; // Below weight (--spacing-2xl: 2rem = 32px + 8px)
          
          contrastText.setAttribute('x', contrastX.toString());
          contrastText.setAttribute('y', contrastY.toString());
          contrastText.setAttribute('font-family', 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace');
          contrastText.setAttribute('font-size', '10'); // --font-size-xs: 0.625rem = 10px
          contrastText.setAttribute('fill', '#71717a'); // --color-secondary
          contrastText.setAttribute('text-anchor', 'start'); // Left align
          contrastText.textContent = contrastElement.textContent || '';
          group.appendChild(contrastText);
        }
        
        // Move to next position with exact spacing
        currentX += displayRect.width + gap;
      } else {
        console.log(`No color display found for swatch ${index + 1}`);
      }
    });
  } else {
    console.log('No color grid found');
  }
  
  console.log('Color set SVG generation complete');
  return group;
}

function generateFooterSVG(startY: number, padding: number): SVGElement {
  console.log('generateFooterSVG called');
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  
  // Create a clickable link for the footer
  const link = document.createElementNS('http://www.w3.org/2000/svg', 'a');
  link.setAttribute('href', 'https://themer.creatrix.us');
  link.setAttribute('target', '_blank');
  
  const footerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  footerText.setAttribute('x', (padding + 80).toString()); // --spacing-5xl: 5rem = 80px left padding
  footerText.setAttribute('y', (startY + 10).toString()); // Position below the last color set
  footerText.setAttribute('font-family', 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace');
  footerText.setAttribute('font-size', '12'); // --font-size-sm: 0.75rem = 12px
  footerText.setAttribute('fill', '#71717a'); // --color-secondary
  footerText.setAttribute('text-anchor', 'start'); // Left align
  footerText.textContent = 'Made with ❤️ on themer.creatrix.us';
  
  // Add hover effect styling
  footerText.setAttribute('cursor', 'pointer');
  
  // Add a subtle underline above the text to indicate it's clickable
  const underline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  underline.setAttribute('x1', (padding + 80).toString());
  underline.setAttribute('y1', (startY - 8).toString()); // Higher above the text (8px above instead of 2px above)
  underline.setAttribute('x2', (padding + 380).toString()); // Approximate width of the text
  underline.setAttribute('y2', (startY - 8).toString());
  underline.setAttribute('stroke', '#71717a');
  underline.setAttribute('stroke-width', '0.5');
  underline.setAttribute('opacity', '0.6');
  
  link.appendChild(footerText);
  group.appendChild(link);
  group.appendChild(underline);
  
  return group;
}

function fallbackCopy(svgString: string, resolve: () => void, reject: (error: Error) => void): void {
  try {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = svgString;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    
    // Select and copy
    textarea.select();
    document.execCommand('copy');
    
    // Clean up
    document.body.removeChild(textarea);
    console.log('SVG copied to clipboard via fallback method');
    resolve();
  } catch {
    reject(new Error('Failed to copy SVG to clipboard'));
  }
}

export async function exportPageAsImage(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting image export...');
      
      // Get the main container
      const container = document.querySelector('.container');
      if (!container) {
        reject(new Error('Container not found'));
        return;
      }
      
      // Use html2canvas to capture the exact visual representation
      import('html2canvas').then(({ default: html2canvas }) => {
        html2canvas(container as HTMLElement, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          scale: 2, // Higher resolution
          logging: true,
          width: container.scrollWidth,
          height: container.scrollHeight,
          // Fix for faded content
          removeContainer: false,
          foreignObjectRendering: false,
          // Better color handling
          imageTimeout: 0,
          // Ensure proper color rendering
          onclone: (clonedDoc) => {
            // Fix any transparency issues in the cloned document
            const clonedContainer = clonedDoc.querySelector('.container');
            if (clonedContainer) {
              // Add a style element with selective color fixes
              const styleElement = clonedDoc.createElement('style');
              styleElement.textContent = `
                /* Fix text opacity without changing colors */
                .color-info, .color-weight, .color-contrast {
                  opacity: 1 !important;
                }
                
                .color-hex {
                  opacity: 1 !important;
                }
                
                .section-header h2 {
                  opacity: 1 !important;
                }
                
                .palette-name {
                  opacity: 1 !important;
                }
                
                .btn {
                  opacity: 1 !important;
                }
                
                /* Ensure color swatches maintain their colors */
                .color-display {
                  opacity: 1 !important;
                }
                
                /* Force specific problematic text to be visible */
                .color-weight, .color-contrast {
                  color: #000000 !important;
                }
              `;
              clonedDoc.head.appendChild(styleElement);
              
              // Fix transparency issues without changing actual colors
              const allTextElements = clonedContainer.querySelectorAll('*');
              allTextElements.forEach((element) => {
                const computedStyle = window.getComputedStyle(element);
                
                // Only fix opacity, not colors
                const opacity = computedStyle.opacity;
                if (opacity && parseFloat(opacity) < 1) {
                  (element as HTMLElement).style.setProperty('opacity', '1', 'important');
                }
                
                // Fix text color opacity for specific elements only
                if (element.classList.contains('color-weight') || element.classList.contains('color-contrast')) {
                  const color = computedStyle.color;
                  if (color && (color.includes('rgba') || color.includes('hsla'))) {
                    const rgbaMatch = color.match(/rgba?\(([^)]+)\)/);
                    if (rgbaMatch) {
                      const values = rgbaMatch[1].split(',').map(v => parseFloat(v.trim()));
                      if (values.length >= 4 && values[3] < 0.8) {
                        // Make text darker for better visibility
                        const [r, g, b] = values;
                        const darkerR = Math.max(0, r * 0.7);
                        const darkerG = Math.max(0, g * 0.7);
                        const darkerB = Math.max(0, b * 0.7);
                        (element as HTMLElement).style.setProperty('color', `rgb(${darkerR}, ${darkerG}, ${darkerB})`, 'important');
                      }
                    }
                  }
                }
                
                // Fix background color opacity for color swatches only
                if (element.classList.contains('color-display')) {
                  const bgColor = computedStyle.backgroundColor;
                  if (bgColor && bgColor.includes('rgba')) {
                    const rgbaMatch = bgColor.match(/rgba?\(([^)]+)\)/);
                    if (rgbaMatch) {
                      const values = rgbaMatch[1].split(',').map(v => parseFloat(v.trim()));
                      if (values.length >= 4 && values[3] < 1) {
                        // Ensure color swatches are fully opaque but keep their colors
                        (element as HTMLElement).style.setProperty('background-color', `rgb(${values[0]}, ${values[1]}, ${values[2]})`, 'important');
                      }
                    }
                  }
                  // Force color swatches to be fully opaque
                  (element as HTMLElement).style.setProperty('opacity', '1', 'important');
                }
              });
              
              // Force specific elements to be fully visible
              const colorInfoElements = clonedContainer.querySelectorAll('.color-info, .color-weight, .color-contrast');
              colorInfoElements.forEach((element) => {
                (element as HTMLElement).style.setProperty('opacity', '1', 'important');
              });
              
              // Ensure color swatches have proper borders and visibility
              const colorSwatches = clonedContainer.querySelectorAll('.color-swatch');
              colorSwatches.forEach((swatch) => {
                (swatch as HTMLElement).style.setProperty('background', 'transparent', 'important');
                (swatch as HTMLElement).style.setProperty('opacity', '1', 'important');
              });
              
              // Force all buttons to be visible
              const buttons = clonedContainer.querySelectorAll('button');
              buttons.forEach((button) => {
                (button as HTMLElement).style.setProperty('opacity', '1', 'important');
              });
            }
          }
        }).then((canvas) => {
          console.log('Canvas created:', canvas.width, 'x', canvas.height);
          
          // Convert to blob
          canvas.toBlob((blob) => {
            if (blob) {
              console.log('Blob created:', blob.size, 'bytes');
              
              // Try to copy to clipboard as image
              if (navigator.clipboard && navigator.clipboard.write) {
                navigator.clipboard.write([
                  new ClipboardItem({
                    'image/png': blob
                  })
                ]).then(() => {
                  console.log('Image copied to clipboard successfully');
                  resolve();
                }).catch((err) => {
                  console.log('Image clipboard write failed, trying download:', err);
                  // Fallback: download the image
                  downloadImage(blob, resolve, reject);
                });
              } else {
                // Fallback: download the image
                downloadImage(blob, resolve, reject);
              }
            } else {
              reject(new Error('Failed to create image blob'));
            }
          }, 'image/png', 0.95);
        }).catch((error) => {
          console.error('html2canvas failed:', error);
          reject(error);
        });
      }).catch((error) => {
        console.error('Failed to load html2canvas:', error);
        reject(new Error('html2canvas library not available'));
      });
    } catch (error) {
      console.error('Image export error:', error);
      reject(error);
    }
  });
}

function downloadImage(blob: Blob, resolve: () => void, reject: (error: Error) => void): void {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-palette-screenshot.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('Image downloaded successfully');
    resolve();
  } catch (error) {
    reject(new Error('Failed to download image'));
  }
}
