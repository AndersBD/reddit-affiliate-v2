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
        [MinLength(3)]
        public string Username { get; set; } = string.Empty;
        
        [JsonPropertyName("email")]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [JsonIgnore] // Password should never be returned in responses
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;
        
        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }
        
        [JsonPropertyName("last_login")]
        public DateTime? LastLogin { get; set; }
        
        [JsonPropertyName("role")]
        public string Role { get; set; } = "user"; // "user" or "admin"
        
        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; } = true;
    }
    
    public class CreateUserDto
    {
        [Required]
        [MinLength(3)]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;
        
        public string Role { get; set; } = "user";
    }
    
    public class UpdateUserDto
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? Role { get; set; }
        public bool? IsActive { get; set; }
    }
    
    public class LoginDto
    {
        [Required]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
    }
    
    public class UserResponseDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
    }
}