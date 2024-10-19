using Microsoft.EntityFrameworkCore;
using backend.Context;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder =>
        {
            builder.WithOrigins("http://localhost:3000", "https://salmon-bush-*.azurestaticapps.net/")  // Allow requests from React app
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

var app = builder.Build();

// Update DbContext to use MySQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))));

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

app.UseAuthorization();
app.MapControllers();
app.Run();
