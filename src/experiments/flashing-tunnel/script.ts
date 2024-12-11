import p5 from 'p5';

const sketch = (p: p5) => {
    const colorSpeed = 0.002; // Adjust speed for color cycling
    let screenWidth = 400;
    let screenHeight = 400;
    let numBorders = 7; // Number of shapes
    let palette: p5.Color[] = [];
    let innerStartingWidth: number;
    let innerStartingHeight: number;

    // Control speeds
    const borderIncreaseRate = 0.8; // Rate at which numBorders increases (lower is slower)
    const sizeDecreaseRate = 0.92; // Multiplicative factor for size reduction (closer to 1 is slower)

    function setup() {
    screenWidth = p.windowWidth;
    screenHeight = p.windowHeight;
    p.createCanvas(screenWidth, screenHeight);

    // Initialize the palette
    // palette = [
    //   color(218, 165, 32), // Gold
    //   color(72, 61, 139), // Dark slate blue
    //   color(255, 69, 0),  // Red
    //   color(0, 128, 128), // Teal
    //   color(255, 255, 255) // White
    // ];

    // Sunset Glow
    palette = [
        p.color(255, 94, 77), // Bright red
        p.color(255, 159, 67), // Orange
        p.color(255, 221, 89), // Golden yellow
        p.color(144, 190, 109), // Soft green
        p.color(69, 123, 157), // Deep teal
    ];

    // Neon Dreams
    //   palette = [
    //   color(46, 255, 164),  // Neon green
    //   color(255, 73, 255),  // Bright magenta
    //   color(73, 255, 255),  // Neon cyan
    //   color(255, 144, 46),  // Neon orange
    //   color(18, 18, 18)     // Dark black-gray
    // ];

    // Initial dimensions for the inner starting size
    innerStartingWidth = screenWidth * 0.75;
    innerStartingHeight = screenHeight * 0.75;
    }

    function draw() {
        p.background("black");
        p.cursor(p.CROSS);

    // Adjust parameters if mouse is pressed
    if (p.mouseIsPressed) {
        // Increase numBorders at a controlled rate
        numBorders = p.min(25, numBorders + borderIncreaseRate);

        // Gradually decrease size with a controlled rate
        innerStartingWidth = p.max(100, innerStartingWidth * sizeDecreaseRate);
        innerStartingHeight = p.max(100, innerStartingHeight * sizeDecreaseRate);
    } else {
        // Reset to default if mouse is not pressed
        numBorders = 7;
        innerStartingWidth = screenWidth * 0.75;
        innerStartingHeight = screenHeight * 0.75;
    }

    // Time factor for cycling through colors
    let colorTime = p.millis() * colorSpeed;

    for (let i = 1; i <= Math.floor(numBorders); i++) {
        const borderColor = calcBorderColor(i, colorTime, palette);

        // Dimensions for each border
        const innerWidth = p.lerp(innerStartingWidth, screenWidth, i / numBorders);
        const innerHeight = p.lerp(innerStartingHeight, screenHeight, i / numBorders);

        // Draw the border with calculated dimensions and color
        drawBorderFromOrigin(p.mouseX, p.mouseY, innerWidth, innerHeight, borderColor);
    }
    }

    function calcBorderColor(idx: number, colorTime: number, palette: p5.Color[]) {
    // Calculate color index and ensure it's valid
        let index = p.floor(
        (((colorTime - idx / numBorders) % palette.length) + palette.length) %
            palette.length
        );
        let nextIndex = (index + 1) % palette.length;
        let blendFactor = (((colorTime - idx / numBorders) % 1) + 1) % 1;

        // Interpolated color
        const borderColor = p.lerpColor(
        palette[index],
        palette[nextIndex],
        blendFactor
        );
    
        return borderColor;
    }

    function drawBorderFromOrigin(
    originX: number,
    originY: number,
    innerWidth: number,
    innerHeight: number,
    fillColor: p5.Color
    ) {
        p.beginShape();

        p.fill(fillColor);
        p.noStroke();

        // Exterior vertices, clockwise winding
        p.vertex(0, 0); // top left
        p.vertex(screenWidth, 0); // top right
        p.vertex(screenWidth, screenHeight); // bottom right
        p.vertex(0, screenHeight); // bottom left

        // Interior bounds
        const leftBound = p.constrain(
            originX - innerWidth * 0.5,
            0,
            screenWidth - innerWidth
        );
        const rightBound = p.constrain(
            originX + innerWidth * 0.5,
            innerWidth,
            screenWidth
        );
        const topBound = p.constrain(
            originY - innerHeight * 0.5,
            0,
            screenHeight - innerHeight
        );
        const bottomBound = p.constrain(
            originY + innerHeight * 0.5,
            innerHeight,
            screenHeight
        );

        // Interior vertices, counter-clockwise winding
        p.beginContour();
        p.vertex(rightBound, topBound); // top right
        p.vertex(leftBound, topBound); // top left
        p.vertex(leftBound, bottomBound); // bottom left
        p.vertex(rightBound, bottomBound); // bottom right
        p.endContour();

        p.endShape(p.CLOSE);
    }

    // Handle window resizing
function windowResized() {
    screenWidth = p.windowWidth;
    screenHeight = p.windowHeight;
    p.resizeCanvas(screenWidth, screenHeight);

    // Reset starting dimensions for responsiveness
    innerStartingWidth = screenWidth * 0.75;
    innerStartingHeight = screenHeight * 0.75;
}

  p.setup = setup;

  p.draw = draw;

  p.windowResized = windowResized;
};

// Initialize the p5.js instance
new p5(sketch);
