const mongoose = require('mongoose');
const Lab = require('./models/Lab');
const Test = require('./models/Test');

const standardTests = [
    {
        testName: "Complete Blood Count (CBC)",
        price: 350,
        discountedPrice: 299,
        category: "Blood",
        description: "Assesses overall health and detects a wide range of disorders including anemia and infection.",
        turnaroundTime: "12 Hours"
    },
    {
        testName: "Thyroid Profile (T3, T4, TSH)",
        price: 600,
        discountedPrice: 499,
        category: "Blood",
        description: "Evaluates thyroid gland function and helps diagnose thyroid disorders.",
        turnaroundTime: "24 Hours"
    },
    {
        testName: "Lipid Profile (Cholesterol)",
        price: 500,
        discountedPrice: 399,
        category: "Blood",
        description: "Measures cholesterol and triglyceride levels to assess cardiovascular risk.",
        turnaroundTime: "12 Hours"
    },
    {
        testName: "Diabetes Screening (HbA1c & Fasting Sugar)",
        price: 450,
        discountedPrice: 349,
        category: "Blood",
        description: "Monitors long-term blood sugar levels and screens for diabetes. Fasting required.",
        turnaroundTime: "12 Hours"
    },
    {
        testName: "Kidney Function Test (KFT)",
        price: 700,
        discountedPrice: 599,
        category: "Urine",
        description: "Evaluates kidney health by measuring urea, creatinine, and electrolytes.",
        turnaroundTime: "24 Hours"
    },
    {
        testName: "Liver Function Test (LFT)",
        price: 800,
        discountedPrice: 649,
        category: "Blood",
        description: "Measures enzymes, proteins, and bilirubin to assess liver health.",
        turnaroundTime: "24 Hours"
    },
    {
        testName: "Vitamin D3 (25-Hydroxy)",
        price: 1200,
        discountedPrice: 899,
        category: "Blood",
        description: "Measures vitamin D levels to monitor bone health and immune function.",
        turnaroundTime: "24 Hours"
    },
    {
        testName: "Vitamin B12",
        price: 900,
        discountedPrice: 699,
        category: "Blood",
        description: "Assesses Vitamin B12 levels which are crucial for nerve function and RBC production.",
        turnaroundTime: "24 Hours"
    },
    {
        testName: "Urine Routine & Microscopy",
        price: 250,
        discountedPrice: 199,
        category: "Urine",
        description: "Screens for urinary tract infections, kidney disease, and diabetes.",
        turnaroundTime: "8 Hours"
    },
    {
        testName: "X-Ray Chest PA View",
        price: 400,
        discountedPrice: 350,
        category: "Scan",
        description: "Produces images of the heart, lungs, airways, blood vessels, and chest bones.",
        turnaroundTime: "4 Hours"
    }
];

const seed = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/diagnolabs');
        console.log("Connected to local database...");
        
        // Remove existing tests
        await Test.deleteMany({});
        console.log("Cleared existing tests.");
        
        const labs = await Lab.find({});
        if (labs.length === 0) {
            console.log("No labs found in the database. Please run the collector first.");
            process.exit(1);
        }
        
        console.log(`Seeding tests for ${labs.length} labs...`);
        
        const testsToInsert = [];
        for (const lab of labs) {
            // Assign a random subset of standard tests to each lab
            const numTests = Math.floor(Math.random() * 4) + 5; // Each lab gets 5 to 8 tests
            const shuffled = [...standardTests].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, numTests);
            
            selected.forEach(t => {
                testsToInsert.push({
                    ...t,
                    lab: lab._id
                });
            });
        }
        
        await Test.insertMany(testsToInsert);
        console.log(`Successfully seeded ${testsToInsert.length} diagnostic tests!`);
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err.message);
        process.exit(1);
    }
};

seed();
