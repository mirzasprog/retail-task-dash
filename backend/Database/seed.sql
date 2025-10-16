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

IF OBJECT_ID('dbo.UserAccounts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserAccounts (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        Email NVARCHAR(200) NOT NULL,
        DisplayName NVARCHAR(200) NOT NULL,
        Role NVARCHAR(100) NOT NULL,
        PasswordHash NVARCHAR(200) NOT NULL,
        PasswordSalt NVARCHAR(200) NOT NULL
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
    (NEWID(), '11111111-1111-1111-1111-111111111111', 'Avg Basket Size', 86.2, 4.1, 'up', 'good'),
    (NEWID(), '22222222-2222-2222-2222-222222222222', 'Daily Revenue', 86120, 9.8, 'up', 'good'),
    (NEWID(), '22222222-2222-2222-2222-222222222222', 'Conversion Rate', 4.9, 0.4, 'up', 'warning'),
    (NEWID(), '22222222-2222-2222-2222-222222222222', 'Avg Basket Size', 67.3, -1.1, 'down', 'warning'),
    (NEWID(), '33333333-3333-3333-3333-333333333333', 'Daily Revenue', 96020, 6.4, 'up', 'good'),
    (NEWID(), '33333333-3333-3333-3333-333333333333', 'Conversion Rate', 5.7, 1.2, 'up', 'good'),
    (NEWID(), '33333333-3333-3333-3333-333333333333', 'Avg Basket Size', 74.1, 0.8, 'up', 'good');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.TaskAssignments)
BEGIN
    INSERT INTO dbo.TaskAssignments (Id, StoreId, Title, Status, Priority, DueDate, AssignedTo) VALUES
    (NEWID(), '11111111-1111-1111-1111-111111111111', 'Front window refresh', 'in-progress', 'high', DATEADD(HOUR, 9, CAST(GETDATE() AS DATE)), 'Alex Johnson'),
    (NEWID(), '11111111-1111-1111-1111-111111111111', 'Click & collect staging', 'pending', 'medium', DATEADD(HOUR, 10, CAST(GETDATE() AS DATE)), 'Jamie Rivera'),
    (NEWID(), '11111111-1111-1111-1111-111111111111', 'Inventory cycle count', 'done', 'high', DATEADD(HOUR, 8, CAST(GETDATE() AS DATE)), 'Taylor Chen'),
    (NEWID(), '22222222-2222-2222-2222-222222222222', 'POS hardware updates', 'pending', 'high', DATEADD(HOUR, 11, CAST(GETDATE() AS DATE)), 'Morgan Lee'),
    (NEWID(), '22222222-2222-2222-2222-222222222222', 'Storefront sanitization', 'in-progress', 'medium', DATEADD(HOUR, 12, CAST(GETDATE() AS DATE)), 'Morgan Lee'),
    (NEWID(), '22222222-2222-2222-2222-222222222222', 'Online order audits', 'pending', 'medium', DATEADD(HOUR, 14, CAST(GETDATE() AS DATE)), 'Taylor Chen'),
    (NEWID(), '33333333-3333-3333-3333-333333333333', 'Weekend promo signage', 'done', 'medium', DATEADD(HOUR, 9, CAST(GETDATE() AS DATE)), 'Alex Johnson'),
    (NEWID(), '33333333-3333-3333-3333-333333333333', 'Luxury fitting rooms', 'in-progress', 'high', DATEADD(HOUR, 11, CAST(GETDATE() AS DATE)), 'Jamie Rivera'),
    (NEWID(), '33333333-3333-3333-3333-333333333333', 'Click & collect prep', 'pending', 'medium', DATEADD(HOUR, 13, CAST(GETDATE() AS DATE)), 'Taylor Chen');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.SalesSnapshots)
BEGIN
    INSERT INTO dbo.SalesSnapshots (Id, StoreId, Department, Sales, Target, Variance, Trend, Contribution) VALUES
    (NEWID(), '11111111-1111-1111-1111-111111111111', 'Apparel', 64000, 59000, 8.5, 'up', 42),
    (NEWID(), '11111111-1111-1111-1111-111111111111', 'Home & Living', 22800, 21000, 5.7, 'up', 16),
    (NEWID(), '11111111-1111-1111-1111-111111111111', 'Technology', 41650, 47200, -5.3, 'down', 27),
    (NEWID(), '22222222-2222-2222-2222-222222222222', 'Apparel', 43800, 45200, -3.1, 'down', 37),
    (NEWID(), '22222222-2222-2222-2222-222222222222', 'Home & Living', 15800, 14400, 6.2, 'up', 13),
    (NEWID(), '22222222-2222-2222-2222-222222222222', 'Technology', 26500, 23800, 3.9, 'up', 22),
    (NEWID(), '33333333-3333-3333-3333-333333333333', 'Apparel', 50800, 47200, 6.9, 'up', 39),
    (NEWID(), '33333333-3333-3333-3333-333333333333', 'Luxury', 24600, 22000, 4.3, 'up', 19),
    (NEWID(), '33333333-3333-3333-3333-333333333333', 'Accessories', 17200, 16000, 3.5, 'up', 13);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.UserAccounts)
BEGIN
    INSERT INTO dbo.UserAccounts (Id, Email, DisplayName, Role, PasswordHash, PasswordSalt) VALUES
    ('44444444-4444-4444-4444-444444444444', 'store.manager@retaildash.com', 'Alex Johnson', 'Regional Supervisor', 'DY7vuxe3RTWG0ecJBo/yFGJ0dJ2F/jBR7J4nrjR4Euk=', 'f2f7c8bd4e8a4f61');
END;
