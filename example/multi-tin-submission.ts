import { MyInvoisClient } from '../src';
import { Invoice } from '../src/models/invoice';
import { Party } from '../src/models/party';
import { Address } from '../src/models/address';
import { InvoiceLine } from '../src/models/invoice-line';
import path from 'path';

/**
 * Example demonstrating how to submit invoices on behalf of multiple TINs
 */
async function main() {
  // Initialize the client with your intermediary credentials
  const client = new MyInvoisClient({
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    tin: 'YOUR_INTERMEDIARY_TIN',
    certificatePath: path.resolve(__dirname, '../certs/certificate.crt'),
    privateKeyPath: path.resolve(__dirname, '../certs/private.key'),
    privateKeyPassphrase: 'YOUR_PASSPHRASE',
    environment: 'sandbox'
  });

  // List of taxpayers you're working on behalf of
  const taxpayerTINs = [
    'TAXPAYER_TIN_1',
    'TAXPAYER_TIN_2',
    'TAXPAYER_TIN_3'
  ];

  // Authenticate for each TIN
  console.log('Authenticating for multiple TINs...');
  for (const tin of taxpayerTINs) {
    try {
      await client.authenticateAsIntermediary(tin);
      console.log(`✓ Successfully authenticated for TIN ${tin}`);
    } catch (error) {
      console.error(`✗ Failed to authenticate for TIN ${tin}:`, error);
    }
  }

  // Show all authenticated TINs
  const authenticatedTINs = client.getAllAuthenticatedTINs();
  console.log(`Authenticated TINs: ${authenticatedTINs.join(', ')}`);

  // Example: Create an invoice for a specific taxpayer
  const taxpayerTIN = taxpayerTINs[0];
  const authTIN = taxpayerTIN; // Using the same TIN for auth in this case

  try {
    // Create a basic invoice
    const invoice = createSampleInvoice(taxpayerTIN);
    
    // Sign the invoice
    const signedInvoice = await client.invoices.signInvoice(invoice);
    
    // Submit the invoice
    // Note: Using the authTIN parameter for authentication
    const result = await client.invoices.submitInvoice(signedInvoice, taxpayerTIN, authTIN);
    
    console.log(`✓ Successfully submitted invoice for TIN ${taxpayerTIN}`);
    console.log('Submission result:', result);

    // Get document status
    // Note: Using the authTIN parameter for authentication
    const docStatus = await client.documents.getDocumentStatus(
      result.documents[0].documentUuid, 
      taxpayerTIN,
      authTIN
    );
    
    console.log('Document status:', docStatus);
  } catch (error) {
    console.error(`✗ Failed to process invoice for TIN ${taxpayerTIN}:`, error);
  }
}

/**
 * Creates a sample invoice for demonstration
 * @param taxpayerTIN The TIN of the taxpayer
 * @returns A sample invoice
 */
function createSampleInvoice(taxpayerTIN: string): Invoice {
  // Create supplier (seller)
  const supplier = new Party();
  supplier.name = 'Supplier Company Sdn Bhd';
  supplier.taxId = taxpayerTIN;
  supplier.registrationId = '201901123456';
  supplier.registrationType = 'BRN';
  supplier.sstRegistrationNo = 'SST-123456789';
  supplier.msicCode = '62011';
  supplier.msicDescription = 'Computer programming activities';
  supplier.phone = '0312345678';
  supplier.email = 'contact@supplier.com';
  
  // Create supplier address
  supplier.address = new Address();
  supplier.address.street = 'Jalan Supplier 123';
  supplier.address.buildingNumber = '12';
  supplier.address.buildingName = 'Supplier Tower';
  supplier.address.city = 'Kuala Lumpur';
  supplier.address.postalZone = '50000';
  supplier.address.countryCode = 'MY';
  
  // Create customer (buyer)
  const customer = new Party();
  customer.name = 'Customer Company Sdn Bhd';
  customer.taxId = 'C12345678901'; // Customer TIN
  customer.registrationId = '201801987654';
  customer.registrationType = 'BRN';
  customer.phone = '0387654321';
  customer.email = 'contact@customer.com';
  
  // Create customer address
  customer.address = new Address();
  customer.address.street = 'Jalan Customer 456';
  customer.address.buildingNumber = '45';
  customer.address.buildingName = 'Customer Building';
  customer.address.city = 'Petaling Jaya';
  customer.address.postalZone = '47800';
  customer.address.countryCode = 'MY';
  
  // Create the invoice
  const invoice = new Invoice();
  invoice.id = `INV-${Date.now()}`; // Unique invoice number
  invoice.issuedDate = new Date().toISOString().split('T')[0]; // Today's date
  invoice.documentCurrencyCode = 'MYR';
  invoice.accountingSupplierParty = supplier;
  invoice.accountingCustomerParty = customer;
  invoice.taxInclusiveAmount = 1060;
  invoice.taxExclusiveAmount = 1000;
  invoice.payableAmount = 1060;
  invoice.taxAmount = 60;
  
  // Add a line to the invoice
  const line = new InvoiceLine();
  line.id = '1';
  line.invoicedQuantity = 1;
  line.lineExtensionAmount = 1000;
  line.taxAmount = 60;
  line.taxInclusiveAmount = 1060;
  line.taxRate = 6;
  line.taxCode = 'SR';
  line.taxExemptionReason = '';
  line.description = 'Software development services';
  line.name = 'Software development';
  line.price = 1000;
  
  invoice.addInvoiceLine(line);
  
  return invoice;
}

// Run the example
main().catch(error => {
  console.error('Error in example:', error);
}); 