import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Initialize DiagnoLabs MCP Server
const server = new Server(
  {
    name: "diagnolabs-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Mock database for labs and diagnostic test catalog
const LABS_DIRECTORY = [
  {
    id: "lab_01",
    name: "Apex Diagnostic & Pathology Center",
    city: "Hyderabad",
    area: "Ameerpet",
    specialization: ["Blood Tests", "Pathology", "Thyroid Profile"],
    tests: [
      { code: "CBC", name: "Complete Blood Count", price: 450, turnaround: "6 hours" },
      { code: "LIPID", name: "Lipid Profile Panel", price: 800, turnaround: "12 hours" },
      { code: "THYROID", name: "Thyroid Panel (T3, T4, TSH)", price: 650, turnaround: "8 hours" }
    ],
    rating: 4.8,
    accreditation: "NABL Certified"
  },
  {
    id: "lab_02",
    name: "Metropolis Advanced Diagnostics",
    city: "Vadodara",
    area: "Alkapuri",
    specialization: ["Cardiology", "Biochemistry", "Diabetes Care"],
    tests: [
      { code: "HBA1C", name: "HbA1c Glycated Hemoglobin", price: 550, turnaround: "4 hours" },
      { code: "KFT", name: "Kidney Function Test", price: 750, turnaround: "12 hours" },
      { code: "LFT", name: "Liver Function Test", price: 750, turnaround: "12 hours" }
    ],
    rating: 4.9,
    accreditation: "NABL Certified"
  },
  {
    id: "lab_03",
    name: "CarePoint Radiology & Imaging Lab",
    city: "Bengaluru",
    area: "Indiranagar",
    specialization: ["Radiology", "MRI", "CT Scan", "Ultrasound"],
    tests: [
      { code: "USG_ABD", name: "Ultrasound Abdomen & Pelvis", price: 1800, turnaround: "2 hours" },
      { code: "XRAY_CHEST", name: "Chest X-Ray PA View", price: 500, turnaround: "1 hour" }
    ],
    rating: 4.7,
    accreditation: "CAP Accredited"
  }
];

// Register available MCP tools for LLMs (Claude & ChatGPT)
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_diagnostic_labs",
        description: "Search certified diagnostic laboratories by city, area, or medical specialization.",
        inputSchema: {
          type: "object",
          properties: {
            city: {
              type: "string",
              description: "City name to filter labs (e.g. Hyderabad, Vadodara, Bengaluru)"
            },
            specialization: {
              type: "string",
              description: "Medical specialization (e.g. Pathology, Radiology, Cardiology)"
            }
          }
        }
      },
      {
        name: "get_lab_tests_and_pricing",
        description: "Fetch all available lab tests, pricing (INR), turnaround times, and preparation instructions for a specific lab.",
        inputSchema: {
          type: "object",
          properties: {
            labId: {
              type: "string",
              description: "The unique identifier of the lab (e.g. lab_01, lab_02)"
            }
          },
          required: ["labId"]
        }
      },
      {
        name: "analyze_medical_report_insights",
        description: "Analyze uploaded patient lab values and return clear health insights with recommended next steps.",
        inputSchema: {
          type: "object",
          properties: {
            testName: {
              type: "string",
              description: "Name of the test (e.g. HbA1c, Fasting Glucose, TSH, Platelet Count)"
            },
            observedValue: {
              type: "number",
              description: "Patient's observed numeric test reading"
            },
            unit: {
              type: "string",
              description: "Unit of measurement (e.g. mg/dL, %, uIU/mL)"
            }
          },
          required: ["testName", "observedValue"]
        }
      }
    ]
  };
});

// Handle tool executions
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "search_diagnostic_labs": {
      let results = LABS_DIRECTORY;
      if (args?.city) {
        results = results.filter(l => l.city.toLowerCase().includes(args.city.toLowerCase()));
      }
      if (args?.specialization) {
        results = results.filter(l => 
          l.specialization.some(s => s.toLowerCase().includes(args.specialization.toLowerCase()))
        );
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ count: results.length, labs: results }, null, 2)
          }
        ]
      };
    }

    case "get_lab_tests_and_pricing": {
      const lab = LABS_DIRECTORY.find(l => l.id === args?.labId);
      if (!lab) {
        return {
          content: [{ type: "text", text: `Lab with ID '${args?.labId}' not found.` }],
          isError: true
        };
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              labName: lab.name,
              accreditation: lab.accreditation,
              availableTests: lab.tests
            }, null, 2)
          }
        ]
      };
    }

    case "analyze_medical_report_insights": {
      const { testName, observedValue, unit = "" } = args;
      let status = "NORMAL";
      let interpretation = "";

      if (testName.toLowerCase().includes("hba1c")) {
        if (observedValue < 5.7) {
          status = "NORMAL";
          interpretation = "Normal range. No indication of pre-diabetes or diabetes.";
        } else if (observedValue <= 6.4) {
          status = "ELEVATED (PRE-DIABETIC)";
          interpretation = "Prediabetes range. Lifestyle modifications and dietary monitoring recommended.";
        } else {
          status = "HIGH (DIABETIC RANGE)";
          interpretation = "Indicates diabetes. Please consult a qualified physician for evaluation.";
        }
      } else if (testName.toLowerCase().includes("glucose") || testName.toLowerCase().includes("sugar")) {
        if (observedValue < 100) {
          status = "NORMAL";
          interpretation = "Normal fasting blood sugar levels.";
        } else if (observedValue <= 125) {
          status = "ELEVATED (IMPAIRED FASTING GLUCOSE)";
          interpretation = "Borderline elevated fasting blood glucose.";
        } else {
          status = "HIGH";
          interpretation = "Elevated fasting blood glucose. Clinical consultation recommended.";
        }
      } else {
        interpretation = `Value of ${observedValue} ${unit} recorded for ${testName}. Cross-reference with clinical ranges recommended.`;
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              test: testName,
              value: `${observedValue} ${unit}`,
              clinicalStatus: status,
              insights: interpretation,
              disclaimer: "DiagnoLabs AI provides educational insights only. Always consult a licensed medical professional."
            }, null, 2)
          }
        ]
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Run server over STDIO transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DiagnoLabs MCP Server running on stdio transport");
}

main().catch((err) => {
  console.error("Fatal error running DiagnoLabs MCP server:", err);
  process.exit(1);
});
