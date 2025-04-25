# MyInvois SDK

A TypeScript SDK for interacting with the Malaysia e-invoicing system (MyInvois) API.

## Features

- Authenticate with the MyInvois system
- Submit, retrieve, and manage e-invoices
- Sign invoices with digital certificates
- Support for acting as an intermediary for multiple taxpayers
- Automatic token management and renewal
- Taxpayer TIN validation

## Installation

```bash
npm install myinvois-sdk
```

## Quick Start

```typescript
import { MyInvoisClient } from "myinvois-sdk";
import path from "path";

// Initialize the client
const client = new MyInvoisClient({
  clientId: "YOUR_CLIENT_ID",
  clientSecret: "YOUR_CLIENT_SECRET",
  tin: "YOUR_TIN",
  certificatePath: path.resolve(__dirname, "./certs/certificate.crt"),
  privateKeyPath: path.resolve(__dirname, "./certs/private.key"),
  privateKeyPassphrase: "YOUR_PASSPHRASE",
  environment: "sandbox", // or 'production'
});

// Authenticate
await client.authenticate();

// Create and submit an invoice
const invoice = client.invoices.createInvoice();
// ... set invoice properties
const signedInvoice = await client.invoices.signInvoice(invoice);
const result = await client.invoices.submitInvoice(signedInvoice);
```

## Acting as an Intermediary

This SDK supports submitting documents on behalf of multiple taxpayers as an intermediary:

```typescript
// Authenticate as intermediary for a specific taxpayer
const token = await client.authenticateAsIntermediary("TAXPAYER_TIN");

// Submit an invoice on behalf of a taxpayer
const result = await client.invoices.submitInvoice(
  signedInvoice,
  "TAXPAYER_TIN"
);
```

## Multi-TIN Support

The SDK includes built-in token management for working with multiple TINs:

```typescript
// Authenticate for multiple TINs
await client.authenticateAsIntermediary("TAXPAYER_TIN_1");
await client.authenticateAsIntermediary("TAXPAYER_TIN_2");

// Get all authenticated TINs
const tins = client.getAllAuthenticatedTINs();

// Use authTIN parameter to specify which authentication to use
await client.invoices.submitInvoice(
  signedInvoice,
  "TAXPAYER_TIN_1",
  "TAXPAYER_TIN_1"
);
await client.documents.getDocumentStatus(
  "DOC_UUID",
  "TAXPAYER_TIN_1",
  "TAXPAYER_TIN_1"
);
```

The SDK automatically manages and refreshes tokens for each TIN as needed. When making API calls, you can specify:

- `taxpayerTIN`: The TIN the document is for/belongs to
- `authTIN`: The TIN to use for authentication (which token to use)

If `authTIN` is not provided, it defaults to using the `taxpayerTIN` for authentication.

## TIN Validation

The SDK provides a method to validate taxpayer TINs against the MyInvois system:

```typescript
// Validate a taxpayer's TIN
const validationResult = await client.validateTaxpayerTIN(
  "C12345678901", // TIN to validate
  "BRN", // ID type (Business Registration Number)
  "201901234567", // ID value
  "YOUR_AUTH_TIN" // Optional: TIN to use for authentication
);

// Check the result
if (validationResult.isValid) {
  console.log("TIN is valid");
} else {
  console.log(`Invalid TIN: ${validationResult.message}`);
  console.log(`Status code: ${validationResult.statusCode}`);
}
```

The validation method returns a consistent object format:

```typescript
{
  isValid: boolean;      // Whether the TIN is valid
  statusCode: number;    // HTTP status code (e.g., 200, 404)
  message: string;       // Human-readable message
  data?: any;            // Any additional data (for valid TINs)
}
```

This allows you to verify if a taxpayer's TIN is valid in the MyInvois system before attempting to submit invoices on their behalf.

## Certificate Management

The SDK provides methods to work with digital certificates required for signing invoices:

```typescript
// Get details about the certificate chain
const certDetails = await client.getCertificateDetails();

console.log("Signing Certificate Subject:", certDetails.signing.subject);
console.log("Signing Certificate Expiry:", certDetails.signing.validTo);
console.log("Days until expiry:", certDetails.signing.daysUntilExpiry);
console.log("Is valid:", certDetails.signing.isValid);

// Check intermediate and root certificates
console.log(
  "Intermediate Certificate Subject:",
  certDetails.intermediate.subject
);
console.log("Root Certificate Subject:", certDetails.root.subject);
```

The `getCertificateDetails` method returns information about the entire certificate chain including:

- Subject and issuer details
- Serial numbers
- Validity dates
- Days until expiry
- Validation status

Use this to monitor certificate health and prepare for renewal before expiration.

## API Documentation

### Authentication

```typescript
// Authenticate as the system owner
const token = await client.authenticate();

// Authenticate as an intermediary for a taxpayer
const token = await client.authenticateAsIntermediary("TAXPAYER_TIN");

// Get a valid token for a specific TIN
const token = await client.getToken("TAXPAYER_TIN");

// Get all TINs with valid tokens
const tins = client.getAllAuthenticatedTINs();
```

### Invoice Operations

```typescript
// Create an invoice
const invoice = client.invoices.createInvoice();

// Sign an invoice
const signedInvoice = await client.invoices.signInvoice(invoice);

// Submit an invoice
const result = await client.invoices.submitInvoice(
  signedInvoice,
  taxpayerTIN,
  authTIN
);

// Submit multiple invoices
const results = await client.invoices.submitInvoices(
  signedInvoices,
  taxpayerTIN,
  authTIN
);

// Cancel an invoice
await client.invoices.cancelInvoice(
  "DOCUMENT_UUID",
  "Cancellation reason",
  taxpayerTIN,
  authTIN
);
```

### Document Operations

```typescript
// Get document status
const status = await client.documents.getDocumentStatus(
  "DOCUMENT_UUID",
  taxpayerTIN,
  authTIN
);

// Get submission details
const details = await client.documents.getSubmissionDetails(
  "SUBMISSION_UUID",
  taxpayerTIN,
  authTIN
);

// List documents
const documents = await client.documents.listDocuments(taxpayerTIN, authTIN, {
  pageNo: 1,
  pageSize: 10,
  fromDate: "2023-01-01",
  toDate: "2023-12-31",
  status: "active",
});
```

## License

MIT
# myinvois
