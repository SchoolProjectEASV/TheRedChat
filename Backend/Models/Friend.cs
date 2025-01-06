namespace Models
{
    public class Friend
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid FriendUserId { get; set; }

        public User User { get; set; }
        public User FriendUser { get; set; }
    }
}