-- Create schema
IF OBJECT_ID('dbo.Stores', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Stores (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        Name NVARCHAR(200) NOT NULL,
        Location NVARCHAR(200) NOT NULL
    );
END;

IF OBJECT_ID('dbo.TaskAssignments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TaskAssignments (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        StoreId UNIQUEIDENTIFIER NOT NULL,
        Title NVARCHAR(200) NOT NULL,
        Status NVARCHAR(50) NOT NULL,
        Priority NVARCHAR(50) NOT NULL,
        DueDate DATETIME2 NOT NULL,
        AssignedTo NVARCHAR(120) NULL
    );
END;

IF OBJECT_ID('dbo.KpiSnapshots', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.KpiSnapshots (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        StoreId UNIQUEIDENTIFIER NOT NULL,
        Metric NVARCHAR(100) NOT NULL,
        Value DECIMAL(18,2) NOT NULL,
        Change DECIMAL(9,2) NOT NULL,
        Trend NVARCHAR(10) NOT NULL,
        Status NVARCHAR(10) NOT NULL
    );
END;

IF OBJECT_ID('dbo.SalesSnapshots', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SalesSnapshots (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        StoreId UNIQUEIDENTIFIER NOT NULL,
        Department NVARCHAR(100) NOT NULL,
        Sales DECIMAL(18,2) NOT NULL,
        Target DECIMAL(18,2) NOT NULL,
        Variance DECIMAL(9,2) NOT NULL,
        Trend NVARCHAR(10) NOT NULL,
        Contribution DECIMAL(9,2) NOT NULL
    );
END;

-- Seed sample stores
IF NOT EXISTS (SELECT 1 FROM dbo.Stores)
BEGIN
    INSERT INTO dbo.Stores (Id, Name, Location) VALUES
    ('11111111-1111-1111-1111-111111111111', '5th Avenue Flagship', 'New York, USA'),
    ('22222222-2222-2222-2222-222222222222', 'SoMa Tech Hub', 'San Francisco, USA'),
    ('33333333-3333-3333-3333-333333333333', 'Oxford Street Premier', 'London, UK');
END;

-- Example KPI data
IF NOT EXISTS (SELECT 1 FROM dbo.KpiSnapshots)
BEGIN
    INSERT INTO dbo.KpiSnapshots (Id, StoreId, Metric, Value, Change, Trend, Status) VALUES
    (NEWID(), '11111111-1111-1111-1111-111111111111', 'Daily Revenue', 128450, 12.4, 'up', 'good'),
    (NEWID(), '11111111-1111-1111-1111-111111111111', 'Conversion Rate', 6.4, -0.8, 'down', 'warning'),
    (NEWID(), '22222222-2222-2222-2222-222222222222', 'Daily Revenue', 86120, 9.8, 'up', 'good');
END;
