using Microsoft.EntityFrameworkCore;
using backend.Context;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

builder.Services.AddAuthorization();

// Add services to the container.
builder.Services.AddControllers();
// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder =>
        {
            builder.WithOrigins("http://localhost:3000","http://localhost:3002", "https://salmon-bush-*.azurestaticapps.net/")  // Allow requests from React app
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});


// Update DbContext to use MySQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))));

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}    

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}


// Enable CORS before request pipeline
app.UseCors("AllowSpecificOrigin");

app.Use(async (context, next) => {
    context.Response.OnStarting(() => {
        context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
        return Task.FromResult(0);
    });

    await next();
});

if (app.Environment.IsProduction())
{
    var productionUploadPath = Path.Combine("uploads"); 
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(productionUploadPath),
        RequestPath = "/uploads"
    });
}
else
{
    // Use the project directory in development
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(
            Path.Combine(Directory.GetCurrentDirectory(), "uploads")),
        RequestPath = "/uploads"
    });
}



app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
