using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

[ApiController]
[Route("knime/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IConfiguration _config;

    public UploadController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost("UploadXml")]
    public async Task<IActionResult> UploadXml(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Ficheiro não enviado.");

        // Caminho de upload do appsettings.json
        var uploadPath = _config["UploadFolder:Path"];
        if (string.IsNullOrEmpty(uploadPath))
            return StatusCode(500, "Caminho de upload não configurado.");

        Directory.CreateDirectory(uploadPath);

        var filePath = Path.Combine(uploadPath, file.FileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Caminhos do KNIME do appsettings.json
        var knimeExe = _config["KnimePath:Exe"];
        var workflowDir = _config["KnimePath:Workflow"];

        if (string.IsNullOrEmpty(knimeExe) || string.IsNullOrEmpty(workflowDir))
            return StatusCode(500, "Caminho do KNIME não configurado.");

        // Monta os argumentos corretamente
        var arguments = $"-nosplash -application org.knime.product.KNIME_BATCH_APPLICATION -workflowDir=\"{workflowDir}\" -reset";

        var psi = new ProcessStartInfo
        {
            FileName = knimeExe,
            Arguments = arguments,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using (var proc = Process.Start(psi))
        {
            // Captura output e error
            string output = await proc.StandardOutput.ReadToEndAsync();
            string error = await proc.StandardError.ReadToEndAsync();
            proc.WaitForExit();

            // Logging opcional
            if (!string.IsNullOrEmpty(output))
                Console.WriteLine("KNIME output: " + output);
            if (!string.IsNullOrEmpty(error))
                Console.WriteLine("KNIME error: " + error);
        }

        return Ok(new { message = "Upload recebido, processamento iniciado.", file = file.FileName });
    }
}
