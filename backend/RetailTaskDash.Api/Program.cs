using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SpaServices.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RetailTaskDash.Api.Configuration;
using RetailTaskDash.Api.Data;
using RetailTaskDash.Api.Extensions;
using System.IO;
using System.Text;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

static string CombineSegments(string first, params string[] additional)
{
    var parts = new string[additional.Length + 1];
    parts[0] = first;
    Array.Copy(additional, 0, parts, 1, additional.Length);
    return Path.Combine(parts);
}

string ResolveSpaStaticFilesPath(WebApplicationBuilder webBuilder)
{
    const string DistFolder = "dist";
    const string AppFolder = "retail-task-dash";

    var publishedPath = CombineSegments(webBuilder.Environment.ContentRootPath, DistFolder, AppFolder);
    if (Directory.Exists(publishedPath))
    {
        return publishedPath;
    }

    var solutionRoot = Path.GetFullPath(CombineSegments(webBuilder.Environment.ContentRootPath, "..", ".."));
    var solutionPath = CombineSegments(solutionRoot, DistFolder, AppFolder);
    if (Directory.Exists(solutionPath))
    {
        return solutionPath;
    }

    return publishedPath;
}

var spaStaticFilesPath = ResolveSpaStaticFilesPath(builder);

builder.Services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = spaStaticFilesPath;
});

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey));

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = signingKey
        };
    });

var connectionString = builder.Configuration.GetConnectionString("RetailTaskDash")
    ?? "Server=localhost;Database=RetailTaskDash;Trusted_Connection=True;TrustServerCertificate=True;";

builder.Services.AddDbContext<RetailTaskDashContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddDataAccess();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
    app.UseSpaStaticFiles();
}

app.UseStaticFiles();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.UseSpa(spa =>
{
    var spaSourcePath = Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, "..", ".."));
    spa.Options.SourcePath = spaSourcePath;

    if (app.Environment.IsDevelopment())
    {
        spa.UseProxyToSpaDevelopmentServer("http://localhost:4200");
    }
    else
    {
        spa.Options.DefaultPageStaticFileOptions = new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(spaStaticFilesPath)
        };
    }
});

app.Run();
