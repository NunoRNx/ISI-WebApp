using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IsiWebApp.Context;
using IsiWebApp.Models;

namespace IsiWebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MovieUploadController : ControllerBase
    {
        private readonly IsiContext _context;
        private readonly ILogger<MovieUploadController> _logger;

        public MovieUploadController(IsiContext context, ILogger<MovieUploadController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("dbInsert")]
        public async Task<IActionResult> UploadJson([FromBody] List<MovieJsonModel> movies)
        {
            if (movies == null || movies.Count == 0)
                return BadRequest("Nenhum filme recebido.");

            try
            {
                foreach (var m in movies)
                {
                    if (m.MovieId <= 0)
                        return BadRequest($"O filme '{m.Title}' tem um ID inválido.");

                    // Valida se as listas têm o mesmo tamanho
                    if (m.Subtitles == null || m.StartSub == null || m.EndSub == null ||
                        m.Subtitles.Count != m.StartSub.Count || m.Subtitles.Count != m.EndSub.Count)
                    {
                        return BadRequest($"Erro nos dados do filme '{m.Title}': número de legendas e tempos não coincide.");
                    }

                    // Busca o filme na base
                    var existingMovie = await _context.Movies
                        .FirstOrDefaultAsync(x => x.Id == m.MovieId);

                    if (existingMovie != null)
                    {
                        _logger.LogInformation("Atualizando filme existente: {Title}", m.Title);

                        // Remove todas as legendas antigas do filme
                        var oldSubs = _context.Subtitles.Where(s => s.MovieId == m.MovieId);
                        _context.Subtitles.RemoveRange(oldSubs);

                        // Atualiza dados do filme
                        existingMovie.Title = m.Title;
                        existingMovie.Year = m.Year;
                        existingMovie.Language = m.Language;
                        existingMovie.MovieLength = m.MovieLength;
                    }
                    else
                    {
                        _logger.LogInformation("Adicionando novo filme: {Title}", m.Title);

                        // Cria novo filme
                        existingMovie = new Movies
                        {
                            Id = m.MovieId,
                            Title = m.Title,
                            Year = m.Year,
                            Language = m.Language,
                            MovieLength = m.MovieLength
                        };
                        _context.Movies.Add(existingMovie);
                    }

                    // Adiciona todas as novas legendas
                    for (int i = 0; i < m.Subtitles.Count; i++)
                    {
                        _context.Subtitles.Add(new Subtitles
                        {
                            MovieId = m.MovieId,
                            StartTime = m.StartSub[i],
                            EndTime = m.EndSub[i],
                            Text = m.Subtitles[i]
                        });
                    }
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Todos os filmes foram inseridos/atualizados com sucesso.");

                return Ok(new
                {
                    message = "Filmes e legendas inseridos/atualizados com sucesso.",
                    count = movies.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao inserir/atualizar filmes.");
                return StatusCode(500, new { message = "Erro interno ao processar o upload.", error = ex.Message });
            }
        }
    }
}
