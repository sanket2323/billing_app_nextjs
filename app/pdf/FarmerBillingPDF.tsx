import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#4F46E5',
    paddingBottom: 10
  },
  companyDetails: {
    width: '60%'
  },
  invoiceDetails: {
    width: '35%',
    alignItems: 'flex-end'
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5
  },
  companyInfo: {
    fontSize: 8,
    lineHeight: 1.5
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 5
  },
  invoiceBox: {
    backgroundColor: '#F5F3FF',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DDD6FE'
  },
  customerBox: {
    backgroundColor: '#F5F3FF',
    padding: 8,
    borderRadius: 4,
    borderLeftWidth: 2,
    borderLeftColor: '#4F46E5',
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 3
  },
  table: {
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    paddingVertical: 5,
    paddingHorizontal: 8
  },
  tableHeaderCell: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 8
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 5,
    paddingHorizontal: 8
  },
  alternateRow: {
    backgroundColor: '#F9FAFB'
  },
  itemCell: {
    width: '35%'
  },
  qtyCell: {
    width: '10%',
    textAlign: 'right'
  },
  weightCell: {
    width: '15%',
    textAlign: 'right'
  },
  rateCell: {
    width: '15%',
    textAlign: 'right'
  },
  amountCell: {
    width: '25%',
    textAlign: 'right'
  },
  totals: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#4F46E5',
    paddingTop: 10
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 3
  },
  totalLabel: {
    width: '25%',
    textAlign: 'right',
    paddingRight: 10,
    fontWeight: 'bold'
  },
  totalValue: {
    width: '25%',
    textAlign: 'right'
  },
  grandTotal: {
    fontWeight: 'bold',
    color: '#4F46E5'
  },
  footer: {
    marginTop: 15,
    fontSize: 8,
    textAlign: 'center',
    fontStyle: 'italic'
  }
});

interface Product {
  productType: string;
  quantity: number;
  weight: number;
  rate: number;
}

interface Expenses {
  adat: number;
  hamali: number;
  tolai: number;
  varai: number;
  bharai: number;
  motorBhade: number;
  uchhal: number;
  bardana: number;
  itar: number;
}

interface BillData {
  billNumber: string;
  farmerName: string;
  phoneNumber: string;
  city: string;
  billDate: Date;
  products: Product[];
  expenses: Expenses;
  totalValue: number;
  totalExpense: number;
  totalPayableAmount: number;
}

interface CompanyDetails {
  companyName: string;
  address: string;
  city: string;
  state: string;
  phoneNumber: string;
  registrationNumber: string;
}

const FarmerBillingPDF = ({ billData, companyDetails }: { billData: BillData, companyDetails: CompanyDetails }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.companyDetails}>
          <Text style={styles.companyName}>{companyDetails.companyName}</Text>
          <Text style={styles.companyInfo}>
            {companyDetails.address}, {companyDetails.city}, {companyDetails.state}
            {"\n"}
            Phone: {companyDetails.phoneNumber}
            {"\n"}
            Registration No: {companyDetails.registrationNumber}
          </Text>
        </View>
        
        <View style={styles.invoiceDetails}>
          <View style={styles.invoiceBox}>
            <Text style={[styles.tableHeaderCell, { marginBottom: 3 }]}>TAX INVOICE</Text>
            <Text>Invoice: {billData.billNumber}</Text>
            <Text>Date: {format(billData.billDate, 'dd/MM/yyyy')}</Text>
          </View>
        </View>
      </View>

      {/* Customer Details */}
      <View style={styles.customerBox}>
        <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>Bill To: {billData.farmerName}</Text>
        <Text>{billData.city}</Text>
        <Text>Phone: {billData.phoneNumber}</Text>
      </View>

      {/* Products Table */}
      <Text style={styles.sectionTitle}>Product Details</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.itemCell]}>Item & Description</Text>
          <Text style={[styles.tableHeaderCell, styles.qtyCell]}>Qty</Text>
          <Text style={[styles.tableHeaderCell, styles.weightCell]}>Weight</Text>
          <Text style={[styles.tableHeaderCell, styles.rateCell]}>Rate</Text>
          <Text style={[styles.tableHeaderCell, styles.amountCell]}>Amount</Text>
        </View>
        
        {billData.products.map((product, index) => (
          <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.alternateRow : {}]}>
            <Text style={styles.itemCell}>{product.productType}</Text>
            <Text style={styles.qtyCell}>{product.quantity}</Text>
            <Text style={styles.weightCell}>{product.weight}</Text>
            <Text style={styles.rateCell}>{(product.rate)}</Text>
            <Text style={[styles.amountCell, { fontWeight: 'bold' }]}>
              {(product.weight * product.rate)}
            </Text>
          </View>
        ))}
      </View>

      {/* Expenses Table */}
      <Text style={styles.sectionTitle}>Expenses Breakdown</Text>
      <View style={[styles.table, { marginBottom: 10 }]}>
        <View style={[styles.tableHeader, { backgroundColor: '#7C3AED' }]}>
          <Text style={[styles.tableHeaderCell, styles.itemCell]}>Expense Type</Text>
          <Text style={[styles.tableHeaderCell, styles.amountCell]}>Amount</Text>
        </View>
        
        {Object.entries(billData.expenses)
          .filter(([, value]) => value > 0)
          .map(([key, value], index) => (
            <View key={key} style={[styles.tableRow, index % 2 === 0 ? styles.alternateRow : {}]}>
              <Text style={styles.itemCell}>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</Text>
              <Text style={[styles.amountCell, { fontWeight: 'bold' }]}>
                {(value)}
              </Text>
            </View>
          ))}
      </View>

      {/* Totals */}
      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Sub Total:</Text>
          <Text style={styles.totalValue}>{(billData.totalValue)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Expenses:</Text>
          <Text style={styles.totalValue}>{(billData.totalExpense)}</Text>
        </View>
        <View style={[styles.totalRow, { marginTop: 5 }]}>
          <Text style={[styles.totalLabel, styles.grandTotal]}>TOTAL AMOUNT:</Text>
          <Text style={[styles.totalValue, styles.grandTotal]}>
            {(billData.totalPayableAmount)}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>All amounts mentioned are in Indian Rupees (INR)</Text>
        <Text>Thank you for your business!</Text>
      </View>
    </Page>
  </Document>
);

export default FarmerBillingPDF;