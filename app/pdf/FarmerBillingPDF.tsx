import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Create styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 10,
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

// PDF Invoice Component
interface BillData {
  billNumber: string;
  farmerName: string;
  phoneNumber: string;
  city: string;
  billDate: Date;
  products: { productType: string; quantity: number; rate: number }[];
  expenses: Record<string, number>;
  totalValue: number;
  totalExpense: number;
  totalPayableAmount: number;
}

export const FarmerBillingPDF = ({ billData }: { billData: BillData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Invoice</Text>
        <Text style={styles.value}>
          Bill Number: {billData.billNumber}
        </Text>
      </View>

      {/* Farmer Details */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Farmer Name:</Text>
          <Text style={styles.value}>{billData.farmerName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone Number:</Text>
          <Text style={styles.value}>{billData.phoneNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>City:</Text>
          <Text style={styles.value}>{billData.city}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Bill Date:</Text>
          <Text style={styles.value}>
            {format(billData.billDate, 'dd/MM/yyyy')}
          </Text>
        </View>
      </View>

      {/* Products Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, { backgroundColor: '#f0f0f0' }]}>
          <Text style={[styles.tableCell, { width: '40%' }]}>Product Type</Text>
          <Text style={[styles.tableCell, { width: '20%' }]}>Quantity</Text>
          <Text style={[styles.tableCell, { width: '20%' }]}>Rate</Text>
          <Text style={[styles.tableCell, { width: '20%', borderRightWidth: 0 }]}>Total</Text>
        </View>
        {billData.products.map((product, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '40%' }]}>
              {product.productType}
            </Text>
            <Text style={[styles.tableCell, { width: '20%' }]}>
              {product.quantity}
            </Text>
            <Text style={[styles.tableCell, { width: '20%' }]}>
              {product.rate}
            </Text>
            <Text style={[styles.tableCell, { width: '20%', borderRightWidth: 0 }]}>
              {product.quantity * product.rate}
            </Text>
          </View>
        ))}
      </View>

      {/* Expenses Section */}
      <View style={styles.section}>
        <Text style={[styles.label, { marginBottom: 5 }]}>Expenses Breakdown:</Text>
        {Object.entries(billData.expenses).map(([key, value]) => (
          <View key={key} style={styles.row}>
            <Text style={styles.value}>{key}:</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalSection}>
        <Text style={styles.label}>Total Product Value:</Text>
        <Text style={styles.value}>{billData.totalValue}</Text>
      </View>
      <View style={styles.totalSection}>
        <Text style={styles.label}>Total Expenses:</Text>
        <Text style={styles.value}>{billData.totalExpense}</Text>
      </View>
      <View style={styles.totalSection}>
        <Text style={[styles.label, { fontWeight: 'bold' }]}>Total Payable Amount:</Text>
        <Text style={[styles.value, { fontWeight: 'bold' }]}>
          {billData.totalPayableAmount}
        </Text>
      </View>
    </Page>
  </Document>
);

// Modify the existing FarmerBillingForm to include PDF generation
export const PDFGenerationButton = ({ billData }: { billData: BillData }) => {
  return (
    <PDFDownloadLink
      document={<FarmerBillingPDF billData={billData} />}
      fileName={`bill_${billData.billNumber}.pdf`}
      className="w-full bg-green-700 text-white hover:bg-green-600 transition-colors h-12 text-base flex items-center justify-center"
    >
      {({ loading }) => (loading ? 'Generating PDF...' : 'Download Invoice PDF')}
    </PDFDownloadLink>
  );
};