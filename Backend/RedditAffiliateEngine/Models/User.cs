using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace RedditAffiliateEngine.Models
{
    public class User
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
        
        [JsonPropertyName("username")]
        [Required]
        public string Username { get; set; } = string.Empty;
        
        [JsonPropertyName("email")]
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [JsonPropertyName("password_hash")]
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [JsonPropertyName("last_login")]
        public DateTime? LastLogin { get; set; }
        
        [JsonPropertyName("is_admin")]
        public bool IsAdmin { get; set; } = false;
        
        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; } = true;
    }
    
    public class CreateUserDto
    {
        [Required]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;
        
        public bool IsAdmin { get; set; } = false;
    }
    
    public class UpdateUserDto
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
        public bool? IsAdmin { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? LastLogin { get; set; }
    }
    
    public class LoginRequest
    {
        [Required]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
    }
    
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public bool IsAdmin { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
    
    public class UserProfile
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
        public bool IsAdmin { get; set; }
        public int OpportunityCount { get; set; }
        public int CommentsPosted { get; set; }
    }
}