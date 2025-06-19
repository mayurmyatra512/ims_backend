// example.js
import { sendEmail } from './sendEmail.js';
function formatDateForInput(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    // Pad month and day with leading zeros
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
}

export const createMailBody = async (recipient, subject, invoice) => {
    const sampleHtml = `
  <div className="bg-white p-6 rounded shadow-md max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Invoice</h2>
        <div className="mb-2 flex justify-between">
          <p><strong>Bill No:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Date:</strong> ${formatDateForInput(invoice.invoiceDate)}</p>
        </div>
        <div className="mb-4">
          <p><strong>Name:</strong> ${invoice.partyId.partyName}</p>
          <p><strong>Mobile:</strong> ${invoice.partyId.contactNumber}</p>
        </div>

        <table className="w-full text-left border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Particular</th>
              <th className="p-2 border">Service</th>
              <th className="p-2 border">Rate</th>
              <th className="p-2 border">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.services.map((service, i) => `
    <tr key="${i}">
      <td class="p-2 border">${service.particular || ''}</td>
      <td class="p-2 border">${service.serviceId?.serviceName || ''}</td>
      <td class="p-2 border">${service.amount}</td>
      <td class="p-2 border">${service.amount}</td>
    </tr>
  `).join('')}
            <tr className="font-bold">
              <td colSpan="3" className="p-2 border text-right">Total</td>
              <td className="p-2 border">₹${invoice.totalAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="3" className="p-2 border text-right">Paid</td>
              <td className="p-2 border">₹${paidAmount}</td>
            </tr>
            <tr className="font-bold">
              <td colSpan="3" className="p-2 border text-right">Pending</td>
              <td className="p-2 border">₹${pendingAmount.toFixed(2)}</td>
            </tr>
            <tr className="font-bold">
              <td colSpan="4" className="p-2 text-left">${bankDetails.accountNum}</td>
            </tr>
            <tr className="font-bold">
              <td colSpan="4" className="p-2 text-left">${bankDetails.IFSC}</td>
            </tr>
            <tr className="font-bold">
              <td colSpan="4" className="p-2 text-left">${bankDetails.Name}</td>
            </tr>
          </tbody>
        </table>
      </div>
`;

    await sendEmail(recipient, subject, sampleHtml)
        .then(() => console.log('Email successfully sent!'))
        .catch((err) => console.error('Error:', err));

}
