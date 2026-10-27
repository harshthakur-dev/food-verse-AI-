export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dietaryGoal: string;
  calorieTarget: number;
  allergies: string[];
  role: 'user' | 'chef' | 'auditor' | 'admin';
  createdAt: string;
}

export interface EpicTracker {
  id: string;
  epicNumber: number;
  title: string;
  description: string;
  status: 'In Progress' | 'Completed' | 'Ready for Review';
  tasks: Array<{
    id: string;
    taskNumber: number;
    title: string;
    completed: boolean;
    layer: 'Frontend' | 'Backend' | 'AI Service';
  }>;
}

class MemoryStore {
  public users: Map<string, UserProfile> = new Map();
  public foodScans: any[] = [];
  public freshnessReports: any[] = [];
  public hygieneAudits: any[] = [];
  public savedRecipes: any[] = [];
  public mealPlans: any[] = [];
  public epics: EpicTracker[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Default demo user
    const defaultUser: UserProfile = {
      id: 'usr-foodverse-demo',
      name: 'Chef Harsh Thakur',
      email: 'thakurharsh22006@gmail.com',
      dietaryGoal: 'High Protein & Lean Athleticism',
      calorieTarget: 2200,
      allergies: ['Peanuts'],
      role: 'chef',
      createdAt: new Date().toISOString(),
    };
    this.users.set(defaultUser.id, defaultUser);

    // Seed recent scans
    this.foodScans = [
      {
        id: 'scan-1',
        userId: 'usr-foodverse-demo',
        dishName: 'Mediterranean Wild Salmon & Quinoa Bowl',
        category: 'Lunch / Superfood',
        healthScore: 94,
        healthGrade: 'A+',
        nutritionalBreakdown: {
          calories: 520,
          proteinGrams: 42,
          carbsGrams: 38,
          fatGrams: 22,
          fiberGrams: 7,
          sodiumMg: 380,
          sugarGrams: 3,
          glycemicIndex: 'Low',
        },
        allergens: ['Fish'],
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'scan-2',
        userId: 'usr-foodverse-demo',
        dishName: 'Poached Farm Eggs on Sourdough with Smashed Avocado',
        category: 'Breakfast',
        healthScore: 91,
        healthGrade: 'A',
        nutritionalBreakdown: {
          calories: 385,
          proteinGrams: 18,
          carbsGrams: 32,
          fatGrams: 21,
          fiberGrams: 9,
          sodiumMg: 340,
          sugarGrams: 2,
          glycemicIndex: 'Low',
        },
        allergens: ['Eggs', 'Gluten'],
        timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
      },
    ];

    // Seed freshness reports
    this.freshnessReports = [
      {
        id: 'fresh-1',
        userId: 'usr-foodverse-demo',
        itemName: 'Hass Avocados (Batch A-4)',
        category: 'Produce',
        status: 'Fresh',
        freshnessScore: 95,
        estimatedShelfLifeDays: 5,
        sensoryIndicators: {
          colorIntegrity: 96,
          surfaceTexture: 94,
          moistureBalance: 92,
          microbialRisk: 6,
        },
        safetyVerdict: 'Safe for Consumption',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'fresh-2',
        userId: 'usr-foodverse-demo',
        itemName: 'Organic Strawberries',
        category: 'Produce',
        status: 'Moderately Fresh',
        freshnessScore: 68,
        estimatedShelfLifeDays: 2,
        sensoryIndicators: {
          colorIntegrity: 68,
          surfaceTexture: 64,
          moistureBalance: 72,
          microbialRisk: 34,
        },
        safetyVerdict: 'Cook/Consume Promptly',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80',
      },
    ];

    // Seed hygiene audits
    this.hygieneAudits = [
      {
        id: 'audit-1',
        stationName: 'Station 1: Hot Line & Saute Pass',
        inspectionTimestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        overallScore: 94,
        letterGrade: 'Grade A',
        complianceBreakdown: {
          gloveCompliancePercent: 98,
          hairCapCompliancePercent: 100,
          crossContaminationScore: 96,
          surfaceCleanlinessScore: 92,
          foodSafetyProtocolsScore: 95,
        },
        detectedViolations: [
          {
            id: 'v-1',
            category: 'SURFACE_SANITATION',
            severity: 'MINOR',
            description: 'Sanitizer bottle temporarily resting on food contact surface.',
            timestamp: '00:42',
            confidence: 0.89,
            locationInFrame: 'Front Counter Edge',
            correctiveAction: 'Store sanitizer bottle in designated lower shelf holster.'
          }
        ],
        positiveObservations: [
          'Full disposable hair restraint compliance.',
          'Color-coded cutting boards properly segregated.'
        ],
        auditorSummary: 'Pristine sanitary standards. Ready for high-volume service.',
        haccpCertificationStatus: 'PASSED',
      },
    ];

    // Seed Epics & 16 Tasks as specified in user prompt
    this.epics = [
      {
        id: 'epic-1',
        epicNumber: 1,
        title: 'Multimodal Food Intelligence Foundation',
        description: 'Unified architecture combining computer vision, audio processing, and LLM reasoning engines.',
        status: 'Completed',
        tasks: [
          { id: 't-1', taskNumber: 1, title: 'Establish Express + Vite Fullstack Bridge & API Routing', completed: true, layer: 'Backend' },
          { id: 't-2', taskNumber: 2, title: 'Centralize Google GenAI Server Multimodal Client', completed: true, layer: 'AI Service' },
        ],
      },
      {
        id: 'epic-2',
        epicNumber: 2,
        title: 'Computer Vision Food Recognition',
        description: 'Automatic dish identification, ingredient extraction, and portion estimation.',
        status: 'Completed',
        tasks: [
          { id: 't-3', taskNumber: 3, title: 'Multimodal Image Analysis & Bounding Tag Identification', completed: true, layer: 'AI Service' },
          { id: 't-4', taskNumber: 4, title: 'Camera & Live Drag-and-Drop Food Scanner UI', completed: true, layer: 'Frontend' },
        ],
      },
      {
        id: 'epic-3',
        epicNumber: 3,
        title: 'Precision Nutrition & Health Scoring',
        description: 'Macronutrient breakdown (calories, protein, carbs, fats), micronutrients, and A-F health grade.',
        status: 'Completed',
        tasks: [
          { id: 't-5', taskNumber: 5, title: 'Glycemic Index & Allergen Detection Pipeline', completed: true, layer: 'Backend' },
          { id: 't-6', taskNumber: 6, title: 'Interactive Nutritional Breakdown & Metric Visualizations', completed: true, layer: 'Frontend' },
        ],
      },
      {
        id: 'epic-4',
        epicNumber: 4,
        title: 'Visual Food Freshness & Spoilage Detection',
        description: 'Classification into Fresh, Moderately Fresh, Spoiled with shelf-life prediction and sensory markers.',
        status: 'Completed',
        tasks: [
          { id: 't-7', taskNumber: 7, title: 'Optical Discoloration & Texture Degradation Classifier', completed: true, layer: 'AI Service' },
          { id: 't-8', taskNumber: 8, title: 'Freshness Radar & Waste Prevention Guidance Module', completed: true, layer: 'Frontend' },
        ],
      },
      {
        id: 'epic-5',
        epicNumber: 5,
        title: 'Commercial Kitchen & Hygiene Monitoring',
        description: 'Kitchen video / CCTV frame inspection for glove usage, hair caps, and cross-contamination risks.',
        status: 'Completed',
        tasks: [
          { id: 't-9', taskNumber: 9, title: 'PPE & HACCP Cross-Contamination Risk Detector', completed: true, layer: 'AI Service' },
          { id: 't-10', taskNumber: 10, title: 'Live Kitchen Audit Dashboard & Violation Timeline', completed: true, layer: 'Frontend' },
        ],
      },
      {
        id: 'epic-6',
        epicNumber: 6,
        title: 'Smart Cooking Assistant & AI Voice Chef',
        description: 'Fridge ingredient matcher, step-by-step guidance, built-in kitchen timers, and audio advice.',
        status: 'Completed',
        tasks: [
          { id: 't-11', taskNumber: 11, title: 'Pantry Recipe Generator & Substitution Logic Engine', completed: true, layer: 'AI Service' },
          { id: 't-12', taskNumber: 12, title: 'Interactive Guided Cooking Mode with Audio & Timers', completed: true, layer: 'Frontend' },
        ],
      },
      {
        id: 'epic-7',
        epicNumber: 7,
        title: 'Personalized Adaptive Meal Planning',
        description: '7-Day meal plans tailored to dietary goals (Keto, Mediterranean, High Protein) with grocery list.',
        status: 'Completed',
        tasks: [
          { id: 't-13', taskNumber: 13, title: 'Algorithmic 7-Day Macro-Optimized Meal Scheduler', completed: true, layer: 'AI Service' },
          { id: 't-14', taskNumber: 14, title: 'Personalized Planner Calendar & Interactive Grocery Checklist', completed: true, layer: 'Frontend' },
        ],
      },
      {
        id: 'epic-8',
        epicNumber: 8,
        title: 'Multimodal Voice & Audio Agent',
        description: 'Real-time conversational food intelligence assistant with speech recognition and speech output.',
        status: 'Completed',
        tasks: [
          { id: 't-15', taskNumber: 15, title: 'Multimodal Audio/Speech Chef Assistant Bridge', completed: true, layer: 'Backend' },
        ],
      },
      {
        id: 'epic-9',
        epicNumber: 9,
        title: 'Fullstack Modular Architecture & Microservice Bridge',
        description: 'Modular Node/Express backend, Python FastAPI microservice architecture, and MongoDB-compatible store.',
        status: 'Completed',
        tasks: [
          { id: 't-16', taskNumber: 16, title: 'Unified Microservices Architecture & Telemetry Bridge', completed: true, layer: 'Backend' },
        ],
      },
    ];
  }
}

export const store = new MemoryStore();
