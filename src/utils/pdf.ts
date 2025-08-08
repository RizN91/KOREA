import jsPDF from 'jspdf'
import type { QuoteInvoice, Job, Customer, Site } from '../services/db'

export function pdfQuoteInvoice(docData: QuoteInvoice, job: Job, customer: Customer, site: Site) {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text(`${docData.type === 'quote' ? 'Quote' : 'Invoice'} ${docData.number}`, 14, 20)
  doc.setFontSize(12)
  doc.text(`Job ${job.jobNo} - ${customer.name}`, 14, 30)
  doc.text(`${site.address.street}, ${site.address.suburb} ${site.address.state} ${site.address.postcode}`, 14, 36)
  let y = 50
  doc.text('Description', 14, y)
  doc.text('Qty', 120, y)
  doc.text('Price ex', 140, y)
  y += 6
  docData.lineItems.forEach(li => {
    doc.text(li.description, 14, y)
    doc.text(String(li.qty), 120, y)
    doc.text(`$${li.priceEx.toFixed(2)}`, 140, y)
    y += 6
  })
  y += 6
  doc.text(`Subtotal: $${docData.subtotal.toFixed(2)}`, 140, y)
  y += 6
  doc.text(`Tax: $${docData.tax.toFixed(2)}`, 140, y)
  y += 6
  doc.text(`Total: $${docData.total.toFixed(2)}`, 140, y)
  return doc.output('datauristring')
}

export function pdfLabel(job: Job, customer: Customer, site: Site) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [62, 29] })
  doc.setFontSize(12)
  doc.text(`${job.jobNo}  ${job.profileCode || ''}  ${job.qty || 1}x ${job.sealColour || ''}`, 4, 8)
  doc.setFontSize(10)
  doc.text(customer.name, 4, 16)
  doc.text(`${site.address.street}, ${site.address.suburb}`, 4, 22)
  return doc.output('datauristring')
}