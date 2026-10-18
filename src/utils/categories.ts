import { Category, Transaction } from '../types/finance';

export const DEFAULT_CATEGORIES: Category[] = [
  // Food & Dining
  {
    id: 'food_groceries',
    name: 'Groceries',
    group: 'Food & Dining',
    iconName: 'ShoppingBag',
    color: '#10b981',
    type: 'expense',
    keywords: ['grocery', 'supermarket', 'mart', 'vegetables', 'fruits', 'milk', 'bread', 'walmart', 'carrefour', 'store', 'market', 'provisions', 'meat', 'chicken'],
  },
  {
    id: 'food_restaurants',
    name: 'Restaurants',
    group: 'Food & Dining',
    iconName: 'Utensils',
    color: '#059669',
    type: 'expense',
    keywords: ['restaurant', 'dining', 'bistro', 'cafe', 'dinner', 'lunch', 'breakfast', 'buffet', 'steak', 'sushi', 'italian', 'pizza'],
  },
  {
    id: 'food_fast_food',
    name: 'Fast Food',
    group: 'Food & Dining',
    iconName: 'Pizza',
    color: '#047857',
    type: 'expense',
    keywords: ['mcdonald', 'kfc', 'burger', 'subway', 'wendy', 'taco', 'fries', 'domino', 'shawarma', 'fast food'],
  },
  {
    id: 'food_coffee',
    name: 'Tea & Coffee',
    group: 'Food & Dining',
    iconName: 'Coffee',
    color: '#065f46',
    type: 'expense',
    keywords: ['coffee', 'tea', 'starbucks', 'espresso', 'cappuccino', 'cafe', 'chai', 'costa', 'dunkin'],
  },
  {
    id: 'food_delivery',
    name: 'Food Delivery',
    group: 'Food & Dining',
    iconName: 'Bike',
    color: '#34d399',
    type: 'expense',
    keywords: ['foodpanda', 'ubereats', 'doordash', 'deliveroo', 'grubhub', 'delivery', 'zomato', 'swiggy'],
  },

  // Housing
  {
    id: 'house_rent',
    name: 'Rent',
    group: 'Housing',
    iconName: 'Home',
    color: '#3b82f6',
    type: 'expense',
    keywords: ['rent', 'landlord', 'apartment rent', 'house rent', 'flat rent', 'room rent'],
  },
  {
    id: 'house_maintenance',
    name: 'Home Maintenance',
    group: 'Housing',
    iconName: 'Wrench',
    color: '#2563eb',
    type: 'expense',
    keywords: ['repair', 'plumber', 'electrician', 'paint', 'maintenance', 'hardware', 'locksmith', 'renovation', 'cleaning'],
  },
  {
    id: 'house_furniture',
    name: 'Furniture',
    group: 'Housing',
    iconName: 'Armchair',
    color: '#1d4ed8',
    type: 'expense',
    keywords: ['furniture', 'ikea', 'sofa', 'table', 'chair', 'bed', 'mattress', 'desk', 'curtains', 'decor'],
  },
  {
    id: 'house_supplies',
    name: 'Household Supplies',
    group: 'Housing',
    iconName: 'Package',
    color: '#60a5fa',
    type: 'expense',
    keywords: ['detergent', 'toilet paper', 'cleaning supplies', 'mop', 'disinfectant', 'trash bags'],
  },

  // Transportation
  {
    id: 'trans_fuel',
    name: 'Fuel',
    group: 'Transportation',
    iconName: 'Fuel',
    color: '#f59e0b',
    type: 'expense',
    keywords: ['petrol', 'fuel', 'gasoline', 'diesel', 'shell', 'total', 'caltex', 'chevron', 'filling station', 'gas station', 'oil'],
  },
  {
    id: 'trans_public',
    name: 'Public Transport',
    group: 'Transportation',
    iconName: 'Bus',
    color: '#d97706',
    type: 'expense',
    keywords: ['bus', 'metro', 'subway', 'train', 'ticket', 'fare', 'transit', 'tram', 'railway'],
  },
  {
    id: 'trans_ride_hailing',
    name: 'Ride-Hailing',
    group: 'Transportation',
    iconName: 'Car',
    color: '#b45309',
    type: 'expense',
    keywords: ['uber', 'careem', 'lyft', 'taxi', 'cab', 'bolt', 'indrive', 'grab', 'ride'],
  },
  {
    id: 'trans_maintenance',
    name: 'Vehicle Maintenance',
    group: 'Transportation',
    iconName: 'Settings',
    color: '#78350f',
    type: 'expense',
    keywords: ['car service', 'bike service', 'mechanic', 'tire', 'tyre', 'oil change', 'car wash', 'vehicle repair'],
  },
  {
    id: 'trans_parking',
    name: 'Parking',
    group: 'Transportation',
    iconName: 'SquareParking',
    color: '#fbbf24',
    type: 'expense',
    keywords: ['parking', 'toll', 'toll plaza', 'parking fee', 'valet'],
  },

  // Health
  {
    id: 'health_medicines',
    name: 'Medicines',
    group: 'Health',
    iconName: 'Pill',
    color: '#ef4444',
    type: 'expense',
    keywords: ['pharmacy', 'medicine', 'prescription', 'drugs', 'pills', 'chemist', 'walgreens', 'boots', 'cvs'],
  },
  {
    id: 'health_doctor',
    name: 'Doctor Visits',
    group: 'Health',
    iconName: 'Stethoscope',
    color: '#dc2626',
    type: 'expense',
    keywords: ['doctor', 'clinic', 'consultation', 'physician', 'dentist', 'specialist', 'pediatrician'],
  },
  {
    id: 'health_hospital',
    name: 'Hospital',
    group: 'Health',
    iconName: 'Building2',
    color: '#b91c1c',
    type: 'expense',
    keywords: ['hospital', 'emergency', 'surgery', 'admission', 'inpatient'],
  },
  {
    id: 'health_tests',
    name: 'Medical Tests',
    group: 'Health',
    iconName: 'Activity',
    color: '#991b1b',
    type: 'expense',
    keywords: ['lab', 'blood test', 'x-ray', 'mri', 'diagnostic', 'ct scan', 'ultrasound', 'pathology'],
  },
  {
    id: 'health_fitness',
    name: 'Fitness & Wellness',
    group: 'Health',
    iconName: 'Dumbbell',
    color: '#f87171',
    type: 'expense',
    keywords: ['gym', 'fitness', 'workout', 'yoga', 'supplements', 'protein', 'crossfit', 'massage', 'spa'],
  },

  // Education
  {
    id: 'edu_school',
    name: 'School Fees',
    group: 'Education',
    iconName: 'GraduationCap',
    color: '#8b5cf6',
    type: 'expense',
    keywords: ['school fee', 'school tuition', 'academy', 'kindergarten', 'daycare'],
  },
  {
    id: 'edu_university',
    name: 'University Fees',
    group: 'Education',
    iconName: 'School',
    color: '#7c3aed',
    type: 'expense',
    keywords: ['university fee', 'college fee', 'tuition', 'semester fee', 'campus'],
  },
  {
    id: 'edu_courses',
    name: 'Courses & Certifications',
    group: 'Education',
    iconName: 'BookOpen',
    color: '#6d28d9',
    type: 'expense',
    keywords: ['udemy', 'coursera', 'course', 'certification', 'training', 'bootcamp', 'workshop'],
  },
  {
    id: 'edu_books',
    name: 'Books & Stationery',
    group: 'Education',
    iconName: 'BookMarked',
    color: '#5b21b6',
    type: 'expense',
    keywords: ['book', 'stationery', 'notebook', 'pen', 'pencil', 'textbook', 'kindle', 'library'],
  },

  // Utilities & Bills
  {
    id: 'util_electricity',
    name: 'Electricity',
    group: 'Utilities & Bills',
    iconName: 'Zap',
    color: '#eab308',
    type: 'expense',
    keywords: ['electricity', 'electric bill', 'power bill', 'kelectric', 'lesco', 'iesco', 'utility electric'],
  },
  {
    id: 'util_gas',
    name: 'Gas',
    group: 'Utilities & Bills',
    iconName: 'Flame',
    color: '#ea580c',
    type: 'expense',
    keywords: ['gas bill', 'sui gas', 'natural gas', 'cylinder', 'lpg'],
  },
  {
    id: 'util_water',
    name: 'Water',
    group: 'Utilities & Bills',
    iconName: 'Droplet',
    color: '#0284c7',
    type: 'expense',
    keywords: ['water bill', 'water tanker', 'water supply', 'water sewerage', 'utility water'],
  },
  {
    id: 'util_internet',
    name: 'Internet',
    group: 'Utilities & Bills',
    iconName: 'Wifi',
    color: '#6366f1',
    type: 'expense',
    keywords: ['wifi', 'internet', 'broadband', 'fiber', 'ptcl', 'stormfiber', 'nayatel', 'spectrum', 'comcast'],
  },
  {
    id: 'util_mobile',
    name: 'Mobile Recharge & Bills',
    group: 'Utilities & Bills',
    iconName: 'Smartphone',
    color: '#4f46e5',
    type: 'expense',
    keywords: ['mobile recharge', 'phone bill', 'postpaid', 'prepaid', 'airtime', 'jazz', 'telenor', 'zong', 'ufone', 'verizon', 'at&t'],
  },

  // Personal
  {
    id: 'pers_clothing',
    name: 'Clothing',
    group: 'Personal',
    iconName: 'Shirt',
    color: '#ec4899',
    type: 'expense',
    keywords: ['clothes', 'shirt', 'pants', 'shoes', 'dress', 'zara', 'h&m', 'outfit', 'garments', 'apparel'],
  },
  {
    id: 'pers_care',
    name: 'Personal Care',
    group: 'Personal',
    iconName: 'Sparkles',
    color: '#db2777',
    type: 'expense',
    keywords: ['salon', 'barber', 'haircut', 'cosmetics', 'makeup', 'skincare', 'shampoo', 'hygiene'],
  },
  {
    id: 'pers_entertainment',
    name: 'Entertainment',
    group: 'Personal',
    iconName: 'Film',
    color: '#be185d',
    type: 'expense',
    keywords: ['cinema', 'movie', 'concert', 'gaming', 'steam', 'playstation', 'outing', 'bowling', 'museum'],
  },
  {
    id: 'pers_shopping',
    name: 'Shopping',
    group: 'Personal',
    iconName: 'ShoppingBag',
    color: '#9d174d',
    type: 'expense',
    keywords: ['shopping', 'amazon', 'aliexpress', 'daraz', 'mall', 'electronics', 'gadgets'],
  },
  {
    id: 'pers_subscriptions',
    name: 'Subscriptions',
    group: 'Personal',
    iconName: 'CreditCard',
    color: '#f43f5e',
    type: 'expense',
    keywords: ['netflix', 'spotify', 'youtube premium', 'apple tv', 'disney', 'icloud', 'google one', 'chatgpt', 'subscription'],
  },

  // Financial
  {
    id: 'fin_bank_fees',
    name: 'Bank Fees',
    group: 'Financial',
    iconName: 'Landmark',
    color: '#64748b',
    type: 'expense',
    keywords: ['bank fee', 'atm fee', 'maintenance fee', 'service charge', 'card renewal fee', 'wire fee'],
  },
  {
    id: 'fin_interest',
    name: 'Interest & Charges',
    group: 'Financial',
    iconName: 'Percent',
    color: '#475569',
    type: 'expense',
    keywords: ['interest charge', 'late fee', 'penalty', 'finance charge', 'markup'],
  },

  // Other Expenses
  {
    id: 'other_gifts',
    name: 'Gifts & Donations',
    group: 'Other',
    iconName: 'Gift',
    color: '#14b8a6',
    type: 'expense',
    keywords: ['gift', 'present', 'donation', 'charity', 'zakat', 'sadqah', 'tip', 'contribution'],
  },
  {
    id: 'other_travel',
    name: 'Travel & Vacations',
    group: 'Other',
    iconName: 'Plane',
    color: '#0d9488',
    type: 'expense',
    keywords: ['travel', 'flight', 'hotel', 'airbnb', 'vacation', 'trip', 'airline', 'resort', 'tourism'],
  },
  {
    id: 'other_family',
    name: 'Family Expenses',
    group: 'Other',
    iconName: 'Users',
    color: '#0f766e',
    type: 'expense',
    keywords: ['family', 'kids', 'parents', 'allowance', 'pocket money', 'household'],
  },
  {
    id: 'other_misc',
    name: 'Miscellaneous',
    group: 'Other',
    iconName: 'HelpCircle',
    color: '#94a3b8',
    type: 'expense',
    keywords: ['misc', 'general', 'other', 'unknown', 'various'],
  },

  // Income Categories
  {
    id: 'inc_salary',
    name: 'Salary',
    group: 'Income',
    iconName: 'Wallet',
    color: '#10b981',
    type: 'income',
    keywords: ['salary', 'paycheck', 'payroll', 'monthly wages', 'stipend', 'compensation'],
  },
  {
    id: 'inc_freelance',
    name: 'Freelance & Contract',
    group: 'Income',
    iconName: 'Laptop',
    color: '#059669',
    type: 'income',
    keywords: ['freelance', 'upwork', 'fiverr', 'contract', 'consulting', 'client payment', 'gig'],
  },
  {
    id: 'inc_business',
    name: 'Business Income',
    group: 'Income',
    iconName: 'Briefcase',
    color: '#047857',
    type: 'income',
    keywords: ['business', 'sales', 'revenue', 'store income', 'profit', 'merchant payout'],
  },
  {
    id: 'inc_investment',
    name: 'Investment Income',
    group: 'Income',
    iconName: 'TrendingUp',
    color: '#065f46',
    type: 'income',
    keywords: ['dividend', 'stock profit', 'crypto', 'interest earned', 'capital gain', 'shares', 'rental income'],
  },
  {
    id: 'inc_gift',
    name: 'Gifts Received',
    group: 'Income',
    iconName: 'Gift',
    color: '#34d399',
    type: 'income',
    keywords: ['gift received', 'eidi', 'birthday money', 'reward', 'bonus', 'cash gift'],
  },
  {
    id: 'inc_other',
    name: 'Other Income',
    group: 'Income',
    iconName: 'PlusCircle',
    color: '#6ee7b7',
    type: 'income',
    keywords: ['reimbursement', 'tax return', 'rebate', 'lottery', 'miscellaneous income'],
  },
];

export interface CategorySuggestion {
  category: Category;
  confidence: number; // 0 to 1
  source: 'history' | 'rule' | 'default';
}

/**
 * Intelligent hybrid categorization matching description against rules and user history
 */
export function suggestCategory(
  description: string,
  transactionType: string,
  categories: Category[],
  historicalTransactions: Transaction[] = []
): CategorySuggestion | null {
  const cleanDesc = description.trim().toLowerCase();
  if (!cleanDesc) return null;

  const isIncome = transactionType === 'income';

  // 1. Check historical matches first (Learning from user corrections)
  if (historicalTransactions.length > 0) {
    const directHistoryMatch = historicalTransactions.find(
      (t) => t.description.trim().toLowerCase() === cleanDesc &&
             ((isIncome && t.type === 'income') || (!isIncome && t.type === 'expense'))
    );

    if (directHistoryMatch) {
      const cat = categories.find((c) => c.id === directHistoryMatch.categoryId);
      if (cat) {
        return { category: cat, confidence: 0.98, source: 'history' };
      }
    }

    // Partial history match (e.g. contains vendor name)
    const partialHistoryMatch = historicalTransactions.find(
      (t) => cleanDesc.includes(t.description.trim().toLowerCase()) ||
             t.description.trim().toLowerCase().includes(cleanDesc)
    );
    if (partialHistoryMatch && partialHistoryMatch.description.trim().length >= 4) {
      const cat = categories.find((c) => c.id === partialHistoryMatch.categoryId);
      if (cat) {
        return { category: cat, confidence: 0.88, source: 'history' };
      }
    }
  }

  // 2. Rule-based keyword matching
  const candidateCategories = categories.filter((c) =>
    isIncome ? c.type === 'income' : c.type === 'expense' || c.type === 'both'
  );

  let bestMatch: Category | null = null;
  let highestScore = 0;

  for (const cat of candidateCategories) {
    // Check category name directly
    if (cleanDesc.includes(cat.name.toLowerCase())) {
      return { category: cat, confidence: 0.95, source: 'rule' };
    }

    if (cat.keywords && cat.keywords.length > 0) {
      for (const kw of cat.keywords) {
        const kwLower = kw.toLowerCase();
        if (cleanDesc === kwLower) {
          return { category: cat, confidence: 0.96, source: 'rule' };
        }
        if (cleanDesc.includes(kwLower)) {
          // Weight longer matches higher
          const score = 0.75 + Math.min(0.2, (kwLower.length / cleanDesc.length) * 0.2);
          if (score > highestScore) {
            highestScore = score;
            bestMatch = cat;
          }
        }
      }
    }
  }

  if (bestMatch && highestScore >= 0.75) {
    return { category: bestMatch, confidence: Number(highestScore.toFixed(2)), source: 'rule' };
  }

  return null;
}
