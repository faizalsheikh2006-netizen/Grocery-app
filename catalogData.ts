export interface CatalogItem { name: string; unit: string; category: string; icon: string; gst: number }
// [category, icon, default GST %, "Name|pack size|optional GST; ..."]. GST values are common defaults: verify for your products.
const RAW: [string, string, number, string][] = [
  ['Atta, Rice & Grains', '🌾', 5, 'Wheat Atta|5 kg;Wheat Atta|10 kg;Maida|1 kg;Besan|500 g;Suji (Rava)|500 g;Basmati Rice|1 kg;Basmati Rice|5 kg;Sona Masoori Rice|1 kg;Poha|500 g;Daliya|500 g;Sabudana|500 g;Vermicelli (Sevai)|200 g;Rice Flour|500 g'],
  ['Dal & Pulses', '🫘', 5, 'Toor Dal|1 kg;Moong Dal|1 kg;Moong Dal Chilka|1 kg;Chana Dal|1 kg;Masoor Dal|1 kg;Urad Dal|1 kg;Kabuli Chana|1 kg;Kala Chana|1 kg;Rajma|1 kg;Green Moong|1 kg;Dried Peas (Matar)|1 kg;Soya Chunks|200 g'],
  ['Oil & Ghee', '🛢️', 5, 'Sunflower Oil|1 L;Sunflower Oil|5 L;Mustard Oil|1 L;Groundnut Oil|1 L;Soybean Oil|1 L;Refined Oil Pouch|500 ml;Ghee|500 ml;Ghee|1 L;Vanaspati|1 kg;Coconut Oil|500 ml'],
  ['Spices & Masala', '🌶️', 5, 'Turmeric Powder|200 g;Red Chilli Powder|200 g;Coriander Powder|200 g;Garam Masala|100 g;Jeera (Cumin)|100 g;Rai (Mustard Seeds)|100 g;Black Pepper|50 g;Elaichi (Cardamom)|50 g;Laung (Cloves)|50 g;Dalchini (Cinnamon)|50 g;Bay Leaf|50 g;Hing|50 g;Kasuri Methi|50 g;Chaat Masala|100 g;Sabzi Masala|100 g;Pav Bhaji Masala|100 g;Chole Masala|100 g'],
  ['Sugar, Salt & Sweet', '🧂', 5, 'Sugar|1 kg;Sugar|5 kg;Jaggery (Gur)|1 kg;Salt|1 kg|0;Rock Salt|500 g|0;Honey|250 g'],
  ['Tea, Coffee & Drinks', '☕', 5, 'Tea Powder|250 g;Tea Powder|500 g;Instant Coffee|50 g|18;Green Tea|25 bags|18;Glucose Powder|200 g|18;Health Drink Powder|500 g|18;Cold Drink|750 ml|18;Cold Drink|2 L|18;Packaged Juice|1 L|12;Packaged Water|1 L|18;Soda|600 ml|18'],
  ['Dairy & Eggs', '🥛', 5, 'Milk Pouch|500 ml|0;Milk Pouch|1 L|0;Curd|400 g;Paneer|200 g;Butter|100 g;Butter|500 g;Cheese Slices|200 g;Eggs|12 pcs|0;Eggs|Tray of 30|0;Bread|400 g|0;Lassi|200 ml'],
  ['Biscuits & Snacks', '🍪', 12, 'Glucose Biscuit|Family pack;Marie Biscuit|Family pack;Cream Biscuit|Pack;Rusk|Pack;Namkeen Mixture|200 g|12;Bhujia Sev|200 g|12;Potato Chips|50 g|12;Corn Puffs|Pack|12;Popcorn|Pack|12;Cake|Pack|18;Chocolate|Bar|18;Candy / Toffee|Pack|18;Chewing Gum|Pack|18'],
  ['Noodles & Ready Food', '🍜', 12, 'Instant Noodles|70 g;Pasta|500 g;Tomato Ketchup|1 kg;Jam|500 g;Pickle|500 g|12;Papad|200 g|5;Peanut Butter|340 g;Soya Sauce|200 ml;Vinegar|500 ml;Custard Powder|100 g'],
  ['Dry Fruits', '🥜', 5, 'Almonds (Badam)|250 g;Cashew (Kaju)|250 g;Raisins (Kishmish)|250 g;Dates (Khajoor)|500 g;Peanuts|500 g;Walnuts (Akhrot)|250 g;Pistachio|100 g;Dry Coconut (Khopra)|1 pc;Makhana|100 g'],
  ['Vegetables', '🥬', 0, 'Potato (Aloo)|1 kg;Onion (Pyaz)|1 kg;Tomato|1 kg;Garlic (Lahsun)|250 g;Ginger (Adrak)|250 g;Green Chilli|100 g;Lemon|1 pc;Coriander Leaves|1 bunch;Carrot|1 kg;Cabbage|1 kg;Cauliflower|1 pc;Brinjal (Baingan)|1 kg;Lady Finger (Bhindi)|1 kg;Capsicum|1 kg;Cucumber|1 kg;Spinach (Palak)|1 bunch'],
  ['Fruits', '🍎', 0, 'Banana|1 dozen;Apple|1 kg;Orange|1 kg;Papaya|1 kg;Watermelon|1 kg;Mango|1 kg;Grapes|1 kg;Pomegranate|1 kg'],
  ['Household & Cleaning', '🧺', 18, 'Detergent Powder|1 kg;Detergent Bar|1 pc;Dishwash Bar|1 pc;Dishwash Liquid|500 ml;Floor Cleaner|1 L;Toilet Cleaner|500 ml;Phenyl|1 L;Matchbox|1 pc;Agarbatti|1 pack|12;Candle|1 pack;Mosquito Coil|1 pack;Garbage Bags|1 pack;Aluminium Foil|1 roll;Tissue Paper|1 pack;Scrub Pad|1 pc'],
  ['Personal Care', '🧼', 18, 'Bath Soap|100 g;Shampoo Sachet|1 pc;Shampoo|180 ml;Toothpaste|100 g;Toothbrush|1 pc;Hair Oil|200 ml;Face Wash|50 g;Talcum Powder|100 g;Deodorant|150 ml;Razor|1 pc;Sanitary Pads|1 pack|12;Handwash|200 ml;Cold Cream|50 g'],
  ['Baby & Pooja', '🍼', 18, 'Baby Diapers|1 pack;Baby Food|300 g|5;Baby Powder|100 g;Camphor (Kapoor)|1 pack|12;Dhoop Sticks|1 pack|12;Pooja Oil|500 ml|5;Roli / Kumkum|1 pack|12'],
]
export const CATALOG: CatalogItem[] = RAW.flatMap(([category, icon, g, s]) => s.split(';').map(x => {
  const [name, unit, gst] = x.split('|'); return { name: name.trim(), unit: unit.trim(), category, icon, gst: gst ? Number(gst) : g } }))
export const CATEGORIES = RAW.map(r => r[0])
export const itemKey = (i: CatalogItem) => `${i.name} ${i.unit}`
