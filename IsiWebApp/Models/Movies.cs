using System;
using System.Collections.Generic;

namespace IsiWebApp.Models;

public partial class Movies
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public int? Year { get; set; }

    public string? Language { get; set; }

    public string? MovieLength { get; set; }
}
