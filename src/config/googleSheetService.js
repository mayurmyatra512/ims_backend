// // googleSheetService.js
// import { google } from 'googleapis';
// import credentials from './path/to/your/serviceAccount.json' assert { type: 'json' };

// const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID';

// const auth = new google.auth.GoogleAuth({
//   credentials,
//   scopes: SCOPES,
// });

// async function getSheetInstance() {
//   const client = await auth.getClient();
//   return google.sheets({ version: 'v4', auth: client });
// }

// export async function appendInvoiceRow(invoice) {
//   const sheets = await getSheetInstance();
//   const values = [
//     [
//       invoice.invoiceNumber,
//       invoice.partyName,
//       invoice.service,
//       invoice.totalAmount,
//       invoice.date,
//     ],
//   ];
//   await sheets.spreadsheets.values.append({
//     spreadsheetId: SHEET_ID,
//     range: 'Sheet1!A:E',
//     valueInputOption: 'USER_ENTERED',
//     resource: { values },
//   });
// }

// export async function updateInvoiceRow(invoice) {
//   const sheets = await getSheetInstance();
//   const { data } = await sheets.spreadsheets.values.get({
//     spreadsheetId: SHEET_ID,
//     range: 'Sheet1!A2:A',
//   });

//   const rowIndex =
//     data.values.findIndex((row) => row[0] === invoice.invoiceNumber) + 2;

//   if (rowIndex >= 2) {
//     const values = [
//       [
//         invoice.invoiceNumber,
//         invoice.partyName,
//         invoice.service,
//         invoice.totalAmount,
//         invoice.date,
//       ],
//     ];
//     await sheets.spreadsheets.values.update({
//       spreadsheetId: SHEET_ID,
//       range: `Sheet1!A${rowIndex}:E${rowIndex}`,
//       valueInputOption: 'USER_ENTERED',
//       resource: { values },
//     });
//   }
// }

// export async function deleteInvoiceRow(invoiceNumber) {
//   const sheets = await getSheetInstance();
//   const { data } = await sheets.spreadsheets.values.get({
//     spreadsheetId: SHEET_ID,
//     range: 'Sheet1!A2:A',
//   });

//   const rowIndex =
//     data.values.findIndex((row) => row[0] === invoiceNumber) + 2;

//   if (rowIndex >= 2) {
//     await sheets.spreadsheets.batchUpdate({
//       spreadsheetId: SHEET_ID,
//       resource: {
//         requests: [
//           {
//             deleteDimension: {
//               range: {
//                 sheetId: 0,
//                 dimension: 'ROWS',
//                 startIndex: rowIndex - 1,
//                 endIndex: rowIndex,
//               },
//             },
//           },
//         ],
//       },
//     });
//   }
// }
