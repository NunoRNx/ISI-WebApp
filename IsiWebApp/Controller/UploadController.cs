using IsiWebApp.Settings;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Diagnostics;
using System.Xml;
using System.Xml.Linq;

namespace IsiWebApp.Controllers
{
    [ApiController]
    [Route("knime/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly KnimePathSettings _knimeSettings;

        public UploadController(IOptions<KnimePathSettings> knimeSettings)
        {
            _knimeSettings = knimeSettings.Value;
        }

        [HttpPost("UploadXml")]
        public async Task<IActionResult> UploadXml(IFormFile file, [FromForm] int movieId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Ficheiro não enviado.");

            // Verifica se o ID do XML corresponde ao movieId recebido
            bool idCorreto = await CompararIdNoXmlAsync(file, movieId.ToString());
            if (!idCorreto)
                return BadRequest("O campo <Id> do XML não corresponde ao Id do filme enviado.");

            // Continua apenas se o ID for válido
            var solutionRoot = GetSolutionRoot("ISI-WebApp");
            if (solutionRoot == null)
                return StatusCode(500, "Pasta 'ISI-WebApp' não encontrada na hierarquia de diretórios.");

            var knimeFolder = Path.Combine(solutionRoot, "Knime");
            var uploadPath = Path.Combine(knimeFolder, "Upload");

            Directory.CreateDirectory(uploadPath);

            var originalFilePath = Path.Combine(uploadPath, file.FileName);
            using (var stream = new FileStream(originalFilePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Ok(new
            {
                message = "Ficheiro recebido e guardado com sucesso.",
                fileName = file.FileName,
                path = originalFilePath
            });
        }


        /// <summary>
        /// Obtém a pasta raiz da solution, cortando tudo depois de "solutionFolderName" (ex: "ISI-WebApp").
        /// </summary>
        private static string? GetSolutionRoot(string solutionFolderName)
        {
            var currentDir = AppContext.BaseDirectory;
            var index = currentDir.IndexOf(solutionFolderName, StringComparison.OrdinalIgnoreCase);

            if (index == -1)
                return null;

            // Pega tudo até à pasta da solution
            return currentDir.Substring(0, index + solutionFolderName.Length);
        }

        public static async Task<bool> CompararIdNoXmlAsync(IFormFile xmlFile, string id)
        {
            if (xmlFile == null || xmlFile.Length == 0 || string.IsNullOrWhiteSpace(id))
                return false;

            try
            {
                using var stream = xmlFile.OpenReadStream();
                var xmlDoc = await Task.Run(() => XDocument.Load(stream));

                // Busca qualquer elemento <Id> com valor igual ao ID informado
                var idMatch = xmlDoc.Descendants("Id")
                                    .Any(x => string.Equals(x.Value.Trim(), id, StringComparison.OrdinalIgnoreCase));

                return idMatch;
            }
            catch
            {
                // Pode logar o erro se quiser
                return false;
            }
        }
    }
}
