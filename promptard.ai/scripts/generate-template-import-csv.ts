import { writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = join(import.meta.dirname, "..", "data", "template-imports");

type RecipeRow = {
  dish: string;
  mainIngredient: string;
  tags: string[];
};

type CarRow = {
  partLabel: string;
  tagSlug: string;
  tags: string[];
};

const RECIPES: RecipeRow[] = [
  { dish: "Spaghetti Carbonara", mainIngredient: "spaghetti", tags: ["recipes", "cooking", "italian", "pasta"] },
  { dish: "Margherita Pizza", mainIngredient: "pizza dough", tags: ["recipes", "cooking", "italian", "pizza"] },
  { dish: "Chicken Tikka Masala", mainIngredient: "chicken breast", tags: ["recipes", "cooking", "indian", "curry"] },
  { dish: "Beef Bourguignon", mainIngredient: "beef chuck", tags: ["recipes", "cooking", "french", "stew"] },
  { dish: "Pad Thai", mainIngredient: "rice noodles", tags: ["recipes", "cooking", "thai", "noodles"] },
  { dish: "Chicken Caesar Salad", mainIngredient: "romaine lettuce", tags: ["recipes", "cooking", "salad", "american"] },
  { dish: "Beef Tacos", mainIngredient: "corn tortillas", tags: ["recipes", "cooking", "mexican", "tacos"] },
  { dish: "Miso Ramen", mainIngredient: "fresh ramen noodles", tags: ["recipes", "cooking", "japanese", "soup"] },
  { dish: "Greek Moussaka", mainIngredient: "eggplant", tags: ["recipes", "cooking", "greek", "casserole"] },
  { dish: "Butter Chicken", mainIngredient: "chicken thigh", tags: ["recipes", "cooking", "indian", "curry"] },
  { dish: "Fish and Chips", mainIngredient: "cod fillet", tags: ["recipes", "cooking", "british", "seafood"] },
  { dish: "Vegetable Stir-Fry", mainIngredient: "mixed vegetables", tags: ["recipes", "cooking", "vegetarian", "asian"] },
  { dish: "Lasagna Bolognese", mainIngredient: "lasagna sheets", tags: ["recipes", "cooking", "italian", "pasta"] },
  { dish: "Chicken Noodle Soup", mainIngredient: "egg noodles", tags: ["recipes", "cooking", "soup", "comfort-food"] },
  { dish: "Shrimp Fried Rice", mainIngredient: "cooked jasmine rice", tags: ["recipes", "cooking", "chinese", "seafood"] },
  { dish: "Pulled Pork Sandwiches", mainIngredient: "pork shoulder", tags: ["recipes", "cooking", "american", "bbq"] },
  { dish: "Caprese Salad", mainIngredient: "fresh mozzarella", tags: ["recipes", "cooking", "italian", "salad"] },
  { dish: "Beef Pho", mainIngredient: "rice noodles", tags: ["recipes", "cooking", "vietnamese", "soup"] },
  { dish: "Chicken Parmesan", mainIngredient: "chicken breast", tags: ["recipes", "cooking", "italian", "american"] },
  { dish: "Vegetable Curry", mainIngredient: "potatoes", tags: ["recipes", "cooking", "indian", "vegetarian"] },
  { dish: "Clam Chowder", mainIngredient: "potatoes", tags: ["recipes", "cooking", "american", "seafood"] },
  { dish: "Beef Stroganoff", mainIngredient: "beef sirloin", tags: ["recipes", "cooking", "russian", "comfort-food"] },
  { dish: "Chicken Burrito Bowl", mainIngredient: "cooked rice", tags: ["recipes", "cooking", "mexican", "bowl"] },
  { dish: "Tom Yum Soup", mainIngredient: "shrimp", tags: ["recipes", "cooking", "thai", "soup"] },
  { dish: "Mushroom Risotto", mainIngredient: "arborio rice", tags: ["recipes", "cooking", "italian", "vegetarian"] },
  { dish: "Lamb Kebabs", mainIngredient: "lamb leg", tags: ["recipes", "cooking", "middle-eastern", "grill"] },
  { dish: "Chicken Quesadilla", mainIngredient: "flour tortillas", tags: ["recipes", "cooking", "mexican", "quick"] },
  { dish: "Beef Chili", mainIngredient: "ground beef", tags: ["recipes", "cooking", "american", "stew"] },
  { dish: "Sushi Rolls (California)", mainIngredient: "sushi rice", tags: ["recipes", "cooking", "japanese", "seafood"] },
  { dish: "Eggplant Parmesan", mainIngredient: "eggplant", tags: ["recipes", "cooking", "italian", "vegetarian"] },
  { dish: "Chicken Teriyaki", mainIngredient: "chicken thigh", tags: ["recipes", "cooking", "japanese", "glaze"] },
  { dish: "Gazpacho", mainIngredient: "ripe tomatoes", tags: ["recipes", "cooking", "spanish", "cold-soup"] },
  { dish: "Pork Dumplings", mainIngredient: "ground pork", tags: ["recipes", "cooking", "chinese", "dumplings"] },
  { dish: "Ratatouille", mainIngredient: "zucchini", tags: ["recipes", "cooking", "french", "vegetarian"] },
  { dish: "Chicken Shawarma", mainIngredient: "chicken thigh", tags: ["recipes", "cooking", "middle-eastern", "wrap"] },
  { dish: "Mac and Cheese", mainIngredient: "elbow macaroni", tags: ["recipes", "cooking", "american", "comfort-food"] },
  { dish: "Beef Enchiladas", mainIngredient: "corn tortillas", tags: ["recipes", "cooking", "mexican", "bake"] },
  { dish: "Tomato Basil Soup", mainIngredient: "ripe tomatoes", tags: ["recipes", "cooking", "soup", "vegetarian"] },
  { dish: "Honey Garlic Salmon", mainIngredient: "salmon fillet", tags: ["recipes", "cooking", "seafood", "healthy"] },
  { dish: "Falafel Wrap", mainIngredient: "dried chickpeas", tags: ["recipes", "cooking", "middle-eastern", "vegetarian"] },
  { dish: "Pork Schnitzel", mainIngredient: "pork loin", tags: ["recipes", "cooking", "german", "fried"] },
  { dish: "Minestrone", mainIngredient: "cannellini beans", tags: ["recipes", "cooking", "italian", "soup"] },
  { dish: "Spinach and Feta Pie", mainIngredient: "phyllo pastry", tags: ["recipes", "cooking", "greek", "vegetarian"] },
  { dish: "Chicken Korma", mainIngredient: "chicken breast", tags: ["recipes", "cooking", "indian", "curry"] },
  { dish: "BBQ Ribs", mainIngredient: "pork ribs", tags: ["recipes", "cooking", "american", "bbq"] },
  { dish: "Vegetable Lasagna", mainIngredient: "lasagna sheets", tags: ["recipes", "cooking", "italian", "vegetarian"] },
  { dish: "Shrimp Scampi", mainIngredient: "large shrimp", tags: ["recipes", "cooking", "italian", "seafood"] },
  { dish: "Chicken Pot Pie", mainIngredient: "pie crust dough", tags: ["recipes", "cooking", "american", "bake"] },
  { dish: "Beef Gyros", mainIngredient: "pita bread", tags: ["recipes", "cooking", "greek", "sandwich"] },
  { dish: "Pumpkin Soup", mainIngredient: "pumpkin flesh", tags: ["recipes", "cooking", "soup", "fall"] },
  { dish: "Chicken Biryani", mainIngredient: "basmati rice", tags: ["recipes", "cooking", "indian", "rice"] },
  { dish: "Beef Meatballs in Marinara", mainIngredient: "ground beef", tags: ["recipes", "cooking", "italian", "pasta"] },
  { dish: "Tofu Mapo", mainIngredient: "firm tofu", tags: ["recipes", "cooking", "chinese", "vegetarian"] },
  { dish: "French Onion Soup", mainIngredient: "yellow onions", tags: ["recipes", "cooking", "french", "soup"] },
  { dish: "Chicken Fajitas", mainIngredient: "chicken breast", tags: ["recipes", "cooking", "mexican", "skillet"] },
  { dish: "Poke Bowl", mainIngredient: "sushi-grade tuna", tags: ["recipes", "cooking", "hawaiian", "bowl"] },
  { dish: "Stuffed Bell Peppers", mainIngredient: "bell peppers", tags: ["recipes", "cooking", "american", "bake"] },
  { dish: "Chicken Satay", mainIngredient: "chicken breast", tags: ["recipes", "cooking", "thai", "grill"] },
  { dish: "Beef Wellington", mainIngredient: "beef tenderloin", tags: ["recipes", "cooking", "british", "special-occasion"] },
  { dish: "Vegetable Paella", mainIngredient: "bomba rice", tags: ["recipes", "cooking", "spanish", "rice"] },
  { dish: "Chicken Alfredo", mainIngredient: "fettuccine pasta", tags: ["recipes", "cooking", "italian", "pasta"] },
  { dish: "Lentil Dahl", mainIngredient: "red lentils", tags: ["recipes", "cooking", "indian", "vegetarian"] },
  { dish: "Crab Cakes", mainIngredient: "crab meat", tags: ["recipes", "cooking", "american", "seafood"] },
  { dish: "Chicken Souvlaki", mainIngredient: "chicken breast", tags: ["recipes", "cooking", "greek", "grill"] },
  { dish: "Beef Bulgogi", mainIngredient: "beef ribeye", tags: ["recipes", "cooking", "korean", "bbq"] },
  { dish: "Zucchini Fritters", mainIngredient: "zucchini", tags: ["recipes", "cooking", "vegetarian", "appetizer"] },
  { dish: "Chicken Tortilla Soup", mainIngredient: "corn tortillas", tags: ["recipes", "cooking", "mexican", "soup"] },
  { dish: "Egg Fried Noodles", mainIngredient: "fresh egg noodles", tags: ["recipes", "cooking", "chinese", "noodles"] },
  { dish: "Shepherd's Pie", mainIngredient: "ground lamb", tags: ["recipes", "cooking", "british", "casserole"] },
  { dish: "Chicken Cacciatore", mainIngredient: "chicken thigh", tags: ["recipes", "cooking", "italian", "stew"] },
  { dish: "Shrimp Tacos", mainIngredient: "corn tortillas", tags: ["recipes", "cooking", "mexican", "seafood"] },
  { dish: "Mushroom Stroganoff", mainIngredient: "button mushrooms", tags: ["recipes", "cooking", "vegetarian", "comfort-food"] },
  { dish: "Chicken Piccata", mainIngredient: "chicken breast", tags: ["recipes", "cooking", "italian", "lemon"] },
  { dish: "Beef Barbacoa", mainIngredient: "beef chuck", tags: ["recipes", "cooking", "mexican", "slow-cook"] },
  { dish: "Avocado Toast", mainIngredient: "sourdough bread", tags: ["recipes", "cooking", "breakfast", "healthy"] },
  { dish: "Chicken Mole", mainIngredient: "chicken thigh", tags: ["recipes", "cooking", "mexican", "sauce"] },
  { dish: "Seafood Paella", mainIngredient: "bomba rice", tags: ["recipes", "cooking", "spanish", "seafood"] },
  { dish: "Beef Lettuce Wraps", mainIngredient: "ground beef", tags: ["recipes", "cooking", "asian", "low-carb"] },
  { dish: "Potato Gnocchi", mainIngredient: "russet potatoes", tags: ["recipes", "cooking", "italian", "pasta"] },
  { dish: "Chicken Adobo", mainIngredient: "chicken thigh", tags: ["recipes", "cooking", "filipino", "braise"] },
  { dish: "Vegetable Samosas", mainIngredient: "potatoes", tags: ["recipes", "cooking", "indian", "appetizer"] },
  { dish: "Beef Rendang", mainIngredient: "beef chuck", tags: ["recipes", "cooking", "indonesian", "curry"] },
  { dish: "Chicken Pesto Pasta", mainIngredient: "penne pasta", tags: ["recipes", "cooking", "italian", "quick"] },
  { dish: "Clam Pasta", mainIngredient: "linguine pasta", tags: ["recipes", "cooking", "italian", "seafood"] },
  { dish: "Stuffed Mushrooms", mainIngredient: "cremini mushrooms", tags: ["recipes", "cooking", "appetizer", "vegetarian"] },
  { dish: "Carrot Ginger Soup", mainIngredient: "carrots", tags: ["recipes", "cooking", "soup", "healthy"] },
  { dish: "Chicken Enchiladas Verde", mainIngredient: "corn tortillas", tags: ["recipes", "cooking", "mexican", "bake"] },
  { dish: "Beef Pad See Ew", mainIngredient: "wide rice noodles", tags: ["recipes", "cooking", "thai", "noodles"] },
  { dish: "Chocolate Brownies", mainIngredient: "dark chocolate", tags: ["recipes", "baking", "dessert", "american"] },
  { dish: "Apple Pie", mainIngredient: "pie crust dough", tags: ["recipes", "baking", "dessert", "american"] },
  { dish: "Cheesecake", mainIngredient: "cream cheese", tags: ["recipes", "baking", "dessert", "classic"] },
  { dish: "Banana Bread", mainIngredient: "ripe bananas", tags: ["recipes", "baking", "dessert", "breakfast"] },
  { dish: "Tiramisu", mainIngredient: "ladyfinger cookies", tags: ["recipes", "baking", "dessert", "italian"] },
  { dish: "Chocolate Chip Cookies", mainIngredient: "all-purpose flour", tags: ["recipes", "baking", "dessert", "cookies"] },
  { dish: "Lemon Bars", mainIngredient: "all-purpose flour", tags: ["recipes", "baking", "dessert", "citrus"] },
  { dish: "Pancakes", mainIngredient: "all-purpose flour", tags: ["recipes", "cooking", "breakfast", "american"] },
  { dish: "French Crepes", mainIngredient: "all-purpose flour", tags: ["recipes", "cooking", "french", "breakfast"] },
  { dish: "Shakshuka", mainIngredient: "ripe tomatoes", tags: ["recipes", "cooking", "middle-eastern", "breakfast"] },
  { dish: "Eggs Benedict", mainIngredient: "English muffins", tags: ["recipes", "cooking", "breakfast", "brunch"] },
  { dish: "Overnight Oats", mainIngredient: "rolled oats", tags: ["recipes", "cooking", "breakfast", "healthy"] },
];

if (RECIPES.length !== 100) {
  throw new Error(`Expected 100 recipes, got ${RECIPES.length}`);
}

const CARS: CarRow[] = [
  { partLabel: "engine oil filter", tagSlug: "oil-filter", tags: ["automotive", "parts", "vin", "maintenance"] },
  { partLabel: "engine air filter", tagSlug: "air-filter", tags: ["automotive", "parts", "vin", "maintenance"] },
  { partLabel: "cabin air filter", tagSlug: "cabin-filter", tags: ["automotive", "parts", "vin", "hvac"] },
  { partLabel: "spark plugs (set)", tagSlug: "spark-plugs", tags: ["automotive", "parts", "vin", "ignition"] },
  { partLabel: "front brake pads", tagSlug: "brake-pads-front", tags: ["automotive", "parts", "vin", "brakes"] },
  { partLabel: "rear brake pads", tagSlug: "brake-pads-rear", tags: ["automotive", "parts", "vin", "brakes"] },
  { partLabel: "wiper blades (pair)", tagSlug: "wiper-blades", tags: ["automotive", "parts", "vin", "exterior"] },
  { partLabel: "12V starter battery", tagSlug: "battery", tags: ["automotive", "parts", "vin", "electrical"] },
  { partLabel: "serpentine drive belt", tagSlug: "serpentine-belt", tags: ["automotive", "parts", "vin", "engine"] },
  { partLabel: "engine coolant (spec)", tagSlug: "coolant", tags: ["automotive", "parts", "vin", "fluids"] },
  { partLabel: "DOT brake fluid specification", tagSlug: "brake-fluid", tags: ["automotive", "parts", "vin", "fluids"] },
  { partLabel: "automatic transmission fluid (spec)", tagSlug: "atf", tags: ["automotive", "parts", "vin", "fluids"] },
  { partLabel: "fuel filter", tagSlug: "fuel-filter", tags: ["automotive", "parts", "vin", "fuel-system"] },
  { partLabel: "oxygen sensor (upstream)", tagSlug: "o2-sensor", tags: ["automotive", "parts", "vin", "emissions"] },
  { partLabel: "mass airflow (MAF) sensor", tagSlug: "maf-sensor", tags: ["automotive", "parts", "vin", "engine"] },
  { partLabel: "ignition coil", tagSlug: "ignition-coil", tags: ["automotive", "parts", "vin", "ignition"] },
  { partLabel: "alternator", tagSlug: "alternator", tags: ["automotive", "parts", "vin", "electrical"] },
  { partLabel: "starter motor", tagSlug: "starter", tags: ["automotive", "parts", "vin", "electrical"] },
  { partLabel: "water pump", tagSlug: "water-pump", tags: ["automotive", "parts", "vin", "cooling"] },
  { partLabel: "thermostat", tagSlug: "thermostat", tags: ["automotive", "parts", "vin", "cooling"] },
  { partLabel: "radiator", tagSlug: "radiator", tags: ["automotive", "parts", "vin", "cooling"] },
  { partLabel: "A/C compressor", tagSlug: "ac-compressor", tags: ["automotive", "parts", "vin", "hvac"] },
  { partLabel: "front wheel bearing", tagSlug: "wheel-bearing", tags: ["automotive", "parts", "vin", "suspension"] },
  { partLabel: "control arm bushing", tagSlug: "control-arm-bushing", tags: ["automotive", "parts", "vin", "suspension"] },
  { partLabel: "tie rod end", tagSlug: "tie-rod-end", tags: ["automotive", "parts", "vin", "steering"] },
  { partLabel: "front shock absorber", tagSlug: "shock-absorber", tags: ["automotive", "parts", "vin", "suspension"] },
  { partLabel: "strut mount", tagSlug: "strut-mount", tags: ["automotive", "parts", "vin", "suspension"] },
  { partLabel: "low beam headlight bulb", tagSlug: "headlight-bulb", tags: ["automotive", "parts", "vin", "lighting"] },
  { partLabel: "fog light bulb", tagSlug: "fog-light-bulb", tags: ["automotive", "parts", "vin", "lighting"] },
  { partLabel: "engine mount", tagSlug: "engine-mount", tags: ["automotive", "parts", "vin", "engine"] },
];

if (CARS.length !== 30) {
  throw new Error(`Expected 30 car prompts, got ${CARS.length}`);
}

function escapeCsvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function recipeBody(dish: string, mainIngredient: string): string {
  return (
    `You are an experienced home chef. Write a clear recipe for ${dish} scaled to use exactly ` +
    `\${mainIngredientGrams} g of ${mainIngredient} as the primary ingredient by weight in the dish. ` +
    `List all ingredients with amounts, step-by-step instructions, prep and cook timing, and 2 practical serving tips.`
  );
}

function carBody(partLabel: string): string {
  return (
    `You are an automotive parts specialist. For a passenger car with VIN \${vin}, identify OEM and ` +
    `common aftermarket catalog part numbers for ${partLabel}. Include manufacturer part numbers, ` +
    `compatible aftermarket brands, fitment notes, and state your confidence level for each match.`
  );
}

function toCsv(rows: { body: string; tags: string[] }[]): string {
  const lines = ["body,tags,is_public"];
  for (const row of rows) {
    lines.push(
      `${escapeCsvField(row.body)},${escapeCsvField(row.tags.join(","))},true`,
    );
  }
  return `${lines.join("\n")}\n`;
}

const recipeCsv = toCsv(
  RECIPES.map((r) => ({
    body: recipeBody(r.dish, r.mainIngredient),
    tags: r.tags,
  })),
);

const carCsv = toCsv(
  CARS.map((c) => ({
    body: carBody(c.partLabel),
    tags: [...c.tags, c.tagSlug],
  })),
);

writeFileSync(join(OUT_DIR, "reciepies_01.csv"), recipeCsv, "utf8");
writeFileSync(join(OUT_DIR, "cars_01.csv"), carCsv, "utf8");

console.log(`Wrote reciepies_01.csv (${RECIPES.length} rows)`);
console.log(`Wrote cars_01.csv (${CARS.length} rows)`);
