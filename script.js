class WheelOfFortune {
    constructor(canvasId, buttonId, resultId, sectionsListId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.spinButton = document.getElementById(buttonId);
        this.resultDiv = document.getElementById(resultId);
        this.sectionsList = document.getElementById(sectionsListId);

        // Set canvas size
        this.setCanvasSize();

        this.rotation = 0;
        this.angularVelocity = 0;
        this.isSpinning = false;

        // Physics properties
        this.friction = 0.98; // Deceleration factor (closer to 1 = less friction)
        this.minVelocity = 0.001; // Minimum velocity before stopping

        // Configurable sections - will be loaded from HTML
        this.sections = [];

        this.init();
    }

    setCanvasSize() {
        // Get the container width
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth - 40, 600);

        // Set canvas display size
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';

        // Set canvas actual size (for retina displays)
        const scale = window.devicePixelRatio || 1;
        this.canvas.width = size * scale;
        this.canvas.height = size * scale;

        // Reset and scale the context to match (important: get fresh context after size change)
        this.ctx = this.canvas.getContext('2d');
        this.ctx.scale(scale, scale);

        // Update wheel properties (use display size, not canvas buffer size)
        this.centerX = size / 2;
        this.centerY = size / 2;
        this.radius = size / 2 - 30;
    }

    init() {
        // Load sections from HTML
        this.loadSectionsFromHTML();
        this.drawWheel();
        this.spinButton.addEventListener('click', () => this.spin());

        // Handle window resize
        window.addEventListener('resize', () => {
            this.setCanvasSize();
            this.drawWheel();
        });
    }

    generateBrightNeonColor() {
        // Generate bright, neon colors with high saturation and lightness
        const hue = Math.floor(Math.random() * 360);
        const saturation = 70 + Math.floor(Math.random() * 30); // 70-100%
        const lightness = 50 + Math.floor(Math.random() * 20); // 50-70%
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    loadSectionsFromHTML() {
        const items = this.sectionsList.querySelectorAll('.section-item[data-text]');
        this.sections = Array.from(items).map(item => ({
            text: item.getAttribute('data-text'),
            color: this.generateBrightNeonColor()
        }));
    }

    wrapText(words, maxWidth) {
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + ' ' + words[i];
            const testWidth = this.ctx.measureText(testLine).width;
            
            if (testWidth > maxWidth) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);
        
        return lines;
    }

    renderSectionsList() {
        this.sectionsList.innerHTML = '';
        console.log('Rendering sections list with', this.sections.length, 'sections');

        this.sections.forEach((section, index) => {
            const sectionItem = document.createElement('div');
            sectionItem.className = 'section-item';

            // Color indicator (non-editable)
            const colorIndicator = document.createElement('span');
            colorIndicator.className = 'color-indicator';
            colorIndicator.style.backgroundColor = section.color;

            // Text label (non-editable)
            const textLabel = document.createElement('span');
            textLabel.className = 'section-label';
            textLabel.textContent = section.text;

            sectionItem.appendChild(colorIndicator);
            sectionItem.appendChild(textLabel);
            this.sectionsList.appendChild(sectionItem);
        });
    }

    drawWheel() {
        const numSections = this.sections.length;
        const anglePerSection = (Math.PI * 2) / numSections;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context state
        this.ctx.save();

        // Move to center and rotate
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.rotate(this.rotation);

        // Draw each section
        for (let i = 0; i < numSections; i++) {
            const startAngle = i * anglePerSection;
            const endAngle = startAngle + anglePerSection;

            // Draw section
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.radius, startAngle, endAngle);
            this.ctx.lineTo(0, 0);
            this.ctx.fillStyle = this.sections[i].color;
            this.ctx.fill();

            // Draw section border
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();

            // Draw text
            this.ctx.save();
            this.ctx.rotate(startAngle + anglePerSection / 2);
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#fff';
            
            // Adjust font size based on text length and available space
            const text = this.sections[i].text;
            const maxWidth = this.radius * 0.5; // Maximum width for text
            let fontSize = 18;
            
            // Reduce font size for longer text
            if (text.length > 15) {
                fontSize = 14;
            }
            if (text.length > 20) {
                fontSize = 12;
            }
            
            this.ctx.font = `bold ${fontSize}px Arial`;
            
            // Measure text width and adjust if needed
            let textWidth = this.ctx.measureText(text).width;
            if (textWidth > maxWidth) {
                // Try wrapping text into multiple lines
                const words = text.split(' ');
                if (words.length > 1) {
                    const lines = this.wrapText(words, maxWidth);
                    const lineHeight = fontSize + 2;
                    const totalHeight = lines.length * lineHeight;
                    const startY = -totalHeight / 2 + lineHeight / 2;
                    
                    lines.forEach((line, index) => {
                        this.ctx.fillText(line, this.radius * 0.65, startY + index * lineHeight);
                    });
                } else {
                    // Single long word - just reduce font size more
                    while (textWidth > maxWidth && fontSize > 8) {
                        fontSize -= 1;
                        this.ctx.font = `bold ${fontSize}px Arial`;
                        textWidth = this.ctx.measureText(text).width;
                    }
                    this.ctx.fillText(text, this.radius * 0.65, 5);
                }
            } else {
                this.ctx.fillText(text, this.radius * 0.65, 5);
            }
            
            this.ctx.restore();
        }

        // Draw center circle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
        this.ctx.fillStyle = '#333';
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Restore context state
        this.ctx.restore();
    }

    spin() {
        if (this.isSpinning) return;

        this.isSpinning = true;
        this.spinButton.disabled = true;
        this.resultDiv.textContent = '';

        // Set initial angular velocity (random between 0.3 and 0.5 radians per frame)
        this.angularVelocity = Math.random() * 0.2 + 0.3;

        // Start animation
        this.animate();
    }

    animate() {
        if (!this.isSpinning) return;

        // Apply friction
        this.angularVelocity *= this.friction;

        // Update rotation
        this.rotation += this.angularVelocity;

        // Normalize rotation to 0-2π range
        this.rotation = this.rotation % (Math.PI * 2);

        // Redraw wheel
        this.drawWheel();

        // Check if wheel should stop
        if (this.angularVelocity < this.minVelocity) {
            this.stopSpinning();
        } else {
            requestAnimationFrame(() => this.animate());
        }
    }

    stopSpinning() {
        this.isSpinning = false;
        this.angularVelocity = 0;
        this.spinButton.disabled = false;

        // Calculate which section won
        const winningSection = this.getWinningSection();
        this.displayResult(winningSection);
    }

    getWinningSection() {
        // The pointer is at the top (pointing down at 3π/2 or -π/2)
        // We need to calculate which section is under the pointer
        const numSections = this.sections.length;
        const anglePerSection = (Math.PI * 2) / numSections;

        // The pointer points down from the top, which is at angle -π/2 (or 3π/2)
        // Sections are drawn starting from angle 0 (right side) going counter-clockwise
        // We need to find which section aligns with the pointer after rotation
        const pointerAngle = -Math.PI / 2; // Top of wheel pointing down
        const normalizedRotation = ((pointerAngle - this.rotation) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);

        // Find which section
        const sectionIndex = Math.floor(normalizedRotation / anglePerSection);

        return this.sections[sectionIndex];
    }

    displayResult(section) {
        this.resultDiv.textContent = `You got: ${section.text}!`;
        this.resultDiv.style.color = section.color;
    }
}

// Tab switching functionality
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Initialize the wheels when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initTabs();

    const activityWheel = new WheelOfFortune(
        'activityWheelCanvas',
        'activitySpinButton',
        'activityResult',
        'activitySectionsList'
    );

    const durationWheel = new WheelOfFortune(
        'durationWheelCanvas',
        'durationSpinButton',
        'durationResult',
        'durationSectionsList'
    );
});
