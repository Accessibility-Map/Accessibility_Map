using Microsoft.AspNetCore.Mvc;
using backend.Context;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers
{

    [Route("api/users")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] UserDTO userDTO)
        {
            if (userDTO == null)
            {
                return BadRequest("Invalid user data.");
            }

            // Check if the username already exists
            if (await _context.Users.AnyAsync(u => u.Username.ToLower() == userDTO.Username.ToLower()))
            {
                return Conflict("Username already exists.");
            }
            
            User user = new User();
            user.Username = userDTO.Username;
            user.Password = userDTO.Password;
            if(userDTO.SessionID != null)
            {
                user.SessionID = userDTO.SessionID;
            }

            // Hash the password
            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

            Guid sessionID = Guid.NewGuid();
            user.SessionID = sessionID.ToString();

            // Add the user to the database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Return a response with the created user without the password
            UserDTO userDTOResponse = new UserDTO();
            userDTOResponse.UserID = user.UserID;
            userDTOResponse.Username = user.Username;
            userDTOResponse.SessionID = user.SessionID;
            return Ok(userDTOResponse);
        }

        // Endpoint to verify password
        [HttpPost("verify")]
        public async Task<IActionResult> VerifyPassword([FromBody] UserDTO user)
        {
            var storedUser = await _context.Users.Where(u => u.Username.ToLower() == user.Username.ToLower()).FirstOrDefaultAsync();

            if (storedUser == null)
            {
                return NotFound("User not found.");
            }

            if (BCrypt.Net.BCrypt.Verify(user.Password, storedUser.Password)){
                Guid sessionID = Guid.NewGuid();
                storedUser.SessionID = sessionID.ToString();
                _context.Users.Update(storedUser);
                await _context.SaveChangesAsync();
                // Return the user without password hash
                UserDTO userDTOResponse = new UserDTO();
                userDTOResponse.UserID = storedUser.UserID;
                userDTOResponse.Username = storedUser.Username;
                userDTOResponse.SessionID = storedUser.SessionID;
                return Ok(userDTOResponse);
            }

            return Unauthorized("Invalid password.");
        }

        // Endpoint to update password
        [HttpPost("update-password")]
        public async Task<IActionResult> UpdatePassword([FromBody] UserDTO user)
        {
            System.Console.WriteLine("Received user: " + user.Username);
            var storedUser = await _context.Users.Where(u => u.Username.ToLower() == user.Username.ToLower()).FirstOrDefaultAsync();
            System.Console.WriteLine("Retrieved user: " + storedUser?.Username);
            if (storedUser == null)
            {
                return NotFound("User not found.");
            }
            
            storedUser.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
            _context.Users.Update(storedUser);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("verify-session")]
        public async Task<IActionResult> VerifySession([FromBody] UserDTO user)
        {
            var storedUser = await _context.Users.Where(u => u.Username.ToLower() == user.Username.ToLower()).FirstOrDefaultAsync();
            if (storedUser == null)
            {
                return NotFound("User not found.");
            }

            if (storedUser.SessionID == user.SessionID)
            {
                return Ok();
            }
            Console.WriteLine("storedUser SessionID: " + storedUser.SessionID);
            Console.WriteLine("user SessionID: " + user.SessionID);

            return Unauthorized("Invalid session.");
        }
    }
}