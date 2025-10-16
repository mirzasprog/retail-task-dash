# Retail Task Dash (Angular 12 + ASP.NET 6)

This repository now hosts an Angular 12 front-end paired with an ASP.NET 6 backend. The UI recreates the original Retail Task Dash experience in Angular, including dashboards, task orchestration, pricing intelligence, and administrative flows.

## Front-end

The Angular client lives at the repository root. Key areas of interest:

- `src/app/components` – shared layout elements, KPI cards, charts, lists, and form helpers.
- `src/app/pages` – feature screens including dashboard analytics, task templates, task map, pricing tool, daily sales, admin, and authentication views.
- `src/app/core/services` – data services. `DashboardDataService` provides rich mocked data while the `ApiService` is ready to connect to the ASP.NET backend.

### Commands

Because network access is disabled in this environment, the Angular CLI dependencies are declared but not installed. When running locally with internet access:

```bash
npm install
npm run start
```

## Backend

The backend source is under `backend/RetailTaskDash.Api`. It is an ASP.NET 6 minimal Web API that exposes SQL-backed endpoints for the Angular application.

### Development

1. Restore dependencies: `dotnet restore`
2. Apply EF Core migrations or run the seed script in `Database/seed.sql`.
3. Start the API: `dotnet run --project backend/RetailTaskDash.Api`

The Angular app expects the API at `http://localhost:5000/api`. Adjust `src/environments` as needed.

## Database

Supabase has been removed. The backend now uses SQL Server (or Azure SQL) via Entity Framework Core. Configure the connection string in `appsettings.Development.json`.

## Testing

Tests require the Angular CLI and .NET SDK. Install the prerequisites and run:

```bash
npm run test
```

```bash
dotnet test backend/RetailTaskDash.sln
```
