using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Models;
using System;

namespace Infrastructure
{
    public class AppDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Friend> Friends { get; set; }
        public DbSet<Message> Messages { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Friend>(entity =>
            {
                entity.HasOne(f => f.User)
                      .WithMany(u => u.Friends)
                      .HasForeignKey(f => f.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(f => f.FriendUser)
                      .WithMany()
                      .HasForeignKey(f => f.FriendUserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<Message>(entity =>
            {
                entity.HasOne<User>()
                      .WithMany()
                      .HasForeignKey(m => m.SenderId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne<User>()
                      .WithMany()
                      .HasForeignKey(m => m.ReceiverId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
