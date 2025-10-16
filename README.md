# Retail Task Dash (Angular 12 + ASP.NET 6)

This repository now hosts an Angular 12 front-end paired with an ASP.NET 6 backend. The UI recreates the original Retail Task Dash experience in Angular, including dashboards, task orchestration, pricing intelligence, and administrative flows.

## Front-end

The Angular client lives at the repository root. Key areas of interest:

- `src/app/components` – shared layout elements, KPI cards, charts, lists, and form helpers.
- `src/app/pages` – feature screens including dashboard analytics, task templates, task map, pricing tool, daily sales, admin, and authentication views.
- `src/app/core/services` – data services that communicate with the ASP.NET backend. `AuthService` persists session state and adds authentication helpers for the UI.
- `src/assets/i18n` – English and Bosnian localisation resources consumed by the in-app language switcher.

### Commands

Because network access is disabled in this environment, the Angular CLI dependencies are declared but not installed. When running locally with internet access:

```bash
npm install
```

To start the client during development you can either use the Angular CLI directly or the helper script defined in `package.json`:

```bash
ng serve
# or
npm run start
```

Both options host the UI at `http://localhost:4200` by default.

## Backend

The backend source is under `backend/RetailTaskDash.Api`. It is an ASP.NET 6 minimal Web API that exposes SQL-backed endpoints for the Angular application.

### Development

1. Restore dependencies: `dotnet restore`
2. Apply EF Core migrations or run the seed script in `Database/seed.sql`.
3. Start the API: `dotnet run --project backend/RetailTaskDash.Api`

The repository ships with a `launchSettings.json` profile that pins the development URLs to `https://localhost:49676` and `http://localhost:49675`. The Angular app points to the HTTPS endpoint (`https://localhost:49676/api`) out of the box so the services begin talking as soon as both processes are up.

> **Tip:** the first time you run on HTTPS you may need to trust the ASP.NET Core development certificate:
> ```bash
> dotnet dev-certs https --trust
> ```
> If you prefer to work without HTTPS locally, switch the Angular environment to `http://localhost:49675/api` or launch the "RetailTaskDash.Api (http)" profile from Visual Studio.

### Running with Visual Studio

Open `backend/RetailTaskDash.sln` in Visual Studio 2022 (or newer) and choose the **RetailTaskDash.Api** profile. Press **F5** to run the API on the same ports the Angular app expects. You can continue to serve the front-end separately with `ng serve`.

The Angular app expects the API at `https://localhost:49676/api` (update `src/environments` if you expose the backend elsewhere).

### Authentication

Seed data creates a default supervisor account:

- Email: `store.manager@retaildash.com`
- Password: `Retail123!`

Use these credentials on the Angular login screen to load live dashboard data. All other endpoints remain open for now.

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
