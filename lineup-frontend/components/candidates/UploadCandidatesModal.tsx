'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Loader2, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useBulkImportCandidates, BulkImportRow } from '@/lib/hooks/useCandidates';

// Maximum number of candidates per import
const MAX_ROWS = 1000;

// Candidate fields that can be mapped
const CANDIDATE_FIELDS = [
    { key: 'name', label: 'Name', required: true },
    { key: 'email', label: 'Email', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'roleTitle', label: 'Role/Position', required: false },
    { key: 'source', label: 'Source', required: false },
    { key: 'stage', label: 'Stage', required: false },
    { key: 'tags', label: 'Tags (comma-separated)', required: false },
    { key: 'notes', label: 'Notes', required: false },
    { key: 'resumeUrl', label: 'Resume URL', required: false },
];



type FieldMapping = Record<string, string>; // CSV header -> candidate field

interface UploadCandidatesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

type UploadStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';

export function UploadCandidatesModal({ open, onOpenChange, onSuccess }: UploadCandidatesModalProps) {
    const [step, setStep] = useState<UploadStep>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
    const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
    const [importResult, setImportResult] = useState<{
        success: number;
        failed: number;
        duplicates: string[];
        errors: Array<{ row: number; message: string }>;
    } | null>(null);

    const bulkImport = useBulkImportCandidates();

    const handleFileSelect = useCallback((selectedFile: File) => {
        setFile(selectedFile);

        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            // Optimize: only preview first chunk to speed up large files
            preview: MAX_ROWS + 1, // +1 to detect if over limit
            complete: (results) => {
                const headers = results.meta.fields || [];
                let data = results.data as Record<string, string>[];

                // Validate row limit
                if (data.length > MAX_ROWS) {
                    toast.error(`File contains more than ${MAX_ROWS} rows. Please split your file into smaller batches.`);
                    data = data.slice(0, MAX_ROWS);
                    toast.info(`Only the first ${MAX_ROWS} rows will be imported.`);
                }

                setCsvHeaders(headers);
                setCsvData(data);

                // Auto-map based on header names
                const autoMapping: FieldMapping = {};
                headers.forEach((header) => {
                    const lowerHeader = header.toLowerCase().trim();
                    CANDIDATE_FIELDS.forEach((field) => {
                        if (
                            lowerHeader === field.key.toLowerCase() ||
                            lowerHeader === field.label.toLowerCase() ||
                            lowerHeader.includes(field.key.toLowerCase())
                        ) {
                            autoMapping[header] = field.key;
                        }
                    });
                });
                setFieldMapping(autoMapping);
                setStep('mapping');
            },
            error: (error) => {
                toast.error(`Failed to parse CSV: ${error.message}`);
            },
        });
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
                handleFileSelect(droppedFile);
            } else {
                toast.error('Please upload a CSV file');
            }
        },
        [handleFileSelect]
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFileSelect(selectedFile);
        }
    };

    const handleMappingChange = (csvHeader: string, candidateField: string) => {
        setFieldMapping((prev) => ({
            ...prev,
            [csvHeader]: candidateField === 'skip' ? '' : candidateField,
        }));
    };

    const getMappedData = (): BulkImportRow[] => {
        return csvData.map((row) => {
            const mappedRow: Record<string, string> = {};
            Object.entries(fieldMapping).forEach(([csvHeader, candidateField]) => {
                if (candidateField && row[csvHeader]) {
                    mappedRow[candidateField] = row[csvHeader];
                }
            });
            // Cast through unknown since we validate required fields separately
            return mappedRow as unknown as BulkImportRow;
        });
    };


    const handleImport = async () => {
        const mappedData = getMappedData();

        // Validate required fields
        const invalidRows = mappedData.filter((row) => !row.name);
        if (invalidRows.length > 0) {
            toast.error(`${invalidRows.length} rows are missing the required "Name" field`);
            return;
        }

        setStep('importing');

        try {
            const result = await bulkImport.mutateAsync(mappedData);
            setImportResult(result);
            setStep('complete');
        } catch (error) {
            toast.error('Import failed. Please try again.');
            setStep('preview');
        }
    };

    const handleClose = () => {
        setStep('upload');
        setFile(null);
        setCsvHeaders([]);
        setCsvData([]);
        setFieldMapping({});
        setImportResult(null);
        onOpenChange(false);
    };

    const handleComplete = () => {
        handleClose();
        onSuccess?.();
    };

    const isMappingValid = Object.values(fieldMapping).includes('name');
    const previewData = getMappedData().slice(0, 5);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="w-screen h-[100dvh] max-w-none sm:max-w-[800px] sm:h-auto sm:max-h-[90vh] sm:rounded-lg flex flex-col gap-0 p-0">
                <DialogHeader className="p-6 pb-2 sm:pb-6 flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Import Candidates from CSV
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'upload' && 'Upload a CSV file to import candidates in bulk'}
                        {step === 'mapping' && 'Map CSV columns to candidate fields'}
                        {step === 'preview' && 'Review the data before importing'}
                        {step === 'importing' && 'Importing candidates...'}
                        {step === 'complete' && 'Import complete!'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-2 sm:pt-0">
                    {/* Step 1: Upload */}
                    {step === 'upload' && (
                        <div
                            className="relative group border-2 border-dashed border-primary/30 rounded-2xl p-10 text-center cursor-pointer bg-gradient-to-b from-primary/5 via-transparent to-transparent hover:border-primary/60 hover:from-primary/10 transition-all duration-300 ease-out"
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.add('border-primary', 'from-primary/15', 'scale-[1.01]');
                            }}
                            onDragLeave={(e) => {
                                e.currentTarget.classList.remove('border-primary', 'from-primary/15', 'scale-[1.01]');
                            }}
                            onDrop={(e) => {
                                e.currentTarget.classList.remove('border-primary', 'from-primary/15', 'scale-[1.01]');
                                handleDrop(e);
                            }}
                        >
                            <label className="cursor-pointer block">
                                {/* Animated icon container */}
                                <div className="relative mx-auto w-20 h-20 mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl transform -rotate-3 group-hover:-rotate-6 transition-transform duration-300" />
                                    <div className="relative w-full h-full bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300">
                                        <Upload className="h-9 w-9 text-white group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    Drop your spreadsheet here
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    or <span className="text-primary font-medium hover:underline">click to browse</span> your files
                                </p>

                                {/* File type badges */}
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                                        <FileSpreadsheet className="h-3.5 w-3.5" />
                                        CSV
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-xs font-medium">
                                        <FileSpreadsheet className="h-3.5 w-3.5" />
                                        TXT
                                    </span>
                                </div>

                                {/* Limit info */}
                                <p className="text-xs text-muted-foreground/70">
                                    Maximum {MAX_ROWS.toLocaleString()} candidates per import
                                </p>

                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".csv,.txt,text/csv,text/plain,application/csv"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    )}

                    {/* Step 2: Mapping */}
                    {step === 'mapping' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    File: {file?.name} ({csvData.length} rows)
                                </span>
                                <Badge variant={isMappingValid ? 'default' : 'destructive'}>
                                    {isMappingValid ? 'Ready' : 'Map "Name" field'}
                                </Badge>
                            </div>

                            <ScrollArea className="h-[300px] border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-1/2">CSV Column</TableHead>
                                            <TableHead className="w-1/2">Map to Field</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {csvHeaders.map((header) => (
                                            <TableRow key={header}>
                                                <TableCell className="font-mono text-sm">
                                                    {header}
                                                    <span className="text-muted-foreground ml-2">
                                                        (e.g. "{csvData[0]?.[header]?.slice(0, 20) || 'empty'}"...)
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={fieldMapping[header] || 'skip'}
                                                        onValueChange={(value) =>
                                                            handleMappingChange(header, value)
                                                        }
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Skip" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="skip">
                                                                Skip this column
                                                            </SelectItem>
                                                            {CANDIDATE_FIELDS.map((field) => (
                                                                <SelectItem
                                                                    key={field.key}
                                                                    value={field.key}
                                                                >
                                                                    {field.label}
                                                                    {field.required && ' *'}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </div>
                    )}

                    {/* Step 3: Preview */}
                    {step === 'preview' && (
                        <div className="space-y-4">
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Ready to import {csvData.length} candidates</AlertTitle>
                                <AlertDescription>
                                    Review the preview below. Duplicates will be skipped.
                                </AlertDescription>
                            </Alert>

                            <ScrollArea className="h-[250px] border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {CANDIDATE_FIELDS.filter((f) =>
                                                Object.values(fieldMapping).includes(f.key)
                                            ).map((field) => (
                                                <TableHead key={field.key}>{field.label}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewData.map((row, idx) => (
                                            <TableRow key={idx}>
                                                {CANDIDATE_FIELDS.filter((f) =>
                                                    Object.values(fieldMapping).includes(f.key)
                                                ).map((field) => (
                                                    <TableCell key={field.key}>
                                                        {(row as any)[field.key] || '-'}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                            {csvData.length > 5 && (
                                <p className="text-sm text-muted-foreground text-center">
                                    Showing first 5 of {csvData.length} rows
                                </p>
                            )}
                        </div>
                    )}

                    {/* Step 4: Importing */}
                    {step === 'importing' && (
                        <div className="py-12 text-center space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                            <p className="text-lg font-medium">Importing candidates...</p>
                            <Progress value={50} className="w-2/3 mx-auto" />
                        </div>
                    )}

                    {/* Step 5: Complete */}
                    {step === 'complete' && importResult && (
                        <div className="space-y-4">
                            <div className="py-6 text-center">
                                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                                <p className="text-lg font-medium">Import Complete!</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">
                                        {importResult.success}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Imported</p>
                                </div>
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {importResult.duplicates.length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Duplicates</p>
                                </div>
                                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                                    <p className="text-2xl font-bold text-red-600">
                                        {importResult.failed}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Failed</p>
                                </div>
                            </div>

                            {importResult.errors.length > 0 && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Some rows failed</AlertTitle>
                                    <AlertDescription>
                                        <ul className="list-disc pl-4 mt-2">
                                            {importResult.errors.slice(0, 5).map((err, idx) => (
                                                <li key={idx}>
                                                    Row {err.row}: {err.message}
                                                </li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 border-t bg-background mt-auto flex-shrink-0">
                    {step === 'upload' && (
                        <Button variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                    )}

                    {step === 'mapping' && (
                        <>
                            <Button variant="outline" onClick={() => setStep('upload')}>
                                Back
                            </Button>
                            <Button onClick={() => setStep('preview')} disabled={!isMappingValid}>
                                Continue to Preview
                            </Button>
                        </>
                    )}

                    {step === 'preview' && (
                        <>
                            <Button variant="outline" onClick={() => setStep('mapping')}>
                                Back to Mapping
                            </Button>
                            <Button onClick={handleImport}>
                                Import {csvData.length} Candidates
                            </Button>
                        </>
                    )}

                    {step === 'complete' && (
                        <Button onClick={handleComplete}>Done</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
