using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using IsiWebApp.Context;
using IsiWebApp.Settings;

var builder = WebApplication.CreateBuilder(args);

// Configuração de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

// Configuração da Base de Dados
builder.Services.AddDbContext<IsiContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Controllers e Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuração tipada do KnimePath
builder.Services.Configure<KnimePathSettings>(builder.Configuration.GetSection("KnimePath"));

var app = builder.Build();

// Swagger apenas em Dev
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// Resolve o caminho absoluto para a pasta Upload
var knimeSettings = app.Services.GetRequiredService<Microsoft.Extensions.Options.IOptions<KnimePathSettings>>().Value;
var uploadPath = knimeSettings.UploadFullPath;

if (!Directory.Exists(uploadPath))
    Directory.CreateDirectory(uploadPath);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadPath),
    RequestPath = "/uploads"
});

app.UseAuthorization();
app.MapControllers();

app.Run();
