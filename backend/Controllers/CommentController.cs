using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using backend.Context;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [Route("api/comments")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CommentController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> UploadComment([FromBody] Comment comment){
            if(comment == null || comment.UserID == 0 || comment.LocationID == 0 || comment.UserComment == null){
                return BadRequest("Invalid comment data.");
            }
            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
            return Ok(comment);
        }

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateComment([FromBody] Comment comment){
            if(comment == null || comment.UserID == 0 || comment.LocationID == 0 || comment.UserComment == null){
                return BadRequest("Invalid comment data.");
            }
            _context.Comments.Update(comment);
            await _context.SaveChangesAsync();
            return Ok(comment);
        }

        [HttpDelete]
        [Authorize]
        public async Task<IActionResult> DeleteComment([FromBody] Comment comment){
            if(comment == null || comment.UserID == 0 || comment.LocationID == 0 || comment.UserComment == null){
                return BadRequest("Invalid comment data.");
            }
            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return Ok(comment);
        }

        [HttpGet("location/{locationID}")]
        public async Task<IActionResult> GetCommentsByLocationID(int locationID){
            var comments = await _context.Comments.Where(entry => entry.LocationID == locationID).ToListAsync();
            return Ok(comments);            
        }

        [HttpGet("user/{userID}")]
        public async Task<IActionResult> GetCommentsByUserID(int userID){
            var comments = await _context.Comments.Where(entry => entry.UserID == userID).ToListAsync();
            return Ok(comments);
        }

        [HttpGet("location/{locationID}/user/{userID}/with-replies")]
        public async Task<IActionResult> GetCommentsByLocationAndUserWithReplies(int locationID, int userID){
            var comments = await _context.Comments.Where(entry => entry.LocationID == locationID).ToListAsync();
            var commentHierarchy = BuildCommentHierarchy(comments);
            commentHierarchy = commentHierarchy.Where(c => c.UserID == userID).ToList();
            return Ok(commentHierarchy);
        }

        [HttpGet("location/{locationID}/with-replies")]
        public async Task<IActionResult> GetCommentsByLocationWithReplies(int locationID)
        {
            var comments = await _context.Comments.Include(c => c.User).Where(entry => entry.LocationID == locationID).Select(c => new Comment { CommentID = c.CommentID, UserID = c.UserID, LocationID = c.LocationID, UserComment = c.UserComment, ParentCommentID = c.ParentCommentID, Username = c.User.Username }).ToListAsync();

            var commentHierarchy = BuildCommentHierarchy(comments);

            return Ok(commentHierarchy);
        }

        private List<Comment> BuildCommentHierarchy(List<Comment> comments)
        {
            var commentDictionary = comments
                .ToDictionary(c => c.CommentID);

            foreach (var comment in comments)
            {
                if (comment.ParentCommentID.HasValue)
                {
                    var parentComment = commentDictionary[comment.ParentCommentID.Value];
                    if (parentComment.Replies == null)
                    {
                        parentComment.Replies = new List<Comment>();
                    }
                    parentComment.Replies.Add(comment);
                }
            }

            return comments
                .Where(c => !c.ParentCommentID.HasValue)
                .ToList();
        }
    }
}