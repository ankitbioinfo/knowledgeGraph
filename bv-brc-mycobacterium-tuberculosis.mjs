// Import required modules
import BVBRCClient from "bvbrc_js_client";
import fs from "fs/promises";
import path from "path";

// BV-BRC Client initialization
const svc = new BVBRCClient("https://www.bv-brc.org/api");

// Taxonomy ID for Mycobacterium tuberculosis
const TAXON_ID = "1773";

// Base directory to save results
const BASE_DIR = "./mtb_data";
await fs.mkdir(BASE_DIR, { recursive: true });

// List of data types to fetch
const DATA_TYPES = [
  "genome",             // Genome data
  "genome_amr",         // AMR data
  "pathway",            // Pathway data
  "genome_feature",     // Genome features
  "sp_gene",            // Specialty genes
  "genome_sequence",    // Genome sequences
  "subsystem",          // Subsystems
  "antibiotics",        // Antibiotic-related data
  "taxonomy",           // Taxonomy hierarchy
  "protein_family_ref"  // Protein family references
];

// Function to fetch all records for a given data type
async function fetchAllRecords(dataType) {
  console.log(`Fetching all records for ${dataType}...`);
  let allItems = [];
  let start = 0;
  const limit = 1000; // Number of records per request

  try {
    while (true) {
      console.log(`Fetching ${dataType} records starting from ${start}...`);
      const query = `eq(taxon_id,${TAXON_ID})`;
      const options = { limit, start };
      const result = await svc.query(dataType, query, options);

      if (result && result.items && result.items.length > 0) {
        allItems = allItems.concat(result.items);
        console.log(`Fetched ${result.items.length} records for ${dataType}.`);
        start += limit;

        // Stop if fewer records than the limit are returned
        if (result.items.length < limit) break;
      } else {
        console.log(`No more records found for ${dataType}.`);
        break;
      }
    }
  } catch (error) {
    console.error(`Error fetching ${dataType}:`, error);
  }

  return allItems;
}

// Function to fetch schema for a data type
async function fetchSchema(dataType) {
  try {
    console.log(`Fetching schema for ${dataType}...`);
    const schema = await svc.getSchema(dataType);
    return schema;
  } catch (error) {
    console.error(`Error fetching schema for ${dataType}:`, error);
  }
}

// Function to save data to JSON file
async function saveDataToFile(data, fileName) {
  try {
    const filePath = path.join(BASE_DIR, fileName);
    if (data && data.length > 0) {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`Data saved to ${filePath}`);
    } else {
      console.log(`No data to save for ${fileName}`);
    }
  } catch (error) {
    console.error(`Error saving data to ${fileName}:`, error);
  }
}

// Function to save schema to a file
async function saveSchemaToFile(schema, dataType) {
  try {
    const fileName = `${dataType}_schema.json`;
    const filePath = path.join(BASE_DIR, fileName);
    if (schema) {
      await fs.writeFile(filePath, JSON.stringify(schema, null, 2));
      console.log(`Schema saved to ${filePath}`);
    } else {
      console.log(`No schema available for ${dataType}`);
    }
  } catch (error) {
    console.error(`Error saving schema for ${dataType}:`, error);
  }
}

// Main function to fetch and save all data types
async function main() {
  console.log(`Starting comprehensive data fetch for Mycobacterium tuberculosis (Taxonomy ID: ${TAXON_ID})...`);

  for (const dataType of DATA_TYPES) {
    console.log(`Processing data type: ${dataType}`);

    // Fetch schema
    const schema = await fetchSchema(dataType);
    await saveSchemaToFile(schema, dataType);

    // Fetch all records
    const data = await fetchAllRecords(dataType);
    const fileName = `${dataType}_data.json`;
    await saveDataToFile(data, fileName);
  }

  console.log("All data fetching and saving completed.");
}

// Execute the script
main();
