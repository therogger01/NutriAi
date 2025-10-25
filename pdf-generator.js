// pdf-generator.js
// PDF Generation for NutriAI Estimator

/**
 * Generate a nutrition report PDF with uploaded image, nutrition data, and charts
 * @param {Object} nutritionData - The nutrition data object
 * @param {String} foodImageSrc - Data URL of the food image (if available)
 */
function generateNutritionPDF(nutritionData, foodImageSrc = null) {
    // Define PDF document
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    // Document constants
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = margin;
    
    // Add decorative background elements
    // Modern gradient background
    const gradientColors = [
        [240, 249, 255],
        [235, 245, 255],
        [230, 240, 255],
        [225, 235, 255]
    ];
    
    // Create smooth gradient effect
    const gradientHeight = pageHeight * 0.35;
    const colorSteps = gradientColors.length;
    const stepHeight = gradientHeight / colorSteps;
    
    gradientColors.forEach((color, index) => {
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(0, index * stepHeight, pageWidth, stepHeight, 'F');
    });
    
    // Add modern wave pattern
    doc.setFillColor(245, 250, 255);
    for(let x = 0; x < pageWidth; x += 10) {
        const amplitude = 5;
        const frequency = 0.05;
        const y1 = amplitude * Math.sin(frequency * x);
        const y2 = amplitude * Math.sin(frequency * (x + 10));
        doc.setLineWidth(0.2);
        doc.setDrawColor(230, 240, 250);
        doc.line(x, y1 + 40, x + 10, y2 + 40);
    }
    
    // Enhanced logo design
    // Outer circle with gradient
    const logoX = margin + 12;
    const logoY = 17;
    const logoRadius = 12;
    
    // Create circular gradient effect for logo
    for(let r = logoRadius; r > 0; r--) {
        // Use solid colors with decreasing intensity instead of opacity
        const intensity = Math.floor(((r / logoRadius) * 0.8 + 0.2) * 255);
        doc.setFillColor(13, 110, 253);
        doc.circle(logoX, logoY, r, 'F');
    }
    
    // Add modern fork icon
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1.2);
    
    // Draw stylized fork
    const forkX = logoX - 3;
    const forkY = logoY - 6;
    
    // Fork handle
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(forkX - 1, forkY, 8, 12, 1, 1, 'F');
    
    // Fork tines
    [0, 3, 6].forEach(offset => {
        doc.line(forkX + offset, forkY, forkX + offset, forkY + 7);
        // Add tine tips
        doc.circle(forkX + offset, forkY, 0.5, 'F');
    });
    
    // Enhanced header background with modern gradient
    doc.setFillColor(13, 110, 253);
    doc.roundedRect(0, 0, pageWidth, 35, 3, 3, 'F');
    
    // Add subtle pattern to header using solid colors instead of opacity
    for(let x = 0; x < pageWidth; x += 20) {
        for(let y = 0; y < 35; y += 20) {
            doc.setFillColor(80, 150, 255);
            doc.circle(x + (y % 40) / 2, y, 0.5, 'F');
        }
    }
    
    // Add dynamic accent line with solid colors
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    for(let x = 0; x < pageWidth; x += 4) {
        const y = 32 + Math.sin(x * 0.1) * 2;
        doc.line(x, y, x + 2, y);
    }
    
    // Enhanced title text with shadow effect
    // Shadow
    doc.setTextColor(200, 200, 200); // Light gray instead of black with opacity
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('NutriAI Food Analysis Report', margin + 25.5, 17.5);
    
    // Main text
    doc.setTextColor(255);
    doc.text('NutriAI Food Analysis Report', margin + 25, 17);
    
    // Add subtitle ribbon
    doc.setFillColor(0, 80, 200);
    doc.rect(0, 35, pageWidth, 8, 'F');
    
    // Add date and time to ribbon
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(240);
    const dateText = `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
    doc.text(dateText, pageWidth - margin, 40, { align: 'right' });
    
    // Start content below header
    yPos = 55;
    
    // Add decorative divider
    drawDivider(doc, margin, yPos - 5, contentWidth);
    
    // Add food name/title with enhanced styling
    doc.setTextColor(13, 110, 253);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const foodName = nutritionData.identifiedFood || 'Unknown Food';
    doc.text(`Food Analysis: ${foodName}`, margin, yPos);
    
    // Add decorative underline
    doc.setDrawColor(13, 110, 253);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos + 3, margin + doc.getTextWidth(`Food Analysis: ${foodName}`) * 0.7, yPos + 3);
    
    yPos += 12;
    
    // Add serving information with icon
    doc.setFillColor(13, 110, 253);
    doc.circle(margin + 4, yPos - 3, 2, 'F');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Serving Size: `, margin + 9, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${nutritionData.servingSize || '100'}${nutritionData.servingUnit || 'g'}`, margin + 35, yPos);
    
    yPos += 10;
    
    // Add food image if available with enhanced frame
    if (foodImageSrc) {
        try {
            // Frame for the image
            doc.setFillColor(248, 249, 250);
            doc.setDrawColor(200, 200, 200);
            doc.roundedRect(margin - 2, yPos - 2, contentWidth + 4, 66, 3, 3, 'FD');
            
            // Add image
            const imgWidth = contentWidth;
            const imgHeight = 60; // Fixed height for consistency
            
            doc.addImage(foodImageSrc, 'JPEG', margin, yPos, imgWidth, imgHeight);
            
            // Add decorative corners to the image
            drawImageCorners(doc, margin, yPos, imgWidth, imgHeight);
            
            yPos += imgHeight + 6;
            
            // Add stylish caption for the image
            doc.setFillColor(230, 240, 255); // Light blue instead of using opacity
            doc.roundedRect(margin + contentWidth/4, yPos - 4, contentWidth/2, 10, 5, 5, 'F');
            
            doc.setFontSize(9);
            doc.setTextColor(80, 80, 80);
            doc.text('Analyzed Food Image', pageWidth / 2, yPos, { align: 'center' });
            
            yPos += 12;
        } catch (error) {
            console.error('Error adding image to PDF:', error);
        }
    }
    
    // Create nutrition facts table
    doc.setDrawColor(13, 110, 253);
    doc.setLineWidth(1);
    doc.line(margin, yPos - 1, margin + 60, yPos - 1);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 110, 253);
    doc.text('Nutrition Facts', margin, yPos + 6);
    
    doc.setDrawColor(13, 110, 253);
    doc.setLineWidth(1);
    doc.line(margin, yPos + 8, margin + 60, yPos + 8);
    
    yPos += 15;
    
    // Create nutrition table data
    const tableColumn = ["Nutrient", "Amount"];
    const tableRows = [
        ["Calories", `${Math.round(nutritionData.calories || 0)} kcal`],
        ["Protein", `${nutritionData.protein?.toFixed(1) || 0} g`],
        ["Fat", `${nutritionData.fat?.toFixed(1) || 0} g`],
        ["Carbohydrates", `${nutritionData.carbs?.toFixed(1) || 0} g`],
        ["Fiber", `${nutritionData.fiber_g?.toFixed(1) || 0} g`],
        ["Sugar", `${nutritionData.sugar_g?.toFixed(1) || 0} g`],
        ["Sodium", `${nutritionData.sodium_mg?.toFixed(1) || 0} mg`]
    ];
    
    // Enhanced auto table styling
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
        margin: { left: margin },
        theme: 'grid',
        headStyles: { 
            fillColor: [13, 110, 253],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 12
        },
        bodyStyles: {
            fontSize: 11
        },
        alternateRowStyles: {
            fillColor: [240, 248, 255]
        },
        columnStyles: {
            0: { fontStyle: 'bold' },
            1: { halign: 'right' }
        },
        styles: {
            lineColor: [220, 230, 240],
            lineWidth: 0.2,
            cellPadding: 4,
            font: 'helvetica'
        },
        tableLineWidth: 1,
        tableLineColor: [13, 110, 253]
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Add decorative element
    drawDivider(doc, margin, yPos - 5, contentWidth);
    
    // Check if we need a new page for charts
    if (yPos > pageHeight - 100) {
        doc.addPage();
        
        // Add light background to new page
        doc.setFillColor(250, 252, 255);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Add subtle dot pattern to background
        doc.setFillColor(230, 240, 250);
        for(let x = 5; x < pageWidth; x += 8) {
            for(let y = 5; y < pageHeight; y += 8) {
                if((x + y) % 16 === 0) {
                    doc.circle(x, y, 0.5, 'F');
                }
            }
        }
        
        // Add page header
        doc.setFillColor(13, 110, 253);
        doc.rect(0, 0, pageWidth, 12, 'F');
        doc.setTextColor(255);
        doc.setFontSize(9);
        doc.text(`NutriAI Analysis for ${foodName} - Page 2`, pageWidth / 2, 8, { align: 'center' });
        
        yPos = margin + 5;
    }
    
    // Add nutrition distribution chart with enhanced styling
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 110, 253);
    doc.text('Macronutrient Distribution', margin, yPos + 6);
    
    // Add decorative line under title
    doc.setDrawColor(13, 110, 253);
    doc.setLineWidth(1);
    doc.line(margin, yPos + 8, margin + 80, yPos + 8);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos + 10, margin + contentWidth, yPos + 10);
    
    yPos += 16;
    
    // Add card background for chart
    doc.setFillColor(250, 252, 255);
    doc.setDrawColor(220, 230, 240);
    doc.roundedRect(margin - 5, yPos - 5, contentWidth + 10, 100, 3, 3, 'FD');
    
    // Create a larger canvas for better quality Chart.js pie chart
    const canvas = document.createElement('canvas');
    canvas.width = 1200; // Even larger dimensions for better quality
    canvas.height = 1200;
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
    
    // Calculate macronutrient percentages
    const protein = nutritionData.protein || 0;
    const fat = nutritionData.fat || 0;
    const carbs = nutritionData.carbs || 0;
    const totalMacros = protein + fat + carbs;
    
    // Calculate macronutrient calories
    const proteinCals = protein * 4;
    const fatCals = fat * 9;
    const carbsCals = carbs * 4;
    const totalCals = proteinCals + fatCals + carbsCals;
    
    const proteinPct = totalCals > 0 ? (proteinCals / totalCals * 100).toFixed(1) : 0;
    const fatPct = totalCals > 0 ? (fatCals / totalCals * 100).toFixed(1) : 0;
    const carbsPct = totalCals > 0 ? (carbsCals / totalCals * 100).toFixed(1) : 0;
    
    // Set white background to ensure chart visibility
    const ctx = canvas.getContext('2d');
    
    // More vibrant Gen Z color palette
    const chartColors = {
        protein: 'rgba(0, 187, 249, 1)',     // Bright cyan
        fat: 'rgba(255, 64, 129, 1)',        // Vibrant pink
        carbs: 'rgba(255, 193, 7, 1)'        // Bright amber
    };
    
    // Draw modern card background with shadow effect
    doc.setFillColor(240, 242, 245);
    doc.roundedRect(margin - 6, yPos - 6, contentWidth + 12, 102, 10, 10, 'F');
    
    // Main background - white with slight blue tint
    doc.setFillColor(252, 253, 255);
    doc.roundedRect(margin - 3, yPos - 3, contentWidth + 6, 96, 8, 8, 'F');
    
    // Generate custom doughnut chart directly with Canvas API for more control
    const chartSuccess = generateDoughnutChart(ctx, chartColors, proteinCals, fatCals, carbsCals);
    
    // Better chart generation with timeout to ensure complete rendering
    setTimeout(() => {
        try {
            // Get chart as image after ensuring it's fully rendered
            const chartImg = canvas.toDataURL('image/png', 1.0);
            
            // Add the chart image to the PDF - make it narrower to leave room for breakdown
            doc.addImage(chartImg, 'PNG', margin, yPos, contentWidth/2 - 10, 80);
            
            // Remove the canvas to clean up
            document.body.removeChild(canvas);
            
            // --- Clean Gen Z Energy Breakdown Section ---
            // Position it on the right side of the chart for better layout
            
            // Define container for calorie breakdown
            const breakdownX = margin + contentWidth/2; // Position to the right of chart
            const breakdownY = yPos;
            const breakdownWidth = contentWidth/2;
            const breakdownHeight = 80; // Match chart height
            
            // Draw modern container
            doc.setFillColor(248, 250, 255);
            doc.roundedRect(breakdownX, breakdownY, breakdownWidth, breakdownHeight, 8, 8, 'F');
            
            // Add section title with vibrant styling
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(13, 110, 253);
            doc.text('ENERGY', breakdownX + 10, breakdownY + 12);
            
            // Make calorie badge larger and more centered
            doc.setFillColor(50, 50, 50);
            // Wider and taller badge with more rounded corners
            doc.roundedRect(breakdownX + breakdownWidth/2 - 45, breakdownY + 1, 90, 22, 10, 10, 'F');
            
            // Make calorie text more prominent and centered
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            // Center the text properly in the badge
            doc.text(`${Math.round(totalCals)} CALORIES`, breakdownX + breakdownWidth/2, breakdownY + 15, { align: 'center' });
            
            // Define modern, clean segmented bar
            const barX = breakdownX + 10;
            const barY = breakdownY + 25;
            const barWidth = breakdownWidth - 20;
            const barHeight = 12;
            
            // Draw bar background
            doc.setFillColor(240, 240, 240);
            doc.roundedRect(barX, barY, barWidth, barHeight, 6, 6, 'F');
            
            // Calculate segment widths
            const proteinSegmentWidth = (proteinCals / totalCals) * barWidth;
            const fatSegmentWidth = (fatCals / totalCals) * barWidth;
            const carbsSegmentWidth = (carbsCals / totalCals) * barWidth;
            
            // Colors for macronutrients
            const macroColors = {
                protein: [0, 187, 249],      // Electric blue
                fat: [255, 64, 129],         // Hot pink
                carbs: [255, 193, 7]         // Vibrant gold
            };
            
            // Draw protein segment (first segment with rounded left corner)
            if (proteinSegmentWidth > 0) {
                doc.setFillColor(macroColors.protein[0], macroColors.protein[1], macroColors.protein[2]);
                // Use simple roundedRect with standard parameters instead of array corner radii
                if (proteinSegmentWidth > barWidth * 0.95) {
                    // If it's almost full width, use full rounded corners
                    doc.roundedRect(barX, barY, proteinSegmentWidth, barHeight, 6, 6, 'F');
                } else {
                    // First create a rectangle for the main part
                    doc.rect(barX + 6, barY, proteinSegmentWidth - 6, barHeight, 'F');
                    // Then add a rounded cap on the left
                    doc.roundedRect(barX, barY, 12, barHeight, 6, 6, 'F');
                }
            }
            
            // Draw fat segment (middle segment)
            if (fatSegmentWidth > 0) {
                doc.setFillColor(macroColors.fat[0], macroColors.fat[1], macroColors.fat[2]);
                doc.rect(barX + proteinSegmentWidth, barY, fatSegmentWidth, barHeight, 'F');
            }
            
            // Draw carbs segment (last segment with rounded right corner)
            if (carbsSegmentWidth > 0) {
                doc.setFillColor(macroColors.carbs[0], macroColors.carbs[1], macroColors.carbs[2]);
                if (proteinSegmentWidth + fatSegmentWidth + carbsSegmentWidth >= barWidth - 0.1) {
                    // If it ends at the right edge, add rounded cap
                    const carbsX = barX + proteinSegmentWidth + fatSegmentWidth;
                    // First create a rectangle for the main part
                    if (carbsSegmentWidth > 12) {
                        doc.rect(carbsX, barY, carbsSegmentWidth - 6, barHeight, 'F');
                        // Then add a rounded cap on the right
                        doc.roundedRect(carbsX + carbsSegmentWidth - 12, barY, 12, barHeight, 6, 6, 'F');
                    } else {
                        // If segment is too small, just use a simple rectangle
                        doc.rect(carbsX, barY, carbsSegmentWidth, barHeight, 'F');
                    }
                } else {
                    doc.rect(barX + proteinSegmentWidth + fatSegmentWidth, barY, carbsSegmentWidth, barHeight, 'F');
                }
            }
            
            // Add percentage labels if wide enough
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            if (proteinSegmentWidth > 20) {
                doc.text(`${proteinPct}%`, barX + proteinSegmentWidth/2, barY + barHeight/2 + 3, { align: 'center' });
            }
            if (fatSegmentWidth > 20) {
                doc.text(`${fatPct}%`, barX + proteinSegmentWidth + fatSegmentWidth/2, barY + barHeight/2 + 3, { align: 'center' });
            }
            if (carbsSegmentWidth > 20) {
                doc.text(`${carbsPct}%`, barX + proteinSegmentWidth + fatSegmentWidth + carbsSegmentWidth/2, barY + barHeight/2 + 3, { align: 'center' });
            }
            
            // Add clean macro cards - stacked vertically for better layout
            const cardY = barY + barHeight + 7;
            const cardHeight = 15;
            const cardSpacing = 17;
            
            // Function to draw clean macro card
            function drawMacroCard(y, emoji, label, value, pct, color) {
                // Draw icon and label - completely eliminate any special characters or symbols from rendered text
                doc.setTextColor(color[0], color[1], color[2]);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                
                // No symbol prefix, just clean text
                doc.text(label, barX, y);
                
                // Draw amount and percentage
                doc.setFont('helvetica', 'normal');
                doc.text(`${value.toFixed(1)}g (${pct}%)`, barX + barWidth - 10, y, { align: 'right' });
                
                // Draw mini progress bar
                const miniBarY = y + 4;
                const miniBarHeight = 4;
                
                // Background
                doc.setFillColor(240, 240, 240);
                doc.rect(barX, miniBarY, barWidth, miniBarHeight, 'F');
                
                // Fill - ensure width is calculated properly
                doc.setFillColor(color[0], color[1], color[2]);
                // Make sure pct is treated as a number and capped at 100%
                const percentValue = Math.min(parseFloat(pct) || 0, 100);
                const fillWidth = (percentValue / 100) * barWidth;
                
                if (fillWidth > 0) {
                    // Use simple rect for the fill to avoid any issues
                    doc.rect(barX, miniBarY, fillWidth, miniBarHeight, 'F');
                }
            }
            
            // Draw macro cards with NO symbols - clean text only
            drawMacroCard(cardY, '', 'PROTEIN', protein, proteinPct, macroColors.protein);
            drawMacroCard(cardY + cardSpacing, '', 'FATS', fat, fatPct, macroColors.fat);
            drawMacroCard(cardY + cardSpacing * 2, '', 'CARBS', carbs, carbsPct, macroColors.carbs);
            
            // Update yPos based on the larger of chart or breakdown section
            yPos += Math.max(80, breakdownHeight) + 5;
            
            // Remove the blue line - skip the divider call
            // drawModernDivider(doc, margin, yPos, contentWidth); // Commented out to remove the blue line
            yPos += 15;
            
            // Add health score section with modern visualization
            if (nutritionData.health_score !== undefined) {
                // Add modern section title
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(13, 110, 253);
                doc.text('Nutritional Health Score', margin, yPos);
                
                // Add modern gradient underline - avoid using opacity
                const titleWidth = doc.getTextWidth('Nutritional Health Score');
                const gradientSteps = 20;
                const stepWidth = titleWidth / gradientSteps;
                
                for(let i = 0; i < gradientSteps; i++) {
                    const intensity = Math.floor((1 - (i / gradientSteps) * 0.7) * 255);
                    doc.setDrawColor(13, 110, 253);
                    doc.setLineWidth(2);
                    doc.line(margin + (i * stepWidth), yPos + 2, margin + ((i + 1) * stepWidth), yPos + 2);
                }
                
                yPos += 15;
                
                // Create modern card container with white background
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(margin - 6, yPos - 6, contentWidth + 12, 92, 10, 10, 'F');
                
                // Add dark border
                doc.setDrawColor(40, 44, 52);
                doc.setLineWidth(1);
                doc.roundedRect(margin - 6, yPos - 6, contentWidth + 12, 92, 10, 10, 'S');
                
                // Get the health score value, ensure it's a number
                const score = parseInt(nutritionData.health_score) || 0;
                const scoreColor = getGenZHealthScoreColor(score);
                
                // Draw a modern circular gauge
                const centerX = margin + 50;
                const centerY = yPos + 40;
                const radius = 30;
                
                // Draw gauge background with modern styling
                doc.setDrawColor(230, 230, 230);
                doc.setLineWidth(8);
                doc.circle(centerX, centerY, radius, 'S');
                
                // Draw gauge fill with modern styling
                if (score > 0) {
                    const startAngle = -Math.PI / 2; // Start from top
                    const endAngle = startAngle + (Math.PI * 2 * (score / 100));
                    
                    // Draw colored arc
                    doc.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2]);
                    doc.setLineWidth(8);
                    
                    // Draw arc segment by segment for smooth curve
                    const segments = 50;
                    const angleStep = (endAngle - startAngle) / segments;
                    
                    for(let i = 0; i < segments; i++) {
                        const segStartAngle = startAngle + (i * angleStep);
                        const segEndAngle = segStartAngle + angleStep;
                        
                        const startX = centerX + radius * Math.cos(segStartAngle);
                        const startY = centerY + radius * Math.sin(segStartAngle);
                        const endX = centerX + radius * Math.cos(segEndAngle);
                        const endY = centerY + radius * Math.sin(segEndAngle);
                        
                        doc.line(startX, startY, endX, endY);
                    }
                }
                
                // Add score text in center with modern styling
                doc.setFontSize(28);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
                const scoreText = `${score}`;
                const scoreWidth = doc.getTextWidth(scoreText);
                doc.text(scoreText, centerX - (scoreWidth/2), centerY + 2);
                
                // Add small "out of 100" text with modern styling
                doc.setFontSize(10);
                doc.text('/100', centerX + (scoreWidth/2) + 1, centerY + 1);
                
                // Add health message in modern card with white background
                const messageX = margin + 120;
                const messageWidth = contentWidth - 130;
                
                // Create modern message container
                doc.setFillColor(245, 247, 250);
                doc.roundedRect(messageX, yPos + 10, messageWidth, 60, 8, 8, 'F');
                
                // Add accent border
                doc.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2]);
                doc.setLineWidth(0.8);
                doc.roundedRect(messageX, yPos + 10, messageWidth, 60, 8, 8, 'S');
                
                // Add message title with modern styling
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
                doc.text('Nutrition Insight', messageX + 10, yPos + 25);
                
                // Add health message with modern icon
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(60, 60, 60);
                
                let healthMessage = '';
                
                if (score >= 80) {
                    healthMessage = 'Excellent nutritional profile! This food is nutrient-dense and well-balanced.';
                } else if (score >= 60) {
                    healthMessage = 'Good nutritional profile. This food provides decent nutrition.';
                } else if (score >= 40) {
                    healthMessage = 'Average nutritional profile. Consider balancing with other nutritious foods.';
                } else {
                    healthMessage = 'This food is more indulgent than nutritious. Best enjoyed in moderation.';
                }
                
                // Avoid using any emoji or special characters
                // Just draw a colored bullet point instead of an emoji
                doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
                doc.circle(messageX + 6, yPos + 42, 3, 'F');
                
                // Add message with modern styling - with adequate spacing after the bullet
                doc.setFontSize(10);
                doc.setTextColor(60, 60, 60);
                const splitMessage = doc.splitTextToSize(healthMessage, messageWidth - 30);
                doc.text(splitMessage, messageX + 15, yPos + 45);
                
                yPos += 100;
            }
            
            // Add modern footer
            const footerY = pageHeight - 15;
            
            // Add modern footer background with solid colors
            const footerGradientSteps = 15;
            const footerStepHeight = 20 / footerGradientSteps;
            
            for(let i = 0; i < footerGradientSteps; i++) {
                // Use decreasing intensity instead of opacity
                const intensity = Math.floor((0.05 - (i / footerGradientSteps) * 0.03) * 255);
                doc.setFillColor(240, 245, 255);
                doc.rect(0, footerY - 10 + (i * footerStepHeight), pageWidth, footerStepHeight, 'F');
            }
            
            // Add modern separator line - avoid opacity
            doc.setDrawColor(13, 110, 253);
            doc.setLineWidth(0.5);
            doc.line(0, footerY - 10, pageWidth, footerY - 10);
            
            // Add footer text with modern styling
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text('Generated by NutriAI Estimator • nutritional values are estimates • not for medical purposes', pageWidth / 2, footerY, { align: 'center' });
            
            // Add document info with modern styling
            doc.setFontSize(8);
            doc.text(`Report for: ${foodName}`, 15, footerY, { align: 'left' });
            doc.text(`${new Date().toLocaleDateString()}`, pageWidth - 15, footerY, { align: 'right' });
            
            // Save the PDF with enhanced filename
            const safeFileName = foodName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
            doc.save(`NutriAI-Report-${safeFileName}.pdf`);
            
        } catch (error) {
            console.error('Error with chart generation:', error);
            // Save PDF even if chart fails
            doc.save(`NutriAI-Report-${foodName.replace(/\s+/g, '-')}.pdf`);
        }
    }, 600); // Increased timeout to ensure rendering completes
}

/**
 * Draw a decorative divider line
 */
function drawDivider(doc, x, y, width) {
    // Draw main line
    doc.setDrawColor(13, 110, 253, 0.5);
    doc.setLineWidth(0.5);
    doc.line(x, y, x + width, y);
    
    // Add decorative circle in the middle
    doc.setFillColor(13, 110, 253);
    doc.circle(x + width/2, y, 1.5, 'F');
    
    // Add small ticks on the sides
    doc.setLineWidth(1);
    doc.line(x, y, x + 5, y);
    doc.line(x + width - 5, y, x + width, y);
}

/**
 * Draw decorative corners for images
 */
function drawImageCorners(doc, x, y, width, height) {
    const cornerSize = 8;
    const cornerThickness = 1.5;
    
    doc.setDrawColor(13, 110, 253);
    doc.setLineWidth(cornerThickness);
    
    // Top-left corner
    doc.line(x, y + cornerSize, x, y);
    doc.line(x, y, x + cornerSize, y);
    
    // Top-right corner
    doc.line(x + width - cornerSize, y, x + width, y);
    doc.line(x + width, y, x + width, y + cornerSize);
    
    // Bottom-left corner
    doc.line(x, y + height - cornerSize, x, y + height);
    doc.line(x, y + height, x + cornerSize, y + height);
    
    // Bottom-right corner
    doc.line(x + width - cornerSize, y + height, x + width, y + height);
    doc.line(x + width, y + height, x + width, y + height - cornerSize);
}

/**
 * Draw a modern divider line that appeals to Gen Z
 */
function drawModernDivider(doc, x, y, width) {
    // Draw gradient line with solid colors
    const gradientSteps = 20;
    const stepWidth = width / gradientSteps;
    
    for(let i = 0; i < gradientSteps; i++) {
        // Use intensity instead of opacity
        const intensity = Math.floor((0.5 - (i / gradientSteps) * 0.3) * 255);
        doc.setDrawColor(13, 110, 253);
        doc.setLineWidth(2);
        doc.line(x + (i * stepWidth), y, x + ((i + 1) * stepWidth), y);
    }
    
    // Add modern emoji decorative element
    doc.setFontSize(10);
    doc.text('✨', x + width/2 - 3, y + 1);
}

/**
 * Draw a properly clipped legend item that ensures bars stay within their container
 */
function drawClippedLegendItem(doc, x, y, width, label, value, unit, percentage, colorHex) {
    // Extract RGB from color hex/rgba string
    let r, g, b;
    if (colorHex.startsWith('rgba')) {
        const matches = colorHex.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
        if (matches) {
            r = parseInt(matches[1]);
            g = parseInt(matches[2]);
            b = parseInt(matches[3]);
        }
    } else {
        r = 54;
        g = 162;
        b = 235;
    }
    
    // Calculate widths to ensure everything fits
    const pillWidth = 35;
    const labelWidth = doc.getTextWidth(`${label}: ${value} ${unit}`);
    const availableWidth = width - pillWidth - labelWidth - 10;
    const maxBarWidth = Math.min(availableWidth, 60);
    
    // Draw modern pill-shaped color indicator
    doc.setFillColor(r, g, b);
    doc.roundedRect(x, y - 3, pillWidth, 6, 3, 3, 'F');
    
    // Add percentage text on pill with white text
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`${percentage}%`, x + 7, y);
    
    // Draw label and value with dark text for contrast
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.text(`${label}:`, x + pillWidth + 5, y);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`${value} ${unit}`, x + pillWidth + 5 + doc.getTextWidth(`${label}: `), y);
    
    // Draw percentage bar with proper clipping within container
    const barWidth = maxBarWidth;
    const barHeight = 5;
    const cornerRadius = barHeight/2;
    const barX = x + pillWidth + 5;
    
    // Light gray background for progress bar
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(barX, y + 3, barWidth, barHeight, cornerRadius, cornerRadius, 'F');
    
    // Fill portion with solid color for better visibility
    if (percentage > 0) {
        const fillWidth = Math.min(percentage, 100) * barWidth / 100; // Scale to fit within barWidth
        doc.setFillColor(r, g, b);
        
        // Always use rect for progress fill to avoid rounded rect issues
        doc.rect(barX, y + 3, fillWidth, barHeight, 'F');
    }
}

/**
 * Generate the doughnut chart with proper full rendering
 */
function generateDoughnutChart(ctx, chartColors, proteinCals, fatCals, carbsCals) {
    // Clear the canvas completely first
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Set solid white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Calculate total for percentages
    const totalCals = proteinCals + fatCals + carbsCals;
    if (totalCals === 0) return false;
    
    // Calculate angles for each segment
    const proteinAngle = (proteinCals / totalCals) * Math.PI * 2;
    const fatAngle = (fatCals / totalCals) * Math.PI * 2;
    const carbsAngle = (carbsCals / totalCals) * Math.PI * 2;
    
    // Chart dimensions
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const outerRadius = Math.min(centerX, centerY) * 0.6;
    const innerRadius = outerRadius * 0.65; // For doughnut hole
    
    // Start drawing from the top (negative Y axis)
    let startAngle = -Math.PI / 2;
    
    // Function to draw a segment
    function drawSegment(angle, color) {
        if (angle <= 0) return;
        
        const endAngle = startAngle + angle;
        
        ctx.beginPath();
        // Draw outer arc
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        // Draw inner arc
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        
        ctx.fillStyle = color;
        ctx.fill();
        
        startAngle = endAngle;
    }
    
    // Draw segments in order
    drawSegment(proteinAngle, chartColors.protein);
    drawSegment(fatAngle, chartColors.fat);
    drawSegment(carbsAngle, chartColors.carbs);
    
    return true;
}

/**
 * Get vibrant Gen Z friendly color for health score
 */
function getGenZHealthScoreColor(score) {
    if (score >= 80) return [76, 209, 55]; // Vibrant green
    if (score >= 60) return [0, 176, 255]; // Bright blue
    if (score >= 40) return [255, 179, 0]; // Bright orange
    return [255, 64, 129]; // Hot pink for low scores
}

export { generateNutritionPDF }; 
