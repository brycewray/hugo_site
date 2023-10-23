---
title: "Static tweets: the deprecation"
description: "Why this site no longer features articles and code about embedding fully static tweets."
author: Bryce Wray
date: 2022-11-07T13:59:00-06:00
# draft: true
# initTextEditor: iA Writer
---

Things have gotten steadily stranger at Twitter in recent days, with no apparent end in sight to the strangeness. First, new owner Elon Musk  [fired about half of the company](https://www.nbcnews.com/tech/tech-news/twitters-chaotic-short-notice-layoffs-rcna55661) and then, apparently upon discovering that this meat-ax approach was going to complicate things for his plans for the platform, [asked some of the fired workers to return at least for a while](https://www.reuters.com/technology/twitter-asks-some-laid-off-workers-come-back-bloomberg-news-2022-11-06/).

<!--more-->

Perhaps it was collateral damage from all the resulting chaos or perhaps it was just coincidental, but calls to Twitter's public syndication API are no longer working as they were before. Prior to the last few days, entering the following into a terminal:

```bash{bigdiv=true}
curl "https://cdn.syndication.twimg.com/tweet?id=463440424141459456"
```

. . . would return JSON that one could use, as I've explained in several posts this year (about which, more below), to produce a fully static, tracking-free embed of a still-live [2014 tweet by the U.S. Department of the Interior](https://twitter.com/Interior/status/463440424141459456)[^tweets]. But, as of this writing, you get an **HTML** failure response, including the text "Looks like this page doesn’t exist"; and trying any other live tweet produces the same result.

[^tweets]: Depending on Twitter policies as of when you read this, you may need to be logged into an a Twitter account to use the link.

Thus, for whatever reason, it appears this API is no longer live --- at least, not reliably so that I can continue to suggest its use for the purposes about which I've written. Maybe it'll come back to full functionality, and maybe it won't. Especially given the unsettled situation at Twitter, I no longer care.

After witnessing these changes, I deprecated the most recent versions of either the full posts, or at least relevant sections thereof, in which I wrote about using this API. Each such item's URL still works, but the content is gone --- albeit moved, for the sake of the curious, to a separate, linked, `.deprecation` location on the site's online repo. For example, go to [the URL for the original post of the series](/posts/2022/02/static-tweets-eleventy-hugo/) and see what's there now.

As for why I didn't try a different API: the only other Twitter APIs left for embedding tweets don't provide full JSON for content such as included "cards" (auto-generated by privacy-violating JavaScript, with no JSON-provided content available for static embedding).

**Update, 2022-11-10**: I'll also add the following points for the sake of clarification, borrowing from what I told one of multiple readers who [wrote me](/contact/) about this post:\
\
• Twitter's v1 API was being deprecated anyway, well before a Musk purchase even was a possibility.\
\
• The JSON you get back from Twitter's preferred v2 API is far more difficult to use than either the Public Syndication API or the v1 API, especially if one is trying to pull up those "cards." (The v2 API simply won't provide the data you'd need **unless** you enable that aforementioned privacy-violating JS.)\
\
• To access data from either v1 or v2, you have to have a Twitter Developer's account. It’s uncertain, especially given the events of recent days, that a free Dev account will either (a.) still be available or (b.) keep working the same way as it has. Besides, such an account is a barrier to entry with which, I suspect, an increasing number of folks would rather not deal, especially as the Twitterverse grows ever more bizarre.
{.box}

I apologize to anyone whom these changes may inconvenience --- I'm not crazy about them myself --- but the Twitter times, they are a-changin', and I've chosen to deprecate what now (for whatever reasons) has become inaccurate and outdated content. It was fun while it lasted.