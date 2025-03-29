using RedditAffiliateEngine.Models;

namespace RedditAffiliateEngine.Services
{
    public interface IIntentClassifier
    {
        IntentType ClassifyIntent(RedditThread thread);
        string ClassifyIntentAsString(RedditThread thread);
    }
}