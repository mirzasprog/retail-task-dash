using System.IO.Compression;
using System.Linq;
using System.Text;
using RetailTaskDash.Api.Dtos;

namespace RetailTaskDash.Api.Services;

public class ReportExportService
{
    public byte[] BuildExcelReport(string title, IEnumerable<RegionSummaryDto> regions, IEnumerable<StoreSummaryDto> stores)
    {
        using var ms = new MemoryStream();
        using (var archive = new ZipArchive(ms, ZipArchiveMode.Create, true))
        {
            CreateContentTypes(archive);
            CreateRels(archive);
            CreateWorkbookRels(archive);
            CreateWorkbook(archive, title);
            CreateWorksheet(archive, regions, stores);
        }

        return ms.ToArray();
    }

    private static void CreateContentTypes(ZipArchive archive)
    {
        const string content = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"><Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/><Default Extension=\"xml\" ContentType=\"application/xml\"/><Override PartName=\"/xl/workbook.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml\"/><Override PartName=\"/xl/worksheets/sheet1.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\"/></Types>";
        AddEntry(archive, "[Content_Types].xml", content);
    }

    private static void CreateRels(ZipArchive archive)
    {
        const string content = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"xl/workbook.xml\"/></Relationships>";
        AddEntry(archive, "_rels/.rels", content);
    }

    private static void CreateWorkbookRels(ZipArchive archive)
    {
        const string content = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet\" Target=\"worksheets/sheet1.xml\"/></Relationships>";
        AddEntry(archive, "xl/_rels/workbook.xml.rels", content);
    }

    private static void CreateWorkbook(ZipArchive archive, string title)
    {
        var content = $"<?xml version=\"1.0\" encoding=\"UTF-8\"?><workbook xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\"><fileVersion appName=\"xl\"/><sheets><sheet name=\"{System.Security.SecurityElement.Escape(title)}\" sheetId=\"1\" r:id=\"rId1\"/></sheets></workbook>";
        AddEntry(archive, "xl/workbook.xml", content);
    }

    private static void CreateWorksheet(ZipArchive archive, IEnumerable<RegionSummaryDto> regions, IEnumerable<StoreSummaryDto> stores)
    {
        var sb = new StringBuilder();
        sb.Append("<?xml version=\"1.0\" encoding=\"UTF-8\"?><worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\"><sheetData>");
        var rowIndex = 1;
        sb.Append(Row(rowIndex++, new[] { "Region", "Sales", "Target", "Variance" }));
        foreach (var region in regions)
        {
            sb.Append(Row(rowIndex++, new[]
            {
                region.Name,
                region.TotalSales.ToString("F2"),
                region.TotalTarget.ToString("F2"),
                region.Variance.ToString("F2")
            }));
        }

        rowIndex++;
        sb.Append(Row(rowIndex++, new[] { "Store", "Region", "Location" }));
        foreach (var store in stores)
        {
            sb.Append(Row(rowIndex++, new[]
            {
                store.Name,
                store.RegionName,
                store.Location
            }));
        }

        sb.Append("</sheetData></worksheet>");
        AddEntry(archive, "xl/worksheets/sheet1.xml", sb.ToString());
    }

    private static string Row(int index, IEnumerable<string> columns)
    {
        var colIndex = 1;
        var cells = columns.Select(value => Cell(index, colIndex++, value));
        return $"<row r=\"{index}\">{string.Join(string.Empty, cells)}</row>";
    }

    private static string Cell(int row, int column, string value)
    {
        var columnName = GetColumnName(column);
        var escaped = System.Security.SecurityElement.Escape(value);
        return $"<c r=\"{columnName}{row}\" t=\"inlineStr\"><is><t>{escaped}</t></is></c>";
    }

    private static string GetColumnName(int index)
    {
        var dividend = index;
        var columnName = string.Empty;

        while (dividend > 0)
        {
            var modulo = (dividend - 1) % 26;
            columnName = Convert.ToChar(65 + modulo) + columnName;
            dividend = (dividend - modulo) / 26;
        }

        return columnName;
    }

    private static void AddEntry(ZipArchive archive, string entryName, string content)
    {
        var entry = archive.CreateEntry(entryName, CompressionLevel.Optimal);
        using var writer = new StreamWriter(entry.Open(), new UTF8Encoding(false));
        writer.Write(content);
    }
}
