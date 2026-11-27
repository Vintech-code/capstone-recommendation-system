<?php

namespace App\Services\Admin;

use Carbon\CarbonImmutable;
use PharData;
use RecursiveIteratorIterator;
use RuntimeException;
use Throwable;
use ZipStream\ZipStream;

final class AdminEnrollmentAlignmentDocumentService
{
    private const CONTENT_WIDTH = 9360;

    private const TEMPLATE_RELATIVE_PATH = 'report-templates/recommendation-enrollment-alignment.docx';

    public function __construct(
        private readonly AdminReportService $reports,
    ) {}

    public function generate(?string $from, ?string $to): string
    {
        $templatePath = resource_path(self::TEMPLATE_RELATIVE_PATH);
        if (! is_file($templatePath)) {
            throw new RuntimeException('The enrollment alignment report template is unavailable.');
        }

        $outputDirectory = storage_path('app/private/report-exports');
        if (! is_dir($outputDirectory) && ! mkdir($outputDirectory, 0755, true) && ! is_dir($outputDirectory)) {
            throw new RuntimeException('The report export directory could not be created.');
        }

        $temporaryBase = tempnam($outputDirectory, 'enrollment-alignment-');
        if ($temporaryBase === false) {
            throw new RuntimeException('A temporary report file could not be created.');
        }

        @unlink($temporaryBase);
        $templateArchivePath = $temporaryBase.'-template.zip';
        $documentPath = $temporaryBase.'.docx';

        try {
            if (! copy($templatePath, $templateArchivePath)) {
                throw new RuntimeException('The report template could not be copied.');
            }

            $report = $this->reports->generate($from, $to);
            $templateArchive = new PharData($templateArchivePath);
            $entry = $templateArchive['word/document.xml'] ?? null;
            if ($entry === null) {
                throw new RuntimeException('The report template has no Word document body.');
            }

            $generatedDocumentXml = $this->replaceBody(
                $entry->getContent(),
                $this->buildBody($report),
            );

            $output = fopen($documentPath, 'w+b');
            if ($output === false) {
                throw new RuntimeException('The generated Word report could not be opened for writing.');
            }

            try {
                $document = new ZipStream(
                    outputStream: $output,
                    enableZip64: false,
                    defaultEnableZeroHeader: false,
                    sendHttpHeaders: false,
                );
                $prefix = 'phar://'.str_replace('\\', '/', $templateArchivePath).'/';

                foreach (new RecursiveIteratorIterator($templateArchive) as $path => $file) {
                    $normalizedPath = str_replace('\\', '/', (string) $path);
                    $entryName = str_starts_with($normalizedPath, $prefix)
                        ? substr($normalizedPath, strlen($prefix))
                        : basename($normalizedPath);
                    $contents = $entryName === 'word/document.xml'
                        ? $generatedDocumentXml
                        : $file->getContent();

                    $document->addFile(
                        fileName: $entryName,
                        data: $contents,
                        enableZeroHeader: false,
                    );
                }

                $document->finish();
            } finally {
                fclose($output);
            }

            unset($templateArchive);

            return $documentPath;
        } catch (Throwable $exception) {
            @unlink($documentPath);

            throw $exception;
        } finally {
            @unlink($templateArchivePath);
        }
    }

    private function replaceBody(string $documentXml, string $bodyXml): string
    {
        $bodyMarker = '<w:body>';
        $bodyStart = strpos($documentXml, $bodyMarker);
        $sectionStart = strrpos($documentXml, '<w:sectPr');

        if ($bodyStart === false || $sectionStart === false || $sectionStart <= $bodyStart) {
            throw new RuntimeException('The report template body structure is unsupported.');
        }

        $contentStart = $bodyStart + strlen($bodyMarker);

        return substr($documentXml, 0, $contentStart)
            .$bodyXml
            .substr($documentXml, $sectionStart);
    }

    /** @param array<string, mixed> $report */
    private function buildBody(array $report): string
    {
        /** @var array<string, mixed> $alignment */
        $alignment = $report['enrollmentAlignment'];
        /** @var array<string, int|float> $overall */
        $overall = $alignment['overall'];
        /** @var list<array<string, mixed>> $programmes */
        $programmes = $alignment['programs'];

        $parts = [
            $this->paragraph('Recommendation and Enrollment Alignment Report', [
                'align' => 'center',
                'bold' => true,
                'size' => 32,
                'after' => 80,
                'keepNext' => true,
            ]),
            $this->paragraph('Reporting period: '.$this->formatPeriod($report['from'], $report['to']), [
                'align' => 'center',
                'size' => 20,
                'after' => 20,
                'keepNext' => true,
            ]),
            $this->paragraph('Generated: '.$this->formatGeneratedAt((string) $report['generatedAt']), [
                'align' => 'center',
                'size' => 18,
                'color' => '666666',
                'after' => 180,
            ]),
            $this->paragraph('Programme Alignment', [
                'bold' => true,
                'size' => 24,
                'before' => 60,
                'after' => 80,
                'keepNext' => true,
            ]),
            $this->programmeTable($programmes, $overall),
            $this->paragraph(
                'Interpretation: A match shows observed alignment with the Rank #1 recommendation. '
                .'It does not prove that the recommendation caused the enrollment decision.',
                ['size' => 18, 'italic' => true, 'before' => 140, 'after' => 60],
            ),
            $this->paragraph(
                'Source: verified Certificate of Registration enrollment records and immutable recommendation snapshots.',
                ['size' => 18, 'color' => '666666', 'after' => 0],
            ),
        ];

        return implode('', $parts);
    }

    /** @param array<string, int|float> $overall */
    private function summaryTable(array $overall): string
    {
        $widths = [3000, 1680, 3000, 1680];

        $rows = [
            $this->row([
                $this->cell('Enrolled in Rank #1 recommendation', $widths[0], ['bold' => true, 'fill' => 'F2F2F2']),
                $this->cell((string) $overall['aligned'], $widths[1], ['bold' => true, 'size' => 26, 'align' => 'center']),
                $this->cell('Verified enrollment records', $widths[2], ['bold' => true, 'fill' => 'F2F2F2']),
                $this->cell((string) $overall['verifiedEnrolled'], $widths[3], ['bold' => true, 'size' => 26, 'align' => 'center']),
            ]),
            $this->row([
                $this->cell('Enrolled in another programme', $widths[0], ['bold' => true, 'fill' => 'F2F2F2']),
                $this->cell((string) $overall['notAligned'], $widths[1], ['bold' => true, 'size' => 26, 'align' => 'center']),
                $this->cell('No verified enrollment yet', $widths[2], ['bold' => true, 'fill' => 'F2F2F2']),
                $this->cell((string) $overall['unallocated'], $widths[3], ['bold' => true, 'size' => 26, 'align' => 'center']),
            ]),
        ];

        return $this->table($widths, $rows);
    }

    /**
     * @param  list<array<string, mixed>>  $programmes
     * @param  array<string, int|float>  $overall
     */
    private function programmeTable(array $programmes, array $overall): string
    {
        $widths = [2300, 1100, 1100, 1050, 1050, 1050, 710];
        $headers = [
            'Rank #1 recommended programme',
            'Students recommended',
            'Verified enrollments',
            'Enrolled in #1',
            'Enrolled elsewhere',
            'No verified enrollment',
            'Alignment rate',
        ];

        $headerCells = [];
        foreach ($headers as $index => $header) {
            $headerCells[] = $this->cell($header, $widths[$index], [
                'align' => 'center',
                'bold' => true,
                'color' => 'FFFFFF',
                'fill' => '650710',
                'size' => 16,
            ]);
        }

        $rows = [$this->row($headerCells, true)];
        foreach ($programmes as $programme) {
            $rows[] = $this->row([
                $this->cell(
                    (string) $programme['programmeCode'].' - '.(string) $programme['programmeName'],
                    $widths[0],
                    ['bold' => true, 'align' => 'left'],
                ),
                $this->numberCell($programme['recommended'], $widths[1]),
                $this->numberCell($programme['verifiedEnrolled'], $widths[2]),
                $this->numberCell($programme['aligned'], $widths[3]),
                $this->numberCell($programme['notAligned'], $widths[4]),
                $this->numberCell($programme['unallocated'], $widths[5]),
                $this->cell($this->percentage($programme['alignmentRate']), $widths[6], [
                    'bold' => true,
                    'align' => 'center',
                    'size' => 16,
                ]),
            ]);
            $rows[] = $this->row([
                $this->cell(
                    'Actual programme chosen instead: '.$this->alternativeProgrammes($programme),
                    self::CONTENT_WIDTH,
                    [
                        'gridSpan' => count($widths),
                        'fill' => 'F7F7F7',
                        'size' => 16,
                        'color' => '555555',
                    ],
                ),
            ]);
        }

        $rows[] = $this->row([
            $this->cell('Overall', $widths[0], ['bold' => true, 'fill' => 'F2F2F2']),
            $this->numberCell($overall['recommended'], $widths[1], 'F2F2F2'),
            $this->numberCell($overall['verifiedEnrolled'], $widths[2], 'F2F2F2'),
            $this->numberCell($overall['aligned'], $widths[3], 'F2F2F2'),
            $this->numberCell($overall['notAligned'], $widths[4], 'F2F2F2'),
            $this->numberCell($overall['unallocated'], $widths[5], 'F2F2F2'),
            $this->cell($this->percentage($overall['alignmentRate']), $widths[6], [
                'bold' => true,
                'align' => 'center',
                'fill' => 'F2F2F2',
                'size' => 16,
            ]),
        ]);

        return $this->table($widths, $rows);
    }

    /** @param array<string, mixed> $programme */
    private function alternativeProgrammes(array $programme): string
    {
        /** @var list<array<string, mixed>> $alternatives */
        $alternatives = $programme['alternateEnrollments'];
        if ($alternatives === []) {
            return 'None recorded';
        }

        return collect($alternatives)
            ->map(static fn (array $alternative): string => sprintf(
                '%s - %s (%d)',
                $alternative['programmeCode'],
                $alternative['programmeName'],
                $alternative['count'],
            ))
            ->implode('; ');
    }

    private function numberCell(int|float $value, int $width, ?string $fill = null): string
    {
        return $this->cell((string) $value, $width, [
            'align' => 'center',
            'fill' => $fill,
            'size' => 18,
        ]);
    }

    private function percentage(int|float $value): string
    {
        return number_format((float) $value, 2).'%';
    }

    private function formatPeriod(mixed $from, mixed $to): string
    {
        $fromText = is_string($from) ? CarbonImmutable::createFromFormat('Y-m-d', $from)->format('F j, Y') : null;
        $toText = is_string($to) ? CarbonImmutable::createFromFormat('Y-m-d', $to)->format('F j, Y') : null;

        return match (true) {
            $fromText !== null && $toText !== null => $fromText.' to '.$toText,
            $fromText !== null => 'From '.$fromText,
            $toText !== null => 'Up to '.$toText,
            default => 'All recorded recommendation dates',
        };
    }

    private function formatGeneratedAt(string $generatedAt): string
    {
        return CarbonImmutable::parse($generatedAt)->format('F j, Y g:i A');
    }

    /** @param list<int> $widths @param list<string> $rows */
    private function table(array $widths, array $rows): string
    {
        $grid = collect($widths)
            ->map(static fn (int $width): string => '<w:gridCol w:w="'.$width.'"/>')
            ->implode('');

        return '<w:tbl>'
            .'<w:tblPr><w:tblW w:w="'.self::CONTENT_WIDTH.'" w:type="dxa"/>'
            .'<w:tblBorders>'
            .'<w:top w:val="single" w:sz="4" w:color="D9D9D9"/>'
            .'<w:left w:val="single" w:sz="4" w:color="D9D9D9"/>'
            .'<w:bottom w:val="single" w:sz="4" w:color="D9D9D9"/>'
            .'<w:right w:val="single" w:sz="4" w:color="D9D9D9"/>'
            .'<w:insideH w:val="single" w:sz="4" w:color="D9D9D9"/>'
            .'<w:insideV w:val="single" w:sz="4" w:color="D9D9D9"/>'
            .'</w:tblBorders><w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>'.$grid.'</w:tblGrid>'
            .implode('', $rows)
            .'</w:tbl>';
    }

    /** @param list<string> $cells */
    private function row(array $cells, bool $repeatHeader = false): string
    {
        return '<w:tr><w:trPr><w:cantSplit/>'
            .($repeatHeader ? '<w:tblHeader/>' : '')
            .'</w:trPr>'.implode('', $cells).'</w:tr>';
    }

    /** @param array<string, mixed> $options */
    private function cell(string $text, int $width, array $options = []): string
    {
        $fill = isset($options['fill']) && is_string($options['fill'])
            ? '<w:shd w:val="clear" w:color="auto" w:fill="'.$options['fill'].'"/>'
            : '';
        $gridSpan = isset($options['gridSpan'])
            ? '<w:gridSpan w:val="'.(int) $options['gridSpan'].'"/>'
            : '';

        return '<w:tc><w:tcPr><w:tcW w:w="'.$width.'" w:type="dxa"/>'
            .$gridSpan.$fill.'<w:tcMar>'
            .'<w:top w:w="100" w:type="dxa"/><w:left w:w="100" w:type="dxa"/>'
            .'<w:bottom w:w="100" w:type="dxa"/><w:right w:w="100" w:type="dxa"/>'
            .'</w:tcMar><w:vAlign w:val="center"/></w:tcPr>'.$this->paragraph($text, [
                'align' => $options['align'] ?? 'left',
                'bold' => $options['bold'] ?? false,
                'italic' => $options['italic'] ?? false,
                'size' => $options['size'] ?? 18,
                'color' => $options['color'] ?? '000000',
                'after' => 0,
            ]).'</w:tc>';
    }

    /** @param array<string, mixed> $options */
    private function paragraph(string $text, array $options = []): string
    {
        $align = is_string($options['align'] ?? null) ? $options['align'] : 'left';
        $size = (int) ($options['size'] ?? 20);
        $color = is_string($options['color'] ?? null) ? $options['color'] : '000000';
        $before = (int) ($options['before'] ?? 0);
        $after = (int) ($options['after'] ?? 80);
        $bold = ($options['bold'] ?? false) ? '<w:b/><w:bCs/>' : '';
        $italic = ($options['italic'] ?? false) ? '<w:i/><w:iCs/>' : '';
        $keepNext = ($options['keepNext'] ?? false) ? '<w:keepNext/>' : '';
        $escapedText = htmlspecialchars($text, ENT_XML1 | ENT_QUOTES, 'UTF-8');

        return '<w:p><w:pPr>'.$keepNext
            .'<w:spacing w:before="'.$before.'" w:after="'.$after.'" w:line="240" w:lineRule="auto"/>'
            .'<w:jc w:val="'.$align.'"/></w:pPr><w:r><w:rPr>'
            .'<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>'
            .$bold.$italic.'<w:color w:val="'.$color.'"/><w:sz w:val="'.$size.'"/><w:szCs w:val="'.$size.'"/>'
            .'</w:rPr><w:t xml:space="preserve">'.$escapedText.'</w:t></w:r></w:p>';
    }
}
