# Color Palette Generator

A modern, responsive color palette generator built with Next.js, TypeScript, and Tailwind CSS. Generate beautiful color palettes for your design projects with various color theory algorithms.

## Features

- **Drag & Drop Reordering**: Reorder color palettes by dragging and dropping them
- **Advanced Color Controls**: Fine-tune palettes with min/max contrast, lightness controls, and saturation curve adjustment
- **Interactive Color Swatches**: Click to copy colors to clipboard
- **Export Options**: Export palettes in CSS, SCSS, JSON, and Tailwind CSS formats
- **Import/Export**: Save and load your color palettes
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Real-time Updates**: See changes instantly as you modify colors and settings
- **Color Information**: View contrast ratios and Tailwind-style weights for each color
- **Local Storage**: Automatically saves your palettes to browser storage
- **Advanced Color Algorithms**: Sophisticated monochromatic color generation with perceptual uniformity
- **Smart Tailwind Integration**: Intelligent weight calculation for any color count
- **Automatic Value Synchronization**: Contrast and lightness values automatically update each other
- **Saturation Curve Control**: Fine-tune the saturation distribution curve for more creative palettes
- **Enhanced Color Naming**: Sophisticated color naming system with 200+ descriptive names
- **Optional Analytics**: Google Analytics 4 pageview tracking via `NEXT_PUBLIC_GA_MEASUREMENT_ID`

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Pure CSS with CSS Custom Properties
- **State Management**: React hooks with localStorage persistence
- **Deployment**: Ready for Vercel, Netlify, or any Node.js hosting
- **Analytics (optional)**: Google Analytics 4

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/srizon/themer.git
cd themer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables (Optional)

Create a `.env.local` file to enable Google Analytics 4 pageview tracking:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Building for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

If using Google Analytics, add `NEXT_PUBLIC_GA_MEASUREMENT_ID` in your project settings under Environment Variables.

### Other Platforms

The app is ready to deploy on any platform that supports Next.js:

- **Netlify**: Use the Next.js build command
- **Railway**: Connect your GitHub repo
- **DigitalOcean App Platform**: Select Next.js as the framework
- **AWS Amplify**: Connect your repository

## Usage

### Creating Color Palettes

1. **Add a New Palette**: Click "Add Another Color" to create a new palette
2. **Choose Base Color**: Use the color picker or enter a hex value
3. **Adjust Color Count**: Set the number of colors (3-20)
4. **Fine-tune Controls**: Use min/max contrast and lightness controls for precise customization
5. **Reorder Palettes**: Drag and drop palettes to reorder them
6. **Customize Names**: Click on palette names to edit them

### Exporting Palettes

1. **Individual Export**: Click the export button on any palette
2. **Format Options**: Choose from CSS, SCSS, JSON, or Tailwind CSS
3. **Color Formats**: Select HEX, RGB, RGBA, HSL, or HSLA
4. **Copy to Clipboard**: One-click copying of generated code

### Importing Palettes

1. **Export All**: Use the "Export All" button to save all palettes
2. **Import**: Use the "Import" button to load saved palettes
3. **Merge or Replace**: Choose how to handle existing palettes

## Color Theory Algorithms

### Monochromatic (Enhanced)
Creates variations of a single hue with different lightness levels. Features:
- **Perceptual Uniformity**: Even visual spacing between shades
- **Neutral Color Detection**: Special handling for grays and near-neutral colors
- **Exact HSL Preservation**: Maintains precise hue and saturation values
- **Balanced Lightness Curves**: Mathematically even distribution from 5% to 95% lightness
- **Advanced Controls**: Fine-tune with min/max contrast and lightness controls
- **Automatic Synchronization**: Contrast and lightness values automatically update each other
- **Drag & Drop Reordering**: Easily reorder palettes for better organization

## Advanced Features

### Smart Tailwind Weight Calculation
The app now features intelligent weight calculation that adapts to any color count:

- **Standard 11-color palettes**: Uses traditional Tailwind weights (50, 100, 200, ..., 950)
- **13-color palettes**: Extended weights with intermediate values (50, 125, 200, ..., 950)
- **Custom counts**: Mathematically even distribution with 25-point rounding for clean values
- **Perceptual uniformity**: Ensures equal visual spacing between weights

### Enhanced Color Generation
Recent improvements include:

- **Lab Color Space Support**: Perceptual color space for more natural progressions
- **Sophisticated Saturation Curves**: Bell-curve distribution that peaks in mid-tones
- **Lightness-based Adjustments**: Dynamic saturation adjustments based on lightness
- **Exact HSL Matching**: Advanced algorithms to preserve exact hue and saturation values
- **Neutral Color Detection**: Special handling for grays and near-neutral colors

### Color Validation and Adjustment
- **Automatic Color Validation**: Ensures all generated colors meet quality standards
- **Contrast Ratio Calculations**: WCAG-compliant contrast calculations
- **Color Space Conversions**: Full support for RGB, HSL, and Lab color spaces

### Drag & Drop Reordering
- **Intuitive Interface**: Drag any color palette to reorder it
- **Visual Feedback**: Opacity and rotation effects during drag operations
- **Smooth Animations**: CSS transitions for seamless user experience
- **Persistent Order**: Reordered palettes are automatically saved to local storage

## Project Structure

```
themer/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (loads GA if configured)
│   │   ├── page.tsx                  # Main page component
│   │   └── globals.css               # Global styles
│   ├── components/                   # React components
│   │   ├── Header.tsx                # App header with actions
│   │   ├── ColorSet.tsx              # Individual color palette
│   │   ├── ColorSwatch.tsx           # Individual color swatch
│   │   ├── ExportModal.tsx           # Export functionality
│   │   ├── ImportConfirmationModal.tsx # Import handling
│   │   └── GoogleAnalytics.tsx       # Client component to send GA pageviews
│   ├── lib/                          # Utility libraries
│   │   ├── ColorThemer.ts            # Core color generation logic
│   │   ├── colorUtils.ts             # Shared color utilities (HSL/RGB, weights, contrast)
│   │   └── gtag.ts                   # GA helpers (pageview/event)
│   └── types/                        # TypeScript type definitions
│       └── color.ts                  # Color-related types
├── package.json                      # Dependencies and scripts
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── eslint.config.mjs                 # ESLint configuration
├── vercel.json                       # Vercel deployment configuration
└── README.md                         # Project documentation
```

## Recent Updates

### v0.1.8 - Saturation Curve Control & Enhanced Color Naming (Latest)
- **Saturation Curve Control**: Added new `saturationCurve` parameter (-100 to 100) for fine-tuning saturation distribution
- **Enhanced Color Naming System**: Expanded color naming with 300+ descriptive names including exotic fruits, gemstones, and natural elements
- **Improved Color Categorization**: Better hue-based color naming with saturation and lightness modifiers
- **Advanced Saturation Algorithms**: More sophisticated saturation curve generation for creative palette customization
- **UI Improvements**: Streamlined drag handles and enhanced user interface elements
- **Better Color Variety**: More diverse and creative color names for better palette identification

### v0.1.7 - Enhanced Color Naming System
- **Advanced Color Naming**: Introduced sophisticated color naming system with 200+ descriptive color names based on hue, saturation, and lightness
- **Intelligent Color Categorization**: Enhanced `getEnhancedColorName()` function provides creative and accurate color names like "Crimson", "Seafoam", "Midnight Purple", etc.
- **Color Name Fallback System**: Added `getBasicColorCategory()` function for backward compatibility with systems requiring basic color categories
- **Improved User Experience**: Palette names now use enhanced color names for better recognition and visual appeal
- **Consolidated Color Logic**: Refactored color naming logic into shared utilities for consistency across components
- **Dynamic Color Modifiers**: Smart modifiers based on saturation and lightness ("Bright", "Deep", "Soft", "Vintage", etc.)

### v0.1.6 - Analytics & Shared Utilities
- **Google Analytics 4**: Optional pageview tracking via `NEXT_PUBLIC_GA_MEASUREMENT_ID`, with `src/components/GoogleAnalytics.tsx` and helpers in `src/lib/gtag.ts`. Loaded conditionally in `src/app/layout.tsx`.
- **Shared Color Utilities**: Common color conversion and Tailwind weight helpers consolidated in `src/lib/colorUtils.ts`. Components updated to import from shared utils.
- **Docs**: Updated README with environment variables and project structure.

### v0.1.5 - UI Polish & Icons
- **Icons & Favicons**: Updated `favicon.ico` and added app icons (`android-chrome-192x192.png`, `android-chrome-512x512.png`, `apple-touch-icon.png`, `favicon-16x16.png`, `favicon-32x32.png`) under `src/app/`
- **Header UX**: Improved actions menu behavior and accessibility in `Header.tsx`
- **Styling Refinements**: Polished styles in `globals.css`
- **Config Cleanup**: Minor `tsconfig.json` updates

### v0.1.4 - Base Color Preservation & Enhanced Algorithms
- **Base Color Preservation**: The user's exact base color is now preserved in the generated palette at the appropriate position
- **Intelligent Color Positioning**: Base colors are automatically positioned based on their lightness value within the palette range
- **Enhanced Neutral Color Handling**: Improved algorithms for grays and near-neutral colors with better base color preservation
- **Edge Case Handling**: Proper handling of very light or very dark base colors that fall outside the standard range
- **Improved Color Generation**: More sophisticated algorithms that maintain exact HSL values while preserving user intent
- **Better User Experience**: Users can now see their chosen base color exactly as selected in the final palette

### v0.1.3 - Drag & Drop Reordering & Advanced Controls
- **Drag & Drop Reordering**: Reorder color palettes by dragging and dropping them
- **Advanced Color Controls**: Added min/max contrast and lightness controls with automatic synchronization
- **Simplified Palette Types**: Streamlined to focus on monochromatic palettes with advanced customization
- **Enhanced User Experience**: Improved visual feedback during drag operations with opacity and rotation effects
- **Automatic Value Synchronization**: Contrast and lightness values automatically update each other for consistency
- **Vercel Deployment Ready**: Added vercel.json configuration for seamless deployment

### v0.1.2 - Advanced Color Algorithms
- **Enhanced Monochromatic Generation**: Improved algorithms with perceptual uniformity and exact HSL preservation
- **Smart Tailwind Weight Calculation**: Intelligent weight distribution for any color count (3-20 colors)
- **Lab Color Space Support**: Added perceptual color space for more natural color progressions
- **Sophisticated Saturation Curves**: Bell-curve distribution that creates more harmonious palettes
- **Neutral Color Detection**: Special handling for grays and near-neutral colors
- **Exact HSL Matching**: Advanced algorithms to preserve precise hue and saturation values
- **Enhanced Color Validation**: Improved color quality standards and contrast calculations
- **Balanced Lightness Curves**: Mathematically even distribution from 5% to 95% lightness

### v0.1.1 - Documentation Cleanup
- **Removed test references**: Cleaned up documentation to reflect no testing framework
- **Updated contributing guidelines**: Simplified contribution process
- **Improved code style documentation**: Added clarity about project standards

### v0.1.0 - Project Restructuring
- **Restructured project layout**: Moved from nested `themer-nextjs/` directory to flat structure
- **Updated dependencies**: Upgraded to Next.js 15.4.6 and React 19.1.0
- **Improved file organization**: Cleaner project structure for better maintainability
- **Enhanced TypeScript support**: Updated type definitions and configurations
- **Modern ESLint setup**: Updated to ESLint v9 with Next.js configuration

## Customization

### Adding New Palette Types

1. Add the new type to the `ColorSet` interface in `types/color.ts`
2. Implement the generation algorithm in `ColorThemer.ts`
3. Add the option to the select dropdown in `ColorSet.tsx`

### Styling

The app uses pure CSS with CSS Custom Properties for styling. You can customize:
- Colors and variables in `src/app/globals.css`
- Component-specific styles in each component
- CSS Custom Properties for consistent theming

### Color Algorithms

All color generation algorithms are in the `ColorThemer` class. You can modify:
- Color validation logic
- Weight calculation for Tailwind-style naming
- Contrast ratio calculations
- Perceptual color space conversions

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Pure CSS with CSS Custom Properties for styling
- React hooks for state management
- No testing framework (focus on manual testing and code quality)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure code follows project standards
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

---

Built with ❤️ using Next.js, TypeScript, and CSS
