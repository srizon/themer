# Color Palette Generator

A modern, responsive color palette generator built with Next.js, TypeScript, and Tailwind CSS. Generate beautiful color palettes for your design projects with various color theory algorithms.

## Features

- **Multiple Palette Types**: Monochromatic, Analogous, Complementary, Triadic, Tetradic, and Split Complementary
- **Interactive Color Swatches**: Click to copy colors to clipboard
- **Export Options**: Export palettes in CSS, SCSS, JSON, and Tailwind CSS formats
- **Import/Export**: Save and load your color palettes
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Real-time Updates**: See changes instantly as you modify colors and settings
- **Color Information**: View contrast ratios and Tailwind-style weights for each color
- **Local Storage**: Automatically saves your palettes to browser storage

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Pure CSS with CSS Custom Properties
- **State Management**: React hooks with localStorage persistence
- **Deployment**: Ready for Vercel, Netlify, or any Node.js hosting

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
3. **Select Palette Type**: Choose from 6 different color theory approaches
4. **Adjust Color Count**: Set the number of colors (3-20)
5. **Customize Names**: Click on palette names to edit them

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

### Monochromatic
Creates variations of a single hue with different lightness levels.

### Analogous
Uses colors that are next to each other on the color wheel.

### Complementary
Uses colors that are opposite each other on the color wheel.

### Triadic
Uses three colors that are evenly spaced around the color wheel.

### Tetradic
Uses four colors that form a rectangle on the color wheel.

### Split Complementary
Uses a base color and the two colors adjacent to its complement.

## Project Structure

```
themer/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Main page component
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── Header.tsx      # App header with actions
│   │   ├── ColorSet.tsx    # Individual color palette
│   │   ├── ColorSwatch.tsx # Individual color swatch
│   │   ├── ExportModal.tsx # Export functionality
│   │   └── ImportConfirmationModal.tsx # Import handling
│   ├── lib/               # Utility libraries
│   │   └── ColorThemer.ts # Core color generation logic
│   └── types/             # TypeScript type definitions
│       └── color.ts       # Color-related types
├── package.json           # Dependencies and scripts
├── next.config.ts         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
├── eslint.config.mjs      # ESLint configuration
└── README.md              # Project documentation
```

## Recent Updates

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
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
