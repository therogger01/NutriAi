// script.js
document.addEventListener('DOMContentLoaded', () => {
    try {
        const fileUploadContainer = document.querySelector('.file-upload-container');
        const fileInput = document.querySelector('#file');
        const loadingOverlay = document.getElementById('loading-overlay');
        const form = document.getElementById('analyze-form');
        const heroSection = document.querySelector('.hero-section');
        const cardElements = document.querySelectorAll('.card');
        const submitButton = document.querySelector('.submit-button');
        const imagePreview = document.getElementById('imagePreview');
        const removeImageButton = document.getElementById('removeImageButton');
        const fileInputText = document.querySelector('.file-input-text');
        const themeToggleButton = document.getElementById('theme-toggle-button');
        const themeIcon = document.getElementById('theme-icon');
        const progressSteps = document.querySelectorAll('.progress-step');
        const progressLines = document.querySelectorAll('.progress-line');
        const tipsPopup = document.getElementById('tips-popup');
        const closeTipButton = document.getElementById('close-tip');
        const showTipsButton = document.getElementById('show-tips');
        const tipContent = document.getElementById('tip-content');
        const selectImageLink = document.querySelector('.select-image-link');
        const progressBar = document.querySelector('.progress-bar');
        const header = document.querySelector('.header');
        const featureBadges = document.querySelectorAll('.feature-badge');
        
        // Store the analyzed result and image for PDF generation
        let lastAnalysisResult = null;
        let lastUploadedImage = null;
        
        // Import PDF generator
        import('./pdf-generator.js')
            .then(module => {
                window.generateNutritionPDF = module.generateNutritionPDF;
            })
            .catch(error => {
                console.error('Error loading PDF generator:', error);
            });
        
        // Tips array
        const tips = [
            "For best results, take clear photos in good lighting.",
            "You can describe multiple ingredients in your food for more accurate analysis.",
            "Specify the serving size for more precise nutritional information.",
            "Dark mode can help reduce eye strain when using the app at night.",
            "You can upload images directly by dragging and dropping them.",
            "The more detailed your food description, the more accurate the analysis.",
            "Try to capture your food from directly above for best recognition.",
            "Make sure your entire dish is visible in the photo for accurate analysis."
        ];
        
        // --- Header Scroll Effect ---
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
        
        // --- Feature Badges Animation ---
        featureBadges.forEach((badge, index) => {
            setTimeout(() => {
                badge.classList.add('fade-in');
            }, 300 + (index * 150));
        });
        
        // --- Progress Indicator Functions ---
        function updateProgress(step) {
            progressSteps.forEach((progressStep, index) => {
                if (index < step) {
                    progressStep.classList.add('completed');
                    progressStep.classList.remove('active');
                } else if (index === step) {
                    progressStep.classList.add('active');
                    progressStep.classList.remove('completed');
                } else {
                    progressStep.classList.remove('active', 'completed');
                }
            });
            
            progressLines.forEach((line, index) => {
                if (index < step) {
                    line.classList.add('active');
                } else {
                    line.classList.remove('active');
                }
            });
        }
        
        // Initialize at step 1
        updateProgress(0);
        
        // --- Tips Popup Functions ---
        function showRandomTip() {
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            tipContent.textContent = randomTip;
            tipsPopup.classList.remove('hidden');
            
            // Auto-hide after 8 seconds
            setTimeout(() => {
                tipsPopup.classList.add('hidden');
            }, 8000);
        }
        
        // Show a random tip on page load with a delay
        setTimeout(showRandomTip, 3000);
        
        // Close tip button
        closeTipButton.addEventListener('click', () => {
            tipsPopup.classList.add('hidden');
        });
        
        // Show tips button
        showTipsButton.addEventListener('click', (e) => {
            e.preventDefault();
            showRandomTip();
        });
        
        // Select image link
        selectImageLink.addEventListener('click', (e) => {
            e.preventDefault();
            fileInput.click();
        });
        
        // Create loading text element
        const loadingText = document.querySelector('.loading-text');
        
        // --- Fade In Elements on Load ---
        heroSection.classList.add('fade-in');

        cardElements.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in');
            }, 150 * index);
        });
        
        setTimeout(() => {
            submitButton.classList.add('fade-in');
        }, 400);

        // --- Drag and Drop Functionality ---
        fileUploadContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadContainer.classList.add('dragover');
        });

        fileUploadContainer.addEventListener('dragleave', () => {
            fileUploadContainer.classList.remove('dragover');
        });

        fileUploadContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadContainer.classList.remove('dragover');
            fileInput.files = e.dataTransfer.files;
            handleImageUpload(fileInput.files[0]);
        });

        // --- Clickable Upload Container ---
        fileUploadContainer.addEventListener('click', () => {
            fileInput.click();
        });

        // --- Handle File Input Change ---
        fileInput.addEventListener('change', function() {
            handleImageUpload(this.files[0]);
            updateProgress(1); // Move to step 2 when image is uploaded
        });

        // --- Handle Image Upload ---
        function handleImageUpload(file) {
            if (file) {
                const reader = new FileReader();

                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.classList.remove('hidden');
                    removeImageButton.classList.remove('hidden');
                    fileInputText.classList.add('hidden');
                    
                    // Store the image data URL for PDF generation
                    lastUploadedImage = e.target.result;
                }

                reader.readAsDataURL(file);
            } else {
                resetImagePreview();
            }
        }

        // --- Remove Image Preview ---
        removeImageButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering the container click
            resetImagePreview();
            fileInput.value = '';
            updateProgress(0); // Reset to step 1
            
            // Clear the stored image
            lastUploadedImage = null;
        });

        function resetImagePreview() {
            imagePreview.classList.add('hidden');
            removeImageButton.classList.add('hidden');
            fileInputText.classList.remove('hidden');
            imagePreview.src = '#';
        }

        // --- Form Submission with API Call ---
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Update progress to step 2 (Analysis)
            updateProgress(1);
            
            // Get loading elements
            const loadingText = document.querySelector('.loading-text');
            
            // Show loading overlay
            loadingOverlay.classList.remove('hidden');
            
            // Reset and start progress bar animation
            progressBar.style.width = '0%';
            
            try {
                // Import analyzeFood function
                const { analyzeFood } = await import('./core.js');
                
                // Start progress animation
                progressBar.style.width = '20%';
                loadingText.textContent = 'Initializing food analysis...';
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Begin image processing
                progressBar.style.width = '40%';
                loadingText.textContent = 'Processing image...';
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Begin food recognition
                progressBar.style.width = '60%';
                loadingText.textContent = 'Identifying food...';
                await new Promise(resolve => setTimeout(resolve, 400));
                
                // Begin nutritional analysis
                progressBar.style.width = '75%';
                loadingText.textContent = 'Analyzing nutritional content...';
                const result = await analyzeFood();
                
                // Store the result for PDF generation
                lastAnalysisResult = result;
                
                // Analysis complete
                progressBar.style.width = '90%';
                loadingText.textContent = 'Preparing results...';
                
                // Update progress to step 3 (Results)
                updateProgress(2);
                
                // Display results
                await displayResults(result);
                
                // Complete the progress bar
                progressBar.style.width = '100%';
                loadingText.textContent = 'Analysis complete!';
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Show success notification
                showNotification('Analysis complete!', 'success');
                
            } catch (error) {
                console.error('Error analyzing food:', error);
                progressBar.style.width = '100%';
                loadingText.textContent = 'Error analyzing food';
                showNotification(error.message || 'Failed to analyze food. Please try again.', 'error');
                
                // Reset progress on error
                updateProgress(0);
            } finally {
                // Wait for final animation before hiding overlay
                await new Promise(resolve => setTimeout(resolve, 500));
                loadingOverlay.classList.add('hidden');
                
                // Reset progress bar for next use
                setTimeout(() => {
                    progressBar.style.width = '0%';
                    loadingText.textContent = 'Analyzing your food...';
                }, 300);
            }
        });

        // Function to display results
        async function displayResults(result) {
            // Remove any existing results section
            const existingResults = document.querySelector('.results-section');
            if (existingResults) {
                existingResults.remove();
            }
            
            // Create new results section
            const resultsSection = document.createElement('section');
            resultsSection.className = 'results-section card';
            
            // Add identified food information
            resultsSection.innerHTML = `
                <h2>Food Analysis Results</h2>
                <div class="identified-food">
                    <h3>Identified Food</h3>
                    <div class="food-name">${result.identifiedFood}</div>
                </div>
                <div id="results-container">
                    <h3>Nutritional Information</h3>
                    <table class="nutrition-table">
                        <tr>
                            <th>Nutrient</th>
                            <th>Amount</th>
                        </tr>
                        <tr>
                            <td>Calories</td>
                            <td class="nutrition-value">${result.calories || 'N/A'} kcal</td>
                        </tr>
                        <tr>
                            <td>Protein</td>
                            <td class="nutrition-value">${result.protein || 'N/A'} g</td>
                        </tr>
                        <tr>
                            <td>Fat</td>
                            <td class="nutrition-value">${result.fat || 'N/A'} g</td>
                        </tr>
                        <tr>
                            <td>Carbohydrates</td>
                            <td class="nutrition-value">${result.carbs || 'N/A'} g</td>
                        </tr>
                        <tr>
                            <td>Fiber</td>
                            <td class="nutrition-value">${result.fiber_g || 'N/A'} g</td>
                        </tr>
                        <tr>
                            <td>Sugar</td>
                            <td class="nutrition-value">${result.sugar_g || 'N/A'} g</td>
                        </tr>
                        <tr>
                            <td>Sodium</td>
                            <td class="nutrition-value">${result.sodium_mg || 'N/A'} mg</td>
                        </tr>
                    </table>
                    <div class="actions-container">
                        <button type="button" class="action-button" id="save-results">
                            <i class="fa-solid fa-save"></i> Save Results
                        </button>
                        <button type="button" class="action-button" id="share-results">
                            <i class="fa-solid fa-share-alt"></i> Share
                        </button>
                    </div>
                </div>
            `;
            
            // Add the results section after the form
            form.parentNode.after(resultsSection);
            
            // Show the results section with animation
            setTimeout(() => {
                resultsSection.classList.add('visible');
            }, 100);
            
            // Scroll to results
            setTimeout(() => {
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
            
            // Add event listeners to action buttons
            setTimeout(() => {
                const saveButton = document.getElementById('save-results');
                const shareButton = document.getElementById('share-results');
                
                if (saveButton) {
                    saveButton.addEventListener('click', () => {
                        // Show loading overlay for PDF generation
                        loadingOverlay.classList.remove('hidden');
                        const loadingText = document.querySelector('.loading-text');
                        loadingText.textContent = 'Generating PDF report...';
                        
                        // Reset and animate progress bar
                        progressBar.style.width = '0%';
                        
                        // Create animation sequence for PDF generation
                        (async function animatePdfGeneration() {
                            try {
                                // Start progress animation
                                progressBar.style.width = '30%';
                                loadingText.textContent = 'Creating document...';
                                await new Promise(resolve => setTimeout(resolve, 300));
                                
                                // Charts generation step
                                progressBar.style.width = '60%';
                                loadingText.textContent = 'Generating charts...';
                                await new Promise(resolve => setTimeout(resolve, 400));
                                
                                // Finalizing step
                                progressBar.style.width = '85%';
                                loadingText.textContent = 'Finalizing report...';
                                
                                // Call PDF generation function if available
                                if (window.generateNutritionPDF && lastAnalysisResult) {
                                    // Call with slight delay to allow progress animation
                                    setTimeout(() => {
                                        window.generateNutritionPDF(lastAnalysisResult, lastUploadedImage);
                                        
                                        // Complete progress bar
                                        progressBar.style.width = '100%';
                                        loadingText.textContent = 'PDF generated successfully!';
                                        
                                        // Hide the loading overlay after a short delay
                                        setTimeout(() => {
                                            loadingOverlay.classList.add('hidden');
                                            
                                            // Reset progress bar for next use
                                            setTimeout(() => {
                                                progressBar.style.width = '0%';
                                                loadingText.textContent = 'Analyzing your food...';
                                            }, 300);
                                            
                                            // Show success notification
                                            showNotification('PDF report generated and downloaded!', 'success');
                                        }, 800);
                                    }, 300);
                                } else {
                                    throw new Error('PDF generator not available');
                                }
                            } catch (error) {
                                console.error('Error generating PDF:', error);
                                loadingOverlay.classList.add('hidden');
                                showNotification('Could not generate PDF report. Please try again.', 'error');
                                
                                // Reset progress bar for next use
                                setTimeout(() => {
                                    progressBar.style.width = '0%';
                                    loadingText.textContent = 'Analyzing your food...';
                                }, 300);
                            }
                        })();
                    });
                }
                
                if (shareButton) {
                    shareButton.addEventListener('click', () => {
                        showNotification('Sharing functionality coming soon!', 'info');
                    });
                }
            }, 500);
        }

        // Function to show notifications
        function showNotification(message, type = 'info') {
            // Remove any existing notification
            const existingNotification = document.querySelector('.notification');
            if (existingNotification) {
                existingNotification.remove();
            }
            
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            
            // Add icon based on type
            let icon = 'fa-info-circle';
            if (type === 'success') icon = 'fa-check-circle';
            if (type === 'error') icon = 'fa-exclamation-circle';
            
            notification.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
            
            // Add to body
            document.body.appendChild(notification);
            
            // Show notification
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            // Hide notification after 5 seconds
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 5000);
        }
        
        // --- Theme Toggle Functionality ---
        themeToggleButton.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark-theme');
            const isDarkMode = document.documentElement.classList.contains('dark-theme');
            
            // Update icon based on theme
            if (isDarkMode) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                themeToggleButton.setAttribute('aria-label', 'Switch to Light Mode');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                themeToggleButton.setAttribute('aria-label', 'Switch to Dark Mode');
            }
            
            // Store theme preference
            localStorage.setItem('theme', isDarkMode ? 'dark-theme' : 'light-theme');
        });

        // --- Check and Set Initial Theme Preference on Load ---
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark-theme') {
            document.documentElement.classList.add('dark-theme');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            themeToggleButton.setAttribute('aria-label', 'Switch to Light Mode');
        }
        
        // --- Feedback Link ---
        const feedbackLink = document.getElementById('feedback-link');
        if (feedbackLink) {
            feedbackLink.addEventListener('click', (e) => {
                e.preventDefault();
                showNotification('Feedback form will be available soon!', 'info');
            });
        }
        
        // --- Add CSS for action buttons ---
        const style = document.createElement('style');
        style.textContent = `
            .actions-container {
                display: flex;
                justify-content: center;
                gap: 1rem;
                margin-top: 2rem;
            }
            
            .action-button {
                background-color: var(--card-bg);
                color: var(--accent-color);
                border: 1px solid var(--accent-color);
                border-radius: 50px;
                padding: 0.7rem 1.2rem;
                font-size: 0.9rem;
                font-weight: 500;
                cursor: pointer;
                transition: all var(--transition-fast);
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .action-button:hover {
                background-color: var(--accent-color);
                color: white;
                transform: translateY(-2px);
                box-shadow: var(--shadow-sm);
            }
            
            @media (max-width: 480px) {
                .actions-container {
                    flex-direction: column;
                    align-items: center;
                }
                
                .action-button {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;
        document.head.appendChild(style);
        
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});

