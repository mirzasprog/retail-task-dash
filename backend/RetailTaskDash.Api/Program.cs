using Microsoft.EntityFrameworkCore;
using RetailTaskDash.Api.Data;
using RetailTaskDash.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("RetailTaskDash")
    ?? "Server=localhost;Database=RetailTaskDash;Trusted_Connection=True;TrustServerCertificate=True;";

builder.Services.AddDbContext<RetailTaskDashContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddDataAccess();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy
            .WithOrigins("http://localhost:4200", "https://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => Results.Json(new
{
    name = "Retail Task Dash API",
    status = "online"
}));

app.Run();
