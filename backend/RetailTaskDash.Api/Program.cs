using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.AspNetCore.SpaServices.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RetailTaskDash.Api.Configuration;
using RetailTaskDash.Api.Data;
using RetailTaskDash.Api.Extensions;
using System.IO;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var spaStaticFilesPath = Path.Combine(builder.Environment.ContentRootPath, "dist", "retail-task-dash");

if (!Directory.Exists(spaStaticFilesPath))
{
    spaStaticFilesPath = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "..", "dist", "retail-task-dash"));
}

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
        spa.UseAngularCliServer(npmScript: "start");
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
