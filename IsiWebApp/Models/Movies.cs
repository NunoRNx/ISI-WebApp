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

    public virtual ICollection<Subtitles> Subtitles { get; set; } = new List<Subtitles>();
}

public class MovieJsonModel
{
    public int MovieId { get; set; }
    public string Title { get; set; }
    public int Year { get; set; }
    public string Language { get; set; }
    public string MovieLength { get; set; }
    public List<string> Subtitles { get; set; }
    public List<string> StartSub { get; set; }
    public List<string> EndSub { get; set; }
}