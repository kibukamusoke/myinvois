import { createClient } from '../src';

// Initialize the client
const client = createClient({
  clientId: process.env.MYINVOIS_CLIENT_ID || '',
  clientSecret: process.env.MYINVOIS_CLIENT_SECRET || '',
  tin: process.env.MYINVOIS_TIN || '',
  certificatePath: process.env.MYINVOIS_CERT_PATH || '',
  privateKeyPath: process.env.MYINVOIS_KEY_PATH || '',
  privateKeyPassphrase: process.env.MYINVOIS_KEY_PASSPHRASE || '',
  environment: 'sandbox',
});

/**
 * Retrieve and display various code tables
 */
async function retrieveCodes() {
  try {
    // Retrieve document types
    console.log('Retrieving document types...');
    const documentTypes = await client.codes.getDocumentTypes();
    console.log('Document Types:');
    console.log(JSON.stringify(documentTypes, null, 2));
    
    // Retrieve state codes
    console.log('\nRetrieving state codes...');
    const stateCodes = await client.codes.getStateCodes();
    console.log('State Codes:');
    console.log(JSON.stringify(stateCodes, null, 2));
    
    // Retrieve tax types
    console.log('\nRetrieving tax types...');
    const taxTypes = await client.codes.getTaxTypes();
    console.log('Tax Types:');
    console.log(JSON.stringify(taxTypes, null, 2));
    
    // Retrieve industry codes
    console.log('\nRetrieving industry codes...');
    const industryCodes = await client.codes.getIndustryCodes();
    console.log(`Retrieved ${industryCodes.length} industry codes.`);
    console.log('Example industry codes:');
    console.log(JSON.stringify(industryCodes.slice(0, 5), null, 2));
    
    // Create a helper function to map code tables
    function createCodeMap(codeTable: any[], codeKey: string, valueKey: string) {
      return codeTable.reduce((map, item) => {
        map[item[codeKey]] = item[valueKey];
        return map;
      }, {});
    }
    
    // Create a map of state codes for easier reference
    const stateMap = createCodeMap(stateCodes, 'code', 'description');
    console.log('\nState Code Map:');
    console.log(stateMap);
    
    // Output examples of how to use the codes in an invoice
    console.log('\nUsage examples:');
    console.log(`- Set invoice type to "${documentTypes[0].description}": invoice.invoiceTypeCode = "${documentTypes[0].code}"`);
    console.log(`- Set state to "Kuala Lumpur": address.stateCode = "${Object.keys(stateMap).find(key => stateMap[key].includes('Kuala Lumpur'))}"`);
    console.log(`- Set tax type to "${taxTypes[0].description}": line.setTax(6, "${taxTypes[0].code}")`);
    
    return {
      documentTypes,
      stateCodes,
      taxTypes,
      industryCodes: industryCodes.slice(0, 5) // Just return a few examples
    };
  } catch (error) {
    console.error('Failed to retrieve codes:', error);
    throw error;
  }
}

// Call the function
retrieveCodes()
  .then(() => console.log('\nProcess completed successfully'))
  .catch(error => console.error('Process failed:', error));