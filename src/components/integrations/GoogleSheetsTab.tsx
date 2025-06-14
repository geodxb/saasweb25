import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  RefreshCw,
  Download,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  BarChart3,
  FileSpreadsheet,
  ArrowRight,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Settings,
  Save
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { googleSheetsIntegration, GoogleSheet, SheetInfo, SheetData } from '@/lib/integrations/googleSheetsIntegration';
import { gmailService } from '@/lib/gmail';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table as UITable,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function GoogleSheetsTab() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [spreadsheets, setSpreadsheets] = useState<GoogleSheet[]>([]);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<string>('');
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [selectedRange, setSelectedRange] = useState<string>('');
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    // When spreadsheet changes, reset sheet and range
    setSelectedSheet('');
    setSelectedRange('');
    setSheetData(null);
    
    // If a spreadsheet is selected, load its sheets
    if (selectedSpreadsheet && spreadsheets.length > 0) {
      const spreadsheet = spreadsheets.find(s => s.id === selectedSpreadsheet);
      if (spreadsheet && spreadsheet.sheets.length > 0) {
        setSelectedSheet(spreadsheet.sheets[0].id);
      }
    }
  }, [selectedSpreadsheet]);

  useEffect(() => {
    // When sheet changes, set a default range
    if (selectedSheet && selectedSpreadsheet) {
      const spreadsheet = spreadsheets.find(s => s.id === selectedSpreadsheet);
      if (spreadsheet) {
        const sheet = spreadsheet.sheets.find(s => s.id === selectedSheet);
        if (sheet) {
          setSelectedRange(`${sheet.title}!A1:Z1000`);
        }
      }
    }
  }, [selectedSheet, selectedSpreadsheet, spreadsheets]);

  const checkConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if Gmail is authorized first
      await gmailService.initialize();
      const isGmailAuthorized = gmailService.isUserAuthorized();
      
      if (!isGmailAuthorized) {
        setIsConnected(false);
        setIsLoading(false);
        return;
      }
      
      // Initialize Google Sheets integration
      const initialized = await googleSheetsIntegration.initialize();
      setIsConnected(initialized);
      
      if (initialized) {
        // Load spreadsheets
        const sheets = await googleSheetsIntegration.getSpreadsheets();
        setSpreadsheets(sheets);
        
        // Set default selected spreadsheet if available
        if (sheets.length > 0) {
          setSelectedSpreadsheet(sheets[0].id);
        }
      }
    } catch (error) {
      console.error('Error checking Google Sheets connection:', error);
      setError('Failed to connect to Google Sheets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthorize = async () => {
    setIsAuthorizing(true);
    setError(null);
    
    try {
      // First authorize Gmail (which handles the OAuth flow)
      await gmailService.initialize();
      const authorized = await gmailService.authorize();
      
      if (!authorized) {
        toast.error('Failed to authorize Google account');
        return;
      }
      
      // Then initialize Google Sheets with the additional scope
      const initialized = await googleSheetsIntegration.initialize();
      
      if (initialized) {
        setIsConnected(true);
        
        // Load spreadsheets
        const sheets = await googleSheetsIntegration.getSpreadsheets();
        setSpreadsheets(sheets);
        
        // Set default selected spreadsheet if available
        if (sheets.length > 0) {
          setSelectedSpreadsheet(sheets[0].id);
        }
        
        toast.success('Google Sheets connected successfully');
      } else {
        toast.error('Failed to initialize Google Sheets');
      }
    } catch (error) {
      console.error('Error authorizing Google Sheets:', error);
      setError('Failed to authorize Google Sheets. Please try again.');
      toast.error('Failed to authorize Google Sheets');
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleLoadSheetData = async () => {
    if (!selectedSpreadsheet || !selectedRange) {
      toast.error('Please select a spreadsheet and range');
      return;
    }
    
    setIsLoadingData(true);
    setError(null);
    
    try {
      const data = await googleSheetsIntegration.getSheetData(selectedSpreadsheet, selectedRange);
      setSheetData(data);
    } catch (error) {
      console.error('Error loading sheet data:', error);
      setError('Failed to load sheet data. Please check your range and try again.');
      toast.error('Failed to load sheet data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleImport = async () => {
    if (!selectedSpreadsheet || !selectedRange) {
      toast.error('Please select a spreadsheet and range');
      return;
    }
    
    setIsImporting(true);
    setError(null);
    
    try {
      const importedCount = await googleSheetsIntegration.importToFirestore(
        selectedSpreadsheet,
        selectedRange,
        'leads'
      );
      
      toast.success(`Successfully imported ${importedCount} records`);
      
      // Save the selected spreadsheet ID to user settings
      await googleSheetsIntegration.saveSelectedSpreadsheet(selectedSpreadsheet);
    } catch (error) {
      console.error('Error importing from Google Sheets:', error);
      setError('Failed to import data. Please try again.');
      toast.error('Failed to import data');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    if (!selectedSpreadsheet || !selectedRange) {
      toast.error('Please select a spreadsheet and range');
      return;
    }
    
    setIsExporting(true);
    setError(null);
    
    try {
      // In a real implementation, this would get data from Firestore
      // For demo, we'll use mock data
      const mockData = [
        ['John Smith', 'john@example.com', '(555) 123-4567', 'Acme Inc', 'New', 'Website', '2023-05-15'],
        ['Sarah Johnson', 'sarah@example.com', '(555) 987-6543', 'Tech Co', 'Contacted', 'Referral', '2023-05-14'],
        ['Michael Brown', 'michael@example.com', '(555) 456-7890', 'Global Services', 'Proposal', 'LinkedIn', '2023-05-13']
      ];
      
      const success = await googleSheetsIntegration.exportToGoogleSheets(
        selectedSpreadsheet,
        selectedRange,
        mockData
      );
      
      if (success) {
        toast.success('Data exported successfully');
        
        // Save the selected spreadsheet ID to user settings
        await googleSheetsIntegration.saveSelectedSpreadsheet(selectedSpreadsheet);
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting to Google Sheets:', error);
      setError('Failed to export data. Please try again.');
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-lg">Error</h3>
              <p className="text-gray-600 mt-1">{error}</p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={checkConnection}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-lg">Google Sheets Not Connected</h3>
              <p className="text-gray-600 mt-1">
                Connect your Google account to access your Google Sheets.
              </p>
              <Button 
                className="mt-4" 
                onClick={handleAuthorize}
                disabled={isAuthorizing}
              >
                {isAuthorizing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Table className="w-4 h-4 mr-2" />
                    Connect Google Sheets
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Table className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Google Sheets</CardTitle>
                <CardDescription>Import and export data with Google Sheets</CardDescription>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className="bg-green-100 text-green-800"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'import' | 'export')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import">
                <Download className="w-4 h-4 mr-2" />
                Import from Sheets
              </TabsTrigger>
              <TabsTrigger value="export">
                <Upload className="w-4 h-4 mr-2" />
                Export to Sheets
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="import" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="spreadsheet">Select Spreadsheet</Label>
                  <Select 
                    value={selectedSpreadsheet} 
                    onValueChange={setSelectedSpreadsheet}
                  >
                    <SelectTrigger id="spreadsheet">
                      <SelectValue placeholder="Select a spreadsheet" />
                    </SelectTrigger>
                    <SelectContent>
                      {spreadsheets.map((spreadsheet) => (
                        <SelectItem key={spreadsheet.id} value={spreadsheet.id}>
                          {spreadsheet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedSpreadsheet && (
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
                        {spreadsheets
                          .find(s => s.id === selectedSpreadsheet)
                          ?.sheets.map((sheet) => (
                            <SelectItem key={sheet.id} value={sheet.id}>
                              {sheet.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {selectedSheet && (
                  <div className="space-y-2">
                    <Label htmlFor="range">Data Range</Label>
                    <Input 
                      id="range" 
                      value={selectedRange}
                      onChange={(e) => setSelectedRange(e.target.value)}
                      placeholder="e.g., Sheet1!A1:Z1000"
                    />
                    <p className="text-xs text-gray-500">
                      Specify the range of cells to import. Format: SheetName!StartCell:EndCell
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={handleLoadSheetData}
                    disabled={!selectedSpreadsheet || !selectedRange || isLoadingData}
                  >
                    {isLoadingData ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Data
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleImport}
                    disabled={!selectedSpreadsheet || !selectedRange || isImporting}
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
                  <div className="bg-gray-50 p-3 border-b">
                    <h3 className="font-medium">Data Preview</h3>
                    <p className="text-sm text-gray-500">
                      Showing data from {selectedRange}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <UITable>
                      <TableHeader>
                        <TableRow>
                          {sheetData.headers.map((header, index) => (
                            <TableHead key={index}>{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sheetData.rows.map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <TableCell key={cellIndex}>{cell}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </UITable>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="export" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="export-spreadsheet">Select Spreadsheet</Label>
                  <Select 
                    value={selectedSpreadsheet} 
                    onValueChange={setSelectedSpreadsheet}
                  >
                    <SelectTrigger id="export-spreadsheet">
                      <SelectValue placeholder="Select a spreadsheet" />
                    </SelectTrigger>
                    <SelectContent>
                      {spreadsheets.map((spreadsheet) => (
                        <SelectItem key={spreadsheet.id} value={spreadsheet.id}>
                          {spreadsheet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedSpreadsheet && (
                  <div className="space-y-2">
                    <Label htmlFor="export-sheet">Select Sheet</Label>
                    <Select 
                      value={selectedSheet} 
                      onValueChange={setSelectedSheet}
                    >
                      <SelectTrigger id="export-sheet">
                        <SelectValue placeholder="Select a sheet" />
                      </SelectTrigger>
                      <SelectContent>
                        {spreadsheets
                          .find(s => s.id === selectedSpreadsheet)
                          ?.sheets.map((sheet) => (
                            <SelectItem key={sheet.id} value={sheet.id}>
                              {sheet.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {selectedSheet && (
                  <div className="space-y-2">
                    <Label htmlFor="export-range">Target Range</Label>
                    <Input 
                      id="export-range" 
                      value={selectedRange}
                      onChange={(e) => setSelectedRange(e.target.value)}
                      placeholder="e.g., Sheet1!A1:Z1000"
                    />
                    <p className="text-xs text-gray-500">
                      Specify where to export the data. Format: SheetName!StartCell:EndCell
                    </p>
                  </div>
                )}
                
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
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleExport}
                    disabled={!selectedSpreadsheet || !selectedRange || isExporting}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Export from Locafyr
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">About Google Sheets Integration</p>
                <p className="text-sm text-blue-700 mt-1">
                  This integration allows you to import data from Google Sheets into Locafyr and export data from Locafyr to Google Sheets.
                  Your Google account credentials are securely stored and you can revoke access at any time.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}