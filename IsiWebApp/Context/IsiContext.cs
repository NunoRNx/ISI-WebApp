using System;
using System.Collections.Generic;
using IsiWebApp.Models;
using Microsoft.EntityFrameworkCore;

namespace IsiWebApp.Context;

public partial class IsiContext : DbContext
{
    public IsiContext()
    {
    }

    public IsiContext(DbContextOptions<IsiContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Movies> Movies { get; set; }

    public virtual DbSet<Subtitles> Subtitles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Movies>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__movies__3213E83F21E81B46");

            entity.ToTable("movies");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("id");
            entity.Property(e => e.Language)
                .HasMaxLength(8)
                .IsUnicode(false)
                .HasColumnName("language");
            entity.Property(e => e.MovieLength)
                .HasMaxLength(8)
                .IsUnicode(false)
                .HasColumnName("movie_length");
            entity.Property(e => e.Title)
                .HasColumnType("text")
                .HasColumnName("title");
            entity.Property(e => e.Year).HasColumnName("year");
        });

        modelBuilder.Entity<Subtitles>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__subtitle__3213E83F93893364");

            entity.ToTable("subtitles");

            entity.HasIndex(e => new { e.MovieId, e.StartTime, e.EndTime }, "uq_subtitle").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.EndTime)
                .HasMaxLength(8)
                .IsUnicode(false)
                .HasColumnName("end_time");
            entity.Property(e => e.MovieId).HasColumnName("movie_id");
            entity.Property(e => e.StartTime)
                .HasMaxLength(8)
                .IsUnicode(false)
                .HasColumnName("start_time");
            entity.Property(e => e.Text)
                .HasColumnType("text")
                .HasColumnName("text");

            entity.HasOne(d => d.Movie).WithMany(p => p.Subtitles)
                .HasForeignKey(d => d.MovieId)
                .HasConstraintName("fk_movie");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
