// Color Theory and Generation Logic
class ColorThemer {
    constructor() {
        this.colorSets = [];
        this.currentExportFormat = 'css';
        this.currentColorFormat = 'hex';
        this.nextSetId = 1;
        this.storageKey = 'colorThemerData';
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.bindEvents();
        
        // If no saved data, add the first color set
        if (this.colorSets.length === 0) {
            this.addColorSet();
        } else {
            // Restore saved color sets
            this.colorSets.forEach(colorSet => {
                // Ensure colors are generated if they're missing
                if (!colorSet.colors || colorSet.colors.length === 0) {
                    this.generateColorSet(colorSet);
                }
                this.renderColorSet(colorSet);
            });
            this.markCurrentSet();
        }
    }

    // Save data to localStorage
    saveToStorage() {
        const data = {
            colorSets: this.colorSets,
            currentExportFormat: this.currentExportFormat,
            currentColorFormat: this.currentColorFormat,
            nextSetId: this.nextSetId,
            lastSaved: new Date().toISOString()
        };
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    // Load data from localStorage
    loadFromStorage() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                this.colorSets = data.colorSets || [];
                this.currentExportFormat = data.currentExportFormat || 'css';
                this.currentColorFormat = data.currentColorFormat || 'hex';
                this.nextSetId = data.nextSetId || 1;
            }
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            // Reset to defaults if loading fails
            this.colorSets = [];
            this.currentExportFormat = 'css';
            this.currentColorFormat = 'hex';
            this.nextSetId = 1;
        }
    }

    // Clear all saved data
    clearStorage() {
        try {
            localStorage.removeItem(this.storageKey);
            this.showNotification('All saved data cleared', 'info');
        } catch (error) {
            console.warn('Failed to clear localStorage:', error);
        }
    }

    // Clear all data and reset to default state
    clearAllData() {
        if (confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
            this.clearStorage();
            
            // Clear the DOM
            const container = document.getElementById('color-sets-container');
            container.innerHTML = '';
            
            // Reset to defaults
            this.colorSets = [];
            this.currentExportFormat = 'css';
            this.nextSetId = 1;
            
            // Add a new default color set
            this.addColorSet();
            
            this.showNotification('All data cleared and reset to defaults', 'success');
        }
    }

    bindEvents() {
        // Add color set button
        const addColorSetBtn = document.getElementById('add-color-set-btn');
        
        // Header action buttons
        const clearDataBtn = document.getElementById('clear-data-btn');
        const exportAllBtn = document.getElementById('export-all-btn');
        const importBtn = document.getElementById('import-btn');
        const importFileInput = document.getElementById('import-file-input');
        
        // Export modal events
        const modal = document.getElementById('export-modal');
        const modalClose = document.getElementById('modal-close');
        const modalBackdrop = document.getElementById('modal-backdrop');
        const exportOptions = document.querySelectorAll('.export-option');
        const colorFormatSelect = document.getElementById('color-format-select');
        const copyExportBtn = document.getElementById('copy-export-btn');

        // Add color set button
        addColorSetBtn.addEventListener('click', () => this.addColorSet());

        // Header action buttons
        clearDataBtn.addEventListener('click', () => this.clearAllData());
        exportAllBtn.addEventListener('click', () => this.exportAllPalettes());
        importBtn.addEventListener('click', () => importFileInput.click());
        importFileInput.addEventListener('change', (e) => this.handleImportFile(e));

        // Export events
        modalClose.addEventListener('click', () => this.closeExportModal());
        modalBackdrop.addEventListener('click', () => this.closeExportModal());

        exportOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectExportFormat(e.currentTarget.dataset.format);
            });
        });

        colorFormatSelect.addEventListener('change', (e) => {
            this.selectColorFormat(e.target.value);
        });

        copyExportBtn.addEventListener('click', () => this.copyExportCode());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeExportModal();
        });
    }

    addColorSet() {
        const setId = this.nextSetId++;
        
        // Generate random color with better saturation and lightness for proper naming
        const hue = Math.random() * 360;
        const saturation = Math.random() * 60 + 40; // 40-100% saturation
        const lightness = Math.random() * 40 + 30; // 30-70% lightness
        const randomColor = this.hslToHex(hue, saturation, lightness);
        
        const colorSet = {
            id: setId,
            baseColor: randomColor, // Random color instead of hardcoded purple
            paletteType: 'monochromatic',
            colorCount: 11,
            colors: []
        };

        this.colorSets.push(colorSet);
        this.generateColorSet(colorSet);
        this.renderColorSet(colorSet);
        this.markCurrentSet();
        this.saveToStorage();
        
        // Show the form for the new color set
        setTimeout(() => {
            this.toggleEditMode(setId);
        }, 100);
    }

    removeColorSet(setId) {
        const index = this.colorSets.findIndex(set => set.id === setId);
        if (index !== -1) {
            this.colorSets.splice(index, 1);
            this.removeColorSetFromDOM(setId);
            
            if (this.colorSets.length === 0) {
                this.addColorSet(); // Ensure at least one color set exists
            } else {
                this.saveToStorage();
            }
        }
    }

    removeColorSetFromDOM(setId) {
        const element = document.querySelector(`[data-set-id="${setId}"]`);
        if (element) {
            element.remove();
        }
    }



    markCurrentSet() {
        // Remove current-set class from all color sections
        document.querySelectorAll('.color-section').forEach(section => {
            section.classList.remove('current-set');
        });
        
        // Add current-set class to the last color section (current one)
        const colorSections = document.querySelectorAll('.color-section');
        if (colorSections.length > 0) {
            colorSections[colorSections.length - 1].classList.add('current-set');
        }
    }

    updateColorSetFromControls(setId, animate = false) {
        const colorSet = this.colorSets.find(set => set.id === setId);
        if (!colorSet) return;

        const element = document.querySelector(`[data-set-id="${setId}"]`);
        if (!element) return;

        // Update color set properties from controls
        colorSet.baseColor = element.querySelector(`#base-color-${setId}`).value;
        colorSet.paletteType = element.querySelector(`#palette-type-${setId}`).value;
        colorSet.colorCount = parseInt(element.querySelector(`#color-count-${setId}`).value);

        // Update palette name only if it hasn't been customized
        if (!colorSet.customName) {
            const colorName = this.getBaseColorName(colorSet.baseColor);
            const paletteName = this.generatePaletteName(colorName, colorSet.paletteType);
            element.querySelector('.palette-name').textContent = paletteName;
        }

        // Regenerate colors
        this.generateColorSet(colorSet);
        this.renderColorGrid(element.querySelector('.color-grid'), colorSet.colors, setId);
        this.saveToStorage();

        if (animate) {
            element.classList.add('animate');
            setTimeout(() => element.classList.remove('animate'), 300);
            
            // Hide the form after generating colors
            setTimeout(() => {
                this.toggleEditMode(setId);
            }, 300);
        }
    }

    updateColorSetName(setId, newName) {
        const colorSet = this.colorSets.find(set => set.id === setId);
        if (!colorSet) return;

        // Save the custom name
        if (newName && newName.trim() !== '') {
            colorSet.customName = newName.trim();
        } else {
            // If empty, revert to auto-generated name
            delete colorSet.customName;
            const element = document.querySelector(`[data-set-id="${setId}"]`);
            if (element) {
                const colorName = this.getBaseColorName(colorSet.baseColor);
                const paletteName = this.generatePaletteName(colorName, colorSet.paletteType);
                element.querySelector('.palette-name').textContent = paletteName;
            }
        }
        this.saveToStorage();
    }

    randomizeColorSet(setId) {
        const colorSet = this.colorSets.find(set => set.id === setId);
        if (!colorSet) return;

        const element = document.querySelector(`[data-set-id="${setId}"]`);
        if (!element) return;

        // Generate random color with better saturation and lightness for proper naming
        const hue = Math.random() * 360;
        const saturation = Math.random() * 60 + 40; // 40-100% saturation
        const lightness = Math.random() * 40 + 30; // 30-70% lightness
        const randomColor = this.hslToHex(hue, saturation, lightness);
        
        // Update controls
        element.querySelector(`#base-color-${setId}`).value = randomColor;
        element.querySelector(`#base-color-text-${setId}`).value = randomColor;
        
        // Update color set
        this.updateColorSetFromControls(setId, true);
        this.saveToStorage();
    }

    generateColorSet(colorSet) {
        let colors = [];
        
        switch (colorSet.paletteType) {
            case 'monochromatic':
                colors = this.generateMonochromatic(colorSet.baseColor, colorSet.colorCount);
                break;
            case 'analogous':
                colors = this.generateAnalogous(colorSet.baseColor, colorSet.colorCount);
                break;
            case 'complementary':
                colors = this.generateComplementary(colorSet.baseColor, colorSet.colorCount);
                break;
            case 'triadic':
                colors = this.generateTriadic(colorSet.baseColor, colorSet.colorCount);
                break;
            case 'tetradic':
                colors = this.generateTetradic(colorSet.baseColor, colorSet.colorCount);
                break;
            case 'split-complementary':
                colors = this.generateSplitComplementary(colorSet.baseColor, colorSet.colorCount);
                break;
        }

        // Validate and adjust colors to ensure they match their expected names
        colors = this.validateAndAdjustColors(colors, colorSet.baseColor);
        colorSet.colors = colors;
    }

    renderColorSet(colorSet, animate = false) {
        const container = document.getElementById('color-sets-container');
        
        // Check if this color set already exists in DOM
        let existingElement = container.querySelector(`[data-set-id="${colorSet.id}"]`);
        
        if (!existingElement) {
            // Create new color set element
            existingElement = this.createColorSetElement(colorSet);
            container.appendChild(existingElement);
        } else {
            // Update existing element
            this.updateColorSetElement(existingElement, colorSet);
        }

        if (animate) {
            existingElement.classList.add('animate');
            setTimeout(() => existingElement.classList.remove('animate'), 300);
        }
    }

    createColorSetElement(colorSet) {
        const element = document.createElement('section');
        element.className = 'color-section';
        element.setAttribute('data-set-id', colorSet.id);
        
        const colorName = colorSet.customName || this.generatePaletteName(
            this.getBaseColorName(colorSet.baseColor), 
            colorSet.paletteType
        );
        
        element.innerHTML = `
            <div class="section-header">
                <h2 class="palette-name" data-set-id="${colorSet.id}" contenteditable="true" spellcheck="false">${colorName}</h2>
                <div class="actions">
                    <button class="btn-icon edit-btn" title="Edit palette" data-set-id="${colorSet.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn-icon export-btn" title="Export" data-set-id="${colorSet.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </button>
                    <button class="btn-icon remove-set-btn" title="Remove color set" data-set-id="${colorSet.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m18 6-12 12"/>
                            <path d="m6 6 12 12"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- Controls for this color set -->
            <div class="color-set-controls" data-set-id="${colorSet.id}" style="display: none;">
                <div class="control-group">
                    <label for="base-color-${colorSet.id}">Base Color</label>
                    <div class="color-input-wrapper">
                        <input type="color" id="base-color-${colorSet.id}" value="${colorSet.baseColor}">
                        <input type="text" id="base-color-text-${colorSet.id}" value="${colorSet.baseColor}" spellcheck="false">
                    </div>
                </div>
                
                <div class="control-group">
                    <label for="palette-type-${colorSet.id}">Type</label>
                    <select id="palette-type-${colorSet.id}">
                        <option value="monochromatic" ${colorSet.paletteType === 'monochromatic' ? 'selected' : ''}>Monochromatic</option>
                        <option value="analogous" ${colorSet.paletteType === 'analogous' ? 'selected' : ''}>Analogous</option>
                        <option value="complementary" ${colorSet.paletteType === 'complementary' ? 'selected' : ''}>Complementary</option>
                        <option value="triadic" ${colorSet.paletteType === 'triadic' ? 'selected' : ''}>Triadic</option>
                        <option value="tetradic" ${colorSet.paletteType === 'tetradic' ? 'selected' : ''}>Tetradic</option>
                        <option value="split-complementary" ${colorSet.paletteType === 'split-complementary' ? 'selected' : ''}>Split Complementary</option>
                    </select>
                </div>

                <div class="control-group">
                    <label for="color-count-${colorSet.id}">Colors</label>
                    <input type="number" id="color-count-${colorSet.id}" min="3" max="20" value="${colorSet.colorCount}">
                </div>

                <div class="control-actions">
                    <button class="btn-secondary randomize-btn" data-set-id="${colorSet.id}">Random</button>
                    <button class="btn-primary generate-btn" data-set-id="${colorSet.id}">Update</button>
                </div>
            </div>
            
            <div class="color-grid" data-set-id="${colorSet.id}">
                <!-- Color swatches will be generated here -->
            </div>
        `;

        // Bind events for this color set
        this.bindColorSetEvents(element, colorSet);
        
        // Render the color grid immediately
        const colorGrid = element.querySelector('.color-grid');
        this.renderColorGrid(colorGrid, colorSet.colors, colorSet.id);
        
        return element;
    }

    updateColorSetElement(element, colorSet) {
        const colorGrid = element.querySelector('.color-grid');
        const paletteName = element.querySelector('.palette-name');
        
        // Update palette name only if it hasn't been customized
        if (!colorSet.customName) {
            const colorName = this.getBaseColorName(colorSet.baseColor);
            const generatedName = this.generatePaletteName(colorName, colorSet.paletteType);
            paletteName.textContent = generatedName;
        }
        
        // Update color grid
        this.renderColorGrid(colorGrid, colorSet.colors, colorSet.id);
    }

    bindColorSetEvents(element, colorSet) {
        const editBtn = element.querySelector('.edit-btn');
        const exportBtn = element.querySelector('.export-btn');
        const removeBtn = element.querySelector('.remove-set-btn');
        const paletteName = element.querySelector('.palette-name');
        
        // Control elements for this color set
        const baseColorInput = element.querySelector(`#base-color-${colorSet.id}`);
        const baseColorText = element.querySelector(`#base-color-text-${colorSet.id}`);
        const paletteType = element.querySelector(`#palette-type-${colorSet.id}`);
        const colorCount = element.querySelector(`#color-count-${colorSet.id}`);
        const generateBtn = element.querySelector('.control-actions .generate-btn');
        const randomizeBtn = element.querySelector('.control-actions .randomize-btn');



        // Color input synchronization
        baseColorInput.addEventListener('input', (e) => {
            baseColorText.value = e.target.value;
            this.updateColorSetFromControls(colorSet.id);
        });

        baseColorText.addEventListener('input', (e) => {
            if (this.isValidHexColor(e.target.value)) {
                baseColorInput.value = e.target.value;
                this.updateColorSetFromControls(colorSet.id);
            }
        });

        // Control events
        paletteType.addEventListener('change', () => this.updateColorSetFromControls(colorSet.id));
        colorCount.addEventListener('input', () => this.updateColorSetFromControls(colorSet.id));

        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.updateColorSetFromControls(colorSet.id, true);
            });
        }
        
        if (randomizeBtn) {
            randomizeBtn.addEventListener('click', () => {
                this.randomizeColorSet(colorSet.id);
            });
        }

        // Action events
        editBtn.addEventListener('click', () => this.toggleEditMode(colorSet.id));
        exportBtn.addEventListener('click', () => this.openExportModal(colorSet));
        removeBtn.addEventListener('click', () => this.removeColorSet(colorSet.id));
        
        // Editable palette name events
        paletteName.addEventListener('focus', () => {
            paletteName.classList.add('editing');
        });
        
        paletteName.addEventListener('blur', () => {
            paletteName.classList.remove('editing');
            this.updateColorSetName(colorSet.id, paletteName.textContent.trim());
        });
        
        paletteName.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                paletteName.blur();
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                const colorName = this.getBaseColorName(colorSet.baseColor);
                const paletteNameText = this.generatePaletteName(colorName, colorSet.paletteType);
                paletteName.textContent = paletteNameText;
                paletteName.blur();
            }
        });
    }

    renderColorGrid(gridElement, colors, setId) {
        gridElement.innerHTML = '';

        colors.forEach((color, index) => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.animationDelay = `${index * 0.02}s`;
            
            const weight = this.calculateTailwindWeight(index, colors.length);
            const contrastRatio = this.getContrastRatio(color);
            
            swatch.innerHTML = `
                <div class="color-display" style="background-color: ${color}">
                    <div class="copy-indicator">Copied!</div>
                    <button class="remove-color-btn" title="Remove color" data-set-id="${setId}" data-index="${index}">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m18 6-12 12"/>
                            <path d="m6 6 12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="color-info">
                    <div class="color-weight">${weight}</div>
                    <div class="color-contrast">${contrastRatio}</div>
                </div>
            `;

            // Add click event for copying color
            const colorDisplay = swatch.querySelector('.color-display');
            colorDisplay.addEventListener('click', () => this.copyColorToClipboard(color, swatch));
            
            // Add click event for removing color
            const removeBtn = swatch.querySelector('.remove-color-btn');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeColorFromSet(setId, index);
            });
            
            gridElement.appendChild(swatch);
        });
    }

    addColorToSet(setId) {
        const colorSet = this.colorSets.find(set => set.id === setId);
        if (!colorSet) return;

        // Add a new color to the set
        const newColor = this.generateNewColor(colorSet);
        colorSet.colors.push(newColor);
        colorSet.colorCount = colorSet.colors.length;
        
        // Update the color count input to reflect the new count
        const element = document.querySelector(`[data-set-id="${setId}"]`);
        if (element) {
            element.querySelector(`#color-count-${setId}`).value = colorSet.colorCount;
        }
        
        // Re-render the color set
        this.renderColorSet(colorSet);
        this.saveToStorage();
        
        this.showNotification('New color added to palette', 'success');
    }

    removeColorFromSet(setId, index) {
        const colorSet = this.colorSets.find(set => set.id === setId);
        if (!colorSet) return;

        if (colorSet.colors.length <= 3) {
            this.showNotification('Minimum 3 colors required', 'warning');
            return;
        }

        colorSet.colors.splice(index, 1);
        colorSet.colorCount = colorSet.colors.length;
        
        // Update the color count input
        const element = document.querySelector(`[data-set-id="${setId}"]`);
        if (element) {
            element.querySelector(`#color-count-${setId}`).value = colorSet.colorCount;
        }
        
        // Re-render the color set
        this.renderColorSet(colorSet);
        this.saveToStorage();
        
        this.showNotification('Color removed from palette', 'success');
    }

    generateNewColor(colorSet) {
        // Generate a new color based on the current palette type
        let newColor;
        switch (colorSet.paletteType) {
            case 'monochromatic':
                newColor = this.generateMonochromatic(colorSet.baseColor, 1)[0];
                break;
            case 'analogous':
                newColor = this.generateAnalogous(colorSet.baseColor, 1)[0];
                break;
            case 'complementary':
                newColor = this.generateComplementary(colorSet.baseColor, 1)[0];
                break;
            case 'triadic':
                newColor = this.generateTriadic(colorSet.baseColor, 1)[0];
                break;
            case 'tetradic':
                newColor = this.generateTetradic(colorSet.baseColor, 1)[0];
                break;
            case 'split-complementary':
                newColor = this.generateSplitComplementary(colorSet.baseColor, 1)[0];
                break;
        }
        
        // Validate the new color to ensure it matches the palette
        const validatedColors = this.validateAndAdjustColors([newColor], colorSet.baseColor);
        return validatedColors[0];
    }

    // Color format conversion utilities
    convertColorFormat(hex, format) {
        switch (format) {
            case 'hex':
                return hex;
            case 'rgb':
                return this.hexToRgbString(hex);
            case 'rgba':
                return this.hexToRgbaString(hex);
            case 'hsl':
                return this.hexToHslString(hex);
            case 'hsla':
                return this.hexToHslaString(hex);
            default:
                return hex;
        }
    }

    hexToRgbString(hex) {
        const [r, g, b] = this.hexToRgb(hex);
        return `rgb(${r}, ${g}, ${b})`;
    }

    hexToRgbaString(hex) {
        const [r, g, b] = this.hexToRgb(hex);
        return `rgba(${r}, ${g}, ${b}, 1)`;
    }

    hexToHslString(hex) {
        const [h, s, l] = this.hexToHsl(hex);
        return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
    }

    hexToHslaString(hex) {
        const [h, s, l] = this.hexToHsl(hex);
        return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, 1)`;
    }

    // Color utility functions
    hexToHsl(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h * 360, s * 100, l * 100];
    }

    hslToHex(h, s, l) {
        h = h / 360;
        s = s / 100;
        l = l / 100;

        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        const toHex = (c) => {
            const hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    isValidHexColor(hex) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }

    // Color palette generation algorithms
    generateMonochromatic(baseColor, count) {
        const [h, s, l] = this.hexToHsl(baseColor);
        const colors = [];
        
        for (let i = 0; i < count; i++) {
            const step = i / (count - 1);
            // Create a more balanced lightness distribution
            const lightness = Math.max(5, Math.min(95, 95 - (step * 90)));
            
            // Keep saturation more consistent but ensure it's not too low for color identification
            const saturation = Math.max(25, Math.min(100, s));
            colors.push(this.hslToHex(h, saturation, lightness));
        }
        
        return colors;
    }

    generateAnalogous(baseColor, count) {
        const [h, s, l] = this.hexToHsl(baseColor);
        const colors = [];
        const hueRange = 60;
        
        for (let i = 0; i < count; i++) {
            const hueOffset = (i - count/2) * (hueRange / count);
            const newHue = (h + hueOffset + 360) % 360;
            // Ensure saturation is high enough for proper color identification
            const newSat = Math.max(35, Math.min(100, s + (Math.random() - 0.5) * 20));
            const newLight = Math.max(20, Math.min(80, l + (Math.random() - 0.5) * 40));
            colors.push(this.hslToHex(newHue, newSat, newLight));
        }
        
        return colors;
    }

    generateComplementary(baseColor, count) {
        const [h, s, l] = this.hexToHsl(baseColor);
        const colors = [];
        
        const halfCount = Math.ceil(count / 2);
        for (let i = 0; i < halfCount; i++) {
            const lightness = Math.max(20, Math.min(80, l + (i - halfCount/2) * (60/halfCount)));
            colors.push(this.hslToHex(h, s, lightness));
        }
        
        const compHue = (h + 180) % 360;
        for (let i = 0; i < count - halfCount; i++) {
            const lightness = Math.max(20, Math.min(80, l + (i - (count - halfCount)/2) * (60/(count - halfCount))));
            colors.push(this.hslToHex(compHue, s, lightness));
        }
        
        return colors;
    }

    generateTriadic(baseColor, count) {
        const [h, s, l] = this.hexToHsl(baseColor);
        const colors = [];
        const hues = [h, (h + 120) % 360, (h + 240) % 360];
        
        for (let i = 0; i < count; i++) {
            const hueIndex = i % 3;
            const baseHue = hues[hueIndex];
            const variation = Math.floor(i / 3);
            const lightness = Math.max(20, Math.min(80, l + (variation - 1) * 20));
            const saturation = Math.max(40, Math.min(100, s + (Math.random() - 0.5) * 20));
            colors.push(this.hslToHex(baseHue, saturation, lightness));
        }
        
        return colors;
    }

    generateTetradic(baseColor, count) {
        const [h, s, l] = this.hexToHsl(baseColor);
        const colors = [];
        const hues = [h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360];
        
        for (let i = 0; i < count; i++) {
            const hueIndex = i % 4;
            const baseHue = hues[hueIndex];
            const variation = Math.floor(i / 4);
            const lightness = Math.max(20, Math.min(80, l + (variation - 1) * 15));
            const saturation = Math.max(40, Math.min(100, s + (Math.random() - 0.5) * 20));
            colors.push(this.hslToHex(baseHue, saturation, lightness));
        }
        
        return colors;
    }

    generateSplitComplementary(baseColor, count) {
        const [h, s, l] = this.hexToHsl(baseColor);
        const colors = [];
        const hues = [h, (h + 150) % 360, (h + 210) % 360];
        
        for (let i = 0; i < count; i++) {
            const hueIndex = i % 3;
            const baseHue = hues[hueIndex];
            const variation = Math.floor(i / 3);
            const lightness = Math.max(20, Math.min(80, l + (variation - 1) * 20));
            const saturation = Math.max(40, Math.min(100, s + (Math.random() - 0.5) * 20));
            colors.push(this.hslToHex(baseHue, saturation, lightness));
        }
        
        return colors;
    }

    validateAndAdjustColors(colors, baseColor) {
        const baseColorName = this.getBaseColorName(baseColor);
        const adjustedColors = [];
        
        colors.forEach((color, index) => {
            let adjustedColor = color;
            const [h, s, l] = this.hexToHsl(color);
            const colorName = this.getBaseColorName(color);
            
            // If the color name doesn't match the base color name, adjust it
            if (colorName !== baseColorName && this.shouldAdjustColor(colorName, baseColorName)) {
                // Adjust the hue to better match the base color
                const baseHue = this.hexToHsl(baseColor)[0];
                const adjustedHue = this.adjustHueToMatchName(h, baseColorName);
                adjustedColor = this.hslToHex(adjustedHue, s, l);
            }
            
            // Ensure minimum saturation for proper color identification
            if (s < 25 && l > 15 && l < 85) {
                const [adjH, adjS, adjL] = this.hexToHsl(adjustedColor);
                adjustedColor = this.hslToHex(adjH, 25, adjL);
            }
            
            adjustedColors.push(adjustedColor);
        });
        
        return adjustedColors;
    }

    shouldAdjustColor(colorName, baseColorName) {
        // Don't adjust if the color is grayscale or if it's already close
        if (['black', 'white', 'gray'].includes(colorName) || 
            ['black', 'white', 'gray'].includes(baseColorName)) {
            return false;
        }
        
        // Don't adjust if the colors are in the same family
        const colorFamilies = {
            'warm': ['red', 'orange', 'yellow'],
            'cool': ['green', 'cyan', 'blue'],
            'neutral': ['purple', 'pink']
        };
        
        for (const [family, colors] of Object.entries(colorFamilies)) {
            if (colors.includes(colorName) && colors.includes(baseColorName)) {
                return false;
            }
        }
        
        return true;
    }

    adjustHueToMatchName(hue, targetColorName) {
        const targetHues = {
            'red': 0,
            'orange': 30,
            'yellow': 60,
            'green': 120,
            'cyan': 180,
            'blue': 240,
            'purple': 300,
            'pink': 330
        };
        
        const targetHue = targetHues[targetColorName];
        if (targetHue === undefined) return hue;
        
        // Calculate the shortest distance to the target hue
        let diff = targetHue - hue;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        
        // Adjust by 50% of the difference to maintain some variation
        return (hue + diff * 0.5 + 360) % 360;
    }

    generatePaletteName(colorName, paletteType) {
        const typeNames = {
            'monochromatic': '',
            'analogous': 'Harmony',
            'complementary': 'Contrast',
            'triadic': 'Balance',
            'tetradic': 'Vibrant',
            'split-complementary': 'Dynamic'
        };
        
        const typeName = typeNames[paletteType] || '';
        const baseName = colorName.charAt(0).toUpperCase() + colorName.slice(1);
        return typeName ? `${baseName} ${typeName}` : baseName;
    }

    formatColorNameForExport(colorName) {
        return colorName.toLowerCase().replace(/\s+/g, '-');
    }

    calculateTailwindWeight(index, total) {
        if (total === 11) {
            const weights = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
            return weights[index];
        } else if (total <= 10) {
            const weights = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
            const step = Math.floor(weights.length / total);
            return weights[Math.min(index * step, weights.length - 1)];
        } else {
            const min = 50;
            const max = 950;
            
            if (total <= 20) {
                const step = (max - min) / (total - 1);
                return Math.round(min + (index * step));
            } else {
                const step = (max - min) / (total - 1);
                return Math.round(min + (index * step));
            }
        }
    }

    getBaseColorName(hex) {
        const [h, s, l] = this.hexToHsl(hex);
        
        // Handle grayscale colors (low saturation)
        if (s < 15) {
            if (l < 20) return 'black';
            if (l > 80) return 'white';
            return 'gray';
        }
        
        // Handle very dark or very light colors
        if (l < 15) return 'black';
        if (l > 85) return 'white';
        
        // Color classification based on hue
        if (h >= 0 && h < 15) return 'red';
        else if (h >= 15 && h < 45) return 'orange';
        else if (h >= 45 && h < 75) return 'yellow';
        else if (h >= 75 && h < 165) return 'green';
        else if (h >= 165 && h < 195) return 'cyan';
        else if (h >= 195 && h < 255) return 'blue';
        else if (h >= 255 && h < 315) return 'purple';
        else if (h >= 315 && h < 345) return 'pink';
        else return 'red'; // Wrap around for 345-360
    }

    getColorName(hex, index, total) {
        const colorName = this.getBaseColorName(hex);
        
        const weight = this.calculateTailwindWeight(index, total);
        return `${colorName}-${weight}`;
    }

    getContrastRatio(hex) {
        const [r, g, b] = this.hexToRgb(hex);
        const luminance = this.calculateLuminance(r, g, b);
        const whiteLuminance = 1.0;
        const contrastRatio = (Math.max(luminance, whiteLuminance) + 0.05) / (Math.min(luminance, whiteLuminance) + 0.05);
        const ratio = parseFloat(contrastRatio.toFixed(2));
        
        return `${ratio}:1`;
    }

    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    }

    calculateLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }



    copyColorToClipboard(color, swatchElement) {
        navigator.clipboard.writeText(color).then(() => {
            const indicator = swatchElement.querySelector('.copy-indicator');
            indicator.classList.add('show');
            setTimeout(() => indicator.classList.remove('show'), 2000);
        });
    }

    toggleEditMode(setId) {
        const element = document.querySelector(`[data-set-id="${setId}"]`);
        if (!element) return;

        const controls = element.querySelector('.color-set-controls');
        const editBtn = element.querySelector('.edit-btn');
        
        if (controls.style.display === 'none') {
            controls.style.display = 'flex';
            editBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"/>
                </svg>
            `;
            editBtn.title = 'Close edit mode';
        } else {
            controls.style.display = 'none';
            editBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
            `;
            editBtn.title = 'Edit palette';
        }
    }

    copyColorSetToClipboard(colorSet) {
        const paletteString = colorSet.colors.join(', ');
        navigator.clipboard.writeText(paletteString).then(() => {
            this.showNotification('Color set copied to clipboard', 'success');
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    openExportModal(colorSet = null) {
        this.currentColorSet = colorSet || this.colorSets[this.colorSets.length - 1];
        document.getElementById('export-modal').classList.add('active');
        
        // Set the current color format in the select element
        document.getElementById('color-format-select').value = this.currentColorFormat;
        
        this.selectExportFormat('css');
    }

    closeExportModal() {
        document.getElementById('export-modal').classList.remove('active');
    }

    selectExportFormat(format) {
        this.currentExportFormat = format;
        
        document.querySelectorAll('.export-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-format="${format}"]`).classList.add('active');
        
        const exportCode = this.generateExportCode(format);
        document.getElementById('export-code').textContent = exportCode;
        this.saveToStorage();
    }

    selectColorFormat(format) {
        this.currentColorFormat = format;
        
        // Update the select element
        document.getElementById('color-format-select').value = format;
        
        // Regenerate export code with new color format
        const exportCode = this.generateExportCode(this.currentExportFormat);
        document.getElementById('export-code').textContent = exportCode;
        this.saveToStorage();
    }

    generateExportCode(format) {
        switch (format) {
            case 'css':
                return this.generateCSSExport();
            case 'scss':
                return this.generateSCSSExport();
            case 'json':
                return this.generateJSONExport();
            case 'tailwind':
                return this.generateTailwindExport();
            default:
                return '';
        }
    }

    generateCSSExport() {
        if (!this.currentColorSet) return '';
        
        const colorName = this.currentColorSet.customName || this.generatePaletteName(
            this.getBaseColorName(this.currentColorSet.baseColor),
            this.currentColorSet.paletteType
        );
        
        const exportName = this.formatColorNameForExport(colorName);
        
        let css = ':root {\n';
        this.currentColorSet.colors.forEach((color, index) => {
            const weight = this.calculateTailwindWeight(index, this.currentColorSet.colors.length);
            const formattedColor = this.convertColorFormat(color, this.currentColorFormat);
            css += `  --${exportName}-${weight}: ${formattedColor};\n`;
        });
        css += '}';
        return css;
    }

    generateSCSSExport() {
        if (!this.currentColorSet) return '';
        
        const colorName = this.currentColorSet.customName || this.generatePaletteName(
            this.getBaseColorName(this.currentColorSet.baseColor),
            this.currentColorSet.paletteType
        );
        
        const exportName = this.formatColorNameForExport(colorName);
        
        let scss = `// ${colorName.charAt(0).toUpperCase() + colorName.slice(1)} Color Palette\n`;
        this.currentColorSet.colors.forEach((color, index) => {
            const weight = this.calculateTailwindWeight(index, this.currentColorSet.colors.length);
            const formattedColor = this.convertColorFormat(color, this.currentColorFormat);
            scss += `$${exportName}-${weight}: ${formattedColor};\n`;
        });
        return scss;
    }

    generateJSONExport() {
        if (!this.currentColorSet) return '';
        
        const colorName = this.currentColorSet.customName || this.generatePaletteName(
            this.getBaseColorName(this.currentColorSet.baseColor),
            this.currentColorSet.paletteType
        );
        
        const exportName = this.formatColorNameForExport(colorName);
        
        const palette = {};
        this.currentColorSet.colors.forEach((color, index) => {
            const weight = this.calculateTailwindWeight(index, this.currentColorSet.colors.length);
            const formattedColor = this.convertColorFormat(color, this.currentColorFormat);
            palette[weight] = formattedColor;
        });
        return JSON.stringify({ [exportName]: palette }, null, 2);
    }

    generateTailwindExport() {
        if (!this.currentColorSet) return '';
        
        const colorName = this.currentColorSet.customName || this.generatePaletteName(
            this.getBaseColorName(this.currentColorSet.baseColor),
            this.currentColorSet.paletteType
        );
        
        const exportName = this.formatColorNameForExport(colorName);
        
        let config = 'module.exports = {\n';
        config += '  theme: {\n';
        config += '    extend: {\n';
        config += '      colors: {\n';
        config += `        ${exportName}: {\n`;
        this.currentColorSet.colors.forEach((color, index) => {
            const weight = this.calculateTailwindWeight(index, this.currentColorSet.colors.length);
            const formattedColor = this.convertColorFormat(color, this.currentColorFormat);
            config += `          ${weight}: '${formattedColor}',\n`;
        });
        config += '        }\n';
        config += '      }\n';
        config += '    }\n';
        config += '  }\n';
        config += '}';
        return config;
    }

    copyExportCode() {
        const code = document.getElementById('export-code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            const btn = document.getElementById('copy-export-btn');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => btn.innerHTML = originalHTML, 2000);
        });
    }

    // Export all palettes functionality
    exportAllPalettes() {
        if (this.colorSets.length === 0) {
            this.showNotification('No palettes to export', 'warning');
            return;
        }

        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            colorSets: this.colorSets,
            metadata: {
                totalPalettes: this.colorSets.length,
                totalColors: this.colorSets.reduce((sum, set) => sum + set.colors.length, 0)
            }
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `color-palettes-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
        this.showNotification('All palettes exported successfully', 'success');
    }

    // Import palettes functionality
    handleImportFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            this.showNotification('Please select a valid JSON file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                this.importPalettes(importData);
            } catch (error) {
                console.error('Error parsing import file:', error);
                this.showNotification('Invalid file format. Please select a valid export file.', 'error');
            }
        };
        reader.readAsText(file);

        // Reset the file input
        event.target.value = '';
    }

    importPalettes(importData) {
        // Validate the import data structure
        if (!importData.colorSets || !Array.isArray(importData.colorSets)) {
            this.showNotification('Invalid file format. Missing color sets data.', 'error');
            return;
        }

        // Check if we should merge or replace existing palettes
        if (this.colorSets.length > 0) {
            this.showImportConfirmationModal(importData);
        } else {
            this.processImport(importData, false);
        }
    }

    showImportConfirmationModal(importData) {
        const modal = document.getElementById('import-confirmation-modal');
        const backdrop = document.getElementById('import-modal-backdrop');
        const closeBtn = document.getElementById('import-modal-close');
        const cancelBtn = document.getElementById('import-cancel-btn');
        const actionBtn = document.getElementById('import-action-btn');

        // Show modal
        modal.classList.add('active');

        // Update button text based on radio selection
        const updateButtonText = () => {
            const selectedRadio = document.querySelector('input[name="import-action"]:checked');
            if (selectedRadio) {
                const selectedValue = selectedRadio.value;
                const newText = selectedValue === 'merge' ? 'Merge' : 'Replace';
                actionBtn.textContent = newText;
                console.log('Button text updated to:', newText);
            }
        };

        // Initialize button text
        updateButtonText();

        // Action handler function
        const handleAction = () => {
            const selectedValue = document.querySelector('input[name="import-action"]:checked').value;
            closeModal();
            this.processImport(importData, selectedValue === 'merge');
        };

        // Close modal handlers
        const closeModal = () => {
            modal.classList.remove('active');
        };

        // Add event listeners
        backdrop.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        actionBtn.addEventListener('click', handleAction);

        // Simple approach - use a global event listener that doesn't get cleaned up
        const handleRadioChange = () => {
            const selectedRadio = document.querySelector('input[name="import-action"]:checked');
            console.log('handleRadioChange called, selectedRadio:', selectedRadio);
            if (selectedRadio && actionBtn) {
                const selectedValue = selectedRadio.value;
                const newText = selectedValue === 'merge' ? 'Merge' : 'Replace';
                console.log('Setting button text from', actionBtn.textContent, 'to', newText);
                actionBtn.textContent = newText;
                // Force a re-render
                actionBtn.style.display = 'none';
                actionBtn.offsetHeight; // Force reflow
                actionBtn.style.display = '';
                console.log('Button text updated to:', newText);
            } else {
                console.log('Missing elements:', { selectedRadio, actionBtn });
            }
        };

        // Add event listeners to radio buttons with immediate feedback
        const radioButtons = modal.querySelectorAll('input[name="import-action"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', handleRadioChange);
            radio.addEventListener('click', (e) => {
                // Immediate update
                const newText = e.target.value === 'merge' ? 'Merge' : 'Replace';
                actionBtn.textContent = newText;
                console.log('Immediate update to:', newText);
                // Also call the full handler
                setTimeout(handleRadioChange, 10);
            });
        });

        // Also add to the labels for better UX
        const labels = modal.querySelectorAll('label.import-option');
        labels.forEach(label => {
            label.addEventListener('click', () => {
                setTimeout(handleRadioChange, 50);
            });
        });

        // Add a mutation observer to see if something is changing the button text
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.target === actionBtn) {
                    console.log('Button content changed by mutation:', actionBtn.textContent);
                }
            });
        });
        
        observer.observe(actionBtn, { childList: true, subtree: true });
    }

    processImport(importData, shouldMerge) {

        let importedCount = 0;
        let skippedCount = 0;

        if (shouldMerge) {
            // Merge mode: add imported palettes to existing ones
            importData.colorSets.forEach(importedSet => {
                // Check if a palette with the same name already exists
                const existingSet = this.colorSets.find(set => 
                    (set.customName && set.customName === importedSet.customName) ||
                    (!set.customName && !importedSet.customName && 
                     set.baseColor === importedSet.baseColor && 
                     set.paletteType === importedSet.paletteType)
                );

                if (existingSet) {
                    skippedCount++;
                } else {
                    // Assign a new ID to avoid conflicts
                    importedSet.id = this.nextSetId++;
                    this.colorSets.push(importedSet);
                    importedCount++;
                }
            });
        } else {
            // Replace mode: clear existing and add imported
            this.colorSets = [];
            this.nextSetId = 1;
            
            importData.colorSets.forEach(importedSet => {
                importedSet.id = this.nextSetId++;
                this.colorSets.push(importedSet);
                importedCount++;
            });
        }

        // Clear the DOM and re-render all color sets
        const container = document.getElementById('color-sets-container');
        container.innerHTML = '';

        this.colorSets.forEach(colorSet => {
            // Ensure colors are generated if they're missing
            if (!colorSet.colors || colorSet.colors.length === 0) {
                this.generateColorSet(colorSet);
            }
            this.renderColorSet(colorSet);
        });

        this.markCurrentSet();
        this.saveToStorage();

        // Show import results
        let message = `Successfully imported ${importedCount} palette${importedCount !== 1 ? 's' : ''}`;
        if (skippedCount > 0) {
            message += ` (${skippedCount} duplicate${skippedCount !== 1 ? 's' : ''} skipped)`;
        }
        this.showNotification(message, 'success');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ColorThemer();
});
