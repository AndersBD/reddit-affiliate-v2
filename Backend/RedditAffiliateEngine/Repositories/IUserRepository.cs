using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RedditAffiliateEngine.Models;

namespace RedditAffiliateEngine.Repositories
{
    /// <summary>
    /// Repository interface for handling user operations
    /// </summary>
    public interface IUserRepository
    {
        /// <summary>
        /// Get user by ID
        /// </summary>
        Task<User?> GetUserAsync(int id);
        
        /// <summary>
        /// Get user by username
        /// </summary>
        Task<User?> GetUserByUsernameAsync(string username);
        
        /// <summary>
        /// Create a new user
        /// </summary>
        Task<User> CreateUserAsync(CreateUserDto user);
        
        /// <summary>
        /// Update an existing user
        /// </summary>
        Task<User?> UpdateUserAsync(int id, UpdateUserDto user);
        
        /// <summary>
        /// Delete a user
        /// </summary>
        Task<bool> DeleteUserAsync(int id);
        
        /// <summary>
        /// Get all users
        /// </summary>
        Task<List<User>> GetUsersAsync();
        
        /// <summary>
        /// Validate user credentials for login
        /// </summary>
        Task<User?> ValidateCredentialsAsync(string username, string password);
        
        /// <summary>
        /// Change user password
        /// </summary>
        Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
        
        /// <summary>
        /// Get user activity statistics
        /// </summary>
        Task<UserStats> GetUserStatsAsync(int userId);
    }
    
    /// <summary>
    /// User statistics model
    /// </summary>
    public class UserStats
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int TotalOpportunities { get; set; }
        public int HighValueOpportunities { get; set; }
        public DateTime? LastLogin { get; set; }
        public int TotalLogins { get; set; }
        public List<UserActivity> RecentActivity { get; set; } = new List<UserActivity>();
    }
    
    /// <summary>
    /// User activity record
    /// </summary>
    public class UserActivity
    {
        public DateTime Timestamp { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
    }
}