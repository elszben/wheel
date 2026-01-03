class WheelOfFortune {
    constructor(canvasId, buttonId, resultId, sectionsListId, addSectionButtonId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.spinButton = document.getElementById(buttonId);
        this.resultDiv = document.getElementById(resultId);
        this.sectionsList = document.getElementById(sectionsListId);
        this.addSectionButton = document.getElementById(addSectionButtonId);

        // Wheel properties
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = 220;
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

    init() {
        // Load sections from HTML
        this.loadSectionsFromHTML();
        this.drawWheel();
        this.renderSectionsList();
        this.spinButton.addEventListener('click', () => this.spin());
        this.addSectionButton.addEventListener('click', () => this.addSection());
    }

    loadSectionsFromHTML() {
        const items = this.sectionsList.querySelectorAll('.section-item[data-text]');
        this.sections = Array.from(items).map(item => ({
            text: item.getAttribute('data-text'),
            color: item.getAttribute('data-color')
        }));
    }

    renderSectionsList() {
        this.sectionsList.innerHTML = '';
        console.log('Rendering sections list with', this.sections.length, 'sections');

        this.sections.forEach((section, index) => {
            const sectionItem = document.createElement('div');
            sectionItem.className = 'section-item';

            // Color picker
            const colorPicker = document.createElement('input');
            colorPicker.type = 'color';
            colorPicker.value = section.color;
            colorPicker.className = 'color-picker';
            colorPicker.addEventListener('input', (e) => {
                this.sections[index].color = e.target.value;
                this.drawWheel();
            });

            // Text input
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.value = section.text;
            textInput.className = 'section-text';
            textInput.addEventListener('input', (e) => {
                this.sections[index].text = e.target.value;
                this.drawWheel();
            });

            // Delete button with trash icon
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>
            `;
            deleteButton.className = 'delete-button';
            deleteButton.title = 'Delete section';
            deleteButton.addEventListener('click', () => {
                console.log('Delete button clicked for index', index);
                if (this.sections.length > 2) {
                    this.sections.splice(index, 1);
                    this.renderSectionsList();
                    this.drawWheel();
                } else {
                    alert('You must have at least 2 sections!');
                }
            });

            sectionItem.appendChild(colorPicker);
            sectionItem.appendChild(textInput);
            sectionItem.appendChild(deleteButton);
            this.sectionsList.appendChild(sectionItem);
        });
    }

    addSection() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F38181', '#AA96DA'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        this.sections.push({
            text: `Prize ${this.sections.length + 1}`,
            color: randomColor
        });

        this.renderSectionsList();
        this.drawWheel();
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
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillText(this.sections[i].text, this.radius * 0.65, 5);
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
        'activitySectionsList',
        'addActivitySectionButton'
    );

    const durationWheel = new WheelOfFortune(
        'durationWheelCanvas',
        'durationSpinButton',
        'durationResult',
        'durationSectionsList',
        'addDurationSectionButton'
    );
});
