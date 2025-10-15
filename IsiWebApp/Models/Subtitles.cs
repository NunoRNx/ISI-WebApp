using System;
using System.Collections.Generic;

namespace IsiWebApp.Models;

public partial class Subtitles
{
    public int Id { get; set; }

    public int MovieId { get; set; }

    public string StartTime { get; set; } = null!;

    public string EndTime { get; set; } = null!;

    public string Text { get; set; } = null!;

    public virtual Movies Movie { get; set; } = null!;
}
