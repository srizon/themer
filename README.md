# Themer

A modern, responsive color palette generator built with Next.js, TypeScript, and Tailwind CSS. Create beautiful, professional color palettes for your design projects with advanced color theory algorithms.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Features

### Core Functionality
- **Advanced Color Generation**: Sophisticated monochromatic algorithms with perceptual uniformity
- **Smart Tailwind Integration**: Intelligent weight calculation for any color count (3-20 colors)
- **Real-time Updates**: See changes instantly as you modify colors and settings
- **Responsive Design**: Works perfectly on desktop and mobile devices

### Interactive Controls
- **Drag & Drop Reordering**: Reorder color palettes by dragging and dropping
- **Advanced Color Controls**: Fine-tune with min/max contrast, lightness controls, and saturation curve adjustment
- **Interactive Color Swatches**: Click to copy colors to clipboard
- **Page Title Editing**: Edit the page title inline with click-to-edit functionality

### Export & Import
- **Multiple Export Formats**: CSS, SCSS, JSON, and Tailwind CSS
- **SVG Export**: Copy the entire page as SVG for Figma or other design tools
- **Image Export**: Export as high-resolution PNG images
- **Import/Export**: Save and load color palettes with page titles
- **Import from URL**: Import palettes directly from hosted JSON files

### Data Management
- **Local Storage**: Automatically saves palettes to browser storage
- **Color Information**: View contrast ratios and Tailwind-style weights
- **Enhanced Color Naming**: 300+ descriptive names with intelligent categorization
- **Optional Analytics**: Google Analytics for pageview tracking

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/srizon/themer.git
   cd themer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables (Optional)

Create a `.env.local` file to enable Google Analytics:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15 | React framework with App Router |
| **TypeScript** | 5 | Type-safe JavaScript |
| **CSS** | Custom Properties | Pure CSS styling system |
| **State Management** | React Hooks | Component state and localStorage |
| **Deployment** | Vercel Ready | Optimized for Vercel deployment |

## Usage Guide

### Creating Color Palettes

1. **Add New Palette**: Click "Add Another Color" to create a new palette
2. **Choose Base Color**: Use the color picker or enter a hex value
3. **Set Color Count**: Choose between 3-20 colors
4. **Fine-tune Controls**: Adjust contrast, lightness, and saturation curves
5. **Reorder Palettes**: Drag and drop to reorder your palettes
6. **Customize Names**: Click on palette names to edit them

### Exporting Your Work

#### Individual Palette Export
- Click the export button on any palette
- Choose format: CSS, SCSS, JSON, or Tailwind CSS
- Select color format: HEX, RGB, RGBA, HSL, or HSLA
- Copy generated code to clipboard

#### SVG Export for Design Tools
- Click "Copy as SVG" in the header
- Automatically copies to clipboard
- Paste directly into Figma, Sketch, or other design tools
- Maintains exact colors, layout, and styling

#### Image Export
- Click "Export as Image" for high-resolution PNG
- Exports at 2x scale for crisp, professional images
- Automatically copies to clipboard
- Perfect for presentations and documentation

### Importing Palettes

#### From File
- Use "Export All" to save all palettes
- Use "Import" to load saved palettes from your computer
- Choose to merge or replace existing palettes

#### From URL
- Click "Import from URL" in the header menu
- Enter the URL of a hosted JSON file
- Supports HTTP/HTTPS protocols
- Automatic validation and error handling

## Advanced Features

### Color Theory Algorithms

#### Enhanced Monochromatic Generation
- **Perceptual Uniformity**: Even visual spacing between shades
- **Neutral Color Detection**: Special handling for grays and near-neutral colors
- **Exact HSL Preservation**: Maintains precise hue and saturation values
- **Balanced Lightness Curves**: Mathematically even distribution from 5% to 95% lightness

#### Smart Tailwind Weight Calculation
- **Standard 11-color palettes**: Traditional Tailwind weights (50, 100, 200, ..., 950)
- **Custom counts**: Mathematically even distribution with 25-point rounding
- **Perceptual uniformity**: Ensures equal visual spacing between weights

### Advanced Controls
- **Saturation Curve Control**: Fine-tune saturation distribution (-100 to 100)
- **Automatic Synchronization**: Contrast and lightness values update each other
- **Color Validation**: Ensures all generated colors meet quality standards
- **WCAG Compliance**: Built-in contrast ratio calculations

## Project Structure

```
themer/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout with GA integration
│   │   ├── page.tsx                  # Main application page
│   │   └── globals.css               # Global styles and CSS variables
│   ├── components/                   # React components
│   │   ├── Header.tsx                # App header with actions and title editing
│   │   ├── ColorSet.tsx              # Individual color palette component
│   │   ├── ColorSwatch.tsx           # Individual color swatch component
│   │   ├── ExportModal.tsx           # Export functionality modal
│   │   ├── ImportConfirmationModal.tsx # Import handling modal
│   │   └── GoogleAnalytics.tsx       # GA pageview tracking component
│   ├── lib/                          # Utility libraries
│   │   ├── ColorThemer.ts            # Core color generation algorithms
│   │   ├── colorUtils.ts             # Shared color utilities and conversions
│   │   ├── svgExport.ts              # SVG and image export functionality
│   │   └── gtag.ts                   # Google Analytics helpers
│   └── types/                        # TypeScript type definitions
│       └── color.ts                  # Color-related type definitions
├── package.json                      # Dependencies and scripts
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── eslint.config.mjs                 # ESLint configuration
├── vercel.json                       # Vercel deployment configuration
└── README.md                         # Project documentation
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

**Environment Variables**: Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` in your Vercel project settings if using Google Analytics.

### Other Platforms

The app is ready to deploy on any platform supporting Next.js:

- **Netlify**: Use the Next.js build command
- **Railway**: Connect your GitHub repository
- **DigitalOcean App Platform**: Select Next.js as the framework
- **AWS Amplify**: Connect your repository

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

### Building for Production

```bash
npm run build
npm start
```

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with Next.js configuration
- **CSS**: Pure CSS with CSS Custom Properties
- **State Management**: React hooks with localStorage persistence
- **Testing**: Manual testing and code quality focus

## Customization

### Adding New Palette Types

1. Add the new type to the `ColorSet` interface in `types/color.ts`
2. Implement the generation algorithm in `ColorThemer.ts`
3. Add the option to the select dropdown in `ColorSet.tsx`

### Styling

- **Global Styles**: Modify `src/app/globals.css`
- **CSS Variables**: Use CSS Custom Properties for consistent theming
- **Component Styles**: Customize component-specific styles

### Color Algorithms

All color generation logic is in the `ColorThemer` class:

- Color validation and quality standards
- Weight calculation for Tailwind-style naming
- Contrast ratio calculations
- Perceptual color space conversions

## Recent Updates

### v0.1.10 - Import from URL Feature
- **Import from URL**: Import palettes directly from hosted JSON files
- **Enhanced Import Modal**: Professional interface with validation and error handling
- **Security Features**: HTTP/HTTPS protocol validation and data structure validation
- **Comprehensive Error Handling**: User-friendly error messages for various scenarios

### v0.1.9 - SVG Export & Image Export
- **SVG Export System**: Complete SVG export functionality with professional layout
- **Image Export**: High-resolution PNG exports with clipboard integration
- **Page Title Editing**: Inline editing with persistent storage
- **Enhanced Export Data**: Include page titles and metadata in exports

### v0.1.8 - Saturation Curve Control
- **Saturation Curve Control**: Fine-tune saturation distribution (-100 to 100)
- **Enhanced Color Naming**: 300+ descriptive names with intelligent categorization
- **Advanced Algorithms**: Sophisticated saturation curve generation
- **UI Improvements**: Streamlined interface elements

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Follow the existing code style and structure
- Ensure all code passes ESLint checks
- Test your changes thoroughly
- Update documentation as needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **GitHub Issues**: [Create an issue](https://github.com/srizon/themer/issues)
- **Documentation**: Check this README and code comments
- **Code Quality**: Follow project standards and best practices

---

<div align="center">

**Built with ❤️ using Next.js, TypeScript, and CSS**

[Star on GitHub](https://github.com/srizon/themer) • [Report Bug](https://github.com/srizon/themer/issues) • [Request Feature](https://github.com/srizon/themer/issues)

</div>
