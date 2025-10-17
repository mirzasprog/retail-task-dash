namespace RetailTaskDash.Api.Configuration;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "RetailTaskDash";
    public string Audience { get; set; } = "RetailTaskDash.Client";
    public string SigningKey { get; set; } = "super-secret-development-key-change";
    public int ExpiryMinutes { get; set; } = 60;
}
