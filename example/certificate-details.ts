import { MyInvoisClient } from '../src';
import path from 'path';

/**
 * Example demonstrating how to retrieve and check certificate details
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

  try {
    // Get certificate details
    const certDetails = await client.getCertificateDetails();
    
    console.log('==== Certificate Chain Details ====');
    
    // Display signing certificate details
    console.log('\n=== Signing Certificate ===');
    console.log(`Subject: ${certDetails.signing.subject}`);
    console.log(`Issuer: ${certDetails.signing.issuer}`);
    console.log(`Serial Number: ${certDetails.signing.serialNumber}`);
    console.log(`Valid From: ${certDetails.signing.validFrom.toLocaleDateString()}`);
    console.log(`Valid To: ${certDetails.signing.validTo.toLocaleDateString()}`);
    console.log(`Days Until Expiry: ${certDetails.signing.daysUntilExpiry}`);
    console.log(`Is Valid: ${certDetails.signing.isValid}`);
    
    // Alert if certificate is expiring soon
    if (certDetails.signing.daysUntilExpiry < 30) {
      console.warn('⚠️ WARNING: Signing certificate will expire in less than 30 days!');
    }
    
    // Display intermediate certificate details
    console.log('\n=== Intermediate Certificate ===');
    console.log(`Subject: ${certDetails.intermediate.subject}`);
    console.log(`Issuer: ${certDetails.intermediate.issuer}`);
    console.log(`Serial Number: ${certDetails.intermediate.serialNumber}`);
    console.log(`Valid From: ${certDetails.intermediate.validFrom.toLocaleDateString()}`);
    console.log(`Valid To: ${certDetails.intermediate.validTo.toLocaleDateString()}`);
    console.log(`Days Until Expiry: ${certDetails.intermediate.daysUntilExpiry}`);
    console.log(`Is Valid: ${certDetails.intermediate.isValid}`);
    
    // Display root certificate details
    console.log('\n=== Root Certificate ===');
    console.log(`Subject: ${certDetails.root.subject}`);
    console.log(`Issuer: ${certDetails.root.issuer}`);
    console.log(`Serial Number: ${certDetails.root.serialNumber}`);
    console.log(`Valid From: ${certDetails.root.validFrom.toLocaleDateString()}`);
    console.log(`Valid To: ${certDetails.root.validTo.toLocaleDateString()}`);
    console.log(`Days Until Expiry: ${certDetails.root.daysUntilExpiry}`);
    console.log(`Is Valid: ${certDetails.root.isValid}`);
    
    // Check if any certificate in the chain is invalid
    if (!certDetails.signing.isValid || !certDetails.intermediate.isValid || !certDetails.root.isValid) {
      console.error('❌ ERROR: One or more certificates in the chain are invalid!');
    } else {
      console.log('\n✅ Certificate chain is valid');
    }
    
  } catch (error) {
    console.error('Error retrieving certificate details:', error);
  }
}

// Run the example
main().catch(error => {
  console.error('Error in example:', error);
}); 