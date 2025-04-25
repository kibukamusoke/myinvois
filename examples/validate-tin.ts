import { MyInvoisClient } from '../src';
import path from 'path';

/**
 * Example demonstrating how to validate taxpayer TINs
 */
async function main() {
  // Initialize the client with your credentials
  const client = new MyInvoisClient({
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    tin: 'YOUR_TIN',
    certificatePath: path.resolve(__dirname, '../certs/certificate.crt'),
    privateKeyPath: path.resolve(__dirname, '../certs/private.key'),
    privateKeyPassphrase: 'YOUR_PASSPHRASE',
    environment: 'sandbox'
  });

  // Authenticate first
  await client.authenticate();
  
  // List of TINs to validate
  const tinsToValidate = [
    {
      tin: 'C12345678901',
      idType: 'BRN',  // Business Registration Number
      idValue: '201901234567'
    },
    {
      tin: 'INVALID_TIN',
      idType: 'BRN',
      idValue: '201912345678'
    }
  ];
  
  console.log('==== Validating Taxpayer TINs ====\n');
  
  // Validate each TIN
  for (const tinInfo of tinsToValidate) {
    try {
      console.log(`Validating TIN: ${tinInfo.tin} with ${tinInfo.idType}: ${tinInfo.idValue}`);
      
      const result = await client.validateTaxpayerTIN(
        tinInfo.tin,
        tinInfo.idType,
        tinInfo.idValue
      );
      
      if (result.isValid) {
        console.log(`✅ Valid TIN: ${tinInfo.tin}`);
      } else {
        console.log(`❌ Invalid TIN: ${tinInfo.tin} - ${result.message}`);
      }
      
      console.log(`Status Code: ${result.statusCode}`);
      console.log('---');
      
    } catch (error) {
      console.error(`Error validating TIN ${tinInfo.tin}:`, error);
    }
  }
  
  // Validate using a different authTIN
  console.log('\n==== Validating as an Intermediary ====\n');
  
  try {
    // First authenticate as an intermediary
    const intermediaryTIN = 'YOUR_INTERMEDIARY_TIN';
    await client.authenticateAsIntermediary(intermediaryTIN);
    
    const tinToValidate = tinsToValidate[0];
    console.log(`Validating TIN: ${tinToValidate.tin} using auth TIN: ${intermediaryTIN}`);
    
    const result = await client.validateTaxpayerTIN(
      tinToValidate.tin,
      tinToValidate.idType,
      tinToValidate.idValue,
      intermediaryTIN  // Using the intermediary TIN for authentication
    );
    
    if (result.isValid) {
      console.log(`✅ Valid TIN: ${tinToValidate.tin}`);
    } else {
      console.log(`❌ Invalid TIN: ${tinToValidate.tin} - ${result.message}`);
    }
    
    console.log(`Status Code: ${result.statusCode}`);
    
  } catch (error) {
    console.error('Error validating as intermediary:', error);
  }
}

// Run the example
main().catch(error => {
  console.error('Error in example:', error);
}); 