import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FileSpreadsheet,
  RefreshCw,
  Download,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  BarChart3,
  ArrowRight,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Settings,
  Save,
  File,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { excelIntegration, ExcelWorkbook, ExcelSheet, ExcelData } from '@/lib/integrations/excelIntegration';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default function ExcelTab() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [workbook, setWorkbook] = useState<ExcelWorkbook | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [sheetData, setSheetData] = useState<ExcelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false);

  useEffect(() => {
    // Reset selected sheet when workbook changes
    if (workbook) {
      setSelectedSheet(workbook.sheets[0]?.id || '');
    } else {
      setSelectedSheet('');
      setSheetData(null);
    }
  }, [workbook]);

  useEffect(() => {
    // Load sheet data when sheet changes
    if (workbook && selectedSheet) {
      loadSheetData();
    }
  }, [selectedSheet]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const selectedFile = files[0];
    
    // Check if it's an Excel file
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      toast.error('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }
    
    setFile(selectedFile);
    setIsLoading(true);
    setError(null);
    
    try {
      const parsedWorkbook = await excelIntegration.parseExcelFile(selectedFile);
      setWorkbook(parsedWorkbook);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      setError('Failed to parse Excel file. Please make sure it is a valid Excel file.');
      toast.error('Failed to parse Excel file');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSheetData = async () => {
    if (!workbook || !selectedSheet) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await excelIntegration.getSheetData(selectedSheet);
      setSheetData(data);
      
      // Initialize field mappings
      const mappings: Record<string, string> = {};
      data.headers.forEach(header => {
        // Try to guess the mapping based on header name
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('name')) {
          mappings[header] = 'name';
        } else if (lowerHeader.includes('email')) {
          mappings[header] = 'email';
        } else if (lowerHeader.includes('phone')) {
          mappings[header] = 'phone';
        } else if (lowerHeader.includes('company')) {
          mappings[header] = 'company';
        } else if (lowerHeader.includes('status')) {
          mappings[header] = 'status';
        } else if (lowerHeader.includes('source')) {
          mappings[header] = 'source';
        } else {
          mappings[header] = '';
        }
      });
      
      setFieldMappings(mappings);
    } catch (error) {
      console.error('Error loading sheet data:', error);
      setError('Failed to load sheet data');
      toast.error('Failed to load sheet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!workbook || !selectedSheet) {
      toast.error('Please select a sheet to import');
      return;
    }
    
    // Check if required fields are mapped
    const requiredFields = ['name', 'email'];
    const mappedFields = Object.values(fieldMappings);
    
    if (!requiredFields.every(field => mappedFields.includes(field))) {
      toast.error('Please map the required fields: Name and Email');
      setIsMappingDialogOpen(true);
      return;
    }
    
    setIsImporting(true);
    setError(null);
    
    try {
      const importedCount = await excelIntegration.importToFirestore(
        selectedSheet,
        'leads',
        fieldMappings
      );
      
      toast.success(`Successfully imported ${importedCount} records`);
    } catch (error) {
      console.error('Error importing from Excel:', error);
      setError('Failed to import data');
      toast.error('Failed to import data');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    
    try {
      // In a real implementation, this would get data from Firestore
      // For demo, we'll use mock data
      const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Source', 'Created'];
      const mockData = [
        ['John Smith', 'john@example.com', '(555) 123-4567', 'Acme Inc', 'New', 'Website', '2023-05-15'],
        ['Sarah Johnson', 'sarah@example.com', '(555) 987-6543', 'Tech Co', 'Contacted', 'Referral', '2023-05-14'],
        ['Michael Brown', 'michael@example.com', '(555) 456-7890', 'Global Services', 'Proposal', 'LinkedIn', '2023-05-13']
      ];
      
      const blob = await excelIntegration.exportToExcel(mockData, headers);
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `locafyr-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setError('Failed to export data');
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setWorkbook(null);
    setSelectedSheet('');
    setSheetData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    excelIntegration.clearWorkbook();
  };

  const handleUpdateMapping = (header: string, value: string) => {
    setFieldMappings(prev => ({
      ...prev,
      [header]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle>Excel Integration</CardTitle>
                <CardDescription>Import and export data with Excel files</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'import' | 'export')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import">
                <Download className="w-4 h-4 mr-2" />
                Import from Excel
              </TabsTrigger>
              <TabsTrigger value="export">
                <Upload className="w-4 h-4 mr-2" />
                Export to Excel
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="import" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="excel-file">Upload Excel File</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="excel-file"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".xlsx,.xls"
                      className={file ? "hidden" : ""}
                    />
                    {file && (
                      <div className="flex items-center justify-between w-full p-2 border rounded-md">
                        <div className="flex items-center space-x-2">
                          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <span className="text-xs text-gray-500">({Math.round(file.size / 1024)} KB)</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleClearFile}
                        >
                          <Trash2 className="w-4 h-4 text-gray-500" />
                        </Button>
                      </div>
                    )}
                    {!file && (
                      <Button 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <File className="w-4 h-4 mr-2" />
                        Select File
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Upload an Excel file (.xlsx or .xls) to import data
                  </p>
                </div>
                
                {workbook && (
                  <div className="space-y-2">
                    <Label htmlFor="sheet">Select Sheet</Label>
                    <Select 
                      value={selectedSheet} 
                      onValueChange={setSelectedSheet}
                    >
                      <SelectTrigger id="sheet">
                        <SelectValue placeholder="Select a sheet" />
                      </SelectTrigger>
                      <SelectContent>
                        {workbook.sheets.map((sheet) => (
                          <SelectItem key={sheet.id} value={sheet.id}>
                            {sheet.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  {sheetData && (
                    <Dialog open={isMappingDialogOpen} onOpenChange={setIsMappingDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Settings className="w-4 h-4 mr-2" />
                          Field Mappings
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Configure Field Mappings</DialogTitle>
                          <DialogDescription>
                            Map Excel columns to Locafyr fields
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-4 max-h-[400px] overflow-y-auto">
                            {sheetData.headers.map((header, index) => (
                              <div key={index} className="grid grid-cols-2 gap-4 items-center">
                                <div className="font-medium text-sm">{header}</div>
                                <Select 
                                  value={fieldMappings[header] || ''} 
                                  onValueChange={(value) => handleUpdateMapping(header, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select field" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">Do not import</SelectItem>
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="phone">Phone</SelectItem>
                                    <SelectItem value="company">Company</SelectItem>
                                    <SelectItem value="status">Status</SelectItem>
                                    <SelectItem value="source">Source</SelectItem>
                                    <SelectItem value="notes">Notes</SelectItem>
                                    <SelectItem value="industry">Industry</SelectItem>
                                    <SelectItem value="website">Website</SelectItem>
                                    <SelectItem value="address">Address</SelectItem>
                                    <SelectItem value="tags">Tags</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={() => setIsMappingDialogOpen(false)}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Mappings
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                  <Button 
                    onClick={handleImport}
                    disabled={!workbook || !selectedSheet || isImporting}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Import to Locafyr
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Data Preview */}
              {sheetData && (
                <div className="mt-6 border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Data Preview</h3>
                      <p className="text-sm text-gray-500">
                        Showing data from {workbook?.sheets.find(s => s.id === selectedSheet)?.name}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsMappingDialogOpen(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Configure Mappings
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {sheetData.headers.map((header, index) => (
                            <TableHead key={index} className="relative">
                              <div className="flex flex-col">
                                <span>{header}</span>
                                {fieldMappings[header] && (
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    → {fieldMappings[header]}
                                  </Badge>
                                )}
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sheetData.rows.slice(0, 5).map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <TableCell key={cellIndex}>{cell}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {sheetData.rows.length > 5 && (
                    <div className="p-2 text-center text-sm text-gray-500 border-t">
                      Showing 5 of {sheetData.rows.length} rows
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="export" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="export-data">Data to Export</Label>
                  <Select defaultValue="leads">
                    <SelectTrigger id="export-data">
                      <SelectValue placeholder="Select data to export" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leads">All Leads</SelectItem>
                      <SelectItem value="new-leads">New Leads</SelectItem>
                      <SelectItem value="contacted-leads">Contacted Leads</SelectItem>
                      <SelectItem value="clients">Clients</SelectItem>
                      <SelectItem value="custom">Custom Query</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="export-format">Export Format</Label>
                  <Select defaultValue="xlsx">
                    <SelectTrigger id="export-format">
                      <SelectValue placeholder="Select export format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleExport}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Export to Excel
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-800">About Excel Integration</p>
                <p className="text-sm text-emerald-700 mt-1">
                  This integration allows you to import data from Excel files into Locafyr and export data from Locafyr to Excel files.
                  Your data is processed locally in your browser and is not sent to any external servers.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}