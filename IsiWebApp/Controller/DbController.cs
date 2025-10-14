using IsiWebApp.Context;
using IsiWebApp.Models;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ProcessedController : ControllerBase
{
    private readonly IsiContext _context;

    public ProcessedController(IsiContext context)
    {
        _context = context;
    }
}
