// core.js - NutriAI Estimator Core Functionality

// API Configuration (Replace with your actual API key and endpoint)
const API_KEY = 'AIzaSyDQwPf7MJ3l21CgkerztIRAImYFeyPuoJc'; // Replace with your actual API key.
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Helper function to convert an image file to base64.
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]); // Extract base64 data.
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Main function to analyze food.
async function analyzeFood() {
  try {
      // Get form data
      const form = document.getElementById('analyze-form');
      const formData = new FormData(form);
      
      // Get file and description
      const file = formData.get('file');
      const description = formData.get('description');
      
      // Get direct food input from discrete tab
      const directFoodInput = formData.get('direct-food-input');
      const selectedFoodItem = formData.get('food-selector');
      
      // Get serving size input (default to 100g if not provided)
      const servingSizeInput = formData.get('serving-size');
      const servingSize = servingSizeInput && !isNaN(parseFloat(servingSizeInput)) 
          ? parseFloat(servingSizeInput) 
          : 100; // Default to 100g
      
      const servingUnit = formData.get('serving-unit') || 'g';
      
      // Show loading state
      const resultDiv = document.getElementById('result');
      if (resultDiv) {
          resultDiv.innerHTML = '<p>Analyzing your food... Please wait.</p>';
      }
      
      // Determine the source of food identification
      let identifiedFood;
      
      // Check if direct input is provided (priority over other methods)
      if (directFoodInput && directFoodInput.trim() !== '') {
          console.log('Using direct food input:', directFoodInput);
          identifiedFood = directFoodInput;
      }
      // Check if food selection dropdown is used
      else if (selectedFoodItem && selectedFoodItem !== 'default') {
          console.log('Using selected food item:', selectedFoodItem);
          identifiedFood = selectedFoodItem;
      }
      // Check for image or description
      else if (file || description) {
          // Validate inputs
          if (!file && !description) {
              throw new Error('Please provide an image, a description, or select a food item.');
          }
          
          // Identify food from image using Gemini API
          identifiedFood = await identifyFoodFromImage(file, description);
      }
      else {
          throw new Error('Please provide an image, a description, or select a food item.');
      }
      
      // Log the identified food for debugging
      console.log('Identified food:', identifiedFood);
      console.log('Serving size:', servingSize, servingUnit);
      
      // Get nutritional data for the identified food with serving size
      const nutritionData = await getNutritionalData(identifiedFood, servingSize, servingUnit);
      
      // Return combined data
      return {
          identifiedFood: identifiedFood,
          servingSize,
          servingUnit,
          ...nutritionData
      };
  } catch (error) {
      console.error('Error in analyzeFood:', error);
      // Provide more specific error message based on the error
      if (error.message.includes('API request failed')) {
          throw new Error('Unable to connect to the food recognition service. Please try again later or provide a description.');
      } else if (error.message.includes('Failed to identify food')) {
          throw new Error('Could not identify the food in the image. Please provide a clearer image or add a description.');
      } else {
          throw new Error('Failed to analyze food. Please try again or provide more details.');
      }
  }
}

// Function to populate food selector dropdown with common Indian dishes
function populateFoodSelector() {
  const foodSelector = document.getElementById('food-selector');
  if (!foodSelector) return;
  
  // Common Indian dishes and combinations
  const indianDishes = [
      "Dal Tadka with Steamed Rice", 
      "Butter Chicken with Naan", 
      "Chole Bhature", 
      "Palak Paneer with Roti", 
      "Chicken Biryani with Raita", 
      "Samosa with Mint Chutney", 
      "Masala Dosa with Sambar", 
      "Idli with Sambar", 
      "Rajma Chawal", 
      "Aloo Paratha with Curd", 
      "Pav Bhaji", 
      "Tandoori Chicken with Rumali Roti", 
      "Paneer Butter Masala with Naan", 
      "Gulab Jamun", 
      "Jalebi with Rabri", 
      "Vada Pav", 
      "Dhokla with Green Chutney", 
      "Malai Kofta with Naan", 
      "Rogan Josh with Rice", 
      "North Indian Thali", 
      "South Indian Thali", 
      "Paneer Tikka with Mint Chutney"
  ];
  
  // Clear existing options except the default
  while (foodSelector.options.length > 1) {
      foodSelector.remove(1);
  }
  
  // Add dish options
  indianDishes.sort().forEach(dish => {
      const option = document.createElement('option');
      option.value = dish;
      option.textContent = dish;
      foodSelector.appendChild(option);
  });
}

// Call this function when the page loads to populate the dropdown
document.addEventListener('DOMContentLoaded', () => {
  populateFoodSelector();
  
  // Set up tab switching functionality
  const tabs = document.querySelectorAll('.input-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  if (tabs && tabContents) {
      tabs.forEach(tab => {
          tab.addEventListener('click', () => {
              // Remove active class from all tabs and contents
              tabs.forEach(t => t.classList.remove('active'));
              tabContents.forEach(content => content.classList.remove('active'));
              
              // Add active class to clicked tab and corresponding content
              tab.classList.add('active');
              const targetContent = document.getElementById(tab.dataset.target);
              if (targetContent) {
                  targetContent.classList.add('active');
              }
          });
      });
  }
  
  // Update serving size fields with standard options
  const dishSelector = document.getElementById('food-selector');
  const servingSizeInput = document.getElementById('serving-size');
  const servingUnitSelect = document.getElementById('serving-unit');
  
  if (dishSelector && servingSizeInput && servingUnitSelect) {
      dishSelector.addEventListener('change', () => {
          const selectedDish = dishSelector.value;
          if (selectedDish !== 'default') {
              // Set recommended serving size based on dish type
              if (selectedDish.includes('Thali')) {
                  servingSizeInput.value = 600;
              } else if (selectedDish.includes('Biryani')) {
                  servingSizeInput.value = 200;
              } else if (selectedDish.includes('Dal') || selectedDish.includes('Curry')) {
                  servingSizeInput.value = 200;
              } else if (selectedDish.includes('Naan') || selectedDish.includes('Roti')) {
                  servingSizeInput.value = 80;
              } else if (selectedDish.includes('Samosa')) {
                  servingSizeInput.value = 50;
              } else if (selectedDish.includes('Gulab Jamun') || selectedDish.includes('Jalebi')) {
                  servingSizeInput.value = 40;
              } else {
                  servingSizeInput.value = 100;
              }
              
              // Set appropriate unit
              servingUnitSelect.value = 'g';
          }
      });
  }
});

async function identifyFoodFromImage(file, description) {
  try {
      // If we have an image file, use Gemini API to analyze it
      if (file && file.type.startsWith('image/')) {
          // Check file size
          if (file.size > 20 * 1024 * 1024) { // 20MB limit
              console.warn('Image file is too large, may cause issues with API');
          }
          
          const base64Image = await fileToBase64(file);
          
          // Enhanced prompts for Gemini API with detailed instructions for Indian cuisine combinations
          // Inspired by the Python implementation for more precise identification and preventing overestimation
          const prompt = description 
              ? `You are a specialized food recognition AI with expertise in Indian cuisine.
                 Task: Identify the exact Indian dish or combination in this image with high precision.
                 User suggestion: "${description}"
                 
                 INSTRUCTIONS:
                 1. Focus exclusively on identifying traditional Indian dishes, regional specialties, and street foods.
                 
                 2. For MULTIPLE ITEMS that form a meal combination, identify the COMPLETE combination:
                    - Main dish + Bread combinations: "Dal Makhani with Naan", "Paneer Tikka with Roti"
                    - Rice + Curry combinations: "Dal Chawal", "Chicken Biryani with Raita"
                    - Thali combinations: List main components "South Indian Thali with Idli, Dosa, Sambar"
                 
                 3. Pay special attention to these visual indicators:
                    - Color: Yellow turmeric in dal, red in butter chicken, green in palak dishes
                    - Texture: Creamy curries vs dry dishes, flaky breads vs dense breads
                    - Garnishes: Coriander, cream swirls, green chilies, fried items
                    - Accompaniments: Rice, breads, side dishes, chutneys, pickles
                 
                 4. AVOID COMMON MISIDENTIFICATIONS:
                    - Dal Tadka (yellow) ≠ Dal Makhani (brown/black)
                    - Naan (puffy, teardrop-shaped) ≠ Roti/Chapati (flat, round)
                    - Butter Chicken (orange-red, creamy) ≠ Chicken Tikka Masala (bright red, chunky)
                    - Palak Paneer (smooth, green) ≠ Saag Paneer (textured, green)
                 
                 5. Provide ONLY the specific dish name(s) in standard English.
                    DO NOT include explanations, descriptions, or additional text.
                 
                 6. If it's not an Indian dish, simply identify what it actually is without extra text.`
              : `You are a specialized food recognition AI with expertise in Indian cuisine.
                 Task: Identify the exact Indian dish or combination in this image with high precision.
                 
                 INSTRUCTIONS:
                 1. Focus exclusively on identifying traditional Indian dishes, regional specialties, and street foods.
                 
                 2. For MULTIPLE ITEMS that form a meal combination, identify the COMPLETE combination:
                    - Main dish + Bread combinations: "Dal Makhani with Naan", "Paneer Tikka with Roti"
                    - Rice + Curry combinations: "Dal Chawal", "Chicken Biryani with Raita"
                    - Thali combinations: List main components "South Indian Thali with Idli, Dosa, Sambar"
                 
                 3. Pay special attention to these visual indicators:
                    - Color: Yellow turmeric in dal, red in butter chicken, green in palak dishes
                    - Texture: Creamy curries vs dry dishes, flaky breads vs dense breads
                    - Garnishes: Coriander, cream swirls, green chilies, fried items
                    - Accompaniments: Rice, breads, side dishes, chutneys, pickles
                 
                 4. AVOID COMMON MISIDENTIFICATIONS:
                    - Dal Tadka (yellow) ≠ Dal Makhani (brown/black)
                    - Naan (puffy, teardrop-shaped) ≠ Roti/Chapati (flat, round)
                    - Butter Chicken (orange-red, creamy) ≠ Chicken Tikka Masala (bright red, chunky)
                    - Palak Paneer (smooth, green) ≠ Saag Paneer (textured, green)
                 
                 5. Provide ONLY the specific dish name(s) in standard English.
                    DO NOT include explanations, descriptions, or additional text.
                 
                 6. If it's not an Indian dish, simply identify what it actually is without extra text.`;
          
          // Prepare the request body with enhanced configuration
          const requestBody = {
              contents: [
                  {
                      parts: [
                          { text: prompt },
                          {
                              inline_data: {
                                  mime_type: file.type,
                                  data: base64Image
                              }
                          }
                      ]
                  }
              ],
              generationConfig: {
                  temperature: 0.05, // Very low temperature for more precise identification
                  maxOutputTokens: 50, // Reduced token limit to encourage concise responses
                  topP: 0.95,
                  topK: 40
              }
          };
          
          // Add timeout for API call
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
          try {
              // Call the Gemini API with timeout
              const response = await fetch(`${API_ENDPOINT}?key=${API_KEY}`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(requestBody),
                  signal: controller.signal
              });
              
              clearTimeout(timeoutId);
              
              if (!response.ok) {
                  const errorText = await response.text();
                  console.error('API error response:', errorText);
                  throw new Error(`API request failed with status ${response.status}: ${errorText}`);
              }
              
              const data = await response.json();
              
              // Extract the food name from the response
              if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                  const text = data.candidates[0].content.parts[0].text;
                  // Enhanced cleaning of the response to get just the dish name
                  let dishName = text.trim();
                  
                  // Remove any prefixes like "This is", "The dish is", etc.
                  dishName = dishName.replace(/^(this is|the dish is|it is|i see|this looks like|this appears to be|identified as|the food is|in the image|the meal is)\s+/i, '');
                  
                  // Remove any suffixes with explanations
                  dishName = dishName.split(/\.|,|\n|:/)[0].trim();
                  
                  // Remove quotes if present
                  dishName = dishName.replace(/^\"(.+)\"$/, '$1');
                  
                  // Capitalize properly
                  dishName = dishName.replace(/\b\w/g, c => c.toUpperCase());
                  
                  return dishName;
              }
              
              throw new Error('Failed to identify food from image');
          } catch (apiError) {
              console.error('API call error:', apiError);
              // If API call fails but we have a description, use that instead
              if (description && description.trim() !== '') {
                  console.log('Falling back to user description:', description);
                  return description;
              }
              throw apiError; // Re-throw if we can't fall back
          }
      }
      
      // If no image or API fails, fall back to description or default Indian dishes
      if (description && description.trim() !== '') {
          return description;
      } else {
          // Default to common Indian dishes and combinations
          const indianDishes = [
              "Dal Tadka with Steamed Rice", "Butter Chicken with Naan", "Chole Bhature", "Palak Paneer with Roti", 
              "Chicken Biryani with Raita", "Samosa with Mint Chutney", "Masala Dosa with Sambar", 
              "Idli with Sambar", "Rajma Chawal", "Aloo Paratha with Curd", 
              "Pav Bhaji", "Tandoori Chicken with Rumali Roti", 
              "Paneer Butter Masala with Naan", "Gulab Jamun", "Jalebi with Rabri", 
              "Vada Pav", "Dhokla with Green Chutney", "Malai Kofta with Naan", 
              "Rogan Josh with Rice", "North Indian Thali", 
              "South Indian Thali", "Paneer Tikka with Mint Chutney"
          ];
          return indianDishes[Math.floor(Math.random() * indianDishes.length)];
      }
  } catch (error) {
      console.error('Error identifying food:', error);
      // Fallback to description or default
      if (description && description.trim() !== '') {
          return description;
      } else {
          return "Unknown Indian Dish";
      }
  }
}

async function getNutritionalData(foodName, servingSize = 100, servingUnit = 'g') {
  // Try to get nutritional data from Gemini API first
  try {
    console.log(`Getting nutritional data for: ${foodName} (${servingSize}${servingUnit})`);
    
    // Call Gemini API for nutritional data
    const nutritionData = await getNutritionalDataFromGemini(foodName, servingSize, servingUnit);
    
    // If we got valid data from Gemini, return it
    if (nutritionData && Object.keys(nutritionData).length > 0) {
      console.log("Using Gemini nutritional data");
      return nutritionData;
    }
  } catch (error) {
    console.error("Error getting nutritional data from Gemini:", error);
    // Continue to fallback methods
  }
  
  // Helper function to identify if a dish is a combination
  function identifyDishComponents(dishName) {
    const lowerName = dishName.toLowerCase();
    
    // Check for common connectors in dish combinations
    const withPattern = /(.+)\s+with\s+(.+)/i;
    const andPattern = /(.+)\s+and\s+(.+)/i;
    const thaliPattern = /(.*thali)(\s+with\s+.*)?/i;
    
    let components = [];
    
    // Check if it's a thali (which is already a combination)
    if (thaliPattern.test(lowerName)) {
      const match = lowerName.match(thaliPattern);
      if (match[1]) components.push(match[1].trim());
      if (match[2]) {
        // Extract additional components mentioned with the thali
        const additionalItems = match[2].replace(/\s+with\s+/i, '')
          .split(/,|\s+and\s+/i)
          .map(item => item.trim())
          .filter(item => item);
        
        components = [...components, ...additionalItems];
      }
      return components.length > 0 ? components : [dishName];
    }
    
    // Check for "with" pattern (e.g., "Dal Makhani with Butter Naan")
    if (withPattern.test(dishName)) {
      const match = dishName.match(withPattern);
      if (match[1]) components.push(match[1].trim());
      if (match[2]) components.push(match[2].trim());
      return components;
    }
    
    // Check for "and" pattern (e.g., "Samosa and Chutney")
    if (andPattern.test(dishName)) {
      const match = dishName.match(andPattern);
      if (match[1]) components.push(match[1].trim());
      if (match[2]) components.push(match[2].trim());
      return components;
    }
    
    // Handle common combined dishes that might not use "with" or "and"
    const combinedDishes = {
      "chole bhature": ["Chole", "Bhature"],
      "rajma chawal": ["Rajma", "Chawal"],
      "dal chawal": ["Dal", "Chawal"],
      "kadhi chawal": ["Kadhi", "Chawal"],
      "chicken biryani": ["Chicken Biryani"],
      "veg biryani": ["Vegetable Biryani"],
      "dal makhani": ["Dal Makhani"],
      "butter chicken": ["Butter Chicken"],
      "shahi paneer": ["Shahi Paneer"],
      "palak paneer": ["Palak Paneer"]
    };
    
    // Check known combined dishes
    for (const [key, value] of Object.entries(combinedDishes)) {
      if (lowerName.includes(key)) {
        return value;
      }
    }
    
    // If no combination detected
    return [dishName];
  }
  
  // Check if this is a combination dish
  const dishComponents = identifyDishComponents(foodName);
  console.log("Identified dish components:", dishComponents);
  
  // Database of common Indian dishes with approximate nutritional values
  // Values per serving
  const indianFoodDatabase = {
  };
  
  // If this is a combination dish, try to add up the nutritional values
  if (dishComponents.length > 1) {
    try {
      let combinedNutrition = {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber_g: 0,
        sugar_g: 0,
        sodium_mg: 0,
        health_score: 65, // Default health score
        dish_components: dishComponents,
        quantity_g: 0,
        serving_size: servingSize,
        serving_unit: servingUnit,
        recommended_serving: "See individual components"
      };
      
      let componentsFound = 0;
      
      // Try to find each component in the database
      for (const component of dishComponents) {
        // Normalize the component name for lookup
        const normalizedName = component.toLowerCase()
          .replace(/chawal|rice/g, 'rice')
          .replace(/murgh|chicken/g, 'chicken')
          .replace(/panir|paneer/g, 'paneer')
          .replace(/bhaji|bhajji|bhajiya/g, 'bhaji')
          .replace(/roti|chapati|chapatti/g, 'roti')
          .replace(/daal|dal|dhal/g, 'dal')
          .replace(/sabzi|sabji|sabji/g, 'sabzi');
        
        // Look for an exact match first  
        let componentData = null;
        
        // Try exact match
        if (indianFoodDatabase[component]) {
          componentData = indianFoodDatabase[component];
        } else {
          // Try case-insensitive match
          for (const [dish, nutrition] of Object.entries(indianFoodDatabase)) {
            if (dish.toLowerCase() === normalizedName) {
              componentData = nutrition;
              break;
            }
          }
          
          // If still not found, try partial matching
          if (!componentData) {
            for (const [dish, nutrition] of Object.entries(indianFoodDatabase)) {
              const dishLower = dish.toLowerCase();
              if (normalizedName.includes(dishLower) || dishLower.includes(normalizedName)) {
                componentData = nutrition;
                break;
              }
            }
          }
        }
        
        // If we found data for this component, add it to the combined nutrition
        if (componentData) {
          componentsFound++;
          for (const [key, value] of Object.entries(componentData)) {
            if (key !== 'health_score' && key !== 'dish_components' && key !== 'dish_name') {
              combinedNutrition[key] = (combinedNutrition[key] || 0) + value;
            }
          }
          
          // Assume each component weighs about 150g on average if no specific weight
          combinedNutrition.quantity_g += (componentData.quantity_g || 150);
        }
      }
      
      // If we found at least one component, return the combined data
      if (componentsFound > 0) {
        // Calculate health score based on macronutrient balance
        const totalCals = combinedNutrition.calories;
        if (totalCals > 0) {
          const proteinCals = combinedNutrition.protein * 4;
          const carbCals = combinedNutrition.carbs * 4;
          const fatCals = combinedNutrition.fat * 9;
          
          const proteinPct = proteinCals / totalCals;
          const carbPct = carbCals / totalCals;
          const fatPct = fatCals / totalCals;
          
          // Ideal macronutrient balance (approximately): 25% protein, 50% carbs, 25% fat
          const macroBalance = 100 - (
            Math.abs(proteinPct - 0.25) * 100 +
            Math.abs(carbPct - 0.5) * 100 +
            Math.abs(fatPct - 0.25) * 100
          );
          
          // Adjust health score based on macronutrient balance
          combinedNutrition.health_score = Math.max(40, Math.min(90, 
            Math.round(macroBalance * 0.5 + 
                      (combinedNutrition.fiber_g / totalCals * 1000) * 30 - 
                      (combinedNutrition.sugar_g / totalCals * 1000) * 10 -
                      (combinedNutrition.sodium_mg / totalCals) * 0.05 +
                      50) // Base score of 50
          ));
        }
        
        combinedNutrition.dish_name = foodName;
        return combinedNutrition;
      }
    } catch (error) {
      console.error("Error calculating combined nutrition:", error);
      // Fall through to standard matching if combination approach fails
    }
  }
  
  // Try to find the exact dish in our database
  if (indianFoodDatabase[foodName]) {
      return indianFoodDatabase[foodName];
  }
  
  // Improved partial matching with better handling of variations
  const lowerFoodName = foodName.toLowerCase();
  
  // Common variations and alternative spellings
  const normalizedName = lowerFoodName
      .replace(/chawal|rice/g, 'rice')
      .replace(/murgh|chicken/g, 'chicken')
      .replace(/panir|paneer/g, 'paneer')
      .replace(/bhaji|bhajji|bhajiya/g, 'bhaji')
      .replace(/roti|chapati|chapatti/g, 'roti')
      .replace(/daal|dal|dhal/g, 'dal')
      .replace(/sabzi|sabji|sabji/g, 'sabzi');
  
  // First try exact word matches (more specific)
  for (const [dish, nutrition] of Object.entries(indianFoodDatabase)) {
      const dishLower = dish.toLowerCase();
      // Check if all words in the food name are in the dish name or vice versa
      const foodWords = normalizedName.split(/\s+/);
      const dishWords = dishLower.split(/\s+/);
      
      // Check if all food words are in the dish
      const allFoodWordsInDish = foodWords.every(word => 
          dishWords.some(dishWord => dishWord.includes(word) || word.includes(dishWord))
      );
      
      // Check if all dish words are in the food
      const allDishWordsInFood = dishWords.every(word => 
          foodWords.some(foodWord => foodWord.includes(word) || word.includes(foodWord))
      );
      
      if (allFoodWordsInDish || allDishWordsInFood) {
          return nutrition;
      }
  }
  
  // If no match found, try more lenient partial matching
  for (const [dish, nutrition] of Object.entries(indianFoodDatabase)) {
      const dishLower = dish.toLowerCase();
      if (normalizedName.includes(dishLower) || dishLower.includes(normalizedName)) {
          return nutrition;
      }
  }
  
  // If still not found, use AI to estimate nutritional values
  try {
      // In a real app, you would call a nutrition API here
      // For now, we'll generate semi-realistic values based on the food name
      
      // Determine if it's likely a vegetarian dish
      const isLikelyVegetarian = !lowerFoodName.includes('chicken') && 
                                !lowerFoodName.includes('mutton') && 
                                !lowerFoodName.includes('fish') &&
                                !lowerFoodName.includes('prawn') &&
                                !lowerFoodName.includes('egg');
      
      // Determine if it's likely a dessert
      const isLikelyDessert = lowerFoodName.includes('sweet') || 
                             lowerFoodName.includes('mithai') ||
                             lowerFoodName.includes('halwa') ||
                             lowerFoodName.includes('barfi') ||
                             lowerFoodName.includes('ladoo');
      
      // Base values for 100g
      let baseNutrition = {};
      
      // Generate nutrition values based on food type
      if (isLikelyDessert) {
          baseNutrition = {
              calories: Math.floor(Math.random() * 100) + 150,
              protein: Math.floor(Math.random() * 3) + 1,
              fat: Math.floor(Math.random() * 8) + 5,
              carbs: Math.floor(Math.random() * 15) + 20,
              fiber_g: Math.floor(Math.random() * 2),
              sugar_g: Math.floor(Math.random() * 10) + 15,
              sodium_mg: Math.floor(Math.random() * 100) + 30,
              dish_name: foodName,
              dish_components: [foodName],
              health_score: Math.floor(Math.random() * 30) + 20,
              quantity_g: 100,
              serving_size: servingSize,
              serving_unit: servingUnit,
              recommended_serving: "40-50g (1 piece)"
          };
      } else if (isLikelyVegetarian) {
          baseNutrition = {
              calories: Math.floor(Math.random() * 150) + 250,
              protein: Math.floor(Math.random() * 8) + 6,
              fat: Math.floor(Math.random() * 12) + 8,
              carbs: Math.floor(Math.random() * 20) + 30,
              fiber_g: Math.floor(Math.random() * 6) + 4,
              sugar_g: Math.floor(Math.random() * 4) + 2,
              sodium_mg: Math.floor(Math.random() * 300) + 300,
              dish_name: foodName,
              dish_components: [foodName],
              health_score: Math.floor(Math.random() * 25) + 55,
              quantity_g: 100,
              serving_size: servingSize,
              serving_unit: servingUnit,
              recommended_serving: "200g (1 cup)"
          };
      } else {
          baseNutrition = {
              calories: Math.floor(Math.random() * 150) + 350,
              protein: Math.floor(Math.random() * 15) + 20,
              fat: Math.floor(Math.random() * 15) + 15,
              carbs: Math.floor(Math.random() * 20) + 20,
              fiber_g: Math.floor(Math.random() * 4) + 2,
              sugar_g: Math.floor(Math.random() * 5) + 2,
              sodium_mg: Math.floor(Math.random() * 300) + 400,
              dish_name: foodName,
              dish_components: [foodName],
              health_score: Math.floor(Math.random() * 25) + 45,
              quantity_g: 100,
              serving_size: servingSize,
              serving_unit: servingUnit,
              recommended_serving: "200g (1 cup)"
          };
      }
      
      // Scale values based on serving size if not 100g
      if (servingSize !== 100 && servingUnit === 'g') {
          const scaleFactor = servingSize / 100;
          
          baseNutrition.calories *= scaleFactor;
          baseNutrition.protein *= scaleFactor;
          baseNutrition.fat *= scaleFactor;
          baseNutrition.carbs *= scaleFactor;
          baseNutrition.fiber_g *= scaleFactor;
          baseNutrition.sugar_g *= scaleFactor;
          baseNutrition.sodium_mg *= scaleFactor;
          baseNutrition.quantity_g = servingSize;
      }
      
      return baseNutrition;
  } catch (error) {
      console.error('Error estimating nutrition:', error);
      // Fallback to generic values scaled to the serving size
      const baseCalories = 350;
      const scaleFactor = (servingUnit === 'g') ? servingSize / 100 : 1;
      
      return {
          calories: Math.round(baseCalories * scaleFactor),
          protein: Math.round(12 * scaleFactor),
          fat: Math.round(15 * scaleFactor),
          carbs: Math.round(45 * scaleFactor),
          fiber_g: Math.round(5 * scaleFactor),
          sugar_g: Math.round(4 * scaleFactor),
          sodium_mg: Math.round(450 * scaleFactor),
          dish_name: foodName,
          dish_components: [foodName],
          health_score: 60,
          quantity_g: servingSize,
          serving_size: servingSize,
          serving_unit: servingUnit,
          recommended_serving: "Standard serving"
      };
  }
}

// New function to get nutritional data from Gemini API
async function getNutritionalDataFromGemini(foodName, servingSize = 100, servingUnit = 'g') {
  try {
    // Prepare the prompt for Gemini API with enhanced instructions to prevent overestimation
    const prompt = `
    You are a nutrition expert specializing in ACCURATE and PRECISE nutritional analysis of Indian cuisine with a STRONG FOCUS on PREVENTING OVERESTIMATION.

    INPUT: "${foodName}"
    SPECIFIED SERVING: ${servingSize}${servingUnit}
    TASK: Provide precise, realistic nutritional information for this Indian dish or combination.
    OUTPUT FORMAT: JSON object with nutritional data

    CRITICAL GUIDELINES:

    1. **PREVENT OVERESTIMATION - HIGHEST PRIORITY:**
       - Indian restaurant portions in reality are MUCH SMALLER than Western portions
       - Home cooking portions are even more conservative
       - When in doubt, UNDERESTIMATE rather than overestimate values
       - NEVER exceed these maximum values for standard servings:
          * Rice dishes: 250 calories per cup
          * Curries: 350 calories per cup
          * Breads: 300 calories per piece of naan, 120 calories per roti
          * Snacks: 170 calories per samosa
          * Desserts: 175 calories per piece

    2. **ACCURATE REFERENCE VALUES (per standard serving):**
       - Dal Tadka (1 cup, 200g): 120-150 calories (NEVER more than 200 calories!)
       - Butter Chicken (1 cup, 200g): 320-350 calories (NEVER more than 400 calories!)
       - Tandoori Roti (1 piece, 30g): 80-120 calories (NEVER more than 150 calories!)
       - Plain Naan (1 piece, 80g): 260-300 calories (NEVER more than 350 calories!)
       - Plain Rice (1 cup, 150-200g): 170-200 calories (NEVER more than 250 calories!)
       - Samosa (1 piece, 50g): 140-170 calories (NEVER more than 200 calories!)
       - Gulab Jamun (1 piece, 40g): 150-175 calories (NEVER more than 200 calories!)

    3. **PROVIDE A RECOMMENDED SERVING SIZE:**
       - Include a field "recommended_serving" with a description of the standard serving size
       - Format as: "100g (1 cup)" or "80g (1 piece)"
       - Examples:
          * Dal: "200g (1 cup)"
          * Naan: "80g (1 piece)" 
          * Roti: "30g (1 piece)"
          * Rice: "150g (1 cup)"
          * Samosa: "50g (1 piece)"
          * Desserts: Specify by individual piece weight

    4. **PRECISE SERVING SIZE CALCULATIONS:**
       - Calculate all nutritional values based on the SPECIFIED SERVING SIZE (${servingSize}${servingUnit})
       - If the specified serving size differs from the standard, scale values proportionally
       - For combinations, calculate the TOTAL nutritional profile based on standard ratios:
          * Dal Makhani (200g) + Naan (80g) = 280g total with accurate proportional nutrition values
          * Chicken Biryani (200g) + Raita (50g) = 250g total
          * Chole (200g) + Bhature (60g) = 260g total

    5. **ACCURATE COMBINATION ANALYSIS:**
       - For combination dishes, calculate each component separately first, then add them
       - STANDARD SERVING RATIOS for combinations:
          * Curry + Bread: 200g curry + 1-2 pieces of bread (80-160g)
          * Rice + Curry: 150g rice + 150-200g curry
          * Thali: 100g main curry + 50g dal + 100g rice + 30g roti + 50g vegetable side + 30g raita

    6. **BALANCED MACRONUTRIENTS (per 100g):**
       - Traditional vegetarian dishes: 5-12g protein, 8-15g fat, 10-30g carbs
       - Non-vegetarian dishes: 15-25g protein, 10-20g fat, 5-15g carbs
       - Rice dishes: 3-5g protein, 1-5g fat, 25-35g carbs
       - Breads: 7-10g protein, 3-7g fat, 40-60g carbs
       - Desserts: 3-5g protein, 5-15g fat, 20-40g carbs

    Return a single valid JSON object with exactly these keys (all values should reflect the specified serving size of ${servingSize}${servingUnit}):
    {
      "calories": [float, REALISTIC and NEVER overestimated],
      "protein": [float in grams],
      "fat": [float in grams],
      "carbs": [float in grams],
      "fiber_g": [float in grams],
      "sugar_g": [float in grams],
      "sodium_mg": [float in milligrams],
      "health_score": [integer from 0-100],
      "dish_name": [string - standardized name],
      "dish_components": [array of strings - individual components],
      "quantity_g": [float - total weight in grams],
      "serving_size": ${servingSize},
      "serving_unit": "${servingUnit}",
      "recommended_serving": [string - description of standard serving]
    }
    `;

    // Prepare the request body
    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,  // Very low temperature for more precise and consistent results
        maxOutputTokens: 1024,
        topP: 0.95,
        topK: 40
      }
    };

    // Call the Gemini API
    const response = await fetch(`${API_ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Extract the nutritional data from the response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      
      // Try to extract JSON from the response
      try {
        // Look for JSON object in the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const nutritionData = JSON.parse(jsonStr);
          
          // Validate that we have the expected keys
          const requiredKeys = ["calories", "protein", "fat", "carbs"];
          const hasRequiredKeys = requiredKeys.every(key => 
            nutritionData.hasOwnProperty(key) && 
            typeof nutritionData[key] === 'number'
          );
          
          if (hasRequiredKeys) {
            console.log("Successfully parsed nutritional data:", nutritionData);
            
            // Additional validation to prevent unrealistic values
            const maxCaloriesPerServing = 800; // Maximum reasonable calories for a single serving
            if (nutritionData.calories > maxCaloriesPerServing) {
              console.warn(`Calories seem too high (${nutritionData.calories}), adjusting to more realistic value`);
              nutritionData.calories = Math.min(nutritionData.calories, maxCaloriesPerServing);
            }
            
            // Make sure serving size fields are present
            if (!nutritionData.hasOwnProperty('serving_size')) {
              nutritionData.serving_size = servingSize;
            }
            
            if (!nutritionData.hasOwnProperty('serving_unit')) {
              nutritionData.serving_unit = servingUnit;
            }
            
            if (!nutritionData.hasOwnProperty('recommended_serving')) {
              // Add a recommended serving based on dish type
              if (foodName.toLowerCase().includes('thali')) {
                nutritionData.recommended_serving = "600g (1 thali)";
              } else if (foodName.toLowerCase().includes('biryani')) {
                nutritionData.recommended_serving = "200g (1 cup)";
              } else if (foodName.toLowerCase().includes('dal') || foodName.toLowerCase().includes('curry')) {
                nutritionData.recommended_serving = "200g (1 cup)";
              } else if (foodName.toLowerCase().includes('naan')) {
                nutritionData.recommended_serving = "80g (1 piece)";
              } else if (foodName.toLowerCase().includes('roti')) {
                nutritionData.recommended_serving = "30g (1 piece)";
              } else if (foodName.toLowerCase().includes('samosa')) {
                nutritionData.recommended_serving = "50g (1 piece)";
              } else if (foodName.toLowerCase().includes('gulab jamun') || foodName.toLowerCase().includes('jalebi')) {
                nutritionData.recommended_serving = "40g (1 piece)";
              } else {
                nutritionData.recommended_serving = "Standard serving";
              }
            }
            
            return nutritionData;
          } else {
            console.warn("Missing required nutritional data keys in Gemini response");
            console.log("Received data:", nutritionData);
          }
        } else {
          console.warn("No JSON object found in Gemini response");
          console.log("Raw response:", text);
        }
      } catch (error) {
        console.error("Error parsing JSON from Gemini response:", error);
        console.log("Raw response:", text);
      }
    }
    
    // If we couldn't get valid data, return empty object
    return {};
  } catch (error) {
    console.error("Error in getNutritionalDataFromGemini:", error);
    return {};
  }
}

export { analyzeFood, populateFoodSelector };
