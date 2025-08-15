import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DrugData {
  id: string;
  name: string;
  unit: string;
  estimatedUnitPrice: number;
  originalQty: number;
  adjustedQty: number;
}

interface ProductCategory {
  name: string;
  drugs: DrugData[];
}

interface CDSSAgreementLetterProps {
  facilityName: string;
  period: string;
  productCategories: ProductCategory[];
  availableBudget: number;
  totalCost: number;
  originalCost: number;
}

const CDSSAgreementLetter: React.FC<CDSSAgreementLetterProps> = ({
  facilityName,
  period,
  productCategories,
  availableBudget,
  totalCost,
  originalCost,
}) => {
  const currentDate = new Date().toLocaleDateString('en-GB');
  const budgetGap = availableBudget - totalCost;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black print:shadow-none">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">
          FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA
        </h1>
        <h2 className="text-xl font-semibold mb-2">MINISTRY OF HEALTH</h2>
        <h3 className="text-lg font-medium mb-4">
          Ethiopian Pharmaceutical Supply Service (EPSS)
        </h3>
        <div className="border-t-2 border-b-2 border-black py-2">
          <h4 className="text-lg font-bold">
            COMMITTED DEMAND SUPPLY SYSTEM (CDSS) AGREEMENT
          </h4>
        </div>
      </div>

      {/* Agreement Details */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <strong>Agreement Date:</strong> {currentDate}
          </div>
          <div>
            <strong>Agreement No:</strong> CDSS-{facilityName.replace(/\s+/g, '')}-{new Date().getFullYear()}
          </div>
          <div>
            <strong>Health Facility:</strong> {facilityName}
          </div>
          <div>
            <strong>Supply Period:</strong> {period}
          </div>
        </div>
      </div>

      {/* Agreement Body */}
      <div className="mb-6 text-sm leading-6">
        <p className="mb-4">
          This agreement is entered into between the <strong>Ethiopian Pharmaceutical Supply Service (EPSS)</strong> 
          and <strong>{facilityName}</strong> under the Committed Demand Supply System (CDSS) framework 
          for the supply period of {period}.
        </p>
        
        <p className="mb-4">
          Under this agreement, {facilityName} commits to procure the pharmaceutical products listed 
          in Annex A at the agreed quantities and prices. This commitment is binding and represents 
          the facility's verified demand based on their available budget allocation.
        </p>

        <div className="bg-gray-50 p-4 rounded mb-4">
          <h4 className="font-semibold mb-2">Financial Summary:</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Original Forecast Cost:</strong><br />
              {originalCost.toLocaleString()} ETB
            </div>
            <div>
              <strong>Available Budget:</strong><br />
              {availableBudget.toLocaleString()} ETB
            </div>
            <div>
              <strong>Committed Amount:</strong><br />
              <span className="text-lg font-bold">{totalCost.toLocaleString()} ETB</span>
            </div>
          </div>
          {budgetGap >= 0 && (
            <div className="mt-2 text-green-700">
              <strong>Budget Surplus:</strong> {budgetGap.toLocaleString()} ETB
            </div>
          )}
        </div>

        <div className="mb-4">
          <h4 className="font-semibold mb-2">Terms and Conditions:</h4>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>The health facility commits to procure all items listed in Annex A at the specified quantities.</li>
            <li>Payment terms: Net 30 days from delivery confirmation.</li>
            <li>Delivery schedule: As per EPSS standard delivery calendar.</li>
            <li>Quality assurance: All products meet Ethiopian regulatory standards.</li>
            <li>This agreement is valid for the specified supply period only.</li>
            <li>Any modifications require written consent from both parties.</li>
          </ol>
        </div>
      </div>

      {/* Annex A - Drug List */}
      <div className="mb-8 page-break-before">
        <h3 className="text-lg font-bold mb-4 border-b-2 border-black pb-2">
          ANNEX A: COMMITTED PHARMACEUTICAL PRODUCTS
        </h3>
        
        <div className="space-y-6">
          {productCategories.map((category, categoryIndex) => {
            const categoryTotal = category.drugs.reduce((sum, drug) => 
              sum + (drug.adjustedQty * drug.estimatedUnitPrice), 0);

            return (
              <div key={category.name} className="mb-6">
                <div className="bg-gray-100 p-3 rounded-t border-l-4 border-blue-600">
                  <h4 className="font-semibold flex items-center justify-between">
                    {category.name}
                    <span className="text-sm font-normal">
                      Total: {categoryTotal.toLocaleString()} ETB
                    </span>
                  </h4>
                </div>
                
                <Table className="border">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="border font-semibold">No.</TableHead>
                      <TableHead className="border font-semibold">Drug Name</TableHead>
                      <TableHead className="border font-semibold">Unit</TableHead>
                      <TableHead className="border font-semibold">Unit Price (ETB)</TableHead>
                      <TableHead className="border font-semibold">Original Qty</TableHead>
                      <TableHead className="border font-semibold">Committed Qty</TableHead>
                      <TableHead className="border font-semibold">Total Price (ETB)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.drugs.map((drug, drugIndex) => (
                      <TableRow key={drug.id}>
                        <TableCell className="border text-center">
                          {categoryIndex + 1}.{drugIndex + 1}
                        </TableCell>
                        <TableCell className="border">{drug.name}</TableCell>
                        <TableCell className="border text-center">{drug.unit}</TableCell>
                        <TableCell className="border text-right">
                          {drug.estimatedUnitPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="border text-right text-gray-600">
                          {drug.originalQty.toLocaleString()}
                        </TableCell>
                        <TableCell className="border text-right font-medium">
                          {drug.adjustedQty.toLocaleString()}
                        </TableCell>
                        <TableCell className="border text-right font-medium">
                          {(drug.adjustedQty * drug.estimatedUnitPrice).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 border-2 border-gray-300 bg-gray-50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <strong>Total Original Forecast:</strong><br />
              {originalCost.toLocaleString()} ETB
            </div>
            <div>
              <strong>Total Committed Amount:</strong><br />
              <span className="text-xl font-bold">{totalCost.toLocaleString()} ETB</span>
            </div>
            <div>
              <strong>Budget Utilization:</strong><br />
              {((totalCost / availableBudget) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-12 page-break-before">
        <h3 className="text-lg font-bold mb-6 border-b-2 border-black pb-2">
          AGREEMENT SIGNATURES
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h4 className="font-semibold mb-4">HEALTH FACILITY REPRESENTATIVE</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Name:</label>
                  <div className="border-b border-black h-8"></div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Title:</label>
                  <div className="border-b border-black h-8"></div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Signature:</label>
                  <div className="border-b border-black h-12"></div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Date:</label>
                  <div className="border-b border-black h-8"></div>
                </div>
              </div>
              <div className="mt-4">
                <div className="border border-black p-2 text-center">
                  <strong>FACILITY STAMP</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h4 className="font-semibold mb-4">EPSS REPRESENTATIVE</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Name:</label>
                  <div className="border-b border-black h-8"></div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Title:</label>
                  <div className="border-b border-black h-8"></div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Signature:</label>
                  <div className="border-b border-black h-12"></div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Date:</label>
                  <div className="border-b border-black h-8"></div>
                </div>
              </div>
              <div className="mt-4">
                <div className="border border-black p-2 text-center">
                  <strong>EPSS OFFICIAL SEAL</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>This agreement is binding upon signature by both parties.</p>
          <p>For inquiries contact EPSS at: info@epss.gov.et | Tel: +251-11-XXX-XXXX</p>
        </div>
      </div>

      <style>{`
        @media print {
          .page-break-before {
            page-break-before: always;
          }
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default CDSSAgreementLetter;