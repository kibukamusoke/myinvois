import { 
    createClient, 
    Invoice, 
    Party, 
    Address, 
    InvoiceLine, 
    Item, 
    Price, 
    InvoicePeriod, 
    DocumentReference 
  } from '../src';
  
  // Initialize the client
  const client = createClient({
    clientId: process.env.MYINVOIS_CLIENT_ID || '',
    clientSecret: process.env.MYINVOIS_CLIENT_SECRET || '',
    tin: process.env.MYINVOIS_TIN || '',
    certificatePath: process.env.MYINVOIS_CERT_PATH || '',
    privateKeyPath: process.env.MYINVOIS_KEY_PATH || '',
    privateKeyPassphrase: process.env.MYINVOIS_KEY_PASSPHRASE || '',
    environment: 'sandbox'
  });
  
  async function createAndSubmitInvoice() {
    // Create a new invoice
    const invoice = client.invoices.createInvoice();
    
    // Set invoice details
    invoice.id = 'INV' + new Date().getTime().toString().slice(-8);
    invoice.issueDate = new Date();
    invoice.invoiceTypeCode = '01'; // Standard invoice
    
    // Set invoice period
    const period = new InvoicePeriod();
    period.startDate = new Date();
    period.endDate = new Date();
    period.endDate.setDate(period.endDate.getDate() + 30);
    period.description = 'Monthly billing';
    invoice.invoicePeriod = period;
    
    // Add document reference (optional)
    const reference = new DocumentReference();
    reference.id = 'PO12345';
    reference.documentType = 'PurchaseOrder';
    invoice.addDocumentReference(reference);
    
    // Set supplier details
    const supplier = new Party();
    supplier.name = 'Supplier Company Sdn Bhd';
    supplier.taxId = 'C123456789';
    supplier.registrationId = '123456789';
    supplier.registrationType = 'BRN';
    supplier.phone = '0123456789';
    supplier.email = 'supplier@example.com';
    supplier.msicCode = '46510';
    supplier.msicDescription = 'Wholesale of computer hardware, software and peripherals';
    
    // Set supplier address
    const supplierAddress = new Address();
    supplierAddress.addressLine1 = '123 Main Street';
    supplierAddress.addressLine2 = 'Suite 100';
    supplierAddress.city = 'Kuala Lumpur';
    supplierAddress.postalCode = '50480';
    supplierAddress.stateCode = '14'; // Kuala Lumpur
    supplier.address = supplierAddress;
    
    invoice.supplier = supplier;
    
    // Set customer details
    const customer = new Party();
    customer.name = 'Customer Company Sdn Bhd';
    customer.taxId = 'C987654321';
    customer.registrationId = '987654321';
    customer.registrationType = 'BRN';
    customer.phone = '0198765432';
    customer.email = 'customer@example.com';
    
    // Set customer address
    const customerAddress = new Address();
    customerAddress.addressLine1 = '456 Second Street';
    customerAddress.addressLine2 = 'Floor 2';
    customerAddress.city = 'Kuala Lumpur';
    customerAddress.postalCode = '50490';
    customerAddress.stateCode = '14'; // Kuala Lumpur
    customer.address = customerAddress;
    
    invoice.customer = customer;
    
    // Add invoice lines
    // Line 1: Laptop computers
    const line1 = new InvoiceLine();
    line1.id = 1;
    line1.quantity = 2;
    
    // Set item details
    const item1 = new Item();
    item1.name = 'Laptop Computer';
    item1.description = 'High-performance laptop computer';
    item1.classificationCode = '003'; // Electronics
    line1.item = item1;
    
    // Set price
    const price1 = new Price();
    price1.priceAmount = 2500.00;
    line1.price = price1;
    
    // Set tax (6% SST)
    line1.setTax(6, 'S');
    
    // Apply 10% discount
    line1.discountRate = 0.10;
    
    // Add line to invoice
    invoice.addInvoiceLine(line1);
    
    // Line 2: Software license
    const line2 = new InvoiceLine();
    line2.id = 2;
    line2.quantity = 2;
    
    // Set item details
    const item2 = new Item();
    item2.name = 'Office Software License';
    item2.description = 'Annual subscription';
    item2.classificationCode = '007'; // Software
    line2.item = item2;
    
    // Set price
    const price2 = new Price();
    price2.priceAmount = 800.00;
    line2.price = price2;
    
    // Set tax (0% - Exempt)
    line2.setTax(0, 'E', 'Software license exemption');
    
    // Add line to invoice
    invoice.addInvoiceLine(line2);
    
    // Calculate totals
    invoice.calculateTotals();
    
    // Sign and submit the invoice
    try {
      console.log('Signing invoice...');
      // Sign the invoice
      const signedInvoice = await client.invoices.signInvoice(invoice);
      
      console.log('Submitting invoice...');
      // Submit the invoice
      const response = await client.invoices.submitInvoice(signedInvoice);
      
      console.log('Invoice submitted successfully:');
      console.log(JSON.stringify(response, null, 2));
      
      // If submission was successful and we have a submission ID, check status
      if (response.submissionId) {
        console.log('Checking submission status...');
        const submissionStatus = await client.documents.getSubmissionDetails(response.submissionId);
        console.log('Submission status:');
        console.log(JSON.stringify(submissionStatus, null, 2));
      }
      
      return response;
    } catch (error) {
      console.error('Failed to submit invoice:', error);
      throw error;
    }
  }
  
  // Call the function
  createAndSubmitInvoice()
    .then(() => console.log('Process completed successfully'))
    .catch(error => console.error('Process failed:', error));